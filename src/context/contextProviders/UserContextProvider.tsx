// External Libraries
import { useState, type ReactNode } from 'react';

// Contexts
import {UserContext} from '../contexts/UserContext';

// Types
import type { UserType } from '../../../database/model/user';

interface UserContextProviderProps {
  children: ReactNode;
}

export default function UserContextProvider({
  children,
}: UserContextProviderProps): ReactNode {
  const [user, setUser] = useState<UserType | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}
