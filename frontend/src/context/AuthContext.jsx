import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On mount, check if the httpOnly cookie session is still valid
    api.get('/auth/me')
      .then(res => {
        setUser(res.data.data);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: userData } = res.data.data;
    setUser(userData);
    return userData;
  };

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Logout should always succeed client-side even if server call fails
    }
    setUser(null);
  }, []);

  const isCoordinator = user?.role === 'coordinator';
  const isHod = user?.role === 'hod';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isCoordinator, isHod, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
