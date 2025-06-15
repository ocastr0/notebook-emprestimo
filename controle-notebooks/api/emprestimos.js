// API PARA GERENCIAR EMPRÉSTIMOS
export default async function handler(req, res) {
    // Configurar CORS
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
                return await getEmprestimos(req, res);
            case 'POST':
                return await createEmprestimo(req, res);
            case 'PUT':
                return await updateEmprestimo(req, res);
            case 'DELETE':
                return await deleteEmprestimo(req, res);
            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                res.status(405).json({ error: `Método ${method} não permitido` });
        }
    } catch (error) {
        console.error('Erro na API de empréstimos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}

// GET - Buscar empréstimos
async function getEmprestimos(req, res) {
    const { status, colaborador, setor, mes } = req.query;
    
    // Simular dados ou integrar com Firebase
    const emprestimos = [
        {
            id: 1,
            notebookId: 1,
            colaborador: "João Silva",
            setor: "T.I",
            chamado: "TI-2025-001",
            motivo: "Desenvolvimento de projeto",
            dataEntrega: "2025-06-10T09:00:00.000Z",
            previsaoDevolucao: "2025-06-20",
            status: "ativo"
        }
    ];

    // Aplicar filtros
    let resultado = emprestimos;
    
    if (status) {
        resultado = resultado.filter(emp => emp.status === status);
    }
    
    if (colaborador) {
        resultado = resultado.filter(emp => 
            emp.colaborador.toLowerCase().includes(colaborador.toLowerCase())
        );
    }
    
    if (setor) {
        resultado = resultado.filter(emp => emp.setor === setor);
    }

    res.status(200).json({
        success: true,
        data: resultado,
        total: resultado.length,
        timestamp: new Date().toISOString()
    });
}

// POST - Criar empréstimo
async function createEmprestimo(req, res) {
    const { notebookId, colaborador, setor, chamado, motivo, previsaoDevolucao } = req.body;

    // Validações
    if (!notebookId || !colaborador || !setor || !chamado || !previsaoDevolucao) {
        return res.status(400).json({
            success: false,
            error: 'Dados obrigatórios não fornecidos'
        });
    }

    const novoEmprestimo = {
        id: Date.now(),
        notebookId,
        colaborador,
        setor,
        chamado,
        motivo,
        dataEntrega: new Date().toISOString(),
        previsaoDevolucao,
        status: 'ativo'
    };

    res.status(201).json({
        success: true,
        data: novoEmprestimo,
        message: 'Empréstimo criado com sucesso'
    });
}

// PUT - Atualizar empréstimo (devolução)
async function updateEmprestimo(req, res) {
    const { id } = req.query;
    const { status, dataDevolucao, observacoes } = req.body;

    if (status === 'devolvido') {
        res.status(200).json({
            success: true,
            message: 'Empréstimo devolvido com sucesso',
            data: {
                id: parseInt(id),
                status: 'devolvido',
                dataDevolucao: dataDevolucao || new Date().toISOString(),
                observacoes
            }
        });
    } else {
        res.status(400).json({
            success: false,
            error: 'Status inválido'
        });
    }
}

// DELETE - Cancelar empréstimo
async function deleteEmprestimo(req, res) {
    const { id } = req.query;

    res.status(200).json({
        success: true,
        message: `Empréstimo ${id} cancelado com sucesso`
    });
}
