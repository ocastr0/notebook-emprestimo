// notebook.js - Funcionalidades dos notebooks
class NotebookManager {
    constructor() {
        this.notebooks = {};
        this.init();
    }

    init() {
        this.setupRealtimeListeners();
    }

    setupRealtimeListeners() {
        // Listener em tempo real para notebooks
        dbRefs.notebooks.on('value', (snapshot) => {
            if (snapshot.exists()) {
                this.notebooks = snapshot.val();
                this.renderNotebooks();
                this.updateStats();
                console.log('📡 Notebooks atualizados:', Object.keys(this.notebooks).length);
            }
        });
    }

    async addNotebook(data) {
        try {
            const nextId = Math.max(...Object.keys(this.notebooks).map(k => parseInt(k))) + 1;
            
            const novoNotebook = {
                id: nextId,
                numero: data.numero,
                serie: data.serie,
                rfid: data.rfid,
                modelo: data.modelo || '',
                processador: data.processador || '',
                memoria: data.memoria || '',
                descricao: data.descricao || '',
                status: 'disponivel',
                colaborador: null,
                setor: null,
                chamado: null,
                data_entrega: null,
                previsao_devolucao: null,
                data_cadastro: FirebaseUtils.timestamp()
            };

            await dbRefs.notebooks.child(nextId).set(novoNotebook);
            this.showToast('✅ Notebook adicionado com sucesso!', 'success');
            return true;
        } catch (error) {
            console.error('❌ Erro ao adicionar notebook:', error);
            this.showToast('❌ Erro ao adicionar notebook', 'error');
            return false;
        }
    }

    async updateNotebook(id, data) {
        try {
            const updates = {
                ...data,
                data_atualizacao: FirebaseUtils.timestamp()
            };
            
            await dbRefs.notebooks.child(id).update(updates);
            this.showToast('✅ Notebook atualizado!', 'success');
            return true;
        } catch (error) {
            console.error('❌ Erro ao atualizar notebook:', error);
            this.showToast('❌ Erro ao atualizar notebook', 'error');
            return false;
        }
    }

    getNotebooksDisponiveis() {
        return Object.values(this.notebooks).filter(nb => nb.status === 'disponivel');
    }

    getNotebookById(id) {
        return this.notebooks[id];
    }

    renderNotebooks() {
        const container = document.getElementById('notebooksContainer');
        if (!container) return;

        const notebooksArray = Object.values(this.notebooks);
        
        if (notebooksArray.length === 0) {
            container.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i><p>Carregando notebooks...</p></div>';
            return;
        }

        container.innerHTML = notebooksArray.map(notebook => {
            const isAtrasado = notebook.status === 'emprestado' && FirebaseUtils.isAtrasado(notebook.previsao_devolucao);
            
            return `
                <div class="notebook-card ${notebook.status}" onclick="notebookManager.mostrarDetalhes(${notebook.id})">
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
                            <small>Devolução: ${FirebaseUtils.formatDate(notebook.previsao_devolucao)}</small>
                        </div>
                    ` : '<div class="notebook-info">Pronto para empréstimo</div>'}
                    <div class="notebook-actions">
                        ${notebook.status === 'emprestado' ? `
                            <button class="btn-danger btn-small" onclick="event.stopPropagation(); emprestimoManager.devolverNotebook(${notebook.id})">
                                <i class="fas fa-undo"></i> Devolver
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    updateStats() {
        const total = Object.keys(this.notebooks).length;
        const disponiveis = Object.values(this.notebooks).filter(nb => nb.status === 'disponivel').length;
        const emprestados = total - disponiveis;

        // Atualizar stats no Firebase
        dbRefs.stats.update({
            total_notebooks: total,
            disponiveis: disponiveis,
            em_uso: emprestados,
            ultima_atualizacao: FirebaseUtils.timestamp()
        });
    }

    mostrarDetalhes(id) {
        const notebook = this.getNotebookById(id);
        if (!notebook) return;
        
        alert(`
Notebook: ${notebook.numero}
Série: ${notebook.serie}
RFID: ${notebook.rfid}
Status: ${notebook.status}
${notebook.modelo ? `Modelo: ${notebook.modelo}` : ''}
${notebook.colaborador ? `Colaborador: ${notebook.colaborador}` : ''}
        `);
    }

    showToast(message, type = 'success') {
        // Implementar toast notification
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}

// Instanciar gerenciador
const notebookManager = new NotebookManager();
