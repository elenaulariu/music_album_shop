import { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { fetchAlbums, deleteAlbum } from "../services/albumService";
import { fetchAllOrders } from "../services/orderService";
import { fetchAllReviews } from "../services/reviewService";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#6366f1", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#3b82f6"];

export default function AdminPage() {
  const [albums, setAlbums] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [username, setUsername] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");

    if (token && storedUsername) {
      setUsername(storedUsername);
    }

    const loadData = async () => {
      if (!token) return;

      try {
        const [albumData, orderData, reviewData] = await Promise.all([
          fetchAlbums(token),
          fetchAllOrders(token),
          fetchAllReviews(token),
        ]);
        setAlbums(albumData);
        setOrders(orderData);
        setReviews(reviewData);
      } catch (err) {
        console.error("Failed to load albums, orders, or reviews", err);
      }
    };

    loadData();
  }, []);

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await deleteAlbum(id, token);
      setAlbums((prev) => prev.filter((album) => album.id !== id));
    } catch (err) {
      console.error("Failed to delete album", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUsername(null);
    navigate("/");
  };

  const salesOverTime = (() => {
    const map = {};
    orders.forEach(({ order_date, total_price }) => {
      const date = new Date(order_date).toISOString().slice(0, 10);
      map[date] = (map[date] || 0) + total_price;
    });
    return Object.entries(map)
      .map(([date, total]) => ({ date, total: Number(total.toFixed(2)) }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  })();

  const topSellingAlbums = (() => {
    return albums
      .map((album) => {
        const totalSold = orders
          .filter((o) => o.album_id === album.id)
          .reduce((sum, o) => sum + o.quantity, 0);
        return { title: album.title, totalSold };
      })
      .filter((item) => item.totalSold > 0)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 10);
  })();

  const ordersByUser = (() => {
    const map = {};
    orders.forEach(({ user_id }) => {
      map[user_id] = (map[user_id] || 0) + 1;
    });
    return Object.entries(map)
      .map(([user, count]) => ({ user, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  })();

  const averageRatingPerAlbum = (() => {
    const map = {};
    reviews.forEach(({ album_id, rating }) => {
      if (!map[album_id]) map[album_id] = { totalRating: 0, count: 0 };
      map[album_id].totalRating += rating;
      map[album_id].count++;
    });

    return albums
      .map((album) => {
        const data = map[album.id];
        if (!data) return null;
        return {
          title: album.title,
          avgRating: Number((data.totalRating / data.count).toFixed(2)),
          reviewCount: data.count,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.avgRating - a.avgRating)
      .slice(0, 10);
  })();

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
              <Button onClick={() => navigate("/")}>Home</Button>
              <Button onClick={handleLogout} variant="outline">
                Logout
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex flex-col px-6 py-10 space-y-10 max-w-7xl mx-auto">
        {/* Dashboard Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-3xl font-bold text-indigo-800">Admin Dashboard</h2>
          <div className="flex gap-3">
            <Button onClick={() => navigate("/create-album")}>Create Album</Button>
            <Button onClick={() => navigate("/orders/all")} variant="secondary">
              All Orders
            </Button>
          </div>
        </div>

        {/* Charts */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ChartCard title="📈 Sales Over Time">
            {salesOverTime.length === 0 ? (
              <NoData />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={salesOverTime}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="💿 Top Selling Albums">
            {topSellingAlbums.length === 0 ? (
              <NoData />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topSellingAlbums}>
                  <XAxis
                    dataKey="title"
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                    height={60}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalSold" fill="#6366f1" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="👥 Orders by User">
            {ordersByUser.length === 0 ? (
              <NoData />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={ordersByUser}
                    dataKey="count"
                    nameKey="user"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {ordersByUser.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="⭐ Avg Album Ratings">
            {averageRatingPerAlbum.length === 0 ? (
              <NoData />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={averageRatingPerAlbum}>
                  <XAxis
                    dataKey="title"
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                    height={60}
                  />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Bar dataKey="avgRating" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </section>

        {/* Albums List */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-indigo-700">All Albums</h3>
          {albums.length === 0 ? (
            <p className="text-gray-500">No albums found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {albums.map((album) => (
                <div
                  key={album.id}
                  className="border rounded-xl p-4 shadow-sm hover:shadow-md transition bg-white flex flex-col justify-between h-full cursor-pointer"
                  onClick={() => navigate(`/albums/${album.id}`)}
                >
                  {album.image_url ? (
                    <img
                      src={album.image_url}
                      alt={album.title}
                      className="w-full h-40 object-cover rounded-md mb-3"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-100 rounded-md mb-3 flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold">{album.title}</h4>
                    <p className="text-gray-600">{album.artist}</p>
                  </div>
                  <div className="mt-3 flex justify-between gap-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/edit/${album.id}`);
                      }}
                      variant="outline"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(album.id);
                      }}
                      variant="destructive"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Helper components
function ChartCard({ title, children }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold mb-3 text-indigo-700">{title}</h3>
      {children}
    </div>
  );
}

function NoData() {
  return <p className="text-gray-500 text-sm">No data available.</p>;
}
