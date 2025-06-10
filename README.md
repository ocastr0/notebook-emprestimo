# notebook-emprestimo]

Criar um firebase.js para referenciar no index

O exemplo que deu certo utilizando "Dados" no firebase e o que está no INDEX abaixo.

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

Preciso que isso funcione para todas as funcionalidades, emprestimos.js | notebook.js | realtime.js
 setores.js | stats.js | script.js


