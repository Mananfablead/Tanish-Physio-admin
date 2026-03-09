import React, { createContext, useContext, ReactNode } from 'react';
import useCsrfToken from '../hooks/useCsrfToken';

interface CsrfContextType {
  csrfToken: string;
  isLoading: boolean;
  error: Error | null;
  fetchCsrfToken: () => Promise<string>;
  getToken: () => string | null;
  clearToken: () => void;
}

const CsrfContext = createContext<CsrfContextType | undefined>(undefined);

export const CsrfProvider = ({ children }: { children: ReactNode }) => {
  const {
    csrfToken,
    isLoading,
    error,
    fetchCsrfToken,
    getToken,
    clearToken,
  } = useCsrfToken();

  return (
    <CsrfContext.Provider
      value={{
        csrfToken,
        isLoading,
        error,
        fetchCsrfToken,
        getToken,
        clearToken,
      }}
    >
      {children}
    </CsrfContext.Provider>
  );
};

export const useCsrf = () => {
  const context = useContext(CsrfContext);
  if (context === undefined) {
    throw new Error('useCsrf must be used within a CsrfProvider');
  }
  return context;
};
