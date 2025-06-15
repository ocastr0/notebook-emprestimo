// API PARA GERENCIAR SETORES
export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { method } = req;

    try {
        switch (method) {
            case 'GET':
                return await getSetores(req, res);
            case 'POST':
                return await createSetor(req, res);
            case 'DELETE':
                return await deleteSetor(req, res);
            default:
                res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
                res.status(405).json({ error: `Método ${method} não permitido` });
        }
    } catch (error) {
        console.error('Erro na API de setores:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

// GET - Buscar setores
async function getSetores(req, res) {
    const setores = [
        "Dados Mestre",
        "Customer Service", 
        "T.I",
        "CD VERA CRUZ",
        "Suprimentos",
        "ADM RH",
        "Logística",
        "Controladoria Fiscal"
    ];

    res.status(200).json({
        success: true,
        data: setores,
        total: setores.length
    });
}

// POST - Criar setor
async function createSetor(req, res) {
    const { nome } = req.body;

    if (!nome || nome.trim() === '') {
        return res.status(400).json({
            success: false,
            error: 'Nome do setor é obrigatório'
        });
    }

    res.status(201).json({
        success: true,
        data: { nome: nome.trim() },
        message: 'Setor criado com sucesso'
    });
}

// DELETE - Remover setor
async function deleteSetor(req, res) {
    const { nome } = req.query;

    if (!nome) {
        return res.status(400).json({
            success: false,
            error: 'Nome do setor é obrigatório'
        });
    }

    res.status(200).json({
        success: true,
        message: `Setor "${nome}" removido com sucesso`
    });
}
