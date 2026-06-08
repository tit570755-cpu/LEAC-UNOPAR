const express = require('express');
const { getDb } = require('../../database/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/dashboard
router.get('/', (req, res) => {
  const db = getDb();
  const hoje = new Date().toISOString().split('T')[0];

  const totais = db.prepare(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) as pendentes,
      SUM(CASE WHEN status = 'coleta' THEN 1 ELSE 0 END) as em_coleta,
      SUM(CASE WHEN status = 'analise' THEN 1 ELSE 0 END) as em_analise,
      SUM(CASE WHEN status = 'liberado' THEN 1 ELSE 0 END) as liberados,
      SUM(CASE WHEN urgente = 1 AND status NOT IN ('liberado','cancelado') THEN 1 ELSE 0 END) as urgentes
    FROM requisicoes WHERE DATE(data_solicitacao) = ?
  `).get(hoje);

  const faturamento_hoje = db.prepare(`
    SELECT COALESCE(SUM(ir.preco), 0) as total
    FROM itens_requisicao ir
    JOIN requisicoes r ON ir.requisicao_id = r.id
    WHERE DATE(r.data_solicitacao) = ?
  `).get(hoje);

  const faturamento_mes = db.prepare(`
    SELECT COALESCE(SUM(ir.preco), 0) as total
    FROM itens_requisicao ir
    JOIN requisicoes r ON ir.requisicao_id = r.id
    WHERE strftime('%Y-%m', r.data_solicitacao) = strftime('%Y-%m', 'now')
  `).get();

  const total_pacientes = db.prepare('SELECT COUNT(*) as total FROM pacientes WHERE anonimizado = 0').get();
  const novos_pacientes_mes = db.prepare(`SELECT COUNT(*) as total FROM pacientes WHERE strftime('%Y-%m', criado_em) = strftime('%Y-%m', 'now') AND anonimizado = 0`).get();

  const por_status_semana = db.prepare(`
    SELECT status, COUNT(*) as count
    FROM requisicoes 
    WHERE data_solicitacao >= date('now', '-7 days')
    GROUP BY status
  `).all();

  const exames_mais_solicitados = db.prepare(`
    SELECT e.nome, COUNT(ir.id) as total
    FROM itens_requisicao ir
    JOIN exames e ON ir.exame_id = e.id
    JOIN requisicoes r ON ir.requisicao_id = r.id
    WHERE r.data_solicitacao >= date('now', '-30 days')
    GROUP BY e.id
    ORDER BY total DESC
    LIMIT 10
  `).all();

  const ultimas_requisicoes = db.prepare(`
    SELECT r.numero, r.status, r.urgente, r.data_solicitacao, p.nome as paciente_nome
    FROM requisicoes r
    JOIN pacientes p ON r.paciente_id = p.id
    ORDER BY r.data_solicitacao DESC
    LIMIT 10
  `).all();

  const faturamento_7dias = db.prepare(`
    SELECT DATE(r.data_solicitacao) as dia, COALESCE(SUM(ir.preco), 0) as total
    FROM requisicoes r
    LEFT JOIN itens_requisicao ir ON ir.requisicao_id = r.id
    WHERE r.data_solicitacao >= date('now', '-7 days')
    GROUP BY DATE(r.data_solicitacao)
    ORDER BY dia
  `).all();

  res.json({
    hoje: {
      ...totais,
      faturamento: faturamento_hoje.total
    },
    mes: {
      faturamento: faturamento_mes.total
    },
    pacientes: {
      total: total_pacientes.total,
      novos_mes: novos_pacientes_mes.total
    },
    por_status_semana,
    exames_mais_solicitados,
    ultimas_requisicoes,
    faturamento_7dias
  });
});

module.exports = router;
