// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ClerkProvider } from "@clerk/clerk-react";
import { AuthSyncProvider } from "./context/AuthSyncContext";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  console.error("❌ Missing Clerk publishable key. Check your .env file.");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      navigate={(to) => window.history.pushState(null, "", to)} // React Router navigation
      appearance={{ baseTheme: "dark" }} // optional dark mode
      afterSignInUrl={window.location.pathname}
      afterSignUpUrl={window.location.pathname}
    >
      <AuthSyncProvider>
        <App />
      </AuthSyncProvider>
    </ClerkProvider>
  </React.StrictMode>
);
