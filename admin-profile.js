import { auth, db } from "./firebase-config.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// ✅ التحقق من تسجيل الدخول وجلب بيانات الأدمن
auth.onAuthStateChanged(async (user) => {
    if (user) {
        const adminRef = doc(db, "users", user.uid);
        const adminSnap = await getDoc(adminRef);

        if (adminSnap.exists()) {
            const data = adminSnap.data();
            document.getElementById("admin-name").value = data.adminName;  // ✅ تصحيح الاسم
            document.getElementById("admin-email").value = data.email;
            document.getElementById("admin-phone").value = data.phone || ""; // ✅ تعيين رقم الجوال افتراضيًا فارغًا إذا لم يكن موجودًا
        }
    } else {
        window.location.href = "login.html";
    }
});

// ✅ تحديث البيانات عند الضغط على الزر
document.getElementById("update-profile").addEventListener("click", async () => {
    const user = auth.currentUser;
    if (user) {
        const phone = document.getElementById("admin-phone").value;

        if (phone.trim() === "") {
            alert("❌ Please enter a valid phone number.");
            return;
        }

        const adminRef = doc(db, "users", user.uid);
        await updateDoc(adminRef, {
            phone: phone
        });

        document.getElementById("success-message").style.display = "block";
        setTimeout(() => {
            document.getElementById("success-message").style.display = "none";
        }, 3000);
    }
});