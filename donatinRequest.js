import { getFirestore, collection, getDocs, addDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { app } from "./firebase-config.js"; 

const auth = getAuth(app);
const db = getFirestore(app);

const donorList = document.getElementById("donorList");
const donorIdInput = document.getElementById("donorId");
const donationTypeSelect = document.getElementById("donationType");
const bloodTypeSelect = document.getElementById("bloodType");
const organTypeSelect = document.getElementById("organType");
const donationDateInput = document.getElementById("donationDate");
const donationForm = document.getElementById("donationRequestForm");

// ✅ تحميل قائمة المتبرعين
async function loadDonors() {
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        donorList.innerHTML = '<option value="">-- Select Donor --</option>';

        querySnapshot.forEach((doc) => {
            const donor = doc.data();
            if (donor.role === "donor") {
                const option = document.createElement("option");
                option.value = doc.id;
                option.textContent = donor.fullName; 
                donorList.appendChild(option);
            }
        });
    } catch (error) {
        console.error("❌ Error fetching donors:", error);
    }
}

// ✅ تحديث معرف المتبرع عند اختياره
donorList.addEventListener("change", () => {
    if (!donorList.value) return;
    donorIdInput.value = donorList.value;
});

// ✅ استرجاع بيانات المستشفى الحالي من Firestore
async function getHospitalData(userId) {
    const hospitalRef = doc(db, "users", userId);
    const hospitalSnap = await getDoc(hospitalRef);
    
    if (hospitalSnap.exists()) {
        return hospitalSnap.data().hospitalName || "Unknown Hospital";
    } else {
        return "Unknown Hospital";
    }
}

// ✅ إرسال طلب التبرع إلى Firebase مع اسم المستشفى الصحيح
donationForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const donorId = donorIdInput.value.trim();
    const donorName = donorList.options[donorList.selectedIndex].text;
    const donationType = donationTypeSelect.value;
    const donationDate = donationDateInput.value;
    const donationDetails = donationType === "Blood" ? bloodTypeSelect.value : organTypeSelect.value;

    if (!donorId || !donorName || !donationType || !donationDate || !donationDetails) {
        alert("❌ Please fill in all required fields.");
        return;
    }

    try {
        // ✅ التأكد من أن المستخدم مسجل دخول
        const user = auth.currentUser;
        if (!user) {
            alert("❌ Please log in again.");
            return;
        }

        // ✅ جلب اسم المستشفى
        const hospitalName = await getHospitalData(user.uid);
        console.log("✅ Hospital Name Retrieved:", hospitalName); // 🔹 تأكيد أن hospitalName يتم جلبه بشكل صحيح

        // ✅ إرسال الطلب إلى Firestore مع اسم المستشفى الصحيح
        await addDoc(collection(db, "donationRequests"), {
            donorId,
            donorName,
            hospitalId: user.uid,  
            hospitalName, 
            donationType,
            donationDetails,
            donationDate,
            status: "Pending",
            createdAt: new Date()
        });

        alert("✅ Donation request sent successfully!");
        donationForm.reset();
    } catch (error) {
        console.error("❌ Error sending request:", error);
    }
});

// ✅ تحميل قائمة المتبرعين عند فتح الصفحة
loadDonors();