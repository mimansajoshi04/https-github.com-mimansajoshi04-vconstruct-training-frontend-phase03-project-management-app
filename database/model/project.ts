interface ProjectType {
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
  start_date: Date;
  deadline_date: Date;
}

const createProject = (
  db: IDBDatabase,
  projectData: ProjectType,
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    if (!db) {
      console.error("Database connection failed");
      reject("Database connection failed");
      return;
    }
    const transaction = db.transaction("projects", "readwrite");
    const store = transaction.objectStore("projects");
    const addRequest = store.add(projectData);

    addRequest.onsuccess = () => {
      console.log("Project added successfully");
      resolve("Project added successfully.");
    };

    addRequest.onerror = (event: any) => {
      console.error("Error adding project:", event.target.error);
      reject("Error adding project: " + event.target.error);
    };
  });
};

const getProjectById = (
  db: IDBDatabase,
  id: number,
): Promise<ProjectType | null> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject("Database connection failed");
      return;
    }
    const transaction = db.transaction("projects", "readonly");
    const store = transaction.objectStore("projects");
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const project = getRequest.result;
      if (project) project.id = id; // Ensure the ID is included in the returned project
      resolve(project || null);
    };

    getRequest.onerror = (event: any) => {
      console.error("Error getting project by ID:", event.target.error);
      reject(event.target.error);
    };
  });
};

const getAllProjects = (db: IDBDatabase): Promise<ProjectType[]> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject("Database connection failed");
      return;
    }
    const transaction = db.transaction("projects", "readonly");
    const store = transaction.objectStore("projects");
    const getAllRequest = store.getAll();

    getAllRequest.onsuccess = () => {
      const projects = getAllRequest.result;
      resolve(projects);
    };

    getAllRequest.onerror = (event: any) => {
      console.error("Error getting all projects:", event.target.error);
      reject(event.target.error);
    };
  });
};

const updateProject = (
  db: IDBDatabase,
  id: number,
  updatedData: Partial<ProjectType>,
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    if (!db) {
      console.error("Database connection failed");
      reject("Database connection failed");
      return;
    }
    const transaction = db.transaction("projects", "readwrite");
    const store = transaction.objectStore("projects");

    try {
      const existingProject = await getProjectById(db, id);
      if (!existingProject) {
        reject("Project not found");
        return;
      }

      const updatedProject = { ...existingProject, ...updatedData };
      const updateRequest = store.put(updatedProject, id);

      updateRequest.onsuccess = () => {
        console.log("Project updated successfully");
        resolve("Project updated successfully.");
      };

      updateRequest.onerror = (event: any) => {
        console.error("Error updating project:", event.target.error);
        reject("Error updating project: " + event.target.error);
      };
    } catch (error) {
      reject(error);
    }
  });
};

export { type ProjectType, createProject, getProjectById, getAllProjects, updateProject };
