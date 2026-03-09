// MUI Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import GroupIcon from "@mui/icons-material/Group";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  type Navigation,
  type NavigationItem,
} from "@toolpad/core/AppProvider";

import type { ProjectType } from "../../database/model/project";
import type { ProjectDataStructure } from "../types";
import type { UserType } from "../../database/model/user";

const adminNavigationChildren = (projectData: ProjectType[]) => {
  const adminProjectsChildren: NavigationItem[] =
    projectData.length > 0
      ? [
          {
            segment: "all",
            title: "All Projects",
          },
          {
            kind: "divider",
          },

          ...projectData.map((project) => ({
            segment: `admin/${project.id}`,
            title: project.name,
          })),
        ]
      : [
          {
            segment: "all",
            title: "All Projects",
          },
        ];

  return adminProjectsChildren;
};

const userNavigationChildren = (projectData: ProjectDataStructure) => {
  const userProjectsChildren: NavigationItem[] =
    projectData && !Array.isArray(projectData)
      ? [
          {
            segment: "all",
            title: "All Projects",
          },
          {
            kind: "divider",
          },

          ...(projectData.createdProjects?.length
            ? [
                {
                  segment: "created",
                  title: "Created",
                  children: projectData.createdProjects.map((project) => ({
                    segment: `${project.id}`,
                    title: project.name,
                  })),
                },
              ]
            : []),

          ...(projectData.assignedProjects?.length
            ? [
                {
                  segment: "assigned",
                  title: "Assigned",
                  children: projectData.assignedProjects.map((project) => ({
                    segment: `${project.id}`,
                    title: project.name,
                  })),
                },
              ]
            : []),
        ]
      : [
          {
            segment: "all",
            title: "All Projects",
          },
        ];

  return userProjectsChildren;
};

const createChildrenForNavigation = (
  user: UserType,
  projectData: ProjectDataStructure | ProjectType[],
) => {
  const childrenForNavigation =
    user.role == "admin"
      ? adminNavigationChildren(Array.isArray(projectData) ? projectData : [])
      : !Array.isArray(projectData)
        ? userNavigationChildren(projectData)
        : [];
  return childrenForNavigation;
};

const createNavigation = (
  user: UserType | null,
  projectData: ProjectDataStructure | ProjectType[],
) => {
  if (!user) return [];

  const NAVIGATION: Navigation = [
    { kind: "header", title: "Main items" },
    { segment: "", title: "Dashboard", icon: <DashboardIcon /> },
    {
      segment: "projects",
      title: "Projects",
      icon: <AccountTreeIcon />,
      children: createChildrenForNavigation(user, projectData),
    },
    { kind: "divider" },
    {
      segment: "logout",
      title: "Logout",
      icon: <LogoutIcon />,
    },
  ];

  if (user.role === "admin") {
    NAVIGATION.push({ kind: "divider" });
    NAVIGATION.push({
      segment: "users",
      title: "All Users",
      icon: <GroupIcon />,
    });
  }

  return NAVIGATION;
};

export default createNavigation;
