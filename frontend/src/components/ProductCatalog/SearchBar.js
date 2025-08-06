import React, { useState, useEffect, useRef } from 'react';
import './SearchBar.css';

const SearchBar = ({ onSearch, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);

  // Mock data for autocomplete
  const mockSuggestions = [
    'Rolex Submariner', 'Omega Speedmaster', 'TAG Heuer Monaco',
    'Tissot PRC 200', 'Rado Captain Cook', 'Hublot Big Bang',
    'Swiss watches', 'Luxury watches', 'Sport watches', 'Dress watches'
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 2) {
      setIsLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        const filtered = mockSuggestions.filter(item =>
          item.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filtered.slice(0, 5));
        setShowSuggestions(true);
        setIsLoading(false);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    // Trigger search
    onSearch(value);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
    setShowSuggestions(false);
  };

  return (
    <div className="search-bar" ref={searchRef}>
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-container">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search watches, brands, or styles..."
            className="search-input"
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          />
          <button type="submit" className="search-btn">
            🔍
          </button>
        </div>
        
        {showSuggestions && (
          <div className="suggestions-dropdown">
            {isLoading ? (
              <div className="suggestion-loading">Searching...</div>
            ) : (
              suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <span className="suggestion-icon">🔍</span>
                  {suggestion}
                </div>
              ))
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;