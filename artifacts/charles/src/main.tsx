import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

// In production (e.g. Vercel), the API is often hosted on a different domain.
// Set `VITE_API_BASE_URL` (e.g. https://your-api.example.com) so requests to
// `/api/*` are routed correctly.
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
if (apiBaseUrl) {
  setBaseUrl(apiBaseUrl);
}

createRoot(document.getElementById("root")!).render(<App />);
