import { createColor } from "../createAvatar";
import dbSchema from "../schema/schema";

interface UserType {
  id?: number;
  name: string;
  email: string;
  role: string;
  password?: string;
  avatar_color?: string;
}

const createUser = ({
  name,
  email,
  role,
  password,
}: UserType): Promise<UserType | string> => {
  return new Promise((resolve, reject) => {
    const REQUEST = indexedDB.open(
      dbSchema?.name ?? "my-database",
      dbSchema?.version ?? 1,
    );

    REQUEST.onsuccess = async () => {
      const DB = REQUEST.result;
      if (!DB) {
        reject("Failed to open database.");
        return;
      }

      // create a new transaction to  add the user to the object store
      const TRANSACTION = DB.transaction(
        dbSchema.objectStores[0].name,
        "readwrite",
      );

      // get the object store and add the user
      const STORE = TRANSACTION.objectStore(dbSchema.objectStores[0].name);

      // index for email to check if a user with the same email already exists
      const EMAIL_INDEX = STORE.index("email");
      const EMAIL_QUERY = EMAIL_INDEX.get(email);

      EMAIL_QUERY.onsuccess = async () => {
        if (EMAIL_QUERY.result) {
          reject("A user with this email already exists.");
          return;
        } else {
          // finally add the user to the object store
          let avatar_color = createColor();
          const ADD_REQUEST = STORE.add({
            name,
            email,
            role,
            password,
            avatar_color,
          });

          ADD_REQUEST.onsuccess = () => {
            resolve({
              name: name,
              email: email,
              role: role,
              avatar_color: avatar_color,
            });
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
        }
      };

      EMAIL_QUERY.onerror = (error: unknown) => {
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

const getAllUsers = (): Promise<UserType[]> => {
  return new Promise(async (resolve, reject) => {
    const DB_REQUEST = indexedDB.open(
      dbSchema.name ?? "project-management-app",
      dbSchema.version ?? 1,
    );

    DB_REQUEST.onsuccess = () => {
      const DB = DB_REQUEST.result;
      const TRANSACTION = DB.transaction(
        dbSchema.objectStores[0].name,
        "readonly",
      );
      const STORE = TRANSACTION.objectStore(dbSchema.objectStores[0].name);
      const REQUEST = STORE.getAll();
      REQUEST.onsuccess = () => {
        let result = REQUEST.result;
        let users: UserType[] = [];

        result.forEach((user) => {
          users.push({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar_color: user.avatar_color,
          });
        });
        resolve(users);
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

const getUserByEmail = (email: string): Promise<UserType | string> => {
  return new Promise(async (resolve, reject) => {
    const DB_REQUEST = indexedDB.open(
      dbSchema.name ?? "project-management-app",
      dbSchema.version ?? 1,
    );

    DB_REQUEST.onsuccess = () => {
      const DB = DB_REQUEST.result;
      const TRANSACTION = DB.transaction(
        dbSchema.objectStores[0].name,
        "readonly",
      );
      const STORE = TRANSACTION.objectStore(dbSchema.objectStores[0].name);
      const EMAIL_INDEX = STORE.index("email");
      const EMAIL_QUERY = EMAIL_INDEX.get(email);

      EMAIL_QUERY.onsuccess = () => {
        let result = EMAIL_QUERY.result;
        resolve(result);
      };
      EMAIL_QUERY.onerror = (error: unknown) => {
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

const getUserById = (id: number): Promise<UserType | string> => {
  return new Promise(async (resolve, reject) => {
    const DB_REQUEST = indexedDB.open(
      dbSchema.name ?? "project-management-app",
      dbSchema.version ?? 1,
    );

    DB_REQUEST.onsuccess = () => {
      const DB = DB_REQUEST.result;
      const TRANSACTION = DB.transaction(
        dbSchema.objectStores[0].name,
        "readonly",
      );
      const STORE = TRANSACTION.objectStore(dbSchema.objectStores[0].name);
      const REQUEST = STORE.get(id);

      REQUEST.onsuccess = () => {
        let result = REQUEST.result;
        if (!result) {
          reject("User not found!");
          return;
        }
        resolve({
          name: result.name,
          role: result.role,
          avatar_color: result.avatar_color,
          email: result.email,
          password: result.password,
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

const deleteUserById = (id: number): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const DB_REQUEST = indexedDB.open(
      dbSchema.name ?? "project-management-app",
      dbSchema.version ?? 1,
    );

    DB_REQUEST.onsuccess = async () => {
      const DB = DB_REQUEST.result;
      const TRANSACTION = DB.transaction(
        dbSchema.objectStores[0].name,
        "readwrite",
      );
      const STORE = TRANSACTION.objectStore(dbSchema.objectStores[0].name);
      try {
        let user = await getUserById(id);
        if (!user || typeof user === "string") {
          reject("User not found.");
          return;
        }

        if (user?.role === "admin") {
          reject("Cannot delete an admin user.");
          return;
        }
      } catch (error) {
        reject("Error fetching user before deletion.");
        return;
      }

      const DELETE_REQUEST = STORE.delete(id);

      DELETE_REQUEST.onsuccess = () => {
        resolve("User deleted successfully.");
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

const deleteUserByEmail = (email: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await getUserByEmail(email);
      if (!user || typeof user === "string") {
        reject("User not found.");
        return;
      }

      await deleteUserById(user?.id ?? -1);
      resolve("User deleted successfully.");
    } catch (error) {
      reject(error);
    }
  });
};

const updateUserById = (
  id: number,
  updatedData: Partial<UserType>,
): Promise<UserType | string> => {
  return new Promise(async (resolve, reject) => {
    let user = await getUserById(id);
    if (!user || typeof user === "string") {
      reject("User not found.");
      return;
    }

    const DB_REQUEST = indexedDB.open(
      dbSchema.name ?? "project-management-app",
      dbSchema.version ?? 1,
    );

    DB_REQUEST.onsuccess = async () => {
      const DB = DB_REQUEST.result;
      const TRANSACTION = DB.transaction(
        dbSchema.objectStores[0].name,
        "readwrite",
      );
      const STORE = TRANSACTION.objectStore(dbSchema.objectStores[0].name);
      try {
        let updatedUser = {
          id: id,
          ...user,
          ...updatedData,
        };
        const UPDATE_REQUEST = STORE.put(updatedUser);

        UPDATE_REQUEST.onsuccess = () => {
          resolve(updatedUser);
        };
        UPDATE_REQUEST.onerror = (error: any) => {
          console.log(error.target);

          if (error instanceof Error) {
            reject(error.message);
            return;
          }

          if (typeof error === "string") {
            reject(error);
            return;
          }
        };
      } catch (error) {
        reject(error);
      }
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

const loginUser = ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<UserType | string> => {
  return new Promise((resolve, reject) => {
    const REQUEST = indexedDB.open(dbSchema?.name ?? "my-database");

    REQUEST.onsuccess = async (event: any) => {
      const DB = event?.target?.result ?? null;
      if (!DB) {
        reject("DB not found");
        return;
      }

      try {
        let user = await getUserByEmail(email);
        if (!user || typeof user === "string") {
          reject("User not found!");
          return;
        }

        if (user.password === password)
          resolve({
            id: user.id,
            name: user.name,
            role: user.role,
            email: user.email,
            avatar_color: user.avatar_color,
          });

        reject("Incorrect Password");
      } catch (error) {
        reject(error);
      }
    };
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
  loginUser,
};
