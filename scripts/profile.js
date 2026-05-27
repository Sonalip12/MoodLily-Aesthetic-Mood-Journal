const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  window.location.href = "login.html";
}

document.getElementById("profileName").textContent = user.username;
document.getElementById("profileEmail").textContent = user.email || "Connected account";

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("user");
  window.location.href = "login.html";
});