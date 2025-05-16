const BASE_URL = "http://localhost:5000"; // adjust if needed

export async function fetchAlbums() {
  const res = await fetch(`${BASE_URL}/albums/`);
  if (!res.ok) throw await res.json(); // Optional: consistent error handling
  return res.json();
}

export async function getAlbumById(id) {
  const res = await fetch(`${BASE_URL}/albums/${id}`);
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function createAlbum(data, token) {
  const res = await fetch(`${BASE_URL}/albums/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function updateAlbum(id, data, token) {
  const res = await fetch(`${BASE_URL}/albums/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

export async function deleteAlbum(id, token) {
  const res = await fetch(`${BASE_URL}/albums/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw await res.json();
  return res.json();
}
