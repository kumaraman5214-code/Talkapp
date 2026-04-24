// app.js

// Firebase configuration
const firebaseConfig = {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_AUTH_DOMAIN',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_STORAGE_BUCKET',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID'
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Elements
const messagingInput = document.getElementById('message-input');
const messagesList = document.getElementById('messages');
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');

let currentUser;

// User authentication
loginButton.addEventListener('click', () => {
    const email = prompt('Enter your email:');
    const password = prompt('Enter your password:');
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then(userCredential => {
        currentUser = userCredential.user;
        console.log('Logged in:', currentUser);
        updateOnlineStatus(true);
    })
    .catch(error => console.error(error));
});

logoutButton.addEventListener('click', () => {
    firebase.auth().signOut();
    currentUser = null;
    console.log('Logged out');
    updateOnlineStatus(false);
});

// Send message
messagingInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && currentUser) {
        const message = messagingInput.value;
        sendMessage(currentUser.uid, message);
        messagingInput.value = '';
    }
});

function sendMessage(userId, message) {
    // Add message to Firestore
    firebase.firestore().collection('messages').add({
        userId,
        message,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
}

// Track online status
function updateOnlineStatus(isOnline) {
    if (currentUser) {
        firebase.firestore().collection('users').doc(currentUser.uid).set({
            online: isOnline
        });
    }
}

// Track read receipts
function trackReadReceipt(messageId, userId) {
    firebase.firestore().collection('messages').doc(messageId).set({
        readBy: firebase.firestore.FieldValue.arrayUnion(userId)
    }, { merge: true });
}

// Listen for new messages
firebase.firestore().collection('messages').orderBy('timestamp').onSnapshot(snapshot => {
    snapshot.forEach(doc => {
        const msg = doc.data();
        const li = document.createElement('li');
        li.textContent = `${msg.userId}: ${msg.message}`;
        messagesList.appendChild(li);
    });
});