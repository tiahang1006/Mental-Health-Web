// Firebase configuration setup
const firebaseConfig = {
  apiKey: "AIzaSyAxMmB7qVPDpthy2eYd_9S4x7yniNetoh0",
  authDomain: "mentalhealthwebthang.firebaseapp.com",
  projectId: "mentalhealthwebthang",
  storageBucket: "mentalhealthwebthang.firebasestorage.app",
  messagingSenderId: "92232452381",
  appId: "1:92232452381:web:bac7a1a0b11d2b9e88b9f4"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Handle tab switching between screens
function showScreen(screen) {
  document.getElementById("screen-helper").classList.remove("active");
  document.getElementById("screen-search").classList.remove("active");
  document.getElementById("tab-helper").classList.remove("active");
  document.getElementById("tab-search").classList.remove("active");

  if (screen === "helper") {
    document.getElementById("screen-helper").classList.add("active");
    document.getElementById("tab-helper").classList.add("active");
  } else {
    document.getElementById("screen-search").classList.add("active");
    document.getElementById("tab-search").classList.add("active");
  }
}

// Search function to semanticSearch function and renders results
async function search() {
  const query = document.getElementById("searchInput").value.trim();
  const resultsDiv = document.getElementById("results");
  const resultsBox = document.getElementById("searchResultsBox");
  const searchLoading = document.getElementById("searchLoading");

  resultsDiv.innerHTML = "";
  resultsBox.style.display = "none";
  searchLoading.style.display = "none";
  searchLoading.innerText = "";

  if (!query) return;

  searchLoading.innerText = "Searching for similar cases...";
  searchLoading.style.display = "block";

  try {
    const res = await fetch("https://us-central1-mentalhealthwebthang.cloudfunctions.net/semanticSearch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query })
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Server error: ${res.status} - ${text}`);
    }

    const data = await res.json();
    searchLoading.style.display = "none";
    resultsBox.style.display = "block";
    resultsDiv.innerHTML = "";

    if (data.results && data.results.length > 0) {
      data.results.forEach(item => {
        resultsDiv.innerHTML += `
          <p><strong>👤 Patient:</strong> ${item.context}<br>
          <strong>💬 Counselor:</strong> ${item.response}</p><hr>`;
      });
    } else {
      resultsDiv.innerHTML = "<p>No similar results found.</p>";
    }
  } catch (err) {
    console.error("Search failed:", err);
    searchLoading.style.display = "none";
    resultsBox.style.display = "block";
    resultsDiv.innerHTML = `<p style="color: red;">Something went wrong. Please try again later.</p>`;
  }
}

// Advice Submission Logic
document.addEventListener("DOMContentLoaded", () => {
const form = document.getElementById("form");
const input = document.getElementById("input");
const result = document.getElementById("result");
const loading = document.getElementById("loading");
const responseBox = document.getElementById("responseBox");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const userInput = input.value.trim();

  if (!userInput) {
    result.innerText = "Please enter some text and then click.";
    responseBox.style.display = "block";
    return;
  }

  loading.innerText = "Step 1: Analyzing patient description...";
  loading.style.display = "block";
  responseBox.style.display = "none";
  result.innerText = "";

  try {
    const mlRes = await fetch("https://mental-health-ml-model-api.onrender.com/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input.value }),
    });

    const mlData = await mlRes.json();
    const predictedCategory = mlData.prediction;
    loading.innerText = "Step 2: Generating tailored guidance...";

    const gptRes = await fetch("https://us-central1-mentalhealthwebthang.cloudfunctions.net/getAdvice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `You are assisting a psychologist in responding to a patient.
        The psychologist has provided the following context about their patient:
        "${userInput}"
        The suggested dialog tone category is: ${predictedCategory}.
        Your response must follow this format:
        1. Predicted Dialog Tone Category: ${predictedCategory}
        2. Recommended Guidance:
        [Provide detailed advice on how the psychologist should respond to the patient using this tone.]
        3. Include reasoning (with bullet points if helpful) which is relevant to chain of thoughts if helpful.`
      })
    });

    const gptData = await gptRes.json();
    loading.style.display = "none";
    responseBox.style.display = "block";
    result.innerText = gptData.response || gptData.error || "No valid advice returned.";
  } catch (err) {
    console.error(err);
    loading.style.display = "none";
    responseBox.style.display = "block";
    result.innerText = "Request failed. Please check if the backend is running.";
  }
});

  // Clipboard Copy for Advice
  const copyBtn = document.getElementById("copyBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const text = document.getElementById("result").innerText;
      navigator.clipboard.writeText(text).then(() => {
        alert("Advice copied!");
      });
    });
  }

  // Search Copy
  const copySearchBtn = document.getElementById("copySearchBtn");
  if (copySearchBtn) {
    copySearchBtn.addEventListener("click", () => {
      const text = document.getElementById("results").innerText;
      navigator.clipboard.writeText(text).then(() => {
        alert("Search results copied!");
      });
    });
  }

  lucide.createIcons();
});