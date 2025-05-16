import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService"; // Assuming you have a register function in the auth service

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");  // Default role as user
  const [adminCode, setAdminCode] = useState("");  // Admin code input
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
  e.preventDefault();

  // Collecting user input
  const data = {
    username,
    email,
    password,
    role,
    admin_code: role === "admin" ? adminCode : undefined, // Only include admin_code if role is admin
  };

  try {
    await register(data);  // Assuming this hits the /register route on your backend
    navigate("/login");  // Redirect to login after successful registration
  } catch (err) {
    // Check if the error message matches the "User already exists" error
    if (err.message === "User already exists") {
      setError("This username or email is already registered. Please try again.");
    } else {
      // Handle other errors (e.g., server errors, network issues)
      setError(err.message || "Registration failed. Please try again.");
    }
  }
};

  return (
    <div className="w-full min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 to-white">
      {/* Header */}
      <header className="w-full flex justify-between items-center p-6 border-b bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-indigo-700">🎵 Music Shop</h1>
        <div className="space-x-4">
          <Button onClick={() => navigate("/login")}>Login</Button>
          <Button onClick={() => navigate("/register")} variant="outline">
            Register
          </Button>
        </div>
      </header>

      {/* Registration Form Section */}
      <main className="w-full flex-grow flex flex-col items-center justify-center text-center px-6 py-12">
        <h2 className="text-4xl md:text-5xl font-extrabold text-indigo-800 mb-4">
          Create Your Account
        </h2>
        {error && <p className="text-red-500 text-lg mb-4">{error}</p>} {/* Display error message */}

        <form onSubmit={handleRegister} className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
          <div className="mb-4">
            <label htmlFor="username" className="block text-lg font-medium text-gray-700">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-lg font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-lg font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="role" className="block text-lg font-medium text-gray-700">Register as Admin?</label>
            <input
              id="role"
              type="checkbox"
              checked={role === "admin"}
              onChange={(e) => setRole(e.target.checked ? "admin" : "user")}
            />
            {role === "admin" && (
              <div>
                <label htmlFor="adminCode" className="block text-lg font-medium text-gray-700">Admin Code</label>
                <input
                  id="adminCode"
                  type="text"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            )}
          </div>

          <Button type="submit" className="w-full">Register</Button>
        </form>

        <p className="mt-4 text-gray-600">
          Already have an account? 
          <Button variant="outline" onClick={() => navigate("/login")}>Login</Button>
        </p>
      </main>
    </div>
  );
}
