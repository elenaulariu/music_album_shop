import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout(); // Call the logout function
    navigate('/login'); // Redirect to login page
  };

  return <button onClick={handleLogout}>Logout</button>;
}

export default LogoutButton;
