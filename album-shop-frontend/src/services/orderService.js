const BASE_URL = "http://localhost:5000"; // adjust if needed

// Create a new order
export async function createOrder(orderData, token) {
  const res = await fetch(`${BASE_URL}/orders/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

// Fetch all orders (admin only)
export async function fetchAllOrders(token) {
  const res = await fetch(`${BASE_URL}/orders/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

// Fetch orders for the current user
export async function fetchMyOrders(token) {
  const res = await fetch(`${BASE_URL}/orders/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

// Delete an order by ID
export async function deleteOrder(orderId, token) {
  const res = await fetch(`${BASE_URL}/orders/${orderId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw await res.json();
  return res.json();
}
