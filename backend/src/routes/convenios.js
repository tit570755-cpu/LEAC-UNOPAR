const express = require('express');
const { getDb } = require('../../database/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  res.json(getDb().prepare('SELECT * FROM convenios WHERE ativo = 1 ORDER BY nome').all());
});

router.post('/', (req, res) => {
  const { nome, codigo, tipo } = req.body;
  if (!nome) return res.status(400).json({ error: 'Nome é obrigatório' });
  const result = getDb().prepare('INSERT INTO convenios (nome, codigo, tipo) VALUES (?, ?, ?)').run(nome, codigo, tipo || 'convenio');
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const { nome, codigo, tipo, ativo } = req.body;
  getDb().prepare('UPDATE convenios SET nome=?, codigo=?, tipo=?, ativo=? WHERE id=?').run(nome, codigo, tipo, ativo !== undefined ? ativo : 1, req.params.id);
  res.json({ message: 'Convênio atualizado' });
});

module.exports = router;
