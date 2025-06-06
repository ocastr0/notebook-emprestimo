import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set, update, remove } from 'firebase/database';

const firebaseConfig = {
  // MESMAS configurações do arquivo anterior
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyA-MT3SU98q0RZhEMh1IEpmgEaGXZPpKAQ",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "notebook-emprestimo.firebaseapp.com",
  databaseURL: process.env.FIREBASE_DATABASE_URL || "https://notebook-emprestimo-default-rtdb.firebaseio.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "notebook-emprestimo",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "notebook-emprestimo.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "1007063409338",
  appId: process.env.FIREBASE_APP_ID || "1:1007063409338:web:5538614ffa1eaf315e5883"
};

let app;
let database;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
} catch (error) {
  console.error('❌ Erro Firebase:', error);
}

async function initializeDefaultData() {
  if (!database) return;
  
  try {
    const notebooksRef = ref(database, 'notebooks');
    const snapshot = await get(notebooksRef);
    
    if (!snapshot.exists()) {
      console.log('🔧 Inicializando 15 notebooks padrão...');
      
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
          data_cadastro: new Date().toISOString(),
          data_atualizacao: new Date().toISOString()
        };
      }
      
      await set(notebooksRef, defaultNotebooks);
      console.log('✅ 15 notebooks criados com sucesso!');
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar notebooks:', error);
  }
}

export default async function handler(req, res) {
  // CORS Headers obrigatórios
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!database) {
    return res.status(500).json({ 
      error: 'Firebase não conectado',
      message: 'Verifique configurações do Firebase'
    });
  }

  try {
    await initializeDefaultData();

    if (req.method === 'GET') {
      const { action, id } = req.query;
      
      if (action === 'disponiveis') {
        // Retornar apenas notebooks disponíveis
        const notebooksRef = ref(database, 'notebooks');
        const snapshot = await get(notebooksRef);
        
        if (snapshot.exists()) {
          const notebooks = Object.values(snapshot.val()).filter(nb => nb.status === 'disponivel');
          return res.status(200).json(notebooks);
        }
        return res.status(200).json([]);
      }
      
      if (id) {
        // Retornar notebook específico
        const notebookRef = ref(database, `notebooks/${id}`);
        const snapshot = await get(notebookRef);
        
        if (snapshot.exists()) {
          return res.status(200).json(snapshot.val());
        }
        return res.status(404).json({ error: 'Notebook não encontrado' });
      }
      
      // Retornar todos os notebooks
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
          data_cadastro: new Date().toISOString(),
          data_atualizacao: new Date().toISOString()
        };
        
        await set(ref(database, `notebooks/${nextId}`), novoNotebook);
        return res.status(201).json({ success: true, id: nextId });
      }
      
      if (data.action === 'update_massa') {
        // Atualização em massa
        const updates = {};
        
        for (const [id, updateData] of Object.entries(data.notebooks)) {
          updates[`notebooks/${id}/serie`] = updateData.serie;
          updates[`notebooks/${id}/rfid`] = updateData.rfid;
          updates[`notebooks/${id}/modelo`] = updateData.modelo;
          updates[`notebooks/${id}/data_atualizacao`] = new Date().toISOString();
        }
        
        await update(ref(database), updates);
        return res.status(200).json({ success: true });
      }
    }

    if (req.method === 'PUT') {
      const { id, ...updateData } = req.body;
      
      updateData.data_atualizacao = new Date().toISOString();
      
      await update(ref(database, `notebooks/${id}`), updateData);
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      
      await remove(ref(database, `notebooks/${id}`));
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Método não permitido' });

  } catch (error) {
    console.error('❌ Erro na API notebooks:', error);
    return res.status(500).json({ 
      error: 'Erro interno',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
