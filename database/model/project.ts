import { getProjectsForUser } from "./assignment";

interface ProjectType {
  id?: number
  name: string;
  description: string;
  created_by: number;
  created_at: Date;
  updated_at: Date;
  start_date: Date;
  deadline_date: Date;
  assignedAt? : Date;
}

const createProject = (
  DB: IDBDatabase,
  projectData: ProjectType,
): Promise<string | { id: number }> => {
  return new Promise(async (resolve, reject) => {
    if (!DB) {
      console.error("Database connection failed");
      reject("Database connection failed");
      return;
    }
    const TRANSACTION = DB.transaction("projects", "readwrite");
    const STORE = TRANSACTION.objectStore("projects");
    const ADD_REQUEST = STORE.add(projectData);

    ADD_REQUEST.onsuccess = (event: any) => {
      let id = event.target.result;
      resolve({
        id: id,
      });
    };

    ADD_REQUEST.onerror = (event: any) => {
      console.error("Error adding project:", event.target.error);
      reject("Error adding project: " + event.target.error);
    };
  });
};

const getProjectById = (
  DB: IDBDatabase,
  id: number,
): Promise<ProjectType | null> => {
  return new Promise((resolve, reject) => {
    if (!DB) {
      reject("Database connection failed");
      return;
    }
    const TRANSACTION = DB.transaction("projects", "readonly");
    const STORE = TRANSACTION.objectStore("projects");
    const GET_REQUEST = STORE.get(id);

    GET_REQUEST.onsuccess = () => {
      let project = GET_REQUEST.result;
      if (project) project.id = id;
      resolve(project);
    };

    GET_REQUEST.onerror = (event: any) => {
      console.error("Error getting project by ID:", event.target.error);
      reject(null);
    };
  });
};

const getAllProjects = (DB: IDBDatabase): Promise<ProjectType[]> => {
  return new Promise((resolve, reject) => {
    if (!DB) {
      reject("Database connection failed");
      return;
    }
    const TRANSACTION = DB.transaction("projects", "readonly");
    const STORE = TRANSACTION.objectStore("projects");
    const GET_ALL_REQUEST = STORE.getAll();

    GET_ALL_REQUEST.onsuccess = () => {
      let projects = GET_ALL_REQUEST.result;
      resolve(projects);
    };

    GET_ALL_REQUEST.onerror = (event: any) => {
      console.error("Error getting all projects:", event.target.error);
      reject([]);
    };
  });
};

const updateProject = (
  DB: IDBDatabase,
  id: number,
  updatedData: Partial<ProjectType>,
): Promise<ProjectType | string> => {
  return new Promise(async (resolve, reject) => {
    if (!DB) {
      reject("Database connection failed");
      return;
    }

    const existingProject = await getProjectById(DB, id);
    if (!existingProject) {
      reject("Project not found");
      return;
    }
    try {
      const TRANSACTION = DB.transaction("projects", "readwrite");
      const STORE = TRANSACTION.objectStore("projects");

      let updatedProject = { ...existingProject, ...updatedData };
      const UPDATE_REQUEST = STORE.put(updatedProject);

      UPDATE_REQUEST.onsuccess = () => {
        resolve({
          ...updatedProject,
          id: id,
        });
      };

      UPDATE_REQUEST.onerror = (event: any) => {
        reject("Error updating project: " + event.target.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

const getProjectsByUserId = (
  DB: IDBDatabase,
  id: number,
): Promise<{ assignedProjects: ProjectType[]; createdProjects: ProjectType[] }> => {
  return new Promise((resolve, reject) => {
    const TRANSACTION = DB.transaction("projects", "readonly");
    const STORE = TRANSACTION.objectStore("projects");

    const REQUEST = STORE.openCursor();
    let createdProjects: any[] = [];

    REQUEST.onsuccess = async (event: any) => {
      const CURSOR = event.target.result;

      if (CURSOR) {
        if (CURSOR.value.created_by === id) {
          createdProjects.push(CURSOR.value);
        }

        CURSOR.continue();
      } else {
        try {
          let assignedProjects = await getProjectsForUser(DB, id);

          resolve({
            assignedProjects,
            createdProjects,
          });
        } catch (error) {
          reject(error);
        }
      }
    };

    REQUEST.onerror = (event: any) => {
      reject(event.target.error);
    };
  });
};

export {
  type ProjectType,
  createProject,
  getProjectById,
  getAllProjects,
  updateProject,
  getProjectsByUserId,
};
