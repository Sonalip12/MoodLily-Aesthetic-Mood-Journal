const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  window.location.href = "login.html";
}

const journalForm = document.getElementById("journalForm");
const journalList = document.getElementById("journalList");

const loadJournals = async () => {
  const response = await fetch(
    `http://localhost:5000/api/journals?user_id=${user.id}`
  );

  const data = await response.json();
  const journals = data.journals || [];

  journalList.innerHTML = journals.length
    ? journals
        .map(
          (journal) => `
            <article class="journal-item">
              <h3>${journal.title}</h3>
              <p class="muted">${journal.mood || "Neutral"} • ${new Date(journal.created_at).toLocaleString()}</p>
              <p>${journal.content}</p>
            </article>
          `
        )
        .join("")
    : '<p class="muted">No journal entries yet. Write your first one below.</p>';
};

if (journalForm) {
  journalForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = document.getElementById("journalTitle").value.trim();
    const content = document.getElementById("journalContent").value.trim();
    const mood = document.getElementById("journalMood").value;

    const response = await fetch(
      "http://localhost:5000/api/journals/add",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          title,
          content,
          mood,
        }),
      }
    );

    const data = await response.json();
    alert(data.message || data.error);

    if (response.ok) {
      journalForm.reset();
      await loadJournals();
    }
  });
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("user");
  window.location.href = "login.html";
});

loadJournals();