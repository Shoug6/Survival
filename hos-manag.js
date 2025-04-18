import { db } from "./firebase-config.js";
import { collection, getDocs, addDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// ✅ تحميل بيانات المستشفيات عند فتح الصفحة
async function loadHospitals() {
    const hospitalTable = document.getElementById("hospitalTable");
    hospitalTable.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>";

    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        hospitalTable.innerHTML = ""; // تفريغ الجدول قبل إعادة التعبئة

        querySnapshot.forEach((docSnap) => {
            const hospital = docSnap.data();
            if (hospital.role === "hospital") {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${docSnap.id}</td> 
                    <td>${hospital.hospitalName || "Unknown"}</td>
                    <td>${hospital.email || "No Email"}</td>
                    <td>
                        <button onclick="deleteHospital('${docSnap.id}')">Delete</button>
                    </td>
                `;
                hospitalTable.appendChild(row);
            }
        });

        if (!hospitalTable.innerHTML) {
            hospitalTable.innerHTML = "<tr><td colspan='4'>No hospitals found.</td></tr>";
        }

    } catch (error) {
        console.error("❌ Error fetching hospitals:", error);
        hospitalTable.innerHTML = "<tr><td colspan='4'>Failed to load hospitals.</td></tr>";
    }
}

// ✅ حذف مستشفى من Firebase
window.deleteHospital = async function (hospitalId) {
    if (confirm("Are you sure you want to delete this hospital?")) {
        try {
            await deleteDoc(doc(db, "users", hospitalId));
            alert("✅ Hospital deleted successfully!");
            loadHospitals(); // إعادة تحميل البيانات بعد الحذف
        } catch (error) {
            console.error("❌ Error deleting hospital:", error);
            alert("⚠️ Failed to delete hospital.");
        }
    }
};

// ✅ إضافة مستشفى جديد (Firebase ينشئ ID تلقائيًا)
document.getElementById("addHospitalForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const hospitalName = document.getElementById("hospitalName").value.trim();
    const hospitalEmail = document.getElementById("hospitalEmail").value.trim();

    if (!hospitalName || !hospitalEmail) {
        alert("❌ Please fill in all fields.");
        return;
    }

    try {
        const newHospitalRef = await addDoc(collection(db, "users"), {
            hospitalName,
            email: hospitalEmail,
            role: "hospital" // ✅ تحديد الدور كمستشفى
        });

        alert(`✅ Hospital added successfully! ID: ${newHospitalRef.id}`);
        document.getElementById("addHospitalForm").reset();
        loadHospitals(); // إعادة تحميل القائمة بعد الإضافة

    } catch (error) {
        console.error("❌ Error adding hospital:", error);
        alert("⚠️ Failed to add hospital.");
    }
});

// ✅ تحميل بيانات المستشفيات عند فتح الصفحة
document.addEventListener("DOMContentLoaded", loadHospitals);