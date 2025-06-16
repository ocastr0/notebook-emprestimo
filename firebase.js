// firebase.js - Configuração centralizada
const firebaseConfig = {
    apiKey: "AIzaSyA-MT3SU98q0RZhEMh1IEpmgEaGXZPpKAQ",
    authDomain: "notebook-emprestimo.firebaseapp.com",
    databaseURL: "https://notebook-emprestimo-default-rtdb.firebaseio.com",
    projectId: "notebook-emprestimo",
    storageBucket: "notebook-emprestimo.firebasestorage.app",
    messagingSenderId: "1007063409338",
    appId: "1:1007063409338:web:5538614ffa1eaf315e5883",
    measurementId: "G-56H4W8HG9Z"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referencias globais do banco
const database = firebase.database();
const dbRefs = {
    notebooks: database.ref('notebooks'),
    emprestimos: database.ref('emprestimos'),
    setores: database.ref('setores'),
    stats: database.ref('stats'),
    usuarios: database.ref('usuarios')
};

// Função para inicializar dados padrão
function initializeDefaultData() {
    // Verificar se já existem dados
    dbRefs.notebooks.once('value', (snapshot) => {
        if (!snapshot.exists()) {
            console.log('🔧 Inicializando dados padrão...');
            
            // Criar 15 notebooks padrão
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
                    data_cadastro: firebase.database.ServerValue.TIMESTAMP
                };
            }
            dbRefs.notebooks.set(defaultNotebooks);
            
            // Setores padrão
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
            dbRefs.setores.set(defaultSetores);
            
            console.log('✅ Dados padrão criados!');
        }
    });
}

// Inicializar ao carregar
initializeDefaultData();

// Funções utilitárias globais
const FirebaseUtils = {
    // Gerar timestamp
    timestamp: () => firebase.database.ServerValue.TIMESTAMP,
    
    // Gerar ID único
    generateId: () => Date.now(),
    
    // Formatar data
    formatDate: (timestamp) => {
        if (!timestamp) return '-';
        return new Date(timestamp).toLocaleDateString('pt-BR');
    },
    
    // Verificar se está atrasado
    isAtrasado: (previsaoDevolucao) => {
        if (!previsaoDevolucao) return false;
        const previsao = new Date(previsaoDevolucao);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        previsao.setHours(0, 0, 0, 0);
        return previsao < hoje;
    }
};
