
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Replace these values with your Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  message.textContent = "Logging in...";

  try {
    const result = await signInWithEmailAndPassword(
      auth, email, password
    );

    const userDoc = await getDoc(
      doc(db, "userRoles", result.user.uid)
    );

    if (!userDoc.exists()) {
      await auth.signOut();
      message.textContent = "User role not assigned.";
      return;
    }

    const role = userDoc.data().role;

    if (role === "admin" || role === "staff") {
      message.textContent = "Login successful! Role: " + role;
    } else {
      await auth.signOut();
      message.textContent = "Invalid user role.";
    }

  } catch (error) {
    message.textContent = "Login failed: " + error.message;
  }
});
