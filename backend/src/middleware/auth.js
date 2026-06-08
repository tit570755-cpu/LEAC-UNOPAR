const jwt = require('jsonwebtoken');
const { getDb } = require('../../database/db');
const { logger } = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'labsystem_secret';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    
    // Audit log
    const db = getDb();
    const logStmt = db.prepare(`
      INSERT INTO logs_acesso (usuario_id, usuario_nome, acao, recurso, ip, user_agent, status_code)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    logStmt.run(
      decoded.id,
      decoded.nome,
      req.method,
      req.path,
      req.ip || req.connection.remoteAddress,
      req.headers['user-agent'] || '',
      200
    );

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado. Faça login novamente.' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
}

function roleMiddleware(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    if (!roles.includes(req.user.papel)) {
      return res.status(403).json({
        error: 'Acesso negado',
        message: `Esta ação requer perfil: ${roles.join(' ou ')}`
      });
    }
    next();
  };
}

module.exports = { authMiddleware, roleMiddleware };
