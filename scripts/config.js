window.MOODLILY_API_BASE =
  window.MOODLILY_API_BASE ||
  (window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000/api"
    : "/api");

window.moodlilyApiUrl = (path) =>
  `${window.MOODLILY_API_BASE}${path}`;