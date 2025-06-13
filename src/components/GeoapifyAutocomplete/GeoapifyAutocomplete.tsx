import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface GeoapifyAutocompleteProps {
  type: 'country' | 'city' | 'district' | 'poi';
  countryCode?: string;
  cityName?: string;
  value: string;
  onSelect: (value: string, extraInfo?: any) => void;
}

const GeoapifyAutocomplete: React.FC<GeoapifyAutocompleteProps> = ({
  type,
  countryCode,
  cityName,
  value,
  onSelect
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const timeoutRef = useRef<any>(null);

  const API_KEY = '66b81ba042ea433397c02596a78eea32';

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const buildApiUrl = (text: string): string => {
    const baseUrl = 'https://api.geoapify.com';

    switch (type) {
      case 'country':
        return `${baseUrl}/v1/geocode/autocomplete?text=${encodeURIComponent(
          text
        )}&type=country&limit=5&apiKey=${API_KEY}`;

      case 'city':
        let cityUrl = `${baseUrl}/v1/geocode/search?text=${encodeURIComponent(
          text
        )}&type=city&limit=5&apiKey=${API_KEY}`;
        if (countryCode) {
          cityUrl += `&filter=countrycode:${countryCode.toLowerCase()}`;
        }
        return cityUrl;

      case 'district':
        let districtUrl = `${baseUrl}/v1/geocode/search?text=${encodeURIComponent(
          text
        )}&type=county&limit=5&apiKey=${API_KEY}`;
        if (countryCode) {
          districtUrl += `&filter=countrycode:${countryCode.toLowerCase()}`;
        }
        return districtUrl;

      case 'poi':
        let poiUrl = `${baseUrl}/v1/geocode/search?text=${encodeURIComponent(
          text
        )}&type=amenity&limit=5&apiKey=${API_KEY}`;
        if (countryCode) {
          poiUrl += `&filter=countrycode:${countryCode.toLowerCase()}`;
        }
        if (cityName) {
          poiUrl += `&filter=place:${encodeURIComponent(cityName)}`;
        }
        return poiUrl;

      default:
        return '';
    }
  };

  const handleFetchSuggestions = async (text: string) => {
    if (!text || text.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const url = buildApiUrl(text);
      if (!url) return;

      const response = await axios.get(url);
      const features = response.data.features || [];
      setSuggestions(features);
      setShowSuggestions(features.length > 0);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      handleFetchSuggestions(newValue);
    }, 300);
  };

  const getDisplayText = (suggestion: any): string => {
    const props = suggestion.properties;

    switch (type) {
      case 'country':
        return props.country || props.name || '';
      case 'city':
        return (
          props.city || props.name || props.locality || props.municipality || ''
        );
      case 'district':
        return (
          props.county || props.district || props.suburb || props.name || ''
        );
      case 'poi':
        return props.name || props.formatted || '';
      default:
        return props.name || props.formatted || '';
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    const props = suggestion.properties;
    const displayText = getDisplayText(suggestion);

    setInputValue(displayText);
    setShowSuggestions(false);

    switch (type) {
      case 'country':
        onSelect(props.country_code?.toUpperCase() || '', props.country);
        break;
      case 'city':
        onSelect(displayText);
        break;
      case 'district':
        onSelect(displayText);
        break;
      case 'poi':
        onSelect(displayText, {
          lat: suggestion.geometry?.coordinates[1],
          lon: suggestion.geometry?.coordinates[0],
          address: props.formatted,
          categories: props.categories
        });
        break;
      default:
        onSelect(displayText);
    }
  };

  const getPlaceholder = (): string => {
    switch (type) {
      case 'country':
        return 'Search country...';
      case 'city':
        return 'Search city...';
      case 'district':
        return 'Search district...';
      case 'poi':
        return 'Search places...';
      default:
        return `Search ${type}...`;
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        style={{
          width: '100%',
          padding: '16px',
          minHeight: '44px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          fontSize: '16px',
          color: 'white',
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
          transition: 'all 0.3s ease',
          outline: 'none',
          boxSizing: 'border-box',
          WebkitAppearance: 'none',
          WebkitTapHighlightColor: 'transparent'
        }}
        type="text"
        placeholder={getPlaceholder()}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
      />

      {showSuggestions && suggestions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'rgba(26, 26, 46, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            marginTop: '4px',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 10
          }}
        >
          {suggestions.map((sugg, index) => (
            <div
              key={index}
              style={{
                padding: '12px 16px',
                color: '#e2e8f0',
                cursor: 'pointer',
                borderBottom:
                  index < suggestions.length - 1
                    ? '1px solid rgba(255, 255, 255, 0.05)'
                    : 'none',
                transition: 'all 0.2s ease'
              }}
              onClick={() => handleSuggestionClick(sugg)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 245, 255, 0.1)';
                e.currentTarget.style.color = '#00f5ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#e2e8f0';
              }}
            >
              {getDisplayText(sugg)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GeoapifyAutocomplete;
