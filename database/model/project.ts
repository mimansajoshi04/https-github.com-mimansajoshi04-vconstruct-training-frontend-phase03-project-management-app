import dbSchema from "../schema/schema";

interface ProjectType {
  id?: number;
  name: String;
  description: String;
  created_at: Date;
  updated_at: Date;
  start_date: Date;
  deadline_date: Date;
}

const createProject = (projectData: Omit<ProjectType, "id">) => {
  const request = indexedDB.open(
    dbSchema?.name ?? "my-database",
    dbSchema?.version ?? 1,
  );

  request.onsuccess = (event: any) => {
    const db = event?.target?.result ?? null;
    if (!db) {
      console.error("Database connection failed");
      return;
    }
    const transaction = db.transaction("projects", "readwrite");
    const store = transaction.objectStore("projects");
    const addRequest = store.add(projectData);

    addRequest.onsuccess = () => {
      console.log("Project added successfully");
    };

    addRequest.onerror = (event: any) => {
      console.error("Error adding project:", event.target.error);
    };
  };

  request.onerror = (event: any) => {
    console.error("Error opening database:", event.target.error);
  };
};

export { type ProjectType, createProject };
