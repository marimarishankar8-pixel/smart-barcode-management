
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
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

const deviceSelect = document.getElementById("deviceSelect");
const deviceStatus = document.getElementById("deviceStatus");
const modeMessage = document.getElementById("modeMessage");

let selectedDevice = null;
let currentUser = null;
let isSaving = false;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("index.html");
    return;
  }

  try {
    const roleDoc = await getDoc(
      doc(db, "userRoles", user.uid)
    );

    if (!roleDoc.exists()) {
      window.location.replace("index.html");
      return;
    }

    const role = String(roleDoc.data().role)
      .trim()
      .toLowerCase();

    if (role !== "admin" && role !== "staff") {
      window.location.replace("index.html");
      return;
    }

    currentUser = user;
    await loadDevices();

  } catch (error) {
    deviceStatus.textContent =
      "Error: " + error.message;
  }
});

async function loadDevices() {
  deviceSelect.innerHTML =
    '<option value="">Loading devices...</option>';

  try {
    const snapshot = await getDocs(
      collection(db, "devices")
    );

    deviceSelect.innerHTML =
      '<option value="">Select a device</option>';

    if (snapshot.empty) {
      deviceSelect.innerHTML =
        '<option value="">No devices available</option>';
      return;
    }

    snapshot.forEach((item) => {
      const device = item.data();
      const option = document.createElement("option");

      option.value = device.deviceId;
      option.textContent =
        device.deviceName + " (" + device.deviceId + ")";

      deviceSelect.appendChild(option);
    });

    deviceStatus.textContent =
      snapshot.size + " device(s) available.";

  } catch (error) {
    deviceStatus.textContent =
      "Unable to load devices: " + error.message;
  }
}

deviceSelect.addEventListener("change", () => {
  selectedDevice = deviceSelect.value;

  if (!selectedDevice) {
    deviceStatus.textContent =
      "Please select a device.";
    return;
  }

  const selectedOption =
    deviceSelect.options[deviceSelect.selectedIndex];

  deviceStatus.textContent =
    "Selected: " + selectedOption.textContent;

  modeMessage.textContent = "";
});

document.getElementById("studentModeBtn")
  .addEventListener("click", () => selectMode("STUDENT"));

document.getElementById("busModeBtn")
  .addEventListener("click", () => selectMode("BUS"));

document.getElementById("labModeBtn")
  .addEventListener("click", () => selectMode("LAB"));

async function selectMode(mode) {
  if (!selectedDevice) {
    modeMessage.textContent =
      "Please select a scanner device first.";
    return;
  }

  if (!currentUser || isSaving) {
    return;
  }

  isSaving = true;
  modeMessage.textContent = "Saving mode...";

  try {
    await setDoc(
      doc(db, "deviceCommands", selectedDevice),
      {
        deviceId: selectedDevice,
        selectedMode: mode,
        status: "ACTIVE",
        updatedBy: currentUser.uid,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    modeMessage.textContent =
      mode + " MODE saved successfully for " +
      selectedDevice + "!";

  } catch (error) {
    modeMessage.textContent =
      "Failed to save mode: " + error.message;
  } finally {
    isSaving = false;
  }
}

document.getElementById("backBtn")
  .addEventListener("click", () => {
    window.location.href = "dashboard.html";
  });
