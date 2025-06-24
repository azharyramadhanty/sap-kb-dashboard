// API client for communicating with backend services
class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Get auth token from localStorage
    const session = localStorage.getItem('session');
    const token = session ? JSON.parse(session).token : null;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getUsers() {
    return this.request('/auth/users');
  }

  // Document endpoints
  async getDocuments() {
    return this.request('/documents');
  }

  async getArchivedDocuments() {
    return this.request('/documents/archived');
  }

  async uploadDocument(formData: FormData) {
    const session = localStorage.getItem('session');
    const token = session ? JSON.parse(session).token : null;

    const response = await fetch(`${this.baseUrl}/documents/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async archiveDocument(documentId: string) {
    return this.request(`/documents/${documentId}/archive`, {
      method: 'PATCH',
    });
  }

  async restoreDocument(documentId: string) {
    return this.request(`/documents/${documentId}/restore`, {
      method: 'PATCH',
    });
  }

  async deleteDocument(documentId: string) {
    return this.request(`/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  async downloadDocument(documentId: string) {
    return this.request(`/documents/${documentId}/download`);
  }

  async shareDocument(documentId: string, userIds: string[]) {
    return this.request(`/documents/${documentId}/share`, {
      method: 'POST',
      body: JSON.stringify({ userIds }),
    });
  }

  // Activity endpoints
  async getActivities() {
    return this.request('/activities');
  }

  async createActivity(activityData: any) {
    return this.request('/activities', {
      method: 'POST',
      body: JSON.stringify(activityData),
    });
  }
}

export const apiClient = new ApiClient();