const API_BASE = import.meta.env.VITE_API_BASE || "";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("No authentication token found in localStorage");
  }
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    let errorDetails: any = null;
    
    try {
      const errorText = await response.text();
      if (errorText) {
        try {
          errorDetails = JSON.parse(errorText);
          errorMessage = errorDetails.message || errorDetails.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
      }
    } catch (err) {
      // If we can't read the response, use default message
      errorMessage = `Request failed with status ${response.status}`;
    }
    
    // Provide more descriptive error messages
    if (response.status === 401) {
      if (!errorMessage || errorMessage.includes('HTTP 401')) {
        errorMessage = 'Missing token';
      }
    }
    
    const error: any = new Error(errorMessage);
    error.status = response.status;
    error.details = errorDetails;
    throw error;
  }
  return response.json();
}

// Trip APIs
export const tripsApi = {
  search: async (params: { from?: string; to?: string; date?: string }) => {
    const queryParams = new URLSearchParams();
    if (params.from) queryParams.append("from", params.from);
    if (params.to) queryParams.append("to", params.to);
    if (params.date) queryParams.append("date", params.date);

    const response = await fetch(`${API_BASE}/api/trips?${queryParams.toString()}`);
    return handleResponse(response);
  },

  getById: async (id: string | number) => {
    const response = await fetch(`${API_BASE}/api/trips/${id}`);
    return handleResponse(response);
  },
};

// User APIs
export const usersApi = {
  getMe: async () => {
    const response = await fetch(`${API_BASE}/api/users/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  updateMe: async (data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    gender?: string;
    birthDate?: string;
    address?: string;
  }) => {
    const response = await fetch(`${API_BASE}/api/users/me`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

// Favorites APIs
export const favoritesApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE}/api/favorites`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  add: async (tripId: number) => {
    const response = await fetch(`${API_BASE}/api/favorites`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ trip_id: tripId }),
    });
    return handleResponse(response);
  },

  remove: async (tripId: number) => {
    const response = await fetch(`${API_BASE}/api/favorites/${tripId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  check: async (tripId: number) => {
    const response = await fetch(`${API_BASE}/api/favorites/check/${tripId}`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse<{ isFavorite: boolean }>(response);
    return data.isFavorite;
  },
};

// Companies APIs
export const companiesApi = {
  getAll: async () => {
    const response = await fetch(`${API_BASE}/api/companies`);
    return handleResponse(response);
  },
};

// Cities APIs
export const citiesApi = {
  getAll: async (params?: { limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.offset) queryParams.append("offset", String(params.offset));
    
    const url = `${API_BASE}/api/cities${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url);
    return handleResponse(response);
  },

  search: async (query: string, limit: number = 50) => {
    const response = await fetch(`${API_BASE}/api/cities/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    return handleResponse(response);
  },

  getById: async (id: number) => {
    const response = await fetch(`${API_BASE}/api/cities/${id}`);
    return handleResponse(response);
  },
};

// Ratings APIs
export const ratingsApi = {
  getAll: async (companyId?: number) => {
    const queryParams = companyId ? `?company_id=${companyId}` : "";
    const response = await fetch(`${API_BASE}/api/ratings${queryParams}`);
    return handleResponse(response);
  },

  getCompanyAverage: async (companyId: number) => {
    const response = await fetch(`${API_BASE}/api/ratings/company/${companyId}`);
    return handleResponse(response);
  },

  submit: async (data: {
    company_id: number;
    punctuality_rating: number;
    friendliness_rating: number;
    cleanliness_rating: number;
    comment?: string;
  }) => {
    const response = await fetch(`${API_BASE}/api/ratings`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

// Images APIs
export const imagesApi = {
  getByEntity: async (entityType: string, entityId: number) => {
    const response = await fetch(`${API_BASE}/api/images?entity_type=${entityType}&entity_id=${entityId}`);
    return handleResponse(response);
  },

  upload: async (file: File, entityType: string, entityId: number) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("entity_type", entityType);
    formData.append("entity_id", String(entityId));

    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}/api/images`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    return handleResponse(response);
  },

  delete: async (imageId: number) => {
    const response = await fetch(`${API_BASE}/api/images/${imageId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Notifications APIs
export const notificationsApi = {
  getAll: async (params?: { limit?: number; offset?: number; unread_only?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.offset) queryParams.append("offset", String(params.offset));
    if (params?.unread_only) queryParams.append("unread_only", String(params.unread_only));

    const response = await fetch(`${API_BASE}/api/notifications?${queryParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getUnreadCount: async () => {
    const response = await fetch(`${API_BASE}/api/notifications/unread-count`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  markAsRead: async (notificationId: number) => {
    const response = await fetch(`${API_BASE}/api/notifications/${notificationId}/read`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  markAllAsRead: async () => {
    const response = await fetch(`${API_BASE}/api/notifications/read-all`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  delete: async (notificationId: number) => {
    const response = await fetch(`${API_BASE}/api/notifications/${notificationId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Admin APIs
export const adminApi = {
  getStats: async () => {
    const response = await fetch(`${API_BASE}/api/admin/analytics/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getPopularRoutes: async () => {
    const response = await fetch(`${API_BASE}/api/admin/analytics/popular-routes`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getRecentBookings: async () => {
    const response = await fetch(`${API_BASE}/api/admin/analytics/recent-bookings`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getUsers: async (showDeleted: boolean = false) => {
    const url = showDeleted 
      ? `${API_BASE}/api/admin/users?showDeleted=true`
      : `${API_BASE}/api/admin/users`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getTrips: async (showAll: boolean = false) => {
    const url = showAll 
      ? `${API_BASE}/api/admin/trips?showAll=true`
      : `${API_BASE}/api/admin/trips`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getRoutes: async () => {
    const response = await fetch(`${API_BASE}/api/admin/routes`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  uploadImage: async (file: File, entityType: string, entityId: number) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("entity_type", entityType);
    formData.append("entity_id", String(entityId));

    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}/api/admin/images`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    return handleResponse(response);
  },

  deleteImage: async (imageId: number) => {
    const response = await fetch(`${API_BASE}/api/admin/images/${imageId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  previewCSV: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}/api/admin/import/preview`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    return handleResponse(response);
  },

  importTrips: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}/api/admin/import/trips`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    return handleResponse(response);
  },

  createTrip: async (tripData: {
    route_id: number;
    company_id: number;
    transport_type_id: number;
    departure_station_id: number;
    arrival_station_id: number;
    departure_time: string;
    arrival_time: string;
    duration_minutes: number;
    seats_total: number;
    price?: number | null;
    currency?: string;
    bus_number?: string | null;
    driver_name?: string | null;
    status?: string;
    is_active?: boolean;
    equipment?: string;
    cancellation_policy?: string;
    extra_info?: string;
  }) => {
    const response = await fetch(`${API_BASE}/api/admin/trips`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(tripData),
    });
    return handleResponse(response);
  },

  updateTrip: async (tripId: number, tripData: any) => {
    const response = await fetch(`${API_BASE}/api/admin/trips/${tripId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(tripData),
    });
    return handleResponse(response);
  },

  deleteTrip: async (tripId: number) => {
    const response = await fetch(`${API_BASE}/api/admin/trips/${tripId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getCompanies: async () => {
    const response = await fetch(`${API_BASE}/api/companies`);
    return handleResponse(response);
  },

  getTransportTypes: async () => {
    const response = await fetch(`${API_BASE}/api/transport-types`);
    return handleResponse(response);
  },

  getStations: async () => {
    const response = await fetch(`${API_BASE}/api/stations`);
    return handleResponse(response);
  },

  getCities: async () => {
    const response = await fetch(`${API_BASE}/api/cities`);
    return handleResponse(response);
  },

  getFares: async (tripId: number) => {
    const response = await fetch(`${API_BASE}/api/admin/fares?trip_id=${tripId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  createRoute: async (fromCityId: number, toCityId: number) => {
    const response = await fetch(`${API_BASE}/api/admin/routes`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ from_city_id: fromCityId, to_city_id: toCityId }),
    });
    return handleResponse(response);
  },

  banUser: async (userId: number, isActive: boolean) => {
    const headers = getAuthHeaders();
    headers['Content-Type'] = 'application/json';
    const response = await fetch(`${API_BASE}/api/admin/users/${userId}/active`, {
      method: "PATCH",
      headers: headers,
      body: JSON.stringify({ is_active: isActive }),
    });
    return handleResponse(response);
  },

  changeUserRole: async (userId: number, roleNames: string[]) => {
    const headers = getAuthHeaders();
    headers['Content-Type'] = 'application/json';
    const response = await fetch(`${API_BASE}/api/admin/users/${userId}/roles`, {
      method: "PUT",
      headers: headers,
      body: JSON.stringify({ role_names: roleNames }),
    });
    return handleResponse(response);
  },

  updateUserProfile: async (userId: number, data: {
    first_name?: string;
    last_name?: string;
    email?: string;
    password?: string;
    role_names?: string[];
  }) => {
    const headers = getAuthHeaders();
    headers['Content-Type'] = 'application/json';
    const response = await fetch(`${API_BASE}/api/admin/users/${userId}/profile`, {
      method: "PATCH",
      headers: headers,
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  deleteUser: async (userId: number) => {
    const headers = getAuthHeaders();
    const response = await fetch(`${API_BASE}/api/users/${userId}`, {
      method: "DELETE",
      headers: headers,
    });
    return handleResponse(response);
  },
};
