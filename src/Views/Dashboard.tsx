// External Libraries
import {
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

// MUI Components
import { Box } from "@mui/material";

// Toolpad Components
import { AppProvider, type Navigation } from "@toolpad/core/AppProvider";
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
import DBContext from "../context/contexts/DBContext";
import {
  AllProjectContext,
  AllUserContext,
} from "../context/contexts/AppContext";

// Services
import { getAllDataForAdminUser } from "../admin/services/getData";
import { getAllDataForUser } from "../user/services/getData";
import { getAllUsers } from "../../database/model/user";

// Types
import type { ProjectDataStructure } from "../types";
import type { UserType } from "../../database/model/user";
import type { ProjectType } from "../../database/model/project";

const ADMIN_NAVIGATION: Navigation = [
  { kind: "header", title: "Main items" },
  { segment: "", title: "Dashboard", icon: <DashboardIcon /> },
  { segment: "projects", title: "Projects", icon: <AccountTreeIcon /> },
  { segment: "users", title: "All Users", icon: <GroupIcon /> },
  { kind: "divider" },
  {
    segment: "logout",
    title: "Logout",
    icon: <LogoutIcon />,
  },
];

const USER_NAVIGATION: Navigation = [
  { kind: "header", title: "Main items" },
  { segment: "", title: "Dashboard", icon: <DashboardIcon /> },
  { segment: "projects", title: "Projects", icon: <AccountTreeIcon /> },
  { kind: "divider" },
  {
    segment: "logout",
    title: "Logout",
    icon: <LogoutIcon />,
  },
];

export default function DashBoard(): ReactNode {
  // Context
  const { user, setUser }: UserContextType = useContext(UserContext);
  const db = useContext(DBContext);

  // Navigation
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [allUsers, setAllUsers] = useState<UserType[] | null>([]);
  const [allProjects, setAllProjects] = useState<
    ProjectDataStructure | ProjectType[] | null
  >(null);


  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
    navigate(ROUTE_PATHS.LOGIN, { replace: true });
  };

  const loadData = async () => {
    if (!user?.role || !db) return;

    try {
      if (user.role === USER_ROLES.ADMIN) {
        const data = await getAllDataForAdminUser(db);
        setAllUsers(data.userData || []);
        setAllProjects(data.projectData || {});
      } else {
        const allUsersData = await getAllUsers(db);
        const filteredUsers = allUsersData.filter(
          (userData: UserType) =>
            userData.role !== USER_ROLES.ADMIN && userData.id !== user.id,
        );

        const data = await getAllDataForUser(db, user?.id ?? -1);
        setAllProjects(data.projectData || {});
        setAllUsers(filteredUsers);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
  };

  // Fetch data when user changes
  useEffect(() => {
    loadData();
  }, []);

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
