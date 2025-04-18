import { auth, db } from "./firebase-config.js";
import { doc, getDoc, collection, getDocs, query, where, addDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// ✅ التحقق من تسجيل دخول الأدمن وجلب اسمه
auth.onAuthStateChanged(async (user) => {
    if (user) {
        const adminRef = doc(db, "users", user.uid);
        const adminSnap = await getDoc(adminRef);

        if (adminSnap.exists()) {
            const adminData = adminSnap.data();
            document.getElementById("welcome-message").textContent =` Welcome, ${adminData.adminName || "Admin"}!`;
        } else {
            console.error("❌ Admin data not found in Firestore.");
        }

        // ✅ تحميل البيانات بعد التأكد من تسجيل الدخول
        loadDashboardData();
        loadHospitals();
        loadDonors();
    } else {
        window.location.href = "login.html";  
    }
});

// ✅ تحميل الإحصائيات في الكروت
async function loadDashboardData() {
    try {
        console.log("🔄 Fetching dashboard data...");

        const hospitalsSnap = await getDocs(collection(db, "users"));
        const hospitalCount = hospitalsSnap.docs.filter(doc => doc.data().role === "hospital").length;
        document.getElementById("hospital-count").textContent = hospitalCount;

        const donorsSnap = await getDocs(collection(db, "users"));
        const donorCount = donorsSnap.docs.filter(doc => doc.data().role === "donor").length;
        document.getElementById("donor-count").textContent = donorCount;

        const requestsSnap = await getDocs(collection(db, "donationRequests"));
        document.getElementById("request-count").textContent = requestsSnap.size;

        const reportsSnap = await getDocs(collection(db, "emergencyReports"));
        document.getElementById("report-count").textContent = reportsSnap.size;

        console.log("✅ Dashboard data updated.");
    } catch (error) {
        console.error("❌ Error fetching dashboard data:", error);
    }
}

// ✅ تحميل بيانات المستشفيات وجدولها (مع إضافة عمود ID)
async function loadHospitals() {
    const hospitalsTable = document.getElementById("hospital-table");
    hospitalsTable.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";

    try {
        const hospitalsQuery = query(collection(db, "users"), where("role", "==", "hospital"));
        const hospitalsSnapshot = await getDocs(hospitalsQuery);

        if (hospitalsSnapshot.empty) {
            hospitalsTable.innerHTML = "<tr><td colspan='5'>No hospitals found.</td></tr>";
            return;
        }

        hospitalsTable.innerHTML = "";

        hospitalsSnapshot.forEach((doc) => {
            const hospital = doc.data();
            const hospitalId = doc.id;
            const hospitalName = hospital.hospitalName || "Unknown";
            const location = hospital.location || "N/A";

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${hospitalId}</td>
                <td>${hospitalName}</td>
                <td>${location}</td>
              
            `;
            hospitalsTable.appendChild(row);
        });

        // // ✅ إصلاح زر "View"
        // document.querySelectorAll(".view-hospital-btn").forEach(button => {
        //     button.addEventListener("click", (event) => {
        //         const hospitalId = event.target.getAttribute("data-id");
        //         window.location.href = `hos-manag.html?hospitalId=${hospitalId}`;
        //     });
        // });

    } catch (error) {
        console.error("❌ Error loading hospitals:", error);
        hospitalsTable.innerHTML = "<tr><td colspan='5'>Failed to load hospitals.</td></tr>";
    }
}

// ✅ تحميل بيانات المتبرعين وجدولهم
async function loadDonors() {
    const donorsTable = document.getElementById("donor-table");
    donorsTable.innerHTML = "<tr><td colspan='5'>Loading...</td></tr>";

    try {
        const donorsQuery = query(collection(db, "users"), where("role", "==", "donor"));
        const donorsSnapshot = await getDocs(donorsQuery);

        if (donorsSnapshot.empty) {
            donorsTable.innerHTML = "<tr><td colspan='5'>No donors found.</td></tr>";
            return;
        }

        donorsTable.innerHTML = "";

        donorsSnapshot.forEach((doc) => {
            const donor = doc.data();
            const donorId = doc.id;
            const donorName = donor.fullName || "Unknown";
            const bloodType = donor.bloodType || "N/A";
            const location = donor.location || "N/A";

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${donorId}</td>
                <td>${donorName}</td>
                <td>${bloodType}</td>
                <td>${location}</td>
                
            `;
            donorsTable.appendChild(row);
        });

        // // ✅ إصلاح زر "View"
        // document.querySelectorAll(".view-donor-btn").forEach(button => {
        //     button.addEventListener("click", (event) => {
        //         const donorId = event.target.getAttribute("data-id");
        //         window.location.href = `donor-manag.html?donorId=${donorId}`;
        //     });
        // });

    } catch (error) {
        console.error("❌ Error loading donors:", error);
        donorsTable.innerHTML = "<tr><td colspan='5'>Failed to load donors.</td></tr>";
    }
}
// ✅ تحميل بيانات بنوك الدم وجدولها
// ✅ تحميل بيانات بنوك الدم وجدولها
async function loadBloodBanks() {
    const bloodBanksTable = document.getElementById("blood-bank-table");
    bloodBanksTable.innerHTML = "<tr><td colspan='6'>Loading...</td></tr>";

    try {
        const bloodBanksSnapshot = await getDocs(collection(db, "bloodBanks"));

        if (bloodBanksSnapshot.empty) {
            bloodBanksTable.innerHTML = "<tr><td colspan='6'>No blood banks found.</td></tr>";
            return;
        }

        bloodBanksTable.innerHTML = "";

        bloodBanksSnapshot.forEach((doc) => {
            const bloodBank = doc.data();
            const name = bloodBank.name || "Unknown";
            const location = bloodBank.location || "N/A";

            // ✅ طباعة القيمة للمراجعة
            console.log(`🔍 isAvailable for ${name}:`, bloodBank.isAvailable);

            // ✅ التحقق من التوفر
            let isAvailable = "Unknown";
            if (bloodBank.hasOwnProperty("isAvailable")) {
                isAvailable = bloodBank.isAvailable === true ? "Available" : "Not Available";
            }

            const responseScore = bloodBank.responseScore !== undefined ? bloodBank.responseScore : "N/A";

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${name}</td>
                <td>${location}</td>
                <td>${isAvailable}</td>
                <td>${responseScore}</td>
                
            `;
            bloodBanksTable.appendChild(row);
        });

    } catch (error) {
        console.error("❌ Error loading blood banks:", error);
        bloodBanksTable.innerHTML = "<tr><td colspan='6'>Failed to load blood banks.</td></tr>";}
}
// ✅ تحميل بيانات المستشفيات والمتبرعين في الفورم عند اختيار "متبرع معين" أو "مستشفى معين"
window.toggleRecipientSelection = async function () {
    const recipientType = document.getElementById("recipient-type").value;
    const recipientSelection = document.getElementById("recipient-selection");

    if (recipientType === "specific-donor" || recipientType === "specific-hospital") {
        recipientSelection.style.display = "block";
        recipientSelection.innerHTML = '<option value="" disabled selected>Loading...</option>';

        let role = recipientType === "specific-donor" ? "donor" : "hospital";
        let snapshot = await getDocs(query(collection(db, "users"), where("role", "==", role)));

        recipientSelection.innerHTML = '<option value="" disabled selected>Select Recipient</option>';
        snapshot.forEach(doc => {
            let userData = doc.data();
            let option = document.createElement("option");
            option.value = doc.id;
            option.textContent = userData.fullName || userData.hospitalName || "Unknown";
            recipientSelection.appendChild(option);
        });
    } else {
        recipientSelection.style.display = "none";
        recipientSelection.innerHTML = "";
    }
};

// ✅ إرسال الإشعارات
document.getElementById("send-notification-btn").addEventListener("click", async function () {
    const recipientType = document.getElementById("recipient-type").value;
    const recipientSelection = document.getElementById("recipient-selection").value;
    const message = document.getElementById("notification-message").value.trim();

    if (!message) {
        alert("❌ Please enter a notification message.");
        return;
    }

    let recipientId;
if (recipientType === "all-donors") {
    recipientId = "all donors";
} else if (recipientType === "all-hospitals") {
    recipientId = "all hospitals";
} else {
    recipientId = recipientSelection;
}

let notificationData = { message, timestamp: new Date(), recipientId };

    try {
        await addDoc(collection(db, "notifications"), notificationData);
        alert("✅ Notification sent successfully!");
        document.getElementById("notification-message").value = "";
    } catch (error) {
        console.error("❌ Error sending notification:", error);
        alert("⚠️ Failed to send notification.");
    }
});

// ✅ تحميل البيانات عند فتح الصفحة
document.addEventListener("DOMContentLoaded", () => {
    loadDashboardData();
    loadHospitals();
    loadDonors();
    loadBloodBanks(); // ✅ تحميل بيانات بنوك الدم
});