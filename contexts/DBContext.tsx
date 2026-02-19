import { createContext } from "react";

import { getDB } from "../database/schema/database.ts";

const db = await getDB();

const DBContext = createContext(db);

export default DBContext;
