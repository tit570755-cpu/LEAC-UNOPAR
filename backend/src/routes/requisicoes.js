const express = require('express');
const { getDb } = require('../../database/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/requisicoes
router.get('/', (req, res) => {
  const db = getDb();
  const { status, paciente_id, data_inicio, data_fim, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT r.*, p.nome as paciente_nome, p.cpf_mask, p.data_nascimento, p.sexo,
    prof.nome as profissional_nome, c.nome as convenio_nome,
    COUNT(ir.id) as total_exames,
    SUM(CASE WHEN ir.status = 'concluido' THEN 1 ELSE 0 END) as exames_concluidos
    FROM requisicoes r
    JOIN pacientes p ON r.paciente_id = p.id
    LEFT JOIN profissionais prof ON r.profissional_id = prof.id
    LEFT JOIN convenios c ON r.convenio_id = c.id
    LEFT JOIN itens_requisicao ir ON ir.requisicao_id = r.id
    WHERE 1=1
  `;
  const params = [];

  if (status) { query += ` AND r.status = ?`; params.push(status); }
  if (paciente_id) { query += ` AND r.paciente_id = ?`; params.push(paciente_id); }
  if (data_inicio) { query += ` AND DATE(r.data_solicitacao) >= ?`; params.push(data_inicio); }
  if (data_fim) { query += ` AND DATE(r.data_solicitacao) <= ?`; params.push(data_fim); }

  query += ` GROUP BY r.id ORDER BY r.data_solicitacao DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));

  const requisicoes = db.prepare(query).all(...params);
  res.json(requisicoes);
});

// GET /api/requisicoes/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const req_data = db.prepare(`
    SELECT r.*, p.nome as paciente_nome, p.cpf_mask, p.data_nascimento, p.sexo, p.telefone,
    prof.nome as profissional_nome, prof.crm, c.nome as convenio_nome
    FROM requisicoes r
    JOIN pacientes p ON r.paciente_id = p.id
    LEFT JOIN profissionais prof ON r.profissional_id = prof.id
    LEFT JOIN convenios c ON r.convenio_id = c.id
    WHERE r.id = ?
  `).get(req.params.id);

  if (!req_data) return res.status(404).json({ error: 'Requisição não encontrada' });

  const itens = db.prepare(`
    SELECT ir.*, e.nome as exame_nome, e.codigo, e.unidade as exame_unidade, e.metodo,
    e.material_biologico, e.tipo_tubo, u.nome as analista_nome
    FROM itens_requisicao ir
    JOIN exames e ON ir.exame_id = e.id
    LEFT JOIN usuarios u ON ir.analisado_por = u.id
    WHERE ir.requisicao_id = ?
    ORDER BY e.nome
  `).all(req.params.id);

  // Get reference values for each item
  const paciente = db.prepare('SELECT data_nascimento, sexo FROM pacientes WHERE id = ?').get(req_data.paciente_id);
  const age = paciente ? Math.floor((new Date() - new Date(paciente.data_nascimento)) / (365.25 * 24 * 3600 * 1000)) : 0;

  const itensComRef = itens.map(item => {
    const refs = db.prepare(`
      SELECT * FROM valores_referencia 
      WHERE exame_id = ? 
      AND (sexo = ? OR sexo = 'ambos')
      AND ? BETWEEN idade_min AND idade_max
      ORDER BY sexo DESC
      LIMIT 1
    `).get(item.exame_id, paciente?.sexo || 'ambos', age);
    return { ...item, referencia: refs };
  });

  res.json({ ...req_data, itens: itensComRef });
});

// POST /api/requisicoes
router.post('/', (req, res) => {
  const db = getDb();
  const { paciente_id, profissional_id, convenio_id, num_guia, urgente, observacoes, exames } = req.body;

  if (!paciente_id || !exames || exames.length === 0) {
    return res.status(400).json({ error: 'Paciente e ao menos um exame são obrigatórios' });
  }

  const paciente = db.prepare('SELECT id FROM pacientes WHERE id = ? AND anonimizado = 0').get(paciente_id);
  if (!paciente) return res.status(404).json({ error: 'Paciente não encontrado' });

  // Generate requisition number
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
  const count = db.prepare(`SELECT COUNT(*) as c FROM requisicoes WHERE DATE(data_solicitacao) = DATE('now')`).get().c;
  const numero = `REQ-${dateStr}-${String(count + 1).padStart(4, '0')}`;

  const result = db.prepare(`
    INSERT INTO requisicoes (numero, paciente_id, profissional_id, convenio_id, num_guia, urgente, observacoes, criado_por)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(numero, paciente_id, profissional_id || null, convenio_id || null, num_guia, urgente ? 1 : 0, observacoes, req.user.id);

  const req_id = result.lastInsertRowid;
  const itemStmt = db.prepare(`INSERT INTO itens_requisicao (requisicao_id, exame_id, preco) VALUES (?, ?, ?)`);
  
  for (const exame of exames) {
    const exameData = db.prepare('SELECT preco FROM exames WHERE id = ?').get(exame.id || exame);
    itemStmt.run(req_id, exame.id || exame, exameData?.preco || 0);
  }

  res.status(201).json({ id: req_id, numero, message: 'Requisição criada com sucesso' });
});

// PUT /api/requisicoes/:id/status
router.put('/:id/status', (req, res) => {
  const db = getDb();
  const { status } = req.body;
  const validos = ['pendente', 'coleta', 'triagem', 'analise', 'liberado', 'cancelado'];
  if (!validos.includes(status)) return res.status(400).json({ error: 'Status inválido' });

  const updates = { atualizado_em: new Date().toISOString() };
  if (status === 'coleta') updates.data_coleta = new Date().toISOString();
  if (status === 'liberado') { updates.data_liberacao = new Date().toISOString(); updates.liberado_por = req.user.id; }

  let sql = `UPDATE requisicoes SET status = ?, atualizado_em = CURRENT_TIMESTAMP`;
  const params = [status];
  if (status === 'coleta') { sql += `, data_coleta = CURRENT_TIMESTAMP`; }
  if (status === 'liberado') { sql += `, data_liberacao = CURRENT_TIMESTAMP, liberado_por = ?`; params.push(req.user.id); }
  sql += ` WHERE id = ?`;
  params.push(req.params.id);

  db.prepare(sql).run(...params);
  res.json({ message: `Status atualizado para: ${status}` });
});

// PUT /api/requisicoes/:id/resultados
router.put('/:id/resultados', (req, res) => {
  const db = getDb();
  const { resultados } = req.body;

  if (!Array.isArray(resultados)) return res.status(400).json({ error: 'Resultados deve ser um array' });

  const stmt = db.prepare(`
    UPDATE itens_requisicao SET resultado=?, resultado_numerico=?, unidade=?, interpretacao=?, observacoes=?, analisado_por=?, data_resultado=CURRENT_TIMESTAMP, status='concluido'
    WHERE id=? AND requisicao_id=?
  `);

  for (const r of resultados) {
    const numVal = parseFloat(r.resultado_numerico || r.resultado) || null;
    stmt.run(r.resultado, numVal, r.unidade, r.interpretacao || null, r.observacoes, req.user.id, r.item_id, req.params.id);
  }

  // Check if all completed
  const pendentes = db.prepare(`SELECT COUNT(*) as c FROM itens_requisicao WHERE requisicao_id = ? AND status != 'concluido'`).get(req.params.id);
  if (pendentes.c === 0) {
    db.prepare(`UPDATE requisicoes SET status='analise', atualizado_em=CURRENT_TIMESTAMP WHERE id=? AND status='coleta'`).run(req.params.id);
  }

  res.json({ message: 'Resultados salvos com sucesso' });
});

module.exports = router;
