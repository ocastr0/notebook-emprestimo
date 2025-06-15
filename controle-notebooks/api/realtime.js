// API PARA FUNCIONALIDADES EM TEMPO REAL
export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { method } = req;

    try {
        switch (method) {
            case 'GET':
                return await getRealtimeData(req, res);
            case 'POST':
                return await updateRealtimeData(req, res);
            default:
                res.setHeader('Allow', ['GET', 'POST']);
                res.status(405).json({ error: `Método ${method} não permitido` });
        }
    } catch (error) {
        console.error('Erro na API realtime:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

// GET - Dados em tempo real
async function getRealtimeData(req, res) {
    const { type } = req.query;

    const realtimeData = {
        notifications: [
            {
                id: 1,
                tipo: 'devolucao_proxima',
                mensagem: 'Notebook EMPRESTIMO_03 deve ser devolvido amanhã',
                prioridade: 'alta',
                timestamp: new Date().toISOString()
            },
            {
                id: 2,
                tipo: 'novo_emprestimo',
                mensagem: 'Novo empréstimo registrado para Maria Santos',
                prioridade: 'normal',
                timestamp: new Date().toISOString()
            }
        ],
        alerts: [
            {
                id: 1,
                tipo: 'atraso',
                mensagem: '1 notebook em atraso na devolução',
                prioridade: 'critica',
                count: 1
            }
        ],
        activity: [
            {
                id: 1,
                acao: 'emprestimo_criado',
                usuario: 'Admin',
                detalhes: 'Notebook EMPRESTIMO_05 emprestado para João Silva',
                timestamp: new Date().toISOString()
            }
        ]
    };

    if (type && realtimeData[type]) {
        res.status(200).json({
            success: true,
            data: realtimeData[type]
        });
    } else {
        res.status(200).json({
            success: true,
            data: realtimeData
        });
    }
}

// POST - Atualizar dados em tempo real
async function updateRealtimeData(req, res) {
    const { type, data } = req.body;

    // Simular atualização
    res.status(200).json({
        success: true,
        message: `Dados ${type} atualizados em tempo real`,
        timestamp: new Date().toISOString()
    });
}
