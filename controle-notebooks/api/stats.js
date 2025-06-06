import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';

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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
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
    if (req.method === 'GET') {
      const { action } = req.query;
      
      if (action === 'dashboard') {
        // Estatísticas completas para dashboard
        const [notebooksSnapshot, emprestimosSnapshot, setoresSnapshot] = await Promise.all([
          get(ref(database, 'notebooks')),
          get(ref(database, 'emprestimos')),
          get(ref(database, 'setores'))
        ]);
        
        let stats = {
          total_notebooks: 0,
          disponiveis: 0,
          em_uso: 0,
          total_emprestimos: 0,
          emprestimos_ativos: 0,
          emprestimos_devolvidos: 0,
          emprestimos_atrasados: 0,
          total_setores: 0,
          timestamp: new Date().toISOString()
        };
        
        // Estatísticas de notebooks
        if (notebooksSnapshot.exists()) {
          const notebooks = Object.values(notebooksSnapshot.val());
          stats.total_notebooks = notebooks.length;
          stats.disponiveis = notebooks.filter(nb => nb.status === 'disponivel').length;
          stats.em_uso = notebooks.filter(nb => nb.status === 'emprestado').length;
        }
        
        // Estatísticas de empréstimos
        if (emprestimosSnapshot.exists()) {
          const emprestimos = Object.values(emprestimosSnapshot.val());
          stats.total_emprestimos = emprestimos.length;
          stats.emprestimos_ativos = emprestimos.filter(emp => emp.status === 'ativo').length;
          stats.emprestimos_devolvidos = emprestimos.filter(emp => emp.status === 'devolvido').length;
          
          // Empréstimos atrasados
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);
          
          stats.emprestimos_atrasados = emprestimos.filter(emp => {
            if (emp.status !== 'ativo') return false;
            const previsao = new Date(emp.previsao_devolucao);
            previsao.setHours(0, 0, 0, 0);
            return previsao < hoje;
          }).length;
        }
        
        // Estatísticas de setores
        if (setoresSnapshot.exists()) {
          const setores = Object.values(setoresSnapshot.val());
          stats.total_setores = setores.filter(setor => setor.ativo !== false).length;
        }
        
        return res.status(200).json(stats);
      }
      
      // Estatísticas básicas (compatibilidade)
      const notebooksRef = ref(database, 'notebooks');
      const snapshot = await get(notebooksRef);
      
      let stats = {
        total_notebooks: 0,
        disponiveis: 0,
        em_uso: 0,
        timestamp: new Date().toISOString()
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
    return res.status(500).json({ 
      error: 'Erro interno',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
