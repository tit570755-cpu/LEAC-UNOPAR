const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../../database/db');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', roleMiddleware('admin'), (req, res) => {
  const db = getDb();
  const users = db.prepare('SELECT id, nome, email, papel, ativo, ultimo_acesso, criado_em FROM usuarios ORDER BY nome').all();
  res.json(users);
});

router.post('/', roleMiddleware('admin'), async (req, res) => {
  const db = getDb();
  const { nome, email, senha, papel } = req.body;
  if (!nome || !email || !senha || !papel) return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
  
  const papeis = ['admin', 'biomedico', 'recepcao'];
  if (!papeis.includes(papel)) return res.status(400).json({ error: 'Papel inválido' });

  const exists = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email.toLowerCase());
  if (exists) return res.status(409).json({ error: 'Email já cadastrado' });

  const senha_hash = await bcrypt.hash(senha, 12);
  const result = db.prepare('INSERT INTO usuarios (nome, email, senha_hash, papel) VALUES (?, ?, ?, ?)').run(nome, email.toLowerCase(), senha_hash, papel);
  res.status(201).json({ id: result.lastInsertRowid, message: 'Usuário criado com sucesso' });
});

router.put('/:id', roleMiddleware('admin'), async (req, res) => {
  const db = getDb();
  const { nome, email, senha, papel, ativo } = req.body;
  let sql = 'UPDATE usuarios SET nome=?, email=?, papel=?, ativo=?';
  const params = [nome, email?.toLowerCase(), papel, ativo !== undefined ? ativo : 1];
  if (senha) { sql += ', senha_hash=?'; params.push(await bcrypt.hash(senha, 12)); }
  sql += ' WHERE id=?'; params.push(req.params.id);
  db.prepare(sql).run(...params);
  res.json({ message: 'Usuário atualizado' });
});

router.delete('/:id', roleMiddleware('admin'), (req, res) => {
  if (parseInt(req.params.id) === req.user.id) return res.status(400).json({ error: 'Não é possível desativar seu próprio usuário' });
  getDb().prepare('UPDATE usuarios SET ativo=0 WHERE id=?').run(req.params.id);
  res.json({ message: 'Usuário desativado' });
});

module.exports = router;
