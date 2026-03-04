// External Libraries
import { useContext } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

// Custom Hooks
import { useAuthInitialize } from "./hooks/useAuthInitialize";

// Contexts
import { UserContext } from "./context/contexts/UserContext";
import type { UserContextType } from "./context/contexts/UserContext";

// Constants
import { ROUTE_PATHS, USER_ROLES } from "./constants/app.constants";

// Pages
import Login from "./auth/Login";
import Register from "./auth/Register";
import Dashboard from "./Views/Dashboard";
import AdminDashboard from "./admin/views/AdminDashboard";
import UserDashboard from "./user/UserDashboard";
import Users from "./Views/Users";
import AdminProjects from "./admin/components/projects/AdminProjects";
import UserProjects from "./user/UserProjects";
import ProjectDetails from "./common/projects/ProjectDetails";
import KanbanBoard from "./common/story/KanbanBoard";

function App(): React.ReactElement {
  useAuthInitialize();

  const { user }: UserContextType = useContext(UserContext);
  const isAdmin = user?.role === USER_ROLES.ADMIN;

  return (
    <Routes>
      {/*  Dashboard routes */}
      <Route
        path={ROUTE_PATHS.DASHBOARD}
        element={user ? <Dashboard /> : <Navigate to={ROUTE_PATHS.LOGIN} />}
      >
        <Route
          index
          element={isAdmin ? <AdminDashboard /> : <UserDashboard />}
        />

        {/*  Project routes */}
        <Route path="projects">
          <Route
            path="all"
            element={isAdmin ? <AdminProjects /> : <UserProjects />}
          />
          <Route path=":type/:id" element={<ProjectDetails />} />
        </Route>

        {isAdmin && <Route path="users" element={<Users />} />}

        {/*  Story routes */}

        <Route path="project-stories/:type/:id" element={<KanbanBoard />} />
      </Route>

      <Route
        path={ROUTE_PATHS.LOGIN}
        element={user ? <Navigate to={ROUTE_PATHS.DASHBOARD} /> : <Login />}
      />

      <Route
        path={ROUTE_PATHS.REGISTER}
        element={user ? <Navigate to={ROUTE_PATHS.DASHBOARD} /> : <Register />}
      />

      <Route path="*" element={<Navigate to={ROUTE_PATHS.LOGIN} />} />
    </Routes>
  );
}

export default App;
