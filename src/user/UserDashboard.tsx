import { useContext } from "react";
import UserContext, { type UserContextType } from "../contexts/UserContext";

export default function UserDashboard() {
  const { user, setUser }: UserContextType = useContext(UserContext);

  return (
    <>
      <h3>Welcome {user?.name}</h3>
      <p>Role: {user?.role}</p>
    </>
  );
}
