import { auth, db } from "./firebase-config.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// ✅ التحقق من تسجيل الدخول وجلب بيانات المستشفى
auth.onAuthStateChanged(async (user) => {
    if (user) {
        const hospitalRef = doc(db, "users", user.uid);
        const hospitalSnap = await getDoc(hospitalRef);

        if (hospitalSnap.exists()) {
            const data = hospitalSnap.data();
            document.getElementById("hospital-name").value = data.hospitalName;
            document.getElementById("hospital-email").value = data.email;
            document.getElementById("hospital-phone").value = data.phone;
            document.getElementById("hospital-location").value = data.location;
        }
    } else {
        window.location.href = "login.html";
    }
});

// ✅ تحديث البيانات عند الضغط على الزر
document.getElementById("update-profile").addEventListener("click", async () => {
    const user = auth.currentUser;
    if (user) {
        const phone = document.getElementById("hospital-phone").value;
        
        const hospitalRef = doc(db, "users", user.uid);
        await updateDoc(hospitalRef, {
            phone: phone,
          
        });

        document.getElementById("success-message").style.display = "block";
        setTimeout(() => {
            document.getElementById("success-message").style.display = "none";
        }, 3000);
    }
});