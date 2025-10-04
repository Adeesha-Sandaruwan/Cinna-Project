import React, { useState, useEffect, useRef } from 'react';
import { safeRequest, isOk } from '../utils/api';
import { useNavigate } from 'react-router-dom';

/**
 * ProductSearch component
 * Features:
 * - Debounced search (default 400ms) hitting /api/products?q=term
 * - Aborts in-flight requests when term changes
 * - Keyboard navigation (ArrowUp/ArrowDown/Enter/Escape)
 * - Accessible ARIA roles for listbox/options
 * - Displays loading / empty / error states
 * - Configurable minimum characters (default 2)
 */
export default function ProductSearch({ minChars = 2, debounceMs = 400, className = '' }) {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [highlight, setHighlight] = useState(-1);
  const controllerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  // Derived flag
  const canSearch = term.trim().length >= minChars;

  useEffect(() => {
    if (!canSearch) {
      // Reset state when below min chars
      setResults([]);
      setOpen(false);
      setError(null);
      if (controllerRef.current) controllerRef.current.abort();
      return;
    }

    setLoading(true);
    setError(null);

    // Debounce
    const handle = setTimeout(() => {
      // Abort prior fetch
      if (controllerRef.current) controllerRef.current.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      safeRequest(`/api/products?q=${encodeURIComponent(term)}`)
        .then(({ res, data }) => {
          if (!isOk(res)) throw new Error(data?.message || 'Search failed');
          if (!Array.isArray(data)) throw new Error('Unexpected response shape');
          setResults(data.slice(0, 8));
          setOpen(true);
          setHighlight(-1);
        })
        .catch(err => {
          if (err.name === 'AbortError') return;
          console.warn('ProductSearch error:', err);
          setError(err.message || 'Search failed');
          setResults([]);
          setOpen(true);
        })
        .finally(() => setLoading(false));
    }, debounceMs);

    return () => clearTimeout(handle);
  }, [term, debounceMs, canSearch]);

  const onSelect = (product) => {
    setOpen(false);
    setTerm('');
    navigate(`/products/${product._id}`);
  };

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight(h => Math.min((results.length - 1), h + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight(h => Math.max(0, h - 1));
    } else if (e.key === 'Enter') {
      if (highlight >= 0 && highlight < results.length) {
        e.preventDefault();
        onSelect(results[highlight]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!open) return;
      if (inputRef.current && !inputRef.current.parentElement.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={term}
        onChange={e => setTerm(e.target.value)}
        onFocus={() => { if (results.length > 0) setOpen(true); }}
        onKeyDown={handleKeyDown}
        placeholder="Search products..."
        aria-expanded={open}
        aria-controls="product-search-list"
        className="bg-white rounded-full px-3 py-1 text-sm text-gray-700 placeholder-gray-400 w-40 focus:w-56 transition-all duration-200 outline-none shadow-inner"
      />
      {open && (
        <div
          id="product-search-list"
          role="listbox"
          ref={listRef}
          className="absolute left-0 mt-1 w-64 max-h-80 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50 text-sm"
        >
          {loading && (
            <div className="px-3 py-2 text-gray-500">Loading...</div>
          )}
          {!loading && error && (
            <div className="px-3 py-2 text-red-600">{error}</div>
          )}
          {!loading && !error && results.length === 0 && canSearch && (
            <div className="px-3 py-2 text-gray-500">No matches</div>
          )}
          {!loading && !error && results.map((p, idx) => (
            <button
              type="button"
              key={p._id}
              role="option"
              aria-selected={highlight === idx}
              onMouseEnter={() => setHighlight(idx)}
              onMouseLeave={() => setHighlight(-1)}
              onClick={() => onSelect(p)}
              className={`w-full px-3 py-2 text-left hover:bg-gray-100 truncate text-gray-800 ${highlight === idx ? 'bg-gray-100' : ''}`}
            >
              <span className="font-medium block truncate text-gray-800">{p.name}</span>
            </button>
          ))}
          {!loading && !error && !canSearch && (
            <div className="px-3 py-2 text-gray-400 text-xs">Type at least {minChars} characters...</div>
          )}
        </div>
      )}
    </div>
  );
}
