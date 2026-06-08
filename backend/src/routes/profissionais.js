const express = require('express');
const { getDb } = require('../../database/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  res.json(getDb().prepare('SELECT * FROM profissionais WHERE ativo = 1 ORDER BY nome').all());
});

router.post('/', (req, res) => {
  const { nome, crm, especialidade, telefone, email } = req.body;
  if (!nome) return res.status(400).json({ error: 'Nome é obrigatório' });
  const result = getDb().prepare('INSERT INTO profissionais (nome, crm, especialidade, telefone, email) VALUES (?, ?, ?, ?, ?)').run(nome, crm, especialidade, telefone, email);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const { nome, crm, especialidade, telefone, email, ativo } = req.body;
  getDb().prepare('UPDATE profissionais SET nome=?, crm=?, especialidade=?, telefone=?, email=?, ativo=? WHERE id=?').run(nome, crm, especialidade, telefone, email, ativo !== undefined ? ativo : 1, req.params.id);
  res.json({ message: 'Profissional atualizado' });
});

module.exports = router;
