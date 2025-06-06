import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set, remove } from 'firebase/database';

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

async function initializeDefaultSetores() {
  if (!database) return;
  
  try {
    const setoresRef = ref(database, 'setores');
    const snapshot = await get(setoresRef);
    
    if (!snapshot.exists()) {
      console.log('🔧 Inicializando setores padrão...');
      
      const defaultSetores = {
        1: { id: 1, nome: 'Dados Mestre', ativo: true, data_criacao: new Date().toISOString() },
        2: { id: 2, nome: 'Customer Service', ativo: true, data_criacao: new Date().toISOString() },
        3: { id: 3, nome: 'T.I', ativo: true, data_criacao: new Date().toISOString() },
        4: { id: 4, nome: 'CD VERA CRUZ', ativo: true, data_criacao: new Date().toISOString() },
        5: { id: 5, nome: 'Suprimentos', ativo: true, data_criacao: new Date().toISOString() },
        6: { id: 6, nome: 'ADM RH', ativo: true, data_criacao: new Date().toISOString() },
        7: { id: 7, nome: 'Logística', ativo: true, data_criacao: new Date().toISOString() },
        8: { id: 8, nome: 'Controladoria Fiscal', ativo: true, data_criacao: new Date().toISOString() }
      };
      
      await set(setoresRef, defaultSetores);
      console.log('✅ 8 setores padrão criados!');
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar setores:', error);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
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
    await initializeDefaultSetores();

    if (req.method === 'GET') {
      const setoresRef = ref(database, 'setores');
      const snapshot = await get(setoresRef);
      
      if (snapshot.exists()) {
        const setores = Object.values(snapshot.val()).filter(setor => setor.ativo !== false);
        return res.status(200).json(setores);
      }
      return res.status(200).json([]);
    }

    if (req.method === 'POST') {
      const { nome } = req.body;
      
      if (!nome || nome.trim().length < 2) {
        return res.status(400).json({ error: 'Nome do setor é obrigatório (mínimo 2 caracteres)' });
      }
      
      // Verificar se já existe
      const setoresRef = ref(database, 'setores');
      const snapshot = await get(setoresRef);
      
      if (snapshot.exists()) {
        const setores = Object.values(snapshot.val());
        const existe = setores.find(setor => 
          setor.nome.toLowerCase() === nome.trim().toLowerCase() && setor.ativo !== false
        );
        
        if (existe) {
          return res.status(400).json({ error: 'Setor já existe' });
        }
      }
      
      // Encontrar próximo ID
      let nextId = 1;
      if (snapshot.exists()) {
        const setores = Object.values(snapshot.val());
        nextId = Math.max(...setores.map(s => s.id)) + 1;
      }
      
      const novoSetor = {
        id: nextId,
        nome: nome.trim(),
        ativo: true,
        data_criacao: new Date().toISOString()
      };
      
      await set(ref(database, `setores/${nextId}`), novoSetor);
      return res.status(201).json({ success: true, setor: novoSetor });
    }

    if (req.method === 'DELETE') {
      const { nome, id } = req.body;
      
      if (!nome && !id) {
        return res.status(400).json({ error: 'Nome ou ID do setor é obrigatório' });
      }
      
      const setoresRef = ref(database, 'setores');
      const snapshot = await get(setoresRef);
      
      if (snapshot.exists()) {
        const setores = snapshot.val();
        let setorKey;
        
        if (id) {
          setorKey = id;
        } else {
          setorKey = Object.keys(setores).find(key => setores[key].nome === nome);
        }
        
        if (setorKey && setores[setorKey]) {
          // Marcar como inativo ao invés de deletar
          await set(ref(database, `setores/${setorKey}/ativo`), false);
          return res.status(200).json({ success: true });
        }
      }
      
      return res.status(404).json({ error: 'Setor não encontrado' });
    }

    return res.status(405).json({ error: 'Método não permitido' });

  } catch (error) {
    console.error('❌ Erro na API setores:', error);
    return res.status(500).json({ 
      error: 'Erro interno',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
