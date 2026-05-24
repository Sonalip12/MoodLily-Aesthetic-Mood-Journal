const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username =
      document.getElementById("username").value;

    const email =
      document.getElementById("email").value;

    const password =
      document.getElementById("password").value;

    const response = await fetch(
      "http://localhost:5000/api/auth/signup",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          username,
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    alert(data.message || data.error);

    if (response.ok) {
      window.location.href = "login.html";
    }
  });
}

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email =
      document.getElementById("loginEmail").value;

    const password =
      document.getElementById("loginPassword").value;

    const response = await fetch(
      "http://localhost:5000/api/auth/login",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    alert(data.message || data.error);

    if (response.ok) {
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      window.location.href =
        "dashboard.html";
    }
  });
}