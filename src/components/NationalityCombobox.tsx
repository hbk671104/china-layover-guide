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
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
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
        onKeyDown={onKeyDown}
        className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900"
      />

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {results.length === 0 && (
            <li className="px-3 py-2 text-sm text-slate-500">
              No match. Type your nationality in full, or select “Other / not listed”.
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
              className={`cursor-pointer px-3 py-2 text-sm text-slate-800 ${
                index === highlight ? 'bg-slate-100' : ''
              }`}
            >
              {country}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
