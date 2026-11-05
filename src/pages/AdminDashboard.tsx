import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Newspaper,
  PlusCircle,
  FolderTree,
  Flame,
  Star,
  Megaphone,
  Image as ImageIcon,
  Video,
  Users,
  MessageSquare,
  Mail,
  Search,
  Share2,
  Sliders,
  Menu as MenuIcon,
  Settings,
  UserCheck,
  ShieldAlert,
  Database,
  CloudUpload,
  LogOut,
  Edit,
  Trash2,
  Check,
  X,
  ExternalLink,
  Upload,
  Copy,
  Eye,
  RefreshCw,
  Save,
  Download,
  AlertCircle,
  Lock,
  ArrowRight,
  TrendingUp,
  BarChart2,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import {
  Article,
  Category,
  BreakingNewsItem,
  AdSlot,
  VideoItem,
  Author,
  CommentItem,
  NewsletterSubscriber,
  WebsiteSettings,
  AdminUser,
  DatabaseState
} from '../types/news';
import { api } from '../services/api';

interface AdminDashboardProps {
  onBackToSite: () => void;
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToSite, onRefreshData }) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('png_admin_token'));
  });
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('png_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Multi-Step Secure Authentication States
  const [loginStep, setLoginStep] = useState<'credentials' | '2fa' | 'recovery'>('credentials');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [captcha, setCaptcha] = useState<{ id: string; question: string } | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [dev2FACode, setDev2FACode] = useState('');
  const [isUsingRecoveryIn2FA, setIsUsingRecoveryIn2FA] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Emergency Password Reset State
  const [recUsername, setRecUsername] = useState('alamin11gtN');
  const [recCode, setRecCode] = useState('');
  const [recNewPassword, setRecNewPassword] = useState('');
  const [recConfirmPassword, setRecConfirmPassword] = useState('');

  // Password Change in Admin Settings
  const [changeCurrPassword, setChangeCurrPassword] = useState('');
  const [changeNewPassword, setChangeNewPassword] = useState('');
  const [changeConfirmPassword, setChangeConfirmPassword] = useState('');
  const [changeLoading, setChangeLoading] = useState(false);

  // Active Tab: 1 to 21
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Main Data States
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [breakingNews, setBreakingNews] = useState<BreakingNewsItem[]>([]);
  const [ads, setAds] = useState<AdSlot[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);

  // Real-time Audit Logs from server
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Feedback Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search and filter inside tables
  const [articleSearch, setArticleSearch] = useState('');
  const [articleCategoryFilter, setArticleCategoryFilter] = useState('all');

  // Edit / Add Article Form State
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);

  // Category Edit Form State
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  // Breaking News Edit Form State
  const [editingBreaking, setEditingBreaking] = useState<Partial<BreakingNewsItem> | null>(null);

  // Ad Slot Edit Form State
  const [editingAd, setEditingAd] = useState<AdSlot | null>(null);

  // Author Edit Form State
  const [editingAuthor, setEditingAuthor] = useState<Partial<Author> | null>(null);

  // Video Edit Form State
  const [editingVideo, setEditingVideo] = useState<Partial<VideoItem> | null>(null);

  // Media Upload State
  const [uploadingImage, setUploadingImage] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchCaptcha = async () => {
    try {
      const data = await api.getCaptcha();
      setCaptcha(data);
      setCaptchaAnswer('');
    } catch {
      // Retry once if needed
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      fetchCaptcha();
    }
  }, [isAuthenticated]);

  const loadAuditLogs = async () => {
    try {
      const logs = await api.getAuditLogs();
      setAuditLogs(logs);
    } catch (e) {
      console.warn('Failed to load audit logs:', e);
    }
  };

  const loadAllData = async () => {
    try {
      const [artRes, catRes, bnRes, adsRes, vidRes, authRes, commRes, subRes, setRes, admRes, medRes] = await Promise.all([
        api.getArticles(),
        api.getCategories(),
        api.getBreakingNews(true),
        api.getAds(),
        api.getVideos(),
        api.getAuthors(),
        api.getComments(),
        api.getSubscribers(),
        api.getSettings(),
        api.getAdminUsers(),
        api.getMedia(),
      ]);
      setArticles(artRes.items);
      setCategories(catRes);
      setBreakingNews(bnRes);
      setAds(adsRes);
      setVideos(vidRes);
      setAuthors(authRes);
      setComments(commRes);
      setSubscribers(subRes);
      setSettings(setRes);
      setAdminUsers(admRes);
      setMediaFiles(medRes);
      loadAuditLogs();
    } catch (e) {
      console.error('Error loading admin data', e);
    }
  };

  // Verify Active Session on Mount
  useEffect(() => {
    if (isAuthenticated) {
      api.verifySession().then(res => {
        if (!res.valid) {
          handleLogout();
        } else {
          loadAllData();
        }
      });
    }
  }, [isAuthenticated]);

  // Step 1: Submit Credentials + Anti-Bot CAPTCHA
  const handleStep1Login = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim() || !loginPassword) {
      setLoginError('Please enter your administrator username and password.');
      return;
    }
    if (!captcha || !captchaAnswer.trim()) {
      setLoginError('Please answer the security math question.');
      return;
    }

    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await api.loginStep1({
        username: loginUsername.trim(),
        password: loginPassword,
        captchaId: captcha.id,
        captchaAnswer: captchaAnswer.trim(),
      });

      if (res.success && res.requires2FA) {
        setChallengeId(res.challengeId || '');
        if (res.dev2FACode) {
          setDev2FACode(res.dev2FACode);
        }
        setLoginStep('2fa');
      } else {
        setLoginError(res.message || 'Invalid credentials.');
        fetchCaptcha();
      }
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed. Please verify credentials.');
      fetchCaptcha();
    } finally {
      setLoginLoading(false);
    }
  };

  // Step 2: Submit 2FA Code or Emergency Recovery Code
  const handleStep2Login = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorCode.trim()) {
      setLoginError(isUsingRecoveryIn2FA ? 'Please enter a valid backup recovery code.' : 'Please enter the 6-digit verification code.');
      return;
    }

    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await api.loginStep2({
        challengeId,
        code: twoFactorCode.trim(),
        isRecoveryCode: isUsingRecoveryIn2FA,
        username: loginUsername.trim(),
      });

      if (res.success && res.token && res.user) {
        localStorage.setItem('png_admin_token', res.token);
        localStorage.setItem('png_admin_user', JSON.stringify(res.user));
        setIsAuthenticated(true);
        setCurrentUser(res.user);
        showToast('Authentication confirmed. Welcome to PRIME NEWS GRAPH CMS.');
      } else {
        setLoginError(res.message || 'Invalid verification code.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Verification failed.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Emergency Password Reset with Recovery Code
  const handleEmergencyRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recUsername.trim() || !recCode.trim() || !recNewPassword) {
      setLoginError('All fields are required.');
      return;
    }
    if (recNewPassword.length < 8) {
      setLoginError('New password must be at least 8 characters.');
      return;
    }
    if (recNewPassword !== recConfirmPassword) {
      setLoginError('New passwords do not match.');
      return;
    }

    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await api.resetPasswordWithRecovery(
        recUsername.trim(),
        recCode.trim(),
        recNewPassword
      );

      if (res.success && res.token && res.user) {
        setIsAuthenticated(true);
        setCurrentUser(res.user);
        showToast('Password reset successfully via emergency recovery code.');
      } else {
        setLoginError(res.message || 'Recovery code failed.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Emergency recovery failed.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setLoginStep('credentials');
    setLoginPassword('');
    setTwoFactorCode('');
    fetchCaptcha();
  };

  // Change Admin Password Form
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeCurrPassword || !changeNewPassword) {
      alert('Please fill in current and new password.');
      return;
    }
    if (changeNewPassword.length < 8) {
      alert('New password must be at least 8 characters long.');
      return;
    }
    if (changeNewPassword !== changeConfirmPassword) {
      alert('New password and confirmation do not match.');
      return;
    }

    setChangeLoading(true);
    try {
      const res = await api.changePassword(changeCurrPassword, changeNewPassword);
      if (res.success) {
        showToast('Password updated successfully. Other active sessions revoked.');
        setChangeCurrPassword('');
        setChangeNewPassword('');
        setChangeConfirmPassword('');
        loadAuditLogs();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update password');
    } finally {
      setChangeLoading(false);
    }
  };

  // Revoke All Other Sessions
  const handleRevokeSessions = async () => {
    if (!confirm('Are you sure you want to revoke all other active administrative sessions?')) return;
    try {
      const res = await api.revokeAllSessions();
      if (res.success) {
        showToast('All other sessions revoked successfully.');
        loadAuditLogs();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to revoke sessions');
    }
  };

  // Regenerate Recovery Codes
  const handleRegenerateRecoveryCodes = async () => {
    if (!confirm('Regenerating recovery codes will invalidate all previous backup codes. Proceed?')) return;
    try {
      const res = await api.regenerateRecoveryCodes();
      if (res.success) {
        showToast('New backup recovery codes generated.');
        loadAllData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to regenerate codes');
    }
  };

  // --- Article Actions ---
  const handleCreateNewArticle = () => {
    setEditingArticle({
      title_bn: '',
      title_en: '',
      summary_bn: '',
      summary_en: '',
      content_bn: '',
      content_en: '',
      category_id: categories[0]?.id || 'cat-1',
      category_slug: categories[0]?.slug || 'national',
      category_name_bn: categories[0]?.name_bn || 'জাতীয়',
      category_name_en: categories[0]?.name_en || 'National',
      author_id: authors[0]?.id || 'auth-1',
      author_name: authors[0]?.name || 'Editorial Team',
      featured_image: '/src/assets/images/news_world_summit_1793801922828.jpg',
      image_caption_bn: '',
      image_caption_en: '',
      status: 'published',
      is_featured: false,
      is_editors_choice: false,
      views_count: 0,
      reading_time_minutes: 4,
      tags: ['News'],
    });
    setActiveTab('add_article');
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle || !editingArticle.title_bn) {
      alert('Bengali headline is required.');
      return;
    }

    try {
      const selectedCat = categories.find(c => c.id === editingArticle.category_id || c.slug === editingArticle.category_slug);
      const selectedAuth = authors.find(a => a.id === editingArticle.author_id);

      const toSave: Partial<Article> = {
        ...editingArticle,
        category_name_bn: selectedCat ? selectedCat.name_bn : editingArticle.category_name_bn,
        category_name_en: selectedCat ? selectedCat.name_en : editingArticle.category_name_en,
        category_slug: selectedCat ? selectedCat.slug : editingArticle.category_slug,
        author_name: selectedAuth ? selectedAuth.name : editingArticle.author_name,
        author_role: selectedAuth ? selectedAuth.role : editingArticle.author_role,
        author_avatar: selectedAuth ? selectedAuth.avatar : editingArticle.author_avatar,
      };

      await api.saveArticle(toSave);
      showToast('Article saved successfully.');
      setEditingArticle(null);
      setActiveTab('articles');
      loadAllData();
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Error saving article');
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (confirm('Are you sure you want to delete this article? This action is irreversible.')) {
      await api.deleteArticle(id);
      showToast('Article deleted.');
      loadAllData();
      onRefreshData();
    }
  };

  const handleToggleArticleFeatured = async (art: Article) => {
    await api.saveArticle({ id: art.id, is_featured: !art.is_featured });
    showToast(art.is_featured ? 'Removed from featured.' : 'Marked as featured.');
    loadAllData();
    onRefreshData();
  };

  // --- Category Actions ---
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name_bn || !editingCategory.slug) return;
    await api.saveCategory(editingCategory);
    showToast('Category saved.');
    setEditingCategory(null);
    loadAllData();
    onRefreshData();
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Delete this category?')) {
      await api.deleteCategory(id);
      showToast('Category removed.');
      loadAllData();
      onRefreshData();
    }
  };

  // --- Breaking News Actions ---
  const handleSaveBreaking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBreaking || !editingBreaking.title_bn) return;
    await api.saveBreakingNews(editingBreaking);
    showToast('Breaking news headline updated.');
    setEditingBreaking(null);
    loadAllData();
    onRefreshData();
  };

  const handleDeleteBreaking = async (id: string) => {
    if (confirm('Delete this breaking headline?')) {
      await api.deleteBreakingNews(id);
      showToast('Breaking news deleted.');
      loadAllData();
      onRefreshData();
    }
  };

  // --- Adsterra Actions ---
  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAd) return;
    await api.saveAd(editingAd);
    showToast(`Ad slot "${editingAd.name}" updated successfully.`);
    setEditingAd(null);
    loadAllData();
    onRefreshData();
  };

  // --- Author Actions ---
  const handleSaveAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAuthor || !editingAuthor.name) return;
    await api.saveAuthor(editingAuthor);
    showToast('Author profile saved.');
    setEditingAuthor(null);
    loadAllData();
    onRefreshData();
  };

  const handleDeleteAuthor = async (id: string) => {
    if (confirm('Delete author profile?')) {
      await api.deleteAuthor(id);
      showToast('Author deleted.');
      loadAllData();
      onRefreshData();
    }
  };

  // --- Video Actions ---
  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo || !editingVideo.title_bn || !editingVideo.youtube_id) return;
    await api.saveVideo(editingVideo);
    showToast('Video news updated.');
    setEditingVideo(null);
    loadAllData();
    onRefreshData();
  };

  const handleDeleteVideo = async (id: string) => {
    if (confirm('Delete video item?')) {
      await api.deleteVideo(id);
      showToast('Video deleted.');
      loadAllData();
      onRefreshData();
    }
  };

  // --- Comments Actions ---
  const handleUpdateCommentStatus = async (id: string, status: 'approved' | 'pending' | 'spam') => {
    await api.updateCommentStatus(id, status);
    showToast(`Comment status set to ${status}.`);
    loadAllData();
    onRefreshData();
  };

  const handleDeleteComment = async (id: string) => {
    if (confirm('Delete comment?')) {
      await api.deleteComment(id);
      showToast('Comment deleted.');
      loadAllData();
      onRefreshData();
    }
  };

  // --- Subscribers Actions ---
  const handleDeleteSubscriber = async (id: string) => {
    if (confirm('Unsubscribe this email?')) {
      await api.deleteSubscriber(id);
      showToast('Subscriber removed.');
      loadAllData();
      onRefreshData();
    }
  };

  const handleExportSubscribersCSV = () => {
    const csvContent = 'data:text/csv;charset=utf-8,ID,Email,Created At,Status\n' +
      subscribers.map(s => `${s.id},"${s.email}",${s.created_at},${s.status}`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `prime-subscribers-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Subscribers CSV exported.');
  };

  // --- Website Settings Actions ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    await api.updateSettings(settings);
    showToast('Website global settings updated.');
    loadAllData();
    onRefreshData();
  };

  // --- Media Library Upload Action ---
  const handleMediaFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        await api.uploadMedia(file.name, base64);
        showToast('Image uploaded successfully to Media Library.');
        loadAllData();
      } catch (err: any) {
        alert(err.message || 'Upload failed');
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // --- Database Backup Import ---
  const handleImportBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const json = JSON.parse(reader.result as string);
        const res = await api.importBackup(json);
        if (res.success) {
          showToast('Database restored successfully.');
          loadAllData();
          onRefreshData();
        } else {
          alert('Import failed: ' + res.message);
        }
      } catch (err) {
        alert('Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  // Total Views Calculation
  const totalViews = articles.reduce((acc, a) => acc + (a.views_count || 0), 0);

  // If Not Authenticated, Show Maximum Security Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070D18] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-[#0F1A2E] p-8 shadow-2xl border border-slate-700/80 text-white relative">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#246BFD]/20 text-[#246BFD] mb-3 shadow-inner border border-[#246BFD]/30">
              <Lock className="h-7 w-7 text-[#246BFD]" />
            </div>
            <h1 className="text-2xl font-bold font-serif tracking-tight text-white">
              PRIME NEWS GRAPH
            </h1>
            <p className="mt-1 text-[11px] text-slate-400 uppercase tracking-widest font-semibold">
              Authorized Newsroom Administrator Control
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Maximum Security &bull; PBKDF2-SHA512 &bull; 2FA Protected
            </div>
          </div>

          {loginError && (
            <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <span className="leading-relaxed">{loginError}</span>
            </div>
          )}

          {/* STEP 1: CREDENTIALS + ANTI-BOT CAPTCHA */}
          {loginStep === 'credentials' && (
            <form onSubmit={handleStep1Login} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Administrator Username / Email
                </label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={e => setLoginUsername(e.target.value)}
                  placeholder="Enter administrator username"
                  required
                  autoComplete="username"
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#246BFD] focus:ring-1 focus:ring-[#246BFD]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Master Password
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Enter secure password"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#246BFD] focus:ring-1 focus:ring-[#246BFD]"
                />
              </div>

              {/* Anti-Bot Math Challenge */}
              <div className="rounded-lg bg-slate-900/80 border border-slate-700 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 text-[#246BFD]" />
                    Bot Protection Challenge
                  </span>
                  <button
                    type="button"
                    onClick={fetchCaptcha}
                    className="text-[11px] text-[#246BFD] hover:underline flex items-center gap-1"
                    title="Refresh Challenge"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Refresh</span>
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded bg-slate-800 text-sm font-mono font-bold text-amber-300 border border-slate-700">
                    {captcha ? captcha.question : 'Loading challenge...'}
                  </div>
                  <input
                    type="text"
                    value={captchaAnswer}
                    onChange={e => setCaptchaAnswer(e.target.value)}
                    placeholder="Your Answer"
                    required
                    className="flex-1 rounded bg-slate-950 border border-slate-700 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#246BFD]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full rounded-lg bg-[#246BFD] hover:bg-blue-600 py-3 text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loginLoading ? 'Verifying Credentials...' : 'Verify Credentials & Proceed to 2FA'}
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => {
                    setLoginError('');
                    setLoginStep('recovery');
                  }}
                  className="text-slate-400 hover:text-amber-400 transition-colors"
                >
                  Emergency Password Reset
                </button>
                <button
                  type="button"
                  onClick={onBackToSite}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  &larr; Back to Portal
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: TWO-FACTOR AUTHENTICATION */}
          {loginStep === '2fa' && (
            <form onSubmit={handleStep2Login} className="space-y-4">
              <div className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                <span className="font-bold">Step 2: Dual-Layer Identity Verification</span>
                <p className="mt-1 text-[11px] text-slate-300">
                  {isUsingRecoveryIn2FA
                    ? 'Enter one of your single-use backup recovery codes.'
                    : `Enter the 6-digit verification code sent to owner account (${loginUsername}).`}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 text-center">
                  {isUsingRecoveryIn2FA ? 'Emergency Recovery Code (PNG-XXXX-XXXX)' : '6-Digit Verification Code'}
                </label>
                <input
                  type="text"
                  value={twoFactorCode}
                  onChange={e => setTwoFactorCode(e.target.value)}
                  placeholder={isUsingRecoveryIn2FA ? 'PNG-9821-4192' : '123456'}
                  maxLength={isUsingRecoveryIn2FA ? 16 : 6}
                  required
                  autoFocus
                  className="w-full text-center tracking-widest font-mono text-lg font-bold rounded-lg bg-slate-900 border border-[#246BFD] px-3.5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#246BFD]"
                />
              </div>

              {/* Dev Simulation Helper */}
              {dev2FACode && !isUsingRecoveryIn2FA && (
                <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/30 text-center">
                  <span className="text-[11px] text-amber-300 block mb-1">
                    Simulator / Demo 2FA Code Generated:
                  </span>
                  <button
                    type="button"
                    onClick={() => setTwoFactorCode(dev2FACode)}
                    className="font-mono text-sm font-bold text-amber-400 bg-amber-500/20 px-3 py-1 rounded hover:bg-amber-500/30 transition-colors"
                  >
                    {dev2FACode} (Click to Auto-fill Code)
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full rounded-lg bg-[#246BFD] hover:bg-blue-600 py-3 text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loginLoading ? 'Validating 2FA...' : 'Complete Authentication & Enter Dashboard'}
                <Check className="h-4 w-4" />
              </button>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => setIsUsingRecoveryIn2FA(!isUsingRecoveryIn2FA)}
                  className="text-amber-400 hover:underline"
                >
                  {isUsingRecoveryIn2FA ? 'Use 6-digit 2FA code instead' : 'Use Backup Recovery Code'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginError('');
                    setLoginStep('credentials');
                    fetchCaptcha();
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  &larr; Back to Step 1
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: EMERGENCY RECOVERY & PASSWORD RESET */}
          {loginStep === 'recovery' && (
            <form onSubmit={handleEmergencyRecovery} className="space-y-4">
              <div className="text-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                <span className="font-bold">Emergency Administrative Password Reset</span>
                <p className="mt-1 text-[11px] text-slate-300">
                  Provide your backup recovery code to reset credentials and regain full access.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Administrator Username
                </label>
                <input
                  type="text"
                  value={recUsername}
                  onChange={e => setRecUsername(e.target.value)}
                  required
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#246BFD]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Single-Use Recovery Code (PNG-XXXX-XXXX)
                </label>
                <input
                  type="text"
                  value={recCode}
                  onChange={e => setRecCode(e.target.value)}
                  placeholder="PNG-9821-4192"
                  required
                  className="w-full font-mono rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#246BFD]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  New Password (min 8 chars)
                </label>
                <input
                  type="password"
                  value={recNewPassword}
                  onChange={e => setRecNewPassword(e.target.value)}
                  placeholder="Enter strong new password"
                  required
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#246BFD]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={recConfirmPassword}
                  onChange={e => setRecConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#246BFD]"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full rounded-lg bg-amber-500 hover:bg-amber-600 py-3 text-sm font-bold text-slate-950 shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loginLoading ? 'Resetting Password...' : 'Reset Password & Restore Access'}
                <Check className="h-4 w-4" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setLoginError('');
                    setLoginStep('credentials');
                    fetchCaptcha();
                  }}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  &larr; Cancel and return to Login
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    );
  }

  // Navigation Items list for the 22 sections
  const NAV_ITEMS = [
    { id: 'overview', label: '1. Dashboard Overview', icon: LayoutDashboard },
    { id: 'articles', label: '2. News Management', icon: Newspaper },
    { id: 'add_article', label: '3. Add New News', icon: PlusCircle },
    { id: 'categories', label: '4. Categories', icon: FolderTree },
    { id: 'breaking_news', label: '5. Breaking News', icon: Flame },
    { id: 'featured_news', label: '6. Featured News', icon: Star },
    { id: 'advertisements', label: '7. Adsterra Ads Management', icon: Megaphone },
    { id: 'media_library', label: '8. Media Library', icon: ImageIcon },
    { id: 'videos', label: '9. Video Management', icon: Video },
    { id: 'authors', label: '10. Authors Management', icon: Users },
    { id: 'comments', label: '11. Comments Moderation', icon: MessageSquare },
    { id: 'subscribers', label: '12. Newsletter Subscribers', icon: Mail },
    { id: 'seo', label: '13. SEO Settings', icon: Search },
    { id: 'social', label: '14. Social Media Settings', icon: Share2 },
    { id: 'homepage', label: '15. Homepage Settings', icon: Sliders },
    { id: 'menus', label: '16. Menu Management', icon: MenuIcon },
    { id: 'website_settings', label: '17. Website Settings', icon: Settings },
    { id: 'admin_users', label: '18. Admin Users', icon: UserCheck },
    { id: 'security', label: '19. Security Settings', icon: ShieldAlert },
    { id: 'backup_export', label: '20. Backup & Export', icon: Database },
    { id: 'netlify_deploy', label: '21. Netlify Deployment Info', icon: CloudUpload },
  ];

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-[#101D35] text-white px-4 py-3 shadow-xl border border-slate-700 animate-fade-in text-xs font-semibold">
          <CheckCircle2 className="h-4 w-4 text-[#246BFD]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Top Navbar */}
      <header className="h-16 bg-[#101D35] text-white flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-4">
          <span className="font-serif text-lg font-bold tracking-tight text-white">
            PRIME NEWS GRAPH <span className="text-xs font-mono font-normal text-amber-400 ml-1">ADMIN CMS v1.0</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onBackToSite}
            className="flex items-center gap-1.5 rounded bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5 text-[#246BFD]" />
            <span>View Public Portal</span>
          </button>

          <div className="flex items-center gap-2 border-l border-slate-700 pl-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white">{currentUser?.username || 'admin'}</div>
              <div className="text-[10px] text-amber-400 capitalize">{currentUser?.role || 'super_admin'}</div>
            </div>
            <button
              onClick={handleLogout}
              className="rounded p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content: Sidebar + Active Panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-[#0F172A] text-slate-300 flex flex-col shrink-0 border-r border-slate-800 overflow-y-auto">
          <div className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Control Navigation
          </div>
          <nav className="flex-1 space-y-0.5 px-2 pb-6">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.id === 'add_article' && !editingArticle) {
                      handleCreateNewArticle();
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md transition-colors text-left ${
                    isSelected
                      ? 'bg-[#246BFD] text-white font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Workspace Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-slate-900">Dashboard Overview</h2>
                  <p className="text-xs text-slate-500">Live operational telemetry, article traffic, and newsroom metrics.</p>
                </div>
                <button
                  onClick={handleCreateNewArticle}
                  className="flex items-center gap-2 bg-[#246BFD] hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Publish New Article</span>
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl bg-white p-5 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Articles</span>
                    <Newspaper className="h-5 w-5 text-[#246BFD]" />
                  </div>
                  <div className="mt-2 text-2xl font-bold font-serif text-slate-900 tabular-nums">
                    {articles.length}
                  </div>
                  <div className="mt-1 text-[11px] text-emerald-600 font-medium">
                    {articles.filter(a => a.status === 'published').length} active & published
                  </div>
                </div>

                <div className="rounded-xl bg-white p-5 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Page Views</span>
                    <Eye className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div className="mt-2 text-2xl font-bold font-serif text-slate-900 tabular-nums">
                    {totalViews.toLocaleString()}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    Live database tracking
                  </div>
                </div>

                <div className="rounded-xl bg-white p-5 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Subscribers</span>
                    <Mail className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="mt-2 text-2xl font-bold font-serif text-slate-900 tabular-nums">
                    {subscribers.length}
                  </div>
                  <div className="mt-1 text-[11px] text-emerald-600 font-medium">
                    Verified email subscribers
                  </div>
                </div>

                <div className="rounded-xl bg-white p-5 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Active Ad Slots</span>
                    <Megaphone className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="mt-2 text-2xl font-bold font-serif text-slate-900 tabular-nums">
                    {ads.filter(a => a.is_active).length} / {ads.length}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    Adsterra network ready
                  </div>
                </div>
              </div>

              {/* Recent Articles & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 rounded-xl bg-white p-6 border border-slate-200/80 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif font-bold text-slate-900 text-base">Recently Published News</h3>
                    <button
                      onClick={() => setActiveTab('articles')}
                      className="text-xs font-bold text-[#246BFD] hover:underline"
                    >
                      View All Articles &rarr;
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {articles.slice(0, 5).map(art => (
                      <div key={art.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={art.featured_image}
                            alt=""
                            className="h-10 w-14 object-cover rounded bg-slate-100 shrink-0"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900 line-clamp-1">{art.title_bn}</div>
                            <div className="text-[11px] text-slate-400">
                              {art.category_name_bn} · By {art.author_name} · {art.views_count.toLocaleString()} views
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setEditingArticle(art);
                            setActiveTab('add_article');
                          }}
                          className="px-2.5 py-1 text-xs font-medium rounded border border-slate-200 hover:bg-slate-50 text-slate-700"
                        >
                          Edit
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-4 rounded-xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
                  <h3 className="font-serif font-bold text-slate-900 text-base">Quick Newsroom Tools</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setActiveTab('breaking_news')}
                      className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-red-500 bg-red-50/30 text-left transition-colors"
                    >
                      <div>
                        <div className="text-xs font-bold text-red-900">Manage Breaking News Ticker</div>
                        <div className="text-[10px] text-red-600">{breakingNews.filter(b => b.is_active).length} live tickers running</div>
                      </div>
                      <Flame className="h-5 w-5 text-red-500" />
                    </button>

                    <button
                      onClick={() => setActiveTab('advertisements')}
                      className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-[#246BFD] bg-blue-50/30 text-left transition-colors"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#101D35]">Adsterra Ad Placements</div>
                        <div className="text-[10px] text-slate-500">Configure 11 ad positions</div>
                      </div>
                      <Megaphone className="h-5 w-5 text-[#246BFD]" />
                    </button>

                    <button
                      onClick={() => setActiveTab('backup_export')}
                      className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-emerald-500 bg-emerald-50/30 text-left transition-colors"
                    >
                      <div>
                        <div className="text-xs font-bold text-emerald-900">Export Database Backup</div>
                        <div className="text-[10px] text-emerald-600">One-click JSON & SQL dump</div>
                      </div>
                      <Database className="h-5 w-5 text-emerald-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NEWS MANAGEMENT */}
          {activeTab === 'articles' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-slate-900">News Articles Management</h2>
                  <p className="text-xs text-slate-500">Browse, filter, edit, schedule, feature, or delete news articles.</p>
                </div>
                <button
                  onClick={handleCreateNewArticle}
                  className="flex items-center gap-2 bg-[#246BFD] hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Add New News</span>
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex-1 relative">
                  <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search articles by title, author, or tags..."
                    value={articleSearch}
                    onChange={e => setArticleSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:border-[#246BFD]"
                  />
                </div>
                <select
                  value={articleCategoryFilter}
                  onChange={e => setArticleCategoryFilter(e.target.value)}
                  className="text-xs rounded border border-slate-300 px-3 py-1.5 focus:outline-none focus:border-[#246BFD] bg-white"
                >
                  <option value="all">All Categories</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.slug}>{c.name_bn} ({c.name_en})</option>
                  ))}
                </select>
              </div>

              {/* Articles Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Article</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Author</th>
                        <th className="py-3 px-4">Views</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Featured</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {articles
                        .filter(a => {
                          const matchesCat = articleCategoryFilter === 'all' || a.category_slug === articleCategoryFilter;
                          const matchesSearch = !articleSearch ||
                            a.title_bn.toLowerCase().includes(articleSearch.toLowerCase()) ||
                            a.title_en.toLowerCase().includes(articleSearch.toLowerCase()) ||
                            a.author_name.toLowerCase().includes(articleSearch.toLowerCase());
                          return matchesCat && matchesSearch;
                        })
                        .map(art => (
                          <tr key={art.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 flex items-center gap-3">
                              <img src={art.featured_image} alt="" className="h-10 w-14 object-cover rounded bg-slate-100 shrink-0" />
                              <div>
                                <div className="font-bold text-slate-900 line-clamp-1 max-w-md">{art.title_bn}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{art.slug}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-700 whitespace-nowrap">
                              {art.category_name_bn}
                            </td>
                            <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                              {art.author_name}
                            </td>
                            <td className="py-3 px-4 tabular-nums font-mono font-medium text-slate-800 whitespace-nowrap">
                              {art.views_count.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                art.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {art.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <button
                                onClick={() => handleToggleArticleFeatured(art)}
                                className={`p-1 rounded ${art.is_featured ? 'text-amber-500 hover:text-amber-600' : 'text-slate-300 hover:text-slate-400'}`}
                                title={art.is_featured ? 'Remove featured' : 'Mark as featured'}
                              >
                                <Star className={`h-4 w-4 ${art.is_featured ? 'fill-amber-400' : ''}`} />
                              </button>
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => {
                                    setEditingArticle(art);
                                    setActiveTab('add_article');
                                  }}
                                  className="p-1 text-slate-600 hover:text-[#246BFD] hover:bg-slate-100 rounded"
                                  title="Edit Article"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteArticle(art.id)}
                                  className="p-1 text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded"
                                  title="Delete Article"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ADD / EDIT NEWS */}
          {activeTab === 'add_article' && (
            <div className="max-w-4xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-slate-900">
                    {editingArticle?.id ? 'Edit News Article' : 'Create New News Article'}
                  </h2>
                  <p className="text-xs text-slate-500">Fill in headline, summary, formatted editorial content, SEO metadata and category.</p>
                </div>
                <button
                  onClick={() => setActiveTab('articles')}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  &larr; Back to Articles List
                </button>
              </div>

              <form onSubmit={handleSaveArticle} className="space-y-6 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs">
                {/* Titles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Title (Bengali / বাংলা শিরোনাম) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingArticle?.title_bn || ''}
                      onChange={e => setEditingArticle(prev => ({ ...prev!, title_bn: e.target.value }))}
                      placeholder="বাংলায় সংবাদ শিরোনাম..."
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#246BFD]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Title (English Headline)
                    </label>
                    <input
                      type="text"
                      value={editingArticle?.title_en || ''}
                      onChange={e => setEditingArticle(prev => ({ ...prev!, title_en: e.target.value }))}
                      placeholder="English news headline..."
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-[#246BFD]"
                    />
                  </div>
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    URL Slug (e.g. news/global-summit-accord)
                  </label>
                  <input
                    type="text"
                    value={editingArticle?.slug || ''}
                    onChange={e => setEditingArticle(prev => ({ ...prev!, slug: e.target.value }))}
                    placeholder="Leave empty to auto-generate from title"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#246BFD]"
                  />
                </div>

                {/* Summaries */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Summary (Bengali)
                    </label>
                    <textarea
                      rows={3}
                      value={editingArticle?.summary_bn || ''}
                      onChange={e => setEditingArticle(prev => ({ ...prev!, summary_bn: e.target.value }))}
                      placeholder="সংক্ষিপ্ত সারসংক্ষেপ..."
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#246BFD]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Summary (English)
                    </label>
                    <textarea
                      rows={3}
                      value={editingArticle?.summary_en || ''}
                      onChange={e => setEditingArticle(prev => ({ ...prev!, summary_en: e.target.value }))}
                      placeholder="Short editorial summary..."
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#246BFD]"
                    />
                  </div>
                </div>

                {/* Category & Author Select */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={editingArticle?.category_id || categories[0]?.id}
                      onChange={e => setEditingArticle(prev => ({ ...prev!, category_id: e.target.value }))}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#246BFD] bg-white"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name_bn} ({c.name_en})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Author *
                    </label>
                    <select
                      value={editingArticle?.author_id || authors[0]?.id}
                      onChange={e => setEditingArticle(prev => ({ ...prev!, author_id: e.target.value }))}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#246BFD] bg-white"
                    >
                      {authors.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Publication Status
                    </label>
                    <select
                      value={editingArticle?.status || 'published'}
                      onChange={e => setEditingArticle(prev => ({ ...prev!, status: e.target.value as any }))}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#246BFD] bg-white"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>
                </div>

                {/* Featured Image & Video URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Featured Image URL or Path *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingArticle?.featured_image || ''}
                      onChange={e => setEditingArticle(prev => ({ ...prev!, featured_image: e.target.value }))}
                      placeholder="/src/assets/images/... or https://..."
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#246BFD]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      YouTube Video URL (Optional)
                    </label>
                    <input
                      type="text"
                      value={editingArticle?.video_url || ''}
                      onChange={e => setEditingArticle(prev => ({ ...prev!, video_url: e.target.value }))}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#246BFD]"
                    />
                  </div>
                </div>

                {/* Article Full Rich HTML Content (Bengali) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Article Full Content (HTML format) - Bengali *
                  </label>
                  <textarea
                    rows={8}
                    required
                    value={editingArticle?.content_bn || ''}
                    onChange={e => setEditingArticle(prev => ({ ...prev!, content_bn: e.target.value }))}
                    placeholder="<p class='lead'>সংবাদের বিস্তারিত বিবরণ...</p><h2>উপশিরোনাম</h2><p>অনুচ্ছেদ...</p>"
                    className="w-full rounded-lg border border-slate-300 p-3 font-mono text-xs text-slate-900 focus:outline-none focus:border-[#246BFD]"
                  />
                </div>

                {/* Options: Featured & Editors Choice */}
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={editingArticle?.is_featured || false}
                      onChange={e => setEditingArticle(prev => ({ ...prev!, is_featured: e.target.checked }))}
                      className="rounded border-slate-300 text-[#246BFD]"
                    />
                    <span>Highlight as Homepage Featured Story</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={editingArticle?.is_editors_choice || false}
                      onChange={e => setEditingArticle(prev => ({ ...prev!, is_editors_choice: e.target.checked }))}
                      className="rounded border-slate-300 text-[#246BFD]"
                    />
                    <span>Mark as Editor's Choice</span>
                  </label>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveTab('articles')}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[#246BFD] hover:bg-blue-600 text-white text-xs font-bold shadow-sm transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save & Publish Article</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: CATEGORIES MANAGEMENT */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-slate-900">Categories Management</h2>
                  <p className="text-xs text-slate-500">Configure news desks, slugs, sorting order and brand colors.</p>
                </div>
                <button
                  onClick={() => setEditingCategory({ name_bn: '', name_en: '', slug: '', color: '#246BFD', order_index: categories.length + 1 })}
                  className="flex items-center gap-2 bg-[#246BFD] hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Category</span>
                </button>
              </div>

              {/* Category Edit Form */}
              {editingCategory && (
                <form onSubmit={handleSaveCategory} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-slate-900">{editingCategory.id ? 'Edit Category' : 'Create Category'}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <input
                      type="text"
                      placeholder="Category Name (Bengali)"
                      required
                      value={editingCategory.name_bn || ''}
                      onChange={e => setEditingCategory(prev => ({ ...prev!, name_bn: e.target.value }))}
                      className="rounded border border-slate-300 p-2 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Category Name (English)"
                      required
                      value={editingCategory.name_en || ''}
                      onChange={e => setEditingCategory(prev => ({ ...prev!, name_en: e.target.value }))}
                      className="rounded border border-slate-300 p-2 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Slug (e.g. politics)"
                      required
                      value={editingCategory.slug || ''}
                      onChange={e => setEditingCategory(prev => ({ ...prev!, slug: e.target.value }))}
                      className="rounded border border-slate-300 p-2 text-xs font-mono"
                    />
                    <input
                      type="color"
                      value={editingCategory.color || '#246BFD'}
                      onChange={e => setEditingCategory(prev => ({ ...prev!, color: e.target.value }))}
                      className="h-9 w-full rounded border border-slate-300 p-1"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setEditingCategory(null)} className="px-3 py-1.5 rounded border text-xs">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 rounded bg-[#246BFD] text-white text-xs font-bold">Save Category</button>
                  </div>
                </form>
              )}

              {/* Categories Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Color</th>
                      <th className="py-3 px-4">Name (Bengali)</th>
                      <th className="py-3 px-4">Name (English)</th>
                      <th className="py-3 px-4">Slug</th>
                      <th className="py-3 px-4">Order</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {categories.map(c => (
                      <tr key={c.id}>
                        <td className="py-3 px-4">
                          <span className="inline-block h-4 w-4 rounded" style={{ backgroundColor: c.color }}></span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{c.name_bn}</td>
                        <td className="py-3 px-4 text-slate-700">{c.name_en}</td>
                        <td className="py-3 px-4 font-mono text-slate-500">{c.slug}</td>
                        <td className="py-3 px-4 font-mono">{c.order_index}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setEditingCategory(c)} className="p-1 hover:text-[#246BFD]"><Edit className="h-4 w-4" /></button>
                            <button onClick={() => handleDeleteCategory(c.id)} className="p-1 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: BREAKING NEWS */}
          {activeTab === 'breaking_news' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-slate-900">Breaking News Control Center</h2>
                  <p className="text-xs text-slate-500">Live scrolling ticker headlines, priority ordering, and target article links.</p>
                </div>
                <button
                  onClick={() => setEditingBreaking({ title_bn: '', title_en: '', label_bn: 'ব্রেকিং নিউজ', label_en: 'BREAKING NEWS', is_active: true, priority: breakingNews.length + 1 })}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xs font-bold"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Breaking Headline</span>
                </button>
              </div>

              {/* Form */}
              {editingBreaking && (
                <form onSubmit={handleSaveBreaking} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-slate-900">Configure Breaking Alert</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Headline (Bengali) *"
                      required
                      value={editingBreaking.title_bn || ''}
                      onChange={e => setEditingBreaking(prev => ({ ...prev!, title_bn: e.target.value }))}
                      className="rounded border border-slate-300 p-2 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Headline (English)"
                      value={editingBreaking.title_en || ''}
                      onChange={e => setEditingBreaking(prev => ({ ...prev!, title_en: e.target.value }))}
                      className="rounded border border-slate-300 p-2 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Target Article URL (/news/...)"
                      value={editingBreaking.target_url || ''}
                      onChange={e => setEditingBreaking(prev => ({ ...prev!, target_url: e.target.value }))}
                      className="rounded border border-slate-300 p-2 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Label (e.g. ব্রেকিং নিউজ)"
                      value={editingBreaking.label_bn || ''}
                      onChange={e => setEditingBreaking(prev => ({ ...prev!, label_bn: e.target.value }))}
                      className="rounded border border-slate-300 p-2 text-xs"
                    />
                    <label className="flex items-center gap-2 text-xs font-semibold">
                      <input
                        type="checkbox"
                        checked={editingBreaking.is_active ?? true}
                        onChange={e => setEditingBreaking(prev => ({ ...prev!, is_active: e.target.checked }))}
                      />
                      <span>Active Ticker</span>
                    </label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setEditingBreaking(null)} className="px-3 py-1.5 rounded border text-xs">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 rounded bg-red-600 text-white text-xs font-bold">Save Alert</button>
                  </div>
                </form>
              )}

              {/* Breaking News Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
                    <tr>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Headline (Bengali)</th>
                      <th className="py-3 px-4">English Headline</th>
                      <th className="py-3 px-4">Target Link</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {breakingNews.map(b => (
                      <tr key={b.id}>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${b.is_active ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                            {b.is_active ? 'LIVE' : 'OFF'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{b.title_bn}</td>
                        <td className="py-3 px-4 text-slate-600">{b.title_en}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-blue-600">{b.target_url}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setEditingBreaking(b)} className="p-1 hover:text-[#246BFD]"><Edit className="h-4 w-4" /></button>
                            <button onClick={() => handleDeleteBreaking(b.id)} className="p-1 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: FEATURED NEWS MANAGER */}
          {activeTab === 'featured_news' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold font-serif text-slate-900">Featured & Top News Manager</h2>
                <p className="text-xs text-slate-500">Curate hero placement, editor's choice, and high-impact homepage editorial spotlights.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span>Homepage Hero Candidates ({articles.filter(a => a.is_featured).length})</span>
                  </h3>
                  <div className="divide-y divide-slate-100">
                    {articles.filter(a => a.is_featured).map(art => (
                      <div key={art.id} className="py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src={art.featured_image} alt="" className="h-8 w-12 rounded object-cover" />
                          <span className="text-xs font-semibold text-slate-800 line-clamp-1 max-w-xs">{art.title_bn}</span>
                        </div>
                        <button
                          onClick={() => handleToggleArticleFeatured(art)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Flame className="h-4 w-4 text-red-500" />
                    <span>Editor's Choice Articles ({articles.filter(a => a.is_editors_choice).length})</span>
                  </h3>
                  <div className="divide-y divide-slate-100">
                    {articles.filter(a => a.is_editors_choice).map(art => (
                      <div key={art.id} className="py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src={art.featured_image} alt="" className="h-8 w-12 rounded object-cover" />
                          <span className="text-xs font-semibold text-slate-800 line-clamp-1 max-w-xs">{art.title_bn}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 tabular-nums">{art.views_count.toLocaleString()} views</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: ADSTERRA ADVERTISEMENT MANAGEMENT */}
          {activeTab === 'advertisements' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-slate-900">Adsterra Ads Management Center</h2>
                  <p className="text-xs text-slate-500">Configure script codes, banner HTML, impressions tracking, and device targets across 11 slots.</p>
                </div>
              </div>

              {/* Edit Modal / Form */}
              {editingAd && (
                <form onSubmit={handleSaveAd} className="bg-white p-6 rounded-xl border border-slate-300 shadow-lg space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-bold text-base text-slate-900">Edit Ad Slot: {editingAd.name}</h3>
                    <span className="font-mono text-xs text-slate-500">{editingAd.id}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                      <select
                        value={editingAd.is_active ? 'active' : 'inactive'}
                        onChange={e => setEditingAd({ ...editingAd, is_active: e.target.value === 'active' })}
                        className="w-full rounded border border-slate-300 p-2 text-xs"
                      >
                        <option value="active">Active & Displaying</option>
                        <option value="inactive">Disabled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Device Targeting</label>
                      <select
                        value={editingAd.device_target}
                        onChange={e => setEditingAd({ ...editingAd, device_target: e.target.value as any })}
                        className="w-full rounded border border-slate-300 p-2 text-xs"
                      >
                        <option value="all">All Devices (Desktop & Mobile)</option>
                        <option value="desktop">Desktop Only</option>
                        <option value="mobile">Mobile Devices Only</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Ad Format</label>
                      <select
                        value={editingAd.format}
                        onChange={e => setEditingAd({ ...editingAd, format: e.target.value as any })}
                        className="w-full rounded border border-slate-300 p-2 text-xs"
                      >
                        <option value="banner">Display Banner</option>
                        <option value="popunder">Popunder Script</option>
                        <option value="social_bar">Social Bar Notification</option>
                        <option value="native">Native In-Feed</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Adsterra Script Code / Custom HTML
                    </label>
                    <textarea
                      rows={6}
                      value={editingAd.ad_code || ''}
                      onChange={e => setEditingAd({ ...editingAd, ad_code: e.target.value })}
                      className="w-full rounded border border-slate-300 p-3 font-mono text-xs text-slate-800"
                      placeholder="<!-- Paste your Adsterra script tag or HTML banner code here -->"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setEditingAd(null)} className="px-4 py-2 border rounded text-xs">
                      Cancel
                    </button>
                    <button type="submit" className="px-5 py-2 bg-[#246BFD] text-white text-xs font-bold rounded">
                      Save Ad Configuration
                    </button>
                  </div>
                </form>
              )}

              {/* Ad Slots List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ads.map(ad => (
                  <div key={ad.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${ad.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                          {ad.is_active ? 'ACTIVE' : 'DISABLED'}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">{ad.device_target}</span>
                      </div>
                      <h4 className="mt-2 text-sm font-bold text-slate-900">{ad.name}</h4>
                      <div className="mt-1 font-mono text-[11px] text-slate-400">ID: {ad.id}</div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-[11px] text-slate-500">
                        <span className="font-bold text-slate-700 tabular-nums">{ad.impressions.toLocaleString()}</span> imp · <span className="font-bold text-slate-700 tabular-nums">{ad.clicks.toLocaleString()}</span> clicks
                      </div>
                      <button
                        onClick={() => setEditingAd(ad)}
                        className="px-3 py-1 rounded bg-slate-100 hover:bg-[#246BFD] hover:text-white text-slate-700 text-xs font-semibold transition-colors"
                      >
                        Edit Code
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: MEDIA LIBRARY */}
          {activeTab === 'media_library' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-slate-900">Media Library</h2>
                  <p className="text-xs text-slate-500">Persistent image uploads, CDN asset storage, and copyable article URLs.</p>
                </div>
                <label className="flex items-center gap-2 bg-[#246BFD] hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer">
                  <Upload className="h-4 w-4" />
                  <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                  <input type="file" accept="image/*" onChange={handleMediaFileUpload} className="hidden" />
                </label>
              </div>

              {/* Media Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {/* Pre-installed generated hero images */}
                {[
                  { name: 'World Summit Accord', url: '/src/assets/images/news_world_summit_1793801922828.jpg' },
                  { name: '2nm AI Semiconductor', url: '/src/assets/images/news_tech_ai_chip_1793801922448.jpg' },
                  { name: 'Dhaka Metro Rail Network', url: '/src/assets/images/news_dhaka_metro_1793801923998.jpg' },
                  { name: 'Cricket World Cup Final', url: '/src/assets/images/news_cricket_stadium_1793801922344.jpg' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs group">
                    <div className="aspect-square bg-slate-100 overflow-hidden relative">
                      <img src={item.url} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="p-2">
                      <div className="text-[11px] font-bold text-slate-800 truncate">{item.name}</div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.url);
                          showToast('Image URL copied to clipboard.');
                        }}
                        className="mt-1 flex items-center gap-1 text-[10px] text-[#246BFD] font-semibold hover:underline"
                      >
                        <Copy className="h-3 w-3" />
                        <span>Copy URL</span>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Uploaded media files */}
                {mediaFiles.map(file => (
                  <div key={file.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs group">
                    <div className="aspect-square bg-slate-100 overflow-hidden relative">
                      <img src={file.url} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="p-2">
                      <div className="text-[11px] font-bold text-slate-800 truncate">{file.name}</div>
                      <div className="flex items-center justify-between mt-1">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(file.url);
                            showToast('Image URL copied.');
                          }}
                          className="flex items-center gap-1 text-[10px] text-[#246BFD] font-semibold hover:underline"
                        >
                          <Copy className="h-3 w-3" />
                          <span>Copy URL</span>
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('Delete media file?')) {
                              await api.deleteMedia(file.name);
                              showToast('Media file removed.');
                              loadAllData();
                            }
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: VIDEO MANAGEMENT */}
          {activeTab === 'videos' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-slate-900">Video Reports Management</h2>
                  <p className="text-xs text-slate-500">Curate embedded YouTube news documentaries, reports and featured streams.</p>
                </div>
                <button
                  onClick={() => setEditingVideo({ title_bn: '', title_en: '', youtube_id: '', category: 'national', is_featured: false })}
                  className="flex items-center gap-2 bg-[#246BFD] hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Video</span>
                </button>
              </div>

              {editingVideo && (
                <form onSubmit={handleSaveVideo} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-slate-900">Add Video Report</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Video Title (Bengali)"
                      required
                      value={editingVideo.title_bn || ''}
                      onChange={e => setEditingVideo({ ...editingVideo, title_bn: e.target.value })}
                      className="rounded border border-slate-300 p-2 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="YouTube Video ID (e.g. LXb3EKWsInQ)"
                      required
                      value={editingVideo.youtube_id || ''}
                      onChange={e => setEditingVideo({ ...editingVideo, youtube_id: e.target.value })}
                      className="rounded border border-slate-300 p-2 text-xs font-mono"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setEditingVideo(null)} className="px-3 py-1.5 border rounded text-xs">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 bg-[#246BFD] text-white text-xs font-bold rounded">Save Video</button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {videos.map(v => (
                  <div key={v.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                    <div className="aspect-video bg-black relative">
                      <img src={`https://img.youtube.com/vi/${v.youtube_id}/mqdefault.jpg`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{v.title_bn}</h4>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                        <span>ID: {v.youtube_id}</span>
                        <button onClick={() => handleDeleteVideo(v.id)} className="text-red-500 hover:text-red-700">Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: AUTHORS MANAGEMENT */}
          {activeTab === 'authors' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-slate-900">Authors & Journalists Management</h2>
                  <p className="text-xs text-slate-500">Manage correspondents, biographies, credentials, and social links.</p>
                </div>
                <button
                  onClick={() => setEditingAuthor({ name: '', role: 'Special Correspondent', email: '', bio_bn: '' })}
                  className="flex items-center gap-2 bg-[#246BFD] hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Author</span>
                </button>
              </div>

              {editingAuthor && (
                <form onSubmit={handleSaveAuthor} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-sm text-slate-900">Author Profile</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Author Name"
                      required
                      value={editingAuthor.name || ''}
                      onChange={e => setEditingAuthor({ ...editingAuthor, name: e.target.value })}
                      className="rounded border border-slate-300 p-2 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Role (e.g. Senior Political Analyst)"
                      value={editingAuthor.role || ''}
                      onChange={e => setEditingAuthor({ ...editingAuthor, role: e.target.value })}
                      className="rounded border border-slate-300 p-2 text-xs"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={editingAuthor.email || ''}
                      onChange={e => setEditingAuthor({ ...editingAuthor, email: e.target.value })}
                      className="rounded border border-slate-300 p-2 text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setEditingAuthor(null)} className="px-3 py-1.5 border rounded text-xs">Cancel</button>
                    <button type="submit" className="px-4 py-1.5 bg-[#246BFD] text-white text-xs font-bold rounded">Save Author</button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {authors.map(a => (
                  <div key={a.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs text-center flex flex-col justify-between">
                    <div>
                      <img src={a.avatar} alt="" className="h-16 w-16 rounded-full mx-auto object-cover border border-slate-200 mb-3" />
                      <h4 className="text-sm font-bold text-slate-900">{a.name}</h4>
                      <p className="text-xs text-[#246BFD] font-medium">{a.role}</p>
                      <p className="mt-2 text-[11px] text-slate-500 line-clamp-2">{a.bio_bn}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-center gap-2">
                      <button onClick={() => setEditingAuthor(a)} className="text-xs text-blue-600 font-semibold hover:underline">Edit</button>
                      <span className="text-slate-300">·</span>
                      <button onClick={() => handleDeleteAuthor(a.id)} className="text-xs text-red-600 font-semibold hover:underline">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 11: COMMENTS MODERATION */}
          {activeTab === 'comments' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold font-serif text-slate-900">Reader Comments Moderation</h2>
                <p className="text-xs text-slate-500">Approve, moderate, or purge submitted comments across published articles.</p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
                    <tr>
                      <th className="py-3 px-4">Author</th>
                      <th className="py-3 px-4">Comment</th>
                      <th className="py-3 px-4">Article</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Moderate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {comments.map(c => (
                      <tr key={c.id}>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{c.author_name}</div>
                          <div className="text-[10px] text-slate-400">{c.author_email}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-700 max-w-xs">{c.content}</td>
                        <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate">{c.article_title || c.article_id}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${c.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {c.status !== 'approved' && (
                              <button onClick={() => handleUpdateCommentStatus(c.id, 'approved')} className="text-emerald-600 font-bold hover:underline">Approve</button>
                            )}
                            <button onClick={() => handleDeleteComment(c.id)} className="text-red-500 font-bold hover:underline">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 12: NEWSLETTER SUBSCRIBERS */}
          {activeTab === 'subscribers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-slate-900">Newsletter Subscribers</h2>
                  <p className="text-xs text-slate-500">Active email subscribers list and CSV export for newsletter broadcasts.</p>
                </div>
                <button
                  onClick={handleExportSubscribersCSV}
                  className="flex items-center gap-2 bg-[#059669] hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold"
                >
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
                    <tr>
                      <th className="py-3 px-4">Email Address</th>
                      <th className="py-3 px-4">Subscription Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subscribers.map(s => (
                      <tr key={s.id}>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{s.email}</td>
                        <td className="py-3 px-4 text-slate-500">{new Date(s.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button onClick={() => handleDeleteSubscriber(s.id)} className="text-red-500 hover:text-red-700 font-semibold">
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 13: SEO SETTINGS */}
          {activeTab === 'seo' && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h2 className="text-2xl font-bold font-serif text-slate-900">SEO & Social Sharing Settings</h2>
                <p className="text-xs text-slate-500">Manage OpenGraph metadata, Google Webmaster tools, and search engine directives.</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-xs text-blue-900">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-[#246BFD]" />
                    <span>Facebook OpenGraph Crawler Prerendering Active</span>
                  </div>
                  <p className="mt-1">
                    Server-rendered social preview tags are enabled for Facebookbot, WhatsApp, Twitterbot, and Googlebot at <code className="bg-blue-100 px-1 rounded">/news/:slug</code>.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dynamic XML Sitemap</label>
                  <div className="flex items-center gap-2 font-mono text-xs bg-slate-100 p-2.5 rounded border border-slate-200">
                    <span className="text-[#246BFD] flex-1">/sitemap.xml</span>
                    <a href="/sitemap.xml" target="_blank" className="text-xs font-bold text-slate-700 hover:underline">Open Sitemap &rarr;</a>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Robots.txt Directive</label>
                  <div className="flex items-center gap-2 font-mono text-xs bg-slate-100 p-2.5 rounded border border-slate-200">
                    <span className="text-[#246BFD] flex-1">/robots.txt</span>
                    <a href="/robots.txt" target="_blank" className="text-xs font-bold text-slate-700 hover:underline">View Robots.txt &rarr;</a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 14: SOCIAL MEDIA SETTINGS */}
          {activeTab === 'social' && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h2 className="text-2xl font-bold font-serif text-slate-900">Social Media Channels</h2>
                <p className="text-xs text-slate-500">Configure official newsroom channels and broadcasting profiles.</p>
              </div>

              {settings && (
                <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Facebook Page</label>
                      <input
                        type="text"
                        value={settings.facebook_url}
                        onChange={e => setSettings({ ...settings, facebook_url: e.target.value })}
                        className="w-full rounded border border-slate-300 p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">X (Twitter) Profile</label>
                      <input
                        type="text"
                        value={settings.twitter_url}
                        onChange={e => setSettings({ ...settings, twitter_url: e.target.value })}
                        className="w-full rounded border border-slate-300 p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">YouTube Channel</label>
                      <input
                        type="text"
                        value={settings.youtube_url}
                        onChange={e => setSettings({ ...settings, youtube_url: e.target.value })}
                        className="w-full rounded border border-slate-300 p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Broadcast Number</label>
                      <input
                        type="text"
                        value={settings.whatsapp_number}
                        onChange={e => setSettings({ ...settings, whatsapp_number: e.target.value })}
                        className="w-full rounded border border-slate-300 p-2 text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button type="submit" className="px-5 py-2 rounded bg-[#246BFD] text-white text-xs font-bold">
                      Save Social Settings
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 15: HOMEPAGE SETTINGS */}
          {activeTab === 'homepage' && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h2 className="text-2xl font-bold font-serif text-slate-900">Homepage Sections Control</h2>
                <p className="text-xs text-slate-500">Toggle public visibility of editorial blocks on the front page.</p>
              </div>

              {settings && (
                <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="space-y-3">
                    {Object.entries(settings.homepage_sections).map(([key, enabled]) => (
                      <label key={key} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer">
                        <span className="text-xs font-bold text-slate-800 capitalize">{key.replace('_', ' ')} Section</span>
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={e => setSettings({
                            ...settings,
                            homepage_sections: {
                              ...settings.homepage_sections,
                              [key]: e.target.checked
                            }
                          })}
                          className="h-4 w-4 rounded text-[#246BFD]"
                        />
                      </label>
                    ))}
                  </div>
                  <div className="flex justify-end pt-2">
                    <button type="submit" className="px-5 py-2 rounded bg-[#246BFD] text-white text-xs font-bold">
                      Update Sections
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 16: MENU MANAGEMENT */}
          {activeTab === 'menus' && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h2 className="text-2xl font-bold font-serif text-slate-900">Navigation Menus Management</h2>
                <p className="text-xs text-slate-500">Primary header categories order and footer navigation items.</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Header Active Categories ({categories.length})
                </div>
                <div className="space-y-2">
                  {categories.map((c, i) => (
                    <div key={c.id} className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-400">0{i + 1}</span>
                        <span className="font-bold text-slate-800">{c.name_bn}</span>
                        <span className="text-slate-500">({c.name_en})</span>
                      </div>
                      <span className="font-mono text-slate-400">/category/{c.slug}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 17: WEBSITE SETTINGS */}
          {activeTab === 'website_settings' && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h2 className="text-2xl font-bold font-serif text-slate-900">Website Global Settings</h2>
                <p className="text-xs text-slate-500">Branding, editorial slogans, default language, and contact credentials.</p>
              </div>

              {settings && (
                <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Website Name</label>
                      <input
                        type="text"
                        value={settings.site_name}
                        onChange={e => setSettings({ ...settings, site_name: e.target.value })}
                        className="w-full rounded border border-slate-300 p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Logo Text Brand</label>
                      <input
                        type="text"
                        value={settings.logo_text}
                        onChange={e => setSettings({ ...settings, logo_text: e.target.value })}
                        className="w-full rounded border border-slate-300 p-2 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Editorial Slogan (Bengali)</label>
                    <input
                      type="text"
                      value={settings.site_tagline_bn}
                      onChange={e => setSettings({ ...settings, site_tagline_bn: e.target.value })}
                      className="w-full rounded border border-slate-300 p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Editorial Slogan (English)</label>
                    <input
                      type="text"
                      value={settings.site_tagline_en}
                      onChange={e => setSettings({ ...settings, site_tagline_en: e.target.value })}
                      className="w-full rounded border border-slate-300 p-2 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Newsroom Contact Email</label>
                      <input
                        type="email"
                        value={settings.contact_email}
                        onChange={e => setSettings({ ...settings, contact_email: e.target.value })}
                        className="w-full rounded border border-slate-300 p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Newsroom Phone Hotline</label>
                      <input
                        type="text"
                        value={settings.contact_phone}
                        onChange={e => setSettings({ ...settings, contact_phone: e.target.value })}
                        className="w-full rounded border border-slate-300 p-2 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Bureau Address</label>
                    <input
                      type="text"
                      value={settings.contact_address}
                      onChange={e => setSettings({ ...settings, contact_address: e.target.value })}
                      className="w-full rounded border border-slate-300 p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Copyright Statement</label>
                    <input
                      type="text"
                      value={settings.copyright_text}
                      onChange={e => setSettings({ ...settings, copyright_text: e.target.value })}
                      className="w-full rounded border border-slate-300 p-2 text-xs"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button type="submit" className="px-5 py-2 rounded bg-[#246BFD] text-white text-xs font-bold">
                      Save Website Settings
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 18: ADMIN USERS */}
          {activeTab === 'admin_users' && (
            <div className="max-w-3xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold font-serif text-slate-900">Admin Control & Permissions</h2>
                  <p className="text-xs text-slate-500">Owner-only administrative privileges and authentication enforcement.</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Public Registration Disabled
                </span>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-[#246BFD] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Strict Ownership Policy Enforced</p>
                  <p className="text-blue-700 mt-0.5 leading-relaxed">
                    Only the designated owner account (<code className="font-mono font-bold">alamin11gtN</code>) is authorized to control the PRIME NEWS GRAPH platform, publish or delete articles, configure advertisements, and modify system settings. All visitor registration attempts are blocked at the database level.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase">
                    <tr>
                      <th className="py-3 px-4">Authorized Admin</th>
                      <th className="py-3 px-4">Official Email</th>
                      <th className="py-3 px-4">Privilege Level</th>
                      <th className="py-3 px-4">2FA Status</th>
                      <th className="py-3 px-4">Last Activity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{u.username}</span>
                            <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-bold text-[9px]">OWNER</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">{u.email}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-[#246BFD]">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            <Check className="h-3 w-3" />
                            {u.two_factor_enabled ? 'Enforced' : 'Active'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {u.last_login ? new Date(u.last_login).toLocaleString() : 'Active Now'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 19: SECURITY SETTINGS */}
          {activeTab === 'security' && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h2 className="text-2xl font-bold font-serif text-slate-900">Maximum Admin Security & Audit Center</h2>
                <p className="text-xs text-slate-500">PBKDF2-SHA512 password management, 2FA recovery codes, session revocation, and real-time audit logs.</p>
              </div>

              {/* Security Health Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Password Cipher</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">PBKDF2-SHA512</div>
                  <div className="text-[10px] text-emerald-600 mt-0.5">100,000 Iterations + Salt</div>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dual-Factor (2FA)</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">ENFORCED</div>
                  <div className="text-[10px] text-emerald-600 mt-0.5">6-Digit TOTP / Code</div>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rate Limiting</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">5 Tries / 15m Lock</div>
                  <div className="text-[10px] text-emerald-600 mt-0.5">Active IP Shield</div>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Session Expiry</div>
                  <div className="text-sm font-bold text-slate-900 mt-1">2h Inactivity</div>
                  <div className="text-[10px] text-blue-600 mt-0.5">Auto-Revocation</div>
                </div>
              </div>

              {/* 1. Change Master Password Form */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-[#246BFD]" />
                    <h3 className="font-bold text-sm text-slate-900">Change Master Administrator Password</h3>
                  </div>
                  <span className="text-[11px] text-slate-400">Requires current password confirmation</span>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Current Master Password
                    </label>
                    <input
                      type="password"
                      value={changeCurrPassword}
                      onChange={e => setChangeCurrPassword(e.target.value)}
                      placeholder="Enter existing password"
                      required
                      className="w-full rounded border border-slate-300 p-2 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        New Master Password (min 8 chars)
                      </label>
                      <input
                        type="password"
                        value={changeNewPassword}
                        onChange={e => setChangeNewPassword(e.target.value)}
                        placeholder="New strong password"
                        required
                        className="w-full rounded border border-slate-300 p-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Confirm New Master Password
                      </label>
                      <input
                        type="password"
                        value={changeConfirmPassword}
                        onChange={e => setChangeConfirmPassword(e.target.value)}
                        placeholder="Re-type new password"
                        required
                        className="w-full rounded border border-slate-300 p-2 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={changeLoading}
                      className="px-4 py-2 rounded bg-[#246BFD] hover:bg-blue-600 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {changeLoading ? 'Updating Password...' : 'Update Password & Invalidate Other Sessions'}
                    </button>
                  </div>
                </form>
              </div>

              {/* 2. Emergency Recovery Codes & Active Sessions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Emergency Recovery Codes */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <ShieldAlert className="h-4 w-4 text-amber-500" />
                      Emergency Recovery Codes
                    </h4>
                    <span className="text-[10px] text-slate-400">Single-Use</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Store these emergency recovery codes in a secure location. They allow you to bypass 2FA or reset your password if your phone or device is lost.
                  </p>
                  <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 space-y-1 font-mono text-[11px] text-slate-700">
                    {adminUsers[0]?.recovery_codes && adminUsers[0].recovery_codes.length > 0 ? (
                      adminUsers[0].recovery_codes.map((code, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span>{code}</span>
                          <span className="text-[9px] text-emerald-600 font-bold uppercase">Ready</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-400 italic">No codes available or all consumed.</div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleRegenerateRecoveryCodes}
                    className="w-full py-2 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Regenerate 5 Fresh Recovery Codes
                  </button>
                </div>

                {/* Session Invalidation */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Lock className="h-4 w-4 text-red-500" />
                      Session Security Lockdown
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      Suspicious activity detected or logged in from an untrusted public computer? Immediately revoke and terminate all active administrative session tokens across all browsers.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRevokeSessions}
                    className="w-full py-2.5 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Revoke All Other Active Sessions</span>
                  </button>
                </div>
              </div>

              {/* 3. Live Real-Time Security Audit Logs */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <BarChart2 className="h-4 w-4 text-[#246BFD]" />
                      Live Administrative Security Audit Logs
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Real-time recording of login attempts, 2FA verifications, lockouts, and mutations.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={loadAuditLogs}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Refresh Logs</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Event</th>
                        <th className="py-2.5 px-3">Account</th>
                        <th className="py-2.5 px-3">IP Address</th>
                        <th className="py-2.5 px-3">Details</th>
                        <th className="py-2.5 px-3">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                      {auditLogs.length > 0 ? (
                        auditLogs.slice(0, 15).map((log: any) => (
                          <tr key={log.id} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                log.event === 'login_success'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : log.event === 'login_locked'
                                  ? 'bg-red-100 text-red-700'
                                  : log.event === 'login_failed'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {log.event}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-800 font-bold">{log.username}</td>
                            <td className="py-2 px-3 text-slate-600">{log.ip}</td>
                            <td className="py-2 px-3 text-slate-500 max-w-xs truncate" title={log.details || log.userAgent}>
                              {log.details || log.userAgent}
                            </td>
                            <td className="py-2 px-3 text-slate-400 text-[10px]">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-slate-400 italic">
                            No security incidents or login events recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 20: BACKUP AND EXPORT */}
          {activeTab === 'backup_export' && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h2 className="text-2xl font-bold font-serif text-slate-900">Database Backup & Recovery</h2>
                <p className="text-xs text-slate-500">Download snapshot archives in JSON and PostgreSQL SQL format, or restore from a previous backup.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Download className="h-4 w-4 text-[#246BFD]" />
                    <span>Download Database Backup</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Exports all articles, categories, breaking news, advertisements, media references, and settings.
                  </p>
                  <div className="space-y-2 pt-2">
                    <a
                      href="/api/backup/export"
                      download
                      className="w-full flex items-center justify-center gap-2 bg-[#246BFD] hover:bg-blue-600 text-white py-2 rounded text-xs font-bold transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download JSON Database</span>
                    </a>
                    <a
                      href="/api/backup/sql"
                      download
                      className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white py-2 rounded text-xs font-bold transition-colors"
                    >
                      <Database className="h-4 w-4" />
                      <span>Download PostgreSQL / Supabase SQL</span>
                    </a>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Upload className="h-4 w-4 text-emerald-600" />
                    <span>Restore From Backup JSON</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Upload a previously exported JSON backup file to instantly restore database state.
                  </p>
                  <label className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded text-xs font-bold cursor-pointer transition-colors">
                    <Upload className="h-4 w-4" />
                    <span>Select JSON File & Restore</span>
                    <input type="file" accept=".json" onChange={handleImportBackupFile} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 21: NETLIFY DEPLOYMENT INFORMATION */}
          {activeTab === 'netlify_deploy' && (
            <div className="max-w-4xl space-y-6">
              <div>
                <h2 className="text-2xl font-bold font-serif text-slate-900">Netlify Deployment Center</h2>
                <p className="text-xs text-slate-500">Step-by-step instructions for 100% production Netlify deployment with Supabase PostgreSQL.</p>
              </div>

              <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs space-y-6">
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                  <div className="font-bold text-sm flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Netlify Deployment Files Ready in Project Root</span>
                  </div>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><code className="font-mono font-bold">netlify.toml</code>: Build configuration, bot redirects, and security headers configured.</li>
                    <li><code className="font-mono font-bold">netlify/functions/api.ts</code>: Netlify serverless API handler.</li>
                    <li><code className="font-mono font-bold">supabase-schema.sql</code>: PostgreSQL schema with Row-Level Security (RLS) policies.</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900">Option A: Deploy via GitHub + Netlify (Recommended)</h3>
                  <ol className="list-decimal pl-5 text-xs text-slate-600 space-y-2">
                    <li>Push this repository to your GitHub account.</li>
                    <li>Log in to <strong className="text-slate-900">Netlify</strong> and click <em>"Add new site" &rarr; "Import an existing project"</em>.</li>
                    <li>Select your repository. Netlify will automatically detect <code className="bg-slate-100 px-1 rounded">npm run build</code> and publish directory <code className="bg-slate-100 px-1 rounded">dist</code> from <code className="bg-slate-100 px-1 rounded">netlify.toml</code>.</li>
                    <li>Configure your Supabase Database credentials in Netlify Environment Variables.</li>
                  </ol>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-base font-bold text-slate-900">Option B: Netlify Manual Drag & Drop Build</h3>
                  <ol className="list-decimal pl-5 text-xs text-slate-600 space-y-2">
                    <li>Run <code className="bg-slate-100 px-1 rounded font-mono">npm run build</code>.</li>
                    <li>Upload the generated <code className="bg-slate-100 px-1 rounded font-mono">dist</code> folder to the Netlify manual deploy dropzone.</li>
                  </ol>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Required Netlify Environment Variables</h4>
                  <div className="bg-slate-900 text-slate-200 p-4 rounded-lg font-mono text-xs space-y-1">
                    <div># Supabase PostgreSQL Integration</div>
                    <div>VITE_SUPABASE_URL="https://your-project.supabase.co"</div>
                    <div>VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"</div>
                    <div>APP_URL="https://your-domain.netlify.app"</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
