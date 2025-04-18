import { db } from "./firebase-config.js";
import { collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

let allRequests = []; // سيتم تخزين جميع الطلبات هنا لتحسين الأداء

// ✅ تحميل طلبات التبرع من Firebase
async function loadRequests() {
    const table = document.getElementById("requests-table");
    table.innerHTML = "<tr><td colspan='7'>Loading...</td></tr>";

    try {
        const querySnapshot = await getDocs(collection(db, "donationRequests"));
        allRequests = [];

        querySnapshot.forEach(docSnap => {
            let request = docSnap.data();
            request.id = docSnap.id; // حفظ ID الطلب
            allRequests.push(request);
        });

        displayRequests(allRequests);
    } catch (error) {
        console.error("❌ Error loading donation requests:", error);
        table.innerHTML = "<tr><td colspan='7'>Failed to load requests.</td></tr>";
    }
}

// ✅ عرض الطلبات في الجدول
function displayRequests(requests) {
    const table = document.getElementById("requests-table");
    table.innerHTML = "";

    if (requests.length === 0) {
        table.innerHTML = "<tr><td colspan='7'>No donation requests found.</td></tr>";
        return;
    }

    requests.forEach(request => {
        let cancelBtn = document.createElement('button');
        cancelBtn.className = request.status === "Pending" ? "btn btn-cancel" : "btn btn-disabled";
        cancelBtn.textContent = "Cancel";
        cancelBtn.disabled = request.status !== "Pending"; // تعطيل الزر إذا لم تكن الحالة "Pending"

        if (request.status === "Pending") {
            cancelBtn.onclick = () => cancelRequest(request.id);
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${request.donorName || "Unknown"}</td>
            <td>${request.donorId || "N/A"}</td>
            <td>${request.hospitalName || "Unknown"}</td>
            <td>${request.donationType || "N/A"}</td>
            <td>${request.donationDate || "N/A"}</td>
            <td>${request.status}</td>
        `;
        const actionCell = document.createElement('td');
        actionCell.appendChild(cancelBtn);
        row.appendChild(actionCell);
        table.appendChild(row);
    });
}

// ✅ إلغاء طلب التبرع
async function cancelRequest(requestId) {
    if (!confirm("Are you sure you want to cancel this request?")) return;

    try {
        const requestRef = doc(db, "donationRequests", requestId);
        await updateDoc(requestRef, { status: "canceled" });

        alert("✅ Request canceled successfully.");
        loadRequests(); // إعادة تحميل البيانات بعد التحديث
    } catch (error) {
        console.error("❌ Error canceling request:", error);
        alert("⚠️ Failed to cancel request.");
    }
}

// ✅ فلترة الطلبات
function filterRequests() {
    const selectedStatus = document.getElementById("status-filter").value;

    // تطابق الحالة بين القيم المخزنة والمحددة
    const statusMap = {
        "pending": "Pending",
        "approved": "Accepted",  // هنا تأكدنا أن "approved" يقابل "Accepted" من قاعدة البيانات
        "rejected": "Rejected",
        "canceled": "canceled"
    };

    if (selectedStatus === "all") {
        displayRequests(allRequests);
    } else {
        const mappedStatus = statusMap[selectedStatus]; // جلب القيمة الصحيحة من الخريطة
        const filteredRequests = allRequests.filter(req => req.status === mappedStatus);
        displayRequests(filteredRequests);
    }
}

// ✅ تحميل البيانات عند فتح الصفحة
document.addEventListener("DOMContentLoaded", loadRequests);
document.getElementById("status-filter").addEventListener("change", filterRequests);