import { useContext } from "react";
import { UserContext } from "../context/contexts/UserContext";

export const useUserHook = () => {
  const { user, setUser } = useContext(UserContext);
  return { user, setUser };
};
