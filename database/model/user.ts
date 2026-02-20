import dbSchema from "../schema/schema";

interface UserType {
  name: string;
  email: string;
  role: string;
  password?: string;
}

const createUser = ({ name, email, role, password }: UserType) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(
      dbSchema?.name ?? "my-database",
      dbSchema?.version ?? 1,
    );

    request.onsuccess = async (event: any) => {
      const db = event?.target?.result ?? null;
      if (!db) {
        console.error("Failed to open database.");
        reject("Failed to open database.");
        return;
      }

      // create a new transaction to  add the user to the object store
      const transaction = await db.transaction(
        dbSchema.objectStores[0].name,
        "readwrite",
      );

      // get the object store and add the user
      const objectStore = transaction.objectStore(
        dbSchema.objectStores[0].name,
      );

      // index for email to check if a user with the same email already exists
      const emailIndex = await objectStore.index("email");
      const emailQuery = await emailIndex.get(email);

      emailQuery.onsuccess = async () => {
        if (emailQuery.result) {
          console.error("A user with this email already exists:", email);
          reject("A user with this email already exists.");
          return;
        } else {
          // finally add the user to the object store
          const addRequest = await objectStore.add({
            name,
            email,
            role,
            password,
          });

          addRequest.onsuccess = () => {
            console.log("User added successfully:", {
              name,
              email,
              role,
              password,
            });
            resolve("User added successfully.");
          };
          addRequest.onerror = (event: any) => {
            console.error(
              "Error adding user:",
              event?.target?.error ?? "Unknown error",
            );
            reject(event?.target?.error ?? "Unknown error");
          };
        }
      };

      emailQuery.onerror = (event: any) => {
        console.error(
          "Error finding email:",
          event?.target?.error ?? "Unknown error",
        );
        reject(event?.target?.error ?? "Unknown error");
      };
    };

    request.onerror = (event: any) => {
      console.error(
        "Error opening database:",
        event?.target?.error ?? "Unknown error",
      );
      reject(event?.target?.error ?? "Unknown error");
    };
  });
};

const getAllUsers = (db: IDBDatabase): Promise<UserType[]> => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.transaction(
      dbSchema.objectStores[0].name,
      "readonly",
    );
    const objectStore = transaction.objectStore(dbSchema.objectStores[0].name);
    const getAllRequest = objectStore.getAll();
    getAllRequest.onsuccess = () => {
      const result = getAllRequest.result as UserType[];
      const users: UserType[] = [];
      result.forEach((user) => {
        users.push({
          name: user.name,
          email: user.email,
          role: user.role,
        });
      });
      console.log("All users in the database:", users);
      resolve(users);
    };
    getAllRequest.onerror = (event: any) => {
      console.log(
        "Error getting all users:",
        event?.target?.error ?? "Unknown error",
      );
      reject(event?.target?.error ?? "Unknown error");
    };
  });
};

const getUserByEmail = (
  db: IDBDatabase,
  email: string,
): Promise<UserType | null> => {
  return new Promise(async (resolve, reject) => {
    const transaction = await db.transaction(
      dbSchema.objectStores[0].name,
      "readonly",
    );
    const objectStore = transaction.objectStore(dbSchema.objectStores[0].name);
    const emailIndex = await objectStore.index("email");
    const emailQuery = await emailIndex.get(email);

    emailQuery.onsuccess = () => {
      resolve(emailQuery.result);
    };
    emailQuery.onerror = (event: any) => {
      console.log(
        "Error getting user by email:",
        event?.target?.error ?? "Unknown error",
      );
      reject(event?.target?.error ?? "Unknown error");
    };
  });
};

const getUserById = (db: IDBDatabase, id: number): Promise<UserType | null> => {
  return new Promise(async (resolve, reject) => {
    const transaction = db.transaction(
      dbSchema.objectStores[0].name,
      "readonly",
    );
    const objectStore = transaction.objectStore(dbSchema.objectStores[0].name);
    const getUserRequest = objectStore.get(id);

    getUserRequest.onsuccess = () => {
      resolve(getUserRequest.result);
    };
    getUserRequest.onerror = (event: any) => {
      console.log(
        "Error getting user by id:",
        event?.target?.error ?? "Unknown error",
      );
      reject(event?.target?.error ?? "Unknown error");
    };
  });
};

const deleteUserById = (db: IDBDatabase, id: number) => {
  return new Promise(async (resolve, reject) => {
    const transaction = db.transaction(
      dbSchema.objectStores[0].name,
      "readwrite",
    );
    const objectStore = transaction.objectStore(dbSchema.objectStores[0].name);
    try {
      const user = await getUserById(db, id);
      if (!user) {
        console.error("User not found with id:", id);
        reject("User not found.");
        return;
      }

      if (user.role === "admin") {
        console.error("Cannot delete an admin user with id:", id);
        reject("Cannot delete an admin user.");
        return;
      }
    } catch (error) {
      console.error("Error fetching user before deletion:", error);
      reject("Error fetching user before deletion.");
      return;
    }

    const deleteRequest = objectStore.delete(id);

    deleteRequest.onsuccess = () => {
      resolve("User deleted successfully.");
    };
    deleteRequest.onerror = (event: any) => {
      console.log(
        "Error deleting user by id:",
        event?.target?.error ?? "Unknown error",
      );
      reject(event?.target?.error ?? "Unknown error");
    };
  });
};

const deleteUserByEmail = (db: IDBDatabase, email: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await getUserByEmail(db, email);
      if (!user) {
        console.error("User not found with email:", email);
        reject("User not found.");
        return;
      }

      await deleteUserById(db, user?.id ?? -1);
      resolve("User deleted successfully.");
    } catch (error) {
      reject(error);
    }
  });
};

const updateUserById = (
  db: IDBDatabase,
  id: number,
  updatedData: Partial<UserType>,
) => {
  return new Promise(async (resolve, reject) => {
    const transaction = db.transaction(
      dbSchema.objectStores[0].name,
      "readwrite",
    );
    const objectStore = transaction.objectStore(dbSchema.objectStores[0].name);
    try {
      const user = await getUserById(db, id);
      if (!user) {
        console.error("User not found with id:", id);
        reject("User not found.");
        return;
      }

      const updatedUser = { ...user, ...updatedData };
      const updateRequest = objectStore.put(updatedUser);

      updateRequest.onsuccess = () => {
        resolve(updatedUser);
      };
      updateRequest.onerror = (event: any) => {
        console.log(
          "Error updating user by id:",
          event?.target?.error ?? "Unknown error",
        );
        reject(event?.target?.error ?? "Unknown error");
      };
    } catch (error) {
      reject(error);
    }
  });
};

export {
  type UserType,
  createUser,
  getAllUsers,
  getUserByEmail,
  getUserById,
  deleteUserById,
  deleteUserByEmail,
  updateUserById,
};
