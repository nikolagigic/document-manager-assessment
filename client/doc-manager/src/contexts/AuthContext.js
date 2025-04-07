import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
      // Fetch user data when token is available
      fetchUserData();
    } else {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [token]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/token/verify/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token })
      });

      if (response.ok) {
        const data = await response.json();
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:8001/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      setToken(data.access);
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const getAuthHeader = () => {
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  // Initialize user data from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout, getAuthHeader, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 