// Custom hook for checking auth and handling redirects
import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {UserContext} from '../context/contexts/UserContext';
import type { UserContextType } from '../context/contexts/UserContext';

interface UseAuthCheckOptions {
  redirectTo: string;
  when: 'authenticated' | 'unauthenticated';
}

export const useAuthCheck = (options: UseAuthCheckOptions): void => {
  const { user }: UserContextType = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = !!user;
    const shouldRedirect =
      (options.when === 'authenticated' && isAuthenticated) ||
      (options.when === 'unauthenticated' && !isAuthenticated);

    if (shouldRedirect) {
      navigate(options.redirectTo, { replace: true });
    }
  }, [user, navigate, options]);
};
