import { db } from "./firebase-config.js";
import { collection, getDocs, addDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// ✅ تحميل بيانات المتبرعين عند فتح الصفحة
async function loadDonors() {
    console.log("🔄 Loading donors..."); 
    const donorTable = document.getElementById("donorTable");
    donorTable.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>";

    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        donorTable.innerHTML = ""; 

        let foundDonors = false; 

        querySnapshot.forEach((docSnap) => {
            const donor = docSnap.data();
            if (donor.role === "donor") {
                foundDonors = true;
                console.log("✅ Found donor:", donor.fullName);
                
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${docSnap.id}</td> 
                    <td>${donor.fullName || "Unknown"}</td> 
                    <td>${donor.email || "No Email"}</td>
                    <td>
                        <button onclick="deleteDonor('${docSnap.id}')">Delete</button>
                    </td>
                `;
                donorTable.appendChild(row);
            }
        });

        if (!foundDonors) {
            donorTable.innerHTML = "<tr><td colspan='4'>No donors found.</td></tr>";
        }
    } catch (error) {
        console.error("❌ Error fetching donors:", error);
        donorTable.innerHTML = "<tr><td colspan='4'>Failed to load donors.</td></tr>";
    }
}

// ✅ حذف متبرع من Firestore
window.deleteDonor = async function (donorId) {
    if (confirm("Are you sure you want to delete this donor?")) {
        try {
            await deleteDoc(doc(db, "users", donorId));
            alert("✅ Donor deleted successfully!");
            loadDonors();
        } catch (error) {
            console.error("❌ Error deleting donor:", error);
            alert("⚠️ Failed to delete donor.");
        }
    }
};

// ✅ إضافة متبرع جديد
document.getElementById("addDonorForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const donorName = document.getElementById("donorName").value.trim();
    const donorEmail = document.getElementById("donorEmail").value.trim();

    if (!donorName || !donorEmail) {
        alert("❌ Please fill in all fields.");
        return;
    }

    try {
        const newDonorRef = await addDoc(collection(db, "users"), {
            fullName: donorName,
            email: donorEmail,
            role: "donor"
        });

        alert(`✅ Donor added successfully! ID: ${newDonorRef.id}`);
        document.getElementById("addDonorForm").reset();
        loadDonors();

    } catch (error) {
        console.error("❌ Error adding donor:", error);
        alert("⚠️ Failed to add donor.");
    }
});

// ✅ تحميل المتبرعين عند فتح الصفحة
document.addEventListener("DOMContentLoaded", loadDonors);