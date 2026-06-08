const express = require('express');
const { getDb } = require('../../database/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET /api/exames
router.get('/', (req, res) => {
  const db = getDb();
  const { search, categoria } = req.query;
  let query = `
    SELECT e.*, c.nome as categoria_nome, c.cor as categoria_cor,
    COUNT(vr.id) as total_referencias
    FROM exames e
    LEFT JOIN categorias_exames c ON e.categoria_id = c.id
    LEFT JOIN valores_referencia vr ON vr.exame_id = e.id
    WHERE e.ativo = 1
  `;
  const params = [];
  if (search) { query += ` AND (e.nome LIKE ? OR e.codigo LIKE ? OR e.sinonimos LIKE ?)`; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  if (categoria) { query += ` AND e.categoria_id = ?`; params.push(categoria); }
  query += ` GROUP BY e.id ORDER BY e.nome ASC`;
  res.json(db.prepare(query).all(...params));
});

// GET /api/exames/categorias
router.get('/categorias', (req, res) => {
  const db = getDb();
  res.json(db.prepare('SELECT * FROM categorias_exames ORDER BY nome').all());
});

// GET /api/exames/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const exame = db.prepare('SELECT e.*, c.nome as categoria_nome FROM exames e LEFT JOIN categorias_exames c ON e.categoria_id = c.id WHERE e.id = ?').get(req.params.id);
  if (!exame) return res.status(404).json({ error: 'Exame não encontrado' });
  const referencias = db.prepare('SELECT * FROM valores_referencia WHERE exame_id = ? ORDER BY sexo, idade_min').all(req.params.id);
  res.json({ ...exame, valores_referencia: referencias });
});

// POST /api/exames
router.post('/', (req, res) => {
  const db = getDb();
  const { codigo, nome, sinonimos, categoria_id, metodo, unidade, material_biologico, tipo_tubo, volume_ml, tempo_jejum, prazo_resultado_horas, instrucoes_coleta, preco, valores_referencia } = req.body;
  if (!codigo || !nome) return res.status(400).json({ error: 'Código e nome são obrigatórios' });
  
  const stmt = db.prepare(`INSERT INTO exames (codigo, nome, sinonimos, categoria_id, metodo, unidade, material_biologico, tipo_tubo, volume_ml, tempo_jejum, prazo_resultado_horas, instrucoes_coleta, preco) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const result = stmt.run(codigo, nome, sinonimos, categoria_id, metodo, unidade, material_biologico, tipo_tubo, volume_ml || 0, tempo_jejum || 0, prazo_resultado_horas || 24, instrucoes_coleta, preco || 0);
  
  if (valores_referencia && Array.isArray(valores_referencia)) {
    const vrStmt = db.prepare(`INSERT INTO valores_referencia (exame_id, sexo, idade_min, idade_max, valor_min, valor_max, valor_texto, unidade, descricao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const vr of valores_referencia) {
      vrStmt.run(result.lastInsertRowid, vr.sexo || 'ambos', vr.idade_min || 0, vr.idade_max || 999, vr.valor_min, vr.valor_max, vr.valor_texto, vr.unidade, vr.descricao);
    }
  }
  res.status(201).json({ id: result.lastInsertRowid, message: 'Exame cadastrado com sucesso' });
});

// PUT /api/exames/:id
router.put('/:id', (req, res) => {
  const db = getDb();
  const { nome, sinonimos, categoria_id, metodo, unidade, material_biologico, tipo_tubo, volume_ml, tempo_jejum, prazo_resultado_horas, instrucoes_coleta, preco, valores_referencia } = req.body;
  db.prepare(`UPDATE exames SET nome=?, sinonimos=?, categoria_id=?, metodo=?, unidade=?, material_biologico=?, tipo_tubo=?, volume_ml=?, tempo_jejum=?, prazo_resultado_horas=?, instrucoes_coleta=?, preco=? WHERE id=?`)
    .run(nome, sinonimos, categoria_id, metodo, unidade, material_biologico, tipo_tubo, volume_ml, tempo_jejum, prazo_resultado_horas, instrucoes_coleta, preco, req.params.id);
  
  if (valores_referencia) {
    db.prepare('DELETE FROM valores_referencia WHERE exame_id = ?').run(req.params.id);
    const vrStmt = db.prepare(`INSERT INTO valores_referencia (exame_id, sexo, idade_min, idade_max, valor_min, valor_max, valor_texto, unidade, descricao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    for (const vr of valores_referencia) {
      vrStmt.run(req.params.id, vr.sexo || 'ambos', vr.idade_min || 0, vr.idade_max || 999, vr.valor_min, vr.valor_max, vr.valor_texto, vr.unidade, vr.descricao);
    }
  }
  res.json({ message: 'Exame atualizado com sucesso' });
});

module.exports = router;
