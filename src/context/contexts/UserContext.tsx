// External Libraries
import { createContext } from 'react';

// Types
import type { UserType } from "../../../database/model/user";

export type UserContextType = {
  user: UserType | null;
  setUser: React.Dispatch<React.SetStateAction<UserType | null>>;
};

const DEFAULT_VALUE: UserContextType = {
  user: null,
  setUser: () => {},
};

const UserContext = createContext<UserContextType>(DEFAULT_VALUE);

export {UserContext};
