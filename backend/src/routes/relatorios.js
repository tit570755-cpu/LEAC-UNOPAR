const express = require('express');
const { getDb } = require('../../database/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/relatorios/faturamento
router.get('/faturamento', (req, res) => {
  const db = getDb();
  const { data_inicio, data_fim } = req.query;
  const inicio = data_inicio || new Date(new Date().setDate(1)).toISOString().split('T')[0];
  const fim = data_fim || new Date().toISOString().split('T')[0];

  const total = db.prepare(`
    SELECT COALESCE(SUM(ir.preco), 0) as total, COUNT(DISTINCT r.id) as total_requisicoes
    FROM itens_requisicao ir JOIN requisicoes r ON ir.requisicao_id = r.id
    WHERE DATE(r.data_solicitacao) BETWEEN ? AND ? AND r.status != 'cancelado'
  `).get(inicio, fim);

  const por_dia = db.prepare(`
    SELECT DATE(r.data_solicitacao) as data, COALESCE(SUM(ir.preco), 0) as total, COUNT(DISTINCT r.id) as requisicoes
    FROM requisicoes r LEFT JOIN itens_requisicao ir ON ir.requisicao_id = r.id
    WHERE DATE(r.data_solicitacao) BETWEEN ? AND ? AND r.status != 'cancelado'
    GROUP BY DATE(r.data_solicitacao) ORDER BY data
  `).all(inicio, fim);

  const por_convenio = db.prepare(`
    SELECT COALESCE(c.nome, 'Particular') as convenio, COALESCE(SUM(ir.preco), 0) as total, COUNT(DISTINCT r.id) as requisicoes
    FROM requisicoes r LEFT JOIN itens_requisicao ir ON ir.requisicao_id = r.id
    LEFT JOIN convenios c ON r.convenio_id = c.id
    WHERE DATE(r.data_solicitacao) BETWEEN ? AND ? AND r.status != 'cancelado'
    GROUP BY r.convenio_id ORDER BY total DESC
  `).all(inicio, fim);

  const exames_faturados = db.prepare(`
    SELECT e.nome, COUNT(ir.id) as quantidade, COALESCE(SUM(ir.preco), 0) as total
    FROM itens_requisicao ir JOIN exames e ON ir.exame_id = e.id
    JOIN requisicoes r ON ir.requisicao_id = r.id
    WHERE DATE(r.data_solicitacao) BETWEEN ? AND ? AND r.status != 'cancelado'
    GROUP BY e.id ORDER BY total DESC LIMIT 20
  `).all(inicio, fim);

  res.json({ total, por_dia, por_convenio, exames_faturados, periodo: { inicio, fim } });
});

// GET /api/relatorios/exames
router.get('/exames', (req, res) => {
  const db = getDb();
  const { data_inicio, data_fim, status } = req.query;
  const inicio = data_inicio || new Date(new Date().setDate(1)).toISOString().split('T')[0];
  const fim = data_fim || new Date().toISOString().split('T')[0];

  let query = `
    SELECT r.numero, r.status, r.data_solicitacao, r.data_liberacao, r.urgente,
    p.nome as paciente_nome, p.cpf_mask,
    COUNT(ir.id) as total_exames,
    prof.nome as profissional_nome
    FROM requisicoes r
    JOIN pacientes p ON r.paciente_id = p.id
    LEFT JOIN itens_requisicao ir ON ir.requisicao_id = r.id
    LEFT JOIN profissionais prof ON r.profissional_id = prof.id
    WHERE DATE(r.data_solicitacao) BETWEEN ? AND ?
  `;
  const params = [inicio, fim];
  if (status) { query += ` AND r.status = ?`; params.push(status); }
  query += ` GROUP BY r.id ORDER BY r.data_solicitacao DESC`;

  const requisicoes = db.prepare(query).all(...params);
  const resumo = db.prepare(`
    SELECT status, COUNT(*) as total FROM requisicoes
    WHERE DATE(data_solicitacao) BETWEEN ? AND ?
    GROUP BY status
  `).all(inicio, fim);

  res.json({ requisicoes, resumo, periodo: { inicio, fim } });
});

// GET /api/relatorios/logs
router.get('/logs', (req, res) => {
  const db = getDb();
  const { data_inicio, data_fim, usuario_id } = req.query;
  const inicio = data_inicio || new Date(new Date().setDate(1)).toISOString().split('T')[0];
  const fim = data_fim || new Date().toISOString().split('T')[0];

  let query = `SELECT * FROM logs_acesso WHERE DATE(criado_em) BETWEEN ? AND ?`;
  const params = [inicio, fim];
  if (usuario_id) { query += ` AND usuario_id = ?`; params.push(usuario_id); }
  query += ` ORDER BY criado_em DESC LIMIT 500`;

  res.json(db.prepare(query).all(...params));
});

module.exports = router;
