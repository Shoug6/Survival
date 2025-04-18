import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// ✅ إعداد Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBz6IaA5XS_-w4XvrGQJaRbMNPy-FLCwMU",
  authDomain: "survivallink-4cfc2.firebaseapp.com",
  projectId: "survivallink-4cfc2",
  storageBucket: "survivallink-4cfc2.appspot.com",
  messagingSenderId: "180630872481",
  appId: "1:180630872481:web:ab093edc5d57733409abe0",
  measurementId: "G-0EYEL52YWR"
};

// ✅ تهيئة Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db }; // ✅ تأكد من تصدير