// استيراد Firebase
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { auth } from "./firebase-config.js"; // استيراد التهيئة

// استهداف نموذج استعادة كلمة المرور
const forgotForm = document.getElementById("forgot-form");

forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // جلب البريد الإلكتروني المدخل
    const email = document.getElementById("forgot-email").value;

    try {
        // إرسال رابط إعادة تعيين كلمة المرور إلى البريد الإلكتروني
        await sendPasswordResetEmail(auth, email);
        alert("✅ Password reset email sent! Check your inbox.");
    } catch (error) {
        alert("❌ Error: " + error.message);
    }
});