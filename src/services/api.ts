import { Article, Category, BreakingNewsItem, AdSlot, VideoItem, Author, CommentItem, NewsletterSubscriber, WebsiteSettings, AdminUser, DatabaseState } from '../types/news';

const BASE_URL = '';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('png_admin_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Articles
  async getArticles(params?: { category?: string; status?: string; search?: string; featured?: boolean; limit?: number; offset?: number }): Promise<{ total: number; items: Article[] }> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    if (params?.featured !== undefined) query.set('featured', String(params.featured));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.offset) query.set('offset', String(params.offset));

    const res = await fetch(`${BASE_URL}/api/articles?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch articles');
    return res.json();
  },

  async getArticleBySlug(slug: string): Promise<Article> {
    const res = await fetch(`${BASE_URL}/api/articles/${slug}`);
    if (!res.ok) throw new Error('Article not found');
    return res.json();
  },

  async incrementViews(id: string): Promise<{ views: number }> {
    const res = await fetch(`${BASE_URL}/api/articles/${id}/view`, { method: 'POST' });
    return res.json();
  },

  async saveArticle(article: Partial<Article>): Promise<Article> {
    const isNew = !article.id || article.id.startsWith('new-');
    const url = isNew ? `${BASE_URL}/api/articles` : `${BASE_URL}/api/articles/${article.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(article),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to save article');
    }
    return res.json();
  },

  async deleteArticle(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/api/articles/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete article');
    return res.json();
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${BASE_URL}/api/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async saveCategory(cat: Partial<Category>): Promise<Category> {
    const isNew = !cat.id;
    const url = isNew ? `${BASE_URL}/api/categories` : `${BASE_URL}/api/categories/${cat.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(cat),
    });
    if (!res.ok) throw new Error('Failed to save category');
    return res.json();
  },

  async deleteCategory(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/api/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete category');
    return res.json();
  },

  // Breaking News
  async getBreakingNews(all = false): Promise<BreakingNewsItem[]> {
    const res = await fetch(`${BASE_URL}/api/breaking-news?all=${all}`);
    if (!res.ok) throw new Error('Failed to fetch breaking news');
    return res.json();
  },

  async saveBreakingNews(item: Partial<BreakingNewsItem>): Promise<BreakingNewsItem> {
    const isNew = !item.id;
    const url = isNew ? `${BASE_URL}/api/breaking-news` : `${BASE_URL}/api/breaking-news/${item.id}`;
    const method = isNew ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to save breaking news');
    return res.json();
  },

  async deleteBreakingNews(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/api/breaking-news/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete breaking news');
    return res.json();
  },

  // Advertisements
  async getAds(): Promise<AdSlot[]> {
    const res = await fetch(`${BASE_URL}/api/ads`);
    if (!res.ok) throw new Error('Failed to fetch advertisements');
    return res.json();
  },

  async saveAd(ad: Partial<AdSlot> & { id: string }): Promise<AdSlot> {
    const res = await fetch(`${BASE_URL}/api/ads/${ad.id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(ad),
    });
    if (!res.ok) throw new Error('Failed to save ad slot');
    return res.json();
  },

  async recordAdImpression(id: string): Promise<void> {
    await fetch(`${BASE_URL}/api/ads/${id}/impression`, { method: 'POST' }).catch(() => {});
  },

  async recordAdClick(id: string): Promise<void> {
    await fetch(`${BASE_URL}/api/ads/${id}/click`, { method: 'POST' }).catch(() => {});
  },

  // Videos
  async getVideos(): Promise<VideoItem[]> {
    const res = await fetch(`${BASE_URL}/api/videos`);
    if (!res.ok) throw new Error('Failed to fetch videos');
    return res.json();
  },

  async saveVideo(video: Partial<VideoItem>): Promise<VideoItem> {
    const res = await fetch(`${BASE_URL}/api/videos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(video),
    });
    if (!res.ok) throw new Error('Failed to save video');
    return res.json();
  },

  async deleteVideo(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/api/videos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete video');
    return res.json();
  },

  // Authors
  async getAuthors(): Promise<Author[]> {
    const res = await fetch(`${BASE_URL}/api/authors`);
    if (!res.ok) throw new Error('Failed to fetch authors');
    return res.json();
  },

  async saveAuthor(author: Partial<Author>): Promise<Author> {
    const res = await fetch(`${BASE_URL}/api/authors`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(author),
    });
    if (!res.ok) throw new Error('Failed to save author');
    return res.json();
  },

  async deleteAuthor(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/api/authors/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete author');
    return res.json();
  },

  // Comments
  async getComments(params?: { article_id?: string; status?: string }): Promise<CommentItem[]> {
    const query = new URLSearchParams();
    if (params?.article_id) query.set('article_id', params.article_id);
    if (params?.status) query.set('status', params.status);

    const res = await fetch(`${BASE_URL}/api/comments?${query.toString()}`);
    return res.json();
  },

  async postComment(comment: { article_id: string; author_name: string; author_email: string; content: string }): Promise<CommentItem> {
    const res = await fetch(`${BASE_URL}/api/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment),
    });
    if (!res.ok) throw new Error('Failed to post comment');
    return res.json();
  },

  async updateCommentStatus(id: string, status: 'approved' | 'pending' | 'spam'): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/api/comments/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  async deleteComment(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/api/comments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Newsletter
  async getSubscribers(): Promise<NewsletterSubscriber[]> {
    const res = await fetch(`${BASE_URL}/api/newsletter`);
    return res.json();
  },

  async subscribeNewsletter(email: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/api/newsletter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  async deleteSubscriber(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/api/newsletter/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Website Settings
  async getSettings(): Promise<WebsiteSettings> {
    const res = await fetch(`${BASE_URL}/api/settings`);
    return res.json();
  },

  async updateSettings(settings: Partial<WebsiteSettings>): Promise<WebsiteSettings> {
    const res = await fetch(`${BASE_URL}/api/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || 'Failed to update settings');
    }
    return res.json();
  },

  // Media Library
  async getMedia(): Promise<any[]> {
    const res = await fetch(`${BASE_URL}/api/media`);
    return res.json();
  },

  async uploadMedia(filename: string, base64Data: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/api/media/upload`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ filename, base64Data }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to upload media');
    }
    return res.json();
  },

  async deleteMedia(filename: string): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/api/media/${filename}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // --- Multi-Factor Authentication & Administrative Security ---

  async getCaptcha(): Promise<{ id: string; question: string }> {
    const res = await fetch(`${BASE_URL}/api/auth/captcha`);
    if (!res.ok) throw new Error('Could not load anti-bot challenge');
    return res.json();
  },

  async loginStep1(params: {
    username: string;
    password: string;
    captchaId: string;
    captchaAnswer: string;
  }): Promise<{
    success: boolean;
    requires2FA?: boolean;
    challengeId?: string;
    maskedEmail?: string;
    dev2FACode?: string;
    message?: string;
  }> {
    const res = await fetch(`${BASE_URL}/api/auth/login-step1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  async loginStep2(params: {
    challengeId?: string;
    code: string;
    isRecoveryCode?: boolean;
    username?: string;
  }): Promise<{
    success: boolean;
    token?: string;
    user?: AdminUser;
    expiresAt?: number;
    message?: string;
  }> {
    const res = await fetch(`${BASE_URL}/api/auth/login-step2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  async login(username: string, password: string): Promise<{ success: boolean; user?: AdminUser; token?: string; message?: string }> {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return res.json();
  },

  async verifySession(): Promise<{ valid: boolean; user?: AdminUser; expiresAt?: number }> {
    const token = localStorage.getItem('png_admin_token');
    if (!token) return { valid: false };
    try {
      const res = await fetch(`${BASE_URL}/api/auth/session`, {
        headers: getAuthHeaders(),
      });
      return res.json();
    } catch {
      return { valid: false };
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } finally {
      localStorage.removeItem('png_admin_token');
      localStorage.removeItem('png_admin_user');
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string; token?: string }> {
    const res = await fetch(`${BASE_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to change password');
    if (data.token) {
      localStorage.setItem('png_admin_token', data.token);
    }
    return data;
  },

  async resetPasswordWithRecovery(username: string, recoveryCode: string, newPassword: string): Promise<{
    success: boolean;
    message: string;
    token?: string;
    user?: AdminUser;
  }> {
    const res = await fetch(`${BASE_URL}/api/auth/reset-password-recovery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, recoveryCode, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to reset password');
    if (data.token && data.user) {
      localStorage.setItem('png_admin_token', data.token);
      localStorage.setItem('png_admin_user', JSON.stringify(data.user));
    }
    return data;
  },

  async getAuditLogs(): Promise<any[]> {
    const res = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  async revokeAllSessions(): Promise<{ success: boolean; message: string; token?: string }> {
    const res = await fetch(`${BASE_URL}/api/admin/revoke-all-sessions`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('png_admin_token', data.token);
    }
    return data;
  },

  async regenerateRecoveryCodes(): Promise<{ success: boolean; recoveryCodes: string[] }> {
    const res = await fetch(`${BASE_URL}/api/admin/regenerate-recovery-codes`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async getAdminUsers(): Promise<AdminUser[]> {
    const res = await fetch(`${BASE_URL}/api/admin/users`);
    return res.json();
  },

  // Backup & Import
  async importBackup(data: DatabaseState): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/api/backup/import`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to import backup');
    }
    return res.json();
  }
};
