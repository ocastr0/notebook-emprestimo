// realtime.js - Sistema de atualizações em tempo real
class RealtimeManager {
    constructor() {
        this.isConnected = false;
        this.lastActivity = Date.now();
        this.init();
    }

    init() {
        this.setupConnectionMonitoring();
        this.setupActivityTracking();
        this.setupNotifications();
    }

    setupConnectionMonitoring() {
        // Monitorar conexão Firebase
        const connectedRef = database.ref('.info/connected');
        connectedRef.on('value', (snapshot) => {
            if (snapshot.val() === true) {
                this.isConnected = true;
                this.showConnectionStatus('🟢 Online', 'success');
                console.log('🔗 Conectado ao Firebase');
            } else {
                this.isConnected = false;
                this.showConnectionStatus('🔴 Offline', 'error');
                console.log('❌ Desconectado do Firebase');
            }
        });
    }

    setupActivityTracking() {
        // Registrar atividade do usuário
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        
        events.forEach(event => {
            document.addEventListener(event, () => {
                this.lastActivity = Date.now();
            }, { passive: true });
        });

        // Verificar inatividade a cada minuto
        setInterval(() => {
            const inactiveTime = Date.now() - this.lastActivity;
            const minutes = Math.floor(inactiveTime / 60000);
            
            if (minutes >= 30) {
                this.showInactivityWarning();
            }
        }, 60000);
    }

    setupNotifications() {
        // Notificações de mudanças importantes
        dbRefs.emprestimos.on('child_added', (snapshot) => {
            const emprestimo = snapshot.val();
            if (emprestimo && Date.now() - emprestimo.data_criacao < 5000) {
                this.showNotification(`📋 Novo empréstimo: ${emprestimo.colaborador}`, 'info');
            }
        });

        dbRefs.emprestimos.on('child_changed', (snapshot) => {
            const emprestimo = snapshot.val();
            if (emprestimo && emprestimo.status === 'devolvido') {
                this.showNotification(`✅ Notebook devolvido por ${emprestimo.colaborador}`, 'success');
            }
        });
    }

    showConnectionStatus(message, type) {
        const statusEl = document.getElementById('connectionStatus');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = `connection-status ${type}`;
        }
    }

    showInactivityWarning() {
        if (confirm('Você está inativo há muito tempo. Deseja continuar?')) {
            this.lastActivity = Date.now();
        }
    }

    showNotification(message, type = 'info') {
        // Remover notificações antigas
        document.querySelectorAll('.realtime-notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `realtime-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: var(--primary-orange);
            color: white;
            border-radius: 8px;
            z-index: 1001;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    // Sync manual para casos de emergência
    async forcSync() {
        try {
            console.log('🔄 Forçando sincronização...');
            
            // Recarregar todos os dados
            await Promise.all([
                dbRefs.notebooks.once('value'),
                dbRefs.emprestimos.once('value'),
                dbRefs.setores.once('value'),
                dbRefs.stats.once('value')
            ]);
            
            this.showNotification('🔄 Dados sincronizados!', 'success');
            
        } catch (error) {
            console.error('❌ Erro na sincronização:', error);
            this.showNotification('❌ Erro na sincronização', 'error');
        }
    }

    // Backup automático
    async autoBackup() {
        if (!this.isConnected) return;
        
        try {
            const backup = {
                timestamp: FirebaseUtils.timestamp(),
                data: {
                    notebooks: notebookManager.notebooks,
                    emprestimos: emprestimoManager.emprestimos,
                    setores: setorManager.setores
                }
            };
            
            await database.ref('backups').push(backup);
            console.log('💾 Backup automático realizado');
            
        } catch (error) {
            console.error('❌ Erro no backup:', error);
        }
    }
}

// Instanciar gerenciador
const realtimeManager = new RealtimeManager();

// Backup automático a cada hora
setInterval(() => {
    realtimeManager.autoBackup();
}, 3600000);
