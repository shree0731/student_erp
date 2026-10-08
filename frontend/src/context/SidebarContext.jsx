import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('spike_sidebar_collapsed');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('spike_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    return {
      collapsed: false,
      setCollapsed: () => {},
      toggleSidebar: () => {}
    };
  }
  return context;
};
