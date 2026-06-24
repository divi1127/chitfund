const API_BASE = import.meta.env.VITE_API_BASE || "https://chitfund-cxnp.onrender.com/api";

function getHeaders() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const headers = { "Content-Type": "application/json" };
  if (user?.token) headers["Authorization"] = `Bearer ${user.token}`;
  return headers;
}

async function handleResponse(response, endpoint) {
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || `HTTP ${response.status}`);
  return data;
}

export async function fetchData(endpoint) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, { headers: getHeaders() });
    return await handleResponse(response, endpoint);
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}

export async function createData(endpoint, data) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return await handleResponse(response, endpoint);
  } catch (error) {
    console.error(`Error creating ${endpoint}:`, error);
    throw error;
  }
}

export async function updateData(endpoint, id, data) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return await handleResponse(response, endpoint);
  } catch (error) {
    console.error(`Error updating ${endpoint}:`, error);
    throw error;
  }
}

export async function deleteData(endpoint, id) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return await handleResponse(response, endpoint);
  } catch (error) {
    console.error(`Error deleting ${endpoint}:`, error);
    throw error;
  }
}

export async function loginUser(userId, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Login failed");
  return data;
}
