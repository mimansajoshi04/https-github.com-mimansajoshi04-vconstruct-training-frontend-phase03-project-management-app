// Custom hook for fetching user data
import { useContext, useState, useCallback } from "react";

import DBContext from "../context/contexts/DBContext";
import { UserContext } from "../context/contexts/UserContext";
import type { UserContextType } from "../context/contexts/UserContext";
import { getAllUsers } from "../../database/model/user";

import type { UserType } from "../../database/model/user";

interface UseUserDataReturn {
  users: UserType[] | null;
  loading: boolean;
  error: Error | null;
  fetchUsers: () => Promise<void>;
}

export const useUserData = (excludeRoles: string[] = []): UseUserDataReturn => {
  const db = useContext(DBContext);
  const { user }: UserContextType = useContext(UserContext);

  const [users, setUsers] = useState<UserType[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!db) return;
      const allUsers = await getAllUsers(db);

      const filteredUsers = allUsers.filter((userData: UserType) => {
        const isExcludedRole = excludeRoles.includes(userData.role);
        const isCurrentUser = userData.id === user?.id;
        return !isExcludedRole && !isCurrentUser;
      });

      setUsers(filteredUsers);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }, [db, user?.id, excludeRoles]);

  return { users, loading, error, fetchUsers };
};
