import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set, update } from 'firebase/database';

const firebaseConfig = {
  // MESMAS configurações do arquivo anterior
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { action } = req.query;
      
      if (action === 'ativos') {
        // Buscar empréstimos ativos
        const emprestimosRef = ref(database, 'emprestimos');
        const snapshot = await get(emprestimosRef);
        
        if (snapshot.exists()) {
          const emprestimos = Object.values(snapshot.val()).filter(emp => emp.status === 'ativo');
          
          // Buscar dados dos notebooks
          const emprestimosComNotebooks = await Promise.all(
            emprestimos.map(async (emprestimo) => {
              const notebookRef = ref(database, `notebooks/${emprestimo.notebook_id}`);
              const notebookSnapshot = await get(notebookRef);
              
              if (notebookSnapshot.exists()) {
                return {
                  ...emprestimo,
                  notebook_numero: notebookSnapshot.val().numero
                };
              }
              return emprestimo;
            })
          );
          
          return res.status(200).json(emprestimosComNotebooks);
        }
        return res.status(200).json([]);
      }
    }

    if (req.method === 'POST') {
      const data = req.body;
      
      if (data.action === 'criar') {
        // Criar empréstimo
        const emprestimoId = Date.now();
        
        const emprestimo = {
          id: emprestimoId,
          notebook_id: data.notebook_id,
          colaborador: data.colaborador,
          setor: data.setor,
          chamado: data.chamado,
          motivo: data.motivo,
          data_entrega: new Date().toISOString(),
          previsao_devolucao: data.previsao_devolucao,
          status: 'ativo'
        };
        
        // Salvar empréstimo
        await set(ref(database, `emprestimos/${emprestimoId}`), emprestimo);
        
        // Atualizar notebook
        await update(ref(database, `notebooks/${data.notebook_id}`), {
          status: 'emprestado',
          colaborador: data.colaborador,
          setor: data.setor,
          chamado: data.chamado,
          data_entrega: emprestimo.data_entrega,
          previsao_devolucao: data.previsao_devolucao
        });
        
        return res.status(201).json({ success: true });
      }
      
      if (data.action === 'devolver') {
        // Devolver notebook
        const emprestimosRef = ref(database, 'emprestimos');
        const snapshot = await get(emprestimosRef);
        
        if (snapshot.exists()) {
          const emprestimos = Object.values(snapshot.val());
          const emprestimo = emprestimos.find(emp => 
            emp.notebook_id === data.notebook_id && emp.status === 'ativo'
          );
          
          if (emprestimo) {
            // Atualizar empréstimo
            await update(ref(database, `emprestimos/${emprestimo.id}`), {
              status: 'devolvido',
              data_devolucao: new Date().toISOString(),
              observacoes: data.observacoes || ''
            });
            
            // Atualizar notebook
            await update(ref(database, `notebooks/${data.notebook_id}`), {
              status: 'disponivel',
              colaborador: null,
              setor: null,
              chamado: null,
              data_entrega: null,
              previsao_devolucao: null
            });
            
            return res.status(200).json({ success: true });
          }
        }
      }
    }

    return res.status(405).json({ error: 'Método não permitido' });

  } catch (error) {
    console.error('❌ Erro na API empréstimos:', error);
    return res.status(500).json({ error: error.message });
  }
}
