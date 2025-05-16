import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';  // Admin Page
import CreateAlbumPage from './pages/CreateAlbumPage'; // New Page for Album Creation
import EditAlbumPage from './pages/EditAlbumPage';
import { checkTokenValidity } from './services/authService';
import AlbumDetailPage from "./pages/AlbumDetailPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import AllOrdersPage from "./pages/AllOrdersPage";



function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Run on mount to check token validity and user role
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoggedIn(false);
        setIsAdmin(false);
        return;
      }

      const validToken = await checkTokenValidity();
      setIsLoggedIn(validToken);

      if (validToken) {
        try {
          const res = await fetch("http://localhost:5000/admin-only", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setIsAdmin(res.ok); // Admin-only endpoint returns 200 for admins
        } catch (err) {
          setIsAdmin(false); // If there's an error, assume user isn't admin
        }
      }
    };

    checkAuth();
  }, []);

  // PrivateRoute to protect access to certain pages
  const PrivateRoute = ({ children }) => {
    return isLoggedIn ? children : <Navigate to="/login" />;
  };

  // AdminRoute to protect access to admin pages
  const AdminRoute = ({ children }) => {
    return isLoggedIn && isAdmin ? children : <Navigate to="/" />;
  };

  // Handle login success (called after successful login)
  const handleLoginSuccess = async () => {
    const valid = await checkTokenValidity();
    setIsLoggedIn(valid);

    if (valid) {
      const res = await fetch("http://localhost:5000/admin-only", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setIsAdmin(res.ok);
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage isAdmin={isAdmin} isLoggedIn={isLoggedIn} />} />

        {/* Auth Routes */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage onLogin={handleLoginSuccess} />} />

        {/* Admin Route */}
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

        {/* Create Album Route */}
        <Route path="/create-album" element={<AdminRoute><CreateAlbumPage /></AdminRoute>} />

        {/* Edit Album Route */}
        <Route path="/admin/edit/:id" element={<AdminRoute><EditAlbumPage /></AdminRoute>} />

        <Route path="/albums/:id" element={<AlbumDetailPage isAdmin={isAdmin} />} />

        <Route path="/orders/my" element={<PrivateRoute><MyOrdersPage /></PrivateRoute>} />
        <Route path="/orders/all" element={<AdminRoute><AllOrdersPage /></AdminRoute>} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;
