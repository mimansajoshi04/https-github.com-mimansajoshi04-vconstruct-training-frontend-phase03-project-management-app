import type { UserType } from "../../database/model/user";
import type { ProjectType } from "../../database/model/project";

export interface ProjectContextValue {
  projects: ProjectDataStructure | ProjectType[] | null;
  setProjects: React.Dispatch<
    React.SetStateAction<ProjectDataStructure | ProjectType[] | null>
  >;
}

export interface UserContextValue {
  users: UserType[] | null;
  setUsers: React.Dispatch<React.SetStateAction<UserType[] | null>>;
}

export interface ProjectDataStructure {
  createdProjects: ProjectType[];
  assignedProjects: ProjectType[];
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  role: string;
  password: string;
  confirmPassword: string;
}

export interface ProjectFormData {
  name: string;
  description: string;
  start_date: any;
  deadline_date: any;
  members?: number[];
}

export interface NavigationItem {
  kind?: string;
  segment?: string;
  title: string;
  icon?: React.ReactNode;
}
