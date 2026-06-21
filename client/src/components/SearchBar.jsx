import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { SearchIcon } from "./Icons.jsx";

export default function SearchBar({ large = false }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const navigate = useNavigate();

  // instant AJAX suggestions (debounced)
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get("/products/suggest", { params: { q: query } });
        setSuggestions(data.items);
        setOpen(true);
      } catch {
        /* ignore */
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    setOpen(false);
    navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  return (
    <div className="search-wrap" ref={boxRef}>
      <form className={large ? "search-bar large" : "search-bar"} onSubmit={submit}>
        <span className="tune-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
            <circle cx="10" cy="7" r="2.4" fill="var(--bg)" />
            <circle cx="15" cy="12" r="2.4" fill="var(--bg)" />
            <circle cx="9" cy="17" r="2.4" fill="var(--bg)" />
          </svg>
        </span>
        <input
          type="search"
          placeholder="Search for anything..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length && setOpen(true)}
        />
        <button type="submit" className="search-submit" aria-label="Search">
          <SearchIcon />
        </button>
      </form>
      {open && suggestions.length > 0 && (
        <ul className="suggest-list">
          {suggestions.map((s) => (
            <li
              key={s._id}
              onClick={() => {
                setOpen(false);
                setQuery("");
                navigate(`/product/${s.slug}`);
              }}
            >
              {s.thumbnail && <img src={s.thumbnail} alt="" />}
              <span>{s.name}</span>
              <em>{s.type}</em>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
