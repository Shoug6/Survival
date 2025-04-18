// استيراد Firebase
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js"; // استيراد التهيئة

// استهداف نموذج التسجيل
const signupForm = document.getElementById("signup-form");

signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userRole = localStorage.getItem("userRole");
    if (userRole !== "donor") {
        alert("❌ Access Denied! You are not allowed to register as a donor.");
        window.location.href = "index.html";
        return;
    }

    const fullName = document.getElementById("full-name").value;
    const nationalID = document.getElementById("nationalID").value;
    const age = document.getElementById("age").value;
    const dob = document.getElementById("dob").value;
    const bloodType = document.getElementById("blood-type").value;
    const phone = document.getElementById("phone").value;
    const location = document.getElementById("location").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const usersCollection = collection(db, "users");
        await setDoc(doc(usersCollection, user.uid), {
            fullName,
            nationalID,
            age,
            dob,
            bloodType,
            phone,
            location,
            email,
            role: userRole
        });

        // ✅ استدعاء saveUserData بعد نجاح التسجيل
        saveUserData();

    } catch (error) {
        alert("❌ Registration error: " + error.message);
    }
});

function saveUserData() {
    let userData = {
        name: document.getElementById("full-name").value, // تأكدي أن الـ id مطابق لما في HTML
        nationalID: document.getElementById("nationalID") ? document.getElementById("nationalID").value : "",
        city: document.getElementById("location").value,
        bloodType: document.getElementById("blood-type").value,
        phone: document.getElementById("phone").value,
        email: document.getElementById("email").value
    };

    localStorage.setItem("userProfile", JSON.stringify(userData));
    window.location.href = "home.html";
}
