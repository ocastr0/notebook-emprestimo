import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set } from 'firebase/database';

const firebaseConfig = {
  // MESMAS configurações
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

// Inicializar setores padrão
async function initializeDefaultSetores() {
  try {
    const setoresRef = ref(database, 'setores');
    const snapshot = await get(setoresRef);
    
    if (!snapshot.exists()) {
      const defaultSetores = {
        1: { id: 1, nome: 'Dados Mestre' },
        2: { id: 2, nome: 'Customer Service' },
        3: { id: 3, nome: 'T.I' },
        4: { id: 4, nome: 'CD VERA CRUZ' },
        5: { id: 5, nome: 'Suprimentos' },
        6: { id: 6, nome: 'ADM RH' },
        7: { id: 7, nome: 'Logística' },
        8: { id: 8, nome: 'Controladoria Fiscal' }
      };
      
      await set(setoresRef, defaultSetores);
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar setores:', error);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await initializeDefaultSetores();

    if (req.method === 'GET') {
      const setoresRef = ref(database, 'setores');
      const snapshot = await get(setoresRef);
      
      if (snapshot.exists()) {
        const setores = Object.values(snapshot.val());
        return res.status(200).json(setores);
      }
      return res.status(200).json([]);
    }

    return res.status(405).json({ error: 'Método não permitido' });

  } catch (error) {
    console.error('❌ Erro na API setores:', error);
    return res.status(500).json({ error: error.message });
  }
}
