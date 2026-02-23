import { getDB } from "../../database/schema/database.ts";

import DBContext from "../contexts/DBContext.tsx";

const db = await getDB();
export default function DBContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DBContext.Provider value={db}>{children}</DBContext.Provider>;
}
