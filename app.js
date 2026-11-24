
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
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

const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

if (!loginForm || !message) {
  alert("Login form or message element not found!");
} else {
  message.textContent = "JavaScript Loaded Successfully";

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    message.textContent = "Logging in...";

    try {
      const result = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const userRef = doc(db, "userRoles", result.user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await signOut(auth);
        message.textContent = "User role not found.";
        return;
      }

      const role = userDoc.data().role;

      if (role === "admin" || role === "staff") {
        message.textContent = "Login successful!";

        window.location.replace("dashboard.html");
      } else {
        await signOut(auth);
        message.textContent = "Invalid user role.";
      }

    } catch (error) {
      message.textContent = "Login failed: " + error.code;
      console.error("Login error:", error);
    }
  });
}
