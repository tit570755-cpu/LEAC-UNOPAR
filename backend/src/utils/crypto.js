const CryptoJS = require('crypto-js');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'labsystem_key_32_chars_exactly!!';

function encrypt(text) {
  if (!text) return null;
  return CryptoJS.AES.encrypt(text.toString(), ENCRYPTION_KEY).toString();
}

function decrypt(ciphertext) {
  if (!ciphertext) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return null;
  }
}

function maskCPF(cpf) {
  if (!cpf) return '';
  const clean = cpf.replace(/\D/g, '');
  return `***.${clean.slice(3, 6)}.${clean.slice(6, 9)}-**`;
}

function formatCPF(cpf) {
  if (!cpf) return '';
  const clean = cpf.replace(/\D/g, '');
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`;
}

function anonymizeData(data) {
  return {
    ...data,
    nome: 'ANONIMIZADO',
    cpf_enc: null,
    cpf_mask: '***.***.***-**',
    telefone: null,
    email: null,
    logradouro: null,
    numero: null,
    complemento: null,
    bairro: null,
    cep: null,
    observacoes: null
  };
}

module.exports = { encrypt, decrypt, maskCPF, formatCPF, anonymizeData };
