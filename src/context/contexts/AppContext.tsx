// External Libraries
import { createContext } from 'react';

// Types
import type { ProjectContextValue, UserContextValue } from '../../types';

const DEFAULT_USER_VALUE: UserContextValue = {
  users: null,
  setUsers: () => {},
};

const DEFAULT_PROJECT_VALUE: ProjectContextValue = {
  projects: null,
  setProjects: () => {},
};

const AllUserContext = createContext<UserContextValue>(DEFAULT_USER_VALUE);
const AllProjectContext = createContext<ProjectContextValue>(DEFAULT_PROJECT_VALUE);

export { AllUserContext, AllProjectContext };
