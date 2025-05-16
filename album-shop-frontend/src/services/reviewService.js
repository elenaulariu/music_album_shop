const BASE_URL = "http://localhost:5000"; // Update if your server address changes

// Create a new review
export async function createReview(reviewData, token) {
  const res = await fetch(`${BASE_URL}/reviews/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(reviewData),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

// Get all reviews for a specific album
export async function fetchReviewsForAlbum(albumId) {
  const res = await fetch(`${BASE_URL}/reviews/album/${albumId}`);
  if (!res.ok) throw await res.json();
  return res.json();
}

// Get all reviews by a specific user
export async function fetchReviewsByUser(userId) {
  const res = await fetch(`${BASE_URL}/reviews/user/${userId}`);
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function fetchAllReviews(token) {
  const res = await fetch(`${BASE_URL}/reviews/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

// Update a review
export async function updateReview(reviewId, updatedData, token) {
  const res = await fetch(`${BASE_URL}/reviews/${reviewId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updatedData),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

// Delete a review
export async function deleteReview(reviewId, token) {
  const res = await fetch(`${BASE_URL}/reviews/${reviewId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw await res.json();
  return res.json();
}
