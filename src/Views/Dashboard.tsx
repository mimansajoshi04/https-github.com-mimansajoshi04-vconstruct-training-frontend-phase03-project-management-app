// External Libraries
import { type ReactNode } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

// MUI Components
import { Box } from "@mui/material";

// Toolpad Components
import { AppProvider, type Navigation } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";

// Constants
import { STORAGE_KEYS, ROUTE_PATHS } from "../constants/app.constants";

// Contexts
import {
  AllProjectContext,
  AllUserContext,
} from "../context/contexts/AppContext";

// Types
import EntireSearchBar from "./EntireSearchBar";
import { useAuthCheck, useDataForUser, useUserHook } from "../hooks";
import createNavigation from "../services/createNavigation";

import type { DataType } from "../hooks/useDataForUser";

export default function DashBoard(): ReactNode {
  useAuthCheck({
    redirectTo: "/login",
    when: "unauthenticated",
  });

  const { allUsers, projectData, setAllUsers, setProjectData }: DataType =
    useDataForUser();
  const { user, setUser } = useUserHook();

  const navigate = useNavigate();
  const location = useLocation();


  if (!allUsers && !projectData) return <h3>Loading...</h3>;

  const navigationMenu: Navigation = createNavigation(
    user,
    projectData ? projectData : [],
  );

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
              value={{ projects: projectData, setProjects: setProjectData }}
            >
              <EntireSearchBar />
              <Outlet />
            </AllProjectContext.Provider>
          </AllUserContext.Provider>
        </Box>
      </DashboardLayout>
    </AppProvider>
  );
}
