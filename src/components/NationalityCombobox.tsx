import { useEffect, useMemo, useRef, useState } from 'react';
import { filterCountries } from '../data/countries';

interface Props {
  value: string;
  onChange: (nationality: string) => void;
  label?: string;
  placeholder?: string;
}

/**
 * Searchable nationality picker.
 *
 * A native <select> works up to ~55 entries, but the honest list of nationalities
 * is ~200 long, and a user must be able to find their own country even when it is
 * NOT eligible. This combobox lists every nationality and filters as you type.
 *
 * Free text is committed on blur so an unrecognized entry still produces a result
 * rather than silently doing nothing.
 */
export default function NationalityCombobox({
  value,
  onChange,
  label = 'Nationality',
  placeholder = 'Start typing your nationality…',
}: Props) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputId = 'nationality-input';
  const listId = 'nationality-listbox';

  const results = useMemo(() => filterCountries(query).slice(0, 50), [query]);

  // Keep the input in sync when the parent resets the value.
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close on outside click, committing whatever the user typed.
  useEffect(() => {
    function onDocumentMouseDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
        commitQuery();
      }
    }
    document.addEventListener('mousedown', onDocumentMouseDown);
    return () => document.removeEventListener('mousedown', onDocumentMouseDown);
  });

  function commitQuery() {
    const trimmed = query.trim();
    if (trimmed && trimmed !== value) onChange(trimmed);
  }

  function select(country: string) {
    onChange(country);
    setQuery(country);
    setOpen(false);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (event.key === 'ArrowDown' || event.key === 'Enter')) {
      setOpen(true);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlight((current) => Math.min(current + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlight((current) => Math.max(current - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const choice = results[highlight];
      if (choice) select(choice);
    } else if (event.key === 'Escape') {
      setOpen(false);
      setQuery(value);
    }
  }

  const activeOptionId =
    open && results[highlight] ? `nationality-option-${highlight}` : undefined;

  return (
    <div className="relative" ref={rootRef}>
      <label className="field-label" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeOptionId}
        autoComplete="off"
        value={query}
        placeholder={placeholder}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          setHighlight(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={commitQuery}
        onKeyDown={onKeyDown}
        className="field mt-1.5"
      />

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute z-20 mt-1.5 max-h-64 w-full overflow-auto rounded-card border border-line bg-surface py-1 shadow-lift"
        >
          {results.length === 0 && (
            <li className="px-3.5 py-3">
              <p className="text-sm font-semibold text-ink">No country matches that spelling.</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Keep typing, or use the closest match. An unrecognized entry still gets checked —
                we just answer conservatively.
              </p>
            </li>
          )}
          {results.map((country, index) => (
            <li
              key={country}
              id={`nationality-option-${index}`}
              role="option"
              aria-selected={country === value}
              onMouseDown={(event) => {
                // mousedown (not click) so the selection lands before blur.
                event.preventDefault();
                select(country);
              }}
              onMouseEnter={() => setHighlight(index)}
              className={`flex cursor-pointer items-center justify-between gap-3 px-3.5 py-2 text-sm transition-colors duration-150 ${
                index === highlight ? 'bg-brand-tint text-brand-ink' : 'text-body'
              }`}
            >
              {country}
              {country === value && (
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-brand" aria-hidden="true">
                  <path
                    d="M2.5 8.5l3.5 3.5 7.5-8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
