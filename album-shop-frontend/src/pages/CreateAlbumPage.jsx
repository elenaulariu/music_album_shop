import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createAlbum } from "../services/albumService";

export default function CreateAlbumPage() {
  const [albumData, setAlbumData] = useState({
    title: "",
    artist: "",
    release_date: "",
    genre: "",
    price: "",
    quantity: "",
    image_url: "",
  });

  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAlbumData({ ...albumData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await createAlbum(albumData, token);
      navigate("/admin");
    } catch (err) {
      console.error("Failed to create album", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-indigo-50 to-white flex flex-col">
      {/* Header */}
      <header className="w-full flex justify-between items-center p-6 border-b bg-white shadow-sm">
        <h1
          className="text-2xl font-bold text-indigo-700 cursor-pointer"
          onClick={() => navigate("/")}
        >
          🎵 Music Shop
        </h1>
        <div className="space-x-4 flex items-center">
          {username && (
            <>
              <span className="text-gray-700">
                Welcome, <strong>{username}</strong>
              </span>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Form Section */}
      <main className="max-w-2xl w-full mx-auto p-6">
        <h2 className="text-3xl font-bold text-indigo-800 mb-6">Create New Album</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Title", name: "title", type: "text" },
            { label: "Artist", name: "artist", type: "text" },
            { label: "Release Date", name: "release_date", type: "date" },
            { label: "Genre", name: "genre", type: "text" },
            { label: "Price", name: "price", type: "number" },
            { label: "Quantity", name: "quantity", type: "number" },
            { label: "Image URL (Optional)", name: "image_url", type: "text" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={albumData[field.name]}
                onChange={handleChange}
                className="w-full border rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                required={field.name !== "image_url"}
              />
            </div>
          ))}

          <Button type="submit" className="w-full mt-4">
            Create Album
          </Button>
        </form>
      </main>
    </div>
  );
}
