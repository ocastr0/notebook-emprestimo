class SistemaEmprestimos {
    constructor() {
        this.notebooks = [];
        this.emprestimos = [];
        this.setores = [];
        this.baseURL = window.location.origin;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setMinDate();
        await this.loadAllData();
        this.startAutoRefresh();
        this.showToast('🎉 Sistema carregado com Firebase!', 'success');
    }

    setupEventListeners() {
        // Navegação entre tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.closest('.tab-btn').dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Formulário de empréstimo
        const form = document.getElementById('formSolicitacao');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.criarSolicitacao();
            });
        }
    }

    async loadAllData() {
        try {
            await Promise.all([
                this.loadNotebooks(),
                this.loadEmprestimosAtivos(),
                this.loadSetores(),
                this.loadStats()
            ]);
            
            this.renderDashboard();
            this.updateNotebookOptions();
            this.updateSetorOptions();
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            this.showToast('Erro ao carregar dados', 'error');
        }
    }

    async loadNotebooks() {
        try {
            console.log('📡 Carregando notebooks...');
            const response = await fetch(`${this.baseURL}/api/notebooks`);
            this.notebooks = await response.json();
            console.log('✅ Notebooks carregados:', this.notebooks.length);
        } catch (error) {
            console.error('❌ Erro ao carregar notebooks:', error);
            this.notebooks = this.getDefaultNotebooks();
        }
    }

    async loadEmprestimosAtivos() {
        try {
            const response = await fetch(`${this.baseURL}/api/emprestimos?action=ativos`);
            this.emprestimosAtivos = await response.json();
        } catch (error) {
            console.error('❌ Erro ao carregar empréstimos:', error);
            this.emprestimosAtivos = [];
        }
    }

    async loadSetores() {
        try {
            const response = await fetch(`${this.baseURL}/api/setores`);
            this.setores = await response.json();
        } catch (error) {
            console.error('❌ Erro ao carregar setores:', error);
            this.setores = [];
        }
    }

    async loadStats() {
        try {
            const response = await fetch(`${this.baseURL}/api/stats`);
            const stats = await response.json();
            
            document.getElementById('disponiveisCount').textContent = stats.disponiveis;
            document.getElementById('emprestadosCount').textContent = stats.em_uso;
        } catch (error) {
            console.error('❌ Erro ao carregar estatísticas:', error);
        }
    }

    async criarSolicitacao() {
        const nome = document.getElementById('nomeColaborador').value.trim();
        const setor = document.getElementById('setorColaborador').value;
        const notebookId = parseInt(document.getElementById('notebookSelecionado').value);
        const chamado = document.getElementById('numeroChamado').value.trim();
        const motivo = document.getElementById('motivoEmprestimo').value.trim();
        const previsaoDevolucao = document.getElementById('dataPrevisaoDevolucao').value;

        if (!nome || !setor || !notebookId || !chamado || !motivo || !previsaoDevolucao) {
            this.showToast('Todos os campos são obrigatórios!', 'error');
            return;
        }

        try {
            this.showToast('📡 Criando empréstimo...', 'warning');
            
            const response = await fetch(`${this.baseURL}/api/emprestimos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'criar',
                    notebook_id: notebookId,
                    colaborador: nome,
                    setor: setor,
                    chamado: chamado,
                    motivo: motivo,
                    previsao_devolucao: previsaoDevolucao
                })
            });

            const result = await response.json();
            
            if (result.success) {
                document.getElementById('formSolicitacao').reset();
                this.setMinDate();
                this.showToast('✅ Empréstimo criado com sucesso!', 'success');
                this.switchTab('dashboard');
                await this.loadAllData();
            } else {
                this.showToast('❌ Erro ao criar empréstimo', 'error');
            }
        } catch (error) {
            console.error('❌ Erro:', error);
            this.showToast('❌ Erro de conexão', 'error');
        }
    }

    async devolverNotebook(notebookId) {
        if (!confirm('Confirma a devolução deste notebook?')) return;
        
        const observacoes = prompt('Observações (opcional):') || '';
        
        try {
            this.showToast('📡 Processando devolução...', 'warning');
            
            const response = await fetch(`${this.baseURL}/api/emprestimos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'devolver',
                    notebook_id: notebookId,
                    observacoes: observacoes
                })
            });

            const result = await response.json();
            
            if (result.success) {
                this.showToast('✅ Notebook devolvido com sucesso!', 'success');
                await this.loadAllData();
            } else {
                this.showToast('❌ Erro ao devolver notebook', 'error');
            }
        } catch (error) {
            console.error('❌ Erro:', error);
            this.showToast('❌ Erro de conexão', 'error');
        }
    }

    renderDashboard() {
        // Renderizar notebooks
        const container = document.getElementById('notebooksContainer');
        if (!container) return;

        if (this.notebooks.length === 0) {
            container.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i><p>Carregando notebooks...</p></div>';
            return;
        }

        container.innerHTML = this.notebooks.map(notebook => {
            const isAtrasado = notebook.status === 'emprestado' && this.isAtrasado(notebook.previsao_devolucao);
            
            return `
                <div class="notebook-card ${notebook.status}">
                    <div class="notebook-icon">
                        <i class="fas fa-laptop"></i>
                    </div>
                    <div class="notebook-number">${notebook.numero}</div>
                    <div class="notebook-status status-${notebook.status}">
                        ${notebook.status === 'disponivel' ? 'Disponível' : 'Em Uso'}
                        ${isAtrasado ? ' (Atrasado)' : ''}
                    </div>
                    ${notebook.status === 'emprestado' ? `
                        <div class="notebook-info">
                            <strong>${notebook.colaborador}</strong><br>
                            <span style="color: var(--light-orange);">${notebook.setor}</span><br>
                            <small>Chamado: ${notebook.chamado}</small><br>
                            <small>Devolução: ${this.formatDate(notebook.previsao_devolucao)}</small>
                        </div>
                    ` : '<div class="notebook-info">Pronto para empréstimo</div>'}
                    <div class="notebook-actions">
                        ${notebook.status === 'emprestado' ? `
                            <button class="btn-danger btn-small" onclick="sistema.devolverNotebook(${notebook.id})">
                                <i class="fas fa-undo"></i> Devolver
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Renderizar empréstimos ativos
        const emprestimosContainer = document.getElementById('emprestimosAtivos');
        if (!emprestimosContainer) return;

        if (!this.emprestimosAtivos || this.emprestimosAtivos.length === 0) {
            emprestimosContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; opacity: 0.7;">
                    <i class="fas fa-clipboard-list" style="font-size: 3rem; margin-bottom: 15px; color: var(--primary-orange);"></i>
                    <p>Nenhum empréstimo ativo</p>
                </div>
            `;
        } else {
            emprestimosContainer.innerHTML = this.emprestimosAtivos.map(emprestimo => {
                const previsao = new Date(emprestimo.previsao_devolucao);
                const hoje = new Date();
                const isAtrasado = previsao < hoje;
                const diasRestantes = Math.ceil((previsao - hoje) / (1000 * 60 * 60 * 24));
                
                return `
                    <div class="emprestimo-item">
                        <div class="emprestimo-header">
                            <span class="emprestimo-notebook">${emprestimo.notebook_numero}</span>
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
                            <div><strong>Devolução</strong><span>${this.formatDate(emprestimo.previsao_devolucao)}</span></div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    updateNotebookOptions() {
        const select = document.getElementById('notebookSelecionado');
        if (!select) return;

        const notebooksDisponiveis = this.notebooks.filter(nb => nb.status === 'disponivel');
        
        select.innerHTML = '<option value="">Selecione um notebook disponível</option>';
        
        if (notebooksDisponiveis.length === 0) {
            select.innerHTML = '<option value="">Nenhum notebook disponível</option>';
            select.disabled = true;
        } else {
            select.disabled = false;
            notebooksDisponiveis.forEach(notebook => {
                const option = document.createElement('option');
                option.value = notebook.id;
                option.textContent = `${notebook.numero} (Série: ${notebook.serie})`;
                select.appendChild(option);
            });
        }
    }

    updateSetorOptions() {
        const select = document.getElementById('setorColaborador');
        if (!select) return;

        select.innerHTML = '<option value="">Selecione o setor</option>';
        this.setores.forEach(setor => {
            const option = document.createElement('option');
            option.value = setor.nome;
            option.textContent = setor.nome;
            select.appendChild(option);
        });
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');
    }

    setMinDate() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const minDate = tomorrow.toISOString().split('T')[0];
        
        const dateInput = document.getElementById('dataPrevisaoDevolucao');
        if (dateInput) {
            dateInput.min = minDate;
        }
    }

    startAutoRefresh() {
        // Atualiza dados a cada 30 segundos
        setInterval(async () => {
            await this.loadAllData();
        }, 30000);
    }

    getDefaultNotebooks() {
        const notebooks = [];
        for (let i = 1; i <= 15; i++) {
            notebooks.push({
                id: i,
                numero: `EMPRESTIMO_${i.toString().padStart(2, '0')}`,
                serie: `${Math.floor(Math.random() * 9000) + 1000}DD3`,
                rfid: `RF${200794 + i}`,
                status: 'disponivel'
            });
        }
        return notebooks;
    }

    isAtrasado(previsaoDevolucao) {
        if (!previsaoDevolucao) return false;
        const previsao = new Date(previsaoDevolucao);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        previsao.setHours(0, 0, 0, 0);
        return previsao < hoje;
    }

    formatDate(dateString) {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR');
    }

    showToast(message, type = 'success') {
        document.querySelectorAll('.toast').forEach(toast => toast.remove());

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'toastSlideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Inicializar sistema
let sistema;
document.addEventListener('DOMContentLoaded', function() {
    sistema = new SistemaEmprestimos();
});
