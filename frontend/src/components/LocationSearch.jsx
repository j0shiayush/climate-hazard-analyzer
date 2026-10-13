import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, MapPin, Loader2 } from 'lucide-react';

export default function LocationSearch({ onLocationSelect }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length > 2) {
        setLoading(true);
        try {
          const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5`);
          setSuggestions(res.data);
          setShowDropdown(true);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 600); 

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (loc) => {
    setQuery(loc.display_name.split(',')[0]); 
    setShowDropdown(false);
    onLocationSelect({ 
      lat: parseFloat(loc.lat), 
      lon: parseFloat(loc.lon), 
      name: loc.display_name 
    });
  };

  return (
    <div className="relative w-full mb-4" ref={dropdownRef}>
      <div className="relative flex items-center">
        <Search size={18} className="absolute left-3 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length > 2 && setShowDropdown(true)}
          placeholder="Search city (e.g., Gorakhpur)..."
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
        />
        {loading && <Loader2 size={18} className="absolute right-3 text-gray-400 animate-spin" />}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {suggestions.map((loc) => (
            <li 
              key={loc.place_id}
              onClick={() => handleSelect(loc)}
              className="px-4 py-3 hover:bg-red-50 cursor-pointer flex items-start gap-2 border-b border-gray-50 last:border-0 transition-colors"
            >
              <MapPin size={16} className="mt-1 flex-shrink-0 text-red-500" />
              <span className="text-sm text-gray-700">{loc.display_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}