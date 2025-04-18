import { getDocs, collection, query, where } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

async function fetchHospitalStats() {
    try {
        // ✅ جلب بيانات المتبرعين المسجلين من كولكشن users
        const usersRef = collection(db, "users");
        const donorsQuery = query(usersRef, where("role", "==", "donor"));
        const donorsSnapshot = await getDocs(donorsQuery);

        const totalDonors = donorsSnapshot.size; // عدد المتبرعين المسجلين
        console.log("📊 Total Donors:", totalDonors);

        // ✅ جلب بيانات الطلبات من كولكشن donationRequests
        const requestsRef = collection(db, "donationRequests");
        const requestsSnapshot = await getDocs(requestsRef);

        // متغيرات لتخزين الإحصائيات
        let acceptedCount = 0, rejectedCount = 0;
        const bloodTypeCount = {};

        requestsSnapshot.forEach(doc => {
            const request = doc.data();
            console.log("📥 Donation Request Data:", request);

            // حساب عدد الطلبات المقبولة والمرفوضة
            if (request.status === "Accepted") acceptedCount++;
            else if (request.status === "Rejected") rejectedCount++;

            // حساب توزيع أنواع التبرعات
            if (request.donationDetails) {
                bloodTypeCount[request.donationDetails] = (bloodTypeCount[request.donationDetails] || 0) + 1;
            }
        });

        // عرض الإحصائيات في Console (للتأكد)
        console.log("✅ Accepted Requests:", acceptedCount);
        console.log("❌ Rejected Requests:", rejectedCount);
        console.log("🩸 Blood Type Counts:", bloodTypeCount);

        // ✅ إنشاء الرسوم البيانية باستخدام Chart.js
        if (totalDonors > 0) {
            new Chart(document.getElementById("donorChart"), {
                type: "bar",
                data: {
                    labels: ["Total Donors"],
                    datasets: [{ label: "Donors Count", data: [totalDonors], backgroundColor: ["#ff6384"] }]
                },
                options: { responsive: true }
            });
        }

        if (acceptedCount > 0 || rejectedCount > 0) {
            new Chart(document.getElementById("statusChart"), {
                type: "doughnut",
                data: {
                    labels: ["Accepted", "Rejected"],
                    datasets: [{ label: "Request Status", data: [acceptedCount, rejectedCount], backgroundColor: ["#4caf50", "#f44336"] }]
                },
                options: { responsive: true }
            });
        }

        const bloodLabels = Object.keys(bloodTypeCount);
        const bloodData = Object.values(bloodTypeCount);

        if (bloodLabels.length > 0) {
            new Chart(document.getElementById("bloodTypeChart"), {
                type: "pie",
                data: {
                    labels: bloodLabels,
                    datasets: [{ label: "Blood Type Requests", data: bloodData, backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0", "#9966ff"] }]
                },
                options: { responsive: true }
            });
        }

    } catch (error) {
        console.error("❌ Error fetching hospital stats:", error);
    }
}

// تأكد من تحميل البيانات بعد تحميل الصفحة
document.addEventListener("DOMContentLoaded", fetchHospitalStats);