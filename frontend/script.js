const pdfInput = document.getElementById("pdfInput");
const allButtons = document.querySelectorAll(".buttons button");
const notes = document.getElementById("notes");
const output = document.getElementById("output");
async function askAI(prompt){
    output.innerHTML=`
<div class="loader"></div>
<p style="text-align:center">
MindMint AI is analyzing your notes...
</p>
`;
allButtons.forEach(btn => btn.disabled = true);
    try{
        const response = await fetch("http://localhost:5000/generate",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                prompt
            })
        });
        const data = await response.json();
        output.innerHTML=`
<h2>✨ AI Response</h2>
<hr><br>

${data.result}`;
    }
    catch(error){
        allButtons.forEach(btn => btn.disabled = false);
        output.innerHTML=`
<h2>❌ Error</h2>
<p>Unable to connect to MindMint AI.</p>
<p>Please check your internet or backend server.</p>
`;
        console.log(error);
    }
}
function getNotes(){
    if(notes.value.trim()===""){
        alert("Please paste your notes first.");
        return null;
    }
    return notes.value;
}
document.getElementById("summaryBtn").onclick = () => {

    if(notes.value.trim()==""){
        alert("Upload a PDF first.");
        return;
    }
    askAI(`
You are an expert teacher.
Answer ONLY from the study material below.
If something is not present in the notes,
say "Not available in uploaded PDF."
Study Material:
${notes.value}
Give
1. Short Summary
2. Key Points
3. Important Terms
4. Revision Notes
`);
};
document.getElementById("simplifyBtn").onclick=()=>{
    const text=getNotes();
    if(!text) return;
    askAI(`
Explain these notes in very simple English.
Include:
Simple Explanation
Real Life Example
Easy Revision Tip
${text}
`);
};
document.getElementById("quizBtn").onclick=()=>{
    const text=getNotes();
    if(!text) return;
    askAI(`
Generate 10 MCQs.
Each question should have
A
B
C
D
Correct Answer
Explanation
Notes:
${text}
`);
};
document.getElementById("flashcardBtn").onclick=()=>{
    const text=getNotes();
    if(!text) return;
    askAI(`
Create 10 flashcards.
Format
Question
Answer
Notes:
${text}
`);
};
document.getElementById("examBtn").onclick=()=>{
    const text=getNotes();
    if(!text) return;
    askAI(`
You are an expert exam mentor.
From these notes generate:
📄 One Page Revision Sheet
⭐ Top 10 Important Points
🔥 5 Most Expected Exam Questions
🧠 Memory Tricks
⚠ Common Mistakes
💡 Last Minute Tips
Notes:
${text}
`);
};
// Copy Button
document.getElementById("copyBtn").onclick = () => {
    navigator.clipboard.writeText(output.innerText);
    alert("Copied!");
};

// Download Button
document.getElementById("downloadBtn").onclick = () => {
    const blob = new Blob([output.innerText], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "MindMintAI_Notes.txt";
    a.click();
};
// Dark Mode
document.getElementById("themeBtn").onclick = () => {
    document.body.classList.toggle("dark");
};
document.getElementById("plannerBtn").onclick=()=>{
const text=getNotes();
if(!text) return;
askAI(`
Create a 7-day study plan for
${text}
Include
Daily Goals
Revision
Practice Questions
`);
};
pdfInput.addEventListener("change", async () => {

    const file = pdfInput.files[0];

    if (!file) return;

    const formData = new FormData();

    formData.append("pdf", file);

    output.innerHTML = "📄 Uploading PDF...";

    try {

        const response = await fetch("http://localhost:5000/upload/pdf", {
            method: "POST",
            body: formData
        });
        const data = await response.json();
        notes.value = data.text;
        console.log("PDF Length:", data.text.length);
        console.log(data.text.substring(0,500));
        output.innerHTML ="✅ PDF uploaded successfully.<br>Now choose Summary, Quiz or Simplify.";
    }
    catch(err){
        console.log(err);
        output.innerHTML="❌ PDF Upload Failed.";
    }
});
notes.addEventListener("keydown", (e)=>{

    if(e.ctrlKey && e.key==="Enter"){

        document.getElementById("summaryBtn").click();

    }

});