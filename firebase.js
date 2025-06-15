// CONFIGURAÇÃO CENTRAL DO FIREBASE
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

// Inicializar Firebase apenas uma vez
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log('🔥 Firebase inicializado centralmente');
}

// Exportar referências para uso global
if (typeof window !== 'undefined') {
    window.firebaseConfig = firebaseConfig;
    window.getFirebaseApp = () => firebase.app();
    window.getFirebaseAuth = () => firebase.auth();
    window.getFirebaseDatabase = () => firebase.database();
}

// Para uso em módulos Node.js (APIs)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        firebaseConfig,
        initFirebase: () => {
            if (typeof firebase !== 'undefined' && !firebase.apps.length) {
                return firebase.initializeApp(firebaseConfig);
            }
            return firebase.app();
        }
    };
}
