import "./ui/style.css";
import { renderApp } from "./ui/app";

export const initApp = (): void => {
  const root = document.body;
  renderApp(root);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
