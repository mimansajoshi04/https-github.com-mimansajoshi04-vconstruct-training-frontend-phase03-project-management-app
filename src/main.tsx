import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// CSS Files
import "./index.css";

// Components
import App from "./App.tsx";

// Database context
import DBContext from "../contexts/DBContext.tsx";

// functions
import { getDB } from "../database/schema/database.ts";

const db = await getDB();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DBContext.Provider value={db}>
      <App />
    </DBContext.Provider>
  </StrictMode>,
);
