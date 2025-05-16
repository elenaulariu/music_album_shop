import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllOrders } from "../services/orderService";
import { fetchUserById } from "@/services/authService";
import { Button } from "@/components/ui/button";

export default function AllOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [enrichedOrders, setEnrichedOrders] = useState([]);
  const [username, setUsername] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) setUsername(storedUsername);

    const loadData = async () => {
      try {
        const [orderData, albumData] = await Promise.all([
          fetchAllOrders(token),
          fetch("http://localhost:5000/albums/").then((res) => res.json()),
        ]);
        setOrders(orderData);
        setAlbums(albumData);

        // Enrich orders with usernames
        const ordersWithUsernames = await Promise.all(
          orderData.map(async (order) => {
            try {
              const user = await fetchUserById(order.user_id);
              return { ...order, username: user.username };
            } catch {
              return { ...order, username: "Unknown" };
            }
          })
        );
        setEnrichedOrders(ordersWithUsernames);
      } catch (err) {
        console.error("Failed to load orders or albums", err);
      }
    };

    loadData();
  }, []);

  const getAlbumDetails = (albumId) =>
    albums.find((a) => a.id === albumId) || {};

  const handleLogout = () => {
    localStorage.clear();
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
          {username && (
            <>
              <span className="text-gray-700">
                Welcome, <strong>{username}</strong>
              </span>
              <Button onClick={() => navigate("/")} variant="secondary">
                Home
              </Button>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Orders */}
      <main className="w-full flex-grow px-6 py-10 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-indigo-800 mb-6">
          All Orders (Admin)
        </h2>

        {enrichedOrders.length === 0 ? (
          <p className="text-gray-600">No orders found.</p>
        ) : (
          <ul className="space-y-6">
            {enrichedOrders.map((order) => {
              const album = getAlbumDetails(order.album_id);
              return (
                <li
                  key={order.id}
                  className="bg-white border p-4 rounded-xl shadow flex gap-4"
                >
                  {/* Album Image */}
                  {album.image_url ? (
                    <img
                      src={album.image_url}
                      alt={album.title}
                      className="w-28 h-28 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-28 h-28 bg-gray-200 flex items-center justify-center rounded-md text-sm text-gray-500">
                      No Image
                    </div>
                  )}

                  {/* Album & Order Info */}
                  <div className="flex flex-col justify-between flex-grow">
                    <div>
                      <h3
                        onClick={() => navigate(`/albums/${album.id}`)}
                        className="text-lg font-semibold text-indigo-700 cursor-pointer hover:underline"
                      >
                        {album.title || "Unknown Album"}
                      </h3>
                      <p className="text-gray-600 mb-1">
                        <strong>Artist:</strong> {album.artist || "Unknown Artist"}
                      </p>
                      <p className="text-gray-600 mb-1">
                        <strong>Username:</strong> {order.username || "Unknown"}
                      </p>
                      <p className="text-gray-700">
                        <strong>Quantity:</strong> {order.quantity}
                      </p>
                      <p className="text-gray-700">
                        <strong>Total Price:</strong> ${order.total_price.toFixed(2)}
                      </p>
                      <p className="text-gray-500 text-sm">
                        <strong>Order Date:</strong>{" "}
                        {new Date(order.order_date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
