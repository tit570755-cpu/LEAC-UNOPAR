// Authentication and Client-Side Mock Database Engine for GitHub Pages
const API_BASE = '/api';

// ==========================================
// MOCK DATABASE & SEEDER
// ==========================================

function maskCPF(cpf) {
  if (!cpf) return '';
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return cpf;
  return `${clean.substring(0, 3)}.${clean.substring(3, 6)}.${clean.substring(6, 9)}-${clean.substring(9)}`;
}

function calcIdadeAnos(dateStr) {
  if (!dateStr) return 30;
  const hoje = new Date();
  const nasc = new Date(dateStr);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

function initLocalDb() {
  const convenios = [
    { id: 1, nome: 'Particular', codigo: 'PART', tipo: 'particular' },
    { id: 2, nome: 'Unimed', codigo: 'UNIMED', tipo: 'convenio' },
    { id: 3, nome: 'Bradesco Saúde', codigo: 'BRAD', tipo: 'convenio' },
    { id: 4, nome: 'Amil', codigo: 'AMIL', tipo: 'convenio' },
    { id: 5, nome: 'SulAmérica', codigo: 'SULA', tipo: 'convenio' },
    { id: 6, nome: 'SUS - CISNORP', codigo: 'SUS', tipo: 'sus' },
    { id: 7, nome: 'Hapvida', codigo: 'HAP', tipo: 'convenio' },
    { id: 8, nome: 'NotreDame Intermédica', codigo: 'NDI', tipo: 'convenio' }
  ];

  const categorias = [
    { id: 1, nome: 'Hematologia', descricao: 'Exames do sangue e elementos figurados', cor: '#EF4444' },
    { id: 2, nome: 'Bioquímica', descricao: 'Dosagens bioquímicas e metabólicas', cor: '#3B82F6' },
    { id: 3, nome: 'Imunologia', descricao: 'Sorologias e testes imunológicos', cor: '#8B5CF6' },
    { id: 4, nome: 'Microbiologia', descricao: 'Culturas e antibiogramas', cor: '#10B981' },
    { id: 5, nome: 'Urinálise', descricao: 'Exames de urina', cor: '#F59E0B' },
    { id: 6, nome: 'Endocrinologia', descricao: 'Hormônios e função endócrina', cor: '#EC4899' },
    { id: 7, nome: 'Coagulação', descricao: 'Testes de hemostasia e coagulação', cor: '#F97316' },
    { id: 8, nome: 'Micronutrientes', descricao: 'Vitaminas e minerais', cor: '#14B8A6' },
    { id: 9, nome: 'Parasitologia', descricao: 'Exames parasitológicos', cor: '#6B7280' },
    { id: 10, nome: 'Lipídios', descricao: 'Perfil lipídico e colesterol', cor: '#0EA5E9' }
  ];

  const exames = [
    // Hematologia
    { id: 1, codigo: 'HEM001', nome: 'Hemograma Completo', categoria: 'Hematologia', metodo: 'Contador Automático', unidade: 'múltiplos', preco: 35.00, refs: [
      { sexo: 'M', idade_min: 18, idade_max: 999, valor_texto: 'Eritrócitos: 4,5-6,0 M/μL | Hb: 13,5-17,5 g/dL | Ht: 40-52%' },
      { sexo: 'F', idade_min: 18, idade_max: 999, valor_texto: 'Eritrócitos: 4,0-5,5 M/μL | Hb: 12,0-16,0 g/dL | Ht: 35-47%' },
      { sexo: 'ambos', idade_min: 0, idade_max: 17, valor_texto: 'Consultar tabela pediátrica.' }
    ]},
    { id: 2, codigo: 'HEM002', nome: 'Eritrograma', categoria: 'Hematologia', metodo: 'Citometria de fluxo', unidade: 'g/dL', preco: 18.00, refs: [
      { sexo: 'M', idade_min: 18, idade_max: 999, valor_min: 13.5, valor_max: 17.5 },
      { sexo: 'F', idade_min: 18, idade_max: 999, valor_min: 12.0, valor_max: 16.0 }
    ]},
    { id: 3, codigo: 'HEM003', nome: 'Leucograma', categoria: 'Hematologia', metodo: 'Contagem automática', unidade: '/μL', preco: 18.00, refs: [
      { sexo: 'ambos', idade_min: 18, idade_max: 999, valor_min: 4000, valor_max: 11000 }
    ]},
    { id: 4, codigo: 'HEM004', nome: 'Plaquetas', categoria: 'Hematologia', metodo: 'Impedância elétrica', unidade: 'mil/μL', preco: 15.00, refs: [
      { sexo: 'ambos', idade_min: 0, idade_max: 999, valor_min: 150, valor_max: 400 }
    ]},
    // Bioquímica
    { id: 5, codigo: 'BIO001', nome: 'Glicemia em Jejum', categoria: 'Bioquímica', metodo: 'Enzimático (Hexokinase)', unidade: 'mg/dL', preco: 12.00, refs: [
      { sexo: 'ambos', idade_min: 0, idade_max: 999, valor_min: 70, valor_max: 99, valor_texto: 'Normal: 70-99 | Pré-diabético: 100-125 | Diabético: ≥126 mg/dL' }
    ]},
    { id: 6, codigo: 'BIO002', nome: 'Glicemia Pós-Prandial (2h)', categoria: 'Bioquímica', metodo: 'Enzimático', unidade: 'mg/dL', preco: 12.00, refs: [
      { sexo: 'ambos', idade_min: 0, idade_max: 999, valor_texto: 'Normal: <140 | Alterado: 140-199 | Diabético: ≥200 mg/dL' }
    ]},
    { id: 7, codigo: 'BIO003', nome: 'Hemoglobina Glicada (HbA1c)', categoria: 'Bioquímica', metodo: 'HPLC', unidade: '%', preco: 38.00, refs: [
      { sexo: 'ambos', idade_min: 0, idade_max: 999, valor_texto: 'Normal: <5,7% | Pré-diabético: 5,7-6,4% | Diabético: ≥6,5%' }
    ]},
    { id: 8, codigo: 'BIO004', nome: 'Ureia', categoria: 'Bioquímica', metodo: 'Enzimático', unidade: 'mg/dL', preco: 10.00, refs: [
      { sexo: 'ambos', idade_min: 18, idade_max: 999, valor_min: 15, valor_max: 40 }
    ]},
    { id: 9, codigo: 'BIO005', nome: 'Creatinina', categoria: 'Bioquímica', metodo: 'Jaffé', unidade: 'mg/dL', preco: 10.00, refs: [
      { sexo: 'M', idade_min: 18, idade_max: 999, valor_min: 0.7, valor_max: 1.3 },
      { sexo: 'F', idade_min: 18, idade_max: 999, valor_min: 0.5, valor_max: 1.1 }
    ]},
    { id: 10, codigo: 'BIO006', nome: 'TGO (AST)', categoria: 'Bioquímica', metodo: 'Cinético UV', unidade: 'U/L', preco: 12.00, refs: [
      { sexo: 'M', idade_min: 18, idade_max: 999, valor_min: 10, valor_max: 40 },
      { sexo: 'F', idade_min: 18, idade_max: 999, valor_min: 10, valor_max: 35 }
    ]},
    { id: 11, codigo: 'BIO007', nome: 'TGP (ALT)', categoria: 'Bioquímica', metodo: 'Cinético UV', unidade: 'U/L', preco: 12.00, refs: [
      { sexo: 'M', idade_min: 18, idade_max: 999, valor_min: 7, valor_max: 56 },
      { sexo: 'F', idade_min: 18, idade_max: 999, valor_min: 7, valor_max: 45 }
    ]},
    { id: 12, codigo: 'BIO008', nome: 'Gama-GT', categoria: 'Bioquímica', metodo: 'Cinético', unidade: 'U/L', preco: 15.00, refs: [
      { sexo: 'M', idade_min: 18, idade_max: 999, valor_min: 8, valor_max: 61 },
      { sexo: 'F', idade_min: 18, idade_max: 999, valor_min: 5, valor_max: 36 }
    ]},
    { id: 13, codigo: 'BIO010', nome: 'Ácido Úrico', categoria: 'Bioquímica', metodo: 'Enzimático', unidade: 'mg/dL', preco: 12.00, refs: [
      { sexo: 'M', idade_min: 18, idade_max: 999, valor_min: 3.5, valor_max: 7.2 },
      { sexo: 'F', idade_min: 18, idade_max: 999, valor_min: 2.6, valor_max: 6.0 }
    ]},
    { id: 14, codigo: 'BIO011', nome: 'Proteína C Reativa (PCR)', categoria: 'Bioquímica', metodo: 'Turbidimetria', unidade: 'mg/L', preco: 20.00, refs: [
      { sexo: 'ambos', idade_min: 0, idade_max: 999, valor_min: 0, valor_max: 5, valor_texto: 'Normal: < 5 mg/L' }
    ]},
    // Lipídios
    { id: 15, codigo: 'LIP001', nome: 'Colesterol Total', categoria: 'Lipídios', metodo: 'Enzimático', unidade: 'mg/dL', preco: 12.00, refs: [
      { sexo: 'ambos', idade_min: 20, idade_max: 999, valor_texto: 'Desejável: <200 | Limítrofe: 200-239 | Alto: ≥240' }
    ]},
    { id: 16, codigo: 'LIP002', nome: 'HDL Colesterol', categoria: 'Lipídios', metodo: 'Enzimático direto', unidade: 'mg/dL', preco: 15.00, refs: [
      { sexo: 'M', idade_min: 20, idade_max: 999, valor_texto: 'Desejável: ≥40 mg/dL' },
      { sexo: 'F', idade_min: 20, idade_max: 999, valor_texto: 'Desejável: ≥50 mg/dL' }
    ]},
    { id: 17, codigo: 'LIP003', nome: 'LDL Colesterol', categoria: 'Lipídios', metodo: 'Cálculo', unidade: 'mg/dL', preco: 15.00, refs: [
      { sexo: 'ambos', idade_min: 20, idade_max: 999, valor_texto: 'Desejável: <100 | Limítrofe: 100-129 | Alto: 130-159' }
    ]},
    { id: 18, codigo: 'LIP004', nome: 'Triglicerídeos', categoria: 'Lipídios', metodo: 'Enzimático', unidade: 'mg/dL', preco: 12.00, refs: [
      { sexo: 'ambos', idade_min: 20, idade_max: 999, valor_texto: 'Desejável: <150 | Alto: ≥150 mg/dL' }
    ]},
    // Endocrinologia
    { id: 19, codigo: 'END001', nome: 'TSH', categoria: 'Endocrinologia', metodo: 'ECLIA', unidade: 'mUI/L', preco: 45.00, refs: [
      { sexo: 'ambos', idade_min: 18, idade_max: 999, valor_min: 0.4, valor_max: 4.0 }
    ]},
    { id: 20, codigo: 'END002', nome: 'T4 Livre', categoria: 'Endocrinologia', metodo: 'ECLIA', unidade: 'ng/dL', preco: 40.00, refs: [
      { sexo: 'ambos', idade_min: 18, idade_max: 999, valor_min: 0.8, valor_max: 1.9 }
    ]},
    { id: 21, codigo: 'END006', nome: 'Vitamina D (25-OH)', categoria: 'Micronutrientes', metodo: 'ECLIA', unidade: 'ng/mL', preco: 70.00, refs: [
      { sexo: 'ambos', idade_min: 0, idade_max: 999, valor_texto: 'Suficiente: 30-100 | Insuficiente: 20-29 | Deficiente: <20' }
    ]},
    { id: 22, codigo: 'END007', nome: 'Ferritina', categoria: 'Micronutrientes', metodo: 'ECLIA', unidade: 'ng/mL', preco: 45.00, refs: [
      { sexo: 'M', idade_min: 18, idade_max: 999, valor_min: 24, valor_max: 336 },
      { sexo: 'F', idade_min: 18, idade_max: 999, valor_min: 11, valor_max: 307 }
    ]},
    // Imunologia
    { id: 23, codigo: 'IMU002', nome: 'Anti-HIV 1 e 2', categoria: 'Imunologia', metodo: 'ELISA 4ª gen', unidade: 'resultado', preco: 35.00, refs: [
      { sexo: 'ambos', idade_min: 0, idade_max: 999, valor_texto: 'Não Reagente (Negativo)' }
    ]},
    { id: 24, codigo: 'IMU003', nome: 'VDRL (Sífilis)', categoria: 'Imunologia', metodo: 'Floculação', unidade: 'resultado', preco: 18.00, refs: [
      { sexo: 'ambos', idade_min: 0, idade_max: 999, valor_texto: 'Não Reagente' }
    ]},
    // Urinálise
    { id: 25, codigo: 'URI001', nome: 'Urina Tipo 1 (EAS)', categoria: 'Urinálise', metodo: 'Tira reativa + micro', unidade: 'múltiplos', preco: 18.00, refs: [
      { sexo: 'ambos', idade_min: 0, idade_max: 999, valor_texto: 'Aspecto: Claro | Densidade: 1005-1030 | pH: 5-8' }
    ]},
    { id: 26, codigo: 'URI002', nome: 'Urocultura', categoria: 'Urinálise', metodo: 'Cultura + Antibiograma', unidade: 'UFC/mL', preco: 45.00, refs: [
      { sexo: 'ambos', idade_min: 0, idade_max: 999, valor_texto: 'Negativo (< 10.000 UFC/mL)' }
    ]}
  ];

  const profissionais = [
    { id: 1, nome: 'Dr. Roberto Almeida', crm: 'CRM-SP 12345', especialidade: 'Clínica Geral', telefone: '(11) 3001-0001', email: 'roberto.almeida@clinica.com' },
    { id: 2, nome: 'Dra. Mariana Santos', crm: 'CRM-SP 67890', especialidade: 'Endocrinologia', telefone: '(11) 3001-0002', email: 'mariana.santos@clinica.com' },
    { id: 3, nome: 'Dr. Paulo Ferreira', crm: 'CRM-SP 11223', especialidade: 'Cardiologia', telefone: '(11) 3001-0003', email: 'paulo.ferreira@clinica.com' }
  ];

  const pacientes = [
    { id: 1, nome: 'João Carlos Silva', cpf_mask: '123.***.***-01', cpf_enc: '12345678901', data_nascimento: '1985-03-15', sexo: 'M', telefone: '(11) 98765-4321', email: 'joao.silva@email.com', cidade: 'São Paulo', uf: 'SP', convenio_id: 2, consentimento_lgpd: 1, data_consentimento: '2026-06-08T15:00:00.000Z' },
    { id: 2, nome: 'Maria Aparecida Souza', cpf_mask: '987.***.***-00', cpf_enc: '98765432100', data_nascimento: '1972-07-22', sexo: 'F', telefone: '(11) 91234-5678', email: 'maria.souza@email.com', cidade: 'São Paulo', uf: 'SP', convenio_id: 3, consentimento_lgpd: 1, data_consentimento: '2026-06-08T15:00:00.000Z' },
    { id: 3, nome: 'Pedro Henrique Lima', cpf_mask: '456.***.***-00', cpf_enc: '45678912300', data_nascimento: '1998-11-08', sexo: 'M', telefone: '(11) 99876-5432', email: 'pedro.lima@email.com', cidade: 'Guarulhos', uf: 'SP', convenio_id: 1, consentimento_lgpd: 1, data_consentimento: '2026-06-08T15:00:00.000Z' }
  ];

  const requisicoes = [
    {
      id: 1,
      numero: 'REQ-20260608-0001',
      paciente_id: 1,
      profissional_id: 1,
      convenio_id: 2,
      urgente: false,
      observacoes: 'Rotina anual.',
      status: 'liberado',
      valor_total: 65.00,
      data_solicitacao: '2026-06-08T14:30:00.000Z',
      data_coleta: '2026-06-08T14:40:00.000Z',
      data_liberacao: '2026-06-08T15:15:00.000Z',
      exames_ids: [1, 5],
      itens: [
        { exame_id: 1, preco: 35.00, resultado: 'Hemoglobina 14.2 g/dL, Leucócitos 7.200/μL, Plaquetas 240.000/μL', interpretacao: 'normal', status: 'concluido', data_resultado: '2026-06-08T15:00:00.000Z' },
        { exame_id: 5, preco: 30.00, resultado: '88', interpretacao: 'normal', status: 'concluido', data_resultado: '2026-06-08T15:00:00.000Z' }
      ]
    },
    {
      id: 2,
      numero: 'REQ-20260608-0002',
      paciente_id: 2,
      profissional_id: 2,
      convenio_id: 3,
      urgente: true,
      observacoes: 'Urgente para retorno à consulta.',
      status: 'liberado',
      valor_total: 83.00,
      data_solicitacao: '2026-06-08T14:45:00.000Z',
      data_coleta: '2026-06-08T14:50:00.000Z',
      data_liberacao: '2026-06-08T15:15:00.000Z',
      exames_ids: [19, 15],
      itens: [
        { exame_id: 19, preco: 45.00, resultado: '5.2', interpretacao: 'alto', status: 'concluido', data_resultado: '2026-06-08T15:10:00.000Z' },
        { exame_id: 15, preco: 38.00, resultado: '245', interpretacao: 'alto', status: 'concluido', data_resultado: '2026-06-08T15:10:00.000Z' }
      ]
    },
    {
      id: 3,
      numero: 'REQ-20260608-0003',
      paciente_id: 3,
      profissional_id: 1,
      convenio_id: 1,
      urgente: false,
      observacoes: '',
      status: 'pendente',
      valor_total: 18.00,
      data_solicitacao: '2026-06-08T14:55:00.000Z',
      data_coleta: null,
      data_liberacao: null,
      exames_ids: [25],
      itens: [
        { exame_id: 25, preco: 18.00, resultado: null, interpretacao: null, status: 'pendente' }
      ]
    }
  ];

  const laudos = [
    {
      id: 1,
      requisicao_id: 1,
      numero_laudo: 'LDO-20260608-00001',
      status: 'assinado',
      pdf_path: '',
      data_assinatura: '2026-06-08T15:15:00.000Z',
      rt_nome: 'Dr. Carlos Silva - Biomédico',
      rt_crbm: 'CRBM-SP 99999'
    },
    {
      id: 2,
      requisicao_id: 2,
      numero_laudo: 'LDO-20260608-00002',
      status: 'assinado',
      pdf_path: '',
      data_assinatura: '2026-06-08T15:15:00.000Z',
      rt_nome: 'Dr. Carlos Silva - Biomédico',
      rt_crbm: 'CRBM-SP 99999'
    }
  ];

  const usuarios = [
    { id: 1, nome: 'Administrador Sistema', email: 'admin@labsystem.com', papel: 'admin', senha: 'Admin@123' },
    { id: 2, nome: 'Dr. Carlos Silva - Biomédico', email: 'biomedico@labsystem.com', papel: 'biomedico', senha: 'Bio@123' },
    { id: 3, nome: 'Ana Paula - Recepção', email: 'recepcao@labsystem.com', papel: 'recepcao', senha: 'Rec@123' }
  ];

  const logs = [
    { id: 1, usuario_nome: 'Administrador Sistema', usuario_papel: 'admin', acao: 'Login', detalhes: 'Login efetuado com sucesso por Administrador Sistema', cpf_consultado: null, data_hora: '2026-06-08T15:00:00.000Z' }
  ];

  return { convenios, categorias, exames, profissionais, pacientes, requisicoes, laudos, usuarios, logs };
}

function getLocalDb() {
  let db = localStorage.getItem('labsystem_db');
  if (!db) {
    const initialized = initLocalDb();
    localStorage.setItem('labsystem_db', JSON.stringify(initialized));
    return initialized;
  }
  try {
    const parsed = JSON.parse(db);
    // Migration: Update SUS name
    if (parsed.convenios) {
      const sus = parsed.convenios.find(c => c.id === 6 && c.codigo === 'SUS');
      if (sus && sus.nome === 'SUS') {
        sus.nome = 'SUS - CISNORP';
        localStorage.setItem('labsystem_db', JSON.stringify(parsed));
      }
    }
    return parsed;
  } catch {
    const initialized = initLocalDb();
    localStorage.setItem('labsystem_db', JSON.stringify(initialized));
    return initialized;
  }
}

function saveLocalDb(db) {
  localStorage.setItem('labsystem_db', JSON.stringify(db));
}

function findReferenceValue(db, examId, sex, age) {
  const exam = db.exames.find(e => e.id === examId);
  if (!exam) return null;
  const ref = (exam.refs || []).find(r => 
    (r.sexo === sex || r.sexo === 'ambos') && 
    (age >= r.idade_min && age <= r.idade_max)
  );
  return ref || (exam.refs && exam.refs[0]) || null;
}

// Dynamic PDF Library loader
async function loadJsPDF() {
  if (window.jspdf) return window.jspdf;
  return new Promise((resolve, reject) => {
    const script1 = document.createElement('script');
    script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script1.onload = () => {
      const script2 = document.createElement('script');
      script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js';
      script2.onload = () => resolve(window.jspdf);
      script2.onerror = reject;
      document.body.appendChild(script2);
    };
    script1.onerror = reject;
    document.body.appendChild(script1);
  });
}

// Client side PDF Generator
async function generateClientSidePdf({ reqData, pac, prof, conv, numero_laudo, rtNome, rtCrbm, db }) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('p', 'mm', 'a4');
  
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  
  // Header: Blue Box
  doc.setFillColor(30, 64, 175); // #1E40AF
  doc.rect(0, 0, width, 42, 'F');
  
  // Lab Name & Logo
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('🔬 LabSystem', 15, 16);
  
  // CNPJ & Address
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(191, 219, 254);
  doc.text('CNPJ: 00.000.000/0001-00  |  CNES: 1234567', 15, 24);
  doc.text('Av. Paulista, 1000 — São Paulo - SP', 15, 30);
  doc.text('Tel: (11) 3001-0001  |  contato@labsystem.com', 15, 36);
  
  // Laudo number & date (right aligned)
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(`LAUDO Nº ${numero_laudo}`, width - 15, 16, { align: 'right' });
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(191, 219, 254);
  doc.text(`Emitido em: ${new Date().toLocaleString('pt-BR')}`, width - 15, 24, { align: 'right' });
  
  // Patient Details Section (Light blue background box)
  doc.setFillColor(239, 246, 255); // #EFF6FF
  doc.setDrawColor(219, 234, 254); // #DBEAFE
  doc.rect(15, 48, width - 30, 42, 'FD');
  
  // Patient details content
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 64, 175);
  doc.text('DADOS DO PACIENTE', 20, 54);
  
  doc.setFontSize(8.5);
  doc.setTextColor(31, 41, 55);
  
  const age = pac ? calcIdadeAnos(pac.data_nascimento) : 30;
  const dataNasc = pac && pac.data_nascimento ? new Date(pac.data_nascimento).toLocaleDateString('pt-BR') : 'N/I';
  const sex = pac ? (pac.sexo === 'M' ? 'Masculino' : pac.sexo === 'F' ? 'Feminino' : 'Outro') : 'N/I';
  
  doc.text('Nome:', 20, 62);
  doc.setFont('Helvetica', 'normal');
  doc.text(pac ? pac.nome : 'N/I', 35, 62);
  
  doc.setFont('Helvetica', 'bold');
  doc.text('CPF:', 115, 62);
  doc.setFont('Helvetica', 'normal');
  doc.text(pac ? pac.cpf_mask : 'N/I', 127, 62);
  
  doc.setFont('Helvetica', 'bold');
  doc.text('Nasc.:', 20, 69);
  doc.setFont('Helvetica', 'normal');
  doc.text(dataNasc, 35, 69);
  
  doc.setFont('Helvetica', 'bold');
  doc.text('Idade:', 65, 69);
  doc.setFont('Helvetica', 'normal');
  doc.text(`${age} anos`, 77, 69);
  
  doc.setFont('Helvetica', 'bold');
  doc.text('Sexo:', 115, 69);
  doc.setFont('Helvetica', 'normal');
  doc.text(sex, 127, 69);
  
  doc.setFont('Helvetica', 'bold');
  doc.text('Médico Sol.:', 20, 76);
  doc.setFont('Helvetica', 'normal');
  doc.text(prof ? prof.nome : 'N/I', 42, 76);
  
  doc.setFont('Helvetica', 'bold');
  doc.text('CRM:', 115, 76);
  doc.setFont('Helvetica', 'normal');
  doc.text(prof ? prof.crm : 'N/I', 127, 76);
  
  doc.setFont('Helvetica', 'bold');
  doc.text('Convênio:', 20, 83);
  doc.setFont('Helvetica', 'normal');
  doc.text(conv ? conv.nome : 'Particular', 40, 83);
  
  doc.setFont('Helvetica', 'bold');
  doc.text('Req.:', 115, 83);
  doc.setFont('Helvetica', 'normal');
  doc.text(reqData.numero, 127, 83);
  
  // Dates box
  doc.setFillColor(249, 250, 251); // #F9FAFB
  doc.rect(15, 92, width - 30, 8, 'F');
  
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  const dataColeta = reqData.data_coleta ? new Date(reqData.data_coleta).toLocaleString('pt-BR') : 'N/I';
  const dataLib = reqData.data_liberacao ? new Date(reqData.data_liberacao).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR');
  doc.text(`Data de Coleta: ${dataColeta}`, 20, 97);
  doc.text(`Data de Liberação: ${dataLib}`, 115, 97);
  
  // Table of results
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 64, 175);
  doc.text('RESULTADOS DOS EXAMES', 15, 110);
  
  const tableData = [];
  const items = reqData.itens || [];
  
  items.forEach(item => {
    const ex = db.exames.find(e => e.id === item.exame_id);
    const exName = ex ? ex.nome : 'N/I';
    const valText = item.resultado || 'Pendente';
    const unit = item.unidade || (ex ? ex.unidade : '');
    const refVal = findReferenceValue(db, item.exame_id, pac ? pac.sexo : 'ambos', age);
    
    let refText = '—';
    if (refVal) {
      if (refVal.valor_texto) refText = refVal.valor_texto;
      else if (refVal.valor_min != null && refVal.valor_max != null) refText = `${refVal.valor_min} - ${refVal.valor_max}`;
    }
    
    let interpText = 'Normal';
    if (item.interpretacao === 'alto') interpText = '↑ Alto';
    else if (item.interpretacao === 'baixo') interpText = '↓ Baixo';
    else if (item.interpretacao === 'critico') interpText = '⚠ Crítico';
    else if (!item.interpretacao) interpText = '—';
    
    tableData.push([
      exName,
      valText,
      unit,
      refText,
      interpText
    ]);
  });
  
  doc.autoTable({
    startY: 114,
    head: [['EXAME', 'RESULTADO', 'UNIDADE', 'VALOR DE REFERÊNCIA', 'STATUS']],
    body: tableData,
    margin: { left: 15, right: 15 },
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [31, 41, 55],
      valign: 'middle'
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55 },
      1: { fontStyle: 'bold', cellWidth: 35 },
      2: { cellWidth: 20 },
      3: { cellWidth: 50 },
      4: { fontStyle: 'bold', cellWidth: 20 }
    },
    didParseCell: function(data) {
      if (data.section === 'body' && data.column.index === 4) {
        const val = data.cell.text[0];
        if (val.includes('Alto')) data.cell.styles.textColor = [220, 38, 38];
        else if (val.includes('Baixo')) data.cell.styles.textColor = [217, 119, 6];
        else if (val.includes('Crítico')) data.cell.styles.textColor = [220, 38, 38];
        else if (val.includes('Normal')) data.cell.styles.textColor = [5, 150, 105];
      }
      if (data.section === 'body' && data.column.index === 1) {
        const statusVal = data.row.cells[4].text[0];
        if (statusVal.includes('Alto') || statusVal.includes('Crítico')) data.cell.styles.textColor = [220, 38, 38];
        else if (statusVal.includes('Baixo')) data.cell.styles.textColor = [217, 119, 6];
        else if (statusVal.includes('Normal')) data.cell.styles.textColor = [5, 150, 105];
      }
    }
  });
  
  let finalY = doc.lastAutoTable.finalY + 15;
  
  if (reqData.observacoes) {
    if (finalY > height - 70) {
      doc.addPage();
      finalY = 20;
    }
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(31, 41, 55);
    doc.text('Observações:', 15, finalY);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(reqData.observacoes, 15, finalY + 5, { maxWidth: width - 30 });
    finalY += 20;
  }
  
  if (finalY > height - 50) {
    doc.addPage();
    finalY = 30;
  }
  
  const sigY = height - 42;
  doc.setDrawColor(209, 213, 219);
  doc.line(width / 2 - 40, sigY, width / 2 + 40, sigY);
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(31, 41, 55);
  doc.text(rtNome, width / 2, sigY + 5, { align: 'center' });
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(`Responsável Técnico  |  ${rtCrbm}`, width / 2, sigY + 9, { align: 'center' });
  doc.text('Biomédico CRM/CRBM', width / 2, sigY + 13, { align: 'center' });
  
  doc.setFillColor(30, 64, 175);
  doc.rect(0, height - 12, width, 12, 'F');
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('LabSystem | Av. Paulista, 1000 — São Paulo - SP | Tel: (11) 3001-0001', width / 2, height - 7, { align: 'center' });
  doc.text(`Este laudo é válido somente com assinatura do responsável técnico | Laudo Nº ${numero_laudo}`, width / 2, height - 3.5, { align: 'center' });
  
  const pdfBlob = doc.output('blob');
  return URL.createObjectURL(pdfBlob);
}

// ==========================================
// GLOBAL FETCH INTERCEPTOR (MOCK API)
// ==========================================

function parseQueryParams(url) {
  const params = {};
  const split = url.split('?');
  if (split.length > 1) {
    const searchParams = new URLSearchParams(split[1]);
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }
  }
  return params;
}

async function mockApiHandler(url, init = {}) {
  const method = (init.method || 'GET').toUpperCase();
  const body = init.body ? JSON.parse(init.body) : null;
  const pathWithQuery = url.replace('/api', '');
  const path = pathWithQuery.split('?')[0];
  const queryParams = parseQueryParams(url);
  
  const db = getLocalDb();
  
  const response = (data, status = 200) => {
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => data
    };
  };
  
  const logAudit = (acao, detalhes, cpf = null) => {
    const user = getUser() || { nome: 'Sistema', papel: 'sistema' };
    db.logs.unshift({
      id: db.logs.length + 1,
      usuario_nome: user.nome,
      usuario_papel: user.papel,
      acao,
      detalhes,
      cpf_consultado: cpf,
      data_hora: new Date().toISOString()
    });
    saveLocalDb(db);
  };

  // --- ROUTES IMPLEMENTATION ---

  // Auth Login
  if (path === '/auth/login' && method === 'POST') {
    const { email, senha } = body;
    const user = db.usuarios.find(u => u.email === email);
    if (!user) return response({ error: 'Usuário não cadastrado' }, 404);
    if (user.senha !== senha) return response({ error: 'Senha incorreta' }, 401);
    
    const token = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
    logAudit('Login', `Login efetuado com sucesso por ${user.nome}`);
    return response({ token, usuario: { id: user.id, nome: user.nome, email: user.email, papel: user.papel } });
  }

  // Auth Logout
  if (path === '/auth/logout' && method === 'POST') {
    logAudit('Logout', 'Sessão encerrada pelo usuário');
    return response({ status: 'ok' });
  }

  // Dashboard
  if (path === '/dashboard' && method === 'GET') {
    const totalPacientes = db.pacientes.length;
    const novosMes = db.pacientes.filter(p => p.data_consentimento && p.data_consentimento.includes('-06-')).length; // June
    
    const hojeStr = new Date().toISOString().split('T')[0];
    const reqsHoje = db.requisicoes.filter(r => r.data_solicitacao && r.data_solicitacao.startsWith(hojeStr));
    
    const pendentes = db.requisicoes.filter(r => r.status === 'pendente').length;
    const emColeta = db.requisicoes.filter(r => r.status === 'coleta').length;
    const emAnalise = db.requisicoes.filter(r => r.status === 'analise' || r.status === 'triagem').length;
    const liberados = db.requisicoes.filter(r => r.status === 'liberado').length;
    const urgentes = db.requisicoes.filter(r => r.urgente && r.status !== 'liberado' && r.status !== 'cancelado').length;
    
    const faturamentoHoje = reqsHoje.reduce((sum, r) => sum + (r.valor_total || 0), 0);
    const faturamentoMes = db.requisicoes.reduce((sum, r) => sum + (r.valor_total || 0), 0);
    
    // Last 7 days chart
    const faturamento7dias = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const totalDay = db.requisicoes
        .filter(r => r.data_solicitacao && r.data_solicitacao.startsWith(dayStr))
        .reduce((sum, r) => sum + (r.valor_total || 0), 0);
      faturamento7dias.push({ dia: dayStr, total: totalDay || 0 });
    }
    
    // Status distribution
    const porStatusSemana = ['pendente', 'coleta', 'triagem', 'analise', 'liberado', 'cancelado'].map(st => ({
      status: st,
      count: db.requisicoes.filter(r => r.status === st).length
    }));
    
    // Popular exams
    const examCounts = {};
    db.requisicoes.forEach(r => {
      (r.exames_ids || []).forEach(eid => {
        const ex = db.exames.find(e => e.id === eid);
        if (ex) examCounts[ex.nome] = (examCounts[ex.nome] || 0) + 1;
      });
    });
    const examesMaisSolicitados = Object.keys(examCounts).map(nome => ({
      nome,
      total: examCounts[nome]
    })).sort((a, b) => b.total - a.total).slice(0, 5);
    
    // Recent requisitions
    const ultimasRequisicoes = db.requisicoes.map(r => {
      const pac = db.pacientes.find(p => p.id === r.paciente_id);
      return {
        id: r.id,
        numero: r.numero,
        paciente_nome: pac ? pac.nome : 'N/I',
        status: r.status,
        urgente: r.urgente,
        data_solicitacao: r.data_solicitacao
      };
    }).sort((a, b) => new Date(b.data_solicitacao) - new Date(a.data_solicitacao)).slice(0, 5);
    
    return response({
      hoje: { pendentes, em_coleta: emColeta, em_analise: emAnalise, liberados, urgentes, faturamento: faturamentoHoje },
      mes: { faturamento: faturamentoMes },
      pacientes: { total: totalPacientes, novos_mes: novosMes },
      faturamento_7dias: faturamento7dias,
      por_status_semana: porStatusSemana,
      exames_mais_solicitados: examesMaisSolicitados,
      ultimas_requisicoes: ultimasRequisicoes
    });
  }

  // Convenios
  if (path === '/convenios' && method === 'GET') {
    return response(db.convenios);
  }
  if (path.startsWith('/convenios/') && method === 'GET') {
    const id = parseInt(path.split('/')[2]);
    const item = db.convenios.find(c => c.id === id);
    if (!item) return response({ error: 'Não encontrado' }, 404);
    return response(item);
  }
  if (path === '/convenios' && method === 'POST') {
    const id = db.convenios.length ? Math.max(...db.convenios.map(c => c.id)) + 1 : 1;
    const newItem = { id, ...body };
    db.convenios.push(newItem);
    saveLocalDb(db);
    logAudit('Criação de Convênio', `Cadastrou o convênio ${newItem.nome}`);
    return response(newItem);
  }
  if (path.startsWith('/convenios/') && method === 'PUT') {
    const id = parseInt(path.split('/')[2]);
    const idx = db.convenios.findIndex(c => c.id === id);
    if (idx === -1) return response({ error: 'Não encontrado' }, 404);
    db.convenios[idx] = { ...db.convenios[idx], ...body };
    saveLocalDb(db);
    return response(db.convenios[idx]);
  }

  // Categorias
  if (path === '/exames/categorias' && method === 'GET') {
    return response(db.categorias);
  }

  // Exames
  if (path === '/exames' && method === 'GET') {
    let list = db.exames;
    if (queryParams.search) {
      const q = queryParams.search.toLowerCase();
      list = list.filter(e => e.nome.toLowerCase().includes(q) || e.codigo.toLowerCase().includes(q));
    }
    if (queryParams.categoria) {
      list = list.filter(e => e.categoria === queryParams.categoria);
    }
    return response(list);
  }

  if (path.startsWith('/exames/') && method === 'GET') {
    const id = parseInt(path.split('/')[2]);
    const exam = db.exames.find(e => e.id === id);
    if (!exam) return response({ error: 'Exame não encontrado' }, 404);
    return response(exam);
  }

  if (path === '/exames' && method === 'POST') {
    const id = db.exames.length ? Math.max(...db.exames.map(e => e.id)) + 1 : 1;
    const newExam = { id, ...body, refs: body.refs || [] };
    db.exames.push(newExam);
    saveLocalDb(db);
    logAudit('Criação de Exame', `Cadastrou o exame ${newExam.nome} (${newExam.codigo})`);
    return response(newExam);
  }

  if (path.startsWith('/exames/') && method === 'PUT') {
    const id = parseInt(path.split('/')[2]);
    const idx = db.exames.findIndex(e => e.id === id);
    if (idx === -1) return response({ error: 'Exame não encontrado' }, 404);
    db.exames[idx] = { ...db.exames[idx], ...body };
    saveLocalDb(db);
    logAudit('Atualização de Exame', `Atualizou dados do exame ${db.exames[idx].nome}`);
    return response(db.exames[idx]);
  }

  // Profissionais
  if (path === '/profissionais' && method === 'GET') {
    return response(db.profissionais);
  }
  if (path.startsWith('/profissionais/') && method === 'GET') {
    const id = parseInt(path.split('/')[2]);
    const item = db.profissionais.find(p => p.id === id);
    if (!item) return response({ error: 'Não encontrado' }, 404);
    return response(item);
  }
  if (path === '/profissionais' && method === 'POST') {
    const id = db.profissionais.length ? Math.max(...db.profissionais.map(p => p.id)) + 1 : 1;
    const newItem = { id, ...body };
    db.profissionais.push(newItem);
    saveLocalDb(db);
    logAudit('Criação de Profissional', `Cadastrou ${newItem.nome}`);
    return response(newItem);
  }
  if (path.startsWith('/profissionais/') && method === 'PUT') {
    const id = parseInt(path.split('/')[2]);
    const idx = db.profissionais.findIndex(p => p.id === id);
    if (idx === -1) return response({ error: 'Não encontrado' }, 404);
    db.profissionais[idx] = { ...db.profissionais[idx], ...body };
    saveLocalDb(db);
    return response(db.profissionais[idx]);
  }

  // Pacientes
  if (path === '/pacientes' && method === 'GET') {
    let list = db.pacientes;
    if (queryParams.search) {
      const q = queryParams.search.toLowerCase();
      list = list.filter(p => p.nome.toLowerCase().includes(q) || p.cpf_mask.includes(q));
      logAudit('Consulta de Pacientes', `Pesquisou por "${queryParams.search}" na listagem geral.`);
    } else {
      logAudit('Consulta Geral', 'Acessou a listagem geral de pacientes.');
    }
    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 15;
    const start = (page - 1) * limit;
    const paginated = list.slice(start, start + limit);
    return response({ data: paginated, total: list.length });
  }

  if (path.startsWith('/pacientes/') && path.endsWith('/historico') && method === 'GET') {
    const id = parseInt(path.split('/')[2]);
    const pac = db.pacientes.find(p => p.id === id);
    if (!pac) return response({ error: 'Paciente não encontrado' }, 404);
    const reqs = db.requisicoes.filter(r => r.paciente_id === id).map(r => {
      const prof = db.profissionais.find(p => p.id === r.profissional_id);
      const conv = db.convenios.find(c => c.id === r.convenio_id);
      return {
        ...r,
        profissional_nome: prof ? prof.nome : 'N/I',
        convenio_nome: conv ? conv.nome : 'Particular'
      };
    });
    return response(reqs);
  }

  if (path.startsWith('/pacientes/') && method === 'GET') {
    const id = parseInt(path.split('/')[2]);
    const pac = db.pacientes.find(p => p.id === id);
    if (!pac) return response({ error: 'Paciente não encontrado' }, 404);
    logAudit('Acesso a Prontuário', `Acessou os dados detalhados do paciente ${pac.nome}.`, pac.cpf_mask);
    return response(pac);
  }

  if (path === '/pacientes' && method === 'POST') {
    const id = db.pacientes.length ? Math.max(...db.pacientes.map(p => p.id)) + 1 : 1;
    const newPac = {
      id,
      ...body,
      cpf_mask: maskCPF(body.cpf),
      cpf_enc: body.cpf,
      consentimento_lgpd: 1,
      data_consentimento: new Date().toISOString(),
      criado_em: new Date().toISOString()
    };
    db.pacientes.push(newPac);
    saveLocalDb(db);
    logAudit('Criação de Paciente', `Cadastrou o paciente ${newPac.nome}.`, newPac.cpf_mask);
    return response(newPac);
  }

  if (path.startsWith('/pacientes/') && method === 'PUT') {
    const id = parseInt(path.split('/')[2]);
    const idx = db.pacientes.findIndex(p => p.id === id);
    if (idx === -1) return response({ error: 'Paciente não encontrado' }, 404);
    
    const pac = db.pacientes[idx];
    db.pacientes[idx] = {
      ...pac,
      ...body,
      cpf_mask: body.cpf ? maskCPF(body.cpf) : pac.cpf_mask,
      cpf_enc: body.cpf ? body.cpf : pac.cpf_enc,
      atualizado_em: new Date().toISOString()
    };
    saveLocalDb(db);
    logAudit('Atualização de Paciente', `Atualizou os dados cadastrais do paciente ${pac.nome}.`, pac.cpf_mask);
    return response(db.pacientes[idx]);
  }

  if (path.startsWith('/pacientes/') && path.endsWith('/anonimizar') && method === 'POST') {
    const id = parseInt(path.split('/')[2]);
    const idx = db.pacientes.findIndex(p => p.id === id);
    if (idx === -1) return response({ error: 'Paciente não encontrado' }, 404);
    
    const pac = db.pacientes[idx];
    const originalName = pac.nome;
    db.pacientes[idx] = {
      ...pac,
      nome: `PACIENTE ANÔNIMO - ID ${pac.id}`,
      cpf_mask: '***.***.***-**',
      cpf_enc: '',
      telefone: '(00) 90000-0000',
      email: 'anonimo@email.com',
      cidade: 'Anônima',
      uf: 'AN',
      consentimento_lgpd: 0,
      data_consentimento: null,
      anonimizado: true,
      data_anonimizacao: new Date().toISOString()
    };
    saveLocalDb(db);
    logAudit('Anonimização de Dados', `Anonimizou permanentemente os dados do paciente ${originalName}.`);
    return response({ message: 'Paciente anonimizado com sucesso' });
  }

  // Requisicoes
  if (path === '/requisicoes' && method === 'GET') {
    let list = db.requisicoes;
    if (queryParams.status) {
      list = list.filter(r => r.status === queryParams.status);
    }
    let mapped = list.map(r => {
      const pac = db.pacientes.find(p => p.id === r.paciente_id);
      const prof = db.profissionais.find(p => p.id === r.profissional_id);
      const conv = db.convenios.find(c => c.id === r.convenio_id);
      return {
        ...r,
        paciente_nome: pac ? pac.nome : 'N/I',
        profissional_nome: prof ? prof.nome : 'N/I',
        convenio_nome: conv ? conv.nome : 'Particular'
      };
    });
    if (queryParams.search) {
      const q = queryParams.search.toLowerCase();
      mapped = mapped.filter(r => r.paciente_nome.toLowerCase().includes(q) || r.numero.toLowerCase().includes(q));
    }
    return response(mapped);
  }

  if (path.startsWith('/requisicoes/') && method === 'GET') {
    const id = parseInt(path.split('/')[2]);
    const req = db.requisicoes.find(r => r.id === id);
    if (!req) return response({ error: 'Requisição não encontrada' }, 404);
    
    const pac = db.pacientes.find(p => p.id === req.paciente_id);
    const prof = db.profissionais.find(p => p.id === req.profissional_id);
    const conv = db.convenios.find(c => c.id === req.convenio_id);
    
    const items = (req.itens || []).map(item => {
      const ex = db.exames.find(e => e.id === item.exame_id);
      return {
        ...item,
        exame_nome: ex ? ex.nome : 'N/I',
        codigo: ex ? ex.codigo : 'N/I',
        metodo: ex ? ex.metodo : 'N/I',
        exame_unidade: ex ? ex.unidade : 'N/I'
      };
    });

    const itemsWithRef = items.map(item => {
      const age = pac ? calcIdadeAnos(pac.data_nascimento) : 30;
      const sex = pac ? pac.sexo : 'ambos';
      const ref = findReferenceValue(db, item.exame_id, sex, age);
      return { ...item, referencia: ref };
    });

    return response({
      ...req,
      paciente_nome: pac ? pac.nome : 'N/I',
      paciente_sexo: pac ? pac.sexo : 'ambos',
      paciente_data_nasc: pac ? pac.data_nascimento : null,
      cpf_mask: pac ? pac.cpf_mask : '',
      profissional_nome: prof ? prof.nome : 'N/I',
      convenio_nome: conv ? conv.nome : 'Particular',
      itens: itemsWithRef
    });
  }

  if (path === '/requisicoes' && method === 'POST') {
    const id = db.requisicoes.length ? Math.max(...db.requisicoes.map(r => r.id)) + 1 : 1;
    const today = new Date();
    const dateStr = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
    const count = db.requisicoes.length;
    const numero = `REQ-${dateStr}-${String(count + 1).padStart(4, '0')}`;
    
    const examesIds = body.exames_ids || [];
    let valorTotal = 0;
    
    const itens = examesIds.map(eid => {
      const ex = db.exames.find(e => e.id === eid);
      const preco = ex ? ex.preco : 0;
      valorTotal += preco;
      return {
        exame_id: eid,
        preco,
        resultado: null,
        unidade: ex ? ex.unidade : '',
        interpretacao: null,
        status: 'pendente'
      };
    });

    const newReq = {
      id,
      numero,
      paciente_id: body.paciente_id,
      profissional_id: body.profissional_id,
      convenio_id: body.convenio_id,
      urgente: body.urgente || false,
      observacoes: body.observacoes || '',
      status: 'pendente',
      valor_total: valorTotal,
      data_solicitacao: new Date().toISOString(),
      data_coleta: null,
      data_liberacao: null,
      exames_ids: examesIds,
      itens
    };

    db.requisicoes.push(newReq);
    saveLocalDb(db);
    
    const pac = db.pacientes.find(p => p.id === body.paciente_id);
    logAudit('Criação de Requisição', `Criou a requisição ${numero} para o paciente ${pac ? pac.nome : 'N/I'}.`, pac ? pac.cpf_mask : null);
    return response(newReq);
  }

  if (path.startsWith('/requisicoes/') && path.endsWith('/status') && method === 'PUT') {
    const id = parseInt(path.split('/')[2]);
    const idx = db.requisicoes.findIndex(r => r.id === id);
    if (idx === -1) return response({ error: 'Requisição não encontrada' }, 404);
    
    const req = db.requisicoes[idx];
    const originalStatus = req.status;
    const novoStatus = body.status;
    
    req.status = novoStatus;
    if (novoStatus === 'coleta' && !req.data_coleta) {
      req.data_coleta = new Date().toISOString();
    }
    
    req.itens.forEach(item => {
      if (novoStatus === 'cancelado') item.status = 'cancelado';
      else if (novoStatus === 'coleta') item.status = 'coletado';
      else if (novoStatus === 'analise') item.status = 'analise';
    });
    
    db.requisicoes[idx] = req;
    saveLocalDb(db);
    
    const pac = db.pacientes.find(p => p.id === req.paciente_id);
    logAudit('Alteração de Status', `Alterou o status da requisição ${req.numero} de "${originalStatus}" para "${novoStatus}".`, pac ? pac.cpf_mask : null);
    return response(req);
  }

  if (path.startsWith('/requisicoes/') && path.endsWith('/resultados') && method === 'POST') {
    const id = parseInt(path.split('/')[2]);
    const idx = db.requisicoes.findIndex(r => r.id === id);
    if (idx === -1) return response({ error: 'Requisição não encontrada' }, 404);
    
    const req = db.requisicoes[idx];
    const resultados = body.resultados || {};
    
    req.itens.forEach(item => {
      const res = resultados[item.exame_id];
      if (res) {
        item.resultado = res.resultado;
        item.interpretacao = res.interpretacao;
        item.status = 'concluido';
        item.data_resultado = new Date().toISOString();
      }
    });
    
    req.status = 'analise';
    db.requisicoes[idx] = req;
    saveLocalDb(db);
    
    const pac = db.pacientes.find(p => p.id === req.paciente_id);
    logAudit('Inclusão de Resultados', `Inseriu os resultados dos exames da requisição ${req.numero}.`, pac ? pac.cpf_mask : null);
    return response(req);
  }

  // Laudos
  if (path === '/laudos' && method === 'GET') {
    const list = db.laudos.map(l => {
      const req = db.requisicoes.find(r => r.id === l.requisicao_id);
      const pac = req ? db.pacientes.find(p => p.id === req.paciente_id) : null;
      return {
        ...l,
        req_numero: req ? req.numero : 'N/I',
        paciente_nome: pac ? pac.nome : 'N/I'
      };
    });
    return response(list);
  }

  if (path.startsWith('/laudos/gerar/') && method === 'POST') {
    const reqId = parseInt(path.split('/')[3]);
    const reqData = db.requisicoes.find(r => r.id === reqId);
    if (!reqData) return response({ error: 'Requisição não encontrada' }, 404);
    
    const pac = db.pacientes.find(p => p.id === reqData.paciente_id);
    const prof = db.profissionais.find(p => p.id === reqData.profissional_id);
    const conv = db.convenios.find(c => c.id === reqData.convenio_id);
    
    const user = getUser() || { nome: 'Dr. Carlos Silva - Biomédico', papel: 'biomedico' };
    const rtNome = user.nome;
    const rtCrbm = user.papel === 'biomedico' ? 'CRBM-SP 99999' : 'CRBM-SP 12345';
    
    let laudo = db.laudos.find(l => l.requisicao_id === reqId);
    const today = new Date();
    const dateStr = `${today.getFullYear()}${String(today.getMonth()+1).padStart(2,'0')}${String(today.getDate()).padStart(2,'0')}`;
    const count = db.laudos.length;
    const numero_laudo = laudo ? laudo.numero_laudo : `LDO-${dateStr}-${String(count + 1).padStart(5, '0')}`;
    
    await loadJsPDF();
    const pdfBlobUrl = await generateClientSidePdf({ reqData, pac, prof, conv, numero_laudo, rtNome, rtCrbm, db });
    
    if (laudo) {
      laudo.status = 'assinado';
      laudo.pdf_path = pdfBlobUrl;
      laudo.data_assinatura = new Date().toISOString();
      laudo.rt_nome = rtNome;
      laudo.rt_crbm = rtCrbm;
    } else {
      laudo = {
        id: db.laudos.length + 1,
        requisicao_id: reqId,
        numero_laudo,
        status: 'assinado',
        pdf_path: pdfBlobUrl,
        data_assinatura: new Date().toISOString(),
        rt_nome: rtNome,
        rt_crbm: rtCrbm
      };
      db.laudos.push(laudo);
    }
    
    const reqIdx = db.requisicoes.findIndex(r => r.id === reqId);
    if (reqIdx !== -1) {
      db.requisicoes[reqIdx].status = 'liberado';
      db.requisicoes[reqIdx].data_liberacao = new Date().toISOString();
    }
    
    saveLocalDb(db);
    logAudit('Emissão de Laudo', `Gerou e assinou o laudo ${numero_laudo} para a requisição ${reqData.numero}.`, pac ? pac.cpf_mask : null);
    
    return response({ message: 'Laudo gerado com sucesso', numero_laudo, pdf_url: pdfBlobUrl });
  }

  // Relatórios Faturamento
  if (path === '/relatorios/faturamento' && method === 'GET') {
    const ini = queryParams.data_inicio;
    const fim = queryParams.data_fim;
    
    const reqsInRange = db.requisicoes.filter(r => {
      const d = r.data_solicitacao.split('T')[0];
      return d >= ini && d <= fim && r.status !== 'cancelado';
    });
    
    const totalVal = reqsInRange.reduce((sum, r) => sum + (r.valor_total || 0), 0);
    const totalCount = reqsInRange.length;
    
    const days = {};
    reqsInRange.forEach(r => {
      const d = r.data_solicitacao.split('T')[0];
      days[d] = (days[d] || 0) + (r.valor_total || 0);
    });
    const porDia = Object.keys(days).sort().map(data => ({ data, total: days[data] }));
    
    const convs = {};
    reqsInRange.forEach(r => {
      const cname = db.convenios.find(c => c.id === r.convenio_id)?.nome || 'Particular';
      convs[cname] = (convs[cname] || 0) + (r.valor_total || 0);
    });
    const porConvenio = Object.keys(convs).map(convenio => ({ convenio, total: convs[convenio] }));
    
    const examesFatMap = {};
    reqsInRange.forEach(r => {
      (r.exames_ids || []).forEach(eid => {
        const ex = db.exames.find(e => e.id === eid);
        if (ex) {
          if (!examesFatMap[ex.nome]) examesFatMap[ex.nome] = { quantidade: 0, total: 0 };
          examesFatMap[ex.nome].quantidade += 1;
          examesFatMap[ex.nome].total += ex.preco;
        }
      });
    });
    const examesFaturados = Object.keys(examesFatMap).map(nome => ({
      nome,
      quantidade: examesFatMap[nome].quantidade,
      total: examesFatMap[nome].total
    })).sort((a,b) => b.total - a.total);
    
    return response({
      total: { total: totalVal, total_requisicoes: totalCount },
      por_dia: porDia,
      por_convenio: porConvenio,
      exames_faturados: examesFaturados
    });
  }

  // Relatórios Exames
  if (path === '/relatorios/exames' && method === 'GET') {
    const ini = queryParams.data_inicio;
    const fim = queryParams.data_fim;
    
    const reqsInRange = db.requisicoes.filter(r => {
      const d = r.data_solicitacao.split('T')[0];
      return d >= ini && d <= fim;
    });
    
    const statusCounts = {};
    reqsInRange.forEach(r => {
      statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
    });
    const resumo = Object.keys(statusCounts).map(status => ({ status, total: statusCounts[status] }));
    
    const requisicoesMapped = reqsInRange.map(r => {
      const pac = db.pacientes.find(p => p.id === r.paciente_id);
      const prof = db.profissionais.find(p => p.id === r.profissional_id);
      return {
        numero: r.numero,
        paciente_nome: pac ? pac.nome : 'N/I',
        data_solicitacao: r.data_solicitacao,
        total_exames: r.itens ? r.itens.length : r.exames_ids.length,
        profissional_nome: prof ? prof.nome : 'N/I',
        status: r.status
      };
    });
    
    return response({ resumo, requisicoes: requisicoesMapped });
  }

  // Relatórios Logs LGPD
  if (path === '/relatorios/logs' && method === 'GET') {
    const ini = queryParams.data_inicio;
    const fim = queryParams.data_fim;
    
    let list = db.logs;
    if (ini && fim) {
      list = list.filter(l => {
        const d = l.data_hora.split('T')[0];
        return d >= ini && d <= fim;
      });
    }
    
    const mapped = list.map(l => ({
      criado_em: l.data_hora,
      usuario_nome: l.usuario_nome,
      acao: l.acao,
      recurso: l.detalhes + (l.cpf_consultado ? ` (CPF: ${l.cpf_consultado})` : ''),
      recurso_id: null,
      ip: '127.0.0.1'
    }));
    return response(mapped);
  }

  // Usuarios
  if (path === '/usuarios' && method === 'GET') {
    const list = db.usuarios.map(u => ({ id: u.id, nome: u.nome, email: u.email, papel: u.papel }));
    return response(list);
  }

  if (path === '/usuarios' && method === 'POST') {
    const id = db.usuarios.length ? Math.max(...db.usuarios.map(u => u.id)) + 1 : 1;
    const newUser = { id, nome: body.nome, email: body.email, papel: body.papel, senha: body.senha || 'Password@123' };
    db.usuarios.push(newUser);
    saveLocalDb(db);
    logAudit('Criação de Usuário', `Cadastrou o usuário ${newUser.nome} com papel ${newUser.papel}`);
    return response({ id: newUser.id, nome: newUser.nome, email: newUser.email, papel: newUser.papel });
  }

  if (path.startsWith('/usuarios/') && method === 'PUT') {
    const id = parseInt(path.split('/')[2]);
    const idx = db.usuarios.findIndex(u => u.id === id);
    if (idx === -1) return response({ error: 'Usuário não encontrado' }, 404);
    
    const user = db.usuarios[idx];
    db.usuarios[idx] = {
      ...user,
      nome: body.nome || user.nome,
      email: body.email || user.email,
      papel: body.papel || user.papel,
      senha: body.senha ? body.senha : user.senha
    };
    saveLocalDb(db);
    logAudit('Atualização de Usuário', `Atualizou o perfil do usuário ${user.nome}`);
    return response({ id: db.usuarios[idx].id, nome: db.usuarios[idx].nome, email: db.usuarios[idx].email, papel: db.usuarios[idx].papel });
  }

  if (path.startsWith('/usuarios/') && method === 'DELETE') {
    const id = parseInt(path.split('/')[2]);
    const idx = db.usuarios.findIndex(u => u.id === id);
    if (idx === -1) return response({ error: 'Usuário não encontrado' }, 404);
    
    const user = db.usuarios[idx];
    db.usuarios.splice(idx, 1);
    saveLocalDb(db);
    logAudit('Exclusão de Usuário', `Removeu o usuário ${user.nome}`);
    return response({ message: 'Usuário excluído com sucesso' });
  }

  return response({ error: 'Endpoint ou método não suportado no ambiente local' }, 404);
}

// Global fetch override to intercept all /api calls
const originalFetch = window.fetch;
window.fetch = async function (input, init) {
  const url = typeof input === 'string' ? input : input.url;
  if (url.startsWith('/api') || url.includes('/api/')) {
    try {
      // Small simulated latency for natural look & feel
      await new Promise(resolve => setTimeout(resolve, 300));
      return await mockApiHandler(url, init);
    } catch (err) {
      console.error('Mock API Error:', err);
      return {
        ok: false,
        status: 500,
        json: async () => ({ error: err.message || 'Erro interno do servidor mock' })
      };
    }
  }
  return originalFetch.apply(this, arguments);
};

// ==========================================
// STANDARD AUTH UTILITIES (INTERCEPTED PATHS)
// ==========================================

function getToken() { return localStorage.getItem('lab_token'); }
function getUser() { 
  try { return JSON.parse(localStorage.getItem('lab_usuario')); } 
  catch { return null; }
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

function logout() {
  fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getToken()}` }
  }).finally(() => {
    localStorage.removeItem('lab_token');
    localStorage.removeItem('lab_usuario');
    window.location.href = 'index.html';
  });
}

async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (response.status === 401) {
    localStorage.removeItem('lab_token');
    localStorage.removeItem('lab_usuario');
    window.location.href = 'index.html';
    throw new Error('Sessão expirada');
  }

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Erro na requisição');
  return data;
}

// Toast notifications
let toastContainer;

function initToasts() {
  toastContainer = document.createElement('div');
  toastContainer.className = 'toast-container';
  document.body.appendChild(toastContainer);
}

function showToast(message, type = 'info', duration = 4000) {
  if (!toastContainer) initToasts();
  
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Format utilities
function formatDate(dateStr) {
  if (!dateStr) return 'N/I';
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

function formatDateTime(dateStr) {
  if (!dateStr) return 'N/I';
  return new Date(dateStr).toLocaleString('pt-BR');
}

function formatCurrency(val) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
}

function formatStatus(status) {
  const map = {
    pendente: { label: 'Pendente', class: 'status-pendente', icon: '⏳' },
    coleta: { label: 'Em Coleta', class: 'status-coleta', icon: '💉' },
    triagem: { label: 'Triagem', class: 'status-triagem', icon: '🔍' },
    analise: { label: 'Em Análise', class: 'status-analise', icon: '🧪' },
    liberado: { label: 'Liberado', class: 'status-liberado', icon: '✅' },
    cancelado: { label: 'Cancelado', class: 'status-cancelado', icon: '❌' }
  };
  const s = map[status] || { label: status, class: 'badge-gray', icon: '❓' };
  return `<span class="badge ${s.class}">${s.icon} ${s.label}</span>`;
}

function formatPapel(papel) {
  const map = {
    admin: { label: 'Administrador', class: 'badge-danger', icon: '👑' },
    biomedico: { label: 'Biomédico', class: 'badge-primary', icon: '🔬' },
    recepcao: { label: 'Recepção', class: 'badge-accent', icon: '📋' }
  };
  const r = map[papel] || { label: papel, class: 'badge-gray', icon: '👤' };
  return `<span class="badge ${r.class}">${r.icon} ${r.label}</span>`;
}

function calcIdade(dataNasc) {
  if (!dataNasc) return '';
  return `${calcIdadeAnos(dataNasc)} anos`;
}

function formatInterpretacao(interp) {
  if (!interp) return '';
  const map = {
    normal: '<span class="result-normal">✓ Normal</span>',
    alto: '<span class="result-alto">↑ Alto</span>',
    baixo: '<span class="result-baixo">↓ Baixo</span>',
    critico: '<span class="result-critico">⚠ Crítico</span>'
  };
  return map[interp] || interp;
}

// Sidebar navigation init
function initSidebar(activePage) {
  const user = getUser();
  if (!user) { requireAuth(); return; }

  const userName = document.getElementById('userName');
  const userRole = document.getElementById('userRole');
  const userAvatar = document.getElementById('userAvatar');
  
  if (userName) userName.textContent = user.nome.split(' ').slice(0, 2).join(' ');
  if (userRole) {
    const roles = { admin: 'Administrador', biomedico: 'Biomédico', recepcao: 'Recepção' };
    userRole.textContent = roles[user.papel] || user.papel;
  }
  if (userAvatar) userAvatar.textContent = user.nome.charAt(0).toUpperCase();

  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.classList.toggle('active', item.dataset.page === activePage);
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      if (page) window.location.href = `${page}.html`;
    });
  });

  document.querySelectorAll('[data-role]').forEach(el => {
    const roles = el.dataset.role.split(',');
    if (!roles.includes(user.papel)) el.style.display = 'none';
  });

  const topbarUser = document.getElementById('topbarUser');
  if (topbarUser) topbarUser.textContent = user.nome.split(' ')[0];

  const timeEl = document.getElementById('topbarTime');
  if (timeEl) {
    const updateTime = () => {
      timeEl.textContent = new Date().toLocaleString('pt-BR', { 
        weekday: 'short', day: '2-digit', month: '2-digit', 
        hour: '2-digit', minute: '2-digit'
      });
    };
    updateTime();
    setInterval(updateTime, 30000);
  }
}

// Loading overlay
function showLoading() {
  let overlay = document.getElementById('loadingOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = '<div class="spinner-lg"></div><span style="color:var(--text-secondary);font-size:0.875rem;">Carregando...</span>';
    document.body.appendChild(overlay);
  }
  overlay.style.display = 'flex';
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) overlay.style.display = 'none';
}

// Modal helpers
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) { modal.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.style.display = 'none';
    document.body.style.overflow = '';
  }
});

function confirmAction(message) {
  return new Promise(resolve => {
    resolve(window.confirm(message));
  });
}

function debounce(fn, delay = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}
