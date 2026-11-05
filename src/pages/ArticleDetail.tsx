import React, { useState, useEffect } from 'react';
import {
  Facebook,
  Twitter,
  Share2,
  Printer,
  Copy,
  Check,
  Clock,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Send,
  MessageSquare,
  User,
  ArrowLeft,
  Bookmark
} from 'lucide-react';
import { Article, CommentItem, AdSlot } from '../types/news';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { AdPlacement } from '../components/AdPlacement';
import { PopularNews } from '../components/PopularNews';

interface ArticleDetailProps {
  article: Article;
  allArticles: Article[];
  ads: AdSlot[];
  onSelectArticle: (article: Article) => void;
  onBackToHome: () => void;
  onSelectCategory: (slug: string) => void;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({
  article,
  allArticles,
  ads,
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

      {/* Adsterra Article Top Leaderboard */}
      <AdPlacement slot={adTop} className="mb-6" />

      {/* Main Grid: Article Content (8 cols) + Sidebar (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Article Column */}
        <article className="lg:col-span-8 bg-white dark:bg-[#101D35] p-6 sm:p-10 rounded-xl shadow-xs border border-slate-200/80 dark:border-slate-800 transition-colors article-content">
          {/* Category Badge & Headline */}
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#246BFD] mb-2">
              {categoryName}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif leading-tight text-[#101D35] dark:text-white">
              {title}
            </h1>
          </div>

          {/* Subtitle / Summary */}
          {summary && (
            <p className="mt-4 text-lg font-serif italic text-slate-600 dark:text-slate-300 border-l-2 border-[#246BFD] pl-4 leading-relaxed">
              {summary}
            </p>
          )}

          {/* Author Card & Publication Metadata */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-slate-100 dark:border-slate-800 py-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <img
                src={article.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                alt={article.author_name}
                className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <div>
                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">{article.author_name}</div>
                <div className="text-slate-500 dark:text-slate-400">{article.author_role || 'Editorial Desk'}</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>{new Date(article.published_at).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US')}</span>
              </div>
              <span aria-hidden="true">·</span>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>{article.reading_time_minutes} {t('minutes_read')}</span>
              </div>
              <span aria-hidden="true">·</span>
              <div className="flex items-center gap-1 tabular-nums">
                <Eye className="h-3.5 w-3.5 text-slate-400" />
                <span>{article.views_count.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Social Share Toolbar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700 no-print">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
              <Share2 className="h-3.5 w-3.5 text-[#246BFD]" />
              {t('share_article')}:
            </span>

            <div className="flex items-center gap-1.5">
              {/* Facebook Share */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded bg-[#1877F2] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                title="Share on Facebook"
              >
                <Facebook className="h-3.5 w-3.5 fill-white" />
                <span>Facebook</span>
              </a>

              {/* WhatsApp Share */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} - ${articleUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors"
                title="Share on WhatsApp"
              >
                <span>WhatsApp</span>
              </a>

              {/* X / Twitter */}
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded bg-black px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                title="Share on X"
              >
                <Twitter className="h-3.5 w-3.5 fill-white" />
                <span>X</span>
              </a>

              {/* Telegram */}
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded bg-[#0088cc] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-sky-600 transition-colors"
                title="Telegram"
              >
                <span>Telegram</span>
              </a>

              {/* Copy Link */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Copy Link"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
                <span>{copied ? t('link_copied') : t('copy_link')}</span>
              </button>

              {/* Print */}
              <button
                type="button"
                onClick={handlePrint}
                className="hidden sm:flex items-center gap-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                title="Print Article"
              >
                <Printer className="h-3.5 w-3.5 text-slate-500" />
                <span>{t('print_article')}</span>
              </button>
            </div>
          </div>

          {/* Featured Image */}
          <div className="my-6 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
            <img
              src={article.featured_image}
              alt={title}
              referrerPolicy="no-referrer"
              className="w-full max-h-[500px] object-cover"
            />
            {(article.image_caption_bn || article.image_caption_en) && (
              <p className="p-2.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 italic">
                {lang === 'bn' ? article.image_caption_bn : (article.image_caption_en || article.image_caption_bn)}
              </p>
            )}
          </div>

          {/* Article Body Content */}
          <div
            className={`prose prose-slate dark:prose-invert max-w-none leading-relaxed ${fontSizeClass} text-slate-800 dark:text-slate-200 space-y-4`}
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
                        src={rel.featured_image}
                        alt={lang === 'bn' ? rel.title_bn : rel.title_en}
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
