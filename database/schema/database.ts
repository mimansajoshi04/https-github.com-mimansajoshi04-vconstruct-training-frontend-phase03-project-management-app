import dbSchema from "./schema";
import schemaValues from "./schemaValues";

// Simplified database opener that always creates the schema and resolves or rejects the
// returned promise.  The previous implementation relied on `indexedDB.databases()` which is
// not available in every browser and, when it threw, the promise was left pending and the
// calling code never received a result.  That caused the app to hang and no database would
// show up in DevTools.
const getDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const REQUEST = indexedDB.open(dbSchema.name, dbSchema.version);

    REQUEST.onupgradeneeded = (event: any) => {
      const DB = event?.target?.result ?? null;
      if (!DB) {
        reject(new Error("Failed to open database during upgrade."));
        return;
      }

      dbSchema.objectStores.forEach((store) => {
        if (!DB.objectStoreNames.contains(store.name)) {
          const STORE = DB.createObjectStore(store.name, store.options);
          store.indexes.forEach((index) => {
            STORE.createIndex(index.name, index.keyPath, index.options);
          });
        }
      });
    };

    REQUEST.onsuccess = async (event: any) => {
      const DB = event?.target?.result ?? null;
      if (!DB) {
        reject(new Error("Failed to open database."));
        return;
      }

      // ensure we always have an admin user after the database is opened for the first time
      try {
        const tx = DB.transaction(dbSchema.objectStores[0].name, "readwrite");
        const store = tx.objectStore(dbSchema.objectStores[0].name);
        const emailIndex = store.index("email");
        const checkReq = emailIndex.get(schemaValues.users.admin.email);

        checkReq.onsuccess = () => {
          if (!checkReq.result) {
            // no admin present yet, try to add one
            store.add(schemaValues.users.admin).onerror = (err: unknown) => {
              // if this fails we don't want to block the promise – just log
              console.error("Failed to add default admin user:", err);
            };
          }
        };
        checkReq.onerror = (err: unknown) => {
          console.error("Error checking for admin user:", err);
        };
      } catch (err) {
        console.error("Error setting up default admin:", err);
      }

      resolve(DB);
    };

    REQUEST.onerror = (event: any) => {
      reject(
        event?.target?.error ?? new Error("Unknown error opening database."),
      );
    };
  });
};

export { getDB };
