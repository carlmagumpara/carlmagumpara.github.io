import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiDownload, FiMoon, FiRefreshCcw, FiSearch, FiSun } from 'react-icons/fi';
import DataTable from '../shared/datatable';

const ENDPOINT =
  'https://script.google.com/macros/s/AKfycbxkoppzMetMlRVP9ydERwJRh82ilV8B57gVYjKrIPbmkmnf5LgReV8HVWuTCseBWsY/exec';

const safeLower = (value) => String(value ?? '').toLowerCase();

const parseDateMs = (value) => {
  const d = new Date(value);
  const ms = d.getTime();
  return Number.isFinite(ms) ? ms : 0;
};

const formatDateTime = (value) => {
  const ms = parseDateMs(value);
  if (!ms) return String(value ?? '—');
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(ms));
  } catch {
    return new Date(ms).toLocaleString();
  }
};

const toCsv = (rows, headers) => {
  const escape = (v) => {
    const s = String(v ?? '');
    return `"${s.replace(/"/g, '""')}"`;
  };

  return [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r?.[h])).join(','))].join('\n');
};

function Messages() {
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem('theme');
      return stored === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const fetchMessages = useCallback(async ({ isRefresh = false, signal } = {}) => {
    setError('');
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await axios.get(ENDPOINT, { signal });
      const data = Array.isArray(response.data) ? response.data : [];
      setMessages(data);
      setLastUpdated(new Date());
    } catch (err) {
      const canceled =
        err?.code === 'ERR_CANCELED' ||
        err?.name === 'CanceledError' ||
        (typeof axios.isCancel === 'function' && axios.isCancel(err));

      if (!canceled) {
        setError('Failed to load messages. Please try again.');
      }
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchMessages({ isRefresh: false, signal: controller.signal });
    return () => controller.abort();
  }, [fetchMessages]);

  const totalCount = Array.isArray(messages) ? messages.length : 0;

  const filtered = useMemo(() => {
    const base = Array.isArray(messages) ? messages : [];
    const q = query.trim().toLowerCase();

    const searched = !q
      ? base
      : base.filter((row) => {
          return (
            safeLower(row?.Name).includes(q) ||
            safeLower(row?.Email).includes(q) ||
            safeLower(row?.Message).includes(q) ||
            safeLower(row?.Date).includes(q)
          );
        });

    const sorted = [...searched].sort((a, b) => {
      const aMs = parseDateMs(a?.Date);
      const bMs = parseDateMs(b?.Date);
      if (sort === 'oldest') return aMs - bMs;
      return bMs - aMs;
    });

    return sorted;
  }, [messages, query, sort]);

  const emptyMessage = useMemo(() => {
    if (loading) return 'Loading…';
    if (totalCount === 0) return 'No messages yet';
    if (filtered.length === 0) return 'No messages match your search';
    return 'No records found';
  }, [filtered.length, loading, totalCount]);

  const columns = useMemo(
    () => [
      {
        label: 'Name',
        key: 'Name',
        accessor: (row) => (
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900">{row?.Name ?? '—'}</span>
            <span className="mt-0.5 text-xs text-slate-500">{row?.Email ?? '—'}</span>
          </div>
        ),
      },
      {
        label: 'Email',
        key: 'Email',
        accessor: (row) => {
          const email = String(row?.Email ?? '').trim();
          if (!email) return '—';
          return (
            <a
              className="text-sky-700 hover:text-sky-800 hover:underline"
              href={`mailto:${email}`}
              title={email}
            >
              {email}
            </a>
          );
        },
      },
      {
        label: 'Message',
        key: 'Message',
        accessor: (row) => {
          const msg = String(row?.Message ?? '').trim();
          if (!msg) return '—';
          return (
            <span className="block max-w-[36rem] truncate" title={msg}>
              {msg}
            </span>
          );
        },
      },
      {
        label: 'Date',
        key: 'Date',
        accessor: (row) => <span className="whitespace-nowrap">{formatDateTime(row?.Date)}</span>,
      },
    ],
    []
  );

  const onExportCsv = useCallback(() => {
    const headers = ['Name', 'Email', 'Message', 'Date'];
    const csv = toCsv(filtered, headers);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    const a = document.createElement('a');
    a.href = url;
    a.download = `messages-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  }, [filtered]);

  const shownCount = filtered.length;

  const lastUpdatedLabel = useMemo(() => {
    if (!lastUpdated) return '—';
    try {
      return new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(lastUpdated);
    } catch {
      return lastUpdated.toLocaleString();
    }
  }, [lastUpdated]);

  return (
    <div className="bg-geo min-h-dvh text-slate-900 dark:text-white">
      <div className="mx-auto max-w-screen-2xl px-3 py-10 sm:px-4 lg:px-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="pill">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500 dark:bg-sky-300" />
                INBOX
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Messages
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Contact form submissions fetched from Google Apps Script.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link className="btn-secondary px-3 py-2" to="/" aria-label="Back to home">
                <span className="inline-flex items-center gap-2">
                  <FiArrowLeft className="h-4 w-4" />
                  <span className="text-sm">Home</span>
                </span>
              </Link>

              <button
                type="button"
                className="btn-secondary px-3 py-2"
                onClick={() => fetchMessages({ isRefresh: true })}
                disabled={loading || refreshing}
              >
                <span className="inline-flex items-center gap-2">
                  <FiRefreshCcw className={refreshing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
                  <span className="text-sm">Refresh</span>
                </span>
              </button>

              <button
                type="button"
                className="btn-secondary px-3 py-2"
                onClick={onExportCsv}
                disabled={loading || shownCount === 0}
              >
                <span className="inline-flex items-center gap-2">
                  <FiDownload className="h-4 w-4" />
                  <span className="text-sm">Export</span>
                </span>
              </button>

              <button
                type="button"
                className="btn-secondary px-3 py-2"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              >
                {theme === 'dark' ? <FiSun className="h-4 w-4" /> : <FiMoon className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="card p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div className="w-full sm:max-w-md">
                    <label className="text-xs font-semibold tracking-widest text-slate-700 dark:text-slate-300">
                      SEARCH
                    </label>
                    <div className="relative mt-2">
                      <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        className="input pl-10"
                        placeholder="Name, email, message, date…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="btn-secondary px-3 py-2 text-xs"
                      onClick={() => setSort((s) => (s === 'newest' ? 'oldest' : 'newest'))}
                      disabled={loading}
                    >
                      Sort: {sort === 'newest' ? 'Newest first' : 'Oldest first'}
                    </button>

                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Showing <span className="font-semibold text-slate-900 dark:text-white">{shownCount}</span> of{' '}
                      <span className="font-semibold text-slate-900 dark:text-white">{totalCount}</span>
                    </div>
                  </div>
                </div>

                {error ? (
                  <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-200">
                    {error}
                  </div>
                ) : null}

                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-900/10 bg-white/90 shadow-sm">
                  <DataTable columns={columns} data={loading ? [] : filtered} emptyMessage={emptyMessage} />
                </div>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="card p-4 sm:p-6">
                <div className="text-xs font-semibold tracking-widest text-slate-600 dark:text-slate-400">OVERVIEW</div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="glass-tile rounded-2xl px-4 py-3">
                    <div className="text-xs text-slate-600 dark:text-slate-400">Total</div>
                    <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{totalCount}</div>
                  </div>
                  <div className="glass-tile rounded-2xl px-4 py-3">
                    <div className="text-xs text-slate-600 dark:text-slate-400">Visible</div>
                    <div className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{shownCount}</div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-900/10 dark:border-white/10 bg-white/40 dark:bg-white/5 px-4 py-3">
                  <div className="text-xs text-slate-600 dark:text-slate-400">Last updated</div>
                  <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{lastUpdatedLabel}</div>
                </div>

                <div className="mt-4 text-xs text-slate-600 dark:text-slate-400">
                  Tip: use Export to download the filtered view as a CSV.
                </div>

                <div className="mt-4">
                  <a
                    className="btn-secondary w-full"
                    href={ENDPOINT}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open data source
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-500">
            This page is intended for reviewing form submissions.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Messages;
