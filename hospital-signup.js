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
    if (userRole !== "hospital") {
        alert("❌ Access Denied! You are not allowed to register as a hospital.");
        window.location.href = "index.html"; // إعادة المستخدم للصفحة الرئيسية
        return;
    }

    // جلب بيانات المستشفى من المدخلات
    const hospitalName = document.getElementById("hospital-name").value;
    const email = document.getElementById("hospital-email").value;
    const password = document.getElementById("hospital-password").value;
    const phone = document.getElementById("hospital-phone").value;
    const location = document.getElementById("location").value; // ✅ تعديل الخطأ هنا

    try {
        // إنشاء مستخدم جديد في Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // حفظ بيانات المستشفى في Firestore
        const hospitalsCollection = collection(db, "users");
        await setDoc(doc(hospitalsCollection, user.uid), {
            hospitalName,
            email,
            phone,
            location,
            role: "hospital" // تحديد الدور كمستشفى
        });

        alert("✅ Hospital registered successfully!");
        window.location.href = "hospital-home.html"; // ✅ ينقل المستشفى مباشرة إلى صفحته بعد التسجيل
    } catch (error) {
        alert("❌ Registration error: " + error.message);
    }
});