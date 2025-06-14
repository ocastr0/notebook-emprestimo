<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema de Empréstimos - Notebooks</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <script src="https://www.gstatic.com/firebasejs/11.9.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/11.9.0/firebase-auth-compat.js"></script>

    
    <style>
        /* Reset e Base */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --primary-orange: #FF6B35;
            --dark-orange: #E55100;
            --light-orange: #FFB74D;
            --black: #1a1a1a;
            --dark-gray: #2c2c2c;
            --medium-gray: #404040;
            --light-gray: #f5f5f5;
            --white: #ffffff;
            --success: #4CAF50;
            --warning: #FFC107;
            --danger: #F44336;
            --info: #2196F3;
            --shadow: 0 4px 20px rgba(0,0,0,0.1);
            --shadow-hover: 0 8px 30px rgba(0,0,0,0.15);
            --border-radius: 12px;
            --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, var(--black) 0%, var(--dark-gray) 100%);
            color: var(--white);
            min-height: 100vh;
            line-height: 1.6;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }

        /* Header */
        .header {
            background: linear-gradient(135deg, var(--primary-orange) 0%, var(--dark-orange) 100%);
            border-radius: var(--border-radius);
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: var(--shadow);
        }

        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
        }

        .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--white);
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .header-stats {
            display: flex;
            gap: 20px;
        }

        .stat-card {
            background: rgba(255,255,255,0.15);
            padding: 20px;
            border-radius: var(--border-radius);
            text-align: center;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            min-width: 120px;
        }

        .stat-number {
            display: block;
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--white);
        }

        .stat-label {
            font-size: 0.9rem;
            opacity: 0.9;
        }

        /* Navigation */
        .nav-tabs {
            display: flex;
            background: var(--dark-gray);
            border-radius: var(--border-radius);
            padding: 10px;
            margin-bottom: 30px;
            box-shadow: var(--shadow);
            gap: 5px;
        }

        .tab-btn {
            flex: 1;
            padding: 15px 20px;
            background: transparent;
            border: none;
            color: var(--white);
            cursor: pointer;
            border-radius: calc(var(--border-radius) - 5px);
            font-size: 1rem;
            font-weight: 600;
            transition: var(--transition);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }

        .tab-btn:hover {
            background: rgba(255,107,53,0.1);
            color: var(--primary-orange);
        }

        .tab-btn.active {
            background: var(--primary-orange);
            color: var(--white);
        }

        /* Tab Content */
        .tab-content {
            display: none;
            animation: fadeIn 0.3s ease-in-out;
        }

        .tab-content.active {
            display: block;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Dashboard */
        .dashboard-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 30px;
        }

        .notebooks-grid h2,
        .emprestimos-ativos h2 {
            color: var(--primary-orange);
            margin-bottom: 20px;
            font-size: 1.8rem;
            font-weight: 700;
        }

        .notebooks-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
        }

        .notebook-card {
            background: var(--dark-gray);
            border-radius: var(--border-radius);
            padding: 25px;
            text-align: center;
            transition: var(--transition);
            border: 2px solid transparent;
            position: relative;
            cursor: pointer;
        }

        .notebook-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--primary-orange);
        }

        .notebook-card.disponivel {
            border-color: var(--success);
        }

        .notebook-card.disponivel::before {
            background: var(--success);
        }

        .notebook-card.emprestado {
            border-color: var(--danger);
        }

        .notebook-card.emprestado::before {
            background: var(--danger);
        }

        .notebook-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-hover);
        }

        .notebook-icon {
            font-size: 3.5rem;
            margin-bottom: 15px;
            color: var(--primary-orange);
        }

        .notebook-number {
            font-size: 1.3rem;
            font-weight: 700;
            margin-bottom: 12px;
        }

        .notebook-status {
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
            margin-bottom: 15px;
            display: inline-block;
        }

        .status-disponivel {
            background: var(--success);
            color: var(--white);
        }

        .status-emprestado {
            background: var(--danger);
            color: var(--white);
        }

        .notebook-info {
            font-size: 0.95rem;
            opacity: 0.85;
            margin-bottom: 20px;
            line-height: 1.5;
        }

        .notebook-info strong {
            color: var(--primary-orange);
        }

        .notebook-actions {
            display: flex;
            gap: 10px;
            justify-content: center;
        }

        /* Empréstimos Ativos */
        .emprestimos-list {
            background: var(--dark-gray);
            border-radius: var(--border-radius);
            padding: 25px;
            max-height: 650px;
            overflow-y: auto;
        }

        .emprestimo-item {
            background: rgba(255,107,53,0.1);
            border: 1px solid var(--primary-orange);
            border-radius: var(--border-radius);
            padding: 20px;
            margin-bottom: 15px;
            transition: var(--transition);
            cursor: pointer;
        }

        .emprestimo-item:hover {
            background: rgba(255,107,53,0.2);
            transform: translateX(5px);
        }

        .emprestimo-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            flex-wrap: wrap;
        }

        .emprestimo-notebook {
            font-weight: 700;
            color: var(--primary-orange);
            font-size: 1.1rem;
        }

        .emprestimo-status {
            padding: 6px 12px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .status-ativo {
            background: var(--warning);
            color: var(--black);
        }

        .status-atrasado {
            background: var(--danger);
            color: var(--white);
        }

        .emprestimo-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            font-size: 0.9rem;
        }

        .emprestimo-info > div {
            display: flex;
            flex-direction: column;
        }

        .emprestimo-info strong {
            color: var(--light-orange);
            font-size: 0.8rem;
            text-transform: uppercase;
        }

        /* Formulário */
        .form-container {
            background: var(--dark-gray);
            border-radius: var(--border-radius);
            padding: 40px;
            max-width: 700px;
            margin: 0 auto;
            box-shadow: var(--shadow);
        }

        .form-container h2 {
            color: var(--primary-orange);
            margin-bottom: 30px;
            text-align: center;
            font-size: 2rem;
        }

        .form-group {
            margin-bottom: 25px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: var(--primary-orange);
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 15px;
            border: 2px solid var(--medium-gray);
            border-radius: var(--border-radius);
            background: var(--black);
            color: var(--white);
            font-size: 1rem;
            transition: var(--transition);
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: var(--primary-orange);
            box-shadow: 0 0 0 3px rgba(255,107,53,0.1);
        }

        .form-group small {
            color: var(--light-orange);
            font-size: 0.8rem;
            margin-top: 5px;
            display: block;
        }

        .form-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-top: 30px;
        }

        /* Gestão de Setores */
        .setores-management {
            background: var(--dark-gray);
            border-radius: var(--border-radius);
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: var(--shadow);
        }

        .setores-management h3 {
            color: var(--primary-orange);
            margin-bottom: 20px;
            font-size: 1.5rem;
        }

        .setores-form {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            align-items: end;
        }

        .setores-form input {
            flex: 1;
            padding: 10px;
            border: 2px solid var(--medium-gray);
            border-radius: var(--border-radius);
            background: var(--black);
            color: var(--white);
        }

        .setores-list {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }

        .setor-item {
            background: rgba(255,107,53,0.1);
            border: 1px solid var(--primary-orange);
            border-radius: 20px;
            padding: 8px 16px;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 0.9rem;
        }

        .setor-remove {
            background: var(--danger);
            color: var(--white);
            border: none;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            cursor: pointer;
            font-size: 0.7rem;
        }

        /* Botões */
        .btn-primary,
        .btn-secondary,
        .btn-success,
        .btn-danger,
        .btn-info,
        .btn-warning {
            padding: 12px 24px;
            border: none;
            border-radius: var(--border-radius);
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }

        .btn-primary {
            background: var(--primary-orange);
            color: var(--white);
        }

        .btn-primary:hover {
            background: var(--dark-orange);
            transform: translateY(-2px);
        }

        .btn-secondary {
            background: var(--black);
            color: var(--white);
            border: 2px solid var(--primary-orange);
        }

        .btn-secondary:hover {
            background: var(--primary-orange);
        }

        .btn-danger {
            background: var(--danger);
            color: var(--white);
        }

        .btn-danger:hover {
            background: #d32f2f;
            transform: translateY(-2px);
        }

        .btn-success {
            background: var(--success);
            color: var(--white);
        }

        .btn-info {
            background: var(--info);
            color: var(--white);
        }

        .btn-warning {
            background: var(--warning);
            color: var(--black);
        }

        .btn-small {
            padding: 8px 16px;
            font-size: 0.9rem;
        }

        /* Calendário */
        .calendario-container {
            background: var(--dark-gray);
            border-radius: var(--border-radius);
            padding: 30px;
            box-shadow: var(--shadow);
        }

        .calendario-container h2 {
            color: var(--primary-orange);
            margin-bottom: 30px;
            text-align: center;
            font-size: 2rem;
        }

        .calendario-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
        }

        .calendario-header h3 {
            color: var(--primary-orange);
            font-size: 1.8rem;
        }

        .btn-calendar {
            background: var(--primary-orange);
            color: var(--white);
            border: none;
            padding: 12px;
            border-radius: 50%;
            cursor: pointer;
            transition: var(--transition);
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .btn-calendar:hover {
            background: var(--dark-orange);
            transform: scale(1.1);
        }

        .calendario-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 2px;
            background: var(--black);
            border-radius: var(--border-radius);
            padding: 2px;
        }

        .calendario-day {
            background: var(--dark-gray);
            padding: 15px 8px;
            text-align: center;
            font-size: 0.9rem;
            min-height: 80px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .calendario-day.header {
            background: var(--primary-orange);
            color: var(--white);
            font-weight: 700;
            min-height: 50px;
            justify-content: center;
        }

        .calendario-day.hoje {
            background: var(--primary-orange);
            color: var(--white);
            font-weight: 700;
        }

        .calendario-day.devolucao {
            background: var(--warning);
            color: var(--black);
        }

        .calendario-day.atrasado {
            background: var(--danger);
            color: var(--white);
        }

        .calendario-day.outro-mes {
            opacity: 0.3;
        }

        .calendario-evento {
            background: rgba(255,107,53,0.2);
            border: 1px solid var(--primary-orange);
            border-radius: 4px;
            padding: 2px 4px;
            font-size: 0.7rem;
            margin-top: 2px;
            max-width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            cursor: pointer;
        }

        .calendario-evento:hover {
            background: rgba(255,107,53,0.4);
        }

        /* Histórico */
        .historico-container {
            background: var(--dark-gray);
            border-radius: var(--border-radius);
            padding: 30px;
            box-shadow: var(--shadow);
        }

        .historico-container h2 {
            color: var(--primary-orange);
            margin-bottom: 30px;
            text-align: center;
            font-size: 2rem;
        }

        .historico-filters {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
            padding: 20px;
            background: var(--black);
            border-radius: var(--border-radius);
        }

        .historico-table-container {
            overflow-x: auto;
            border-radius: var(--border-radius);
        }

        .historico-table {
            width: 100%;
            border-collapse: collapse;
            background: var(--black);
            border-radius: var(--border-radius);
            overflow: hidden;
        }

        .historico-table th {
            background: var(--primary-orange);
            color: var(--white);
            padding: 15px;
            text-align: left;
            font-weight: 700;
        }

        .historico-table td {
            padding: 15px;
            border-bottom: 1px solid var(--medium-gray);
        }

        .historico-table tr:hover {
            background: var(--dark-gray);
            cursor: pointer;
        }

        .status-badge {
            padding: 6px 12px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .status-devolvido {
            background: var(--success);
            color: var(--white);
        }

        /* Modal */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 1000;
            backdrop-filter: blur(5px);
        }

        .modal.active {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .modal-content {
            background: var(--dark-gray);
            border-radius: var(--border-radius);
            max-width: 600px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 30px;
            border-bottom: 1px solid var(--medium-gray);
            background: var(--primary-orange);
        }

        .modal-header h3 {
            color: var(--white);
            margin: 0;
        }

        .modal-close {
            background: none;
            border: none;
            color: var(--white);
            font-size: 1.5rem;
            cursor: pointer;
            padding: 5px;
        }

        .modal-body {
            padding: 30px;
        }

        .modal-footer {
            padding: 20px 30px;
            border-top: 1px solid var(--medium-gray);
            display: flex;
            gap: 15px;
            justify-content: flex-end;
        }

        .detalhe-item {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid var(--medium-gray);
        }

        .detalhe-item:last-child {
            border-bottom: none;
        }

        .detalhe-label {
            font-weight: 600;
            color: var(--primary-orange);
        }

        .detalhe-valor {
            color: var(--white);
        }

        /* Toast */
        .toast {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: var(--border-radius);
            color: var(--white);
            font-weight: 600;
            z-index: 1001;
            animation: toastSlideIn 0.3s ease-out;
        }

        .toast.success { background: var(--success); }
        .toast.error { background: var(--danger); }
        .toast.warning { background: var(--warning); color: var(--black); }

        @keyframes toastSlideIn {
            from { opacity: 0; transform: translateX(100%); }
            to { opacity: 1; transform: translateX(0); }
        }

        /* Responsividade */
        @media (max-width: 768px) {
            .container { padding: 15px; }
            .header { padding: 20px; }
            .header-content { flex-direction: column; text-align: center; }
            .header h1 { font-size: 2rem; }
            .nav-tabs { flex-direction: column; }
            .dashboard-grid { grid-template-columns: 1fr; }
            .notebooks-container { grid-template-columns: 1fr; }
            .historico-filters { grid-template-columns: 1fr; }
            .emprestimo-info { grid-template-columns: 1fr; }
            .setores-form { flex-direction: column; }
        }
    </style>
</head>
<body>

<h1 id="bigOne"></h1>

<!-- Firebase compat SDKs -->
<script src="https://www.gstatic.com/firebasejs/11.9.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/11.9.0/firebase-database-compat.js"></script>

<script>
  // Configuração do Firebase
  var firebaseConfig = {
    apiKey: "AIzaSyA-MT3SU98q0RZhEMh1IEpmgEaGXZPpKAQ",
    authDomain: "notebook-emprestimo.firebaseapp.com",
    databaseURL: "https://notebook-emprestimo-default-rtdb.firebaseio.com",
    projectId: "notebook-emprestimo",
    storageBucket: "notebook-emprestimo.firebasestorage.app",
    messagingSenderId: "1007063409338",
    appId: "1:1007063409338:web:5538614ffa1eaf315e5883",
    measurementId: "G-56H4W8HG9Z"
  };

  // Inicializar Firebase
  firebase.initializeApp(firebaseConfig);

  // Referência ao elemento e ao banco de dados
  var bigOne = document.getElementById('bigOne');
  var dbRef = firebase.database().ref().child('isaque');

  // Atualiza o conteúdo da tag <h1> sempre que o valor mudar
  dbRef.on('value', snap => {
    bigOne.innerText = snap.val();
  });
</script>

    <!-- Adicionar nova aba Admin -->
<div class="tab-buttons">
    <button class="tab-btn active" data-tab="dashboard">Dashboard</button>
    <button class="tab-btn" data-tab="solicitar">Nova Solicitação</button>
    <button class="tab-btn" data-tab="calendario">Calendário</button>
    <button class="tab-btn" data-tab="historico">Histórico</button>
    <button class="tab-btn" data-tab="setores">Setores</button>
    <button class="tab-btn" data-tab="admin" id="adminTab" style="display: none;">
        <i class="fas fa-crown"></i> Admin
    </button>
</div>

<!-- Adicionar conteúdo da aba Admin -->
<div id="admin" class="tab-content">
    <div style="background: var(--dark-gray); border-radius: 12px; padding: 30px; margin: 20px 0;">
        <h2 style="color: var(--primary-orange); margin-bottom: 25px; display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-crown"></i> Painel de Administração
        </h2>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
            <!-- Gerenciar Usuários -->
            <div style="background: var(--black); border-radius: 12px; padding: 20px; border: 2px solid var(--primary-orange);">
                <h3 style="color: var(--primary-orange); margin-bottom: 15px;">
                    <i class="fas fa-users"></i> Gerenciar Usuários
                </h3>
                
                <div class="form-group" style="margin-bottom: 15px;">
                    <label style="color: var(--white); display: block; margin-bottom: 8px;">Adicionar Novo Usuário:</label>
                    <input type="email" id="newUserEmail" placeholder="email@exemplo.com" style="width: 100%; padding: 10px; border: 1px solid var(--medium-gray); border-radius: 6px; background: var(--dark-gray); color: var(--white); margin-bottom: 10px;">
                    <input type="text" id="newUserName" placeholder="Nome Completo" style="width: 100%; padding: 10px; border: 1px solid var(--medium-gray); border-radius: 6px; background: var(--dark-gray); color: var(--white); margin-bottom: 10px;">
                    <select id="newUserRole" style="width: 100%; padding: 10px; border: 1px solid var(--medium-gray); border-radius: 6px; background: var(--dark-gray); color: var(--white); margin-bottom: 15px;">
                        <option value="user">Usuário</option>
                        <option value="admin">Administrador</option>
                    </select>
                    <button onclick="sistema.adicionarUsuario()" class="btn-primary" style="width: 100%; padding: 10px;">
                        <i class="fas fa-user-plus"></i> Adicionar Usuário
                    </button>
                </div>
                
                <div id="usersList" style="max-height: 300px; overflow-y: auto;">
                    <!-- Lista de usuários será renderizada aqui -->
                </div>
            </div>
            
            <!-- Alterar Senha Admin -->
            <div style="background: var(--black); border-radius: 12px; padding: 20px; border: 2px solid var(--red);">
                <h3 style="color: var(--red); margin-bottom: 15px;">
                    <i class="fas fa-key"></i> Alterar Senha Admin
                </h3>
                
                <div class="form-group">
                    <input type="password" id="currentPassword" placeholder="Senha Atual" style="width: 100%; padding: 10px; border: 1px solid var(--medium-gray); border-radius: 6px; background: var(--dark-gray); color: var(--white); margin-bottom: 10px;">
                    <input type="password" id="newPassword" placeholder="Nova Senha" style="width: 100%; padding: 10px; border: 1px solid var(--medium-gray); border-radius: 6px; background: var(--dark-gray); color: var(--white); margin-bottom: 10px;">
                    <input type="password" id="confirmNewPassword" placeholder="Confirmar Nova Senha" style="width: 100%; padding: 10px; border: 1px solid var(--medium-gray); border-radius: 6px; background: var(--dark-gray); color: var(--white); margin-bottom: 15px;">
                    <button onclick="sistema.alterarSenhaAdmin()" class="btn-danger" style="width: 100%; padding: 10px;">
                        <i class="fas fa-shield-alt"></i> Alterar Senha
                    </button>
                </div>
            </div>
            
            <!-- Logs de Segurança -->
            <div style="background: var(--black); border-radius: 12px; padding: 20px; border: 2px solid var(--blue); grid-column: 1 / -1;">
                <h3 style="color: var(--blue); margin-bottom: 15px;">
                    <i class="fas fa-shield-check"></i> Logs de Segurança
                </h3>
                <div id="securityLogs" style="max-height: 200px; overflow-y: auto; background: var(--dark-gray); padding: 15px; border-radius: 6px; font-family: monospace; font-size: 0.9rem;">
                    <!-- Logs serão renderizados aqui -->
                </div>
            </div>
        </div>
    </div>
</div>


    <div class="container">
        <!-- Header -->
        <header class="header">
            <div class="header-content">
                <h1><i class="fas fa-laptop"></i> Sistema de Empréstimos</h1>
                <div class="header-stats">
                    <div class="stat-card">
                        <span class="stat-number" id="disponiveisCount">15</span>
                        <span class="stat-label">Disponíveis</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number" id="emprestadosCount">0</span>
                        <span class="stat-label">Em Uso</span>
                    </div>
                </div>
            </div>
        </header>

        <!-- Navigation -->
        <nav class="nav-tabs">
            <button class="tab-btn active" data-tab="dashboard">
                <i class="fas fa-home"></i> Dashboard
            </button>
            <button class="tab-btn" data-tab="solicitar">
                <i class="fas fa-plus"></i> Nova Solicitação
            </button>
            <button class="tab-btn" data-tab="calendario">
                <i class="fas fa-calendar"></i> Calendário
            </button>
            <button class="tab-btn" data-tab="historico">
                <i class="fas fa-history"></i> Histórico
            </button>
            <button class="tab-btn" data-tab="setores">
                <i class="fas fa-building"></i> Setores
            </button>
        </nav>

        <!-- Dashboard Tab -->
        <div class="tab-content active" id="dashboard">
            <div class="dashboard-grid">
                <div class="notebooks-grid">
                    <h2><i class="fas fa-laptop"></i> Status dos Notebooks</h2>
                    <div class="notebooks-container" id="notebooksContainer">
                        <!-- Notebooks serão gerados dinamicamente -->
                    </div>
                </div>
                
                <div class="emprestimos-ativos">
                    <h2><i class="fas fa-clipboard-list"></i> Empréstimos Ativos</h2>
                    <div class="emprestimos-list" id="emprestimosAtivos">
                        <div style="text-align: center; padding: 40px; opacity: 0.7;">
                            <i class="fas fa-clipboard-list" style="font-size: 3rem; margin-bottom: 15px; color: var(--primary-orange);"></i>
                            <p>Nenhum empréstimo ativo</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Solicitar Tab -->
        <div class="tab-content" id="solicitar">
            <div class="form-container">
                <h2>Nova Solicitação de Empréstimo</h2>
                <form id="formSolicitacao">
                    <div class="form-group">
                        <label for="nomeColaborador">Nome do Colaborador:</label>
                        <input type="text" id="nomeColaborador" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="setorColaborador">Setor:</label>
                        <select id="setorColaborador" required>
                            <option value="">Selecione o setor</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="notebookSelecionado">Notebook Desejado:</label>
                        <select id="notebookSelecionado" required>
                            <option value="">Selecione um notebook disponível</option>
                        </select>
                        <small>
                            <i class="fas fa-info-circle"></i> Apenas notebooks disponíveis são exibidos
                        </small>
                    </div>
                    
                    <div class="form-group">
                        <label for="numeroChamado">Número do Chamado:</label>
                        <input type="text" id="numeroChamado" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="motivoEmprestimo">Motivo do Empréstimo:</label>
                        <textarea id="motivoEmprestimo" rows="3" required placeholder="Descreva o motivo da solicitação..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="dataPrevisaoDevolucao">Previsão de Devolução:</label>
                        <input type="date" id="dataPrevisaoDevolucao" required>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-check"></i> Solicitar Empréstimo
                        </button>
                        <button type="reset" class="btn-secondary">
                            <i class="fas fa-times"></i> Limpar
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Calendário Tab -->
        <div class="tab-content" id="calendario">
            <div class="calendario-container">
                <h2>Calendário de Devoluções</h2>
                <div class="calendario-header">
                    <button id="prevMonth" class="btn-calendar"><i class="fas fa-chevron-left"></i></button>
                    <h3 id="currentMonth">Junho 2025</h3>
                    <button id="nextMonth" class="btn-calendar"><i class="fas fa-chevron-right"></i></button>
                </div>
                <div class="calendario-grid" id="calendarioGrid">
                    <!-- Calendário será gerado dinamicamente -->
                </div>
                <div style="display: flex; justify-content: center; gap: 30px; margin-top: 20px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 20px; height: 20px; background: var(--primary-orange); border-radius: 4px;"></div>
                        <span>Hoje</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 20px; height: 20px; background: var(--warning); border-radius: 4px;"></div>
                        <span>Devolução Prevista</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 20px; height: 20px; background: var(--danger); border-radius: 4px;"></div>
                        <span>Atrasado</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Histórico Tab -->
        <div class="tab-content" id="historico">
            <div class="historico-container">
                <h2>Histórico de Empréstimos</h2>
                <div class="historico-filters">
                    <input type="text" id="filtroNome" placeholder="Filtrar por nome...">
                    <select id="filtroSetor">
                        <option value="">Todos os setores</option>
                    </select>
                    <input type="month" id="filtroMes">
                </div>
                <div class="historico-table-container">
                    <table class="historico-table">
                        <thead>
                            <tr>
                                <th>Notebook</th>
                                <th>Colaborador</th>
                                <th>Setor</th>
                                <th>Chamado</th>
                                <th>Entrega</th>
                                <th>Devolução</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody id="historicoTableBody">
                            <tr>
                                <td colspan="7" style="text-align: center; padding: 40px; opacity: 0.7;">
                                    <i class="fas fa-history" style="font-size: 2rem; margin-bottom: 10px; color: var(--primary-orange);"></i><br>
                                    Nenhum histórico disponível
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Setores Tab -->
        <div class="tab-content" id="setores">
            <div class="setores-management">
                <h3><i class="fas fa-building"></i> Gerenciar Setores</h3>
                <div class="setores-form">
                    <input type="text" id="novoSetor" placeholder="Digite o nome do novo setor...">
                    <button type="button" class="btn-primary" onclick="sistema.adicionarSetor()">
                        <i class="fas fa-plus"></i> Adicionar
                    </button>
                </div>
                <div class="setores-list" id="setoresList">
                    <!-- Lista de setores será gerada dinamicamente -->
                </div>
            </div>
            
            <!-- Gestão de Notebooks -->
            <div class="setores-management" style="margin-top: 30px;">
                <h3><i class="fas fa-laptop"></i> Gestão de Notebooks</h3>
                <div style="display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 20px;">
                    <button class="btn-primary" onclick="sistema.abrirModalAdicionarNotebook()">
                        <i class="fas fa-plus"></i> Adicionar Notebook
                    </button>
                    <button class="btn-warning" onclick="sistema.abrirModalEdicaoMassa()">
                        <i class="fas fa-edit"></i> Editar Todos em Massa
                    </button>
                    <button class="btn-primary" onclick="sistema.abrirModalGerarLote()">
                        <i class="fas fa-magic"></i> Gerar em Lote
                    </button>
                    <button class="btn-info" onclick="sistema.exportarConfiguracao()">
                        <i class="fas fa-download"></i> Exportar
                    </button>
                    <label class="btn-warning" for="importarConfig" style="cursor: pointer; margin: 0;">
                        <i class="fas fa-upload"></i> Importar
                        <input type="file" id="importarConfig" accept=".json" style="display: none;" onchange="sistema.importarConfiguracao(this)">
                    </label>
                    <button class="btn-danger" onclick="sistema.resetarNotebooks()">
                        <i class="fas fa-trash"></i> Resetar
                    </button>
                </div>
                
                <!-- Contador de notebooks -->
                <div style="background: var(--black); border-radius: var(--border-radius); padding: 15px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>Total de Notebooks: <strong id="totalNotebooks" style="color: var(--primary-orange);">0</strong></span>
                        <span>Disponíveis: <strong id="disponiveis" style="color: var(--success);">0</strong></span>
                        <span>Em Uso: <strong id="emUso" style="color: var(--danger);">0</strong></span>
                    </div>
                </div>
                
                <!-- Lista de notebooks para edição -->
                <div style="background: var(--black); border-radius: var(--border-radius); padding: 20px;">
                    <h4 style="color: var(--primary-orange); margin-bottom: 15px;">Notebooks Cadastrados</h4>
                    <div id="listaNotebooksEdicao" style="max-height: 400px; overflow-y: auto;">
                        <!-- Lista será preenchida dinamicamente -->
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal para Detalhes -->
        <div class="modal" id="modalDetalhes">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Detalhes do Empréstimo</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body" id="detalhesEmprestimo">
                    <!-- Detalhes serão inseridos dinamicamente -->
                </div>
                <div class="modal-footer">
                    <button class="modal-close btn-secondary">Fechar</button>
                </div>
            </div>
        </div>

        <!-- Modal para Devolução -->
        <div class="modal" id="modalDevolucao">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Confirmar Devolução</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Confirmar devolução do notebook <strong id="notebookDevolucao"></strong>?</p>
                    <div class="form-group">
                        <label for="observacoesDevolucao">Observações:</label>
                        <textarea id="observacoesDevolucao" rows="3"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="confirmarDevolucao" class="btn-primary">Confirmar Devolução</button>
                    <button class="modal-close btn-secondary">Cancelar</button>
                </div>
            </div>
        </div>

        <!-- Modal para Editar Notebook -->
        <div class="modal" id="modalEditarNotebook">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Editar Notebook</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="formEditarNotebook">
                        <div class="form-group">
                            <label for="editNumero">Número do Notebook:</label>
                            <input type="text" id="editNumero" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="editSerie">Número de Série:</label>
                            <input type="text" id="editSerie" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="editRfid">RFID:</label>
                            <input type="text" id="editRfid" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="editDescricao">Descrição (Opcional):</label>
                            <textarea id="editDescricao" rows="3" placeholder="Adicione informações extras sobre o notebook..."></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="editModelo">Modelo (Opcional):</label>
                            <input type="text" id="editModelo" placeholder="Ex: Lenovo ThinkPad, Dell Latitude...">
                        </div>
                        
                        <div class="form-group">
                            <label for="editProcessador">Processador (Opcional):</label>
                            <input type="text" id="editProcessador" placeholder="Ex: Intel i5, AMD Ryzen...">
                        </div>
                        
                        <div class="form-group">
                            <label for="editMemoria">Memória RAM (Opcional):</label>
                            <input type="text" id="editMemoria" placeholder="Ex: 8GB, 16GB...">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button id="salvarEdicaoNotebook" class="btn-primary">
                        <i class="fas fa-save"></i> Salvar Alterações
                    </button>
                    <button class="modal-close btn-secondary">Cancelar</button>
                </div>
            </div>
        </div>

        <!-- Modal para Geração em Lote -->
        <div class="modal" id="modalGerarLote">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Gerar Notebooks em Lote</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="prefixoNumero">Prefixo do Número:</label>
                        <input type="text" id="prefixoNumero" value="EMPRESTIMO_" placeholder="Ex: LAPTOP_, NB_, EMPRESTIMO_">
                    </div>
                    
                    <div class="form-group">
                        <label for="prefixoRfid">Prefixo RFID:</label>
                        <input type="text" id="prefixoRfid" value="RF" placeholder="Ex: RF, RFID, TAG">
                    </div>
                    
                    <div class="form-group">
                        <label for="numeroInicial">Número Inicial:</label>
                        <input type="number" id="numeroInicial" value="1" min="1">
                    </div>
                    
                    <div class="form-group">
                        <label for="rfidInicial">RFID Inicial:</label>
                        <input type="number" id="rfidInicial" value="200795" min="1">
                    </div>
                    
                    <div class="form-group">
                        <label for="sufixoSerie">Sufixo da Série:</label>
                        <input type="text" id="sufixoSerie" value="DD3" placeholder="Ex: DD3, ABC, XYZ">
                    </div>
                    
                    <div style="background: rgba(255,107,53,0.1); padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <p style="margin: 0; font-size: 0.9rem;">
                            <i class="fas fa-exclamation-triangle" style="color: var(--warning);"></i>
                            <strong>Atenção:</strong> Esta ação irá recriar todos os 15 notebooks com as novas configurações. 
                            Notebooks em uso não serão afetados.
                        </p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="gerarNotebooksLote" class="btn-primary">
                        <i class="fas fa-magic"></i> Gerar Notebooks
                    </button>
                    <button class="modal-close btn-secondary">Cancelar</button>
                </div>
            </div>
        </div>

        <!-- Modal para Edição em Massa -->
        <div class="modal" id="modalEdicaoMassa">
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3>Edição em Massa - Todos os Notebooks</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="background: rgba(255,107,53,0.1); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <p style="margin: 0; font-size: 0.9rem;">
                            <i class="fas fa-exclamation-triangle" style="color: var(--warning);"></i>
                            <strong>Atenção:</strong> Esta ação irá alterar TODOS os notebooks. Notebooks em uso não serão afetados.
                        </p>
                    </div>
                    
                    <div style="max-height: 400px; overflow-y: auto;" id="listaEdicaoMassa">
                        <!-- Lista será preenchida dinamicamente -->
                    </div>
                    
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--medium-gray);">
                        <button class="btn-primary" onclick="sistema.aplicarPadrao()">
                            <i class="fas fa-magic"></i> Aplicar Padrão Automático
                        </button>
                        <small style="display: block; margin-top: 5px; opacity: 0.8;">
                            Gera automaticamente números sequenciais para série e RFID
                        </small>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="salvarEdicaoMassa" class="btn-primary">
                        <i class="fas fa-save"></i> Salvar Todas as Alterações
                    </button>
                    <button class="modal-close btn-secondary">Cancelar</button>
                </div>
            </div>
        </div>

        <!-- Modal para Adicionar Novo Notebook -->
        <div class="modal" id="modalAdicionarNotebook">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Adicionar Novo Notebook</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="formAdicionarNotebook">
                        <div class="form-group">
                            <label for="novoNumero">Número do Notebook:</label>
                            <input type="text" id="novoNumero" required placeholder="Ex: EMPRESTIMO_16">
                        </div>
                        
                        <div class="form-group">
                            <label for="novaSerie">Número de Série:</label>
                            <input type="text" id="novaSerie" required placeholder="Ex: 5678ABC">
                        </div>
                        
                        <div class="form-group">
                            <label for="novoRfid">RFID:</label>
                            <input type="text" id="novoRfid" required placeholder="Ex: 200810">
                        </div>
                        
                        <div class="form-group">
                            <label for="novoModelo">Modelo (Opcional):</label>
                            <input type="text" id="novoModelo" placeholder="Ex: Dell Latitude 5520">
                        </div>
                        
                        <div class="form-group">
                            <label for="novoProcessador">Processador (Opcional):</label>
                            <input type="text" id="novoProcessador" placeholder="Ex: Intel i5-1135G7">
                        </div>
                        
                        <div class="form-group">
                            <label for="novaMemoria">Memória RAM (Opcional):</label>
                            <input type="text" id="novaMemoria" placeholder="Ex: 8GB DDR4">
                        </div>
                        
                        <div class="form-group">
                            <label for="novaDescricao">Descrição (Opcional):</label>
                            <textarea id="novaDescricao" rows="3" placeholder="Informações adicionais sobre o notebook..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button id="confirmarAdicionarNotebook" class="btn-primary">
                        <i class="fas fa-plus"></i> Adicionar Notebook
                    </button>
                    <button class="modal-close btn-secondary">Cancelar</button>
                </div>
            </div>
        </div>
    </div>

<script>
// Proteção de Autenticação
const firebaseConfig = {
    apiKey: "AIzaSyA-MT3SU98q0RZhEMh1IEpmgEaGXZPpKAQ",
    authDomain: "notebook-emprestimo.firebaseapp.com",
    databaseURL: "https://notebook-emprestimo-default-rtdb.firebaseio.com",
    projectId: "notebook-emprestimo",
    storageBucket: "notebook-emprestimo.firebasestorage.app",
    messagingSenderId: "1007063409338",
    appId: "1:1007063409338:web:5538614ffa1eaf315e5883",
    measurementId: "G-56H4W8HG9Z"
};

// Verificar se Firebase já não foi inicializado
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();

// Sistema de Proteção
// Atualizar a proteção no index.html
class AuthGuard {
    constructor() {
        this.currentUser = null;
        this.userRole = null;
        this.checkAuth();
        this.setupLogout();
    }

    checkAuth() {
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                // Verificar se usuário está autorizado
                const userSession = await firebase.database().ref(`userSessions/${user.uid}`).once('value');
                
                if (userSession.exists()) {
                    this.currentUser = user;
                    this.userRole = userSession.val().role;
                    this.showUserInfo(user, userSession.val());
                    
                    // Mostrar aba admin se for super-admin
                    if (this.userRole === 'super-admin') {
                        document.getElementById('adminTab').style.display = 'block';
                    }
                    
                    console.log('✅ Usuário autenticado:', user.email, 'Role:', this.userRole);
                } else {
                    // Usuário não autorizado
                    await auth.signOut();
                    window.location.href = 'index-login.html';
                }
            } else {
                window.location.href = 'index-login.html';
            }
        });
    }

    showUserInfo(user, session) {
        if (!document.getElementById('user-info')) {
            const userInfo = document.createElement('div');
            userInfo.id = 'user-info';
            userInfo.innerHTML = `
                <div style="position: fixed; top: 10px; right: 20px; z-index: 1000; background: var(--dark-gray); padding: 12px 18px; border-radius: 8px; border: 1px solid var(--primary-orange); display: flex; align-items: center; gap: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-${session.role === 'super-admin' ? 'crown' : 'user'}" style="color: var(--primary-orange);"></i>
                        <div>
                            <div style="color: var(--white); font-size: 0.9rem; font-weight: 600;">${user.displayName || user.email}</div>
                            <div style="color: var(--light-orange); font-size: 0.75rem;">${session.role === 'super-admin' ? 'Super Admin' : 'Usuário'}</div>
                        </div>
                    </div>
                    <button onclick="authGuard.logout()" style="background: var(--red); border: none; color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; transition: all 0.2s ease;" onmouseover="this.style.background='#c62828'" onmouseout="this.style.background='var(--red)'">
                        <i class="fas fa-sign-out-alt"></i> Sair
                    </button>
                </div>
            `;
            document.body.appendChild(userInfo);
        }
    }

    setupLogout() {
        let lastActivity = Date.now();
        const TIMEOUT = 8 * 60 * 60 * 1000;

        const updateActivity = () => {
            lastActivity = Date.now();
        };

        document.addEventListener('click', updateActivity);
        document.addEventListener('keypress', updateActivity);
        document.addEventListener('scroll', updateActivity);

        setInterval(() => {
            if (Date.now() - lastActivity > TIMEOUT) {
                this.logout('Sessão expirada por inatividade');
            }
        }, 60000);
    }

    async logout(message = 'Logout realizado com sucesso') {
        try {
            if (this.currentUser) {
                await firebase.database().ref(`userSessions/${this.currentUser.uid}`).update({
                    lastLogout: new Date().toISOString()
                });
            }
            
            await auth.signOut();
            alert(message);
            window.location.href = 'index-login.html';
        } catch (error) {
            console.error('Erro no logout:', error);
            alert('Erro ao fazer logout');
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getUserRole() {
        return this.userRole;
    }

    isAdmin() {
        return this.userRole === 'super-admin';
    }
}


// Inicializar proteção
let authGuard;
document.addEventListener('DOMContentLoaded', () => {
    authGuard = new AuthGuard();
});
</script>

<script src="firebase.js"></script>
<script>
class SistemaEmprestimos {
    constructor() {
        this.notebooks = [];
        this.emprestimos = [];
        this.setores = [];
        this.currentMonth = new Date();
        this.isLoading = false;
        
        // Referencias Firebase
        this.dbNotebooks = firebase.database().ref().child('notebooks');
        this.dbEmprestimos = firebase.database().ref().child('emprestimos');
        this.dbSetores = firebase.database().ref().child('setores');
        
        console.log('🚀 Inicializando sistema...');
        this.init();
    }

    // Adicionar estas funções à classe SistemaEmprestimos

async adicionarUsuario() {
    if (!authProtection.isAdmin()) {
        this.showToast('❌ Apenas administradores podem adicionar usuários', 'error');
        return;
    }

    const email = document.getElementById('newUserEmail').value.trim();
    const name = document.getElementById('newUserName').value.trim();
    const role = document.getElementById('newUserRole').value;

    if (!email || !name) {
        this.showToast('❌ Email e nome são obrigatórios', 'error');
        return;
    }

    try {
        // Adicionar à lista de usuários autorizados
        const authorizedUsers = await firebase.database().ref('authorizedUsers').once('value');
        const users = authorizedUsers.val() || {};
        
        if (users[email]) {
            this.showToast('❌ Usuário já existe', 'error');
            return;
        }

        users[email] = {
            role: role,
            permissions: role === 'admin' ? ['read', 'write', 'manage'] : ['read', 'write'],
            createdBy: authProtection.getCurrentUser().uid,
            createdAt: new Date().toISOString(),
            displayName: name
        };

        await firebase.database().ref('authorizedUsers').set(users);
        
        // Enviar convite por email (simulado)
        this.showToast(`✅ Usuário ${email} adicionado! Envie as credenciais manualmente.`, 'success');
        
        // Limpar campos
        document.getElementById('newUserEmail').value = '';
        document.getElementById('newUserName').value = '';
        
        this.renderUsersList();
        
    } catch (error) {
        console.error('❌ Erro ao adicionar usuário:', error);
        this.showToast('❌ Erro ao adicionar usuário', 'error');
    }
}

async alterarSenhaAdmin() {
    if (!authProtection.isAdmin()) {
        this.showToast('❌ Apenas administradores podem alterar senhas', 'error');
        return;
    }

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        this.showToast('❌ Todos os campos são obrigatórios', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        this.showToast('❌ Senhas não coincidem', 'error');
        return;
    }

    if (newPassword.length < 8) {
        this.showToast('❌ Nova senha deve ter pelo menos 8 caracteres', 'error');
        return;
    }

    try {
        const user = authProtection.getCurrentUser();
        const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
        
        // Reautenticar
        await user.reauthenticateWithCredential(credential);
        
        // Alterar senha
        await user.updatePassword(newPassword);
        
        this.showToast('✅ Senha alterada com sucesso!', 'success');
        
        // Limpar campos
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmNewPassword').value = '';
        
    } catch (error) {
        console.error('❌ Erro ao alterar senha:', error);
        this.showToast('❌ Senha atual incorreta ou erro no servidor', 'error');
    }
}

async renderUsersList() {
    if (!authProtection.isAdmin()) return;

    try {
        const snapshot = await firebase.database().ref('authorizedUsers').once('value');
        const users = snapshot.val() || {};
        
        const container = document.getElementById('usersList');
        container.innerHTML = Object.entries(users).map(([email, data]) => `
            <div style="background: var(--dark-gray); padding: 10px; border-radius: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="color: var(--white); font-weight: 600; font-size: 0.9rem;">${data.displayName || email}</div>
                    <div style="color: var(--light-orange); font-size: 0.8rem;">${email} - ${data.role}</div>
                </div>
                ${data.role !== 'super-admin' ? `
                    <button onclick="sistema.removerUsuario('${email}')" class="btn-danger btn-small" style="padding: 4px 8px; font-size: 0.8rem;">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : `
                    <span style="color: var(--primary-orange); font-size: 0.8rem;">
                        <i class="fas fa-crown"></i> Admin
                    </span>
                `}
            </div>
        `).join('');
        
    } catch (error) {
        console.error('❌ Erro ao carregar usuários:', error);
    }
}

async removerUsuario(email) {
    if (!authProtection.isAdmin()) return;

    if (!confirm(`Remover usuário ${email}?`)) return;

    try {
        await firebase.database().ref(`authorizedUsers/${email.replace('.', '_DOT_')}`).remove();
        this.showToast(`✅ Usuário ${email} removido`, 'success');
        this.renderUsersList();
    } catch (error) {
        console.error('❌ Erro ao remover usuário:', error);
        this.showToast('❌ Erro ao remover usuário', 'error');
    }
}


    async init() {
        try {
            this.isLoading = true;
            
            // Carregar dados do Firebase
            await this.loadFromFirebase();
            
            // Configurar eventos
            this.setupEventListeners();
            
            // Renderizar tudo
            this.renderAll();
            
            console.log('✅ Sistema iniciado com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao iniciar sistema:', error);
            this.createDefaultData();
        } finally {
            this.isLoading = false;
        }
    }

    async loadFromFirebase() {
        console.log('📡 Carregando dados do Firebase...');
        
        try {
            const [notebooksSnap, emprestimosSnap, setoresSnap] = await Promise.all([
                this.dbNotebooks.once('value'),
                this.dbEmprestimos.once('value'),
                this.dbSetores.once('value')
            ]);

            // Processar notebooks
            if (notebooksSnap.exists()) {
                const data = notebooksSnap.val();
                this.notebooks = Array.isArray(data) ? data.filter(Boolean) : Object.values(data || {}).filter(Boolean);
                console.log('📱 Notebooks carregados:', this.notebooks.length);
            } else {
                console.log('📱 Criando notebooks padrão...');
                this.notebooks = this.createDefaultNotebooks();
                await this.dbNotebooks.set(this.notebooks);
            }

            // Processar empréstimos
            if (emprestimosSnap.exists()) {
                const data = emprestimosSnap.val();
                this.emprestimos = Array.isArray(data) ? data.filter(Boolean) : Object.values(data || {}).filter(Boolean);
                console.log('📋 Empréstimos carregados:', this.emprestimos.length);
            } else {
                this.emprestimos = [];
                await this.dbEmprestimos.set([]);
            }

            // Processar setores
            if (setoresSnap.exists()) {
                const data = setoresSnap.val();
                this.setores = Array.isArray(data) ? data.filter(Boolean) : Object.values(data || {}).filter(Boolean);
                console.log('🏢 Setores carregados:', this.setores.length);
            } else {
                console.log('🏢 Criando setores padrão...');
                this.setores = this.createDefaultSetores();
                await this.dbSetores.set(this.setores);
            }

        } catch (error) {
            console.error('❌ Erro ao carregar do Firebase:', error);
            this.createDefaultData();
        }
    }

    createDefaultData() {
        console.log('🔧 Criando dados padrão...');
        this.notebooks = this.createDefaultNotebooks();
        this.emprestimos = [];
        this.setores = this.createDefaultSetores();
    }

    createDefaultNotebooks() {
        const notebooks = [];
        for (let i = 1; i <= 15; i++) {
            notebooks.push({
                id: i,
                numero: `EMPRESTIMO_${i.toString().padStart(2, '0')}`,
                serie: `${Math.floor(Math.random() * 9000) + 1000}DD3`,
                rfid: `${200794 + i}`,
                modelo: '',
                processador: '',
                memoria: '',
                descricao: '',
                dataCadastro: new Date().toISOString(),
                status: 'disponivel',
                colaborador: null,
                setor: null,
                chamado: null,
                dataEntrega: null,
                previsaoDevolucao: null
            });
        }
        return notebooks;
    }

    createDefaultSetores() {
        return [
            "Dados Mestre",
            "Customer Service", 
            "T.I",
            "CD VERA CRUZ",
            "Suprimentos",
            "ADM RH",
            "Logística",
            "Controladoria Fiscal"
        ];
    }

    setupEventListeners() {
        console.log('🔧 Configurando event listeners...');

        // Navegação entre tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.closest('.tab-btn').dataset.tab;
                this.switchTab(tabName);
            });
        });

        // FORMULÁRIO DE SOLICITAÇÃO
        const formSolicitacao = document.getElementById('formSolicitacao');
        if (formSolicitacao) {
            formSolicitacao.addEventListener('submit', (e) => {
                e.preventDefault();
                this.criarSolicitacao();
            });
        }

        // BOTÃO SOLICITAR EMPRÉSTIMO - BACKUP
        const btnSolicitar = document.querySelector('button[type="submit"]');
        if (btnSolicitar) {
            btnSolicitar.addEventListener('click', (e) => {
                e.preventDefault();
                this.criarSolicitacao();
            });
        }

        // BOTÃO ADICIONAR SETOR
        const btnAdicionarSetor = document.querySelector('#setores .btn-primary');
        if (btnAdicionarSetor) {
            btnAdicionarSetor.onclick = null;
            btnAdicionarSetor.addEventListener('click', (e) => {
                e.preventDefault();
                this.adicionarSetor();
            });
        }

        // INPUT SETOR COM ENTER
        const inputSetor = document.getElementById('novoSetor');
        if (inputSetor) {
            inputSetor.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.adicionarSetor();
                }
            });
        }

        this.setupModalEventListeners();

        // NAVEGAÇÃO DO CALENDÁRIO
        this.setupCalendarEventListeners();

        // BOTÕES DE GESTÃO DE NOTEBOOKS - CONFIGURAR APÓS DELAY
        setTimeout(() => {
            this.setupNotebookManagementButtons();
        }, 1000);

        // ADICIONAR: Event listeners de filtros do histórico
    setTimeout(() => {
        this.setupHistoricoFilters();
    }, 1000);

        console.log('✅ Event listeners configurados');
    }

    setupCalendarEventListeners() {
        const prevMonth = document.getElementById('prevMonth');
        const nextMonth = document.getElementById('nextMonth');
        
        if (prevMonth) {
            prevMonth.onclick = null;
            prevMonth.addEventListener('click', () => {
                this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
                this.renderCalendario();
            });
        }
        
        if (nextMonth) {
            nextMonth.onclick = null;
            nextMonth.addEventListener('click', () => {
                this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
                this.renderCalendario();
            });
        }
    }

    setupNotebookManagementButtons() {
        console.log('🔧 Configurando botões de gestão de notebooks...');
        
        // Mapear botões específicos
        const botoesConfig = [
            { 
                seletor: 'button:contains("Adicionar Notebook")',
                texto: 'Adicionar Notebook',
                funcao: () => this.abrirModalAdicionarNotebook()
            },
            { 
                seletor: 'button:contains("Editar Todos em Massa")',
                texto: 'Editar Todos em Massa',
                funcao: () => this.abrirModalEdicaoMassa()
            },
            { 
                seletor: 'button:contains("Gerar em Lote")',
                texto: 'Gerar em Lote',
                funcao: () => this.abrirModalGerarLote()
            },
            { 
                seletor: 'button:contains("Exportar")',
                texto: 'Exportar',
                funcao: () => this.exportarNotebooks()
            },
            { 
                seletor: 'button:contains("Importar")',
                texto: 'Importar',
                funcao: () => this.importarNotebooks()
            },
            { 
                seletor: 'button:contains("Resetar")',
                texto: 'Resetar',
                funcao: () => this.resetarNotebooks()
            }
        ];

        // Configurar cada botão
        botoesConfig.forEach(({ texto, funcao }) => {
            const botoes = Array.from(document.querySelectorAll('button')).filter(btn => 
                btn.textContent.trim().includes(texto)
            );
            
            botoes.forEach(botao => {
                if (botao) {
                    // Remover listeners antigos
                    const novoBotao = botao.cloneNode(true);
                    botao.parentNode.replaceChild(novoBotao, botao);
                    
                    // Adicionar novo listener
                    novoBotao.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log(`🔘 Botão "${texto}" clicado`);
                        funcao();
                    });
                    
                    console.log(`✅ Botão "${texto}" configurado`);
                }
            });
        });

        // Configurar event listener de modal devolução após delay
        setTimeout(() => {
            this.setupModalDevolucaoListener();
        }, 500);
    }

    setupModalDevolucaoListener() {
        const btnConfirmar = document.getElementById('confirmarDevolucao');
        if (btnConfirmar) {
            // Remover listeners antigos
            const novoBotao = btnConfirmar.cloneNode(true);
            btnConfirmar.parentNode.replaceChild(novoBotao, btnConfirmar);
            
            // Adicionar novo listener
            novoBotao.addEventListener('click', (e) => {
                e.preventDefault();
                this.processarDevolucao();
            });
            
            console.log('✅ Event listener de devolução configurado');
        }
    }

    renderAll() {
        console.log('🎨 Renderizando todas as interfaces...');
        
        try {
            this.renderDashboard();
            this.renderCalendario();
            this.renderHistorico();
            this.renderSetores();
            this.renderListaNotebooksEdicao();
            this.updateStats();
            this.setMinDate();
            this.updateNotebookOptions();
            this.updateSetorOptions();
            
            console.log('✅ Todas as interfaces renderizadas');
        } catch (error) {
            console.error('❌ Erro ao renderizar:', error);
        }
    }

    // CORRIGIR: Dashboard com botão devolver funcionando
    renderDashboard() {
        console.log('🎨 Renderizando dashboard...');
        
        const container = document.getElementById('notebooksContainer');
        if (!container) {
            console.error('❌ Container notebooksContainer não encontrado!');
            return;
        }

        if (!this.notebooks || this.notebooks.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: var(--dark-gray); border-radius: 12px;">
                    <i class="fas fa-laptop" style="font-size: 3rem; margin-bottom: 15px; color: var(--primary-orange);"></i>
                    <p>Carregando notebooks...</p>
                </div>
            `;
            return;
        }

        // Renderizar notebooks com botão devolver CORRIGIDO
        container.innerHTML = this.notebooks.map(notebook => {
            const isAtrasado = notebook.status === 'emprestado' && this.isAtrasado(notebook.previsaoDevolucao);
            
            return `
                <div class="notebook-card ${notebook.status}" onclick="sistema.mostrarDetalhesNotebook(${notebook.id})">
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
                            <small>Devolução: ${this.formatDate(notebook.previsaoDevolucao)}</small>
                        </div>
                    ` : '<div class="notebook-info">Pronto para empréstimo</div>'}
                    <div class="notebook-actions">
                        ${notebook.status === 'emprestado' ? `
                            <button 
                                class="btn-danger btn-small devolver-btn" 
                                data-notebook-id="${notebook.id}"
                                style="padding: 8px 12px; font-size: 0.85rem;"
                            >
                                <i class="fas fa-undo"></i> Devolver
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Configurar event listeners dos botões devolver
        setTimeout(() => {
            document.querySelectorAll('.devolver-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const notebookId = parseInt(btn.getAttribute('data-notebook-id'));
                    this.abrirModalDevolucao(notebookId);
                });
            });
            console.log('✅ Botões devolver configurados');
        }, 100);

        // Renderizar empréstimos ativos
        this.renderEmprestimosAtivos();
        
        console.log(`✅ Dashboard renderizado com ${this.notebooks.length} notebooks`);
    }

    renderEmprestimosAtivos() {
        const container = document.getElementById('emprestimosAtivos');
        if (!container) return;

        const ativos = this.emprestimos.filter(emp => emp.status === 'ativo');
        
        if (ativos.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; opacity: 0.7;">
                    <i class="fas fa-clipboard-list" style="font-size: 3rem; margin-bottom: 15px; color: var(--primary-orange);"></i>
                    <p>Nenhum empréstimo ativo</p>
                </div>
            `;
        } else {
            container.innerHTML = ativos.map(emprestimo => {
                const notebook = this.notebooks.find(nb => nb.id === emprestimo.notebookId);
                const previsao = new Date(emprestimo.previsaoDevolucao);
                const hoje = new Date();
                const isAtrasado = previsao < hoje;
                const diasRestantes = Math.ceil((previsao - hoje) / (1000 * 60 * 60 * 24));
                
                return `
                    <div class="emprestimo-item" onclick="sistema.mostrarDetalhesEmprestimo(${emprestimo.id})">
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
                            <div><strong>Devolução</strong><span>${this.formatDate(emprestimo.previsaoDevolucao)}</span></div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    // CORRIGIR: Gestão de Notebooks - Lista completa
    renderListaNotebooksEdicao() {
        console.log('📱 Renderizando gestão de notebooks...');
        
        // Tentar encontrar container
        let container = document.getElementById('notebooksEdicaoContainer') || 
                       document.querySelector('.notebooks-edicao-container');
        
        if (!container) {
            // Criar container se não existir
            container = this.criarContainerGestaoNotebooks();
        }

        if (!this.notebooks || this.notebooks.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; background: var(--dark-gray); border-radius: 12px; margin: 20px 0;">
                    <i class="fas fa-laptop" style="font-size: 3rem; margin-bottom: 15px; color: var(--primary-orange);"></i>
                    <h3 style="color: var(--white); margin-bottom: 20px;">Nenhum notebook cadastrado</h3>
                    <button class="btn-primary" onclick="sistema.criarNotebooksDefault()">
                        <i class="fas fa-plus"></i> Criar Notebooks Padrão
                    </button>
                </div>
            `;
            return;
        }

        console.log(`📱 Renderizando ${this.notebooks.length} notebooks na gestão...`);

        container.innerHTML = `
            <div style="background: var(--black); border-radius: 12px; padding: 25px; margin-top: 20px;">
                <h3 style="color: var(--primary-orange); margin-bottom: 25px; display: flex; align-items: center; gap: 10px; font-size: 1.5rem;">
                    <i class="fas fa-list"></i> Notebooks Cadastrados
                </h3>
                
                <div style="display: grid; gap: 15px;">
                    ${this.notebooks.map(notebook => `
                        <div class="notebook-edicao-item" style="background: var(--dark-gray); border-radius: 10px; padding: 20px; border-left: 4px solid var(--primary-orange); transition: transform 0.2s ease;">
                            <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 20px;">
                                <div style="flex: 1; min-width: 300px;">
                                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                                        <strong style="color: var(--primary-orange); font-size: 1.3rem;">
                                            <i class="fas fa-laptop"></i> ${notebook.numero}
                                        </strong>
                                        <span style="color: #ccc; font-size: 0.9rem;">ID: ${notebook.id}</span>
                                    </div>
                                    
                                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 15px; font-size: 0.9rem;">
                                        <div><strong style="color: var(--light-orange);">Série:</strong> <span style="color: #fff;">${notebook.serie}</span></div>
                                        <div><strong style="color: var(--light-orange);">RFID:</strong> <span style="color: #fff;">${notebook.rfid}</span></div>
                                        <div><strong style="color: var(--light-orange);">Modelo:</strong> <span style="color: #fff;">${notebook.modelo || 'Não informado'}</span></div>
                                        <div><strong style="color: var(--light-orange);">Processador:</strong> <span style="color: #fff;">${notebook.processador || 'Não informado'}</span></div>
                                        <div><strong style="color: var(--light-orange);">Memória:</strong> <span style="color: #fff;">${notebook.memoria || 'Não informado'}</span></div>
                                        <div>
                                            <strong style="color: var(--light-orange);">Status:</strong> 
                                            <span class="status-badge" style="padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; ${notebook.status === 'disponivel' ? 'background: #4CAF50; color: white;' : 'background: #F44336; color: white;'}">
                                                ${notebook.status === 'disponivel' ? 'Disponível' : 'Em Uso'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    ${notebook.colaborador ? `
                                        <div style="background: rgba(255,107,53,0.15); padding: 12px; border-radius: 6px; border-left: 3px solid var(--primary-orange);">
                                            <div style="font-size: 0.9rem;">
                                                <strong style="color: var(--primary-orange);">Emprestado para:</strong> 
                                                <span style="color: #fff;">${notebook.colaborador}</span>
                                            </div>
                                            <div style="font-size: 0.85rem; color: #ccc; margin-top: 5px;">
                                                Setor: ${notebook.setor} | Chamado: ${notebook.chamado}
                                            </div>
                                            <div style="font-size: 0.85rem; color: #ccc;">
                                                Devolução: ${this.formatDate(notebook.previsaoDevolucao)}
                                            </div>
                                        </div>
                                    ` : `
                                        <div style="background: rgba(76,175,80,0.15); padding: 12px; border-radius: 6px; border-left: 3px solid #4CAF50;">
                                            <span style="color: #4CAF50; font-weight: 600;">
                                                <i class="fas fa-check-circle"></i> Disponível para empréstimo
                                            </span>
                                        </div>
                                    `}
                                    
                                    ${notebook.descricao ? `
                                        <div style="margin-top: 10px; font-size: 0.85rem; color: #bbb;">
                                            <strong>Descrição:</strong> ${notebook.descricao}
                                        </div>
                                    ` : ''}
                                </div>
                                
                                <div style="display: flex; flex-direction: column; gap: 8px; min-width: 120px;">
                                    <button class="btn-secondary btn-small editar-notebook-btn" data-notebook-id="${notebook.id}" style="padding: 8px 12px; width: 100%;">
                                        <i class="fas fa-edit"></i> Editar
                                    </button>
                                    <button class="btn-info btn-small duplicar-notebook-btn" data-notebook-id="${notebook.id}" style="padding: 8px 12px; width: 100%;">
                                        <i class="fas fa-copy"></i> Duplicar
                                    </button>
                                    ${notebook.status === 'disponivel' ? `
                                        <button class="btn-danger btn-small excluir-notebook-btn" data-notebook-id="${notebook.id}" style="padding: 8px 12px; width: 100%;">
                                            <i class="fas fa-trash"></i> Excluir
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Configurar event listeners dos botões da gestão
        setTimeout(() => {
            this.setupGestaoNotebooksListeners();
        }, 100);

        console.log('✅ Gestão de notebooks renderizada com sucesso!');
    }

    criarContainerGestaoNotebooks() {
        console.log('🔨 Criando container de gestão de notebooks...');
        
        const setoresTab = document.getElementById('setores');
        if (!setoresTab) {
            console.error('❌ Tab setores não encontrada!');
            return null;
        }
        
        const container = document.createElement('div');
        container.id = 'notebooksEdicaoContainer';
        container.style.marginTop = '20px';
        
        setoresTab.appendChild(container);
        
        return container;
    }

    ssetupGestaoNotebooksListeners() {
    console.log('🔧 Configurando listeners da gestão de notebooks...');
    
    // Botões editar - CORRIGIDO
    document.querySelectorAll('.editar-notebook-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const notebookId = parseInt(btn.getAttribute('data-notebook-id'));
            this.editarNotebook(notebookId); // Agora chama a função completa
        });
    });

    // Botões duplicar
    document.querySelectorAll('.duplicar-notebook-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const notebookId = parseInt(btn.getAttribute('data-notebook-id'));
            this.duplicarNotebook(notebookId);
        });
    });

    // Botões excluir
    document.querySelectorAll('.excluir-notebook-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const notebookId = parseInt(btn.getAttribute('data-notebook-id'));
            this.excluirNotebook(notebookId);
        });
    });

    console.log('✅ Listeners da gestão configurados');
}


    // FUNÇÃO PRINCIPAL: Modal de Devolução CORRIGIDO
    abrirModalDevolucao(notebookId) {
        console.log('🔄 Abrindo modal de devolução para notebook ID:', notebookId);
        
        const notebook = this.notebooks.find(nb => nb.id === notebookId);
        if (!notebook || notebook.status !== 'emprestado') {
            this.showToast('❌ Notebook não encontrado ou não está emprestado!', 'error');
            return;
        }

        const emprestimo = this.emprestimos.find(emp => 
            emp.notebookId === notebookId && emp.status === 'ativo'
        );

        if (!emprestimo) {
            this.showToast('❌ Empréstimo ativo não encontrado!', 'error');
            return;
        }

        // Criar modal se não existir
        let modal = document.getElementById('modalDevolucao');
        if (!modal) {
            modal = this.criarModalDevolucao();
        }

        // Preencher informações
        const infoDiv = modal.querySelector('#infoDevolucao');
        if (infoDiv) {
            const diasEmprestado = Math.floor((new Date() - new Date(emprestimo.dataEntrega)) / (1000 * 60 * 60 * 24));
            const isAtrasado = this.isAtrasado(notebook.previsaoDevolucao);
            const diasAtraso = isAtrasado ? Math.floor((new Date() - new Date(notebook.previsaoDevolucao)) / (1000 * 60 * 60 * 24)) : 0;

            infoDiv.innerHTML = `
                <div style="background: var(--dark-gray); padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid var(--primary-orange);">
                    <h3 style="color: var(--primary-orange); margin-bottom: 15px;">
                        <i class="fas fa-laptop"></i> ${notebook.numero}
                    </h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                        <div><strong style="color: var(--light-orange);">Colaborador:</strong><br>${notebook.colaborador}</div>
                        <div><strong style="color: var(--light-orange);">Setor:</strong><br>${notebook.setor}</div>
                        <div><strong style="color: var(--light-orange);">Chamado:</strong><br>${notebook.chamado}</div>
                        <div><strong style="color: var(--light-orange);">Tempo Emprestado:</strong><br>${diasEmprestado} dia(s)</div>
                    </div>
                    ${isAtrasado ? `
                        <div style="background: rgba(244, 67, 54, 0.2); padding: 15px; border-radius: 6px; border-left: 3px solid #F44336;">
                            <strong style="color: #F44336;"><i class="fas fa-exclamation-triangle"></i> ATRASADO</strong><br>
                            <span style="color: #ffcdd2;">${diasAtraso} dia(s) em atraso</span>
                        </div>
                    ` : `
                        <div style="background: rgba(76, 175, 80, 0.2); padding: 15px; border-radius: 6px; border-left: 3px solid #4CAF50;">
                            <strong style="color: #4CAF50;"><i class="fas fa-check-circle"></i> NO PRAZO</strong>
                        </div>
                    `}
                </div>
            `;
        }
        
        // Limpar observações
        const observacoes = modal.querySelector('#observacoesDevolucao');
        if (observacoes) {
            observacoes.value = '';
        }
        
        // Armazenar dados no modal
        modal.setAttribute('data-notebook-id', notebookId);
        modal.setAttribute('data-emprestimo-id', emprestimo.id);
        
        // Mostrar modal
        modal.classList.add('active');
        
        // Configurar listener do botão confirmar
        setTimeout(() => {
            this.setupModalDevolucaoListener();
        }, 100);
        
        console.log('✅ Modal de devolução aberto para:', notebook.numero);
    }

    criarModalDevolucao() {
        console.log('🔨 Criando modal de devolução...');
        
        const modal = document.createElement('div');
        modal.id = 'modalDevolucao';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px; background: var(--black); border-radius: 12px; border: 2px solid var(--primary-orange);">
                <div class="modal-header" style="background: var(--primary-orange); padding: 20px; border-radius: 10px 10px 0 0;">
                    <h2 style="margin: 0; color: var(--white); display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-undo"></i> Devolver Notebook
                    </h2>
                    <button class="modal-close" style="background: none; border: none; color: var(--white); font-size: 24px; cursor: pointer; position: absolute; top: 15px; right: 20px;">&times;</button>
                </div>
                <div class="modal-body" style="padding: 30px;">
                    <div id="infoDevolucao">
                        <!-- Informações serão inseridas aqui -->
                    </div>
                    
                    <div class="form-group">
                        <label for="observacoesDevolucao" style="color: var(--primary-orange); font-weight: 600; margin-bottom: 8px; display: block;">
                            <i class="fas fa-comment"></i> Observações sobre a devolução:
                        </label>
                        <textarea 
                            id="observacoesDevolucao" 
                            rows="4" 
                            placeholder="Digite observações sobre o estado do notebook, problemas encontrados, etc. (opcional)"
                            style="width: 100%; padding: 15px; border: 2px solid var(--medium-gray); border-radius: 8px; background: var(--dark-gray); color: var(--white); resize: vertical; font-family: inherit; font-size: 14px;"
                        ></textarea>
                        <small style="color: var(--light-orange); margin-top: 8px; display: block; font-size: 12px;">
                            <i class="fas fa-info-circle"></i> Este campo é opcional, mas recomendado para controle interno
                        </small>
                    </div>
                </div>
                <div class="modal-footer" style="padding: 20px 30px; border-top: 1px solid var(--medium-gray); display: flex; gap: 15px; justify-content: flex-end;">
                    <button class="btn-secondary modal-close" style="padding: 12px 24px;">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    <button id="confirmarDevolucao" class="btn-primary" style="padding: 12px 24px;">
                        <i class="fas fa-check"></i> Confirmar Devolução
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners para fechar modal
        modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeModal();
            });
        });

        // Fechar modal clicando fora
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
        
        console.log('✅ Modal de devolução criado');
        return modal;
    }

    // FUNÇÃO PRINCIPAL: Processar Devolução CORRIGIDO
    async processarDevolucao() {
        console.log('✅ Processando devolução...');
        
        const modal = document.getElementById('modalDevolucao');
        if (!modal) {
            this.showToast('❌ Modal de devolução não encontrado!', 'error');
            return;
        }
        
        const notebookId = parseInt(modal.getAttribute('data-notebook-id'));
        const emprestimoId = parseInt(modal.getAttribute('data-emprestimo-id'));
        const observacoes = document.getElementById('observacoesDevolucao')?.value?.trim() || '';
        
        console.log('📋 Dados da devolução:', { notebookId, emprestimoId, observacoes });
        
        if (!notebookId || !emprestimoId) {
            this.showToast('❌ Dados da devolução inválidos!', 'error');
            return;
        }
        
        // Encontrar notebook e empréstimo
        const notebook = this.notebooks.find(nb => nb.id === notebookId);
        const emprestimo = this.emprestimos.find(emp => emp.id === emprestimoId);
        
        if (!notebook) {
            this.showToast('❌ Notebook não encontrado!', 'error');
            return;
        }
        
        if (!emprestimo || emprestimo.status !== 'ativo') {
            this.showToast('❌ Empréstimo não encontrado ou não está ativo!', 'error');
            return;
        }
        
        // Desabilitar botão durante processamento
        const btnConfirmar = modal.querySelector('#confirmarDevolucao');
        if (btnConfirmar) {
            const textoOriginal = btnConfirmar.innerHTML;
            btnConfirmar.disabled = true;
            btnConfirmar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
            
            try {
                console.log('💾 Atualizando dados da devolução...');
                
                const agora = new Date().toISOString();
                const colaboradorAnterior = notebook.colaborador;
                
                // Atualizar empréstimo para devolvido
                emprestimo.status = 'devolvido';
                emprestimo.dataDevolucao = agora;
                emprestimo.observacoesDevolucao = observacoes;
                
                // Liberar notebook - LIMPAR TODOS OS DADOS
                notebook.status = 'disponivel';
                notebook.colaborador = null;
                notebook.setor = null;
                notebook.chamado = null;
                notebook.dataEntrega = null;
                notebook.previsaoDevolucao = null;
                
                // Salvar no Firebase
                await this.saveToFirebase();
                
                // Fechar modal
                this.closeModal();
                
                // Atualizar TODA a interface
                this.renderAll();
                
                this.showToast(`✅ Notebook ${notebook.numero} devolvido por ${colaboradorAnterior}!`, 'success');
                
                console.log('🎉 Devolução concluída com sucesso!', {
                    notebook: notebook.numero,
                    colaborador: colaboradorAnterior,
                    novoStatus: notebook.status
                });
                
            } catch (error) {
                console.error('❌ Erro ao processar devolução:', error);
                
                // Reverter mudanças em caso de erro
                emprestimo.status = 'ativo';
                emprestimo.dataDevolucao = null;
                emprestimo.observacoesDevolucao = null;
                
                notebook.status = 'emprestado';
                
                this.showToast('❌ Erro ao processar devolução. Tente novamente.', 'error');
                
                // Reabilitar botão
                btnConfirmar.disabled = false;
                btnConfirmar.innerHTML = textoOriginal;
            }
        }
    }

    // Nova Solicitação
    async criarSolicitacao() {
        console.log('📝 Processando nova solicitação...');

        const nome = document.getElementById('nomeColaborador')?.value?.trim();
        const setor = document.getElementById('setorColaborador')?.value;
        const notebookId = parseInt(document.getElementById('notebookSelecionado')?.value);
        const chamado = document.getElementById('numeroChamado')?.value?.trim();
        const motivo = document.getElementById('motivoEmprestimo')?.value?.trim();
        const previsaoDevolucao = document.getElementById('dataPrevisaoDevolucao')?.value;

        console.log('📋 Dados capturados:', { nome, setor, notebookId, chamado, motivo, previsaoDevolucao });

        // Validações
        if (!nome || nome.length < 2) {
            this.showToast('Nome do colaborador deve ter pelo menos 2 caracteres!', 'error');
            return;
        }

        if (!setor) {
            this.showToast('Selecione um setor!', 'error');
            return;
        }

        if (!notebookId || isNaN(notebookId)) {
            this.showToast('Selecione um notebook!', 'error');
            return;
        }

        if (!chamado || chamado.length < 3) {
            this.showToast('Número do chamado deve ter pelo menos 3 caracteres!', 'error');
            return;
        }

        if (!motivo || motivo.length < 3) {
            this.showToast('Motivo deve ter pelo menos 3 caracteres!', 'error');
            return;
        }

        if (!previsaoDevolucao) {
            this.showToast('Selecione a data de devolução!', 'error');
            return;
        }

        // Encontrar notebook
        const notebook = this.notebooks.find(nb => nb.id === notebookId);
        if (!notebook || notebook.status !== 'disponivel') {
            this.showToast('Notebook selecionado não está disponível!', 'error');
            this.updateNotebookOptions();
            return;
        }

        try {
            console.log('💾 Criando empréstimo...');
            
            const agora = new Date().toISOString();
            const emprestimoId = Date.now();
            
            // Criar empréstimo
            const novoEmprestimo = {
                id: emprestimoId,
                notebookId: notebook.id,
                colaborador: nome,
                setor: setor,
                chamado: chamado,
                motivo: motivo,
                dataEntrega: agora,
                previsaoDevolucao: previsaoDevolucao,
                status: 'ativo'
            };

            // Atualizar notebook
            notebook.status = 'emprestado';
            notebook.colaborador = nome;
            notebook.setor = setor;
            notebook.chamado = chamado;
            notebook.dataEntrega = agora;
            notebook.previsaoDevolucao = previsaoDevolucao;

            // Adicionar empréstimo
            this.emprestimos.push(novoEmprestimo);

            // Salvar no Firebase
            await this.saveToFirebase();

            // Limpar formulário
            document.getElementById('formSolicitacao').reset();
            this.setMinDate();

            // Atualizar interface
            this.renderAll();

            this.showToast(`✅ Notebook ${notebook.numero} emprestado para ${nome}!`, 'success');
            this.switchTab('dashboard');

            console.log('✅ Empréstimo criado com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao criar empréstimo:', error);
            this.showToast('Erro ao processar empréstimo. Tente novamente.', 'error');
        }
    }

    // IMPLEMENTAR: Adicionar Notebook COMPLETO
    abrirModalAdicionarNotebook() {
        console.log('➕ Abrindo modal para adicionar notebook...');
        
        let modal = document.getElementById('modalAdicionarNotebook');
        if (!modal) {
            modal = this.criarModalAdicionarNotebook();
        }
        
        // Preencher campos automáticos
        this.preencherCamposAutomaticos();
        
        modal.classList.add('active');
        
        // Focar no primeiro campo
        setTimeout(() => {
            const primeiroInput = modal.querySelector('input[type="text"]');
            if (primeiroInput) primeiroInput.focus();
        }, 100);
    }

    criarModalAdicionarNotebook() {
        const modal = document.createElement('div');
        modal.id = 'modalAdicionarNotebook';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px; background: var(--black); border-radius: 12px; border: 2px solid var(--primary-orange);">
                <div class="modal-header" style="background: var(--primary-orange); padding: 20px; border-radius: 10px 10px 0 0;">
                    <h2 style="margin: 0; color: var(--white); display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-plus"></i> Adicionar Novo Notebook
                    </h2>
                    <button class="modal-close" style="background: none; border: none; color: var(--white); font-size: 24px; cursor: pointer; position: absolute; top: 15px; right: 20px;">&times;</button>
                </div>
                <div class="modal-body" style="padding: 30px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div class="form-group">
                            <label for="novoNotebookNumero" style="color: var(--primary-orange); font-weight: 600; margin-bottom: 8px; display: block;">
                                <i class="fas fa-hashtag"></i> Número do Notebook:
                            </label>
                            <input type="text" id="novoNotebookNumero" required style="width: 100%; padding: 12px; border: 2px solid var(--medium-gray); border-radius: 8px; background: var(--dark-gray); color: var(--white);">
                        </div>
                        <div class="form-group">
                            <label for="novoNotebookSerie" style="color: var(--primary-orange); font-weight: 600; margin-bottom: 8px; display: block;">
                                <i class="fas fa-barcode"></i> Número de Série:
                            </label>
                            <input type="text" id="novoNotebookSerie" required style="width: 100%; padding: 12px; border: 2px solid var(--medium-gray); border-radius: 8px; background: var(--dark-gray); color: var(--white);">
                        </div>
                        <div class="form-group">
                            <label for="novoNotebookRfid" style="color: var(--primary-orange); font-weight: 600; margin-bottom: 8px; display: block;">
                                <i class="fas fa-wifi"></i> RFID:
                            </label>
                            <input type="text" id="novoNotebookRfid" required style="width: 100%; padding: 12px; border: 2px solid var(--medium-gray); border-radius: 8px; background: var(--dark-gray); color: var(--white);">
                        </div>
                        <div class="form-group">
                            <label for="novoNotebookModelo" style="color: var(--primary-orange); font-weight: 600; margin-bottom: 8px; display: block;">
                                <i class="fas fa-laptop"></i> Modelo:
                            </label>
                            <input type="text" id="novoNotebookModelo" placeholder="Ex: Dell Inspiron 15 3000" style="width: 100%; padding: 12px; border: 2px solid var(--medium-gray); border-radius: 8px; background: var(--dark-gray); color: var(--white);">
                        </div>
                        <div class="form-group">
                            <label for="novoNotebookProcessador" style="color: var(--primary-orange); font-weight: 600; margin-bottom: 8px; display: block;">
                                <i class="fas fa-microchip"></i> Processador:
                            </label>
                            <input type="text" id="novoNotebookProcessador" placeholder="Ex: Intel Core i5-1135G7" style="width: 100%; padding: 12px; border: 2px solid var(--medium-gray); border-radius: 8px; background: var(--dark-gray); color: var(--white);">
                        </div>
                        <div class="form-group">
                            <label for="novoNotebookMemoria" style="color: var(--primary-orange); font-weight: 600; margin-bottom: 8px; display: block;">
                                <i class="fas fa-memory"></i> Memória RAM:
                            </label>
                            <input type="text" id="novoNotebookMemoria" placeholder="Ex: 8GB DDR4" style="width: 100%; padding: 12px; border: 2px solid var(--medium-gray); border-radius: 8px; background: var(--dark-gray); color: var(--white);">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="novoNotebookDescricao" style="color: var(--primary-orange); font-weight: 600; margin-bottom: 8px; display: block;">
                            <i class="fas fa-align-left"></i> Descrição/Observações:
                        </label>
                        <textarea 
                            id="novoNotebookDescricao" 
                            rows="3" 
                            placeholder="Informações adicionais, estado do equipamento, acessórios inclusos, etc."
                            style="width: 100%; padding: 15px; border: 2px solid var(--medium-gray); border-radius: 8px; background: var(--dark-gray); color: var(--white); resize: vertical; font-family: inherit;"
                        ></textarea>
                    </div>
                </div>
                <div class="modal-footer" style="padding: 20px 30px; border-top: 1px solid var(--medium-gray); display: flex; gap: 15px; justify-content: flex-end;">
                    <button class="btn-secondary modal-close" style="padding: 12px 24px;">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    <button id="confirmarAdicionarNotebook" class="btn-primary" style="padding: 12px 24px;">
                        <i class="fas fa-save"></i> Salvar Notebook
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        modal.querySelector('#confirmarAdicionarNotebook').addEventListener('click', () => {
            this.confirmarAdicionarNotebook();
        });
        
        modal.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });
        
        return modal;
    }

    preencherCamposAutomaticos() {
        const ultimoId = this.notebooks.length > 0 ? Math.max(...this.notebooks.map(nb => nb.id)) : 0;
        
        const numeroInput = document.getElementById('novoNotebookNumero');
        const serieInput = document.getElementById('novoNotebookSerie');
        const rfidInput = document.getElementById('novoNotebookRfid');
        
        if (numeroInput) numeroInput.value = `EMPRESTIMO_${(ultimoId + 1).toString().padStart(2, '0')}`;
        if (serieInput) serieInput.value = `${Math.floor(Math.random() * 9000) + 1000}DD3`;
        if (rfidInput) rfidInput.value = `${200794 + ultimoId + 1}`;
    }

    async confirmarAdicionarNotebook() {
        console.log('💾 Confirmando adição de notebook...');
        
        const dados = {
            numero: document.getElementById('novoNotebookNumero')?.value?.trim(),
            serie: document.getElementById('novoNotebookSerie')?.value?.trim(),
            rfid: document.getElementById('novoNotebookRfid')?.value?.trim(),
            modelo: document.getElementById('novoNotebookModelo')?.value?.trim(),
            processador: document.getElementById('novoNotebookProcessador')?.value?.trim(),
            memoria: document.getElementById('novoNotebookMemoria')?.value?.trim(),
            descricao: document.getElementById('novoNotebookDescricao')?.value?.trim()
        };
        
        // Validações
        if (!dados.numero || !dados.serie || !dados.rfid) {
            this.showToast('Número, Série e RFID são obrigatórios!', 'error');
            return;
        }
        
        // Verificar duplicatas
        if (this.notebooks.some(nb => nb.numero === dados.numero)) {
            this.showToast('Já existe um notebook com este número!', 'error');
            return;
        }
        
        if (this.notebooks.some(nb => nb.rfid === dados.rfid)) {
            this.showToast('Já existe um notebook com este RFID!', 'error');
            return;
        }
        
        try {
            const proximoId = this.notebooks.length > 0 ? Math.max(...this.notebooks.map(nb => nb.id)) + 1 : 1;
            
            const novoNotebook = {
                id: proximoId,
                numero: dados.numero,
                serie: dados.serie,
                rfid: dados.rfid,
                modelo: dados.modelo,
                processador: dados.processador,
                memoria: dados.memoria,
                descricao: dados.descricao,
                dataCadastro: new Date().toISOString(),
                status: 'disponivel',
                colaborador: null,
                setor: null,
                chamado: null,
                dataEntrega: null,
                previsaoDevolucao: null
            };
            
            this.notebooks.push(novoNotebook);
            await this.saveToFirebase();
            
            this.closeModal();
            this.renderAll();
            
            this.showToast(`✅ Notebook ${dados.numero} adicionado com sucesso!`, 'success');
            
        } catch (error) {
            console.error('❌ Erro ao adicionar notebook:', error);
            this.showToast('Erro ao salvar notebook', 'error');
        }
    }

    // IMPLEMENTAR: Outras funções da gestão
    editarNotebook(id) {
    console.log('✏️ Editando notebook ID:', id);
    
    const notebook = this.notebooks.find(nb => nb.id === id);
    if (!notebook) {
        this.showToast('❌ Notebook não encontrado!', 'error');
        return;
    }

    // Criar modal se não existir
    let modal = document.getElementById('modalEditarNotebook');
    if (!modal) {
        modal = this.criarModalEditarNotebook();
    }

    // Preencher campos com dados atuais
    this.preencherCamposEdicao(notebook);
    
    // Armazenar ID no modal
    modal.setAttribute('data-notebook-id', id);
    
    // Mostrar modal
    modal.classList.add('active');
    
    // Focar no primeiro campo
    setTimeout(() => {
        const primeiroInput = modal.querySelector('input[type="text"]');
        if (primeiroInput) primeiroInput.focus();
    }, 100);
}

criarModalEditarNotebook() {
    const modal = document.createElement('div');
    modal.id = 'modalEditarNotebook';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px; background: var(--black); border-radius: 12px; border: 2px solid var(--primary-orange);">
            <div class="modal-header" style="background: var(--primary-orange); padding: 20px; border-radius: 10px 10px 0 0;">
                <h2 style="margin: 0; color: var(--white); display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-edit"></i> Editar Notebook
                </h2>
                <button class="modal-close" style="background: none; border: none; color: var(--white); font-size: 24px; cursor: pointer; position: absolute; top: 15px; right: 20px;">&times;</button>
            </div>
            <div class="modal-body" style="padding: 30px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div class="form-group">
                        <label for="editNumero" style="color: var(--primary-orange); font-weight: 600; margin-bottom: 8px; display: block;">
                            <i class="fas fa-hashtag"></i> Número do Notebook:
                        </label>
                        <input type="text" id="editNumero" required style="width: 100%; padding: 12px; border: 2px solid var(--medium-gray); border-radius: 8px; background: var(--dark-gray); color: var(--white);">
                    </div>
                    <div class="form-group">
                        <label for="editSerie" style="color: var(--primary-orange); font-weight: 600; margin-bottom: 8px; display: block;">
                            <i class="fas fa-barcode"></i> Número de Série:
                        </label>
                        <input type="text" id="editSerie" required style="width: 100%; padding: 12px; border: 2px solid var(--medium-gray); border-radius: 8px; background: var(--dark-gray); color: var(--white);">
                    </div>
                    <div class="form-group">
                        <label for="editRfid" style="color: var(--primary-orange); font-weight: 600; margin-bottom: 8px; display: block;">
                            <i class="fas fa-wifi"></i> RFID:
                        </label>
                        <input type="text" id="editRfid" required style="width: 100%; padding: 12px; border: 2px solid var(--medium-gray); border-radius: 8px; background: var(--dark-gray); color: var(--white);">
                    </div>
                    <div class="form-group">
                        <label for="editModelo" style="color: var(--primary-orange); font-weight: 600; margin-bottom: 8px; display: block;">
                            <i class="fas fa-laptop"></i> Modelo:
                        </label>
                        <input type="text" id="editModelo" placeholder="Ex: Dell Inspiron 15 3000" style="width: 100%; padding: 12px; border: 2px solid var(--medium-gray); border-radius: 8px; background: var(--dark-gray); color: var(--white);">
                    </div>
                    <div class="form-group">
                        <label for="editProcessador" style="color: var(--primary-orange); font-weight: 600; margin-bottom: 8px; display: block;">
                            <i class="fas fa-microchip"></i> Processador:
                        </label>
                        <input type="text" id="editProcessador" placeholder="Ex: Intel Core i5-1135G7" style="width: 100%; padding: 12px; border: 2px solid var(--medium-gray); border-radius: 8px; background: var(--dark-gray); color: var(--white);">
                    </div>
                    <div class="form-group">
                        <label for="editMemoria" style="color: var(--primary-orange); font-weight: 600; margin-bottom: 8px; display: block;">
                            <i class="fas fa-memory"></i> Memória RAM:
                        </label>
                        <input type="text" id="editMemoria" placeholder="Ex: 8GB DDR4" style="width: 100%; padding: 12px; border: 2px solid var(--medium-gray); border-radius: 8px; background: var(--dark-gray); color: var(--white);">
                    </div>
                </div>
                <div class="form-group">
                    <label for="editDescricao" style="color: var(--primary-orange); font-weight: 600; margin-bottom: 8px; display: block;">
                        <i class="fas fa-align-left"></i> Descrição/Observações:
                    </label>
                    <textarea 
                        id="editDescricao" 
                        rows="4" 
                        placeholder="Informações adicionais, estado do equipamento, acessórios inclusos, etc."
                        style="width: 100%; padding: 15px; border: 2px solid var(--medium-gray); border-radius: 8px; background: var(--dark-gray); color: var(--white); resize: vertical; font-family: inherit;"
                    ></textarea>
                </div>
            </div>
            <div class="modal-footer" style="padding: 20px 30px; border-top: 1px solid var(--medium-gray); display: flex; gap: 15px; justify-content: flex-end;">
                <button class="btn-secondary modal-close" style="padding: 12px 24px;">
                    <i class="fas fa-times"></i> Cancelar
                </button>
                <button id="confirmarEdicaoNotebook" class="btn-primary" style="padding: 12px 24px;">
                    <i class="fas fa-save"></i> Salvar Alterações
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    modal.querySelector('#confirmarEdicaoNotebook').addEventListener('click', () => {
        this.confirmarEdicaoNotebook();
    });
    
    modal.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => this.closeModal());
    });
    
    return modal;
}

preencherCamposEdicao(notebook) {
    document.getElementById('editNumero').value = notebook.numero || '';
    document.getElementById('editSerie').value = notebook.serie || '';
    document.getElementById('editRfid').value = notebook.rfid || '';
    document.getElementById('editModelo').value = notebook.modelo || '';
    document.getElementById('editProcessador').value = notebook.processador || '';
    document.getElementById('editMemoria').value = notebook.memoria || '';
    document.getElementById('editDescricao').value = notebook.descricao || '';
}

async confirmarEdicaoNotebook() {
    console.log('💾 Confirmando edição de notebook...');
    
    const modal = document.getElementById('modalEditarNotebook');
    const notebookId = parseInt(modal.getAttribute('data-notebook-id'));
    
    const notebook = this.notebooks.find(nb => nb.id === notebookId);
    if (!notebook) {
        this.showToast('❌ Notebook não encontrado!', 'error');
        return;
    }
    
    const dadosNovos = {
        numero: document.getElementById('editNumero').value.trim(),
        serie: document.getElementById('editSerie').value.trim(),
        rfid: document.getElementById('editRfid').value.trim(),
        modelo: document.getElementById('editModelo').value.trim(),
        processador: document.getElementById('editProcessador').value.trim(),
        memoria: document.getElementById('editMemoria').value.trim(),
        descricao: document.getElementById('editDescricao').value.trim()
    };
    
    // Validações
    if (!dadosNovos.numero || !dadosNovos.serie || !dadosNovos.rfid) {
        this.showToast('❌ Número, Série e RFID são obrigatórios!', 'error');
        return;
    }
    
    // Verificar duplicatas (excluindo o próprio notebook)
    const numeroExiste = this.notebooks.some(nb => nb.id !== notebookId && nb.numero === dadosNovos.numero);
    const rfidExiste = this.notebooks.some(nb => nb.id !== notebookId && nb.rfid === dadosNovos.rfid);
    
    if (numeroExiste) {
        this.showToast('❌ Já existe outro notebook com este número!', 'error');
        return;
    }
    
    if (rfidExiste) {
        this.showToast('❌ Já existe outro notebook com este RFID!', 'error');
        return;
    }
    
    try {
        // Atualizar dados do notebook
        notebook.numero = dadosNovos.numero;
        notebook.serie = dadosNovos.serie;
        notebook.rfid = dadosNovos.rfid;
        notebook.modelo = dadosNovos.modelo;
        notebook.processador = dadosNovos.processador;
        notebook.memoria = dadosNovos.memoria;
        notebook.descricao = dadosNovos.descricao;
        notebook.dataAtualizacao = new Date().toISOString();
        
        // Salvar no Firebase
        await this.saveToFirebase();
        
        this.closeModal();
        this.renderAll();
        
        this.showToast(`✅ Notebook ${dadosNovos.numero} atualizado com sucesso!`, 'success');
        
    } catch (error) {
        console.error('❌ Erro ao editar notebook:', error);
        this.showToast('❌ Erro ao salvar alterações no Firebase', 'error');
    }
}


    async duplicarNotebook(id) {
        const notebook = this.notebooks.find(nb => nb.id === id);
        if (!notebook) return;
        
        try {
            const proximoId = Math.max(...this.notebooks.map(nb => nb.id)) + 1;
            const proximoNumero = `EMPRESTIMO_${proximoId.toString().padStart(2, '0')}`;
            
            const duplicado = {
                ...notebook,
                id: proximoId,
                numero: proximoNumero,
                serie: `${Math.floor(Math.random() * 9000) + 1000}DD3`,
                rfid: `${200794 + proximoId}`,
                status: 'disponivel',
                colaborador: null,
                setor: null,
                chamado: null,
                dataEntrega: null,
                previsaoDevolucao: null,
                dataCadastro: new Date().toISOString()
            };
            
            this.notebooks.push(duplicado);
            await this.saveToFirebase();
            this.renderAll();
            
            this.showToast(`📋 Notebook duplicado como ${duplicado.numero}`, 'success');
            
        } catch (error) {
            console.error('❌ Erro ao duplicar notebook:', error);
            this.showToast('Erro ao duplicar notebook', 'error');
        }
    }

    async excluirNotebook(id) {
        const notebook = this.notebooks.find(nb => nb.id === id);
        if (!notebook) return;
        
        if (confirm(`⚠️ Excluir o notebook ${notebook.numero}?\n\nEsta ação não pode ser desfeita.`)) {
            try {
                this.notebooks = this.notebooks.filter(nb => nb.id !== id);
                await this.saveToFirebase();
                this.renderAll();
                this.showToast(`🗑️ Notebook ${notebook.numero} excluído!`, 'success');
            } catch (error) {
                console.error('❌ Erro ao excluir notebook:', error);
                this.showToast('❌ Erro ao excluir notebook', 'error');
            }
        }
    }

    abrirModalEdicaoMassa() {
    console.log('✏️ Abrindo modal de edição em massa...');
    
    let modal = document.getElementById('modalEdicaoMassa');
    if (!modal) {
        modal = this.criarModalEdicaoMassa();
    }
    
    // Gerar exemplo para o usuário
    this.gerarExemploEdicaoMassa();
    
    modal.classList.add('active');
    
    // Focar no textarea
    setTimeout(() => {
        const textarea = modal.querySelector('#edicaoMassaTextarea');
        if (textarea) textarea.focus();
    }, 100);
}

criarModalEdicaoMassa() {
    const modal = document.createElement('div');
    modal.id = 'modalEdicaoMassa';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 900px; background: var(--black); border-radius: 12px; border: 2px solid var(--primary-orange);">
            <div class="modal-header" style="background: var(--primary-orange); padding: 20px; border-radius: 10px 10px 0 0;">
                <h2 style="margin: 0; color: var(--white); display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-edit"></i> Editar Todos em Massa
                </h2>
                <button class="modal-close" style="background: none; border: none; color: var(--white); font-size: 24px; cursor: pointer; position: absolute; top: 15px; right: 20px;">&times;</button>
            </div>
            <div class="modal-body" style="padding: 30px;">
                <div style="background: rgba(255,107,53,0.1); padding: 20px; border-radius: 8px; border-left: 4px solid var(--primary-orange); margin-bottom: 25px;">
                    <h3 style="color: var(--primary-orange); margin: 0 0 15px 0;">
                        <i class="fas fa-info-circle"></i> Como usar a Edição em Massa
                    </h3>
                    <ul style="color: var(--white); margin: 0; padding-left: 20px;">
                        <li>Cole os dados em formato <strong>Excel/CSV</strong> separados por TAB</li>
                        <li>Formato: <code style="background: var(--dark-gray); padding: 2px 6px; border-radius: 4px;">NÚMERO    SÉRIE    RFID    MODELO    PROCESSADOR    MEMÓRIA    DESCRIÇÃO</code></li>
                        <li>Apenas notebooks <strong>existentes</strong> serão atualizados (baseado no número)</li>
                        <li>Notebooks não encontrados serão <strong>ignorados</strong></li>
                    </ul>
                </div>
                
                <div class="form-group" style="margin-bottom: 20px;">
                    <label for="exemploEdicaoMassa" style="color: var(--primary-orange); font-weight: 600; margin-bottom: 8px; display: block;">
                        <i class="fas fa-file-excel"></i> Exemplo baseado nos seus notebooks:
                    </label>
                    <textarea 
                        id="exemploEdicaoMassa" 
                        readonly
                        rows="6" 
                        style="width: 100%; padding: 15px; border: 2px solid var(--medium-gray); border-radius: 8px; background: var(--dark-gray); color: var(--light-orange); font-family: 'Courier New', monospace; font-size: 0.9rem; resize: vertical;"
                    ></textarea>
                    <button id="copiarExemplo" class="btn-secondary" style="margin-top: 10px; padding: 8px 16px;">
                        <i class="fas fa-copy"></i> Copiar Exemplo
                    </button>
                </div>
                
                <div class="form-group">
                    <label for="edicaoMassaTextarea" style="color: var(--primary-orange); font-weight: 600; margin-bottom: 8px; display: block;">
                        <i class="fas fa-table"></i> Cole seus dados aqui:
                    </label>
                    <textarea 
                        id="edicaoMassaTextarea" 
                        rows="10" 
                        placeholder="Cole aqui os dados em formato Excel/CSV separados por TAB..."
                        style="width: 100%; padding: 15px; border: 2px solid var(--medium-gray); border-radius: 8px; background: var(--black); color: var(--white); font-family: 'Courier New', monospace; font-size: 0.9rem; resize: vertical;"
                    ></textarea>
                    <small style="color: var(--light-orange); margin-top: 8px; display: block;">
                        <i class="fas fa-lightbulb"></i> Dica: Copie e cole diretamente do Excel ou Google Sheets
                    </small>
                </div>
                
                <div style="background: var(--dark-gray); padding: 15px; border-radius: 8px; margin-top: 20px;">
                    <div style="display: flex; gap: 15px; align-items: center;">
                        <button id="validarDados" class="btn-info" style="padding: 10px 20px;">
                            <i class="fas fa-check-circle"></i> Validar Dados
                        </button>
                        <div id="statusValidacao" style="color: var(--white); font-size: 0.9rem;">
                            <i class="fas fa-info-circle"></i> Clique em "Validar Dados" para verificar o formato
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer" style="padding: 20px 30px; border-top: 1px solid var(--medium-gray); display: flex; gap: 15px; justify-content: flex-end;">
                <button class="btn-secondary modal-close" style="padding: 12px 24px;">
                    <i class="fas fa-times"></i> Cancelar
                </button>
                <button id="aplicarEdicaoMassa" class="btn-primary" style="padding: 12px 24px;" disabled>
                    <i class="fas fa-save"></i> Aplicar Alterações
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    modal.querySelector('#copiarExemplo').addEventListener('click', () => this.copiarExemplo());
    modal.querySelector('#validarDados').addEventListener('click', () => this.validarDadosEdicaoMassa());
    modal.querySelector('#aplicarEdicaoMassa').addEventListener('click', () => this.aplicarEdicaoMassa());
    modal.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => this.closeModal());
    });
    
    return modal;
}

gerarExemploEdicaoMassa() {
    const textarea = document.getElementById('exemploEdicaoMassa');
    if (!textarea) return;
    
    let exemplo = 'NÚMERO\tSÉRIE\tRFID\tMODELO\tPROCESSADOR\tMEMÓRIA\tDESCRIÇÃO\n';
    
    // Pegar os primeiros 3 notebooks como exemplo
    const exemplos = this.notebooks.slice(0, 3);
    
    exemplos.forEach(notebook => {
        exemplo += `${notebook.numero}\t${notebook.serie}\t${notebook.rfid}\t`;
        exemplo += `${notebook.modelo || 'Dell Inspiron 15 3000'}\t`;
        exemplo += `${notebook.processador || 'Intel Core i5-1135G7'}\t`;
        exemplo += `${notebook.memoria || '8GB DDR4'}\t`;
        exemplo += `${notebook.descricao || 'Notebook para empréstimo'}\n`;
    });
    
    textarea.value = exemplo;
}

copiarExemplo() {
    const textarea = document.getElementById('exemploEdicaoMassa');
    if (textarea) {
        textarea.select();
        document.execCommand('copy');
        this.showToast('📋 Exemplo copiado para a área de transferência!', 'info');
    }
}

validarDadosEdicaoMassa() {
    const textarea = document.getElementById('edicaoMassaTextarea');
    const statusDiv = document.getElementById('statusValidacao');
    const btnAplicar = document.getElementById('aplicarEdicaoMassa');
    
    if (!textarea.value.trim()) {
        statusDiv.innerHTML = '<i class="fas fa-exclamation-triangle" style="color: #F44336;"></i> Nenhum dado inserido';
        btnAplicar.disabled = true;
        return;
    }
    
    try {
        const linhas = textarea.value.trim().split('\n');
        const cabecalho = linhas[0];
        const dados = linhas.slice(1);
        
        if (dados.length === 0) {
            statusDiv.innerHTML = '<i class="fas fa-exclamation-triangle" style="color: #F44336;"></i> Apenas cabeçalho encontrado, sem dados';
            btnAplicar.disabled = true;
            return;
        }
        
        let validados = 0;
        let erros = 0;
        let naoEncontrados = 0;
        
        dados.forEach((linha, index) => {
            if (!linha.trim()) return;
            
            const colunas = linha.split('\t');
            if (colunas.length < 3) {
                erros++;
                return;
            }
            
            const numero = colunas[0]?.trim();
            if (!numero) {
                erros++;
                return;
            }
            
            const notebook = this.notebooks.find(nb => nb.numero === numero);
            if (!notebook) {
                naoEncontrados++;
                return;
            }
            
            validados++;
        });
        
        if (validados === 0) {
            statusDiv.innerHTML = `<i class="fas fa-exclamation-triangle" style="color: #F44336;"></i> Nenhum notebook válido encontrado`;
            btnAplicar.disabled = true;
        } else {
            statusDiv.innerHTML = `
                <i class="fas fa-check-circle" style="color: #4CAF50;"></i> 
                <strong>${validados}</strong> notebook(s) serão atualizados
                ${erros > 0 ? `| <span style="color: #F44336;">${erros} erro(s)</span>` : ''}
                ${naoEncontrados > 0 ? `| <span style="color: #FFC107;">${naoEncontrados} não encontrado(s)</span>` : ''}
            `;
            btnAplicar.disabled = false;
        }
        
    } catch (error) {
        statusDiv.innerHTML = '<i class="fas fa-exclamation-triangle" style="color: #F44336;"></i> Erro ao validar dados';
        btnAplicar.disabled = true;
    }
}

async aplicarEdicaoMassa() {
    const textarea = document.getElementById('edicaoMassaTextarea');
    const btnAplicar = document.getElementById('aplicarEdicaoMassa');
    
    if (!textarea.value.trim()) {
        this.showToast('❌ Nenhum dado para processar!', 'error');
        return;
    }
    
    // Desabilitar botão durante processamento
    const textoOriginal = btnAplicar.innerHTML;
    btnAplicar.disabled = true;
    btnAplicar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
    
    try {
        const linhas = textarea.value.trim().split('\n');
        const dados = linhas.slice(1); // Pular cabeçalho
        
        let atualizados = 0;
        let erros = 0;
        
        dados.forEach(linha => {
            if (!linha.trim()) return;
            
            const colunas = linha.split('\t');
            if (colunas.length < 3) {
                erros++;
                return;
            }
            
            const numero = colunas[0]?.trim();
            const serie = colunas[1]?.trim();
            const rfid = colunas[2]?.trim();
            const modelo = colunas[3]?.trim() || '';
            const processador = colunas[4]?.trim() || '';
            const memoria = colunas[5]?.trim() || '';
            const descricao = colunas[6]?.trim() || '';
            
            if (!numero || !serie || !rfid) {
                erros++;
                return;
            }
            
            const notebook = this.notebooks.find(nb => nb.numero === numero);
            if (!notebook) {
                return; // Notebook não encontrado, pular
            }
            
            // Atualizar dados
            notebook.serie = serie;
            notebook.rfid = rfid;
            notebook.modelo = modelo;
            notebook.processador = processador;
            notebook.memoria = memoria;
            notebook.descricao = descricao;
            notebook.dataAtualizacao = new Date().toISOString();
            
            atualizados++;
        });
        
        if (atualizados > 0) {
            // Salvar no Firebase
            await this.saveToFirebase();
            
            this.closeModal();
            this.renderAll();
            
            this.showToast(`✅ ${atualizados} notebook(s) atualizado(s) com sucesso!${erros > 0 ? ` (${erros} erro(s) ignorados)` : ''}`, 'success');
        } else {
            this.showToast('❌ Nenhum notebook foi atualizado. Verifique os dados.', 'warning');
        }
        
    } catch (error) {
        console.error('❌ Erro na edição em massa:', error);
        this.showToast('❌ Erro ao processar edição em massa', 'error');
    } finally {
        // Reabilitar botão
        btnAplicar.disabled = false;
        btnAplicar.innerHTML = textoOriginal;
    }
}


    abrirModalGerarLote() {
        this.showToast('🚧 Função de gerar lote em desenvolvimento', 'info');
    }

    exportarNotebooks() {
        try {
            const dados = {
                notebooks: this.notebooks,
                emprestimos: this.emprestimos,
                setores: this.setores,
                data_export: new Date().toISOString(),
                total_notebooks: this.notebooks.length,
                total_emprestimos: this.emprestimos.length
            };
            
            const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `notebooks_backup_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            this.showToast('📤 Dados exportados com sucesso!', 'success');
        } catch (error) {
            this.showToast('❌ Erro ao exportar dados', 'error');
        }
    }

    importarNotebooks() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const dados = JSON.parse(e.target.result);
                        if (dados.notebooks && Array.isArray(dados.notebooks)) {
                            this.notebooks = dados.notebooks;
                            if (dados.emprestimos) this.emprestimos = dados.emprestimos;
                            if (dados.setores) this.setores = dados.setores;
                            
                            await this.saveToFirebase();
                            this.renderAll();
                            this.showToast('📥 Dados importados com sucesso!', 'success');
                        } else {
                            this.showToast('❌ Formato de arquivo inválido', 'error');
                        }
                    } catch (error) {
                        this.showToast('❌ Erro ao ler arquivo', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    async resetarNotebooks() {
        if (confirm('⚠️ Isso irá remover TODOS os notebooks e empréstimos!\n\nTem certeza que deseja continuar?')) {
            try {
                this.notebooks = this.createDefaultNotebooks();
                this.emprestimos = [];
                await this.saveToFirebase();
                this.renderAll();
                this.showToast('🔄 Sistema resetado com 15 notebooks padrão!', 'success');
            } catch (error) {
                this.showToast('❌ Erro ao resetar sistema', 'error');
            }
        }
    }

    async criarNotebooksDefault() {
        try {
            this.notebooks = this.createDefaultNotebooks();
            await this.saveToFirebase();
            this.renderAll();
            this.showToast('✅ 15 notebooks criados com sucesso!', 'success');
        } catch (error) {
            console.error('❌ Erro ao criar notebooks:', error);
            this.showToast('Erro ao criar notebooks', 'error');
        }
    }

    // Outras funções mantidas
    renderCalendario() {
    console.log('📅 Renderizando calendário completo...');
    
    const calendar = document.getElementById('calendar');
    const monthYear = document.getElementById('monthYear');
    
    if (!calendar) {
        console.error('❌ Elemento #calendar não encontrado!');
        this.criarElementosCalendario();
        return;
    }
    
    if (!monthYear) {
        console.error('❌ Elemento #monthYear não encontrado!');
        return;
    }

    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    // Atualizar título do mês
    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    monthYear.textContent = `${meses[month]} ${year}`;

    // Calcular primeiro e último dia do mês
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // Gerar HTML do calendário completo
    let calendarHTML = `
        <div class="calendar-container" style="background: var(--black); border-radius: 8px; overflow: hidden; border: 1px solid var(--medium-gray);">
            <div class="calendar-header" style="display: grid; grid-template-columns: repeat(7, 1fr); background: var(--primary-orange);">
                <div class="calendar-day-header" style="padding: 15px; text-align: center; font-weight: 700; color: var(--white); border-right: 1px solid rgba(255,255,255,0.2);">Dom</div>
                <div class="calendar-day-header" style="padding: 15px; text-align: center; font-weight: 700; color: var(--white); border-right: 1px solid rgba(255,255,255,0.2);">Seg</div>
                <div class="calendar-day-header" style="padding: 15px; text-align: center; font-weight: 700; color: var(--white); border-right: 1px solid rgba(255,255,255,0.2);">Ter</div>
                <div class="calendar-day-header" style="padding: 15px; text-align: center; font-weight: 700; color: var(--white); border-right: 1px solid rgba(255,255,255,0.2);">Qua</div>
                <div class="calendar-day-header" style="padding: 15px; text-align: center; font-weight: 700; color: var(--white); border-right: 1px solid rgba(255,255,255,0.2);">Qui</div>
                <div class="calendar-day-header" style="padding: 15px; text-align: center; font-weight: 700; color: var(--white); border-right: 1px solid rgba(255,255,255,0.2);">Sex</div>
                <div class="calendar-day-header" style="padding: 15px; text-align: center; font-weight: 700; color: var(--white);">Sáb</div>
            </div>
            <div class="calendar-body" style="display: grid; grid-template-columns: repeat(7, 1fr);">
    `;

    // Gerar 42 dias (6 semanas)
    for (let i = 0; i < 42; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        const isCurrentMonth = currentDate.getMonth() === month;
        const isToday = currentDate.toDateString() === new Date().toDateString();
        
        // Encontrar empréstimos para esta data
        const emprestimosNaData = this.emprestimos.filter(emp => {
            if (emp.status !== 'ativo') return false;
            const previsaoData = new Date(emp.previsaoDevolucao);
            return previsaoData.toDateString() === currentDate.toDateString();
        });

        const emprestimosVencidos = emprestimosNaData.filter(emp => {
            const previsao = new Date(emp.previsaoDevolucao);
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            previsao.setHours(0, 0, 0, 0);
            return previsao < hoje;
        });

        // Definir estilos do dia
        let dayStyle = `
            min-height: 80px;
            padding: 8px;
            border-right: 1px solid var(--medium-gray);
            border-bottom: 1px solid var(--medium-gray);
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
            display: flex;
            flex-direction: column;
        `;
        
        if (!isCurrentMonth) {
            dayStyle += 'background: var(--dark-gray); opacity: 0.3;';
        } else {
            dayStyle += 'background: var(--black);';
        }
        
        if (isToday) {
            dayStyle += 'background: var(--primary-orange) !important; color: var(--white); font-weight: 700;';
        }
        
        if (emprestimosNaData.length > 0 && !isToday) {
            if (emprestimosVencidos.length > 0) {
                dayStyle += 'background: #F44336 !important; color: var(--white);';
            } else {
                dayStyle += 'background: #FFC107 !important; color: var(--black);';
            }
        }

        calendarHTML += `
            <div class="calendar-day" onclick="sistema.mostrarEmprestimosData('${currentDate.toISOString()}')" style="${dayStyle}">
                <span class="day-number" style="font-size: 1.1rem; font-weight: 600;">${currentDate.getDate()}</span>
                ${emprestimosNaData.length > 0 ? `
                    <div style="position: absolute; bottom: 4px; right: 4px;">
                        <span style="background: var(--white); color: ${emprestimosVencidos.length > 0 ? '#F44336' : '#333'}; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700;">
                            ${emprestimosNaData.length}
                        </span>
                    </div>
                ` : ''}
            </div>
        `;
    }

    calendarHTML += `
            </div>
        </div>
        
        <div style="display: flex; justify-content: center; gap: 20px; margin-top: 20px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 16px; height: 16px; background: var(--primary-orange); border-radius: 3px;"></div>
                <span style="color: var(--white);">Hoje</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 16px; height: 16px; background: #FFC107; border-radius: 3px;"></div>
                <span style="color: var(--white);">Devolução Prevista</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 16px; height: 16px; background: #F44336; border-radius: 3px;"></div>
                <span style="color: var(--white);">Atrasado</span>
            </div>
        </div>
    `;

    calendar.innerHTML = calendarHTML;
    
    console.log('✅ Calendário renderizado com sucesso');
}

criarElementosCalendario() {
    console.log('🔨 Criando elementos do calendário...');
    
    const calendarioTab = document.getElementById('calendario');
    if (!calendarioTab) {
        console.error('❌ Tab calendario não encontrada!');
        return;
    }
    
    // Verificar se já tem estrutura
    if (!document.getElementById('calendar')) {
        calendarioTab.innerHTML = `
            <div style="background: var(--dark-gray); border-radius: 12px; padding: 30px; margin: 20px 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                    <button id="prevMonth" class="btn-secondary" style="padding: 12px 20px;">
                        <i class="fas fa-chevron-left"></i> Anterior
                    </button>
                    <h2 id="monthYear" style="color: var(--primary-orange); margin: 0; font-size: 2rem; text-align: center;">
                        Carregando...
                    </h2>
                    <button id="nextMonth" class="btn-secondary" style="padding: 12px 20px;">
                        Próximo <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                
                <div id="calendar">
                    <!-- Calendário será renderizado aqui -->
                </div>
            </div>
        `;
    }
    
    // Reconfigurar event listeners
    this.setupCalendarEventListeners();
}

mostrarEmprestimosData(dataISO) {
    console.log('📅 Mostrando empréstimos para data:', dataISO);
    
    const data = new Date(dataISO);
    const emprestimosNaData = this.emprestimos.filter(emp => {
        if (emp.status !== 'ativo') return false;
        const previsaoData = new Date(emp.previsaoDevolucao);
        return previsaoData.toDateString() === data.toDateString();
    });

    const dataFormatada = this.formatDate(data.toISOString());

    if (emprestimosNaData.length === 0) {
        alert(`📅 ${dataFormatada}\n\nNenhum empréstimo com devolução prevista para esta data.`);
        return;
    }

    let detalhes = `📅 ${dataFormatada}\n`;
    detalhes += `📋 ${emprestimosNaData.length} empréstimo(s) com devolução prevista:\n\n`;
    
    emprestimosNaData.forEach((emp, index) => {
        const notebook = this.notebooks.find(nb => nb.id === emp.notebookId);
        const isAtrasado = new Date(emp.previsaoDevolucao) < new Date();
        
        detalhes += `${index + 1}. ${notebook ? notebook.numero : 'N/A'}\n`;
        detalhes += `   👤 ${emp.colaborador} (${emp.setor})\n`;
        detalhes += `   🎫 Chamado: ${emp.chamado}\n`;
        detalhes += `   📅 Entrega: ${this.formatDate(emp.dataEntrega)}\n`;
        detalhes += `   ⚠️ Status: ${isAtrasado ? 'ATRASADO' : 'NO PRAZO'}\n\n`;
    });

    alert(detalhes);
}


    renderHistorico() {
    console.log('📜 Renderizando histórico completo...');
    
    const tbody = document.getElementById('historicoTableBody');
    if (!tbody) {
        console.error('❌ Elemento historicoTableBody não encontrado!');
        this.criarTabelaHistorico();
        return;
    }

    if (!this.emprestimos || this.emprestimos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; opacity: 0.7; background: var(--dark-gray);">
                    <i class="fas fa-history" style="font-size: 2rem; margin-bottom: 10px; color: var(--primary-orange);"></i><br>
                    <span style="color: var(--white);">Nenhum empréstimo registrado</span>
                </td>
            </tr>
        `;
        return;
    }

    // Aplicar filtros
    const filtroNome = document.getElementById('filtroNome')?.value?.toLowerCase() || '';
    const filtroSetor = document.getElementById('filtroSetor')?.value || '';
    const filtroMes = document.getElementById('filtroMes')?.value || '';

    let historicoFiltrado = [...this.emprestimos];

    if (filtroNome) {
        historicoFiltrado = historicoFiltrado.filter(emp => 
            emp.colaborador.toLowerCase().includes(filtroNome)
        );
    }

    if (filtroSetor) {
        historicoFiltrado = historicoFiltrado.filter(emp => emp.setor === filtroSetor);
    }

    if (filtroMes) {
        historicoFiltrado = historicoFiltrado.filter(emp => {
            const dataEntrega = new Date(emp.dataEntrega);
            const mesAno = `${dataEntrega.getFullYear()}-${(dataEntrega.getMonth() + 1).toString().padStart(2, '0')}`;
            return mesAno === filtroMes;
        });
    }

    // Ordenar por data mais recente
    historicoFiltrado.sort((a, b) => new Date(b.dataEntrega) - new Date(a.dataEntrega));

    if (historicoFiltrado.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; opacity: 0.7; background: var(--dark-gray);">
                    <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 10px; color: var(--primary-orange);"></i><br>
                    <span style="color: var(--white);">Nenhum empréstimo encontrado com os filtros aplicados</span>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = historicoFiltrado.map(emprestimo => {
        const notebook = this.notebooks.find(nb => nb.id === emprestimo.notebookId);
        let statusClass = 'status-ativo';
        let statusText = 'Ativo';
        let statusColor = '#FFC107';
        
        if (emprestimo.status === 'devolvido') {
            statusClass = 'status-devolvido';
            statusText = 'Devolvido';
            statusColor = '#4CAF50';
        } else if (emprestimo.status === 'ativo') {
            const previsao = new Date(emprestimo.previsaoDevolucao);
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            previsao.setHours(0, 0, 0, 0);
            
            if (previsao < hoje) {
                statusClass = 'status-atrasado';
                statusText = 'Atrasado';
                statusColor = '#F44336';
            }
        }

        return `
            <tr onclick="sistema.mostrarDetalhesEmprestimo(${emprestimo.id})" style="cursor: pointer; transition: background-color 0.2s ease;" onmouseover="this.style.backgroundColor='var(--dark-gray)'" onmouseout="this.style.backgroundColor='transparent'">
                <td style="padding: 12px; border-bottom: 1px solid var(--medium-gray); color: var(--white);">
                    <strong style="color: var(--primary-orange);">${notebook ? notebook.numero : 'N/A'}</strong>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid var(--medium-gray); color: var(--white);">
                    ${emprestimo.colaborador}
                </td>
                <td style="padding: 12px; border-bottom: 1px solid var(--medium-gray); color: var(--white);">
                    ${emprestimo.setor}
                </td>
                <td style="padding: 12px; border-bottom: 1px solid var(--medium-gray); color: var(--white);">
                    ${emprestimo.chamado}
                </td>
                <td style="padding: 12px; border-bottom: 1px solid var(--medium-gray); color: var(--white);">
                    ${this.formatDateTime(emprestimo.dataEntrega)}
                </td>
                <td style="padding: 12px; border-bottom: 1px solid var(--medium-gray); color: var(--white);">
                    ${emprestimo.dataDevolucao ? this.formatDateTime(emprestimo.dataDevolucao) : '-'}
                </td>
                <td style="padding: 12px; border-bottom: 1px solid var(--medium-gray);">
                    <span class="status-badge ${statusClass}" style="padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; background: ${statusColor}; color: white; display: inline-block;">
                        ${statusText}
                    </span>
                </td>
            </tr>
        `;
    }).join('');

    console.log(`✅ Histórico renderizado com ${historicoFiltrado.length} registros`);
}

criarTabelaHistorico() {
    console.log('🔨 Criando tabela de histórico...');
    
    const historicoTab = document.getElementById('historico');
    if (!historicoTab) {
        console.error('❌ Tab historico não encontrada!');
        return;
    }
    
    // Verificar se já tem estrutura
    if (!document.getElementById('historicoTableBody')) {
        historicoTab.innerHTML = `
            <div style="background: var(--dark-gray); border-radius: 12px; padding: 30px; margin: 20px 0;">
                <h2 style="color: var(--primary-orange); margin-bottom: 25px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-history"></i> Histórico de Empréstimos
                </h2>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px;">
                    <div class="form-group">
                        <label for="filtroNome" style="color: var(--primary-orange); font-weight: 600; margin-bottom: 8px; display: block;">
                            <i class="fas fa-user"></i> Filtrar por Colaborador:
                        </label>
                        <input type="text" id="filtroNome" placeholder="Digite o nome..." style="width: 100%; padding: 10px; border: 2px solid var(--medium-gray); border-radius: 8px; background: var(--black); color: var(--white);">
                    </div>
                    
                    <div class="form-group">
                        <label for="filtroSetor" style="color: var(--primary-orange); font-weight: 600; margin-bottom: 8px; display: block;">
                            <i class="fas fa-building"></i> Filtrar por Setor:
                        </label>
                        <select id="filtroSetor" style="width: 100%; padding: 10px; border: 2px solid var(--medium-gray); border-radius: 8px; background: var(--black); color: var(--white);">
                            <option value="">Todos os setores</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="filtroMes" style="color: var(--primary-orange); font-weight: 600; margin-bottom: 8px; display: block;">
                            <i class="fas fa-calendar"></i> Filtrar por Mês:
                        </label>
                        <input type="month" id="filtroMes" style="width: 100%; padding: 10px; border: 2px solid var(--medium-gray); border-radius: 8px; background: var(--black); color: var(--white);">
                    </div>
                </div>
                
                <div style="overflow-x: auto; border-radius: 8px; border: 1px solid var(--medium-gray);">
                    <table style="width: 100%; border-collapse: collapse; background: var(--black);">
                        <thead style="background: var(--primary-orange);">
                            <tr>
                                <th style="padding: 15px; text-align: left; color: var(--white); font-weight: 700;">Notebook</th>
                                <th style="padding: 15px; text-align: left; color: var(--white); font-weight: 700;">Colaborador</th>
                                <th style="padding: 15px; text-align: left; color: var(--white); font-weight: 700;">Setor</th>
                                <th style="padding: 15px; text-align: left; color: var(--white); font-weight: 700;">Chamado</th>
                                <th style="padding: 15px; text-align: left; color: var(--white); font-weight: 700;">Data Entrega</th>
                                <th style="padding: 15px; text-align: left; color: var(--white); font-weight: 700;">Data Devolução</th>
                                <th style="padding: 15px; text-align: left; color: var(--white); font-weight: 700;">Status</th>
                            </tr>
                        </thead>
                        <tbody id="historicoTableBody">
                            <!-- Dados serão inseridos aqui -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    // Configurar filtros
    setTimeout(() => {
        this.setupHistoricoFilters();
    }, 100);
}

setupHistoricoFilters() {
    console.log('🔧 Configurando filtros do histórico...');
    
    const filtroNome = document.getElementById('filtroNome');
    const filtroSetor = document.getElementById('filtroSetor');
    const filtroMes = document.getElementById('filtroMes');
    
    if (filtroNome) {
        filtroNome.addEventListener('input', () => this.renderHistorico());
    }
    
    if (filtroSetor) {
        filtroSetor.addEventListener('change', () => this.renderHistorico());
    }
    
    if (filtroMes) {
        filtroMes.addEventListener('change', () => this.renderHistorico());
    }
    
    console.log('✅ Filtros do histórico configurados');
}


    renderSetores() {
        console.log('🏢 Renderizando setores...');
        
        const container = document.getElementById('setoresList');
        if (!container) {
            console.error('❌ Container setoresList não encontrado!');
            return;
        }

        if (!this.setores || this.setores.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; background: var(--dark-gray); border-radius: 8px; opacity: 0.7;">
                    <p>Nenhum setor cadastrado</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.setores.map((setor, index) => `
            <div class="setor-item" style="background: var(--dark-gray); border-radius: 8px; padding: 15px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid var(--primary-orange);">
                <span style="color: var(--white); font-weight: 500;">${setor}</span>
                <button class="btn-danger btn-small remover-setor-btn" data-setor-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        // Configurar listeners dos botões remover
        setTimeout(() => {
            document.querySelectorAll('.remover-setor-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const index = parseInt(btn.getAttribute('data-setor-index'));
                    this.removerSetor(index);
                });
            });
        }, 100);

        console.log(`✅ ${this.setores.length} setores renderizados`);
    }

    updateStats() {
        const disponiveisCount = this.notebooks.filter(nb => nb.status === 'disponivel').length;
        const emprestadosCount = this.notebooks.filter(nb => nb.status === 'emprestado').length;
        const totalCount = this.notebooks.length;
        
        // Atualizar header
        const disponiveisEl = document.getElementById('disponiveisCount');
        const emprestadosEl = document.getElementById('emprestadosCount');
        
        if (disponiveisEl) disponiveisEl.textContent = disponiveisCount;
        if (emprestadosEl) emprestadosEl.textContent = emprestadosCount;
        
        // Atualizar seção gestão
        const totalEl = document.getElementById('totalNotebooks');
        const disponiveisExtraEl = document.getElementById('disponiveis');
        const emUsoEl = document.getElementById('emUso');
        
        if (totalEl) totalEl.textContent = totalCount;
        if (disponiveisExtraEl) disponiveisExtraEl.textContent = disponiveisCount;
        if (emUsoEl) emUsoEl.textContent = emprestadosCount;

        console.log(`📊 Stats: ${totalCount} total, ${disponiveisCount} disponíveis, ${emprestadosCount} em uso`);
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
        const selects = ['setorColaborador', 'filtroSetor'];
        
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (!select) return;
            
            const valorAtual = select.value;
            const placeholder = selectId === 'filtroSetor' ? 'Todos os setores' : 'Selecione o setor';
            
            select.innerHTML = `<option value="">${placeholder}</option>`;
            this.setores.forEach(setor => {
                const option = document.createElement('option');
                option.value = setor;
                option.textContent = setor;
                select.appendChild(option);
            });
            select.value = valorAtual;
        });
    }

    async adicionarSetor() {
        const input = document.getElementById('novoSetor');
        if (!input) return;
        
        const novoSetor = input.value.trim();

        if (!novoSetor) {
            this.showToast('Digite o nome do setor!', 'error');
            return;
        }

        if (this.setores.includes(novoSetor)) {
            this.showToast('Este setor já existe!', 'warning');
            return;
        }

        try {
            this.setores.push(novoSetor);
            await this.saveToFirebase();
            
            input.value = '';
            this.renderSetores();
            this.updateSetorOptions();
            
            this.showToast(`✅ Setor "${novoSetor}" adicionado!`, 'success');
            
        } catch (error) {
            console.error('❌ Erro ao adicionar setor:', error);
            this.setores = this.setores.filter(s => s !== novoSetor);
            this.showToast('Erro ao salvar setor', 'error');
        }
    }

    async removerSetor(index) {
        const setor = this.setores[index];
        if (!confirm(`Remover o setor "${setor}"?`)) return;

        try {
            this.setores.splice(index, 1);
            await this.saveToFirebase();
            
            this.renderSetores();
            this.updateSetorOptions();
            
            this.showToast(`✅ Setor "${setor}" removido!`, 'success');
            
        } catch (error) {
            console.error('❌ Erro ao remover setor:', error);
            this.showToast('Erro ao remover setor', 'error');
        }
    }

    async saveToFirebase() {
        try {
            console.log('💾 Salvando no Firebase...');
            
            await Promise.all([
                this.dbNotebooks.set(this.notebooks),
                this.dbEmprestimos.set(this.emprestimos),
                this.dbSetores.set(this.setores)
            ]);
            
            console.log('✅ Dados salvos no Firebase');
            
        } catch (error) {
            console.error('❌ Erro ao salvar no Firebase:', error);
            throw error;
        }
    }

    switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');

    // Renderizar conteúdo específico da aba
    setTimeout(() => {
        switch(tabName) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'calendario':
                this.renderCalendario();
                break;
            case 'solicitar':
                this.updateNotebookOptions();
                break;
            case 'historico':
                this.renderHistorico();
                break;
            case 'setores':
                this.renderSetores();
                this.renderListaNotebooksEdicao();
                setTimeout(() => {
                    this.setupNotebookManagementButtons();
                }, 500);
                break;
        }
    }, 100);
}


    setMinDate() {
        const hoje = new Date();
        const amanha = new Date(hoje);
        amanha.setDate(hoje.getDate() + 1);
        
        const minDate = amanha.toISOString().split('T')[0];
        
        const dateInput = document.getElementById('dataPrevisaoDevolucao');
        if (dateInput) {
            dateInput.min = minDate;
        }
    }

    closeModal() {
    console.log('❌ Fechando modais...');
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
        
        // Limpar dados específicos de cada modal
        if (modal.id === 'modalDevolucao') {
            modal.removeAttribute('data-notebook-id');
            modal.removeAttribute('data-emprestimo-id');
            
            const observacoes = modal.querySelector('#observacoesDevolucao');
            if (observacoes) observacoes.value = '';
            
            const btnConfirmar = modal.querySelector('#confirmarDevolucao');
            if (btnConfirmar) {
                btnConfirmar.disabled = false;
                btnConfirmar.innerHTML = '<i class="fas fa-check"></i> Confirmar Devolução';
            }
        }
        
        if (modal.id === 'modalAdicionarNotebook') {
            // Limpar formulário de adicionar notebook
            const inputs = modal.querySelectorAll('input, textarea');
            inputs.forEach(input => input.value = '');
        }
    });
}

// NOVA FUNÇÃO: Configurar event listeners de modais CORRIGIDA
setupModalEventListeners() {
    console.log('🔧 Configurando event listeners dos modais...');
    
    // Configurar botões de fechar modal de forma global
    document.addEventListener('click', (e) => {
        // Botões com classe modal-close
        if (e.target.classList.contains('modal-close') || e.target.closest('.modal-close')) {
            e.preventDefault();
            e.stopPropagation();
            this.closeModal();
        }
        
        // Clique fora do modal (no backdrop)
        if (e.target.classList.contains('modal')) {
            e.preventDefault();
            this.closeModal();
        }
    });
    
    // ESC para fechar modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            this.closeModal();
        }
    });
    
    console.log('✅ Event listeners de modais configurados globalmente');
}


    // Funções auxiliares
    mostrarDetalhesNotebook(id) {
        const notebook = this.notebooks.find(nb => nb.id === id);
        if (!notebook) return;

        let detalhes = `Notebook: ${notebook.numero}\nSérie: ${notebook.serie}\nRFID: ${notebook.rfid}\nStatus: ${notebook.status}`;
        if (notebook.modelo) detalhes += `\nModelo: ${notebook.modelo}`;
        if (notebook.processador) detalhes += `\nProcessador: ${notebook.processador}`;
        if (notebook.memoria) detalhes += `\nMemória: ${notebook.memoria}`;
        if (notebook.colaborador) {
            detalhes += `\n\nEmprestado para: ${notebook.colaborador}\nSetor: ${notebook.setor}\nChamado: ${notebook.chamado}`;
        }
        alert(detalhes);
    }

    mostrarDetalhesEmprestimo(id) {
        const emprestimo = this.emprestimos.find(emp => emp.id === id);
        if (!emprestimo) return;

        const notebook = this.notebooks.find(nb => nb.id === emprestimo.notebookId);
        
        let detalhes = `Empréstimo: ${notebook ? notebook.numero : 'N/A'}\nColaborador: ${emprestimo.colaborador}\nSetor: ${emprestimo.setor}\nChamado: ${emprestimo.chamado}\nMotivo: ${emprestimo.motivo}`;
        alert(detalhes);
    }

    formatDate(dateString) {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR');
    }

    formatDateTime(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR') + ' às ' + 
               date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
    }

    isAtrasado(previsaoDevolucao) {
        if (!previsaoDevolucao) return false;
        const previsao = new Date(previsaoDevolucao);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        previsao.setHours(0, 0, 0, 0);
        return previsao < hoje;
    }

    showToast(message, type = 'success') {
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
        
        document.querySelectorAll('.toast').forEach(toast => toast.remove());

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1001;
            max-width: 300px;
        `;
        
        const colors = {
            success: '#4CAF50',
            error: '#F44336',
            warning: '#FF9800',
            info: '#2196F3'
        };
        
        toast.style.backgroundColor = colors[type] || colors.success;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 4000);
    }
}

// Inicializar sistema
let sistema;
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌟 DOM carregado, inicializando sistema...');
    sistema = new SistemaEmprestimos();
});
</script>

</body>
</html>

                

                o index.html original