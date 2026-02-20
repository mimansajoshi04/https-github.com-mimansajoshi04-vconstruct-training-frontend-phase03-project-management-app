import dbSchema from "./schema";
import schemaValues from "./schemaValues";

import { createUser } from "../model/user";

const createDB = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbSchema.name, dbSchema.version);

    request.onupgradeneeded = (event: any) => {
      const db = event?.target?.result ?? null;
      if (!db) {
        console.error("Failed to open database.");
        reject("Failed to open database.");
      }
      dbSchema.objectStores.forEach((store) => {
        if (!db.objectStoreNames.contains(store.name)) {
          const objectStore = db.createObjectStore(store.name, store.options);
          store.indexes.forEach(async (index) => {
            await objectStore.createIndex(
              index.name,
              index.keyPath,
              index.options,
            );
          });
        }
      });
    };

    request.onsuccess = async () => {
      try {
        try {
          const response = await createUser(schemaValues.users.admin);
          if (!response) reject("Failed to create admin user.");
          const db = request.result;
          resolve(db);
        } catch (error) {
          console.error("Error creating admin user:", error);
          indexedDB.deleteDatabase(dbSchema.name);
          reject("Error creating admin user, database reset.");
        }
      } catch (error) {
        console.error("Error creating admin user:", error);
        indexedDB.deleteDatabase(dbSchema.name);
        reject("Error creating admin user, database reset.");
      }
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

const getDB = async (): Promise<IDBDatabase> => {
  return new Promise(async (resolve, reject) => {
    try {
      const databases = await indexedDB.databases();
      const myDataBase = databases.find((db) => db.name === dbSchema.name);
      if (!myDataBase) {
        try {
          const response = await createDB();
          if (!response) reject("Failed to create database.");
          resolve(response);
        } catch (error) {
          console.error("Error creating database:", error);
          reject("Error creating database.");
        }
      } else {
        const request = indexedDB.open(dbSchema.name, dbSchema.version);

        request.onsuccess = (event: any) => {
          const db = event?.target?.result ?? null;
          if (!db) {
            console.error("Failed to open database.");
            reject("Failed to open database.");
            return;
          }
          resolve(db);
        };
      }
    } catch (error) {
      console.error("Error fetching databases:", error);
    }
  });
};

export { createDB, getDB };
