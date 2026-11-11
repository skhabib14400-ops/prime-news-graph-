import React, { useState, useEffect } from 'react';
import {
  Facebook,
  Twitter,
  Share2,
  Printer,
  Copy,
  Check,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Send,
  MessageSquare,
  User,
  ArrowLeft,
  Bookmark,
  Youtube,
  Instagram
} from 'lucide-react';
import { Article, CommentItem, AdSlot, WebsiteSettings } from '../types/news';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { AdPlacement } from '../components/AdPlacement';
import { normalizeImageUrl, handleImageError } from '../utils/imageHelper';
import { PopularNews } from '../components/PopularNews';

interface ArticleDetailProps {
  article: Article;
  allArticles: Article[];
  ads: AdSlot[];
  settings?: WebsiteSettings | null;
  onSelectArticle: (article: Article) => void;
  onBackToHome: () => void;
  onSelectCategory: (slug: string) => void;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({
  article,
  allArticles,
  ads,
  settings,
  onSelectArticle,
  onBackToHome,
  onSelectCategory,
}) => {
  const { lang, t } = useLanguage();
  const [fontSizeClass, setFontSizeClass] = useState<'text-base' | 'text-lg' | 'text-xl'>('text-lg');
  const [copied, setCopied] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);

  // Automatically increment view count once on mount
  useEffect(() => {
    api.incrementViews(article.id).catch(() => {});
    // Fetch comments for this article
    api.getComments({ article_id: article.id, status: 'approved' })
      .then(res => setComments(res))
      .catch(() => {});
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [article.id]);

  const articleUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/news/${article.slug}`
    : `/news/${article.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(articleUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName || !commentEmail || !commentContent) return;

    try {
      setCommentSubmitting(true);
      const newComment = await api.postComment({
        article_id: article.id,
        author_name: commentName,
        author_email: commentEmail,
        content: commentContent,
      });
      setComments(prev => [newComment, ...prev]);
      setCommentContent('');
      setCommentSuccess(true);
      setTimeout(() => setCommentSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setCommentSubmitting(false);
    }
  };

  // Find previous and next articles
  const currentIndex = allArticles.findIndex(a => a.id === article.id);
  const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : undefined;
  const nextArticle = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : undefined;

  // Related articles (same category, excluding current)
  const relatedArticles = allArticles
    .filter(a => a.category_slug === article.category_slug && a.id !== article.id)
    .slice(0, 3);

  // Find relevant Adsterra slots
  const adTop = ads.find(a => a.id === 'article_top');
  const adMiddle = ads.find(a => a.id === 'article_middle');
  const adBottom = ads.find(a => a.id === 'article_bottom');
  const adSidebar = ads.find(a => a.id === 'sidebar_banner');

  const title = lang === 'bn' ? article.title_bn : article.title_en;
  const summary = lang === 'bn' ? article.summary_bn : article.summary_en;
  const content = lang === 'bn' ? article.content_bn : article.content_en;
  const categoryName = lang === 'bn' ? article.category_name_bn : article.category_name_en;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Top Breadcrumb & Back */}
      <div className="mb-6 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-1 hover:text-[#246BFD] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{t('home')}</span>
          </button>
          <span>/</span>
          <button
            onClick={() => onSelectCategory(article.category_slug)}
            className="font-semibold text-[#246BFD] hover:underline uppercase"
          >
            {categoryName}
          </button>
        </div>

        {/* Text Size Adjuster */}
        <div className="flex items-center gap-1 bg-slate-100 rounded px-2 py-1">
          <span className="text-[11px] text-slate-400 mr-1">Font:</span>
          <button
            onClick={() => setFontSizeClass('text-base')}
            className={`px-1.5 py-0.5 rounded text-xs ${fontSizeClass === 'text-base' ? 'bg-white font-bold shadow-xs text-[#246BFD]' : 'text-slate-600'}`}
          >
            A-
          </button>
          <button
            onClick={() => setFontSizeClass('text-lg')}
            className={`px-1.5 py-0.5 rounded text-xs ${fontSizeClass === 'text-lg' ? 'bg-white font-bold shadow-xs text-[#246BFD]' : 'text-slate-600'}`}
          >
            A
          </button>
          <button
            onClick={() => setFontSizeClass('text-xl')}
            className={`px-1.5 py-0.5 rounded text-xs ${fontSizeClass === 'text-xl' ? 'bg-white font-bold shadow-xs text-[#246BFD]' : 'text-slate-600'}`}
          >
            A+
          </button>
        </div>
      </div>

      {/* Main Grid: Article Content (8 cols) + Sidebar (4 cols) - Post shifted straight to the top */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Article Column */}
        <article className="lg:col-span-8 bg-white dark:bg-[#101D35] p-6 sm:p-10 rounded-xl shadow-xs border border-slate-200/80 dark:border-slate-800 transition-colors article-content">
          
          {/* 1. Featured Post Image (At the very top - Channel 24 Style) */}
          <div className="overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 shadow-xs mb-6">
            <img
              src={normalizeImageUrl(article.featured_image, article.title_bn, article.category_slug)}
              alt={title}
              onError={handleImageError}
              loading="eager"
              referrerPolicy="no-referrer"
              className="w-full max-h-[520px] object-cover"
            />
            {(article.image_caption_bn || article.image_caption_en) && (
              <p className="p-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 italic">
                {lang === 'bn' ? article.image_caption_bn : (article.image_caption_en || article.image_caption_bn)}
              </p>
            )}
          </div>

          {/* 2. Reporter Name & Editorial Desk / Publication Date (Channel 24 Style) */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-y border-slate-200/80 dark:border-slate-800 py-3.5 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <img
                src={article.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={article.author_name}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
                }}
                className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
              />
              <div>
                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {article.author_name}
                </div>
                <div className="text-slate-500 dark:text-slate-400 text-xs">
                  {article.author_role || (lang === 'bn' ? 'বিশেষ প্রতিনিধি / নিউজ ডেস্ক' : 'Special Correspondent')}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px] sm:text-xs">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  {lang === 'bn' ? 'প্রকাশ: ' : 'Published: '}
                  {new Date(article.published_at).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>{article.reading_time_minutes} {t('minutes_read')}</span>
              </div>
            </div>
          </div>

          {/* 3. Social Share Buttons (Facebook, YouTube, Telegram, TikTok, Instagram) & Copy Link Button */}
          <div className="my-5 flex flex-wrap items-center justify-between gap-2.5 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 no-print">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Share2 className="h-3.5 w-3.5 text-[#246BFD]" />
              <span>{lang === 'bn' ? 'শেয়ার করুন:' : 'Share:'}</span>
            </span>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {/* Facebook */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-[#1877F2] hover:bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white transition-all shadow-2xs"
                title="Share on Facebook"
              >
                <Facebook className="h-3.5 w-3.5 fill-white" />
                <span className="hidden sm:inline">Facebook</span>
              </a>

              {/* YouTube */}
              <a
                href={settings?.youtube_url || 'https://www.youtube.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-[#FF0000] hover:bg-red-700 px-3 py-1.5 text-xs font-semibold text-white transition-all shadow-2xs"
                title="Visit YouTube"
              >
                <Youtube className="h-3.5 w-3.5 fill-white" />
                <span className="hidden sm:inline">YouTube</span>
              </a>

              {/* Telegram */}
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-[#0088cc] hover:bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white transition-all shadow-2xs"
                title="Share on Telegram"
              >
                <Send className="h-3.5 w-3.5 text-white" />
                <span className="hidden sm:inline">Telegram</span>
              </a>

              {/* TikTok */}
              <a
                href={settings?.tiktok_url || 'https://www.tiktok.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-black hover:bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-white transition-all shadow-2xs border border-slate-700"
                title="Visit TikTok"
              >
                <svg className="h-3.5 w-3.5 fill-white" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.54c0 1.93-.65 3.86-1.91 5.31-1.49 1.74-3.77 2.78-6.07 2.67-2.67-.1-5.11-1.56-6.42-3.87-1.39-2.42-1.25-5.5.34-7.79 1.48-2.14 4.04-3.37 6.64-3.16v4.08c-1.3-.17-2.68.32-3.48 1.34-.84 1.05-.88 2.58-.1 3.69.75 1.08 2.16 1.63 3.47 1.32 1.12-.25 1.99-1.22 2.05-2.37.04-2.89.02-5.78.02-8.67V0h-.97z"/>
                </svg>
                <span className="hidden sm:inline">TikTok</span>
              </a>

              {/* Instagram */}
              <a
                href={settings?.instagram_url || 'https://www.instagram.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-tr from-[#FD5949] via-[#D6249F] to-[#285AEB] hover:opacity-90 px-3 py-1.5 text-xs font-semibold text-white transition-all shadow-2xs"
                title="Visit Instagram"
              >
                <Instagram className="h-3.5 w-3.5 text-white" />
                <span className="hidden sm:inline">Instagram</span>
              </a>

              {/* Copy Link Button */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 rounded-lg bg-white dark:bg-slate-750 border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-2xs"
                title="Copy Article Link"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
                <span>{copied ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied!') : (lang === 'bn' ? 'কপি লিংক' : 'Copy Link')}</span>
              </button>
            </div>
          </div>

          {/* 4. Post Title (Headline) */}
          <div className="mb-4">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#246BFD] mb-2">
              {categoryName}
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif leading-tight text-[#101D35] dark:text-white">
              {title}
            </h1>
          </div>

          {/* 5. Post Summary / Excerpt */}
          {summary && (
            <p className="my-5 text-base sm:text-lg font-serif italic text-slate-700 dark:text-slate-300 border-l-4 border-[#246BFD] pl-4 py-2 leading-relaxed bg-blue-50/50 dark:bg-blue-950/20 rounded-r-lg">
              {summary}
            </p>
          )}

          {/* 6. Full Post Description / Body Text */}
          <div
            className={`prose prose-slate dark:prose-invert max-w-none leading-relaxed ${fontSizeClass} text-slate-800 dark:text-slate-200 space-y-4 my-6`}
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Adsterra In-Read Middle Banner */}
          <AdPlacement slot={adMiddle} className="my-8" />

          {/* Embedded Video if present */}
          {article.video_url && (
            <div className="my-6 aspect-video w-full overflow-hidden rounded-lg bg-black">
              <iframe
                src={article.video_url.replace('watch?v=', 'embed/')}
                title="News Video"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          )}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mt-8 pt-4 border-t border-slate-200 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tags:</span>
              {article.tags.map(tag => (
                <span
                  key={tag}
                  className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded hover:bg-slate-200 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Previous / Next Article Navigation */}
          <div className="mt-8 border-t border-b border-slate-200 py-6 grid grid-cols-1 sm:grid-cols-2 gap-4 no-print">
            {prevArticle ? (
              <div
                onClick={() => onSelectArticle(prevArticle)}
                className="group cursor-pointer p-3 rounded-lg border border-slate-100 hover:border-[#246BFD] transition-colors"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Previous Story</span>
                </div>
                <div className="mt-1 text-sm font-semibold font-serif text-slate-800 group-hover:text-[#246BFD] line-clamp-1">
                  {lang === 'bn' ? prevArticle.title_bn : prevArticle.title_en}
                </div>
              </div>
            ) : <div />}

            {nextArticle && (
              <div
                onClick={() => onSelectArticle(nextArticle)}
                className="group cursor-pointer p-3 rounded-lg border border-slate-100 hover:border-[#246BFD] transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Next Story</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
                <div className="mt-1 text-sm font-semibold font-serif text-slate-800 group-hover:text-[#246BFD] line-clamp-1">
                  {lang === 'bn' ? nextArticle.title_bn : nextArticle.title_en}
                </div>
              </div>
            )}
          </div>

          {/* Adsterra Article Bottom Banner */}
          <AdPlacement slot={adBottom} className="my-6" />

          {/* Comments Section */}
          <section className="mt-8 pt-6 no-print">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-6">
              <MessageSquare className="h-5 w-5 text-[#246BFD]" />
              <h3 className="text-xl font-bold font-serif text-[#101D35] dark:text-white">
                {t('comments')} ({comments.length})
              </h3>
            </div>

            {/* Leave Comment Form */}
            <form onSubmit={handleCommentSubmit} className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-5 border border-slate-200/80 dark:border-slate-700 mb-8">
              <h4 className="text-sm font-bold text-[#101D35] dark:text-white mb-3">
                {t('leave_comment')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  placeholder={t('name_label')}
                  value={commentName}
                  onChange={e => setCommentName(e.target.value)}
                  required
                  className="rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#246BFD]"
                />
                <input
                  type="email"
                  placeholder={t('email_label')}
                  value={commentEmail}
                  onChange={e => setCommentEmail(e.target.value)}
                  required
                  className="rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#246BFD]"
                />
              </div>
              <textarea
                rows={3}
                placeholder={t('comment_label')}
                value={commentContent}
                onChange={e => setCommentContent(e.target.value)}
                required
                className="w-full rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#246BFD] mb-3"
              />
              <button
                type="submit"
                disabled={commentSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#246BFD] hover:bg-blue-600 text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{commentSubmitting ? 'Posting...' : t('submit_comment')}</span>
              </button>
              {commentSuccess && (
                <span className="ml-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Comment submitted successfully!
                </span>
              )}
            </form>

            {/* Comment List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  {lang === 'bn' ? 'প্রথম মন্তব্যকারী হিসেবে আপনার মতামত দিন।' : 'Be the first to share your perspective.'}
                </div>
              ) : (
                comments.map(c => (
                  <div key={c.id} className="rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/40 p-4 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200">
                          {c.author_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{c.author_name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.created_at).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-9">
                      {c.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </article>

        {/* Sidebar Column */}
        <aside className="lg:col-span-4 space-y-8 no-print">
          {/* Adsterra Sidebar Banner (300x250) */}
          <AdPlacement slot={adSidebar} />

          {/* Popular News Component */}
          <PopularNews articles={allArticles} onSelectArticle={onSelectArticle} />

          {/* Related Stories */}
          {relatedArticles.length > 0 && (
            <div className="rounded-lg bg-white dark:bg-[#101D35] p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 transition-colors">
              <h3 className="text-base font-bold font-serif text-[#101D35] dark:text-white uppercase tracking-wide border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
                {t('related_news')}
              </h3>
              <div className="space-y-4">
                {relatedArticles.map(rel => (
                  <article
                    key={rel.id}
                    onClick={() => onSelectArticle(rel)}
                    className="group cursor-pointer flex gap-3 items-center"
                  >
                    <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded bg-slate-100 dark:bg-slate-800">
                      <img
                        src={normalizeImageUrl(rel.featured_image, rel.title_bn, rel.category_slug)}
                        alt={lang === 'bn' ? rel.title_bn : rel.title_en}
                        onError={handleImageError}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-semibold font-serif text-[#101D35] dark:text-white group-hover:text-[#246BFD] transition-colors line-clamp-2 leading-snug">
                        {lang === 'bn' ? rel.title_bn : rel.title_en}
                      </h4>
                      <span className="mt-1 text-[10px] text-slate-400 block">
                        {new Date(rel.published_at).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
