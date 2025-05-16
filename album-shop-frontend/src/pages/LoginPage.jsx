import { useState } from "react";
import { Button } from "@/components/ui/button";  // Assuming you're using a Button component
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";  // Assuming you have a login function in the auth service

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Login and get both access_token and username
      const { access_token, username } = await login({ email, password });

      // Store token and username in localStorage
      localStorage.setItem("token", access_token);
      localStorage.setItem("username", username);  // Store the username

      // Call onLogin to update the app state
      onLogin();

      // Redirect to homepage after successful login
      navigate("/"); 
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 to-white">
      {/* Header */}
      <header className="w-full flex justify-between items-center p-6 border-b bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-indigo-700">🎵 Music Shop</h1>
        <div className="space-x-4">
          <Button onClick={() => navigate("/register")} variant="outline">
            Register
          </Button>
        </div>
      </header>

      {/* Login Form Section */}
      <main className="w-full flex-grow flex flex-col items-center justify-center text-center px-6 py-12">
        <h2 className="text-4xl md:text-5xl font-extrabold text-indigo-800 mb-4">
          Welcome Back!
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Please log in to continue to your account.
        </p>

        {error && <p className="text-red-500 text-lg mb-4">{error}</p>}

        <form
          onSubmit={handleLogin}
          className="w-full max-w-md bg-white p-8 rounded-lg shadow-md"
        >
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-lg font-medium text-gray-700"
            >
              Email
            </label>
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
            <label
              htmlFor="password"
              className="block text-lg font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>

        <p className="mt-4 text-gray-600">
          Don't have an account?{" "}
          <Button variant="outline" onClick={() => navigate("/register")}>
            Register
          </Button>
        </p>
      </main>
    </div>
  );
}
