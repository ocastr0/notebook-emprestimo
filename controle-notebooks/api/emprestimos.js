import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set, update, query, orderByChild, equalTo } from 'firebase/database';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
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
      const { action, id, nome, setor, mes } = req.query;
      
      if (action === 'ativos') {
        // Buscar empréstimos ativos
        const emprestimosRef = ref(database, 'emprestimos');
        const snapshot = await get(emprestimosRef);
        
        if (snapshot.exists()) {
          const emprestimos = Object.values(snapshot.val()).filter(emp => emp.status === 'ativo');
          
          // Buscar dados dos notebooks para cada empréstimo
          const emprestimosComNotebooks = await Promise.all(
            emprestimos.map(async (emprestimo) => {
              try {
                const notebookRef = ref(database, `notebooks/${emprestimo.notebook_id}`);
                const notebookSnapshot = await get(notebookRef);
                
                if (notebookSnapshot.exists()) {
                  return {
                    ...emprestimo,
                    notebook_numero: notebookSnapshot.val().numero
                  };
                }
                return {
                  ...emprestimo,
                  notebook_numero: `Notebook ${emprestimo.notebook_id}`
                };
              } catch (error) {
                console.error('Erro ao buscar notebook:', error);
                return {
                  ...emprestimo,
                  notebook_numero: `Notebook ${emprestimo.notebook_id}`
                };
              }
            })
          );
          
          return res.status(200).json(emprestimosComNotebooks);
        }
        return res.status(200).json([]);
      }
      
      if (action === 'historico') {
        // Buscar histórico com filtros
        const emprestimosRef = ref(database, 'emprestimos');
        const snapshot = await get(emprestimosRef);
        
        if (snapshot.exists()) {
          let emprestimos = Object.values(snapshot.val());
          
          // Aplicar filtros
          if (nome) {
            emprestimos = emprestimos.filter(emp => 
              emp.colaborador.toLowerCase().includes(nome.toLowerCase())
            );
          }
          
          if (setor) {
            emprestimos = emprestimos.filter(emp => emp.setor === setor);
          }
          
          if (mes) {
            emprestimos = emprestimos.filter(emp => {
              const dataEntrega = new Date(emp.data_entrega);
              const mesAno = `${dataEntrega.getFullYear()}-${(dataEntrega.getMonth() + 1).toString().padStart(2, '0')}`;
              return mesAno === mes;
            });
          }
          
          // Buscar dados dos notebooks
          const emprestimosComNotebooks = await Promise.all(
            emprestimos.map(async (emprestimo) => {
              try {
                const notebookRef = ref(database, `notebooks/${emprestimo.notebook_id}`);
                const notebookSnapshot = await get(notebookRef);
                
                if (notebookSnapshot.exists()) {
                  return {
                    ...emprestimo,
                    notebook_numero: notebookSnapshot.val().numero
                  };
                }
                return {
                  ...emprestimo,
                  notebook_numero: `Notebook ${emprestimo.notebook_id}`
                };
              } catch (error) {
                return {
                  ...emprestimo,
                  notebook_numero: `Notebook ${emprestimo.notebook_id}`
                };
              }
            })
          );
          
          // Ordenar por data mais recente
          emprestimosComNotebooks.sort((a, b) => new Date(b.data_entrega) - new Date(a.data_entrega));
          
          return res.status(200).json(emprestimosComNotebooks);
        }
        return res.status(200).json([]);
      }
      
      if (id) {
        // Buscar empréstimo específico
        const emprestimoRef = ref(database, `emprestimos/${id}`);
        const snapshot = await get(emprestimoRef);
        
        if (snapshot.exists()) {
          const emprestimo = snapshot.val();
          
          // Buscar dados do notebook
          const notebookRef = ref(database, `notebooks/${emprestimo.notebook_id}`);
          const notebookSnapshot = await get(notebookRef);
          
          if (notebookSnapshot.exists()) {
            emprestimo.notebook_numero = notebookSnapshot.val().numero;
          }
          
          return res.status(200).json(emprestimo);
        }
        return res.status(404).json({ error: 'Empréstimo não encontrado' });
      }
    }

    if (req.method === 'POST') {
      const data = req.body;
      
      if (data.action === 'criar') {
        // Criar novo empréstimo
        const emprestimoId = Date.now();
        const agora = new Date().toISOString();
        
        const emprestimo = {
          id: emprestimoId,
          notebook_id: data.notebook_id,
          colaborador: data.colaborador,
          setor: data.setor,
          chamado: data.chamado,
          motivo: data.motivo,
          data_entrega: agora,
          previsao_devolucao: data.previsao_devolucao,
          data_devolucao: null,
          observacoes_devolucao: null,
          status: 'ativo',
          data_criacao: agora,
          data_atualizacao: agora
        };
        
        // Verificar se notebook existe e está disponível
        const notebookRef = ref(database, `notebooks/${data.notebook_id}`);
        const notebookSnapshot = await get(notebookRef);
        
        if (!notebookSnapshot.exists()) {
          return res.status(404).json({ error: 'Notebook não encontrado' });
        }
        
        const notebook = notebookSnapshot.val();
        if (notebook.status !== 'disponivel') {
          return res.status(400).json({ error: 'Notebook não está disponível' });
        }
        
        // Salvar empréstimo
        await set(ref(database, `emprestimos/${emprestimoId}`), emprestimo);
        
        // Atualizar status do notebook
        const updateNotebook = {
          status: 'emprestado',
          colaborador: data.colaborador,
          setor: data.setor,
          chamado: data.chamado,
          data_entrega: agora,
          previsao_devolucao: data.previsao_devolucao,
          data_atualizacao: agora
        };
        
        await update(ref(database, `notebooks/${data.notebook_id}`), updateNotebook);
        
        return res.status(201).json({ success: true, id: emprestimoId });
      }
      
      if (data.action === 'devolver') {
        // Devolver notebook
        const agora = new Date().toISOString();
        
        // Buscar empréstimo ativo do notebook
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
              data_devolucao: agora,
              observacoes_devolucao: data.observacoes || '',
              data_atualizacao: agora
            });
            
            // Atualizar notebook
            await update(ref(database, `notebooks/${data.notebook_id}`), {
              status: 'disponivel',
              colaborador: null,
              setor: null,
              chamado: null,
              data_entrega: null,
              previsao_devolucao: null,
              data_atualizacao: agora
            });
            
            return res.status(200).json({ success: true });
          }
          return res.status(404).json({ error: 'Empréstimo ativo não encontrado' });
        }
        return res.status(404).json({ error: 'Nenhum empréstimo encontrado' });
      }
    }

    return res.status(405).json({ error: 'Método não permitido' });

  } catch (error) {
    console.error('❌ Erro na API empréstimos:', error);
    return res.status(500).json({ 
      error: 'Erro interno',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
