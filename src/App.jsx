import React, { useState, useEffect } from 'react';
import { 
  createBrowserRouter, 
  RouterProvider, 
  Navigate,
} from 'react-router-dom';

import { RootLayout } from './layouts/RootLayout';
import { Dashboard } from './pages/Dashboard';
import { ProductsPage } from './pages/ProductsPage';
import { OperationsPage } from './pages/OperationsPage';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';

// --- AUTH MOCK SETUP ---
// We use simple state management for demonstration without a real backend.

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(true); // Always ready as no async Firebase needed
  const [notification, setNotificationState] = useState({ message: null, type: null });

  // Centralized Notification Handler - exposed globally for Login/Signup components
  const setNotification = (message, type) => {
    setNotificationState({ message, type });
  };
  window.setNotification = setNotification; 

  // Mock Login/Logout handlers for RootLayout to pass down
  const handleLogin = (userEmail) => {
    setIsAuthenticated(true);
    setCurrentUser({ uid: 'mock-user-123', email: userEmail });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setNotification('Logged out successfully.', 'info');
  };
  
  // Expose mock login handler globally for the pages (Login/Signup) to trigger authentication state change
  window.handleAppLogin = handleLogin; 


  // Show a loading screen until the initial auth check is complete
  if (!authReady) {
    return (
        <div className="min-h-screen bg-indigo-600 flex items-center justify-center">
            <h1 className="text-white text-2xl font-bold">Loading Application...</h1>
        </div>
    );
  }

  const router = createBrowserRouter([
    {
      path: "/login",
      // Route to login page only if NOT authenticated
      element: !isAuthenticated ? <Login /> : <Navigate to="/" />,
    },
    {
      path: "/signup", 
      // Route to signup page only if NOT authenticated
      element: !isAuthenticated ? <Signup /> : <Navigate to="/" />,
    },
    {
      path: "/",
      // Protected route: Redirect to login if NOT authenticated
      element: isAuthenticated ? (
          <RootLayout 
            user={currentUser} 
            onLogout={handleLogout}
            setNotification={setNotification}
            notification={notification}
          />
        ) : (
          <Navigate to="/login" />
        ),
      children: [
        {
          index: true,
          element: <Dashboard />,
        },
        {
          path: "products",
          element: <ProductsPage />,
        },
        {
          path: "operations/:type",
          element: <OperationsPage />,
        },
        {
          path: "history",
          element: <OperationsPage />, 
        }
      ]
    }
  ]);

  return <RouterProvider router={router} />;
}