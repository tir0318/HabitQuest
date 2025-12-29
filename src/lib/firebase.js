import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDTkczwnvutu4e-zfL_17wWJi11p-Xq2xw",
    authDomain: "habitquest-7c8bb.firebaseapp.com",
    projectId: "habitquest-7c8bb",
    storageBucket: "habitquest-7c8bb.firebasestorage.app",
    messagingSenderId: "345820864962",
    appId: "1:345820864962:web:45a72d4f2c25e7f3aef65b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable persistence
// Note: enableIndexedDbPersistence is deprecated in v9 but generic enablePersistence is not available in tree-shakable? 
// Actually enableIndexedDbPersistence is correct for web modular.
// Wait, in v10+ it might be different, but let's stick to standard modular.
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.log('Multiple tabs open, persistence can only be enabled in one tab at a a time.');
    } else if (err.code == 'unimplemented') {
        console.log('The current browser does not support all of the features required to enable persistence');
    }
});
