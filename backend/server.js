require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { logger } = require('./src/utils/logger');

const authRoutes = require('./src/routes/auth');
const pacientesRoutes = require('./src/routes/pacientes');
const profissionaisRoutes = require('./src/routes/profissionais');
const examesRoutes = require('./src/routes/exames');
const requisicoesRoutes = require('./src/routes/requisicoes');
const laudosRoutes = require('./src/routes/laudos');
const relatoriosRoutes = require('./src/routes/relatorios');
const usuariosRoutes = require('./src/routes/usuarios');
const dashboardRoutes = require('./src/routes/dashboard');
const conveniosRoutes = require('./src/routes/convenios');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow inline scripts for frontend
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: { error: 'Muitas requisições. Tente novamente em 15 minutos.' }
});
app.use('/api/', limiter);

// Auth rate limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' }
});
app.use('/api/auth/', authLimiter);

// CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'null'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/profissionais', profissionaisRoutes);
app.use('/api/exames', examesRoutes);
app.use('/api/requisicoes', requisicoesRoutes);
app.use('/api/laudos', laudosRoutes);
app.use('/api/relatorios', relatoriosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/convenios', conveniosRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    sistema: process.env.LAB_NAME,
    timestamp: new Date().toISOString(),
    versao: '1.0.0'
  });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Erro não tratado:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Contate o administrador'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`🔬 ${process.env.LAB_NAME}`);
  logger.info(`🚀 Servidor rodando em http://localhost:${PORT}`);
  logger.info(`📊 Ambiente: ${process.env.NODE_ENV}`);
});

module.exports = app;
