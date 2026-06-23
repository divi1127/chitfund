const API_BASE = "/api";

function getToken() {
  const t = localStorage.getItem("token");
  if (!t || t === "null" || t === "undefined" || !t.includes(".")) return null;
  return t;
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/";
}

async function handleResponse(response, endpoint) {
  if (!response.ok) {
    if (response.status === 401) {
      clearAuth();
      throw new Error("Session expired. Please login again.");
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function fetchData(endpoint) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: { ...authHeaders() }
    });
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
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(data)
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
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(data)
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
      headers: { ...authHeaders() }
    });
    return await handleResponse(response, endpoint);
  } catch (error) {
    console.error(`Error deleting ${endpoint}:`, error);
    throw error;
  }
}
