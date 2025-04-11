// Armazenamento persistente usando arquivo JSON
const fs = require('fs');
const path = require('path');

// Arquivo para armazenar os dados
const STORAGE_FILE = path.join(__dirname, 'data/storage.json');

// Inicializar formDataStorage carregando do arquivo se existir
let formDataStorage = {};

try {
  if (fs.existsSync(STORAGE_FILE)) {
    const data = fs.readFileSync(STORAGE_FILE, 'utf8');
    formDataStorage = JSON.parse(data);
    console.log(`[STORAGE] Carregados ${Object.keys(formDataStorage).length} registros do arquivo`);
  } else {
    console.log('[STORAGE] Arquivo de armazenamento não encontrado. Criando novo.');
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(formDataStorage), 'utf8');
  }
} catch (error) {
  console.error('[STORAGE] Erro ao carregar armazenamento:', error);
}

// Função para salvar os dados no arquivo
const saveStorage = () => {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(formDataStorage), 'utf8');
    console.log(`[STORAGE] Dados salvos com sucesso (${Object.keys(formDataStorage).length} registros)`);
  } catch (error) {
    console.error('[STORAGE] Erro ao salvar dados:', error);
  }
};

module.exports = {
  formDataStorage,
  saveStorage
};