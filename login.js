// استيراد Firebase
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js"; // استيراد التهيئة

// استهداف نموذج تسجيل الدخول
const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // جلب بيانات تسجيل الدخول
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        // ✅ تسجيل الدخول باستخدام Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("✅ User logged in:", user.uid);

        // ✅ جلب بيانات المستخدم من Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        console.log("🔍 Checking Firestore for user data...");
        console.log("🔍 Checking Firestore for user data...");
        console.log("User UID:", user.uid);
        console.log("Firestore Data:", userDoc.data());

        if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("✅ User data found:", userData);

            if (!userData.role) {
                alert("❌ Error: User role is missing in Firestore.");
                return;
            }

            // ✅ حفظ الدور في Local Storage
            localStorage.setItem("userRole", userData.role);

            // ✅ توجيه المستخدم إلى الصفحة المناسبة
            if (userData.role === "donor") {
                window.location.href = "home.html"; // صفحة المتبرع
            } else if (userData.role === "hospital") {
                window.location.href = "hospital-home.html"; // صفحة المستشفى
            } else if (userData.role === "admin") {
                window.location.href = "admin-home.html"; // صفحة الأدمن
            } else {
                alert("❌ Unknown role detected.");
            }
        } else {
            console.error("❌ User data not found in Firestore.");
            alert("❌ Error: User data not found in Firestore.");
        }
    } catch (error) {
        console.error("❌ Login error:", error.message);
        alert("❌ Login error: " + error.message);
    }
});