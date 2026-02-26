import dbSchema from "./schema";
import schemaValues from "./schemaValues";

import { createUser } from "../model/user";

const createDB = async (): Promise<IDBDatabase | string> => {
  return new Promise((resolve, reject) => {
    const REQUEST = indexedDB.open(dbSchema.name, dbSchema.version);

    REQUEST.onupgradeneeded = (event: any) => {
      const DB = event?.target?.result ?? null;
      if (!DB) {
        reject("Failed to open database.");
      }
      dbSchema.objectStores.forEach((store) => {
        if (!DB.objectStoreNames.contains(store.name)) {
          const STORE = DB.createObjectStore(store.name, store.options);
          store.indexes.forEach(async (index) => {
            await STORE.createIndex(
              index.name,
              index.keyPath,
              index.options,
            );
          });
        }
      });
    };

    REQUEST.onsuccess = async () => {
      try {
        try {
          let response = await createUser(schemaValues.users.admin);
          if (!response) reject("Failed to create admin user.");
          const DB = REQUEST.result;
          resolve(DB);
        } catch (error) {
          indexedDB.deleteDatabase(dbSchema.name);
          reject("Error creating admin user, database reset.");
        }
      } catch (error) {
        indexedDB.deleteDatabase(dbSchema.name);
        reject("Error creating admin user, database reset.");
      }
    };
    REQUEST.onerror = (event: any) => {
      reject(event?.target?.error ?? "Unknown error");
    };
  });
};

const getDB = async (): Promise<IDBDatabase|string> => {
  return new Promise(async (resolve, reject) => {
    try {
      let databases = await indexedDB.databases();
      let myDataBase = databases.find((db) => db.name === dbSchema.name);
      if (!myDataBase) {
        try {
          let response = await createDB();
          if (!response || typeof response==="string") {
            reject("Failed to create database.");
            return;
          }
          resolve(response);
        } catch (error) {
          reject("Error creating database.");
        }
      } else {
        const REQUEST = indexedDB.open(dbSchema.name, dbSchema.version);

        REQUEST.onsuccess = (event: any) => {
          const DB = event?.target?.result ?? null;
          if (!DB) {
            reject("Failed to open database.");
            return;
          }
          resolve(DB);
        };
      }
    } catch (error) {
      console.error("Error fetching databases:", error);
    }
  });
};

export { createDB, getDB };
