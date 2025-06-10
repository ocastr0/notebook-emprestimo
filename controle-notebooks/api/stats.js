// stats.js - Estatísticas e métricas
class StatsManager {
    constructor() {
        this.stats = {};
        this.init();
    }

    init() {
        this.setupRealtimeListeners();
        this.startPeriodicUpdate();
    }

    setupRealtimeListeners() {
        dbRefs.stats.on('value', (snapshot) => {
            if (snapshot.exists()) {
                this.stats = snapshot.val();
                this.updateStatsDisplay();
                console.log('📊 Estatísticas atualizadas');
            }
        });
    }

    startPeriodicUpdate() {
        // Atualizar stats a cada 30 segundos
        setInterval(() => {
            this.calculateAndUpdateStats();
        }, 30000);
    }

    async calculateAndUpdateStats() {
        try {
            // Buscar dados atuais
            const notebooksSnapshot = await dbRefs.notebooks.once('value');
            const emprestimosSnapshot = await dbRefs.emprestimos.once('value');
            
            const notebooks = notebooksSnapshot.exists() ? notebooksSnapshot.val() : {};
            const emprestimos = emprestimosSnapshot.exists() ? emprestimosSnapshot.val() : {};
            
            // Calcular estatísticas
            const totalNotebooks = Object.keys(notebooks).length;
            const disponiveis = Object.values(notebooks).filter(nb => nb.status === 'disponivel').length;
            const emUso = totalNotebooks - disponiveis;
            
            const totalEmprestimos = Object.keys(emprestimos).length;
            const emprestimosAtivos = Object.values(emprestimos).filter(emp => emp.status === 'ativo').length;
            const emprestimosDevolvidos = totalEmprestimos - emprestimosAtivos;
            
            // Calcular atrasados
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            
            const atrasados = Object.values(emprestimos).filter(emp => {
                if (emp.status !== 'ativo') return false;
                const previsao = new Date(emp.previsao_devolucao);
                previsao.setHours(0, 0, 0, 0);
                return previsao < hoje;
            }).length;

            const novasStats = {
                total_notebooks: totalNotebooks,
                disponiveis: disponiveis,
                em_uso: emUso,
                total_emprestimos: totalEmprestimos,
                emprestimos_ativos: emprestimosAtivos,
                emprestimos_devolvidos: emprestimosDevolvidos,
                atrasados: atrasados,
                taxa_utilizacao: totalNotebooks > 0 ? ((emUso / totalNotebooks) * 100).toFixed(1) : 0,
                ultima_atualizacao: FirebaseUtils.timestamp()
            };

            await dbRefs.stats.update(novasStats);
            
        } catch (error) {
            console.error('❌ Erro ao calcular estatísticas:', error);
        }
    }

    updateStatsDisplay() {
        // Atualizar elementos do header
        const disponiveisEl = document.getElementById('disponiveisCount');
        const emprestadosEl = document.getElementById('emprestadosCount');
        
        if (disponiveisEl) disponiveisEl.textContent = this.stats.disponiveis || 0;
        if (emprestadosEl) emprestadosEl.textContent = this.stats.em_uso || 0;

        // Atualizar outros elementos de estatísticas se existirem
        const elementos = {
            'totalNotebooks': this.stats.total_notebooks,
            'totalEmprestimos': this.stats.total_emprestimos,
            'emprestimosAtivos': this.stats.emprestimos_ativos,
            'atrasados': this.stats.atrasados,
            'taxaUtilizacao': this.stats.taxa_utilizacao
        };

        Object.entries(elementos).forEach(([id, valor]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = valor || 0;
        });
    }

    async gerarRelatorio() {
        try {
            await this.calculateAndUpdateStats();
            
            const relatorio = {
                data_geracao: new Date().toISOString(),
                stats: this.stats,
                detalhes: {
                    notebooks_por_status: {},
                    emprestimos_por_setor: {},
                    tempo_medio_emprestimo: 0
                }
            };

            console.log('📊 Relatório gerado:', relatorio);
            return relatorio;
            
        } catch (error) {
            console.error('❌ Erro ao gerar relatório:', error);
            return null;
        }
    }

    exportarDados() {
        const dados = {
            notebooks: notebookManager.notebooks,
            emprestimos: emprestimoManager.emprestimos,
            setores: setorManager.setores,
            stats: this.stats,
            data_export: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `emprestimos_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Instanciar gerenciador
const statsManager = new StatsManager();
