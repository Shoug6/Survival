// // استيراد مكتبات Firebase
// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
// import { getFirestore, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
// import { auth, db } from "./firebase-config.js";  // استيراد التهيئة

// // 🔹 دالة تسجيل مستخدم جديد
// async function signUp(email, password, role) {
//     try {
//         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//         const user = userCredential.user;

//         // 🔹 حفظ بيانات المستخدم في Firestore
//         await setDoc(doc(db, "users", user.uid), {
//             email: email,
//             role: role
//         });

//         console.log("تم إنشاء الحساب بنجاح!");
//         return user;
//     } catch (error) {
//         console.error("خطأ في التسجيل:", error.message);
//         return null;
//     }
// }

// // 🔹 دالة تسجيل الدخول والتحقق من الصلاحيات
// async function signIn(email, password) {
//     try {
//         const userCredential = await signInWithEmailAndPassword(auth, email, password);
//         const user = userCredential.user;

//         // 🔹 جلب بيانات المستخدم من Firestore
//         const userDoc = await getDoc(doc(db, "users", user.uid));

//         if (userDoc.exists()) {
//             const userData = userDoc.data();
//             console.log("تسجيل الدخول ناجح:", userData);

//             // 🔹 توجيه المستخدم حسب دوره (Role)
//             if (userData.role === "donor") {
//                 window.location.href = "home.html";
//             } else if (userData.role === "hospital") {
//                 window.location.href = "hospital-home.html";
//             } else if (userData.role === "admin") {
//                 window.location.href = "admin-home.html";
//             } else {
//                 console.error("دور غير معروف!");
//             }
//         } else {
//             console.error("المستخدم غير موجود في قاعدة البيانات!");
//         }
//     } catch (error) {
//         console.error("خطأ في تسجيل الدخول:", error.message);
//     }
// }

// // 🔹 تصدير الدوال
// export { signUp, signIn };