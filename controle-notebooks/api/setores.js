// setores.js - Funcionalidades de setores
class SetorManager {
    constructor() {
        this.setores = {};
        this.init();
    }

    init() {
        this.setupRealtimeListeners();
        this.setupEventListeners();
    }

    setupRealtimeListeners() {
        dbRefs.setores.on('value', (snapshot) => {
            if (snapshot.exists()) {
                this.setores = snapshot.val();
                this.updateSetorOptions();
                this.renderSetores();
                console.log('📡 Setores atualizados:', Object.keys(this.setores).length);
            }
        });
    }

    setupEventListeners() {
        // Botão adicionar setor
        const addBtn = document.getElementById('adicionarSetor');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.adicionarSetor());
        }

        // Enter no input
        const input = document.getElementById('novoSetor');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.adicionarSetor();
                }
            });
        }
    }

    async adicionarSetor() {
        const input = document.getElementById('novoSetor');
        if (!input) return;

        const nomoSetor = input.value.trim();

        if (!nomoSetor) {
            this.showToast('Digite o nome do setor!', 'error');
            return;
        }

        if (nomoSetor.length < 2) {
            this.showToast('Nome do setor deve ter pelo menos 2 caracteres!', 'error');
            return;
        }

        // Verificar se já existe
        const existe = Object.values(this.setores).some(setor => 
            setor.nome.toLowerCase() === nomoSetor.toLowerCase()
        );

        if (existe) {
            this.showToast('Este setor já existe!', 'error');
            return;
        }

        try {
            const nextId = Math.max(...Object.keys(this.setores).map(k => parseInt(k))) + 1;
            
            const novoSetor = {
                id: nextId,
                nome: nomoSetor,
                ativo: true,
                data_criacao: FirebaseUtils.timestamp()
            };

            await dbRefs.setores.child(nextId).set(novoSetor);
            
            input.value = '';
            this.showToast('✅ Setor adicionado com sucesso!', 'success');
            
        } catch (error) {
            console.error('❌ Erro ao adicionar setor:', error);
            this.showToast('❌ Erro ao adicionar setor', 'error');
        }
    }

    async removerSetor(id) {
        if (!confirm('Tem certeza que deseja remover este setor?')) return;

        try {
            await dbRefs.setores.child(id).update({ ativo: false });
            this.showToast('✅ Setor removido!', 'success');
        } catch (error) {
            console.error('❌ Erro ao remover setor:', error);
            this.showToast('❌ Erro ao remover setor', 'error');
        }
    }

    getSetoresAtivos() {
        return Object.values(this.setores).filter(setor => setor.ativo !== false);
    }

    updateSetorOptions() {
        // Atualizar selects de setores
        const selects = ['setorColaborador', 'filtroSetor'];
        
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (!select) return;
            
            const valorAtual = select.value;
            const placeholder = selectId === 'filtroSetor' ? 'Todos os setores' : 'Selecione o setor';
            
            select.innerHTML = `<option value="">${placeholder}</option>`;
            
            this.getSetoresAtivos().forEach(setor => {
                const option = document.createElement('option');
                option.value = setor.nome;
                option.textContent = setor.nome;
                select.appendChild(option);
            });
            
            select.value = valorAtual;
        });
    }

    renderSetores() {
        const container = document.getElementById('setoresList');
        if (!container) return;

        const setoresAtivos = this.getSetoresAtivos();

        container.innerHTML = setoresAtivos.map(setor => `
            <div class="setor-item">
                <span>${setor.nome}</span>
                <button class="btn-danger btn-small" onclick="setorManager.removerSetor(${setor.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    showToast(message, type = 'success') {
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}

// Instanciar gerenciador
const setorManager = new SetorManager();
