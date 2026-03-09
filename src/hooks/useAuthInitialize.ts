// Custom hook for auth initialization from localStorage
import { useContext, useEffect } from "react";

import { UserContext } from "../context/contexts/UserContext";
import type { UserContextType } from "../context/contexts/UserContext";
import { STORAGE_KEYS } from "../constants/app.constants";

export const useAuthInitialize = (): void => {
  const { setUser }: UserContextType = useContext(UserContext);

  useEffect(() => {
    const userDetails = localStorage.getItem(STORAGE_KEYS.USER);
    if (userDetails) {
      try {
        setUser(JSON.parse(userDetails));
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    }
  }, [setUser]);
};
