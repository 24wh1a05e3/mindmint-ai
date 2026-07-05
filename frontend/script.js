const API_BASE = window.location.origin;
const pdfInput = document.getElementById("pdfInput");
console.log(pdfInput);
const notes = document.getElementById("notes");
const output = document.getElementById("output");
const allButtons = document.querySelectorAll(".buttons button");
async function askAI(prompt) {
    output.innerHTML = `
        <div class="loader"></div>
        <p style="text-align:center">
            MindMint AI is analyzing your notes...
        </p>
    `;
    allButtons.forEach(btn => btn.disabled = true);
    try {
        const response = await fetch(`${API_BASE}/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt: prompt
            })
        });
        if (!response.ok) {
            throw new Error("Server Error");
        }
        const data = await response.json();
        output.innerHTML = `
            <h2>✨ AI Response</h2>
            <hr><br>
            ${data.result} `;
        output.scrollIntoView({
            behavior: "smooth"
        });
    } catch (error) {
        output.innerHTML = `
            <h2>❌ Error</h2>
            <p>Unable to connect to MindMint AI.</p>
            <p>Please make sure your backend server is running.</p>
        `;
        console.log(error);
    } finally {
        allButtons.forEach(btn => btn.disabled = false);
    }
}
function getNotes() {
    if (notes.value.trim() === "") {
        alert("Please upload a PDF or paste your notes.");
        return null;
    }
    return notes.value;
}
pdfInput.addEventListener("change", async () => {
    alert("PDF Selected");

    const file = pdfInput.files[0];
    console.log(file);

    const formData = new FormData();
    formData.append("pdf", file);

    try {
        const response = await fetch(`${API_BASE}/upload/pdf`, {
            method: "POST",
            body: formData
        });

        console.log("Status:", response.status);

        const data = await response.json();
        console.log(data);

        notes.value = data.text;
        output.innerHTML = "✅ PDF uploaded successfully";
    } catch (err) {
        console.error(err);
    }
});
document.getElementById("summaryBtn").onclick = () => {
    const text = getNotes();
    if (!text) return;
    askAI(`
You are an expert teacher.
Read ONLY the notes below.
If information is missing, reply:
"Not available in uploaded PDF."
Study Material:
${text}
Return:
# Summary
# Key Points
# Important Terms
# Revision Notes
Use bullet points wherever possible.
`);
};
document.getElementById("simplifyBtn").onclick = () => {
    const text = getNotes();
    if (!text) return;
    askAI(`
Explain ONLY the following study material.
Study Material:
${text}
Include:
1. Easy Explanation
2. Real Life Example
3. Simple Revision Tip
Do not add anything not present in the notes.
`);
};
document.getElementById("quizBtn").onclick = () => {
    const text = getNotes();
    if (!text) return;
    askAI(`
You are an expert teacher.
Using ONLY the study material below, generate 10 multiple-choice questions.
Study Material:
${text}
Format:
Question 1
A)
B)
C)
D)
Correct Answer:
Explanation:
Repeat for all 10 questions.
Do NOT use markdown tables.
`);
};
document.getElementById("flashcardBtn").onclick = () => {
    const text = getNotes();
    if (!text) return;
    askAI(`
Create 10 revision flashcards ONLY from these notes.
Study Material:
${text}
Format:
Flashcard 1
Front:
Back:
Flashcard 2
Front:
Back:
Continue until Flashcard 10.
`);
};
document.getElementById("examBtn").onclick = () => {
    const text = getNotes();
    if (!text) return;
    askAI(`
You are an experienced exam mentor.
Using ONLY these notes, prepare an Exam Booster.
Study Material:
${text}
Include:
📄 One Page Revision Sheet
⭐ Top 10 Important Points
🔥 5 Most Expected Exam Questions
🧠 Memory Tricks
⚠ Common Mistakes
💡 Last Minute Tips
Do not include information outside the uploaded notes.
`);
};
document.getElementById("plannerBtn").onclick = () => {
    const text = getNotes();
    if (!text) return;
    askAI(`
Create a detailed 7-day study plan using ONLY these notes.
Study Material:
${text}
For each day include:
Morning
Afternoon
Evening
Revision
Practice Questions
Expected Study Time
Keep the schedule realistic for a student preparing for exams.
`);
};
document.getElementById("copyBtn").onclick = async () => {
    try {
        await navigator.clipboard.writeText(output.innerText);
        alert("✅ AI response copied successfully!");
    } catch (err) {
        alert("❌ Unable to copy.");
        console.log(err);
    }
};
document.getElementById("downloadBtn").onclick = () => {
    if (output.innerText.trim() === "" ||
        output.innerText.includes("AI response will appear here")) {
        alert("Nothing to download.");
        return;
    }
    const blob = new Blob(
        [output.innerText],
        { type: "text/plain" }
    );
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "MindMintAI_Output.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
};
document.getElementById("themeBtn").onclick = () => {
    document.body.classList.toggle("dark");
    const btn = document.getElementById("themeBtn");
    if (document.body.classList.contains("dark")) {
        btn.innerHTML = "☀️ Light Mode";
    } else {
        btn.innerHTML = "🌙 Dark Mode";
    }
};
window.addEventListener("load", () => {
    output.innerHTML = `
        <h2>👋 Welcome to MindMint AI</h2>
        <p>
        Upload a PDF or paste your notes to get started.
        </p>
        <hr><br>
        <b>Available Features:</b>
        <ul style="margin-top:10px; line-height:2;">
            <li>📄 AI Summary</li>
            <li>🧠 Simplify Concepts</li>
            <li>❓ Quiz Generator</li>
            <li>🗂 Flashcards</li>
            <li>🚀 Exam Booster</li>
            <li>📅 Study Planner</li>
        </ul>
        <br>
        <p>
        💡 Tip: Press <b>Ctrl + Enter</b> to instantly generate a summary.
        </p>`;
});