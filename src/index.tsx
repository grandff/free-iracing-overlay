import { render } from "solid-js/web";
import { App } from "./App.tsx";
import { ControlWindow } from "./ControlWindow.tsx";
import { windowRole } from "./services/shell.ts";
import "./styles/global.css";

const root = document.getElementById("root");

if (root) {
  // Same bundle, two windows. The "control" window is the ordinary program window;
  // everything else renders the transparent HUD (or the combined browser preview).
  render(() => (windowRole === "control" ? <ControlWindow /> : <App />), root);
}
