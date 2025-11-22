import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { seedPropertiesIfEmpty } from "./lib/seedProperties";

seedPropertiesIfEmpty();

createRoot(document.getElementById("root")!).render(<App />);
