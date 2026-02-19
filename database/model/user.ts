import dbSchema from "../schema/schema";

interface UserType {
  id?: number;
  name: string;
  email: string;
  role: string;
}

const createUser = ({ name, email, role }: Omit<UserType, "id">) => {
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
          const addRequest = await objectStore.add({ name, email, role });

          addRequest.onsuccess = () => {
            console.log("User added successfully:", { name, email, role });
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

export { type UserType, createUser };
