// API PARA ESTATÍSTICAS
export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        // Simular estatísticas
        const stats = {
            notebooks: {
                total: 15,
                disponivel: 12,
                emprestado: 3,
                manutencao: 0
            },
            emprestimos: {
                ativo: 3,
                devolvido: 25,
                atrasado: 1,
                total: 28
            },
            setores: {
                total: 8,
                maisAtivo: "T.I",
                menosAtivo: "Controladoria Fiscal"
            },
            periodo: {
                mes: new Date().getMonth() + 1,
                ano: new Date().getFullYear(),
                emprestimosNoMes: 12
            },
            utilizacao: {
                percentual: 80,
                tendencia: "crescente"
            }
        };

        res.status(200).json({
            success: true,
            data: stats,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Erro na API de stats:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
}
