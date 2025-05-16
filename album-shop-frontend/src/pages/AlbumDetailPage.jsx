import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  createReview,
  fetchReviewsForAlbum,
  updateReview,
  deleteReview,
} from "../services/reviewService";
import { createOrder } from "../services/orderService";
import { fetchUserById } from "@/services/authService";

export default function AlbumDetailPage({ isAdmin: isAdminProp }) {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [newReview, setNewReview] = useState({ rating: "", comment: "" });
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingReview, setEditingReview] = useState({ rating: "", comment: "" });
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const albumRes = await fetch(`http://localhost:5000/albums/${id}`);
        const albumData = await albumRes.json();
        setAlbum(albumData);

        const reviewData = await fetchReviewsForAlbum(id);

        // Enrich reviews with usernames
        const enrichedReviews = await Promise.all(
          reviewData.map(async (review) => {
            try {
              const user = await fetchUserById(review.user_id);
              return { ...review, username: user.username };
            } catch {
              return { ...review, username: "Unknown" };
            }
          })
        );
        setReviews(enrichedReviews);

        if (token) {
          const userRes = await fetch("http://localhost:5000/users/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const userInfo = await userRes.json();
          setCurrentUser(userInfo);
        }
      } catch (err) {
        console.error("Error loading data", err);
      }
    };

    fetchData();
  }, [id, token]);

  const refreshReviews = async () => {
    const reviewData = await fetchReviewsForAlbum(id);
    const enriched = await Promise.all(
      reviewData.map(async (review) => {
        try {
          const user = await fetchUserById(review.user_id);
          return { ...review, username: user.username };
        } catch {
          return { ...review, username: "Unknown" };
        }
      })
    );
    setReviews(enriched);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleOrder = async () => {
    try {
      await createOrder({ album_id: album.id, quantity }, token);
      alert("Order placed successfully!");
    } catch {
      alert("Failed to place order.");
    }
  };

  const handleCreateReview = async () => {
    try {
      await createReview({ ...newReview, album_id: id }, token);
      setNewReview({ rating: "", comment: "" });
      await refreshReviews();
    } catch {
      alert("Failed to submit review.");
    }
  };

  const handleEditReview = (review) => {
    setEditingReviewId(review.id);
    setEditingReview({ rating: review.rating, comment: review.comment });
  };

  const handleUpdateReview = async () => {
    try {
      await updateReview(editingReviewId, editingReview, token);
      setEditingReviewId(null);
      await refreshReviews();
    } catch {
      alert("Failed to update review.");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(reviewId, token);
      await refreshReviews();
    } catch {
      alert("Failed to delete review.");
    }
  };

  if (!album) return <p className="p-6 text-gray-600">Loading...</p>;

  const isOwner = (userId) => currentUser && currentUser.id === userId;
  const isAdmin = currentUser && currentUser.role === "admin";

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-indigo-50 to-white flex flex-col">
      <header className="w-full flex justify-between items-center p-6 border-b bg-white shadow-sm">
        <h1 onClick={() => navigate("/")} className="text-2xl font-bold text-indigo-700 cursor-pointer">
          🎵 Music Shop
        </h1>
        <div className="space-x-4 flex items-center">
          {currentUser && (
            <>
              <span className="text-gray-700">
                Welcome, <strong>{currentUser.username}</strong>
              </span>
              <Button onClick={() => navigate("/orders/my")} variant="secondary">
                My Orders
              </Button>
              {isAdmin && (
                <Button onClick={() => navigate("/admin")}>Admin Panel</Button>
              )}
              <Button onClick={handleLogout} variant="ghost">
                Logout
              </Button>
            </>
          )}
          {!currentUser && (
            <>
              <Button onClick={() => navigate("/login")}>Login</Button>
              <Button onClick={() => navigate("/register")} variant="outline">
                Register
              </Button>
            </>
          )}
        </div>
      </header>

      <main className="max-w-3xl w-full mx-auto p-6">
        <h2 className="text-3xl font-bold text-indigo-800 mb-6">Album Details</h2>

        {album.image_url && (
          <div className="mb-6">
            <img
              src={album.image_url}
              alt={`${album.title} cover`}
              className="w-full max-h-[400px] object-cover rounded-xl shadow"
            />
          </div>
        )}

        <div className="space-y-2 text-lg text-gray-700 mb-8">
          <p><strong className="text-indigo-700">Title:</strong> {album.title}</p>
          <p><strong className="text-indigo-700">Artist:</strong> {album.artist}</p>
          <p><strong className="text-indigo-700">Release Date:</strong> {new Date(album.release_date).toLocaleDateString()}</p>
          <p><strong className="text-indigo-700">Genre:</strong> {album.genre}</p>
          <p><strong className="text-indigo-700">Price:</strong> ${album.price.toFixed(2)}</p>
          {isAdmin && <p><strong className="text-indigo-700">Quantity:</strong> {album.quantity}</p>}
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="quantity" className="block mb-1 text-gray-700 font-medium">Quantity:</label>
            <input
              id="quantity"
              type="number"
              min={1}
              max={album.quantity}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <Button onClick={handleOrder} className="bg-indigo-600 text-white">Order Now</Button>
        </div>

        <section className="mt-12">
          <h3 className="text-2xl font-semibold text-indigo-700 mb-4">Reviews</h3>

          {reviews.length === 0 && <p className="text-gray-500">No reviews yet.</p>}

          <ul className="space-y-4">
            {reviews.map((review) => (
              <li key={review.id} className="p-4 border rounded-md bg-white shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <p className="font-semibold text-indigo-800">
                    {review.username ?? "Unknown"}
                  </p>
                  {(isOwner(review.user_id) || isAdmin) && (
                    <div className="space-x-2">
                      {isOwner(review.user_id) && (
                        <Button size="sm" onClick={() => handleEditReview(review)}>Edit</Button>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteReview(review.id)}>Delete</Button>
                    </div>
                  )}
                </div>

                {editingReviewId === review.id ? (
                  <div className="space-y-2">
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={editingReview.rating}
                      onChange={(e) => setEditingReview({ ...editingReview, rating: e.target.value })}
                      className="border p-2 w-full"
                      placeholder="Rating"
                    />
                    <textarea
                      value={editingReview.comment}
                      onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}
                      className="border p-2 w-full"
                      placeholder="Comment"
                    />
                    <Button onClick={handleUpdateReview}>Save</Button>
                  </div>
                ) : (
                  <>
                    <p className="text-yellow-600 font-semibold">Rating: {review.rating} / 5</p>
                    <p className="text-gray-700">{review.comment}</p>
                  </>
                )}
              </li>
            ))}
          </ul>

          {currentUser && (
            <div className="mt-8 p-4 border-t pt-6">
              <h4 className="text-xl font-medium mb-2">Leave a Review</h4>
              <input
                type="number"
                min="1"
                max="5"
                value={newReview.rating}
                onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
                placeholder="Rating (1-5)"
                className="w-full p-2 mb-2 border rounded"
              />
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="Write your comment..."
                className="w-full p-2 mb-2 border rounded"
              />
              <Button onClick={handleCreateReview}>Submit Review</Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
