import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();


export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('user');
    if (!token) return null;
    try {
      return { token, ...(userInfo ? JSON.parse(userInfo) : {}) };
    } catch {
      return { token };
    }
  });

  const login = (userData) => {
    // userData: { token, ...user fields }
    setUser(userData);
    localStorage.setItem('token', userData.token);
    // Remove password if present
    const { password, token, ...userFields } = userData;
    localStorage.setItem('user', JSON.stringify(userFields));
  };


  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Update user info in context and localStorage after profile update
  const updateUser = (updatedUser) => {
    setUser(prev => {
      if (!prev) return prev;
      const newUser = { ...prev, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return newUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
