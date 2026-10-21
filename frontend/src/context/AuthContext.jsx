import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('notecraft_token');
    const saved = localStorage.getItem('notecraft_user');
    if (token && saved) {
      try {
        setUser(JSON.parse(saved));
        api.get('/auth/me')
          .then((res) => {
            setUser(res.data);
            localStorage.setItem('notecraft_user', JSON.stringify(res.data));
          })
          .catch(() => {
            localStorage.removeItem('notecraft_token');
            localStorage.removeItem('notecraft_user');
            setUser(null);
          })
          .finally(() => setLoading(false));
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('notecraft_token', data.token);
    localStorage.setItem('notecraft_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const register = async (name, email, password, role = 'subscriber') => {
    const { data } = await api.post('/auth/register', { name, email, password, role });
    localStorage.setItem('notecraft_token', data.token);
    localStorage.setItem('notecraft_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('notecraft_token');
    localStorage.removeItem('notecraft_user');
    setUser(null);
  };

  const updateProfile = async (payload) => {
    const { data } = await api.put('/auth/profile', payload);
    const updated = { ...user, ...data };
    localStorage.setItem('notecraft_user', JSON.stringify(updated));
    setUser(updated);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
