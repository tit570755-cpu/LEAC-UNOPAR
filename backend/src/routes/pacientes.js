const express = require('express');
const { getDb } = require('../../database/db');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { encrypt, maskCPF, anonymizeData } = require('../utils/crypto');

const router = express.Router();
router.use(authMiddleware);

// GET /api/pacientes
router.get('/', (req, res) => {
  const db = getDb();
  const { search, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT p.*, c.nome as convenio_nome 
    FROM pacientes p
    LEFT JOIN convenios c ON p.convenio_id = c.id
    WHERE p.anonimizado = 0
  `;
  const params = [];

  if (search) {
    query += ` AND (p.nome LIKE ? OR p.cpf_mask LIKE ? OR p.telefone LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const total = db.prepare(query.replace('SELECT p.*, c.nome as convenio_nome', 'SELECT COUNT(*)')).get(...params);
  query += ` ORDER BY p.nome ASC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));

  const pacientes = db.prepare(query).all(...params);
  res.json({ data: pacientes, total: total['COUNT(*)'], page: parseInt(page), limit: parseInt(limit) });
});

// GET /api/pacientes/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const paciente = db.prepare(`
    SELECT p.*, c.nome as convenio_nome 
    FROM pacientes p
    LEFT JOIN convenios c ON p.convenio_id = c.id
    WHERE p.id = ?
  `).get(req.params.id);

  if (!paciente) return res.status(404).json({ error: 'Paciente não encontrado' });
  res.json(paciente);
});

// POST /api/pacientes
router.post('/', (req, res) => {
  const db = getDb();
  const {
    nome, cpf, data_nascimento, sexo, telefone, email,
    logradouro, numero, complemento, bairro, cidade, uf, cep,
    convenio_id, num_carteirinha, observacoes, consentimento_lgpd
  } = req.body;

  if (!nome) return res.status(400).json({ error: 'Nome é obrigatório' });

  const cpfClean = cpf ? cpf.replace(/\D/g, '') : null;
  const cpf_enc = cpfClean ? encrypt(cpfClean) : null;
  const cpf_mask = cpfClean ? maskCPF(cpfClean) : null;

  // Check duplicate CPF
  if (cpfClean) {
    const all = db.prepare('SELECT id, cpf_enc FROM pacientes WHERE cpf_enc IS NOT NULL AND anonimizado = 0').all();
    const { decrypt } = require('../utils/crypto');
    const exists = all.find(p => decrypt(p.cpf_enc) === cpfClean);
    if (exists) return res.status(409).json({ error: 'CPF já cadastrado', paciente_id: exists.id });
  }

  const stmt = db.prepare(`
    INSERT INTO pacientes (nome, cpf_enc, cpf_mask, data_nascimento, sexo, telefone, email,
      logradouro, numero, complemento, bairro, cidade, uf, cep, convenio_id, num_carteirinha,
      observacoes, consentimento_lgpd, data_consentimento, criado_por)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    nome, cpf_enc, cpf_mask, data_nascimento, sexo, telefone, email,
    logradouro, numero, complemento, bairro, cidade, uf, cep,
    convenio_id || null, num_carteirinha, observacoes,
    consentimento_lgpd ? 1 : 0,
    consentimento_lgpd ? new Date().toISOString() : null,
    req.user.id
  );

  if (consentimento_lgpd) {
    db.prepare(`INSERT INTO consentimentos (paciente_id, tipo, aceito, ip) VALUES (?, 'coleta_dados', 1, ?)`)
      .run(result.lastInsertRowid, req.ip);
  }

  res.status(201).json({ id: result.lastInsertRowid, message: 'Paciente cadastrado com sucesso' });
});

// PUT /api/pacientes/:id
router.put('/:id', (req, res) => {
  const db = getDb();
  const {
    nome, data_nascimento, sexo, telefone, email,
    logradouro, numero, complemento, bairro, cidade, uf, cep,
    convenio_id, num_carteirinha, observacoes, consentimento_lgpd
  } = req.body;

  const paciente = db.prepare('SELECT * FROM pacientes WHERE id = ?').get(req.params.id);
  if (!paciente) return res.status(404).json({ error: 'Paciente não encontrado' });

  db.prepare(`
    UPDATE pacientes SET nome=?, data_nascimento=?, sexo=?, telefone=?, email=?,
    logradouro=?, numero=?, complemento=?, bairro=?, cidade=?, uf=?, cep=?,
    convenio_id=?, num_carteirinha=?, observacoes=?, atualizado_em=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(nome, data_nascimento, sexo, telefone, email,
    logradouro, numero, complemento, bairro, cidade, uf, cep,
    convenio_id || null, num_carteirinha, observacoes, req.params.id);

  res.json({ message: 'Paciente atualizado com sucesso' });
});

// POST /api/pacientes/:id/anonimizar (LGPD)
router.post('/:id/anonimizar', roleMiddleware('admin'), (req, res) => {
  const db = getDb();
  const paciente = db.prepare('SELECT * FROM pacientes WHERE id = ?').get(req.params.id);
  if (!paciente) return res.status(404).json({ error: 'Paciente não encontrado' });

  db.prepare(`
    UPDATE pacientes SET nome='ANONIMIZADO', cpf_enc=NULL, cpf_mask='***.***.***-**',
    telefone=NULL, email=NULL, logradouro=NULL, numero=NULL, complemento=NULL,
    bairro=NULL, cep=NULL, observacoes=NULL, anonimizado=1, data_anonimizacao=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(req.params.id);

  db.prepare(`INSERT INTO logs_acesso (usuario_id, usuario_nome, acao, recurso, recurso_id, detalhes, ip, status_code)
    VALUES (?, ?, 'ANONIMIZACAO', 'pacientes', ?, 'Dados do paciente anonimizados conforme LGPD', ?, 200)`)
    .run(req.user.id, req.user.nome, req.params.id, req.ip);

  res.json({ message: 'Dados do paciente anonimizados com sucesso (LGPD)' });
});

// GET /api/pacientes/:id/historico
router.get('/:id/historico', (req, res) => {
  const db = getDb();
  const historico = db.prepare(`
    SELECT r.*, r.numero, r.status, r.data_solicitacao,
    COUNT(ir.id) as total_exames,
    p2.nome as profissional_nome
    FROM requisicoes r
    LEFT JOIN itens_requisicao ir ON ir.requisicao_id = r.id
    LEFT JOIN profissionais p2 ON r.profissional_id = p2.id
    WHERE r.paciente_id = ?
    GROUP BY r.id
    ORDER BY r.data_solicitacao DESC
    LIMIT 50
  `).all(req.params.id);
  res.json(historico);
});

module.exports = router;
