const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../../database/db');
const { logger } = require('../utils/logger');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'labsystem_secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '8h';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    const db = getDb();
    const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ? AND ativo = 1').get(email.toLowerCase().trim());

    if (!usuario) {
      logger.warn(`Tentativa de login com email inválido: ${email}`);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      logger.warn(`Senha inválida para usuário: ${email}`);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Update last access
    db.prepare('UPDATE usuarios SET ultimo_acesso = CURRENT_TIMESTAMP WHERE id = ?').run(usuario.id);

    // Log
    db.prepare(`INSERT INTO logs_acesso (usuario_id, usuario_nome, acao, recurso, ip, status_code)
      VALUES (?, ?, 'LOGIN', '/api/auth/login', ?, 200)`
    ).run(usuario.id, usuario.nome, req.ip);

    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome, email: usuario.email, papel: usuario.papel },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel
      }
    });
  } catch (err) {
    logger.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const db = getDb();
      db.prepare(`INSERT INTO logs_acesso (usuario_id, usuario_nome, acao, recurso, ip, status_code)
        VALUES (?, ?, 'LOGOUT', '/api/auth/logout', ?, 200)`
      ).run(decoded.id, decoded.nome, req.ip);
    } catch {}
  }
  res.json({ message: 'Logout realizado com sucesso' });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Não autenticado' });
  
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ usuario: decoded });
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
});

module.exports = router;
