import { useContext, useState, useCallback } from 'react';

import DBContext from '../context/contexts/DBContext';
import {UserContext} from '../context/contexts/UserContext';
import type { UserContextType } from '../context/contexts/UserContext';
import { getAllDataForAdminUser } from '../admin/services/getData';
import { getAllDataForUser } from '../user/services/getData';
import type { ProjectDataStructure } from '../types';

interface UseProjectDataReturn {
  projects: ProjectDataStructure | null;
  loading: boolean;
  error: Error | null;
  fetchProjects: () => Promise<void>;
}

export const useProjectData = (): UseProjectDataReturn => {
  const db = useContext(DBContext);
  const { user }: UserContextType = useContext(UserContext);
  
  const [projects, setProjects] = useState<ProjectDataStructure | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      if(!db)
        return;

      const data = user.role === 'admin' 
        ? await getAllDataForAdminUser(db)
        : await getAllDataForUser(db, user.id);
      
      setProjects(data.projectData || {});
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  }, [db, user?.id, user?.role]);

  return { projects, loading, error, fetchProjects };
};
