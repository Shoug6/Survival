import { auth, db } from "./firebase-config.js";
import { getDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// ✅ تحميل بيانات المتبرع عند تسجيل الدخول
auth.onAuthStateChanged(async (user) => {
    if (user) {
        const donorRef = doc(db, "users", user.uid);
        const donorSnap = await getDoc(donorRef);

        if (donorSnap.exists()) {
            const donorData = donorSnap.data();

            document.getElementById("donor-name").value = donorData.fullName;
            document.getElementById("donor-id").value = donorData.nationalID;
            document.getElementById("donor-blood").value = donorData.bloodType;
            document.getElementById("donor-location").value = donorData.location;
            document.getElementById("donor-age").value = donorData.age;
            document.getElementById("donor-phone").value = donorData.phone;
            document.getElementById("donor-email").value = donorData.email;
        }
    } else {
        window.location.href = "login.html"; // ✅ إعادة التوجيه إذا لم يكن مسجلاً
    }
});

// ✅ تحديث رقم الجوال والبريد الإلكتروني فقط
document.getElementById("update-profile").addEventListener("click", async () => {
    const user = auth.currentUser;
    if (user) {
        const phone = document.getElementById("donor-phone").value.trim();
        const email = document.getElementById("donor-email").value.trim();

        if (phone === "" || email === "") {
            alert("❌ Please fill in both Phone Number and Email.");
            return;
        }

        const donorRef = doc(db, "users", user.uid);
        await updateDoc(donorRef, { phone: phone, email: email });

        document.getElementById("success-message").style.display = "block";
        setTimeout(() => {
            document.getElementById("success-message").style.display = "none";
        }, 3000);
    }
});