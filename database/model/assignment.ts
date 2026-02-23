interface ProjectUserRelation {
  projectId: number;
  userId: number;
  assignedAt: Date;
}

const createProjectUserRelation = (
  db: IDBDatabase,
  relation: ProjectUserRelation,
) => {
  // logic to create a project-user relation in the database
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("project_user_relation", "readwrite");
    const store = transaction.objectStore("project_user_relation");
    const request = store.add(relation);

    request.onsuccess = () => {
      resolve("Project-user relation created successfully");
    };

    request.onerror = (event) => {
      console.error("Error creating project-user relation:", event);
      reject(event);
    };
  });
};

const getUsersForProject = (
  db: IDBDatabase,
  projectId: number,
): Promise<ProjectUserRelation[] | null> => {
  // logic to get all users assigned to a specific project
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("project_user_relation", "readonly");
    const store = transaction.objectStore("project_user_relation");
    const index = store.index("project_id");
    const request = index.getAll(projectId);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      console.error("Error getting users for project:", event);
      reject(null);
    };
  });
};

const getProjectsForUser = (
  db: IDBDatabase,
  userId: number,
): Promise<ProjectUserRelation[] | null> => {
  // logic to get all projects a specific user is assigned to
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("project_user_relation", "readonly");
    const store = transaction.objectStore("project_user_relation");
    const index = store.index("user_id");
    const request = index.getAll(userId);

    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = (event) => {
      console.error("Error getting projects for user:", event);
      reject(null);
    };
  });
};

const removeUserFromProject = (
  db: IDBDatabase,
  projectId: number,
  userId: number,
): Promise<string> => {
  // logic to remove a user from a project
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("project_user_relation", "readwrite");
    const store = transaction.objectStore("project_user_relation");
    const index = store.index("project_id");
    const request = index.getAll(projectId);

    request.onsuccess = () => {
      const relations = request.result as ProjectUserRelation[];
      const relationToRemove = relations.find(
        (relation) => relation.userId === userId,
      );
      if (relationToRemove) {
        const deleteRequest = store.delete(relationToRemove.projectId);
        deleteRequest.onsuccess = () => {
          resolve("User removed from project successfully");
        };
        deleteRequest.onerror = (event) => {
          console.error("Error removing user from project:", event);
          reject("Error removing user from project");
        };
      } else {
        reject("User not found in project");
      }
    };

    request.onerror = (event) => {
      console.error("Error finding user in project:", event);
      reject("Error finding user in project");
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
