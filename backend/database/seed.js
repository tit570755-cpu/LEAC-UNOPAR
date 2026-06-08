require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { getDb } = require('./db');
const bcrypt = require('bcryptjs');

async function seed() {
  const db = getDb();
  console.log('🌱 Iniciando seed do banco de dados...');

  // ─── USUÁRIOS ───────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin@123', 12);
  const bioHash = await bcrypt.hash('Bio@123', 12);
  const recHash = await bcrypt.hash('Rec@123', 12);

  db.prepare(`INSERT OR IGNORE INTO usuarios (nome, email, senha_hash, papel) VALUES (?, ?, ?, ?)`).run('Administrador Sistema', 'admin@labsystem.com', adminHash, 'admin');
  db.prepare(`INSERT OR IGNORE INTO usuarios (nome, email, senha_hash, papel) VALUES (?, ?, ?, ?)`).run('Dr. Carlos Silva - Biomédico', 'biomedico@labsystem.com', bioHash, 'biomedico');
  db.prepare(`INSERT OR IGNORE INTO usuarios (nome, email, senha_hash, papel) VALUES (?, ?, ?, ?)`).run('Ana Paula - Recepção', 'recepcao@labsystem.com', recHash, 'recepcao');

  // ─── CONVÊNIOS ───────────────────────────────────────────────────────────────
  const convenios = [
    { nome: 'Particular', codigo: 'PART', tipo: 'particular' },
    { nome: 'Unimed', codigo: 'UNIMED', tipo: 'convenio' },
    { nome: 'Bradesco Saúde', codigo: 'BRAD', tipo: 'convenio' },
    { nome: 'Amil', codigo: 'AMIL', tipo: 'convenio' },
    { nome: 'SulAmérica', codigo: 'SULA', tipo: 'convenio' },
    { nome: 'SUS', codigo: 'SUS', tipo: 'sus' },
    { nome: 'Hapvida', codigo: 'HAP', tipo: 'convenio' },
    { nome: 'NotreDame Intermédica', codigo: 'NDI', tipo: 'convenio' }
  ];
  for (const c of convenios) {
    db.prepare(`INSERT OR IGNORE INTO convenios (nome, codigo, tipo) VALUES (?, ?, ?)`).run(c.nome, c.codigo, c.tipo);
  }

  // ─── CATEGORIAS ──────────────────────────────────────────────────────────────
  const categorias = [
    { nome: 'Hematologia', descricao: 'Exames do sangue e elementos figurados', cor: '#EF4444' },
    { nome: 'Bioquímica', descricao: 'Dosagens bioquímicas e metabólicas', cor: '#3B82F6' },
    { nome: 'Imunologia', descricao: 'Sorologias e testes imunológicos', cor: '#8B5CF6' },
    { nome: 'Microbiologia', descricao: 'Culturas e antibiogramas', cor: '#10B981' },
    { nome: 'Urinálise', descricao: 'Exames de urina', cor: '#F59E0B' },
    { nome: 'Endocrinologia', descricao: 'Hormônios e função endócrina', cor: '#EC4899' },
    { nome: 'Coagulação', descricao: 'Testes de hemostasia e coagulação', cor: '#F97316' },
    { nome: 'Micronutrientes', descricao: 'Vitaminas e minerais', cor: '#14B8A6' },
    { nome: 'Parasitologia', descricao: 'Exames parasitológicos', cor: '#6B7280' },
    { nome: 'Lipídios', descricao: 'Perfil lipídico e colesterol', cor: '#0EA5E9' }
  ];

  for (const cat of categorias) {
    db.prepare(`INSERT OR IGNORE INTO categorias_exames (nome, descricao, cor) VALUES (?, ?, ?)`).run(cat.nome, cat.descricao, cat.cor);
  }

  const getCat = (nome) => db.prepare('SELECT id FROM categorias_exames WHERE nome = ?').get(nome)?.id;

  // ─── EXAMES COM VALORES DE REFERÊNCIA REAIS ──────────────────────────────────
  const exames = [
    // HEMATOLOGIA
    {
      codigo: 'HEM001', nome: 'Hemograma Completo', categoria: 'Hematologia',
      metodo: 'Contador Automático (Impedância/Óptica)', unidade: 'múltiplos',
      material_biologico: 'Sangue venoso', tipo_tubo: 'EDTA (Roxo)', volume_ml: 3,
      tempo_jejum: 0, prazo_resultado_horas: 4, preco: 35.00,
      instrucoes_coleta: 'Coleta em tubo EDTA. Homogeneizar suavemente por inversão.',
      refs: [
        { sexo: 'M', idade_min: 18, idade_max: 999, valor_texto: 'Eritrócitos: 4,5-6,0 M/μL | Hb: 13,5-17,5 g/dL | Ht: 40-52% | Leucócitos: 4.000-11.000/μL | Plaquetas: 150.000-400.000/μL' },
        { sexo: 'F', idade_min: 18, idade_max: 999, valor_texto: 'Eritrócitos: 4,0-5,5 M/μL | Hb: 12,0-16,0 g/dL | Ht: 35-47% | Leucócitos: 4.000-11.000/μL | Plaquetas: 150.000-400.000/μL' },
        { sexo: 'ambos', idade_min: 0, idade_max: 17, valor_texto: 'Varia com a faixa etária. Consultar tabela pediátrica.' }
      ]
    },
    {
      codigo: 'HEM002', nome: 'Eritrograma', categoria: 'Hematologia',
      metodo: 'Citometria de fluxo', unidade: 'g/dL',
      material_biologico: 'Sangue venoso', tipo_tubo: 'EDTA (Roxo)', volume_ml: 3,
      tempo_jejum: 0, prazo_resultado_horas: 4, preco: 18.00,
      instrucoes_coleta: 'Tubo EDTA.',
      refs: [
        { sexo: 'M', idade_min: 18, idade_max: 999, valor_min: 13.5, valor_max: 17.5, unidade: 'g/dL', descricao: 'Hemoglobina adulto masculino' },
        { sexo: 'F', idade_min: 18, idade_max: 999, valor_min: 12.0, valor_max: 16.0, unidade: 'g/dL', descricao: 'Hemoglobina adulto feminino' }
      ]
    },
    {
      codigo: 'HEM003', nome: 'Leucograma', categoria: 'Hematologia',
      metodo: 'Contagem automática com diferencial', unidade: '/μL',
      material_biologico: 'Sangue venoso', tipo_tubo: 'EDTA (Roxo)', volume_ml: 3,
      tempo_jejum: 0, prazo_resultado_horas: 4, preco: 18.00,
      instrucoes_coleta: 'Tubo EDTA.',
      refs: [
        { sexo: 'ambos', idade_min: 18, idade_max: 999, valor_min: 4000, valor_max: 11000, unidade: '/μL', descricao: 'Leucócitos totais' }
      ]
    },
    {
      codigo: 'HEM004', nome: 'Plaquetas', categoria: 'Hematologia',
      metodo: 'Impedância elétrica', unidade: 'mil/μL',
      material_biologico: 'Sangue venoso', tipo_tubo: 'EDTA (Roxo)', volume_ml: 3,
      tempo_jejum: 0, prazo_resultado_horas: 4, preco: 15.00,
      instrucoes_coleta: 'Tubo EDTA.',
      refs: [{ sexo: 'ambos', idade_min: 0, idade_max: 999, valor_min: 150, valor_max: 400, unidade: 'mil/μL', descricao: 'Trombócitos' }]
    },
    // BIOQUÍMICA
    {
      codigo: 'BIO001', nome: 'Glicemia em Jejum', categoria: 'Bioquímica',
      metodo: 'Enzimático (Hexokinase)', unidade: 'mg/dL',
      material_biologico: 'Sangue venoso', tipo_tubo: 'Fluoreto (Cinza)', volume_ml: 3,
      tempo_jejum: 8, prazo_resultado_horas: 4, preco: 12.00,
      instrucoes_coleta: 'Jejum mínimo de 8 horas. Tubo fluoretado cinza.',
      refs: [
        { sexo: 'ambos', idade_min: 0, idade_max: 999, valor_min: 70, valor_max: 99, unidade: 'mg/dL', descricao: 'Normal' },
        { sexo: 'ambos', idade_min: 0, idade_max: 999, valor_texto: 'Normal: 70-99 | Pré-diabético: 100-125 | Diabético: ≥126 mg/dL' }
      ]
    },
    {
      codigo: 'BIO002', nome: 'Glicemia Pós-Prandial (2h)', categoria: 'Bioquímica',
      metodo: 'Enzimático (Hexokinase)', unidade: 'mg/dL',
      material_biologico: 'Sangue venoso', tipo_tubo: 'Fluoreto (Cinza)', volume_ml: 3,
      tempo_jejum: 0, prazo_resultado_horas: 4, preco: 12.00,
      instrucoes_coleta: 'Coleta 2 horas após refeição principal.',
      refs: [{ sexo: 'ambos', idade_min: 0, idade_max: 999, valor_texto: 'Normal: <140 | Alterado: 140-199 | Diabético: ≥200 mg/dL' }]
    },
    {
      codigo: 'BIO003', nome: 'Hemoglobina Glicada (HbA1c)', categoria: 'Bioquímica',
      metodo: 'HPLC ou Imunoturbidimetria', unidade: '%',
      material_biologico: 'Sangue venoso', tipo_tubo: 'EDTA (Roxo)', volume_ml: 3,
      tempo_jejum: 0, prazo_resultado_horas: 24, preco: 38.00,
      instrucoes_coleta: 'Sem necessidade de jejum. Tubo EDTA.',
      refs: [{ sexo: 'ambos', idade_min: 0, idade_max: 999, valor_texto: 'Normal: <5,7% | Pré-diabético: 5,7-6,4% | Diabético: ≥6,5%' }]
    },
    {
      codigo: 'BIO004', nome: 'Ureia', categoria: 'Bioquímica',
      metodo: 'Enzimático (Urease-GLDH)', unidade: 'mg/dL',
      material_biologico: 'Sangue venoso', tipo_tubo: 'Soro (Vermelho/Amarelo)', volume_ml: 5,
      tempo_jejum: 4, prazo_resultado_horas: 8, preco: 10.00,
      instrucoes_coleta: 'Jejum de 4 horas recomendado.',
      refs: [{ sexo: 'ambos', idade_min: 18, idade_max: 999, valor_min: 15, valor_max: 40, unidade: 'mg/dL' }]
    },
    {
      codigo: 'BIO005', nome: 'Creatinina', categoria: 'Bioquímica',
      metodo: 'Jaffé ou Enzimático', unidade: 'mg/dL',
      material_biologico: 'Sangue venoso', tipo_tubo: 'Soro (Vermelho/Amarelo)', volume_ml: 5,
      tempo_jejum: 4, prazo_resultado_horas: 8, preco: 10.00,
      instrucoes_coleta: 'Jejum de 4 horas.',
      refs: [
        { sexo: 'M', idade_min: 18, idade_max: 999, valor_min: 0.7, valor_max: 1.3, unidade: 'mg/dL' },
        { sexo: 'F', idade_min: 18, idade_max: 999, valor_min: 0.5, valor_max: 1.1, unidade: 'mg/dL' }
      ]
    },
    {
      codigo: 'BIO006', nome: 'TGO (AST)', categoria: 'Bioquímica',
      metodo: 'Cinético UV (IFCC)', unidade: 'U/L',
      material_biologico: 'Sangue venoso', tipo_tubo: 'Soro (Vermelho/Amarelo)', volume_ml: 5,
      tempo_jejum: 4, prazo_resultado_horas: 8, preco: 12.00,
      instrucoes_coleta: 'Jejum de 4 horas.',
      refs: [
        { sexo: 'M', idade_min: 18, idade_max: 999, valor_min: 10, valor_max: 40, unidade: 'U/L', descricao: 'Aspartato aminotransferase' },
        { sexo: 'F', idade_min: 18, idade_max: 999, valor_min: 10, valor_max: 35, unidade: 'U/L', descricao: 'Aspartato aminotransferase' }
      ]
    },
    {
      codigo: 'BIO007', nome: 'TGP (ALT)', categoria: 'Bioquímica',
      metodo: 'Cinético UV (IFCC)', unidade: 'U/L',
      material_biologico: 'Sangue venoso', tipo_tubo: 'Soro (Vermelho/Amarelo)', volume_ml: 5,
      tempo_jejum: 4, prazo_resultado_horas: 8, preco: 12.00,
      instrucoes_coleta: 'Jejum de 4 horas.',
      refs: [
        { sexo: 'M', idade_min: 18, idade_max: 999, valor_min: 7, valor_max: 56, unidade: 'U/L', descricao: 'Alanina aminotransferase' },
        { sexo: 'F', idade_min: 18, idade_max: 999, valor_min: 7, valor_max: 45, unidade: 'U/L', descricao: 'Alanina aminotransferase' }
      ]
    },
    {
      codigo: 'BIO008', nome: 'Gama-GT', categoria: 'Bioquímica',
      metodo: 'Cinético colorimétrico', unidade: 'U/L',
      material_biologico: 'Sangue venoso', tipo_tubo: 'Soro (Vermelho/Amarelo)', volume_ml: 5,
      tempo_jejum: 4, prazo_resultado_horas: 8, preco: 15.00,
      instrucoes_coleta: 'Jejum de 4 horas. Evitar álcool 24h antes.',
      refs: [
        { sexo: 'M', idade_min: 18, idade_max: 999, valor_min: 8, valor_max: 61, unidade: 'U/L' },
        { sexo: 'F', idade_min: 18, idade_max: 999, valor_min: 5, valor_max: 36, unidade: 'U/L' }
      ]
    },
    {
      codigo: 'BIO009', nome: 'Fosfatase Alcalina', categoria: 'Bioquímica',
      metodo: 'IFCC (p-nitrofenilfosfato)', unidade: 'U/L',
      material_biologico: 'Sangue venoso', tipo_tubo: 'Soro (Vermelho/Amarelo)', volume_ml: 5,
      tempo_jejum: 4, prazo_resultado_horas: 8, preco: 15.00,
      instrucoes_coleta: 'Jejum de 4 horas.',
      refs: [{ sexo: 'ambos', idade_min: 18, idade_max: 999, valor_min: 40, valor_max: 150, unidade: 'U/L' }]
    },
    {
      codigo: 'BIO010', nome: 'Ácido Úrico', categoria: 'Bioquímica',
      metodo: 'Enzimático (Uricase)', unidade: 'mg/dL',
      material_biologico: 'Sangue venoso', tipo_tubo: 'Soro (Vermelho/Amarelo)', volume_ml: 5,
      tempo_jejum: 4, prazo_resultado_horas: 8, preco: 12.00,
      instrucoes_coleta: 'Jejum de 4 horas.',
      refs: [
        { sexo: 'M', idade_min: 18, idade_max: 999, valor_min: 3.5, valor_max: 7.2, unidade: 'mg/dL' },
        { sexo: 'F', idade_min: 18, idade_max: 999, valor_min: 2.6, valor_max: 6.0, unidade: 'mg/dL' }
      ]
    },
    {
      codigo: 'BIO011', nome: 'Proteína C Reativa (PCR)', categoria: 'Bioquímica',
      metodo: 'Turbidimetria ou ELISA', unidade: 'mg/L',
      material_biologico: 'Sangue venoso', tipo_tubo: 'Soro (Vermelho/Amarelo)', volume_ml: 5,
      tempo_jejum: 0, prazo_resultado_horas: 8, preco: 20.00,
      instrucoes_coleta: 'Sem necessidade de jejum.',
      refs: [{ sexo: 'ambos', idade_min: 0, idade_max: 999, valor_min: 0, valor_max: 5, unidade: 'mg/L', descricao: 'Ausência de processo inflamatório agudo' }]
    },
    // LIPÍDIOS
    {
      codigo: 'LIP001', nome: 'Colesterol Total', categoria: 'Lipídios',
      metodo: 'Enzimático colorimétrico (CHOD-PAP)', unidade: 'mg/dL',
      material_biologico: 'Sangue venoso', tipo_tubo: 'Soro (Vermelho/Amarelo)', volume_ml: 5,
      tempo_jejum: 12, prazo_resultado_horas: 8, preco: 12.00,
      instrucoes_coleta: 'Jejum de 12 horas. Dieta habitual nos 3 dias anteriores.',
      refs: [{ sexo: 'ambos', idade_min: 20, idade_max: 999, valor_texto: 'Desejável: <200 | Limítrofe: 200-239 | Alto: ≥240 mg/dL' }]
    },
    {
      codigo: 'LIP002', nome: 'HDL Colesterol', categoria: 'Lipídios',
      metodo: 'Enzimático direto', unidade: 'mg/dL',
      material_biologico: 'Sangue venoso', tipo_tubo: 'Soro (Vermelho/Amarelo)', volume_ml: 5,
      tempo_jejum: 12, prazo_resultado_horas: 8, preco: 15.00,
      instrucoes_coleta: 'Jejum de 12 horas.',
      refs: [
        { sexo: 'M', idade_min: 20, idade_max: 999, valor_texto: 'Baixo: <40 | Desejável: ≥40 mg/dL' },
        { sexo: 'F', idade_min: 20, idade_max: 999, valor_texto: 'Baixo: <50 | Desejável: ≥50 mg/dL' }
      ]
    },
    {
      codigo: 'LIP003', nome: 'LDL Colesterol', categoria: 'Lipídios',
      metodo: 'Fórmula de Friedewald ou direto', unidade: 'mg/dL',
      material_biologico: 'Sangue venoso', tipo_tubo: 'Soro (Vermelho/Amarelo)', volume_ml: 5,
      tempo_jejum: 12, prazo_resultado_horas: 8, preco: 15.00,
      instrucoes_coleta: 'Jejum de 12 horas.',
      refs: [{ sexo: 'ambos', idade_min: 20, idade_max: 999, valor_texto: 'Ótimo: <100 | Desejável: 100-129 | Limítrofe: 130-159 | Alto: 160-189 | Muito alto: ≥190 mg/dL' }]
    },
    {
      codigo: 'LIP004', nome: 'Triglicerídeos', categoria: 'Lipídios',
      metodo: 'Enzimático colorimétrico (GPO-PAP)', unidade: 'mg/dL',
      material_biologico: 'Sangue venoso', tipo_tubo: 'Soro (Vermelho/Amarelo)', volume_ml: 5,
      tempo_jejum: 12, prazo_resultado_horas: 8, preco: 12.00,
      instrucoes_coleta: 'Jejum de 12 horas. Evitar álcool 72h antes.',
      refs: [{ sexo: 'ambos', idade_min: 20, idade_max: 999, valor_texto: 'Desejável: <150 | Limítrofe: 150-199 | Alto: 200-499 | Muito alto: ≥500 mg/dL' }]
    },
    // ENDOCRINOLOGIA
    {
      codigo: 'END001', nome: 'TSH', categoria: 'Endocrinologia',
      metodo: 'Eletroquimioluminescência (ECLIA)', unidade: 'mUI/L',
      material_biologico: 'Sangue venoso', tipo_tubo: 'Soro (Vermelho/Amarelo)', volume_ml: 5,
      tempo_jejum: 0, prazo_resultado_horas: 24, preco: 45.00,
      instrucoes_coleta: 'Sem necessidade de jejum. Colher de manhã preferencialmente.',
      refs: [{ sexo: 'ambos', idade_min: 18, idade_max: 999, valor_min: 0.4, valor_max: 4.0, unidade: 'mUI/L', descricao: 'Hormônio Estimulante da Tireoide' }]
    },
    {
      codigo: 'END002', nome: 'T4 Livre', categoria: 'Endocrinologia',
      metodo: 'ECLIA ou CLIA', unidade: 'ng/dL',
      material_biologico: 'Sangue venoso', tipo_tubo: 'Soro (Vermelho/Amarelo)', volume_ml: 5,
      tempo_jejum: 0, prazo_resultado_horas: 24, preco: 40.00,
      instrucoes_coleta: 'Sem jejum. Colher antes de tomar medicação de tireoide.',
      refs: [{ sexo: 'ambos', idade_min: 18, idade_max: 999, valor_min: 0.8, valor_max: 1.9, unidade: 'ng/dL', descricao: 'Tiroxina livre' }]
    },
    {
      codigo: 'END003', nome: 'T3 Total', categoria: 'Endocrinologia',
      metodo: 'ECLIA ou CLIA', unidade: 'ng/dL',
      material_biologico: 'Sangue venoso', tipo_tubo: 'Soro (Vermelho/Amarelo)', volume_ml: 5,
      tempo_jejum: 0, prazo_resultado_horas: 24, preco: 40.00,
      instrucoes_coleta: 'Sem jejum.',
      refs: [{ sexo: 'ambos', idade_min: 18, idade_max: 999, valor_min: 80, valor_max: 200, unidade: 'ng/dL' }]
    },
    {
      codigo: 'END004', nome: 'Cortisol Basal (8h)', categoria: 'Endocrinologia',
      metodo: 'ECLIA', unidade: 'μg/dL',
      material_biologico: 'Sangue venoso', tipo_tubo: 'Soro (Vermelho/Amarelo)', volume_ml: 5,
      tempo_jejum: 8, prazo_resultado_horas: 24, preco: 55.00,
      instrucoes_coleta: 'Colher entre 7-9h da manhã. Jejum de 8 horas.',
      refs: [{ sexo: 'ambos', idade_min: 18, idade_max: 999, valor_min: 5, valor_max: 25, unidade: 'μg/dL', descricao: 'Matutino (7-9h)' }]
    },
    {
      codigo: 'END005', nome: 'Insulina Basal', categoria: 'Endocrinologia',
      metodo: 'ECLIA', unidade: 'μUI/mL',
      material_biologico: 'Sangue venoso', tipo_tubo: 'Soro (Vermelho/Amarelo)', volume_ml: 5,
      tempo_jejum: 12, prazo_resultado_horas: 24, preco: 50.00,
      instrucoes_coleta: 'Jejum de 12 horas.',
      refs: [{ sexo: 'ambos', idade_min: 18, idade_max: 999, valor_min: 2, valor_max: 25, unidade: 'μUI/mL', descricao: 'Em jejum' }]
    },
    {
      codigo: 'END006', nome: 'Vitamina D (25-OH)', categoria: 'Micronutrientes',
      metodo: 'ECLIA', unidade: 'ng/mL',
      material_biologico: 'Sangue venoso', tipo_tubo: 'Soro (Vermelho/Amarelo)', volume_ml: 5,
      tempo_jejum: 0, prazo_resultado_horas: 48, preco: 70.00,
      instrucoes_coleta: 'Sem necessidade de jejum.',
      refs: [{ sexo: 'ambos', idade_min: 0, idade_max: 999, valor_texto: 'Deficiência: <20 | Insuficiência: 20-29 | Suficiência: 30-100 | Toxicidade: >100 ng/mL' }]
    },
    {
      codigo: 'END007', nome: 'Ferritina', categoria: 'Micronutrientes',
      metodo: 'ECLIA', unidade: 'ng/mL',
      material_biologico: 'Sangue venoso', tipo_tubo: 'Soro (Vermelho/Amarelo)', volume_ml: 5,
      tempo_jejum: 0, prazo_resultado_horas: 24, preco: 45.00,
      instrucoes_coleta: 'Sem necessidade de jejum.',
      refs: [
        { sexo: 'M', idade_min: 18, idade_max: 999, valor_min: 24, valor_max: 336, unidade: 'ng/mL' },
        { sexo: 'F', idade_min: 18, idade_max: 999, valor_min: 11, valor_max: 307, unidade: 'ng/mL' }
      ]
    },
    {
      codigo: 'END008', nome: 'Vitamina B12', categoria: 'Micronutrientes',
      metodo: 'ECLIA', unidade: 'pg/mL',
      material_biologico: 'Sangue venoso', tipo_tubo: 'Soro (Vermelho/Amarelo)', volume_ml: 5,
      tempo_jejum: 0, prazo_resultado_horas: 48, preco: 60.00,
      instrucoes_coleta: 'Sem necessidade de jejum.',
      refs: [{ sexo: 'ambos', idade_min: 0, idade_max: 999, valor_min: 200, valor_max: 900, unidade: 'pg/mL' }]
    },
    // IMUNOLOGIA
    {
      codigo: 'IMU001', nome: 'Fator Reumatoide', categoria: 'Imunologia',
      metodo: 'Nefelometria ou Turbidimetria', unidade: 'UI/mL',
      material_biologico: 'Sangue venoso', tipo_tubo: 'Soro (Vermelho/Amarelo)', volume_ml: 5,
      tempo_jejum: 0, prazo_resultado_horas: 24, preco: 25.00,
      instrucoes_coleta: 'Sem necessidade de jejum.',
      refs: [{ sexo: 'ambos', idade_min: 0, idade_max: 999, valor_min: 0, valor_max: 14, unidade: 'UI/mL', descricao: 'Negativo: <14 UI/mL' }]
    },
    {
      codigo: 'IMU002', nome: 'Anti-HIV 1 e 2 (ELISA 4ª geração)', categoria: 'Imunologia',
      metodo: 'ELISA quimioluminescente', unidade: 'resultado',
      material_biologico: 'Sangue venoso', tipo_tubo: 'Soro (Vermelho/Amarelo)', volume_ml: 5,
      tempo_jejum: 0, prazo_resultado_horas: 48, preco: 35.00,
      instrucoes_coleta: 'Sem necessidade de jejum.',
      refs: [{ sexo: 'ambos', idade_min: 0, idade_max: 999, valor_texto: 'Não Reagente (Negativo) / Reagente (Positivo)' }]
    },
    {
      codigo: 'IMU003', nome: 'VDRL (Sífilis)', categoria: 'Imunologia',
      metodo: 'Floculação (VDRL)', unidade: 'resultado',
      material_biologico: 'Sangue venoso', tipo_tubo: 'Soro (Vermelho/Amarelo)', volume_ml: 5,
      tempo_jejum: 0, prazo_resultado_horas: 24, preco: 18.00,
      instrucoes_coleta: 'Sem necessidade de jejum.',
      refs: [{ sexo: 'ambos', idade_min: 0, idade_max: 999, valor_texto: 'Não Reagente / Reagente (se positivo, titular)' }]
    },
    {
      codigo: 'IMU004', nome: 'Anti-HBs (Hepatite B)', categoria: 'Imunologia',
      metodo: 'ECLIA ou ELISA', unidade: 'mUI/mL',
      material_biologico: 'Sangue venoso', tipo_tubo: 'Soro (Vermelho/Amarelo)', volume_ml: 5,
      tempo_jejum: 0, prazo_resultado_horas: 24, preco: 32.00,
      instrucoes_coleta: 'Sem necessidade de jejum.',
      refs: [{ sexo: 'ambos', idade_min: 0, idade_max: 999, valor_texto: 'Não imune: <10 | Imune: ≥10 mUI/mL' }]
    },
    {
      codigo: 'IMU005', nome: 'HBsAg (Antígeno de Superfície - Hepatite B)', categoria: 'Imunologia',
      metodo: 'ECLIA', unidade: 'resultado',
      material_biologico: 'Sangue venoso', tipo_tubo: 'Soro (Vermelho/Amarelo)', volume_ml: 5,
      tempo_jejum: 0, prazo_resultado_horas: 24, preco: 35.00,
      instrucoes_coleta: 'Sem necessidade de jejum.',
      refs: [{ sexo: 'ambos', idade_min: 0, idade_max: 999, valor_texto: 'Não Reagente (Negativo) / Reagente (Positivo)' }]
    },
    {
      codigo: 'IMU006', nome: 'Anti-HCV (Hepatite C)', categoria: 'Imunologia',
      metodo: 'ECLIA', unidade: 'resultado',
      material_biologico: 'Sangue venoso', tipo_tubo: 'Soro (Vermelho/Amarelo)', volume_ml: 5,
      tempo_jejum: 0, prazo_resultado_horas: 24, preco: 35.00,
      instrucoes_coleta: 'Sem necessidade de jejum.',
      refs: [{ sexo: 'ambos', idade_min: 0, idade_max: 999, valor_texto: 'Não Reagente (Negativo) / Reagente (Positivo)' }]
    },
    {
      codigo: 'IMU007', nome: 'Toxoplasmose IgG e IgM', categoria: 'Imunologia',
      metodo: 'ELISA ou ECLIA', unidade: 'resultado',
      material_biologico: 'Sangue venoso', tipo_tubo: 'Soro (Vermelho/Amarelo)', volume_ml: 5,
      tempo_jejum: 0, prazo_resultado_horas: 48, preco: 45.00,
      instrucoes_coleta: 'Sem necessidade de jejum.',
      refs: [{ sexo: 'ambos', idade_min: 0, idade_max: 999, valor_texto: 'IgG: Negativo (<1,0 UI/mL) / Positivo (≥1,0) | IgM: Não Reagente / Reagente' }]
    },
    {
      codigo: 'IMU008', nome: 'Chagas (Doença de Chagas - IgG)', categoria: 'Imunologia',
      metodo: 'ELISA', unidade: 'resultado',
      material_biologico: 'Sangue venoso', tipo_tubo: 'Soro (Vermelho/Amarelo)', volume_ml: 5,
      tempo_jejum: 0, prazo_resultado_horas: 72, preco: 40.00,
      instrucoes_coleta: 'Sem necessidade de jejum.',
      refs: [{ sexo: 'ambos', idade_min: 0, idade_max: 999, valor_texto: 'Não Reagente / Reagente' }]
    },
    // COAGULAÇÃO
    {
      codigo: 'COA001', nome: 'Tempo de Protrombina (TP/INR)', categoria: 'Coagulação',
      metodo: 'Coagulométrico automático', unidade: 'seg / INR',
      material_biologico: 'Sangue venoso', tipo_tubo: 'Citrato (Azul)', volume_ml: 2.7,
      tempo_jejum: 0, prazo_resultado_horas: 4, preco: 20.00,
      instrucoes_coleta: 'Tubo citrato azul, preencher exatamente até a marca. Não agitar.',
      refs: [{ sexo: 'ambos', idade_min: 0, idade_max: 999, valor_texto: 'TP: 10-14 seg | INR: 0,8-1,2 (sem anticoagulante)' }]
    },
    {
      codigo: 'COA002', nome: 'TTPA (Tempo de Tromboplastina Parcial Ativada)', categoria: 'Coagulação',
      metodo: 'Coagulométrico automático', unidade: 'seg',
      material_biologico: 'Sangue venoso', tipo_tubo: 'Citrato (Azul)', volume_ml: 2.7,
      tempo_jejum: 0, prazo_resultado_horas: 4, preco: 20.00,
      instrucoes_coleta: 'Tubo citrato azul.',
      refs: [{ sexo: 'ambos', idade_min: 0, idade_max: 999, valor_min: 24, valor_max: 38, unidade: 'seg' }]
    },
    {
      codigo: 'COA003', nome: 'D-Dímero', categoria: 'Coagulação',
      metodo: 'Imunoturbidimetria por látex', unidade: 'μg/mL FEU',
      material_biologico: 'Sangue venoso', tipo_tubo: 'Citrato (Azul)', volume_ml: 2.7,
      tempo_jejum: 0, prazo_resultado_horas: 8, preco: 45.00,
      instrucoes_coleta: 'Tubo citrato azul.',
      refs: [{ sexo: 'ambos', idade_min: 0, idade_max: 999, valor_min: 0, valor_max: 0.5, unidade: 'μg/mL FEU', descricao: 'Negativo para TEV agudo' }]
    },
    // URINÁLISE
    {
      codigo: 'URI001', nome: 'Urina Tipo 1 (EAS)', categoria: 'Urinálise',
      metodo: 'Tira reativa + microscopia', unidade: 'múltiplos',
      material_biologico: 'Urina', tipo_tubo: 'Frasco de urina estéril', volume_ml: 30,
      tempo_jejum: 0, prazo_resultado_horas: 4, preco: 18.00,
      instrucoes_coleta: 'Urina do jato médio. Higiene prévia. Colher no frasco estéril. 1ª urina da manhã preferencialmente.',
      refs: [{ sexo: 'ambos', idade_min: 0, idade_max: 999, valor_texto: 'Aspecto: claro | Cor: amarela | pH: 5-8 | Densidade: 1005-1030 | Glicose: ausente | Proteínas: ausentes | Hemácias: 0-2/campo | Leucócitos: 0-5/campo' }]
    },
    {
      codigo: 'URI002', nome: 'Urocultura', categoria: 'Urinálise',
      metodo: 'Cultura bacteriana + antibiograma', unidade: 'UFC/mL',
      material_biologico: 'Urina', tipo_tubo: 'Frasco de urina estéril', volume_ml: 10,
      tempo_jejum: 0, prazo_resultado_horas: 72, preco: 45.00,
      instrucoes_coleta: 'Urina do jato médio. Higienizar bem. Não usar antibióticos nas 72h anteriores. Colher 1ª urina da manhã.',
      refs: [{ sexo: 'ambos', idade_min: 0, idade_max: 999, valor_texto: 'Negativa: <10.000 UFC/mL | Positiva: ≥100.000 UFC/mL | Resultado duvidoso: 10.000-100.000' }]
    },
    {
      codigo: 'URI003', nome: 'Creatinina Urinária (24h)', categoria: 'Urinálise',
      metodo: 'Jaffé', unidade: 'g/24h',
      material_biologico: 'Urina 24h', tipo_tubo: 'Frasco 24h', volume_ml: 2000,
      tempo_jejum: 0, prazo_resultado_horas: 24, preco: 20.00,
      instrucoes_coleta: 'Coletar toda urina de 24 horas em frasco específico. Manter refrigerado.',
      refs: [
        { sexo: 'M', idade_min: 18, idade_max: 999, valor_min: 1.0, valor_max: 2.0, unidade: 'g/24h' },
        { sexo: 'F', idade_min: 18, idade_max: 999, valor_min: 0.8, valor_max: 1.5, unidade: 'g/24h' }
      ]
    },
    // MICROBIOLOGIA
    {
      codigo: 'MIC001', nome: 'Hemograma + Hemocultura', categoria: 'Microbiologia',
      metodo: 'Cultura automatizada (BacT/ALERT)', unidade: 'resultado',
      material_biologico: 'Sangue venoso', tipo_tubo: 'Frasco de hemocultura', volume_ml: 10,
      tempo_jejum: 0, prazo_resultado_horas: 120, preco: 80.00,
      instrucoes_coleta: 'Colher antes de iniciar antibiótico. Antissepsia rigorosa. 2-3 pares (aeróbio + anaeróbio).',
      refs: [{ sexo: 'ambos', idade_min: 0, idade_max: 999, valor_texto: 'Negativa (sem crescimento bacteriano) / Positiva (informar agente e antibiograma)' }]
    },
    {
      codigo: 'MIC002', nome: 'Coprocultura', categoria: 'Microbiologia',
      metodo: 'Cultura em meios seletivos', unidade: 'resultado',
      material_biologico: 'Fezes', tipo_tubo: 'Frasco para fezes', volume_ml: 5,
      tempo_jejum: 0, prazo_resultado_horas: 96, preco: 45.00,
      instrucoes_coleta: 'Colher amostra de fezes frescas em frasco estéril. Não refrigerar.',
      refs: [{ sexo: 'ambos', idade_min: 0, idade_max: 999, valor_texto: 'Negativa / Positiva (identificar patógeno e realizar antibiograma)' }]
    },
    // PARASITOLOGIA
    {
      codigo: 'PAR001', nome: 'Exame Parasitológico de Fezes (EPF)', categoria: 'Parasitologia',
      metodo: 'Sedimentação espontânea (Hoffman) + Fita adesiva',
      unidade: 'resultado',
      material_biologico: 'Fezes', tipo_tubo: 'Frasco para fezes', volume_ml: 5,
      tempo_jejum: 0, prazo_resultado_horas: 48, preco: 15.00,
      instrucoes_coleta: 'Coletar amostras de 3 dias consecutivos. Não contaminar com urina. Refrigerar.',
      refs: [{ sexo: 'ambos', idade_min: 0, idade_max: 999, valor_texto: 'Negativo para parasitas e ovos / Positivo (informar parasita identificado)' }]
    },
    {
      codigo: 'PAR002', nome: 'Pesquisa de Sangue Oculto nas Fezes', categoria: 'Parasitologia',
      metodo: 'Imunocromatografia (anticorpo anti-hemoglobina humana)', unidade: 'resultado',
      material_biologico: 'Fezes', tipo_tubo: 'Frasco para fezes', volume_ml: 5,
      tempo_jejum: 0, prazo_resultado_horas: 24, preco: 25.00,
      instrucoes_coleta: 'Colher fezes frescas. Método imunológico não requer restrição alimentar.',
      refs: [{ sexo: 'ambos', idade_min: 0, idade_max: 999, valor_texto: 'Negativo / Positivo' }]
    }
  ];

  for (const exame of exames) {
    const catId = getCat(exame.categoria);
    let exameId = db.prepare('SELECT id FROM exames WHERE codigo = ?').get(exame.codigo)?.id;
    
    if (!exameId) {
      const res = db.prepare(`
        INSERT INTO exames (codigo, nome, sinonimos, categoria_id, metodo, unidade, material_biologico, tipo_tubo, volume_ml, tempo_jejum, prazo_resultado_horas, instrucoes_coleta, preco)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(exame.codigo, exame.nome, exame.sinonimos || null, catId, exame.metodo, exame.unidade, exame.material_biologico, exame.tipo_tubo, exame.volume_ml, exame.tempo_jejum, exame.prazo_resultado_horas, exame.instrucoes_coleta, exame.preco);
      exameId = res.lastInsertRowid;
    }

    for (const ref of exame.refs) {
      const exists = db.prepare('SELECT id FROM valores_referencia WHERE exame_id = ? AND sexo = ? AND idade_min = ?').get(exameId, ref.sexo || 'ambos', ref.idade_min || 0);
      if (!exists) {
        db.prepare(`INSERT INTO valores_referencia (exame_id, sexo, idade_min, idade_max, valor_min, valor_max, valor_texto, unidade, descricao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
          .run(exameId, ref.sexo || 'ambos', ref.idade_min || 0, ref.idade_max || 999, ref.valor_min || null, ref.valor_max || null, ref.valor_texto || null, ref.unidade || null, ref.descricao || null);
      }
    }
  }

  // ─── PROFISSIONAIS SOLICITANTES ──────────────────────────────────────────────
  const profissionais = [
    { nome: 'Dr. Roberto Almeida', crm: 'CRM-SP 12345', especialidade: 'Clínica Geral', telefone: '(11) 3001-0001', email: 'roberto.almeida@clinica.com' },
    { nome: 'Dra. Mariana Santos', crm: 'CRM-SP 67890', especialidade: 'Endocrinologia', telefone: '(11) 3001-0002', email: 'mariana.santos@clinica.com' },
    { nome: 'Dr. Paulo Ferreira', crm: 'CRM-SP 11223', especialidade: 'Cardiologia', telefone: '(11) 3001-0003', email: 'paulo.ferreira@clinica.com' },
    { nome: 'Dra. Luciana Costa', crm: 'CRM-SP 44556', especialidade: 'Ginecologia', telefone: '(11) 3001-0004', email: 'luciana.costa@clinica.com' },
    { nome: 'Dr. Marcos Oliveira', crm: 'CRM-SP 77889', especialidade: 'Gastroenterologia', telefone: '(11) 3001-0005', email: 'marcos.oliveira@clinica.com' }
  ];
  for (const p of profissionais) {
    const exists = db.prepare('SELECT id FROM profissionais WHERE crm = ?').get(p.crm);
    if (!exists) db.prepare('INSERT INTO profissionais (nome, crm, especialidade, telefone, email) VALUES (?, ?, ?, ?, ?)').run(p.nome, p.crm, p.especialidade, p.telefone, p.email);
  }

  // ─── PACIENTES DE EXEMPLO ────────────────────────────────────────────────────
  const { encrypt, maskCPF } = require('../src/utils/crypto');
  const pacientesExemplo = [
    { nome: 'João Carlos Silva', cpf: '12345678901', data_nascimento: '1985-03-15', sexo: 'M', telefone: '(11) 98765-4321', email: 'joao.silva@email.com', cidade: 'São Paulo', uf: 'SP', convenio: 'Unimed' },
    { nome: 'Maria Aparecida Souza', cpf: '98765432100', data_nascimento: '1972-07-22', sexo: 'F', telefone: '(11) 91234-5678', email: 'maria.souza@email.com', cidade: 'São Paulo', uf: 'SP', convenio: 'Bradesco Saúde' },
    { nome: 'Pedro Henrique Lima', cpf: '45678912300', data_nascimento: '1998-11-08', sexo: 'M', telefone: '(11) 99876-5432', email: 'pedro.lima@email.com', cidade: 'Guarulhos', uf: 'SP', convenio: 'Particular' },
    { nome: 'Fernanda Gomes Pereira', cpf: '32165498700', data_nascimento: '1965-01-30', sexo: 'F', telefone: '(11) 97654-3210', email: 'fernanda.pereira@email.com', cidade: 'São Paulo', uf: 'SP', convenio: 'Amil' },
    { nome: 'Ricardo Barbosa Neto', cpf: '65432198700', data_nascimento: '2001-05-18', sexo: 'M', telefone: '(11) 96543-2109', email: 'ricardo.neto@email.com', cidade: 'São Bernardo do Campo', uf: 'SP', convenio: 'SUS' }
  ];

  const getConvenioId = (nome) => db.prepare('SELECT id FROM convenios WHERE nome = ?').get(nome)?.id;
  const adminId = db.prepare('SELECT id FROM usuarios WHERE email = ?').get('admin@labsystem.com')?.id;

  for (const p of pacientesExemplo) {
    const exists = db.prepare('SELECT id FROM pacientes WHERE cpf_mask = ?').get(maskCPF(p.cpf));
    if (!exists) {
      db.prepare(`INSERT INTO pacientes (nome, cpf_enc, cpf_mask, data_nascimento, sexo, telefone, email, cidade, uf, convenio_id, consentimento_lgpd, data_consentimento, criado_por)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, ?)`
      ).run(p.nome, encrypt(p.cpf), maskCPF(p.cpf), p.data_nascimento, p.sexo, p.telefone, p.email, p.cidade, p.uf, getConvenioId(p.convenio), adminId);
    }
  }

  // ─── REQUISIÇÕES DE EXEMPLO ───────────────────────────────────────────────────
  const paciente1 = db.prepare("SELECT id FROM pacientes WHERE nome LIKE 'João%'").get();
  const paciente2 = db.prepare("SELECT id FROM pacientes WHERE nome LIKE 'Maria%'").get();
  const paciente3 = db.prepare("SELECT id FROM pacientes WHERE nome LIKE 'Pedro%'").get();
  const prof1 = db.prepare("SELECT id FROM profissionais WHERE crm = 'CRM-SP 12345'").get();
  const prof2 = db.prepare("SELECT id FROM profissionais WHERE crm = 'CRM-SP 67890'").get();

  const exHem = db.prepare("SELECT id FROM exames WHERE codigo = 'HEM001'").get();
  const exBio1 = db.prepare("SELECT id FROM exames WHERE codigo = 'BIO001'").get();
  const exBio3 = db.prepare("SELECT id FROM exames WHERE codigo = 'BIO003'").get();
  const exLip1 = db.prepare("SELECT id FROM exames WHERE codigo = 'LIP001'").get();
  const exLip4 = db.prepare("SELECT id FROM exames WHERE codigo = 'LIP004'").get();
  const exEnd1 = db.prepare("SELECT id FROM exames WHERE codigo = 'END001'").get();
  const exUri1 = db.prepare("SELECT id FROM exames WHERE codigo = 'URI001'").get();

  function criarRequisicao(pacienteId, profId, numero, status, examesIds, resultados) {
    const existsReq = db.prepare('SELECT id FROM requisicoes WHERE numero = ?').get(numero);
    if (existsReq) return existsReq.id;

    const convenioId = db.prepare('SELECT convenio_id FROM pacientes WHERE id = ?').get(pacienteId)?.convenio_id;
    const r = db.prepare(`INSERT INTO requisicoes (numero, paciente_id, profissional_id, convenio_id, status, data_coleta, data_liberacao, criado_por, liberado_por, data_solicitacao)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ${status === 'liberado' ? 'CURRENT_TIMESTAMP' : 'NULL'}, ?, ${status === 'liberado' ? '?' : 'NULL'}, datetime('now', '-1 hour'))`
    ).run(numero, pacienteId, profId, convenioId, status, adminId, ...(status === 'liberado' ? [adminId] : []));

    const reqId = r.lastInsertRowid;
    for (const exId of examesIds) {
      const ex = db.prepare('SELECT preco FROM exames WHERE id = ?').get(exId);
      db.prepare('INSERT INTO itens_requisicao (requisicao_id, exame_id, preco) VALUES (?, ?, ?)').run(reqId, exId, ex?.preco || 0);
    }

    if (resultados && status === 'liberado') {
      const itens = db.prepare('SELECT id, exame_id FROM itens_requisicao WHERE requisicao_id = ?').all(reqId);
      for (const item of itens) {
        const res = resultados[item.exame_id];
        if (res) {
          db.prepare(`UPDATE itens_requisicao SET resultado=?, resultado_numerico=?, unidade=?, interpretacao=?, status='concluido', analisado_por=?, data_resultado=CURRENT_TIMESTAMP WHERE id=?`)
            .run(res.resultado, res.numerico, res.unidade, res.interpretacao, adminId, item.id);
        }
      }
    }
    return reqId;
  }

  if (paciente1 && prof1 && exHem && exBio1 && exLip1) {
    criarRequisicao(paciente1.id, prof1.id, 'REQ-20260608-0001', 'liberado',
      [exHem.id, exBio1.id, exLip1.id, exLip4.id],
      {
        [exHem.id]: { resultado: 'Ver resultado detalhado', numerico: null, unidade: 'múltiplos', interpretacao: 'normal' },
        [exBio1.id]: { resultado: '92', numerico: 92, unidade: 'mg/dL', interpretacao: 'normal' },
        [exLip1.id]: { resultado: '215', numerico: 215, unidade: 'mg/dL', interpretacao: 'alto' },
        [exLip4.id]: { resultado: '185', numerico: 185, unidade: 'mg/dL', interpretacao: 'alto' }
      }
    );
  }

  if (paciente2 && prof2 && exEnd1 && exBio3) {
    criarRequisicao(paciente2.id, prof2.id, 'REQ-20260608-0002', 'liberado',
      [exEnd1.id, exBio3.id],
      {
        [exEnd1.id]: { resultado: '5.8', numerico: 5.8, unidade: 'mUI/L', interpretacao: 'alto' },
        [exBio3.id]: { resultado: '6.8', numerico: 6.8, unidade: '%', interpretacao: 'alto' }
      }
    );
  }

  if (paciente3 && prof1 && exUri1) {
    criarRequisicao(paciente3.id, prof1.id, 'REQ-20260608-0003', 'pendente', [exUri1.id], null);
    criarRequisicao(paciente3.id, prof1.id, 'REQ-20260608-0004', 'analise', [exHem?.id, exBio1?.id].filter(Boolean), null);
  }

  console.log('\n✅ Seed concluído com sucesso!');
  console.log('\n📊 Usuários criados:');
  console.log('  👤 Admin:      admin@labsystem.com / Admin@123');
  console.log('  🔬 Biomédico:  biomedico@labsystem.com / Bio@123');
  console.log('  📋 Recepção:   recepcao@labsystem.com / Rec@123');
  console.log('\n🧪 Exames cadastrados:', exames.length);
  console.log('👥 Pacientes de exemplo:', pacientesExemplo.length);
  console.log('📁 Requisições de exemplo criadas: 4');
}

seed().catch(console.error);
