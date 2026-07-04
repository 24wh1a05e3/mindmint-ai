const notes = document.getElementById("notes");
const output = document.getElementById("output");
async function askAI(prompt){
    output.innerHTML=`

<div class="loader"></div>

<p style="text-align:center">

MindMint AI is analyzing your notes...

</p>

`;
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
        output.innerHTML="❌ Unable to connect.";
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
document.getElementById("summaryBtn").onclick=()=>{
    const text=getNotes();
    if(!text) return;
    askAI(`
Summarize these notes.
Give:
1. Short Summary
2. Key Points
3. Important Terms
4. Final Revision Notes
${text}
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