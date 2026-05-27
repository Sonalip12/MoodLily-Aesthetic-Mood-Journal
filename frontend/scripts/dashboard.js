const user = JSON.parse(
  localStorage.getItem("user")
);

if (!user) {
  window.location.href = "login.html";
}

document.getElementById(
  "welcomeText"
).innerText =
  `Welcome, ${user.username} ✨`;

const moodCards =
  document.querySelectorAll(".mood-card");

moodCards.forEach((card) => {

  card.addEventListener("click", async () => {

    const mood =
      card.dataset.mood;

    const response = await fetch(
      window.moodlilyApiUrl("/moods/add"),
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          user_id: user.id,
          mood,
        }),
      }
    );

    const data = await response.json();

    alert(data.message);
  });

});

document.getElementById(
  "logoutBtn"
).addEventListener("click", () => {

  localStorage.removeItem("user");

  window.location.href =
    "login.html";
});