// ====================================
// HabitQuest - Firebase Configuration
// ====================================

const firebaseConfig = {
    apiKey: "AIzaSyDTkczwnvutu4e-zfL_17wWJi11p-Xq2xw",
    authDomain: "habitquest-7c8bb.firebaseapp.com",
    projectId: "habitquest-7c8bb",
    storageBucket: "habitquest-7c8bb.firebasestorage.app",
    messagingSenderId: "345820864962",
    appId: "1:345820864962:web:45a72d4f2c25e7f3aef65b"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Enable offline persistence
db.enablePersistence()
    .catch((err) => {
        if (err.code == 'failed-precondition') {
            console.log('Multiple tabs open, persistence can only be enabled in one tab at a a time.');
        } else if (err.code == 'unimplemented') {
            console.log('The current browser does not support all of the features required to enable persistence');
        }
    });
