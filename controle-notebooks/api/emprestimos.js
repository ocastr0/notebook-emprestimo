// emprestimos.js - Funcionalidades de empréstimos
class EmprestimoManager {
    constructor() {
        this.emprestimos = {};
        this.init();
    }

    init() {
        this.setupRealtimeListeners();
        this.setupFormListener();
    }

    setupRealtimeListeners() {
        // Listener para empréstimos
        dbRefs.emprestimos.on('value', (snapshot) => {
            if (snapshot.exists()) {
                this.emprestimos = snapshot.val();
                this.renderEmprestimosAtivos();
                this.renderHistorico();
                console.log('📡 Empréstimos atualizados:', Object.keys(this.emprestimos).length);
            }
        });
    }

    setupFormListener() {
        const form = document.getElementById('formSolicitacao');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.criarEmprestimo();
            });
        }
    }

    async criarEmprestimo() {
        const nome = document.getElementById('nomeColaborador')?.value.trim();
        const setor = document.getElementById('setorColaborador')?.value;
        const notebookId = parseInt(document.getElementById('notebookSelecionado')?.value);
        const chamado = document.getElementById('numeroChamado')?.value.trim();
        const motivo = document.getElementById('motivoEmprestimo')?.value.trim();
        const previsaoDevolucao = document.getElementById('dataPrevisaoDevolucao')?.value;

        // Validações
        if (!nome || !setor || !notebookId || !chamado || !motivo || !previsaoDevolucao) {
            this.showToast('Todos os campos são obrigatórios!', 'error');
            return;
        }

        if (nome.length < 2) {
            this.showToast('Nome deve ter pelo menos 2 caracteres!', 'error');
            return;
        }

        const notebook = notebookManager.getNotebookById(notebookId);
        if (!notebook || notebook.status !== 'disponivel') {
            this.showToast('Notebook não está disponível!', 'error');
            return;
        }

        try {
            const emprestimoId = FirebaseUtils.generateId();
            const agora = new Date().toISOString();
            
            const emprestimo = {
                id: emprestimoId,
                notebook_id: notebookId,
                colaborador: nome,
                setor: setor,
                chamado: chamado,
                motivo: motivo,
                data_entrega: agora,
                previsao_devolucao: previsaoDevolucao,
                status: 'ativo',
                data_criacao: FirebaseUtils.timestamp()
            };

            // Usar transação para garantir consistência
            const updates = {};
            updates[`emprestimos/${emprestimoId}`] = emprestimo;
            updates[`notebooks/${notebookId}/status`] = 'emprestado';
            updates[`notebooks/${notebookId}/colaborador`] = nome;
            updates[`notebooks/${notebookId}/setor`] = setor;
            updates[`notebooks/${notebookId}/chamado`] = chamado;
            updates[`notebooks/${notebookId}/data_entrega`] = agora;
            updates[`notebooks/${notebookId}/previsao_devolucao`] = previsaoDevolucao;

            await database.ref().update(updates);
            
            // Limpar formulário
            const form = document.getElementById('formSolicitacao');
            if (form) form.reset();
            
            this.showToast(`✅ Notebook ${notebook.numero} emprestado para ${nome}!`, 'success');
            
            // Mudar para aba dashboard
            if (typeof sistema !== 'undefined') {
                sistema.switchTab('dashboard');
            }
            
        } catch (error) {
            console.error('❌ Erro ao criar empréstimo:', error);
            this.showToast('❌ Erro ao processar empréstimo', 'error');
        }
    }

    async devolverNotebook(notebookId) {
        if (!confirm('Confirma a devolução deste notebook?')) return;
        
        const observacoes = prompt('Observações sobre a devolução (opcional):') || '';
        
        try {
            // Encontrar empréstimo ativo
            const emprestimoAtivo = Object.values(this.emprestimos).find(emp => 
                emp.notebook_id === notebookId && emp.status === 'ativo'
            );
            
            if (!emprestimoAtivo) {
                this.showToast('❌ Empréstimo ativo não encontrado', 'error');
                return;
            }

            const agora = new Date().toISOString();
            
            // Atualizar em uma transação
            const updates = {};
            updates[`emprestimos/${emprestimoAtivo.id}/status`] = 'devolvido';
            updates[`emprestimos/${emprestimoAtivo.id}/data_devolucao`] = agora;
            updates[`emprestimos/${emprestimoAtivo.id}/observacoes_devolucao`] = observacoes;
            updates[`notebooks/${notebookId}/status`] = 'disponivel';
            updates[`notebooks/${notebookId}/colaborador`] = null;
            updates[`notebooks/${notebookId}/setor`] = null;
            updates[`notebooks/${notebookId}/chamado`] = null;
            updates[`notebooks/${notebookId}/data_entrega`] = null;
            updates[`notebooks/${notebookId}/previsao_devolucao`] = null;

            await database.ref().update(updates);
            
            this.showToast('✅ Notebook devolvido com sucesso!', 'success');
            
        } catch (error) {
            console.error('❌ Erro ao devolver notebook:', error);
            this.showToast('❌ Erro ao devolver notebook', 'error');
        }
    }

    getEmprestimosAtivos() {
        return Object.values(this.emprestimos).filter(emp => emp.status === 'ativo');
    }

    renderEmprestimosAtivos() {
        const container = document.getElementById('emprestimosAtivos');
        if (!container) return;

        const ativos = this.getEmprestimosAtivos();
        
        if (ativos.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; opacity: 0.7;">
                    <i class="fas fa-clipboard-list" style="font-size: 3rem; margin-bottom: 15px; color: var(--primary-orange);"></i>
                    <p>Nenhum empréstimo ativo</p>
                </div>
            `;
        } else {
            container.innerHTML = ativos.map(emprestimo => {
                const notebook = notebookManager.getNotebookById(emprestimo.notebook_id);
                const previsao = new Date(emprestimo.previsao_devolucao);
                const hoje = new Date();
                const isAtrasado = previsao < hoje;
                const diasRestantes = Math.ceil((previsao - hoje) / (1000 * 60 * 60 * 24));
                
                return `
                    <div class="emprestimo-item" onclick="emprestimoManager.mostrarDetalhes(${emprestimo.id})">
                        <div class="emprestimo-header">
                            <span class="emprestimo-notebook">${notebook ? notebook.numero : 'N/A'}</span>
                            <span class="emprestimo-status ${isAtrasado ? 'status-atrasado' : 'status-ativo'}">
                                ${isAtrasado ? `Atrasado (${Math.abs(diasRestantes)} dias)` : 
                                  diasRestantes === 0 ? 'Vence Hoje' :
                                  diasRestantes === 1 ? 'Vence Amanhã' :
                                  `${diasRestantes} dias restantes`}
                            </span>
                        </div>
                        <div class="emprestimo-info">
                            <div><strong>Colaborador</strong><span>${emprestimo.colaborador}</span></div>
                            <div><strong>Setor</strong><span>${emprestimo.setor}</span></div>
                            <div><strong>Chamado</strong><span>${emprestimo.chamado}</span></div>
                            <div><strong>Devolução</strong><span>${FirebaseUtils.formatDate(emprestimo.previsao_devolucao)}</span></div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    renderHistorico() {
        // Implementar renderização do histórico
        console.log('📊 Renderizando histórico...');
    }

    mostrarDetalhes(id) {
        const emprestimo = this.emprestimos[id];
        if (!emprestimo) return;
        
        const notebook = notebookManager.getNotebookById(emprestimo.notebook_id);
        
        alert(`
Empréstimo: ${notebook ? notebook.numero : 'N/A'}
Colaborador: ${emprestimo.colaborador}
Setor: ${emprestimo.setor}
Chamado: ${emprestimo.chamado}
Data Entrega: ${FirebaseUtils.formatDate(emprestimo.data_entrega)}
Previsão Devolução: ${FirebaseUtils.formatDate(emprestimo.previsao_devolucao)}
        `);
    }

    showToast(message, type = 'success') {
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}

// Instanciar gerenciador
const emprestimoManager = new EmprestimoManager();
