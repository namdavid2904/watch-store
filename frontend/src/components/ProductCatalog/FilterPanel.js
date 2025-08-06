import React, { useState } from 'react';
import './FilterPanel.css';

const FilterPanel = ({ onFilterChange, onSortChange }) => {
  const [filters, setFilters] = useState({
    brand: [],
    priceRange: [0, 10000],
    category: [],
    color: [],
    movement: [],
    size: []
  });
  const [sortBy, setSortBy] = useState('newest');
  const [isExpanded, setIsExpanded] = useState(false);

  const filterOptions = {
    brand: ['Rolex', 'Omega', 'TAG Heuer', 'Tissot', 'Rado', 'Hublot'],
    category: ['Luxury', 'Sport', 'Dress', 'Diving', 'Pilot', 'Racing'],
    color: ['Black', 'White', 'Gold', 'Silver', 'Blue', 'Green'],
    movement: ['Automatic', 'Quartz', 'Manual', 'Chronograph'],
    size: ['36mm', '39mm', '42mm', '44mm', '46mm']
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'popularity', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters };
    
    if (filterType === 'priceRange') {
      newFilters.priceRange = value;
    } else {
      const currentValues = newFilters[filterType];
      if (currentValues.includes(value)) {
        newFilters[filterType] = currentValues.filter(item => item !== value);
      } else {
        newFilters[filterType] = [...currentValues, value];
      }
    }
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortBy(value);
    onSortChange(value);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      brand: [],
      priceRange: [0, 10000],
      category: [],
      color: [],
      movement: [],
      size: []
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).reduce((count, filterArray) => {
      if (Array.isArray(filterArray)) {
        return count + filterArray.length;
      }
      return count;
    }, 0);
  };

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <div className="filter-title">
          <h3>Filters</h3>
          {getActiveFilterCount() > 0 && (
            <span className="active-count">({getActiveFilterCount()})</span>
          )}
        </div>
        <div className="filter-actions">
          <button onClick={clearAllFilters} className="clear-btn">
            Clear All
          </button>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="expand-btn"
          >
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      <div className="sort-section">
        <label htmlFor="sort">Sort by:</label>
        <select 
          id="sort" 
          value={sortBy} 
          onChange={handleSortChange}
          className="sort-select"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className={`filter-content ${isExpanded ? 'expanded' : ''}`}>
        {/* Price Range Filter */}
        <div className="filter-section">
          <h4>Price Range</h4>
          <div className="price-range">
            <input
              type="range"
              min="0"
              max="10000"
              value={filters.priceRange[1]}
              onChange={(e) => handleFilterChange('priceRange', [0, parseInt(e.target.value)])}
              className="price-slider"
            />
            <div className="price-labels">
              <span>${filters.priceRange[0]}</span>
              <span>${filters.priceRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Other Filters */}
        {Object.entries(filterOptions).map(([filterType, options]) => (
          <div key={filterType} className="filter-section">
            <h4>{filterType.charAt(0).toUpperCase() + filterType.slice(1)}</h4>
            <div className="filter-options">
              {options.map(option => (
                <label key={option} className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters[filterType].includes(option)}
                    onChange={() => handleFilterChange(filterType, option)}
                  />
                  <span className="checkmark"></span>
                  {option}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilterPanel;