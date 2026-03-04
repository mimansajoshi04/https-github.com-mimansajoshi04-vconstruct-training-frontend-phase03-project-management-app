// External Libraries
import { useContext, useEffect, useState, type ReactNode } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

// MUI Components
import { Box } from "@mui/material";

// Toolpad Components
import {
  AppProvider,
  type Navigation,
  type NavigationItem,
} from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";

// MUI Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import GroupIcon from "@mui/icons-material/Group";
import LogoutIcon from "@mui/icons-material/Logout";

// Constants
import {
  USER_ROLES,
  STORAGE_KEYS,
  ROUTE_PATHS,
} from "../constants/app.constants";

// Contexts
import { UserContext } from "../context/contexts/UserContext";
import type { UserContextType } from "../context/contexts/UserContext";
import {
  AllProjectContext,
  AllUserContext,
} from "../context/contexts/AppContext";

// Types
import type { ProjectDataStructure } from "../types";
import { type UserType } from "../../database/model/user";
import type { ProjectType } from "../../database/model/project";
import DBContext from "../context/contexts/DBContext";
import { getAllDataForAdminUser } from "../admin/services/getData";
import { getAllDataForUser } from "../user/services/getData";

export default function DashBoard(): ReactNode {
  // Context
  const { user, setUser }: UserContextType = useContext(UserContext);
  const db = useContext(DBContext);

  // Navigation
  const navigate = useNavigate();
  const location = useLocation();

  // State mirrored from hooks so child components can mutate through context
  const [allUsers, setAllUsers] = useState<UserType[] | null>(null);
  const [allProjects, setAllProjects] = useState<
    ProjectDataStructure | ProjectType[] | null
  >(null);

  useEffect(() => {
    async function loadData() {
      try {
        if (!db) {
          throw new Error("DB Not found");
        }

        const data =
          user?.role === "admin"
            ? await getAllDataForAdminUser(db)
            : await getAllDataForUser(db, user?.id ?? -1);
        if (!data) {
          throw new Error("Data could not be fetched!");
        }
        setAllProjects(data.projectData);
        setAllUsers(data.userData);
      } catch (error) {
        //catch error
      }
    }

    loadData();
  }, []);

  const adminProjectsChildren: NavigationItem[] =
    Array.isArray(allProjects) && allProjects.length > 0
      ? [
          {
            segment: "all",
            title: "All Projects",
          },
          {
            kind: "divider",
          },

          ...allProjects.map((project) => ({
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

  const ADMIN_NAVIGATION: Navigation = [
    { kind: "header", title: "Main items" },
    { segment: "", title: "Dashboard", icon: <DashboardIcon /> },
    {
      segment: "projects",
      title: "Projects",
      icon: <AccountTreeIcon />,
      children: adminProjectsChildren,
    },
    { segment: "users", title: "All Users", icon: <GroupIcon /> },
    { kind: "divider" },
    {
      segment: "logout",
      title: "Logout",
      icon: <LogoutIcon />,
    },
  ];

  const userProjectsChildren: NavigationItem[] =
    allProjects && !Array.isArray(allProjects)
      ? [
          {
            segment: "all",
            title: "All Projects",
          },
          {
            kind: "divider",
          },

          ...(allProjects.createdProjects?.length
            ? [
                {
                  segment: "created",
                  title: "Created",
                  children: allProjects.createdProjects.map((project) => ({
                    segment: `${project.id}`,
                    title: project.name,
                  })),
                },
              ]
            : []),

          ...(allProjects.assignedProjects?.length
            ? [
                {
                  segment: "assigned",
                  title: "Assigned",
                  children: allProjects.assignedProjects.map((project) => ({
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

  const USER_NAVIGATION: Navigation = [
    { kind: "header", title: "Main items" },
    { segment: "", title: "Dashboard", icon: <DashboardIcon /> },
    {
      segment: "projects",
      title: "Projects",
      icon: <AccountTreeIcon />,
      children: userProjectsChildren,
    },
    { kind: "divider" },
    {
      segment: "logout",
      title: "Logout",
      icon: <LogoutIcon />,
    },
  ];

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
    navigate(ROUTE_PATHS.LOGIN, { replace: true });
  };

  const handleNavigation = (segment: string) => {
    if (segment === "/logout") {
      logout();
      return;
    }

    navigate(`${ROUTE_PATHS.DASHBOARD}/${segment}`);
  };

  const navigationMenu: Navigation =
    user?.role === USER_ROLES.ADMIN ? ADMIN_NAVIGATION : USER_NAVIGATION;

  return (
    <AppProvider
      branding={{ title: "Agile Project Manager" }}
      navigation={navigationMenu}
      router={{
        pathname: location.pathname,
        searchParams: new URLSearchParams(),
        navigate: (path) => handleNavigation(path.toString()),
      }}
    >
      <DashboardLayout>
        <Box sx={{ margin: 4 }}>
          <AllUserContext.Provider
            value={{ users: allUsers, setUsers: setAllUsers }}
          >
            <AllProjectContext.Provider
              value={{ projects: allProjects, setProjects: setAllProjects }}
            >
              <Outlet />
            </AllProjectContext.Provider>
          </AllUserContext.Provider>
        </Box>
      </DashboardLayout>
    </AppProvider>
  );
}
