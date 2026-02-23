import UserContext from "../contexts/UserContext.tsx";
import { useState } from "react";
import { type UserType } from "../../database/model/user.ts";

export default function UserContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserType | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}
