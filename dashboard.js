
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
    window.location.href = "index.html";
    return;
  }

  try {
    const roleDoc = await getDoc(doc(db, "userRoles", user.uid));

    if (!roleDoc.exists()) {
      await signOut(auth);
      window.location.href = "index.html";
      return;
    }

    const role = roleDoc.data().role;

    if (role !== "admin" && role !== "staff") {
      await signOut(auth);
      window.location.href = "index.html";
      return;
    }

    document.querySelector(".dashboard > p").textContent =
      role.toUpperCase() + " DASHBOARD";

    message.textContent = "Welcome! Login verified.";

  } catch (error) {
    message.textContent = "Error: " + error.message;
  }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

const buttons = [
  "deviceBtn",
  "modeBtn",
  "scannerBtn",
  "historyBtn"
];

buttons.forEach((id) => {
  document.getElementById(id).addEventListener("click", () => {
    message.textContent = "This feature will be configured in the next steps.";
  });
});
