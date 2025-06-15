// API PARA GERENCIAR NOTEBOOKS
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
                return await getNotebooks(req, res);
            case 'POST':
                return await createNotebook(req, res);
            case 'PUT':
                return await updateNotebook(req, res);
            case 'DELETE':
                return await deleteNotebook(req, res);
            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                res.status(405).json({ error: `Método ${method} não permitido` });
        }
    } catch (error) {
        console.error('Erro na API de notebooks:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

// GET - Buscar notebooks
async function getNotebooks(req, res) {
    const { status, search } = req.query;
    
    // Dados simulados - conectar ao Firebase conforme necessário
    const notebooks = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        numero: `EMPRESTIMO_${(i + 1).toString().padStart(2, '0')}`,
        serie: `${Math.floor(Math.random() * 9000) + 1000}DD3`,
        rfid: `${200800 + i + 1}`,
        modelo: ['Dell Inspiron 15', 'Lenovo ThinkPad', 'HP Pavilion'][Math.floor(Math.random() * 3)],
        processador: ['Intel i5', 'Intel i7', 'AMD Ryzen 5'][Math.floor(Math.random() * 3)],
        memoria: ['8GB DDR4', '16GB DDR4'][Math.floor(Math.random() * 2)],
        status: Math.random() > 0.7 ? 'emprestado' : 'disponivel',
        dataCadastro: new Date().toISOString()
    }));

    let resultado = notebooks;
    
    if (status) {
        resultado = resultado.filter(nb => nb.status === status);
    }
    
    if (search) {
        resultado = resultado.filter(nb => 
            nb.numero.toLowerCase().includes(search.toLowerCase()) ||
            nb.serie.toLowerCase().includes(search.toLowerCase())
        );
    }

    res.status(200).json({
        success: true,
        data: resultado,
        total: resultado.length,
        disponivel: resultado.filter(nb => nb.status === 'disponivel').length,
        emprestado: resultado.filter(nb => nb.status === 'emprestado').length
    });
}

// POST - Criar notebook
async function createNotebook(req, res) {
    const { numero, serie, rfid, modelo, processador, memoria } = req.body;

    if (!numero || !serie || !rfid) {
        return res.status(400).json({
            success: false,
            error: 'Número, série e RFID são obrigatórios'
        });
    }

    const novoNotebook = {
        id: Date.now(),
        numero,
        serie,
        rfid,
        modelo: modelo || '',
        processador: processador || '',
        memoria: memoria || '',
        status: 'disponivel',
        dataCadastro: new Date().toISOString()
    };

    res.status(201).json({
        success: true,
        data: novoNotebook,
        message: 'Notebook criado com sucesso'
    });
}

// PUT - Atualizar notebook
async function updateNotebook(req, res) {
    const { id } = req.query;
    const dadosAtualizacao = req.body;

    res.status(200).json({
        success: true,
        data: {
            id: parseInt(id),
            ...dadosAtualizacao,
            dataAtualizacao: new Date().toISOString()
        },
        message: 'Notebook atualizado com sucesso'
    });
}

// DELETE - Remover notebook
async function deleteNotebook(req, res) {
    const { id } = req.query;

    res.status(200).json({
        success: true,
        message: `Notebook ${id} removido com sucesso`
    });
}
