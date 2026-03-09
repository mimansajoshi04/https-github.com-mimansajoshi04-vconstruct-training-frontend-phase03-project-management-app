import { useEffect } from "react";
import { getDB } from "../../database/schema/database";

export const useInitializeDB = () => {
  useEffect(() => {
    const initialize = async () => {
      try {
        await getDB();
      } catch (err) {
        // handle error
      }
    };
    initialize();
  }, []);
};
