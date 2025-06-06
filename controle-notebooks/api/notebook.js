import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set, update } from 'firebase/database';

const firebaseConfig = {
  // SUBSTITUA pelas suas configurações reais do Firebase
  apiKey: "sua-api-key-aqui",
  authDomain: "controle-notebooks.firebaseapp.com",
  databaseURL: "https://controle-notebooks-default-rtdb.firebaseio.com/",
  projectId: "controle-notebooks",
  storageBucket: "controle-notebooks.appspot.com",
  messagingSenderId: "123456789",
  appId: "sua-app-id"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Função para inicializar dados padrão
async function initializeDefaultData() {
  try {
    const notebooksRef = ref(database, 'notebooks');
    const snapshot = await get(notebooksRef);
    
    if (!snapshot.exists()) {
      console.log('🔧 Inicializando dados padrão...');
      
      const defaultNotebooks = {};
      for (let i = 1; i <= 15; i++) {
        defaultNotebooks[i] = {
          id: i,
          numero: `EMPRESTIMO_${i.toString().padStart(2, '0')}`,
          serie: `${Math.floor(Math.random() * 9000) + 1000}DD3`,
          rfid: `RF${200794 + i}`,
          modelo: '',
          processador: '',
          memoria: '',
          descricao: '',
          status: 'disponivel',
          colaborador: null,
          setor: null,
          chamado: null,
          data_entrega: null,
          previsao_devolucao: null,
          data_cadastro: new Date().toISOString()
        };
      }
      
      await set(notebooksRef, defaultNotebooks);
      console.log('✅ Dados padrão criados!');
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar:', error);
  }
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Inicializar dados se necessário
    await initializeDefaultData();

    if (req.method === 'GET') {
      const { action, id } = req.query;
      
      if (action === 'disponiveis') {
        // Buscar notebooks disponíveis
        const notebooksRef = ref(database, 'notebooks');
        const snapshot = await get(notebooksRef);
        
        if (snapshot.exists()) {
          const notebooks = Object.values(snapshot.val()).filter(nb => nb.status === 'disponivel');
          return res.status(200).json(notebooks);
        }
        return res.status(200).json([]);
      }
      
      // Buscar todos os notebooks
      const notebooksRef = ref(database, 'notebooks');
      const snapshot = await get(notebooksRef);
      
      if (snapshot.exists()) {
        const notebooks = Object.values(snapshot.val());
        return res.status(200).json(notebooks);
      }
      return res.status(200).json([]);
    }

    if (req.method === 'POST') {
      const data = req.body;
      
      if (data.action === 'add') {
        // Adicionar novo notebook
        const notebooksRef = ref(database, 'notebooks');
        const snapshot = await get(notebooksRef);
        
        let nextId = 1;
        if (snapshot.exists()) {
          const notebooks = Object.values(snapshot.val());
          nextId = Math.max(...notebooks.map(nb => nb.id)) + 1;
        }
        
        const novoNotebook = {
          id: nextId,
          numero: data.numero,
          serie: data.serie,
          rfid: data.rfid,
          modelo: data.modelo || '',
          processador: data.processador || '',
          memoria: data.memoria || '',
          descricao: data.descricao || '',
          status: 'disponivel',
          colaborador: null,
          setor: null,
          chamado: null,
          data_entrega: null,
          previsao_devolucao: null,
          data_cadastro: new Date().toISOString()
        };
        
        await set(ref(database, `notebooks/${nextId}`), novoNotebook);
        return res.status(201).json({ success: true, id: nextId });
      }
    }

    if (req.method === 'PUT') {
      const { id, ...updateData } = req.body;
      await update(ref(database, `notebooks/${id}`), updateData);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Método não permitido' });

  } catch (error) {
    console.error('❌ Erro na API notebooks:', error);
    return res.status(500).json({ error: error.message });
  }
}
