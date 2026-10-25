import React, { useCallback, useEffect, useState } from 'react'
import { deleteResume, getResumeById, getResumeHistory } from '../../../api/authApi';

const LIMIT = 12;

const scoreTheme = (s) =>
  s >= 85
    ? { text: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'ring-emerald-200', bar: 'bg-emerald-500' }
    : s >= 70
    ? { text: 'text-indigo-600', bg: 'bg-indigo-50', ring: 'ring-indigo-200', bar: 'bg-indigo-500' }
    : s >= 50
    ? { text: 'text-amber-600', bg: 'bg-amber-50', ring: 'ring-amber-200', bar: 'bg-amber-500' }
    : { text: 'text-rose-600', bg: 'bg-rose-50', ring: 'ring-rose-200', bar: 'bg-rose-500' };

// 25-10-2026
const formatDate = (d) => {
  const date = new Date(d);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
};

const BREAKDOWN_LABELS = {
  skills: 'Skills Match',
  keywords: 'Keywords',
  experience: 'Experience',
  sections: 'Resume Sections',
  formatting: 'Formatting & Contact',
};

/* ---------- Detail modal ---------- */
function DetailModal({ id, onClose }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getResumeById(id)
      .then((res) => setData(res.analysis))
      .catch((err) => setError(err.message));
  }, [id]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const theme = data ? scoreTheme(data.matchPercentage) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{data?.jobTitle || 'Analysis Details'}</h3>
            {data && <p className="text-xs text-slate-500">{data.fileName} · {formatDate(data.createdAt)}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close">
            ✕
          </button>
        </div>

        {error && <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

        {!data && !error && (
          <div className="flex justify-center py-12">
            <span className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
          </div>
        )}

        {data && (
          <div className="space-y-6">
            <div className={`flex items-center gap-4 rounded-xl px-5 py-4 ${theme.bg}`}>
              <p className={`text-4xl font-bold ${theme.text}`}>{data.matchPercentage}%</p>
              <div>
                <p className={`text-sm font-semibold ${theme.text}`}>{data.verdict} Match</p>
                <p className="text-sm text-slate-600">{data.summary}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {Object.entries(data.breakdown).map(([k, v]) => (
                <div key={k}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{BREAKDOWN_LABELS[k] || k}</span>
                    <span className="font-semibold text-slate-900">{v}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${scoreTheme(v).bar}`} style={{ width: `${v}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <b className="text-sm text-slate-900">✅ Matched Skills</b>
                <div className="mt-2 flex flex-wrap gap-2">
                  {data.matchedSkills.length ? data.matchedSkills.map((s) => (
                    <span key={s} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">{s}</span>
                  )) : <span className="text-sm text-slate-500">None</span>}
                </div>
              </div>
              <div>
                <b className="text-sm text-slate-900">❌ Missing Skills</b>
                <div className="mt-2 flex flex-wrap gap-2">
                  {data.missingSkills.length ? data.missingSkills.map((s) => (
                    <span key={s} className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20">{s}</span>
                  )) : <span className="text-sm text-slate-500">None 🎉</span>}
                </div>
              </div>
            </div>

            {data.suggestions?.length > 0 && (
              <div>
                <b className="text-sm text-slate-900">💡 Suggestions</b>
                <ul className="mt-2 space-y-1.5">
                  {data.suggestions.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-600"><span className="text-amber-500">●</span>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            <details className="rounded-xl bg-slate-50 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-slate-700">Job Description</summary>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">{data.jobDescription}</p>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
function History() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async (p) => {
    setLoading(true);
    setError('');
    try {
      const data = await getResumeHistory(p, LIMIT);
      setItems(data.resumes);
      setPages(data.pages || 1);
      setTotal(data.total);
    } catch (err) {
      setError(err.status === 401 ? 'Your session has expired. Please log in again.' : err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page);
  }, [page, load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this analysis? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteResume(id);
      // Agar page ka last item delete hua to pichle page pe jao
      if (items.length === 1 && page > 1) setPage(page - 1);
      else load(page);
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-8 pt-20 md:px-8 md:pt-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-col gap-1">
          <div className="text-xs font-semibold uppercase tracking-[0.15em] text-indigo-600">Your Reports</div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            Resume <span className="text-indigo-600">Analysis</span> History
          </h2>
          {!loading && !error && total > 0 && (
            <p className="text-sm text-slate-500">{total} {total === 1 ? 'analysis' : 'analyses'} so far</p>
          )}
        </div>

        {error && (
          <div className="flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <span>{error}</span>
            <button onClick={() => load(page)} className="font-semibold underline">Retry</button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
                <div className="mx-auto h-16 w-16 rounded-full bg-slate-100" />
                <div className="mx-auto mt-4 h-4 w-2/3 rounded bg-slate-100" />
                <div className="mt-6 space-y-2">
                  <div className="h-3 rounded bg-slate-100" />
                  <div className="h-3 rounded bg-slate-100" />
                  <div className="h-3 w-1/2 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <p className="text-4xl">📄</p>
            <p className="font-semibold text-slate-800">No analyses yet</p>
            <p className="text-sm text-slate-500">Analyze your first resume from the Dashboard and it will show up here.</p>
          </div>
        )}

        {/* Cards */}
        {!loading && items.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((r) => {
              const t = scoreTheme(r.matchPercentage);
              return (
                <div
                  key={r.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`grid h-16 w-16 place-items-center rounded-full ring-4 ${t.bg} ${t.ring}`}>
                      <span className={`text-lg font-bold ${t.text}`}>{r.matchPercentage}%</span>
                    </div>
                    <span className={`text-xs font-semibold ${t.text}`}>{r.verdict} Match</span>
                    <h3 className="text-center font-semibold text-slate-900">{r.jobTitle}</h3>
                  </div>

                  <p className="truncate text-sm text-slate-600" title={r.fileName}>
                    <b className="font-medium text-slate-800">Resume:</b> {r.fileName}
                  </p>

                  <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">{r.summary}</p>

                  {r.missingSkills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {r.missingSkills.slice(0, 3).map((s) => (
                        <span key={s} className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700">{s}</span>
                      ))}
                      {r.missingSkillsCount > 3 && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                          +{r.missingSkillsCount - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-xs text-slate-500">Date {formatDate(r.createdAt)}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setSelectedId(r.id)}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        disabled={deletingId === r.id}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                      >
                        {deletingId === r.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && pages > 1 && (
          <div className="flex items-center justify-center gap-3 text-sm">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-slate-500">Page {page} of {pages}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === pages}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {selectedId && <DetailModal id={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

export default History