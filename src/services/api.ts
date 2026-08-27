import {
  User,
  CropRecommendation,
  DiseaseDetection,
  SoilReport,
  MarketPrice,
  ProfitCalculation,
  GovernmentScheme,
  CommunityPost,
  NotificationItem,
  WeatherInfo,
  AdminStats
} from '../types.js';

class ApiClient {
  private getHeaders(isJson = true): HeadersInit {
    const headers: Record<string, string> = {};
    if (isJson) {
      headers['Content-Type'] = 'application/json';
    }
    const token = localStorage.getItem('agro_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const isJson = !(options.body instanceof FormData);
    const headers = {
      ...this.getHeaders(isJson),
      ...(options.headers as Record<string, string>)
    };

    const res = await fetch(endpoint, {
      ...options,
      headers
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  }

  // Auth
  async login(credentials: { email: string; password: string }): Promise<{ token: string; user: User }> {
    const res = await this.request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    localStorage.setItem('agro_token', res.token);
    return res;
  }

  async register(data: any): Promise<{ token: string; user: User }> {
    const res = await this.request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    localStorage.setItem('agro_token', res.token);
    return res;
  }

  async getCurrentUser(): Promise<User> {
    const res = await this.request<{ user: User }>('/api/auth/me');
    return res.user;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const res = await this.request<{ user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return res.user;
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  logout() {
    localStorage.removeItem('agro_token');
  }

  // Weather
  async getWeather(location?: string, lat?: number, lon?: number): Promise<WeatherInfo> {
    let url = '/api/weather';
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (lat && lon) {
      params.append('lat', String(lat));
      params.append('lon', String(lon));
    }
    const query = params.toString();
    if (query) url += `?${query}`;
    const res = await this.request<{ data: WeatherInfo }>(url);
    return res.data;
  }

  // Crops
  async recommendCrop(params: any): Promise<CropRecommendation> {
    const res = await this.request<{ data: CropRecommendation }>('/api/crops/recommend', {
      method: 'POST',
      body: JSON.stringify(params)
    });
    return res.data;
  }

  async getCropHistory(): Promise<CropRecommendation[]> {
    const res = await this.request<{ data: CropRecommendation[] }>('/api/crops/history');
    return res.data;
  }

  async getLatestCrop(): Promise<CropRecommendation | null> {
    const res = await this.request<{ data: CropRecommendation | null }>('/api/crops/latest');
    return res.data;
  }

  // Disease
  async detectDisease(payload: { image: string; mimeType?: string; cropName?: string }): Promise<DiseaseDetection> {
    const res = await this.request<{ data: DiseaseDetection }>('/api/disease/detect', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return res.data;
  }

  async getDiseaseHistory(): Promise<DiseaseDetection[]> {
    const res = await this.request<{ data: DiseaseDetection[] }>('/api/disease/history');
    return res.data;
  }

  async getLatestDisease(): Promise<DiseaseDetection | null> {
    const res = await this.request<{ data: DiseaseDetection | null }>('/api/disease/latest');
    return res.data;
  }

  // Soil
  async analyzeSoil(params: any): Promise<SoilReport> {
    const res = await this.request<{ data: SoilReport }>('/api/soil/analyze', {
      method: 'POST',
      body: JSON.stringify(params)
    });
    return res.data;
  }

  async getSoilHistory(): Promise<SoilReport[]> {
    const res = await this.request<{ data: SoilReport[] }>('/api/soil/history');
    return res.data;
  }

  async getLatestSoil(): Promise<SoilReport | null> {
    const res = await this.request<{ data: SoilReport | null }>('/api/soil/latest');
    return res.data;
  }

  // Market
  async getMarketPrices(query?: { search?: string; crop?: string; state?: string; district?: string }): Promise<{ data: MarketPrice[]; isLiveApiConfigured: boolean }> {
    let url = '/api/market/prices';
    if (query) {
      const params = new URLSearchParams();
      if (query.search) params.append('search', query.search);
      if (query.crop && query.crop !== 'All') params.append('crop', query.crop);
      if (query.state && query.state !== 'All') params.append('state', query.state);
      if (query.district && query.district !== 'All') params.append('district', query.district);
      url += `?${params.toString()}`;
    }
    return this.request<{ data: MarketPrice[]; isLiveApiConfigured: boolean }>(url);
  }

  async createMarketPrice(data: any): Promise<MarketPrice> {
    const res = await this.request<{ data: MarketPrice }>('/api/market/prices', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  }

  async updateMarketPrice(id: string, data: any): Promise<MarketPrice> {
    const res = await this.request<{ data: MarketPrice }>(`/api/market/prices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return res.data;
  }

  async deleteMarketPrice(id: string): Promise<void> {
    await this.request(`/api/market/prices/${id}`, { method: 'DELETE' });
  }

  // Profit
  async calculateProfit(params: any): Promise<ProfitCalculation> {
    const res = await this.request<{ data: ProfitCalculation }>('/api/profit/calculate', {
      method: 'POST',
      body: JSON.stringify(params)
    });
    return res.data;
  }

  async getProfitHistory(): Promise<ProfitCalculation[]> {
    const res = await this.request<{ data: ProfitCalculation[] }>('/api/profit/history');
    return res.data;
  }

  async getLatestProfit(): Promise<ProfitCalculation | null> {
    const res = await this.request<{ data: ProfitCalculation | null }>('/api/profit/latest');
    return res.data;
  }

  // Schemes
  async getSchemes(query?: { search?: string; state?: string; category?: string }): Promise<GovernmentScheme[]> {
    let url = '/api/schemes';
    if (query) {
      const params = new URLSearchParams();
      if (query.search) params.append('search', query.search);
      if (query.state && query.state !== 'All') params.append('state', query.state);
      if (query.category && query.category !== 'All') params.append('category', query.category);
      url += `?${params.toString()}`;
    }
    const res = await this.request<{ data: GovernmentScheme[] }>(url);
    return res.data;
  }

  async addScheme(data: any): Promise<GovernmentScheme> {
    const res = await this.request<{ data: GovernmentScheme }>('/api/schemes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  }

  async deleteScheme(id: string): Promise<void> {
    await this.request(`/api/schemes/${id}`, { method: 'DELETE' });
  }

  // Community
  async getCommunityPosts(query?: { search?: string; category?: string; sort?: string }): Promise<CommunityPost[]> {
    let url = '/api/community/posts';
    if (query) {
      const params = new URLSearchParams();
      if (query.search) params.append('search', query.search);
      if (query.category && query.category !== 'All') params.append('category', query.category);
      if (query.sort) params.append('sort', query.sort);
      url += `?${params.toString()}`;
    }
    const res = await this.request<{ data: CommunityPost[] }>(url);
    return res.data;
  }

  async createCommunityPost(data: { title: string; content: string; category?: string; tags?: string[]; imageUrl?: string }): Promise<CommunityPost> {
    const res = await this.request<{ data: CommunityPost }>('/api/community/posts', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  }

  async likePost(id: string): Promise<CommunityPost> {
    const res = await this.request<{ data: CommunityPost }>(`/api/community/posts/${id}/like`, {
      method: 'POST'
    });
    return res.data;
  }

  async commentOnPost(postId: string, comment: string): Promise<CommunityPost> {
    const res = await this.request<{ data: CommunityPost }>(`/api/community/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment })
    });
    return res.data;
  }

  async deletePost(id: string): Promise<void> {
    await this.request(`/api/community/posts/${id}`, { method: 'DELETE' });
  }

  // Chat
  async sendChatMessage(message: string, language: 'en' | 'ta', history?: any[]): Promise<{ reply: string; isDemo: boolean }> {
    const res = await this.request<{ data: { reply: string; isDemo: boolean } }>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, language, history })
    });
    return res.data;
  }

  // Notifications
  async getNotifications(): Promise<{ data: NotificationItem[]; unreadCount: number }> {
    return this.request('/api/notifications');
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await this.request(`/api/notifications/${id}/read`, { method: 'PUT' });
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await this.request('/api/notifications/read-all', { method: 'PUT' });
  }

  // Admin
  async getAdminStats(): Promise<AdminStats> {
    const res = await this.request<{ stats: AdminStats }>('/api/admin/stats');
    return res.stats;
  }

  async getAdminUsers(): Promise<User[]> {
    const res = await this.request<{ data: User[] }>('/api/admin/users');
    return res.data;
  }

  async updateUserRole(id: string, role: 'farmer' | 'admin'): Promise<void> {
    await this.request(`/api/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    });
  }

  async deleteUser(id: string): Promise<void> {
    await this.request(`/api/admin/users/${id}`, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
