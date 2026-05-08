import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { RuntimeErrorBoundary } from "./components/RuntimeErrorBoundary";
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";
import "@/styles/_variables.scss";
import "@/styles/_keyframe-animations.scss";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "./styles.css";

function renderFatalBootError(error: unknown) {
  const root = document.getElementById("root");
  if (!root) {
    return;
  }

  const resolvedError = error instanceof Error ? error : new Error(String(error));
  root.innerHTML = `
    <main style="min-height:100vh;padding:32px;background:#fff8f7;color:#25161b;font-family:'Segoe UI',Arial,sans-serif;">
      <div style="max-width:920px;margin:0 auto;padding:24px;border:1px solid #f2c9d2;border-radius:20px;background:#ffffff;box-shadow:0 18px 40px rgba(98, 28, 51, 0.08);">
        <h1 style="margin:0 0 12px;font-size:28px;line-height:1.15;">The app hit a startup error</h1>
        <p style="margin:0 0 18px;color:#6f4450;font-size:15px;line-height:1.5;">A renderer error happened before the app could finish booting.</p>
        <pre style="margin:0;padding:16px;border-radius:14px;background:#1f1720;color:#f8ecf0;font-size:13px;line-height:1.5;white-space:pre-wrap;word-break:break-word;">${resolvedError.stack ?? resolvedError.message}</pre>
      </div>
    </main>
  `;
}

window.addEventListener("error", (event) => {
  console.error("Uncaught startup error", event.error ?? event.message);
  renderFatalBootError(event.error ?? event.message);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled startup rejection", event.reason);
  renderFatalBootError(event.reason);
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RuntimeErrorBoundary>
      <App />
    </RuntimeErrorBoundary>
  </React.StrictMode>
);
