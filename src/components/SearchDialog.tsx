import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  queryTerms,
  recentGuides,
  search,
  splitHighlights,
  type SearchDoc,
  type SearchIndex,
} from '../lib/search';

/**
 * Global search, in two mounts:
 *
 * - `dialog` (header): a trigger that is a real link to `/search/`, so it still
 *   navigates without JavaScript, plus a shortcut (`/` or ⌘/Ctrl+K) and a modal
 *   panel. Portalled to <body> because the header is backdrop-blurred, and
 *   `backdrop-filter` turns an ancestor into the containing block for fixed
 *   descendants.
 * - `inline` (/search/ page): the same panel rendered in the page flow, reading
 *   the query from `?q=` and writing it back with `replaceState`.
 *
 * The index is a static JSON file fetched on first demand — never on page load —
 * so search adds no weight to a normal page view.
 */

const INDEX_URL = '/search-index.json';

/** One in-flight request per page, shared by every mount of the island. */
let indexRequest: Promise<SearchIndex> | null = null;

function loadIndex(): Promise<SearchIndex> {
  indexRequest ??= fetch(INDEX_URL, { headers: { accept: 'application/json' } })
    .then(async (response) => {
      if (!response.ok) throw new Error(`search index: HTTP ${response.status}`);
      return (await response.json()) as SearchIndex;
    })
    .catch((error: unknown) => {
      // Forget the failed attempt so reopening the panel retries.
      indexRequest = null;
      throw error;
    });

  return indexRequest;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

const BROADENING_LINKS = [
  { href: '/transit-visa/', label: 'Visas and transit rules' },
  { href: '/cities/', label: 'City trips' },
  { href: '/airports/', label: 'Airports and transfers' },
  { href: '/payments/', label: 'Payments and apps' },
];

const formatDate = (iso: string | undefined): string => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.valueOf())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" aria-hidden="true">
      <circle cx="8.6" cy="8.6" r="5.4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12.7 12.7 17 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function Highlight({ text, terms }: { text: string; terms: string[] }) {
  const parts = splitHighlights(text, terms);
  return (
    <>
      {parts.map((part, index) =>
        part.hit ? (
          <mark key={index} className="search-hit">
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </>
  );
}

interface RowProps {
  doc: SearchDoc;
  terms: string[];
  snippet?: string;
  /** `option` inside the listbox, `plain` for the empty state's link list. */
  role: 'option' | 'plain';
  id?: string;
  selected?: boolean;
  onActivate?: () => void;
}

function ResultRow({ doc, terms, snippet, role, id, selected, onActivate }: RowProps) {
  const updated = formatDate(doc.updated);
  const preview = snippet && snippet.length > 0 ? snippet : doc.description;

  return (
    <li
      id={id}
      role={role}
      aria-selected={role === 'option' ? Boolean(selected) : undefined}
      onMouseEnter={onActivate}
      className={[
        'border-b border-line/70 last:border-b-0',
        role === 'option' && selected ? 'bg-brand-tint' : 'hover:bg-surface-2',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <a href={doc.url} onFocus={onActivate} className="block px-4 py-3 sm:px-5">
        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[0.68rem] font-semibold tracking-[0.12em] uppercase">
          <span className="text-brand">{doc.category ?? doc.kind}</span>
          {updated && <span className="tracking-normal text-faint normal-case tabular-nums">Updated {updated}</span>}
        </span>
        <span className="mt-1.5 block font-display text-[1.05rem] leading-snug font-semibold tracking-[-0.015em] text-ink">
          <Highlight text={doc.title} terms={terms} />
        </span>
        <span className="mt-1 line-clamp-2 block text-sm leading-relaxed text-muted">
          <Highlight text={preview} terms={terms} />
        </span>
      </a>
    </li>
  );
}

function SkeletonRows({ count = 4 }: { count?: number }) {
  return (
    <ul aria-hidden="true" className="border-t border-line">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="border-b border-line/70 px-4 py-3.5 sm:px-5">
          <span className="block h-2.5 w-24 animate-pulse rounded-[4px] bg-surface-2" />
          <span className="mt-2.5 block h-3.5 w-[min(28rem,80%)] animate-pulse rounded-[4px] bg-surface-2" />
          <span className="mt-2.5 block h-3 w-[min(34rem,95%)] animate-pulse rounded-[4px] bg-surface-2" />
        </li>
      ))}
    </ul>
  );
}

interface Props {
  /** `dialog` for the header, `inline` for the /search/ page. */
  mode?: 'dialog' | 'inline';
}

type Status = 'idle' | 'loading' | 'ready' | 'error';

export default function SearchDialog({ mode = 'dialog' }: Props) {
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [query, setQuery] = useState('');
  const [docs, setDocs] = useState<SearchDoc[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [active, setActive] = useState(0);
  const [shortcut, setShortcut] = useState('Ctrl K');

  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const listId = useId();

  const busy = status === 'idle' || status === 'loading';
  const terms = useMemo(() => queryTerms(query), [query]);
  const trimmed = query.trim();
  const limit = mode === 'inline' ? 30 : 8;

  const results = useMemo(
    () => (status === 'ready' && trimmed.length > 0 ? search(docs, query, { limit }) : []),
    [docs, limit, query, status, trimmed],
  );
  const suggestions = useMemo(() => (status === 'ready' ? recentGuides(docs) : []), [docs, status]);

  const load = useCallback(() => {
    setStatus((current) => (current === 'ready' ? current : 'loading'));
    loadIndex()
      .then((index) => {
        setDocs(index.docs);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  useEffect(() => setHydrated(true), []);

  // The header mounts this island on every page; only the /search/ page needs
  // the index before the reader asks for it.
  useEffect(() => {
    if (mode === 'inline') load();
  }, [load, mode]);

  useEffect(() => {
    if (/mac/i.test(navigator.userAgent)) setShortcut('⌘K');
  }, []);

  // Arriving from /search/?q=… (a no-JS submit, a shared link, or the dialog's
  // "see all results" link) must populate the box after hydration.
  useEffect(() => {
    if (mode !== 'inline') return;
    const fromUrl = new URL(window.location.href).searchParams.get('q');
    if (fromUrl) setQuery(fromUrl);
  }, [mode]);

  // Keep ?q= shareable without adding a history entry per keystroke.
  useEffect(() => {
    if (mode !== 'inline') return;
    const timer = window.setTimeout(() => {
      const url = new URL(window.location.href);
      if (trimmed.length > 0) url.searchParams.set('q', trimmed);
      else url.searchParams.delete('q');
      window.history.replaceState(null, '', url);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [mode, trimmed]);

  const openDialog = useCallback(() => {
    setOpen(true);
    load();
  }, [load]);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActive(0);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (mode !== 'dialog' || !open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mode, open]);

  useEffect(() => {
    if (mode !== 'dialog') return;

    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (open) closeDialog();
        else openDialog();
        return;
      }

      if (event.key === 'Escape' && open) {
        event.preventDefault();
        closeDialog();
        return;
      }

      if (event.key !== '/' || open) return;
      const target = event.target;
      const typing =
        target instanceof HTMLElement &&
        (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
      if (typing) return;
      event.preventDefault();
      openDialog();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [closeDialog, open, openDialog]);

  const onPanelKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const count = results.length;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (count === 0) return;
      event.preventDefault();
      setActive((current) =>
        event.key === 'ArrowDown' ? (current + 1) % count : (current - 1 + count) % count,
      );
      return;
    }

    if (event.key === 'Home' && count > 0) {
      event.preventDefault();
      setActive(0);
      return;
    }

    if (event.key === 'End' && count > 0) {
      event.preventDefault();
      setActive(count - 1);
      return;
    }

    if (event.key === 'Enter') {
      const hit = results[active];
      if (!hit) return;
      event.preventDefault();
      window.location.assign(hit.doc.url);
      return;
    }

    if (event.key === 'Escape' && mode === 'inline' && trimmed.length > 0) {
      event.preventDefault();
      setQuery('');
      setActive(0);
      inputRef.current?.focus();
      return;
    }

    if (event.key !== 'Tab') return;

    // Keep focus inside the panel while it is modal.
    const panel = panelRef.current;
    if (!panel) return;
    const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (node) => node.offsetParent !== null,
    );
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const activeOptionId = results[active] ? `${listId}-option-${active}` : undefined;

  const panel = (
    <div
      ref={panelRef}
      onKeyDown={onPanelKeyDown}
      role="dialog"
      aria-modal={mode === 'dialog' ? true : undefined}
      aria-labelledby={`${listId}-label`}
      className={[
        'flex w-full flex-col overflow-hidden bg-surface',
        mode === 'dialog'
          ? 'h-full border-line sm:h-auto sm:max-h-[min(36rem,85dvh)] sm:max-w-[46rem] sm:rounded-panel sm:border sm:shadow-lift'
          : 'rounded-panel border border-line shadow-soft',
      ].join(' ')}
    >
      <h2 id={`${listId}-label`} className="sr-only">
        Search China Layover Guide
      </h2>

      <form
        role="search"
        action="/search/"
        method="get"
        onSubmit={(event) => {
          const hit = results[active];
          if (!hit || trimmed.length === 0) return;
          event.preventDefault();
          window.location.assign(hit.doc.url);
        }}
        className="flex items-center gap-3 border-b border-line px-4 py-3.5 sm:px-5"
      >
        <SearchIcon className="h-[1.15rem] w-[1.15rem] shrink-0 text-faint" />
        <label htmlFor={`${listId}-input`} className="sr-only">
          Search guides, cities, and airports
        </label>
        <input
          ref={inputRef}
          id={`${listId}-input`}
          name="q"
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          placeholder="Search guides, cities, airports…"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={trimmed.length > 0 && results.length > 0}
          aria-controls={listId}
          aria-activedescendant={activeOptionId}
          className="min-w-0 flex-1 bg-transparent text-[1.05rem] text-ink placeholder:text-faint focus:outline-none"
        />
        {query.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setActive(0);
              inputRef.current?.focus();
            }}
            className="shrink-0 rounded-[4px] px-2 py-1 text-xs font-semibold tracking-[0.08em] text-faint uppercase transition-colors duration-200 hover:bg-surface-2 hover:text-brand"
          >
            Clear
          </button>
        ) : (
          <kbd className="hidden shrink-0 rounded-[4px] border border-line px-1.5 py-0.5 text-[0.68rem] font-semibold text-faint sm:block">
            {shortcut}
          </kbd>
        )}
        {mode === 'dialog' && (
          <button
            type="button"
            onClick={closeDialog}
            className="shrink-0 rounded-[4px] px-2 py-1 text-xs font-semibold tracking-[0.08em] text-faint uppercase transition-colors duration-200 hover:bg-surface-2 hover:text-brand sm:hidden"
          >
            Close
          </button>
        )}
      </form>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <p aria-live="polite" className="sr-only">
          {status === 'error'
            ? 'Search is unavailable'
            : busy
              ? 'Loading search index'
              : `${results.length} result${results.length === 1 ? '' : 's'}`}
        </p>

        {status === 'error' ? (
          <div className="px-4 py-8 text-center sm:px-5">
            <p className="font-display text-lg font-semibold text-ink">Search is unavailable</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
              The index could not be loaded. Check your connection and try again, or browse the
              guides instead.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <button type="button" onClick={load} className="btn btn-secondary">
                Try again
              </button>
              <a href="/guides/" className="link text-sm font-medium">
                Browse all guides
              </a>
            </div>
          </div>
        ) : busy ? (
          <SkeletonRows />
        ) : trimmed.length === 0 ? (
          <div className="px-4 py-5 sm:px-5">
            <p className="eyebrow text-muted">Recently updated</p>
            <ul className="mt-3 -mx-4 sm:-mx-5">
              {suggestions.map((doc) => (
                <ResultRow key={doc.id} doc={doc} terms={[]} role="plain" />
              ))}
            </ul>
            <p className="eyebrow mt-7 text-muted">Browse by topic</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {BROADENING_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="inline-block rounded-sm border border-line bg-paper px-3 py-1.5 text-sm text-body transition-colors duration-200 hover:border-brand hover:bg-brand-tint hover:text-brand"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : results.length === 0 ? (
          <div className="px-4 py-8 text-center sm:px-5">
            <p className="font-display text-lg font-semibold text-ink">
              No matches for “{trimmed}”
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
              Try fewer words, or start from a topic.
            </p>
            <ul className="mt-4 flex flex-wrap justify-center gap-2">
              {BROADENING_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="inline-block rounded-sm border border-line bg-paper px-3 py-1.5 text-sm text-body transition-colors duration-200 hover:border-brand hover:bg-brand-tint hover:text-brand"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <ul id={listId} role="listbox" aria-label="Search results">
            {results.map((result, index) => (
              <ResultRow
                key={result.doc.id}
                id={`${listId}-option-${index}`}
                doc={result.doc}
                terms={terms}
                snippet={result.snippet}
                role="option"
                selected={index === active}
                onActivate={() => setActive(index)}
              />
            ))}
          </ul>
        )}
      </div>

      {mode === 'dialog' && (
        <div className="flex items-center justify-between gap-4 border-t border-line bg-paper px-4 py-2.5 text-xs text-faint sm:px-5">
          <p className="hidden sm:block">
            <kbd className="font-semibold">↑↓</kbd> to move · <kbd className="font-semibold">↵</kbd> to
            open · <kbd className="font-semibold">esc</kbd> to close
          </p>
          <p className="tabular-nums">
            {status === 'error' || busy
              ? null
              : trimmed.length > 0
                ? `${results.length} result${results.length === 1 ? '' : 's'}`
                : `${docs.length} pages indexed`}
          </p>
          {trimmed.length > 0 && (
            <a href={`/search/?q=${encodeURIComponent(trimmed)}`} className="link font-medium">
              See all results
            </a>
          )}
        </div>
      )}
    </div>
  );

  if (mode === 'inline') return <div>{panel}</div>;

  return (
    <>
      <a
        ref={triggerRef}
        href="/search/"
        data-search-trigger
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={(event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey) return;
          event.preventDefault();
          openDialog();
        }}
        className="group inline-flex shrink-0 items-center gap-2 rounded-sm border border-line-strong bg-surface px-2.5 py-2 text-sm text-muted transition-colors duration-200 hover:border-brand hover:bg-brand-tint hover:text-brand"
      >
        <SearchIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Search</span>
      </a>

      {open && hydrated
        ? createPortal(
            <div
              className="fixed inset-0 z-[var(--z-overlay)] flex flex-col items-center sm:justify-start sm:p-6 sm:pt-[9vh]"
              role="presentation"
            >
              <div
                aria-hidden="true"
                onClick={closeDialog}
                className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
              />
              <div className="relative flex h-full w-full flex-col sm:h-auto sm:w-[46rem] sm:max-w-full">
                {panel}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
