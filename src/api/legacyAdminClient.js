import axios from "axios";

const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const baseURL = import.meta.env.VITE_API_BASE_URL ||
  (isLocalHost
    ? "http://localhost:5000/api"
    : "https://school-project-i40q.onrender.com/api");

// Separate client so the legacy admin token never uses or clears the LMS session.
const legacyAdminApi = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

export default legacyAdminApi;
