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

    REQUEST.onsuccess = async (event: any) => {
      const DB = event?.target?.result ?? null;
      if (!DB) {
        reject("Failed to open database.");
        return;
      }

      // create a new transaction to  add the user to the object store
      const TRANSACTION = await DB.transaction(
        dbSchema.objectStores[0].name,
        "readwrite",
      );

      // get the object store and add the user
      const STORE = TRANSACTION.objectStore(
        dbSchema.objectStores[0].name,
      );

      // index for email to check if a user with the same email already exists
      const EMAIL_INDEX = await STORE.index("email");
      const EMAIL_QUERY = await EMAIL_INDEX.get(email);

      EMAIL_QUERY.onsuccess = async () => {
        if (EMAIL_QUERY.result) {
          reject("A user with this email already exists.");
          return;
        } else {
          // finally add the user to the object store
          let avatar_color = createColor();
          const ADD_REQUEST = await STORE.add({
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
          ADD_REQUEST.onerror = (event: any) => {
            reject(event?.target?.error ?? "Unknown error");
          };
        }
      };

      EMAIL_QUERY.onerror = (event: any) => {
        reject(event?.target?.error ?? "Unknown error");
      };
    };

    REQUEST.onerror = (event: any) => {
      reject(event?.target?.error ?? "Unknown error");
    };
  });
};

const getAllUsers = (DB: IDBDatabase): Promise<UserType[]> => {
  return new Promise(async (resolve, reject) => {
    const TRANSACTION = await DB.transaction(
      dbSchema.objectStores[0].name,
      "readonly",
    );
    const STORE = TRANSACTION.objectStore(dbSchema.objectStores[0].name);
    const REQUEST = STORE.getAll();
    REQUEST.onsuccess = () => {
      let result = REQUEST.result;
      let users:UserType[] = [];

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
    REQUEST.onerror = (event: any) => {
      reject(event?.target?.error ?? "Unknown error");
    };
  });
};

const getUserByEmail = (
  DB: IDBDatabase,
  email: string,
): Promise<UserType | string> => {
  return new Promise(async (resolve, reject) => {
    const TRANSACTION = await DB.transaction(
      dbSchema.objectStores[0].name,
      "readonly",
    );
    const STORE = TRANSACTION.objectStore(dbSchema.objectStores[0].name);
    const EMAIL_INDEX =  STORE.index("email");
    const EMAIL_QUERY = EMAIL_INDEX.get(email);

    EMAIL_QUERY.onsuccess = () => {
      let result = EMAIL_QUERY.result;
      resolve(result);
    };
    EMAIL_QUERY.onerror = (event: any) => {
      reject(event?.target?.error ?? "Unknown error");
    };
  });
};

const getUserById = (DB: IDBDatabase, id: number): Promise<UserType|string> => {
  return new Promise(async (resolve, reject) => {
    const TRANSACTION = DB.transaction(
      dbSchema.objectStores[0].name,
      "readonly",
    );
    const STORE = TRANSACTION.objectStore(dbSchema.objectStores[0].name);
    const REQUEST = STORE.get(id);

    REQUEST.onsuccess = () => {
      let result = REQUEST.result;
      resolve({
        name: result.name,
        role: result.role,
        avatar_color: result.avatar_color,
        email: result.email,
      });
    };
    REQUEST.onerror = (event: any) => {
      reject(event?.target?.error ?? "Unknown error");
    };
  });
};

const deleteUserById = (DB: IDBDatabase, id: number): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const TRANSACTION = DB.transaction(
      dbSchema.objectStores[0].name,
      "readwrite",
    );
    const STORE = TRANSACTION.objectStore(dbSchema.objectStores[0].name);
    try {
      let user = await getUserById(DB, id);
      if (!user || typeof user ==="string") {
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
    DELETE_REQUEST.onerror = (event: any) => {
      reject(event?.target?.error ?? "Unknown error");
    };
  });
};

const deleteUserByEmail = (DB: IDBDatabase, email: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await getUserByEmail(DB, email);
      if (!user || typeof user ==="string") {
        reject("User not found.");
        return;
      }

      await deleteUserById(DB, user?.id ?? -1);
      resolve("User deleted successfully.");
    } catch (error) {
      reject(error);
    }
  });
};

const updateUserById = (
  DB: IDBDatabase,
  id: number,
  updatedData: Partial<UserType>,
) : Promise<UserType | string> => {
  return new Promise(async (resolve, reject) => {
    const TRANSACTION = DB.transaction(
      dbSchema.objectStores[0].name,
      "readwrite",
    );
    const STORE = TRANSACTION.objectStore(dbSchema.objectStores[0].name);
    try {
      let user = await getUserById(DB, id);
      if (!user || typeof user ==="string") {
        reject("User not found.");
        return;
      }

      let updatedUser = { ...user, ...updatedData };
      const UPDATE_REQUEST = STORE.put(updatedUser);

      UPDATE_REQUEST.onsuccess = () => {
        resolve(updatedUser);
      };
      UPDATE_REQUEST.onerror = (event: any) => {
        reject(event?.target?.error ?? "Unknown error");
      };
    } catch (error) {
      reject(error);
    }
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
        let user = await getUserByEmail(DB, email);
        if (!user || typeof user ==="string") {
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
