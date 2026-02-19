// CSS Files
import "./App.css";

// Database context
import DBContext from "../contexts/DBContext.tsx";

// react imports
import { useContext } from "react";

function App() {
  const db = useContext(DBContext);
  console.log("this is the database:", db);
  return <h3>PROJECT SETUP</h3>;
}

export default App;
