const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  window.location.href = "login.html";
}

const moodStats = document.getElementById("moodStats");
const journalStats = document.getElementById("journalStats");

const loadAnalytics = async () => {
  const [moodResponse, journalResponse] = await Promise.all([
    fetch(`http://localhost:5000/api/moods/summary?user_id=${user.id}`),
    fetch(`http://localhost:5000/api/journals?user_id=${user.id}`),
  ]);

  const moodData = await moodResponse.json();
  const journalData = await journalResponse.json();

  const moods = moodData.summary || [];
  const journals = journalData.journals || [];

  moodStats.innerHTML = moods.length
    ? moods
        .map(
          (item) => `
            <div class="stat-card">
              <h3>${item.mood}</h3>
              <p class="muted">${item.count} logs</p>
            </div>
          `
        )
        .join("")
    : '<div class="stat-card"><h3>No mood logs yet</h3><p class="muted">Start tracking moods from the dashboard.</p></div>';

  journalStats.innerHTML = `
    <div class="stat-card">
      <h3>${journals.length}</h3>
      <p class="muted">journal entries</p>
    </div>
    <div class="stat-card">
      <h3>${new Set(journals.map((entry) => entry.mood || "Neutral")).size}</h3>
      <p class="muted">mood tags used</p>
    </div>
  `;
};

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("user");
  window.location.href = "login.html";
});

loadAnalytics();