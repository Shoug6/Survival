import { db } from "./firebase-config.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
    await loadReportData();
});

async function loadReportData() {
    try {
        console.log("🔄 Fetching report data...");

        // جلب جميع طلبات التبرع من كوليكشن 'donationRequests'
        const requestsSnapshot = await getDocs(collection(db, "donationRequests"));
        const usersSnapshot = await getDocs(collection(db, "users"));

        let donationTypeStats = {};
        let hospitalStats = {};
        let bloodTypeStats = {};

        // حساب الإحصائيات الخاصة بنوع التبرع والمستشفيات
        requestsSnapshot.forEach((doc) => {
            const request = doc.data();
            
            // حساب عدد الطلبات حسب نوع التبرع
            if (request.donationType) {
                donationTypeStats[request.donationType] = (donationTypeStats[request.donationType] || 0) + 1;
            }
            if (request.hospitalName) {
                if (!hospitalStats[request.hospitalName]) {
                    hospitalStats[request.hospitalName] = { total: 0, accepted: 0, rejected: 0, pending:0 };
                }

                hospitalStats[request.hospitalName].total += 1;

                // حساب حالة الطلبات (مقبول أو مرفوض)
                if (request.status === "Accepted") {
                    hospitalStats[request.hospitalName].accepted += 1;
                } else if (request.status === "Rejected") {
                    hospitalStats[request.hospitalName].rejected += 1;
                } else if (request.status === "Pending") {
                    hospitalStats[request.hospitalName].pending += 1;
                }
            }
        });

        // حساب الإحصائيات الخاصة بفصائل الدم من بيانات المتبرعين
        usersSnapshot.forEach((doc) => {
            const user = doc.data();
            if (user.bloodType) {
                bloodTypeStats[user.bloodType] = (bloodTypeStats[user.bloodType] || 0) + 1;
            }
        });

        // تحديث النصوص في الإحصائيات
        document.getElementById("most-requested-donation").textContent = getMaxKey(donationTypeStats);
        document.getElementById("most-active-hospital").textContent = getMaxKey(hospitalStats);
        document.getElementById("most-common-blood").textContent = getMaxKey(bloodTypeStats);

        // تحديث البيانات في جدول المستشفيات
        const hospitalTableBody = document.getElementById('hospital-table');
        Object.keys(hospitalStats).forEach(hospital => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${hospital}</td>
                <td>${hospitalStats[hospital].total}</td>
                <td>${hospitalStats[hospital].accepted}</td>
                <td>${hospitalStats[hospital].rejected}</td>
                <td>${hospitalStats[hospital].pending}</td>
            `;
            hospitalTableBody.appendChild(row);
        });

        // رسم الإحصائيات باستخدام Chart.js
        const donationTypeData = Object.values(donationTypeStats);
        const donationTypeLabels = Object.keys(donationTypeStats);

        const donationTypeChart = new Chart(document.getElementById('donationTypeChart'), {
            type: 'bar',
            data: {
                labels: donationTypeLabels,
                datasets: [{
                    label: 'Donation Type Requests',
                    data: donationTypeData,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        const hospitalData = Object.values(hospitalStats).map(stats => stats.total);
        const hospitalLabels = Object.keys(hospitalStats);

        const hospitalChart = new Chart(document.getElementById('hospitalChart'), {
            type: 'pie',
            data: {
                labels: hospitalLabels,
                datasets: [{
                    label: 'Requests by Hospital',
                    data: hospitalData,
                    backgroundColor: ['#ffb6c1', '#ff8c8c', '#ff4d4d', '#ff1f1f', '#e60000'],
                    borderColor: 'rgba(255, 255, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true
            }
        });

        const bloodTypeData = Object.values(bloodTypeStats);
        const bloodTypeLabels = Object.keys(bloodTypeStats);

        const bloodTypeChart = new Chart(document.getElementById('bloodTypeChart'), {
            type: 'doughnut',
            data: {
                labels: bloodTypeLabels,
                datasets: [{
                    label: 'Blood Types',
                    data: bloodTypeData,
                    backgroundColor: ['#c1ffb6', '#b6f5c1', '#f4f2c1', '#c1c1f5', '#f5b6c1'],
                    borderColor: 'rgba(255, 255, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true
            }
        });

        console.log("✅ Report data loaded successfully.");
    } catch (error) {
        console.error("❌ Error loading report data:", error);
    }
}

// دالة للحصول على المفتاح الذي له أكبر قيمة في الكائن
function getMaxKey(obj) {
    return Object.keys(obj).reduce((a, b) => obj[a] > obj[b] ? a : b);
}

// تحميل مكتبة jsPDF و html2canvas إن لم تكن موجودة
if (!window.jsPDF) {
    let script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = () => {
        console.log("✅ jsPDF Loaded Successfully");
    };
    document.head.appendChild(script);
}

if (!window.html2canvas) {
    let script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    script.onload = () => {
        console.log("✅ html2canvas Loaded Successfully");
    };
    document.head.appendChild(script);
}

// ✅ زر تحميل التقرير كـ PDF مع تنسيق البيانات
document.getElementById("downloadReport").addEventListener("click", async () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");
    
    doc.setFontSize(18);
    doc.text("Comprehensive Report", 10, 10);
    doc.setFontSize(12);
    doc.text("Generated Report for Blood and Organ Donations", 10, 20);
    
    // بيانات التقرير النصية
    doc.setFontSize(12);
    doc.text(`🔹 Most Requested Donation Type: ${document.getElementById("most-requested-donation").textContent}`, 10, 30);
    doc.text(`🏥 Most Active Hospital: ${document.getElementById("most-active-hospital").textContent}`, 10, 40);
    doc.text(`🩸 Most Common Blood Type: ${document.getElementById("most-common-blood").textContent}`, 10, 50);

    // تحويل الرسوم البيانية إلى صور وإضافتها إلى PDF
    const charts = ["donationTypeChart", "hospitalChart", "bloodTypeChart"];
    let yOffset = 60; // المسافة الرأسية لكل صورة

    for (let i = 0; i < charts.length; i++) {
        const chartCanvas = document.getElementById(charts[i]);
        if (chartCanvas) {
            await html2canvas(chartCanvas).then(canvas => {
                const imgData = canvas.toDataURL("image/png");

                // تقليل حجم الصورة ليكون مناسبًا للصفحة
                const width = 90; // عرض الصورة بالـ mm
                const height = (canvas.height / canvas.width) * width; // حساب الارتفاع بناءً على العرض

                // إضافة الصورة إلى التقرير
                doc.addImage(imgData, "PNG", 3, yOffset, width, height);

                // تحديث المسافة الرأسية لكل صورة
                yOffset += height + 3; // إضافة 10px بين الصور
            });
        }
    }

    doc.save("Comprehensive_Report.pdf");
});