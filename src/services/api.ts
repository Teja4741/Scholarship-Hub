import { Scholarship, Application } from '../types/scholarship';
import { Notification } from '../types/notification';

const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getAuthToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      headers,
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth methods
  async register(userData: { email: string; password: string; role?: string }): Promise<{ token: string; user: any }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }): Promise<{ token: string; user: any }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getProfile(): Promise<any> {
    return this.request('/auth/profile');
  }

  // Scholarship methods
  async getScholarships(): Promise<Scholarship[]> {
    return this.request<Scholarship[]>('/scholarships');
  }

  async getScholarshipById(id: string): Promise<Scholarship> {
    return this.request<Scholarship>(`/scholarships/${id}`);
  }

  // Application methods
  async submitApplication(applicationData: any): Promise<{ message: string; id: number }> {
    return this.request('/applications', {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async getApplications(): Promise<(Application & { scholarshipName: string })[]> {
    return this.request('/applications');
  }

  async getApplicationById(id: string): Promise<Application & { scholarshipName: string }> {
    return this.request(`/applications/${id}`);
  }

  async updateApplicationStatus(id: string, status: string, reviewerNotes?: string): Promise<{ message: string }> {
    return this.request(`/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reviewerNotes }),
    });
  }

  async deleteApplication(id: string): Promise<{ message: string }> {
    return this.request(`/applications/${id}`, {
      method: 'DELETE',
    });
  }

  // Search methods
  async advancedSearch(searchData: any): Promise<any> {
    return this.request('/search/advanced', {
      method: 'POST',
      body: JSON.stringify(searchData),
    });
  }

  async getSearchSuggestions(query: string): Promise<any> {
    return this.request(`/search/suggestions?query=${encodeURIComponent(query)}`);
  }

  async getPopularSearches(): Promise<any> {
    return this.request('/search/popular');
  }

  // Notification methods
  async getNotifications(): Promise<{notifications: Notification[], pagination: any}> {
    return this.request<{notifications: Notification[], pagination: any}>('/notifications');
  }

  async markNotificationAsRead(id: string): Promise<{ message: string }> {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead(): Promise<{ message: string }> {
    return this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  async deleteNotification(id: string): Promise<{ message: string }> {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  async getNotificationSettings(): Promise<any> {
    return this.request('/notifications/settings');
  }

  async updateNotificationSettings(settings: any): Promise<{ message: string }> {
    return this.request('/notifications/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Document methods
  async uploadDocument(formData: FormData): Promise<any> {
    const url = `${API_BASE_URL}/documents/upload`;
    const token = this.getAuthToken();

    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getDocuments(applicationId: number): Promise<any[]> {
    return this.request(`/documents/application/${applicationId}`);
  }

  async deleteDocument(documentId: number): Promise<{ message: string }> {
    return this.request(`/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  // Analytics methods
  async getDashboardStats(): Promise<any> {
    return this.request('/analytics/dashboard');
  }

  async getUserAnalytics(): Promise<any> {
    return this.request('/analytics/users');
  }

  async getScholarshipAnalytics(): Promise<any> {
    return this.request('/analytics/scholarships');
  }

  async exportData(type: string): Promise<Blob> {
    const url = `${API_BASE_URL}/analytics/export?type=${type}`;
    const token = this.getAuthToken();

    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      headers,
      responseType: 'blob',
    } as RequestInit);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.blob();
  }
}

const apiService = new ApiService();
export default apiService;