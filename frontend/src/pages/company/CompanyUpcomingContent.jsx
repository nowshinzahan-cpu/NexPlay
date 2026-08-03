import { useState, useEffect, useCallback } from 'react';
import { upcomingContentAPI } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Pagination from '../../components/ott/Pagination';
import LoadingSkeleton from '../../components/ott/LoadingSkeleton';
import EmptyState from '../../components/ott/EmptyState';

const contentTypes = [
  { value: 'MOVIE', label: 'Movie' },
  { value: 'TV_SERIES', label: 'TV Series' }
];

const languages = [
  'English', 'Bengali', 'Hindi', 'Spanish', 'French', 'Korean', 'Japanese',
  'Mandarin', 'Tamil', 'Telugu', 'Arabic', 'Turkish', 'German', 'Italian'
];

const genreOptions = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi',
  'Thriller', 'War', 'Western', 'Musical', 'Biography', 'History'
];

function ContentForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    originalTitle: initial?.originalTitle || '',
    type: initial?.type || 'MOVIE',
    description: initial?.description || '',
    poster: initial?.poster || '',
    genres: initial?.genres?.join(', ') || '',
    spokenLanguage: initial?.spokenLanguage || 'English',
    releaseYear: initial?.releaseYear || new Date().getFullYear(),
    episodeCount: initial?.episodeCount || 0,
    platforms: initial?.platforms?.join(', ') || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.type) {
      return;
    }
    onSubmit({
      ...form,
      genres: form.genres.split(',').map(g => g.trim()).filter(Boolean),
      platforms: form.platforms.split(',').map(p => p.trim()).filter(Boolean),
      episodeCount: form.type === 'TV_SERIES' ? parseInt(form.episodeCount, 10) || 0 : 0
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Title *"
          name="title"
          value={form.title}
          onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
          required
        />
        <Input
          label="Original Title"
          name="originalTitle"
          value={form.originalTitle}
          onChange={(e) => setForm(f => ({ ...f, originalTitle: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-textSecondary mb-1.5">Type *</label>
          <select
            name="type"
            value={form.type}
            onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
            className="input-field"
          >
            {contentTypes.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <Input
          label="Release Year"
          name="releaseYear"
          type="number"
          value={form.releaseYear}
          onChange={(e) => setForm(f => ({ ...f, releaseYear: parseInt(e.target.value, 10) || '' }))}
        />
        {form.type === 'TV_SERIES' && (
          <Input
            label="Episode Count"
            name="episodeCount"
            type="number"
            value={form.episodeCount}
            onChange={(e) => setForm(f => ({ ...f, episodeCount: parseInt(e.target.value, 10) || 0 }))}
          />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-textSecondary mb-1.5">Language</label>
          <select
            name="language"
            value={form.spokenLanguage}
            onChange={(e) => setForm(f => ({ ...f, spokenLanguage: e.target.value }))}
            className="input-field"
          >
            {languages.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <Input
          label="Poster URL"
          name="poster"
          value={form.poster}
          onChange={(e) => setForm(f => ({ ...f, poster: e.target.value }))}
          placeholder="https://example.com/poster.jpg"
        />
      </div>

      <Input
        label="Genres (comma-separated)"
        name="genres"
        value={form.genres}
        onChange={(e) => setForm(f => ({ ...f, genres: e.target.value }))}
        placeholder="Action, Drama, Sci-Fi"
      />

      <Input
        label="Platforms (comma-separated)"
        name="platforms"
        value={form.platforms}
        onChange={(e) => setForm(f => ({ ...f, platforms: e.target.value }))}
        placeholder="Netflix, Prime Video, Disney+"
      />

      <div>
        <label className="block text-sm font-medium text-text-textSecondary mb-1.5">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
          className="input-field min-h-[100px]"
          placeholder="Describe your upcoming content..."
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {initial ? 'Update Content' : 'Publish Content'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function CompanyUpcomingContent() {
  const { addToast } = useToast();
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchContents = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await upcomingContentAPI.getMyAllContent({ page, limit: 10 });
      if (res.data.success) {
        setContents(res.data.data);
        setPagination({
          page: res.data.meta.page,
          totalPages: res.data.meta.totalPages,
          total: res.data.meta.total
        });
      }
    } catch (err) {
      addToast('Failed to load content', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchContents(); }, [fetchContents]);

  const handleCreate = async (data) => {
    setSubmitting(true);
    try {
      await upcomingContentAPI.createUpcoming(data);
      addToast('Content published successfully!', 'success');
      setShowForm(false);
      fetchContents();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to publish content', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (data) => {
    setSubmitting(true);
    try {
      await upcomingContentAPI.updateUpcoming(editing._id, data);
      addToast('Content updated successfully!', 'success');
      setEditing(null);
      setShowForm(false);
      fetchContents();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update content', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await upcomingContentAPI.deleteUpcoming(id);
      addToast('Content deleted', 'success');
      fetchContents();
    } catch (err) {
      addToast('Failed to delete content', 'error');
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <section className="relative py-8 sm:py-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(var(--color-accent), 0.04) 0%, transparent 70%)'
          }}
        />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider mb-4 sm:mb-5 border"
            style={{
              backgroundColor: 'rgba(var(--color-accent), 0.12)',
              borderColor: 'rgba(var(--color-accent), 0.20)',
              color: 'rgb(var(--color-accent-text))'
            }}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Content
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                My <span className="text-gradient">Content</span>
              </h2>
              <p className="text-sm sm:text-base mt-2" style={{ color: 'var(--color-textSecondary)' }}>
                Manage your published and upcoming entertainment content
              </p>
            </div>
            {!showForm && (
              <Button variant="primary" onClick={() => setShowForm(true)} className="shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Content
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Create/Edit Form */}
      {(showForm || editing) && (
        <Card>
          <h2 className="text-lg font-semibold text-text-textPrimary mb-4">
            {editing ? 'Edit Content' : 'Publish New Content'}
          </h2>
          <ContentForm
            initial={editing}
            onSubmit={editing ? handleUpdate : handleCreate}
            onCancel={closeForm}
            loading={submitting}
          />
        </Card>
      )}

      {/* Content List */}
      {loading ? (
        <LoadingSkeleton count={5} />
      ) : contents.length === 0 && !showForm ? (
        <EmptyState
          type="empty"
          message="You haven't published any content yet. Click 'New Content' to get started!"
        />
      ) : (
        <div className="space-y-3">
          {contents.map((item) => (
            <Card key={item._id}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-accent/5 to-card shrink-0">
                  {item.poster ? (
                    <img src={item.poster} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-accent-text/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-text-textPrimary truncate">{item.title}</h3>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                      item.status === 'Upcoming'
                        ? 'bg-warning/10 text-warning border border-warning/20'
                        : item.status === 'Released'
                        ? 'bg-success/10 text-success border border-success/20'
                        : 'bg-accent/10 text-accent-text border border-accent/20'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-text-textSecondary mt-0.5">
                    {item.type === 'MOVIE' ? 'Movie' : 'TV Series'}
                    {item.releaseYear && ` · ${item.releaseYear}`}
                    {item.genres?.length > 0 && ` · ${item.genres.slice(0, 3).join(', ')}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(item); setShowForm(true); }}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-danger hover:text-danger hover:bg-danger/10"
                    onClick={() => handleDelete(item._id)}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={fetchContents}
          />
        </div>
      )}
    </div>
  );
}
