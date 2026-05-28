import React, { useState, useRef, useEffect } from 'react';
import { MapPinned } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FLUIDJOBS_API } from '../utils/jobUtils';

export default function LocationAutocomplete({ value, onChange, placeholder = "City you are based in" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  useEffect(() => {
    if (!inputValue || inputValue.length < 1) {
      setSuggestions([]);
      return;
    }
    
    // We only fetch suggestions if the input doesn't exactly match the selected value (value prop might be the same as input when we pick it)
    if (inputValue === value && !isOpen) {
      return; 
    }

    const fetchLocations = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${FLUIDJOBS_API}/suggestions/locations?q=${encodeURIComponent(inputValue)}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(Array.isArray(data) ? data.slice(0, 10) : []);
        }
      } catch (err) {
        console.error("Failed to fetch location suggestions", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchLocations, 300);
    return () => clearTimeout(timer);
  }, [inputValue, value, isOpen]);

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all duration-200">
        <span className="text-gray-400 flex-shrink-0">
          <MapPinned className="w-4 h-4" />
        </span>
        <input
          type="text"
          autoComplete="off"
          name="location_city_search"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400 min-w-0"
        />
      </div>

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg shadow-gray-100 overflow-hidden max-h-48 overflow-y-auto"
          >
            <div className="py-1">
              {suggestions.map((city, index) => (
                <div
                  key={index}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors"
                  onClick={() => {
                    setInputValue(city);
                    onChange(city);
                    setIsOpen(false);
                  }}
                >
                  {city}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
