import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Home({ isAdmin, isLoggedIn }) {
  const [username, setUsername] = useState(null);
  const [albums, setAlbums] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");
    if (token && storedUsername) {
      setUsername(storedUsername);
    }

    // Always fetch albums for display
    const fetchAlbums = async () => {
      try {
        const res = await fetch("http://localhost:5000/albums/");
        const data = await res.json();
        setAlbums(data);
      } catch (err) {
        console.error("Failed to fetch albums", err);
      }
    };

    fetchAlbums();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUsername(null);
    navigate("/");
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 to-white">
      {/* Header */}
      <header className="w-full flex justify-between items-center p-6 border-b bg-white shadow-sm">
  <h1
    className="text-2xl font-bold text-indigo-700 cursor-pointer"
    onClick={() => navigate("/")}
  >
    🎵 Music Shop
  </h1>
  <div className="space-x-4 flex items-center">
    {username ? (
      <>
        <span className="text-gray-700">
          Welcome, <strong>{username}</strong>
        </span>
        {isLoggedIn && (
          <Button onClick={() => navigate("/orders/my")} variant="secondary">
            My Orders
          </Button>
        )}
        {isAdmin && (
          <Button onClick={() => navigate("/admin")}>Admin Panel</Button>
        )}
        <Button onClick={handleLogout} variant="outline">
          Logout
        </Button>
      </>
    ) : (
      <>
        <Button onClick={() => navigate("/login")}>Login</Button>
        <Button onClick={() => navigate("/register")} variant="outline">
          Register
        </Button>
      </>
    )}
  </div>
</header>


      {/* Hero Section */}
      <main className="w-full flex-grow px-6 py-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-indigo-800 mb-4">
            Discover Your Next Favorite Album
          </h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Browse, buy, and manage your favorite music with our user-friendly store.
          </p>
        </div>

        {/* Album Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {albums.map((album) => (
            <div
              key={album.id}
              onClick={() => navigate(`/albums/${album.id}`)}
              className="bg-white p-4 rounded-xl shadow hover:shadow-md transition cursor-pointer"
            >
              {album.image_url ? (
                <img
                  src={album.image_url}
                  alt={album.title}
                  className="w-full h-40 object-cover rounded-md mb-3"
                />
              ) : (
                <div className="w-full h-40 bg-gray-200 rounded-md mb-3 flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}
              <h3 className="text-lg font-semibold">{album.title}</h3>
              <p className="text-gray-600">{album.artist}</p>
              <p className="text-indigo-700 font-medium mt-1">${album.price}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
