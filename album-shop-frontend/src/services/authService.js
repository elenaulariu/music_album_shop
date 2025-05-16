const BASE_URL = 'http://localhost:5000'; // adjust to your backend URL

export async function register(userData) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    // If the response is not OK, parse the JSON error message
    const error = await res.json();
    // If an error occurs, we throw the error object
    throw new Error(error.error || 'Registration failed');
  }

  return res.json(); // Return the successful response if registration succeeds
}


export async function login(credentials) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Login failed');
  }

  const data = await res.json();
  return { 
    access_token: data.access_token, 
    username: data.username
  };
}

export async function logout() {
  const token = localStorage.getItem('token');
  
  if (token) {
    const res = await fetch(`${BASE_URL}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    // Ensure the logout response is successful
    if (res.ok) {
      localStorage.removeItem('token');
    } else {
      console.error('Logout failed');
    }
  }
}

export async function checkTokenValidity() {
  const token = localStorage.getItem('token');

  if (!token) return false;

  const res = await fetch(`${BASE_URL}/protected`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });

  return res.ok;  // Return true if token is valid, false if not
}

export async function fetchUserById(userId) {
  const res = await fetch(`${BASE_URL}/users/${userId}`);
  if (!res.ok) throw await res.json();
  return res.json(); // returns { id, username }
}
