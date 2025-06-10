// script.js - Sistema principal integrado
class SistemaEmprestimos {
    constructor() {
        this.currentTab = 'dashboard';
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setMinDate();
        
        // Aguardar carregamento dos gerenciadores
        await this.waitForManagers();
        
        this.showToast('🎉 Sistema carregado com Firebase!', 'success');
        console.log('🚀 Sistema de Empréstimos iniciado!');
    }

    async waitForManagers() {
        // Aguardar que todos os gerenciadores estejam prontos
        let attempts = 0;
        while (attempts < 50) {
            if (window.notebookManager && window.emprestimoManager && window.setorManager && window.statsManager) {
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
    }

    setupEventListeners() {
        // Navegação entre tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.closest('.tab-btn').dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Teclas de atalho
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.switchTab('dashboard');
                        break;
                    case '2':
                        e.preventDefault();
                        this.switchTab('solicitar');
                        break;
                    case '3':
                        e.preventDefault();
                        this.switchTab('historico');
                        break;
                    case 's':
                        e.preventDefault();
                        realtimeManager.forcSync();
                        break;
                    case 'b':
                        e.preventDefault();
                        statsManager.exportarDados();
                        break;
                }
            }
        });

        // Auto-save do formulário
        const form = document.getElementById('formSolicitacao');
        if (form) {
            form.addEventListener('input', this.debounce(() => {
                this.saveFormData();
            }, 1000));
        }
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        const tabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        const tabContent = document.getElementById(tabName);
        
        if (tabBtn) tabBtn.classList.add('active');
        if (tabContent) tabContent.classList.add('active');

        // Ações específicas por tab
        switch (tabName) {
            case 'dashboard':
                this.updateNotebookOptions();
                break;
            case 'solicitar':
                this.updateNotebookOptions();
                this.loadFormData();
                break;
            case 'historico':
                this.renderHistoricoCompleto();
                break;
            case 'setores':
                setorManager.renderSetores();
                break;
        }
    }

    updateNotebookOptions() {
        const select = document.getElementById('notebookSelecionado');
        if (!select || !notebookManager) return;

        const notebooksDisponiveis = notebookManager.getNotebooksDisponiveis();
        
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

    renderHistoricoCompleto() {
        // Implementar renderização completa do histórico
        if (emprestimoManager) {
            emprestimoManager.renderHistorico();
        }
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

    saveFormData() {
        const formData = {
            nome: document.getElementById('nomeColaborador')?.value || '',
            setor: document.getElementById('setorColaborador')?.value || '',
            chamado: document.getElementById('numeroChamado')?.value || '',
            motivo: document.getElementById('motivoEmprestimo')?.value || '',
            timestamp: Date.now()
        };
        
        localStorage.setItem('formDraft', JSON.stringify(formData));
    }

    loadFormData() {
        const saved = localStorage.getItem('formDraft');
        if (!saved) return;
        
        try {
            const formData = JSON.parse(saved);
            
            // Só carregar se foi salvo nas últimas 24 horas
            if (Date.now() - formData.timestamp < 86400000) {
                const campos = {
                    'nomeColaborador': formData.nome,
                    'setorColaborador': formData.setor,
                    'numeroChamado': formData.chamado,
                    'motivoEmprestimo': formData.motivo
                };
                
                Object.entries(campos).forEach(([id, valor]) => {
                    const input = document.getElementById(id);
                    if (input && valor) {
                        input.value = valor;
                    }
                });
            }
        } catch (error) {
            console.error('Erro ao carregar dados salvos:', error);
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    showToast(message, type = 'success') {
        document.querySelectorAll('.toast').forEach(toast => toast.remove());

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 12px;
            color: white;
            font-weight: 600;
            z-index: 1001;
            animation: toastSlideIn 0.3s ease-out;
        `;
        
        // Cores baseadas no tipo
        const colors = {
            success: '#4CAF50',
            error: '#F44336',
            warning: '#FFC107',
            info: '#2196F3'
        };
        
        toast.style.background = colors[type] || colors.success;
        if (type === 'warning') toast.style.color = '#000';
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'toastSlideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }
}

// Inicializar sistema quando documento carregar
let sistema;
document.addEventListener('DOMContentLoaded', function() {
    sistema = new SistemaEmprestimos();
});
