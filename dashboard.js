
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAub-Z5BtQAQ-7XwLv2eKk0dL67t3AAH9g",
  authDomain: "smart-barcode-management.firebaseapp.com",
  databaseURL: "https://smart-barcode-management-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-barcode-management",
  storageBucket: "smart-barcode-management.firebasestorage.app",
  messagingSenderId: "531495832081",
  appId: "1:531495832081:web:d46057ff232397f3cfbfb0",
  measurementId: "G-PQTPZ1ZCWB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const message = document.getElementById("dashboardMessage");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("index.html");
    return;
  }

  try {
    const roleDoc = await getDoc(doc(db, "userRoles", user.uid));

    if (!roleDoc.exists()) {
      await signOut(auth);
      window.location.replace("index.html");
      return;
    }

    const role = roleDoc.data().role;

    if (role !== "admin" && role !== "staff") {
      await signOut(auth);
      window.location.replace("index.html");
      return;
    }

    document.querySelector(".role-info p").textContent =
      role.toUpperCase() + " DASHBOARD";

    message.textContent = "Welcome! Login verified.";

  } catch (error) {
    message.textContent = "Error: " + error.message;
  }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.replace("index.html");
});

document.getElementById("deviceBtn").addEventListener("click", () => {
  window.location.href = "devices.html";
});

document.getElementById("modeBtn").addEventListener("click", () => {
  window.location.href = "mode.html";
});

document.getElementById("scannerBtn").addEventListener("click", () => {
  message.textContent = "Scanner Control feature coming soon.";
});

document.getElementById("historyBtn").addEventListener("click", () => {
  message.textContent = "Scan History feature coming soon.";
});
