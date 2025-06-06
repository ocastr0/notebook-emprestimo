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
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

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
      const { action, timestamp } = req.query;
      
      if (action === 'check') {
        // Verificar atualizações desde timestamp
        const timestampDate = timestamp ? new Date(timestamp) : new Date(Date.now() - 60000); // 1 minuto atrás
        
        const [notebooksSnapshot, emprestimosSnapshot] = await Promise.all([
          get(ref(database, 'notebooks')),
          get(ref(database, 'emprestimos'))
        ]);
        
        let hasUpdates = false;
        let updates = {
          notebooks: [],
          emprestimos: [],
          timestamp: new Date().toISOString()
        };
        
        // Verificar notebooks atualizados
        if (notebooksSnapshot.exists()) {
          const notebooks = Object.values(notebooksSnapshot.val());
          updates.notebooks = notebooks.filter(nb => {
            const dataAtualizacao = new Date(nb.data_atualizacao || nb.data_cadastro);
            return dataAtualizacao > timestampDate;
          });
          
          if (updates.notebooks.length > 0) {
            hasUpdates = true;
          }
        }
        
        // Verificar empréstimos atualizados
        if (emprestimosSnapshot.exists()) {
          const emprestimos = Object.values(emprestimosSnapshot.val());
          updates.emprestimos = emprestimos.filter(emp => {
            const dataAtualizacao = new Date(emp.data_atualizacao || emp.data_criacao);
            return dataAtualizacao > timestampDate;
          });
          
          if (updates.emprestimos.length > 0) {
            hasUpdates = true;
          }
        }
        
        return res.status(200).json({
          hasUpdates,
          updates,
          timestamp: new Date().toISOString()
        });
      }
      
      if (action === 'heartbeat') {
        // Heartbeat para manter conexão
        return res.status(200).json({
          status: 'online',
          timestamp: new Date().toISOString(),
          firebase_connected: !!database
        });
      }
      
      // Status geral do sistema
      const [notebooksSnapshot, emprestimosSnapshot] = await Promise.all([
        get(ref(database, 'notebooks')),
        get(ref(database, 'emprestimos'))
      ]);
      
      const systemStatus = {
        online: true,
        database_connected: true,
        last_check: new Date().toISOString(),
        data_summary: {
          notebooks_count: notebooksSnapshot.exists() ? Object.keys(notebooksSnapshot.val()).length : 0,
          emprestimos_count: emprestimosSnapshot.exists() ? Object.keys(emprestimosSnapshot.val()).length : 0
        }
      };
      
      return res.status(200).json(systemStatus);
    }

    return res.status(405).json({ error: 'Método não permitido' });

  } catch (error) {
    console.error('❌ Erro na API realtime:', error);
    return res.status(500).json({ 
      error: 'Erro interno',
      message: error.message,
      online: false,
      timestamp: new Date().toISOString()
    });
  }
}
