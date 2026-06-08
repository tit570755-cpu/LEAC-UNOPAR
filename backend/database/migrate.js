require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { getDb } = require('./db');
const bcrypt = require('bcryptjs');

function migrate() {
  const db = getDb();
  
  console.log('🔧 Iniciando migração do banco de dados...');

  // ─── USUÁRIOS ───────────────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha_hash TEXT NOT NULL,
      papel TEXT NOT NULL CHECK(papel IN ('admin','biomedico','recepcao')),
      ativo INTEGER NOT NULL DEFAULT 1,
      ultimo_acesso DATETIME,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // ─── CONVÊNIOS ───────────────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS convenios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      codigo TEXT,
      tipo TEXT DEFAULT 'particular' CHECK(tipo IN ('particular','convenio','sus')),
      ativo INTEGER DEFAULT 1,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // ─── PACIENTES ──────────────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS pacientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      cpf_enc TEXT,
      cpf_mask TEXT,
      data_nascimento TEXT,
      sexo TEXT CHECK(sexo IN ('M','F','O')),
      telefone TEXT,
      email TEXT,
      logradouro TEXT,
      numero TEXT,
      complemento TEXT,
      bairro TEXT,
      cidade TEXT,
      uf TEXT,
      cep TEXT,
      convenio_id INTEGER REFERENCES convenios(id),
      num_carteirinha TEXT,
      consentimento_lgpd INTEGER DEFAULT 0,
      data_consentimento DATETIME,
      anonimizado INTEGER DEFAULT 0,
      data_anonimizacao DATETIME,
      observacoes TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      criado_por INTEGER REFERENCES usuarios(id)
    );
  `);

  // ─── PROFISSIONAIS SOLICITANTES ──────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS profissionais (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      crm TEXT,
      especialidade TEXT,
      telefone TEXT,
      email TEXT,
      ativo INTEGER DEFAULT 1,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // ─── CATEGORIAS DE EXAMES ───────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS categorias_exames (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT,
      cor TEXT DEFAULT '#3B82F6'
    );
  `);

  // ─── CATÁLOGO DE EXAMES ──────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS exames (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT UNIQUE NOT NULL,
      nome TEXT NOT NULL,
      sinonimos TEXT,
      categoria_id INTEGER REFERENCES categorias_exames(id),
      metodo TEXT,
      unidade TEXT,
      material_biologico TEXT,
      tipo_tubo TEXT,
      volume_ml REAL,
      tempo_jejum INTEGER DEFAULT 0,
      prazo_resultado_horas INTEGER DEFAULT 24,
      instrucoes_coleta TEXT,
      preco REAL DEFAULT 0,
      ativo INTEGER DEFAULT 1,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // ─── VALORES DE REFERÊNCIA ──────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS valores_referencia (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exame_id INTEGER NOT NULL REFERENCES exames(id) ON DELETE CASCADE,
      sexo TEXT DEFAULT 'ambos' CHECK(sexo IN ('M','F','ambos')),
      idade_min INTEGER DEFAULT 0,
      idade_max INTEGER DEFAULT 999,
      valor_min REAL,
      valor_max REAL,
      valor_texto TEXT,
      unidade TEXT,
      descricao TEXT
    );
  `);

  // ─── REQUISIÇÕES ────────────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS requisicoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero TEXT UNIQUE NOT NULL,
      paciente_id INTEGER NOT NULL REFERENCES pacientes(id),
      profissional_id INTEGER REFERENCES profissionais(id),
      convenio_id INTEGER REFERENCES convenios(id),
      num_guia TEXT,
      urgente INTEGER DEFAULT 0,
      status TEXT DEFAULT 'pendente' CHECK(status IN ('pendente','coleta','triagem','analise','liberado','cancelado')),
      data_solicitacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      data_coleta DATETIME,
      data_prevista DATETIME,
      data_liberacao DATETIME,
      observacoes TEXT,
      criado_por INTEGER REFERENCES usuarios(id),
      liberado_por INTEGER REFERENCES usuarios(id),
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // ─── ITENS DE REQUISIÇÃO ────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS itens_requisicao (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      requisicao_id INTEGER NOT NULL REFERENCES requisicoes(id) ON DELETE CASCADE,
      exame_id INTEGER NOT NULL REFERENCES exames(id),
      status TEXT DEFAULT 'pendente' CHECK(status IN ('pendente','analise','concluido')),
      resultado TEXT,
      resultado_numerico REAL,
      unidade TEXT,
      interpretacao TEXT CHECK(interpretacao IN ('normal','alto','baixo','critico',NULL)),
      observacoes TEXT,
      analisado_por INTEGER REFERENCES usuarios(id),
      data_resultado DATETIME,
      preco REAL DEFAULT 0
    );
  `);

  // ─── LAUDOS ─────────────────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS laudos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      requisicao_id INTEGER UNIQUE NOT NULL REFERENCES requisicoes(id),
      numero_laudo TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'rascunho' CHECK(status IN ('rascunho','assinado','enviado')),
      pdf_path TEXT,
      assinado_por INTEGER REFERENCES usuarios(id),
      data_assinatura DATETIME,
      rt_nome TEXT,
      rt_crbm TEXT,
      observacoes TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // ─── LOGS DE ACESSO (LGPD) ──────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS logs_acesso (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER REFERENCES usuarios(id),
      usuario_nome TEXT,
      acao TEXT NOT NULL,
      recurso TEXT,
      recurso_id TEXT,
      detalhes TEXT,
      ip TEXT,
      user_agent TEXT,
      status_code INTEGER,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // ─── CONSENTIMENTOS LGPD ────────────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS consentimentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paciente_id INTEGER NOT NULL REFERENCES pacientes(id),
      tipo TEXT NOT NULL,
      aceito INTEGER NOT NULL DEFAULT 0,
      ip TEXT,
      user_agent TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // ─── INDEXES ────────────────────────────────────────────────────────────────
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_pacientes_nome ON pacientes(nome);
    CREATE INDEX IF NOT EXISTS idx_requisicoes_paciente ON requisicoes(paciente_id);
    CREATE INDEX IF NOT EXISTS idx_requisicoes_status ON requisicoes(status);
    CREATE INDEX IF NOT EXISTS idx_requisicoes_data ON requisicoes(data_solicitacao);
    CREATE INDEX IF NOT EXISTS idx_itens_requisicao ON itens_requisicao(requisicao_id);
    CREATE INDEX IF NOT EXISTS idx_logs_usuario ON logs_acesso(usuario_id);
    CREATE INDEX IF NOT EXISTS idx_logs_data ON logs_acesso(criado_em);
  `);

  console.log('✅ Migração concluída com sucesso!');
}

migrate();
