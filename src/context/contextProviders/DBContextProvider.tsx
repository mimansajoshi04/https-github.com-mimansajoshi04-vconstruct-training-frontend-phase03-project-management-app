// External Libraries
import { useEffect, useState,type  ReactNode } from 'react';

// Contexts
import DBContext from '../contexts/DBContext';

// Database
import { getDB } from '../../../database/schema/database';

interface DBContextProviderProps {
  children: ReactNode;
}

export default function DBContextProvider({
  children,
}: DBContextProviderProps): ReactNode {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeDB = async () => {
      try {
        const database = await getDB();
        if(typeof database === "string"){
          setDb(null);
        }else{
        setDb(database);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
      }
    };
    initializeDB();
  }, []);

  if (error) {
    return <div>Error initializing database: {error.message}</div>;
  }

  return <DBContext.Provider value={db}>{children}</DBContext.Provider>;
}
