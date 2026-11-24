
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  serverTimestamp
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

const deviceIdInput = document.getElementById("deviceId");
const deviceNameInput = document.getElementById("deviceName");
const deviceLocationInput = document.getElementById("deviceLocation");
const addDeviceBtn = document.getElementById("addDeviceBtn");
const deviceMessage = document.getElementById("deviceMessage");
const deviceList = document.getElementById("deviceList");

let currentUser = null;
let isAdmin = false;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("index.html");
    return;
  }

  currentUser = user;

  try {
    const roleDoc = await getDoc(doc(db, "userRoles", user.uid));

    if (!roleDoc.exists()) {
      window.location.replace("index.html");
      return;
    }

    const role = roleDoc.data().role;

    if (role !== "admin" && role !== "staff") {
      window.location.replace("index.html");
      return;
    }

    isAdmin = role === "admin";
    await loadDevices();

  } catch (error) {
    deviceMessage.textContent = "Error: " + error.message;
  }
});

addDeviceBtn.addEventListener("click", async () => {
  if (!currentUser) return;

  const deviceId = deviceIdInput.value.trim();
  const deviceName = deviceNameInput.value.trim();
  const location = deviceLocationInput.value;

  if (!deviceId || !deviceName || !location) {
    deviceMessage.textContent = "Please fill all fields.";
    return;
  }

  addDeviceBtn.disabled = true;
  deviceMessage.textContent = "Saving device...";

  try {
    const existing = await getDocs(collection(db, "devices"));

    const duplicate = existing.docs.some(
      (item) => item.data().deviceId === deviceId
    );

    if (duplicate) {
      deviceMessage.textContent = "This Device ID already exists.";
      return;
    }

    await addDoc(collection(db, "devices"), {
      deviceId,
      deviceName,
      location,
      status: "Offline",
      createdBy: currentUser.uid,
      createdAt: serverTimestamp()
    });

    deviceMessage.textContent = "Device registered successfully!";

    deviceIdInput.value = "";
    deviceNameInput.value = "";
    deviceLocationInput.value = "";

    await loadDevices();

  } catch (error) {
    deviceMessage.textContent = "Error: " + error.message;
  } finally {
    addDeviceBtn.disabled = false;
  }
});

async function loadDevices() {
  deviceList.innerHTML = "<p>Loading devices...</p>";

  try {
    const snapshot = await getDocs(collection(db, "devices"));

    deviceList.innerHTML = "";

    if (snapshot.empty) {
      deviceList.innerHTML = "<p>No devices registered yet.</p>";
      return;
    }

    snapshot.forEach((item) => {
      const device = item.data();

      const card = document.createElement("div");
      card.className = "menu-card";

      const heading = document.createElement("h3");
      heading.textContent = device.deviceName;

      const id = document.createElement("p");
      id.textContent = "Device ID: " + device.deviceId;

      const location = document.createElement("p");
      location.textContent = "Location: " + device.location;

      const status = document.createElement("p");
      status.textContent = "Status: " + device.status;

      card.append(heading, id, location, status);

      if (isAdmin) {
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete Device";
        deleteButton.style.background = "#dc2626";

        deleteButton.addEventListener("click", async () => {
          const confirmed = confirm(
            "Are you sure you want to delete " + device.deviceId + "?"
          );

          if (!confirmed) return;

          try {
            deleteButton.disabled = true;
            await deleteDoc(doc(db, "devices", item.id));
            deviceMessage.textContent = "Device deleted successfully!";
            await loadDevices();
          } catch (error) {
            deviceMessage.textContent = "Delete failed: " + error.message;
            deleteButton.disabled = false;
          }
        });

        card.appendChild(deleteButton);
      }

      deviceList.appendChild(card);
    });

  } catch (error) {
    deviceList.textContent = "Unable to load devices: " + error.message;
  }
}

document.getElementById("backBtn").addEventListener("click", () => {
  window.location.href = "dashboard.html";
});
