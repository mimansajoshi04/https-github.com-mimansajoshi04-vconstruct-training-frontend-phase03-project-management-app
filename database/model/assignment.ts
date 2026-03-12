import { getUserById, type UserType } from "./user";
import dbSchema from "../schema/schema";

interface ProjectUserRelation {
  id?: number;
  projectId: number;
  userId: number;
  assignedAt: Date;
}

interface ProjectForUserType {
  id: number;
  name: string;
  description: string;
  created_by: number;
  assigned_by: number;
  created_at: Date;
  updated_at: Date;
  start_date: Date;
  deadline_date: Date;
}

const createProjectUserRelation = (
  relation: ProjectUserRelation,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const REQUEST = indexedDB.open(
      dbSchema.name ?? "project-management-app",
      dbSchema.version ?? 1,
    );

    REQUEST.onsuccess = () => {
      const DB = REQUEST.result;

      if (!DB) {
        reject("DB Not found!");
        return;
      }
      const TRANSACTION = DB.transaction("project_user_relation", "readwrite");
      const STORE = TRANSACTION.objectStore("project_user_relation");
      const INDEX = STORE.index("id");
      const GET_REQUEST = INDEX.getAll();

      GET_REQUEST.onsuccess = () => {
        let result = GET_REQUEST.result;
        let existingRelation = result.filter(
          (r) =>
            r.userId === relation.userId && r.projectId === relation.projectId,
        );

        if (existingRelation.length > 0) {
          reject("Cannot create a new relation!");
          return;
        }

        const ADD_REQUEST = STORE.add(relation);

        ADD_REQUEST.onsuccess = () => {
          resolve("Project-user relation created successfully");
        };

        ADD_REQUEST.onerror = (error: unknown) => {
          if (error instanceof Error) {
            reject(error.message);
            return;
          }

          if (typeof error === "string") {
            reject(error);
            return;
          }
        };
      };

      GET_REQUEST.onerror = (error: unknown) => {
        if (error instanceof Error) {
          reject(error.message);
          return;
        }

        if (typeof error === "string") {
          reject(error);
          return;
        }
      };
    };

    REQUEST.onerror = (error: unknown) => {
      if (error instanceof Error) {
        reject(error.message);
        return;
      }

      if (typeof error === "string") {
        reject(error);
        return;
      }
    };
  });
};

const getUsersForProject = (projectId: number): Promise<UserType[]> => {
  // logic to get all users assigned to a specific project
  return new Promise((resolve, reject) => {
    const REQUEST = indexedDB.open(
      dbSchema.name ?? "project-management-app",
      dbSchema.version ?? 1,
    );

    REQUEST.onsuccess = () => {
      const DB = REQUEST.result;
      const TRANSACTION = DB.transaction("project_user_relation", "readonly");
      const STORE = TRANSACTION.objectStore("project_user_relation");
      const INDEX = STORE.index("id");
      const GET_REQUEST = INDEX.getAll();

      GET_REQUEST.onsuccess = () => {
        const RESULT = GET_REQUEST.result;
        const DATA = RESULT.filter((p) => p.projectId === projectId);

        let totalMembers = DATA.length;
        let members: UserType[] = [];
        let completed = 0;

        DATA.forEach(async (relation) => {
          let userId = relation.userId;
          try {
            let member = await getUserById(userId);
            if (typeof member !=="string")
              members.push({
                name:member.name,
                role: member.role,
                email: member.email,
                avatar_color: member.avatar_color,
                id: userId,
              });
            completed++;

            if (completed === totalMembers) {
              resolve(members);
            }
          } catch (error) {
            console.error(error);
            completed++;

            if (completed === totalMembers) {
              resolve(members);
            }
          }
        });
      };

      GET_REQUEST.onerror = (error: unknown) => {
        if (error instanceof Error) {
          reject(error.message);
          return;
        }

        if (typeof error === "string") {
          reject(error);
          return;
        }
      };
    };

    REQUEST.onerror = (error: unknown) => {
      if (error instanceof Error) {
        reject(error.message);
        return;
      }

      if (typeof error === "string") {
        reject(error);
        return;
      }
    };
  });
};

const getProjectsForUser = (userId: number): Promise<ProjectForUserType[]> => {
  return new Promise((resolve, reject) => {
    const DB_REQUEST = indexedDB.open(
      dbSchema.name ?? "project-management-app",
      dbSchema.version ?? 1,
    );

    DB_REQUEST.onsuccess = () => {
      const DB = DB_REQUEST.result;

      const TRANSACTION = DB.transaction("project_user_relation", "readonly");
      const STORE = TRANSACTION.objectStore("project_user_relation");
      const REQUEST = STORE.getAll();

      REQUEST.onsuccess = () => {
        let userProjects = REQUEST.result.filter(
          (proj) => proj.userId === userId,
        );

        if (userProjects.length === 0) {
          resolve([]);
          return;
        }

        const PROJECT_TX = DB.transaction("projects", "readonly");
        const PROJECT_STR = PROJECT_TX.objectStore("projects");

        const projectDetails: ProjectForUserType[] = [];
        let completed = 0;

        userProjects.forEach((project) => {
          const REQUEST_PROJ = PROJECT_STR.get(project.projectId);

          REQUEST_PROJ.onsuccess = () => {
            if (REQUEST_PROJ.result) {
              projectDetails.push({
                ...REQUEST_PROJ.result,
                assignedAt: project.assignedAt,
              });
            }

            completed++;

            if (completed === userProjects.length) {
              resolve(projectDetails);
            }
          };

          REQUEST_PROJ.onerror = () => {
            completed++;

            if (completed === userProjects.length) {
              resolve(projectDetails);
            }
          };
        });
      };

      REQUEST.onerror = (error: unknown) => {
        if (error instanceof Error) {
          reject(error.message);
          return;
        }

        if (typeof error === "string") {
          reject(error);
          return;
        }
      };
    };

    DB_REQUEST.onerror = (error: unknown) => {
      if (error instanceof Error) {
        reject(error.message);
        return;
      }

      if (typeof error === "string") {
        reject(error);
        return;
      }
    };
  });
};

const removeUserFromProject = (
  projectId: number,
  userId: number,
): Promise<string> => {
  // logic to remove a user from a project
  return new Promise((resolve, reject) => {
    const DB_REQUEST = indexedDB.open(
      dbSchema.name ?? "project-management-app",
      dbSchema.version ?? 1,
    );

    DB_REQUEST.onsuccess = () => {
      const DB = DB_REQUEST.result;
      const TRANSACTION = DB.transaction("project_user_relation", "readwrite");
      const STORE = TRANSACTION.objectStore("project_user_relation");
      const INDEX = STORE.index("project_id");
      const REQUEST = INDEX.getAll(projectId);

      REQUEST.onsuccess = () => {
        let relations = REQUEST.result as ProjectUserRelation[];
        let relationToRemove = relations.find(
          (relation) => relation.userId === userId,
        );
        if (relationToRemove) {
          const DELETE_REQUEST = STORE.delete(relationToRemove.projectId);
          DELETE_REQUEST.onsuccess = () => {
            resolve("User removed from project successfully");
          };
          DELETE_REQUEST.onerror = (error: unknown) => {
            if (error instanceof Error) {
              reject(error.message);
              return;
            }

            if (typeof error === "string") {
              reject(error);
              return;
            }
          };
        } else {
          reject("User not found in project");
        }
      };

      REQUEST.onerror = (error: unknown) => {
        if (error instanceof Error) {
          reject(error.message);
          return;
        }

        if (typeof error === "string") {
          reject(error);
          return;
        }
      };
    };

    DB_REQUEST.onerror = (error: any) => {
      let message = error instanceof Error ? error.message : error;
      reject(message);
    };
  });
};

export {
  type ProjectUserRelation,
  createProjectUserRelation,
  getUsersForProject,
  getProjectsForUser,
  removeUserFromProject,
};
