import { createContext } from "react";

import { type UserType } from "../../database/model/user.ts";

type UserContextType = {
  user: UserType | null |string;
  setUser: React.Dispatch<React.SetStateAction<UserType | null>>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});

export type { UserContextType };
export default UserContext;
