import dbSchema from "../schema/schema";

interface StoryType {
  id?: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: Date;
  updated_at: Date;
  due_date: Date;
  userId: number;
  projectId: number;
  created_by: number;
}

const createStory = (story: StoryType): Promise<string> => {
  return new Promise((resolve, reject) => {
    const REQUEST = indexedDB.open(
      dbSchema.name ?? "project-management-app",
      dbSchema.version ?? 1,
    );
    REQUEST.onsuccess = () => {
      const DB = REQUEST.result;
      if (!DB) {
        reject("DB not found!");
        return;
      }
      const TRANSACTION = DB.transaction("story", "readwrite");
      const STORE = TRANSACTION.objectStore("story");
      const ADD_REQUEST = STORE.add(story);

      ADD_REQUEST.onsuccess = () => {
        resolve("Story Added Successfully!");
      };

      ADD_REQUEST.onerror = (error: any) => {
        let message = error instanceof Error ? error.message : error;
        reject(message);
      };
    };

    REQUEST.onerror = (error: any) => {
      let message = error instanceof Error ? error.message : error;
      reject(message);
    };
  });
};

const getAllStories = (): Promise<StoryType[] | string> => {
  return new Promise((resolve, reject) => {
    const REQUEST = indexedDB.open(
      dbSchema.name ?? "project-management-app",
      dbSchema.version,
    );

    REQUEST.onsuccess = () => {
      const DB = REQUEST.result;
      if (!DB) {
        reject("DB not found!");
        return;
      }

      const TRANSACTION = DB.transaction("story", "readonly");
      const STORE = TRANSACTION.objectStore("story");
      const INDEX = STORE.index("id");
      const GET_REQUEST = INDEX.getAll();

      GET_REQUEST.onsuccess = () => {
        let result = GET_REQUEST.result;
        if (!result) {
          reject("No stories found!");
          return;
        }

        resolve(result);
      };

      GET_REQUEST.onerror = (error: any) => {
        let message = error instanceof Error ? error.message : error;
        reject(message);
      };
    };

    REQUEST.onerror = (error: any) => {
      let message = error instanceof Error ? error.message : error;
      reject(message);
    };
  });
};

const getStoryById = (id: number): Promise<StoryType[] | string> => {
  return new Promise((resolve, reject) => {
    const REQUEST = indexedDB.open(
      dbSchema.name ?? "project-management-app",
      dbSchema.version ?? 1,
    );
    REQUEST.onsuccess = () => {
      const DB = REQUEST.result;

      if (!DB) {
        reject("DB not found");
        return;
      }

      const TRANSACTION = DB.transaction("story", "readonly");
      const STORE = TRANSACTION.objectStore("story");
      const INDEX = STORE.index("id");
      const GET_REQUEST = INDEX.getAll();

      GET_REQUEST.onsuccess = () => {
        let result = GET_REQUEST.result;
        let story = result.filter((s) => s.id === id)[0];
        resolve(story);
      };

      GET_REQUEST.onerror = (error: any) => {
        let message = error instanceof Error ? error.message : error;
        reject(message);
      };
    };

    REQUEST.onerror = (error: any) => {
      let message = error instanceof Error ? error.message : error;
      reject(message);
    };
  });
};

const getStoryForProjectId = (id: number): Promise<StoryType[] | string> => {
  return new Promise(async (resolve, reject) => {
    const allStories = await getAllStories();
    if (typeof allStories === "string") {
      reject(allStories);
      return;
    }

    let filteredStories = allStories.filter((story) => story.projectId === id);
    resolve(filteredStories);
  });
};

const getStoryForUserId = (id: number): Promise<StoryType[] | string> => {
  return new Promise(async (resolve, reject) => {
    const allStories = await getAllStories();
    if (typeof allStories === "string") {
      reject(allStories);
      return;
    }

    let filteredStories = allStories.filter((story) => story.userId === id);
    resolve(filteredStories);
  });
};

const updateStoryById = (id: number, storyData: Partial<StoryType>) => {
  return new Promise((resolve, reject) => {
    const REQUEST = indexedDB.open(
      dbSchema.name ?? "project-management-app",
      dbSchema.version ?? 1,
    );

    REQUEST.onsuccess = async () => {
      const DB = REQUEST.result;

      if (!DB) {
        reject("DB not found!");
        return;
      }

      const existingStory = await getStoryById(id);
      if (typeof existingStory === "string") {
        reject("Story not found!");
        return;
      }

      try {
        const TRANSACTION = DB.transaction("story", "readwrite");
        const STORE = TRANSACTION.objectStore("story");

        let updatedStory = { ...existingStory, ...storyData };

        const UPDATE_REQUEST = STORE.put(updatedStory);

        UPDATE_REQUEST.onsuccess = () => {
          resolve({
            ...updatedStory,
            id: id,
          });
        };

        UPDATE_REQUEST.onerror = (event: any) => {
          reject("Error updating story: " + event.target.error);
        };
      } catch (error) {
        let message = error instanceof Error ? error.message : error;
        reject(message);
      }
    };

    REQUEST.onerror = (error: any) => {
      let message = error instanceof Error ? error.message : error;
      reject(message);
    };
  });
};

const deleteStoryById = (id: number) => {
  return new Promise((resolve, reject) => {
    try {
      const REQUEST = indexedDB.open(
        dbSchema.name ?? "project-management-app",
        dbSchema.version ?? 1,
      );

      REQUEST.onsuccess = async () => {
        const DB = REQUEST.result;

        if (!DB) {
          reject("DB not found!");
          return;
        }

        const existingStory = await getStoryById(id);
        if (typeof existingStory === "string") {
          reject("Story not found!");
          return;
        }

        try {
          const TRANSACTION = DB.transaction("story", "readwrite");
          const STORE = TRANSACTION.objectStore("story");

          const DELETE_REQUEST = STORE.delete(id);

          DELETE_REQUEST.onsuccess = () => {
            resolve("Story successfully deleted!");
          };

          DELETE_REQUEST.onerror = (event: any) => {
            reject("Error deleteing story: " + event.target.error);
          };
        } catch (error) {
          let message = error instanceof Error ? error.message : error;
          reject(message);
        }
      };

      REQUEST.onerror = (error: any) => {
        let message = error instanceof Error ? error.message : error;
        reject(message);
      };
    } catch (error) {
      let message = error instanceof Error ? error.message : error;
      reject(message);
    }
  });
};

export {
  createStory,
  getAllStories,
  getStoryById,
  getStoryForProjectId,
  getStoryForUserId,
  updateStoryById,
  deleteStoryById
};
export { type StoryType };
