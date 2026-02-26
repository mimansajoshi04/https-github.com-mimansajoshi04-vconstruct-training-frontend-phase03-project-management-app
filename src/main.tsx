import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { BrowserRouter } from "react-router-dom";
// CSS Files
// import "./index.css";

// Components
import App from "./App.tsx";

// Contexts
import DBContextProvider from "./context/contextProviders/DBContextProvider.tsx";
import UserContextProvider from "./context/contextProviders/UserContextProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <DBContextProvider>
        <UserContextProvider>
          <App />
        </UserContextProvider>
      </DBContextProvider>
    </BrowserRouter>
  </StrictMode>,
);
