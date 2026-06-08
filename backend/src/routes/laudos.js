const express = require('express');
const { getDb } = require('../../database/db');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const router = express.Router();
router.use(authMiddleware);

function calcularIdade(dataNasc) {
  if (!dataNasc) return null;
  const hoje = new Date();
  const nasc = new Date(dataNasc);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

// GET /api/laudos
router.get('/', (req, res) => {
  const db = getDb();
  const laudos = db.prepare(`
    SELECT l.*, r.numero as req_numero, r.data_coleta, r.data_liberacao, r.status as req_status,
    p.nome as paciente_nome, u.nome as assinado_por_nome
    FROM laudos l
    JOIN requisicoes r ON l.requisicao_id = r.id
    JOIN pacientes p ON r.paciente_id = p.id
    LEFT JOIN usuarios u ON l.assinado_por = u.id
    ORDER BY l.criado_em DESC
    LIMIT 50
  `).all();
  res.json(laudos);
});

// POST /api/laudos/gerar/:requisicaoId
router.post('/gerar/:requisicaoId', roleMiddleware('admin', 'biomedico'), async (req, res) => {
  const db = getDb();
  const reqId = req.params.requisicaoId;

  const reqData = db.prepare(`
    SELECT r.*, p.nome as paciente_nome, p.cpf_mask, p.data_nascimento, p.sexo, p.telefone,
    prof.nome as profissional_nome, prof.crm, c.nome as convenio_nome
    FROM requisicoes r
    JOIN pacientes p ON r.paciente_id = p.id
    LEFT JOIN profissionais prof ON r.profissional_id = prof.id
    LEFT JOIN convenios c ON r.convenio_id = c.id
    WHERE r.id = ?
  `).get(reqId);

  if (!reqData) return res.status(404).json({ error: 'Requisição não encontrada' });

  const idade = calcularIdade(reqData.data_nascimento);
  const itens = db.prepare(`
    SELECT ir.*, e.nome as exame_nome, e.codigo, e.metodo, e.unidade as exame_unidade
    FROM itens_requisicao ir
    JOIN exames e ON ir.exame_id = e.id
    WHERE ir.requisicao_id = ?
    ORDER BY e.nome
  `).all(reqId);

  const itensComRef = itens.map(item => {
    const ref = db.prepare(`
      SELECT * FROM valores_referencia 
      WHERE exame_id = ? AND (sexo = ? OR sexo = 'ambos')
      AND ? BETWEEN idade_min AND idade_max
      ORDER BY sexo DESC LIMIT 1
    `).get(item.exame_id, reqData.sexo || 'ambos', idade || 30);
    return { ...item, referencia: ref };
  });

  // Check if laudo already exists
  const existingLaudo = db.prepare('SELECT * FROM laudos WHERE requisicao_id = ?').get(reqId);
  
  // Generate number
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
  const count = db.prepare('SELECT COUNT(*) as c FROM laudos').get().c;
  const numero_laudo = existingLaudo?.numero_laudo || `LDO-${dateStr}-${String(count + 1).padStart(5, '0')}`;

  // Generate PDF
  const pdfDir = path.join(__dirname, '../../../uploads/laudos');
  if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
  const pdfPath = path.join(pdfDir, `${numero_laudo}.pdf`);

  await gerarPDF({ reqData, itensComRef, numero_laudo, idade, req_user: req.user }, pdfPath);

  const rtNome = req.body.rt_nome || process.env.RT_NOME || 'Dr. Responsável Técnico';
  const rtCrbm = req.body.rt_crbm || process.env.RT_CRBM || 'CRBM-XX 00000';

  if (existingLaudo) {
    db.prepare(`UPDATE laudos SET status='assinado', pdf_path=?, assinado_por=?, data_assinatura=CURRENT_TIMESTAMP, rt_nome=?, rt_crbm=? WHERE id=?`)
      .run(`/uploads/laudos/${numero_laudo}.pdf`, req.user.id, rtNome, rtCrbm, existingLaudo.id);
  } else {
    db.prepare(`INSERT INTO laudos (requisicao_id, numero_laudo, status, pdf_path, assinado_por, data_assinatura, rt_nome, rt_crbm) VALUES (?, ?, 'assinado', ?, ?, CURRENT_TIMESTAMP, ?, ?)`)
      .run(reqId, numero_laudo, `/uploads/laudos/${numero_laudo}.pdf`, req.user.id, rtNome, rtCrbm);
  }

  db.prepare(`UPDATE requisicoes SET status='liberado', data_liberacao=CURRENT_TIMESTAMP, liberado_por=? WHERE id=?`)
    .run(req.user.id, reqId);

  res.json({ message: 'Laudo gerado com sucesso', numero_laudo, pdf_url: `/uploads/laudos/${numero_laudo}.pdf` });
});

async function gerarPDF({ reqData, itensComRef, numero_laudo, idade, req_user }, pdfPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = fs.createWriteStream(pdfPath);
    doc.pipe(stream);

    const BLUE = '#1E40AF';
    const DARK = '#1F2937';
    const GRAY = '#6B7280';
    const LIGHT_BLUE = '#EFF6FF';
    const GREEN = '#059669';
    const RED = '#DC2626';
    const ORANGE = '#D97706';
    const WHITE = '#FFFFFF';

    const LAB_NAME = process.env.LAB_NAME || 'LabSystem';
    const LAB_CNPJ = process.env.LAB_CNPJ || '00.000.000/0001-00';
    const LAB_ENDERECO = process.env.LAB_ENDERECO || 'Endereço do laboratório';
    const LAB_CIDADE = process.env.LAB_CIDADE || 'São Paulo - SP';
    const LAB_TEL = process.env.LAB_TELEFONE || '(11) 0000-0000';
    const LAB_EMAIL = process.env.LAB_EMAIL || 'lab@lab.com';
    const RT_NOME = req_user.rt_nome || process.env.RT_NOME || 'Responsável Técnico';
    const RT_CRBM = req_user.rt_crbm || process.env.RT_CRBM || 'CRBM 00000';

    // ─── HEADER ────────────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 110).fill(BLUE);
    doc.fillColor(WHITE).fontSize(22).font('Helvetica-Bold').text('🔬 ' + LAB_NAME, 50, 25);
    doc.fontSize(9).font('Helvetica').fillColor('#BFDBFE')
      .text(`CNPJ: ${LAB_CNPJ}  |  CNES: ${process.env.LAB_CNES || '0000000'}`, 50, 55)
      .text(`${LAB_ENDERECO} — ${LAB_CIDADE}`, 50, 68)
      .text(`Tel: ${LAB_TEL}  |  ${LAB_EMAIL}`, 50, 81);

    // Laudo number (top right)
    doc.fontSize(10).font('Helvetica-Bold').fillColor(WHITE).text(`LAUDO Nº ${numero_laudo}`, 350, 25, { width: 195, align: 'right' });
    doc.fontSize(8).font('Helvetica').fillColor('#BFDBFE').text(`Emitido em: ${new Date().toLocaleString('pt-BR')}`, 350, 42, { width: 195, align: 'right' });

    // ─── DIVISOR ───────────────────────────────────────────────────────────────
    doc.rect(50, 120, doc.page.width - 100, 1).fill('#E5E7EB');

    // ─── DADOS DO PACIENTE ─────────────────────────────────────────────────────
    doc.rect(50, 130, doc.page.width - 100, 100).fill(LIGHT_BLUE).stroke('#DBEAFE');
    doc.fillColor(BLUE).fontSize(11).font('Helvetica-Bold').text('DADOS DO PACIENTE', 60, 140);
    
    const dataNasc = reqData.data_nascimento ? new Date(reqData.data_nascimento).toLocaleDateString('pt-BR') : 'N/I';
    const sexoLabel = { M: 'Masculino', F: 'Feminino', O: 'Outro' }[reqData.sexo] || 'N/I';

    doc.fillColor(DARK).fontSize(9).font('Helvetica-Bold').text('Nome:', 60, 158).font('Helvetica').text(reqData.paciente_nome || 'N/I', 105, 158);
    doc.font('Helvetica-Bold').text('CPF:', 300, 158).font('Helvetica').text(reqData.cpf_mask || 'N/I', 320, 158);
    doc.font('Helvetica-Bold').text('Nasc.:', 60, 173).font('Helvetica').text(dataNasc, 90, 173);
    doc.font('Helvetica-Bold').text('Idade:', 170, 173).font('Helvetica').text(idade ? `${idade} anos` : 'N/I', 200, 173);
    doc.font('Helvetica-Bold').text('Sexo:', 280, 173).font('Helvetica').text(sexoLabel, 308, 173);
    doc.font('Helvetica-Bold').text('Médico Sol.:', 60, 188).font('Helvetica').text(reqData.profissional_nome || 'N/I', 120, 188);
    doc.font('Helvetica-Bold').text('CRM:', 300, 188).font('Helvetica').text(reqData.crm || 'N/I', 320, 188);
    doc.font('Helvetica-Bold').text('Convênio:', 60, 203).font('Helvetica').text(reqData.convenio_nome || 'Particular', 115, 203);
    doc.font('Helvetica-Bold').text('Req.:', 280, 203).font('Helvetica').text(reqData.numero || 'N/I', 300, 203);

    // ─── DATAS ─────────────────────────────────────────────────────────────────
    doc.rect(50, 240, doc.page.width - 100, 22).fill('#F9FAFB');
    const dataColeta = reqData.data_coleta ? new Date(reqData.data_coleta).toLocaleString('pt-BR') : 'N/I';
    const dataLib = reqData.data_liberacao ? new Date(reqData.data_liberacao).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR');
    doc.fillColor(GRAY).fontSize(8).font('Helvetica')
      .text(`Data da Coleta: ${dataColeta}`, 60, 248)
      .text(`Data de Liberação: ${dataLib}`, 280, 248);

    // ─── RESULTADOS ────────────────────────────────────────────────────────────
    let y = 275;
    doc.fillColor(BLUE).fontSize(12).font('Helvetica-Bold').text('RESULTADOS DOS EXAMES', 50, y);
    y += 18;

    // Table header
    doc.rect(50, y, doc.page.width - 100, 20).fill(BLUE);
    doc.fillColor(WHITE).fontSize(8).font('Helvetica-Bold')
      .text('EXAME', 58, y + 6)
      .text('RESULTADO', 250, y + 6)
      .text('UNIDADE', 340, y + 6)
      .text('REFERÊNCIA', 400, y + 6)
      .text('STATUS', 495, y + 6);
    y += 20;

    let rowIndex = 0;
    for (const item of itensComRef) {
      if (y > doc.page.height - 120) {
        doc.addPage();
        y = 50;
      }

      const rowBg = rowIndex % 2 === 0 ? WHITE : '#F8FAFC';
      doc.rect(50, y, doc.page.width - 100, 22).fill(rowBg);

      // Status color
      let statusColor = GREEN;
      let statusLabel = '✓ Normal';
      if (item.interpretacao === 'alto') { statusColor = RED; statusLabel = '↑ Alto'; }
      else if (item.interpretacao === 'baixo') { statusColor = ORANGE; statusLabel = '↓ Baixo'; }
      else if (item.interpretacao === 'critico') { statusColor = RED; statusLabel = '⚠ Crítico'; }

      doc.fillColor(DARK).fontSize(8).font('Helvetica-Bold').text(item.exame_nome, 58, y + 7, { width: 185 });
      
      // Resultado em destaque
      const resultadoText = item.resultado || 'Pendente';
      doc.font('Helvetica-Bold').fontSize(9).fillColor(statusColor).text(resultadoText, 250, y + 6);
      
      const unidade = item.unidade || item.exame_unidade || '';
      doc.fillColor(GRAY).fontSize(7).font('Helvetica').text(unidade, 340, y + 7);

      if (item.referencia) {
        let refText = '';
        if (item.referencia.valor_texto) refText = item.referencia.valor_texto;
        else if (item.referencia.valor_min != null && item.referencia.valor_max != null)
          refText = `${item.referencia.valor_min} - ${item.referencia.valor_max}`;
        doc.fillColor(GRAY).text(refText, 400, y + 7, { width: 88 });
      }

      // Status badge
      if (item.interpretacao) {
        doc.fillColor(statusColor).fontSize(7.5).font('Helvetica-Bold').text(statusLabel, 495, y + 7);
      }

      // Bottom border
      doc.rect(50, y + 22, doc.page.width - 100, 0.5).fill('#E5E7EB');
      y += 23;
      rowIndex++;
    }

    // ─── OBSERVAÇÕES ───────────────────────────────────────────────────────────
    if (reqData.observacoes) {
      y += 10;
      doc.fillColor(DARK).fontSize(9).font('Helvetica-Bold').text('Observações:', 50, y);
      y += 14;
      doc.fontSize(8).font('Helvetica').fillColor(GRAY).text(reqData.observacoes, 50, y, { width: doc.page.width - 100 });
      y += 30;
    }

    // ─── ASSINATURA ────────────────────────────────────────────────────────────
    const footerY = doc.page.height - 130;
    doc.rect(50, footerY, doc.page.width - 100, 1).fill('#E5E7EB');
    
    doc.rect(doc.page.width / 2 - 100, footerY + 15, 200, 1).fill(DARK);
    doc.fillColor(DARK).fontSize(9).font('Helvetica-Bold').text(RT_NOME, 0, footerY + 20, { align: 'center' });
    doc.fontSize(8).font('Helvetica').fillColor(GRAY).text(`Responsável Técnico | ${RT_CRBM}`, 0, footerY + 34, { align: 'center' });
    doc.fontSize(7).text('Biomédico CRM/CRBM', 0, footerY + 47, { align: 'center' });

    // ─── FOOTER ────────────────────────────────────────────────────────────────
    doc.rect(0, doc.page.height - 50, doc.page.width, 50).fill(BLUE);
    doc.fillColor(WHITE).fontSize(7).font('Helvetica')
      .text(`${LAB_NAME} | ${LAB_ENDERECO} | ${LAB_TEL}`, 0, doc.page.height - 38, { align: 'center' })
      .text(`Este laudo é válido somente com assinatura do responsável técnico | Laudo Nº ${numero_laudo}`, 0, doc.page.height - 26, { align: 'center' });

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

// GET /api/laudos/:id/pdf
router.get('/:id/pdf', (req, res) => {
  const db = getDb();
  const laudo = db.prepare('SELECT * FROM laudos WHERE id = ?').get(req.params.id);
  if (!laudo || !laudo.pdf_path) return res.status(404).json({ error: 'PDF não encontrado' });
  
  const fullPath = path.join(__dirname, '../../..', laudo.pdf_path);
  if (!fs.existsSync(fullPath)) return res.status(404).json({ error: 'Arquivo PDF não encontrado' });
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${laudo.numero_laudo}.pdf"`);
  fs.createReadStream(fullPath).pipe(res);
});

module.exports = router;
