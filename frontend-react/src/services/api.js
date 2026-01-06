const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

console.log("🌐 API Base URL:", API_BASE_URL);

const api = {
  // dans api.request, ajoutez plus de logs détaillés (status, headers, body)
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem("eduproject_token");

    const config = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
      ...options,
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Ne pas transformer en JSON si Content-Type est x-www-form-urlencoded ou autre
    if (
      config.body &&
      typeof config.body === "object" &&
      (!config.headers["Content-Type"] || config.headers["Content-Type"].includes("application/json"))
    ) {
      config.body = JSON.stringify(config.body);
    }

    console.log("🌐 API Request:", { url, config });

    try {
      const response = await fetch(url, config);

      // log utile pour debugging
      console.log(
        "🔁 API Response status:",
        response.status,
        response.statusText
      );

      if (response.status === 204) {
        return {};
      }

      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = text ? { message: text } : {};
      }

      console.log("📦 API Response body:", data);

      if (!response.ok) {
        const errorMessage =
          data.message ||
          data.error ||
          `Erreur ${response.status}: ${response.statusText}`;
        console.error("⚠️ API Error body:", data);
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error("❌ API Error (fetch):", error);
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error(
          `Impossible de se connecter au serveur: ${API_BASE_URL}. Vérifiez que le backend Spring Boot est démarré et que CORS autorise ${window.location.origin}.`
        );
      }
      throw error;
    }
  },

  get(endpoint) {
    return this.request(endpoint);
  },

  post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: data,
    });
  },

  put(endpoint, data, options = {}) {
    // Permet de passer des headers personnalisés (ex: Content-Type)
    return this.request(endpoint, { method: 'PUT', body: data, ...options });
  },

  delete(endpoint) {
    return this.request(endpoint, {
      method: "DELETE",
    });
  },
};

export default api;
