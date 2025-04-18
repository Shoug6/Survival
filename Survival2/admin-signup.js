// استيراد Firebase
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js"; // استيراد التهيئة

// استهداف نموذج التسجيل
const signupForm = document.getElementById("signup-form");

signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // التحقق من الدور المخزن في Local Storage
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "admin") {
        alert("❌ Access Denied! You are not allowed to register as an admin.");
        window.location.href = "index.html"; // إعادة المستخدم للصفحة الرئيسية
        return;
    }

    // جلب بيانات الإدمن من المدخلات
    const adminName = document.getElementById("admin-name").value;
    const email = document.getElementById("admin-email").value;
    const password = document.getElementById("admin-password").value;
    const phone = document.getElementById("admin-phone").value;

    try {
        // إنشاء مستخدم جديد في Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // حفظ بيانات الإدمن في Firestore
        const usersCollection = collection(db, "users");
        await setDoc(doc(usersCollection, user.uid), {
            adminName,
            email,
            phone,
            role: "admin" // تحديد الدور كأدمن
        });

        alert("✅ Admin registered successfully!");
        window.location.href = "login.html"; // توجيه المستخدم إلى تسجيل الدخول بعد النجاح
    } catch (error) {
        alert("❌ Registration error: " + error.message);
    }
});