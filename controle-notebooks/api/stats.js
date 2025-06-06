import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';

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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const notebooksRef = ref(database, 'notebooks');
      const snapshot = await get(notebooksRef);
      
      let stats = {
        total_notebooks: 0,
        disponiveis: 0,
        em_uso: 0
      };
      
      if (snapshot.exists()) {
        const notebooks = Object.values(snapshot.val());
        
        stats.total_notebooks = notebooks.length;
        stats.disponiveis = notebooks.filter(nb => nb.status === 'disponivel').length;
        stats.em_uso = notebooks.filter(nb => nb.status === 'emprestado').length;
      }
      
      return res.status(200).json(stats);
    }

    return res.status(405).json({ error: 'Método não permitido' });

  } catch (error) {
    console.error('❌ Erro na API stats:', error);
    return res.status(500).json({ error: error.message });
  }
}
