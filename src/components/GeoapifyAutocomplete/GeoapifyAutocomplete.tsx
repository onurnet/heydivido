import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

interface GeoapifyAutocompleteProps {
  type: 'country' | 'city' | 'district' | 'poi';
  countryCode?: string;
  cityName?: string;
  value: string;
  onSelect: (value: string, extraInfo?: any) => void;
  renderOption?: (suggestion: any) => React.ReactNode;
}

const GeoapifyAutocomplete: React.FC<GeoapifyAutocompleteProps> = ({
  type,
  countryCode,
  cityName,
  value,
  onSelect,
  renderOption
}) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasValidSelection, setHasValidSelection] = useState(!!value);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const timeoutRef = useRef<any>(null);

  const API_KEY = '66b81ba042ea433397c02596a78eea32';

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(value || '');
    setHasValidSelection(!!value);
  }, [value]);

  // Get user location once
  useEffect(() => {
    if (type === 'poi') {
      if (!navigator.geolocation) {
        console.warn('Geolocation is not supported by this browser.');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude
          });
          console.log(
            'User location:',
            pos.coords.latitude,
            pos.coords.longitude
          );
        },
        (err) => {
          console.error('Failed to get user location:', err);
          setUserLocation(null); // fallback
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
  }, [type]);

  const buildApiUrl = (text: string): string => {
    const baseUrl = 'https://api.geoapify.com';

    switch (type) {
      case 'country':
        return `${baseUrl}/v1/geocode/autocomplete?text=${encodeURIComponent(
          text
        )}&type=country&limit=5&apiKey=${API_KEY}`;

      case 'city':
        let cityUrl = `${baseUrl}/v1/geocode/autocomplete?text=${encodeURIComponent(
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
        // EKLE → konum varsa bias parametresi ekle
        if (userLocation) {
          poiUrl += `&bias=proximity:${userLocation.lon},${userLocation.lat}`;
        }
        return poiUrl;

      default:
        return '';
    }
  };

  const buildFallbackCityUrl = (text: string): string => {
    const baseUrl = 'https://api.geoapify.com';
    let cityUrl = `${baseUrl}/v1/geocode/search?text=${encodeURIComponent(
      text
    )}&type=locality&limit=5&apiKey=${API_KEY}`;
    if (countryCode) {
      cityUrl += `&filter=countrycode:${countryCode.toLowerCase()}`;
    }
    return cityUrl;
  };

  const handleFetchSuggestions = async (text: string) => {
    if (!text || text.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasValidSelection(false);

    try {
      const url = buildApiUrl(text);
      if (!url) {
        setIsLoading(false);
        return;
      }

      let response = await axios.get(url);
      let features = response.data.features || [];

      if (type === 'city' && features.length === 0) {
        try {
          const fallbackUrl = buildFallbackCityUrl(text);
          const fallbackResponse = await axios.get(fallbackUrl);
          features = fallbackResponse.data.features || [];
        } catch (fallbackErr) {
          console.error('Fallback city search failed:', fallbackErr);
        }
      }

      setSuggestions(features);
      setShowSuggestions(features.length > 0);
    } catch (err) {
      console.error('Error fetching suggestions:', err);

      if (type === 'city') {
        try {
          const fallbackUrl = buildFallbackCityUrl(text);
          const fallbackResponse = await axios.get(fallbackUrl);
          const features = fallbackResponse.data.features || [];
          setSuggestions(features);
          setShowSuggestions(features.length > 0);
        } catch (fallbackErr) {
          console.error('Fallback failed:', fallbackErr);
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setHasValidSelection(false);

    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      handleFetchSuggestions(newValue);
    }, 500);
  };

  const getDisplayText = (suggestion: any): string => {
    const props = suggestion.properties;

    switch (type) {
      case 'country':
        return props.country || props.name || '';
      case 'city':
        return (
          props.city ||
          props.name ||
          props.locality ||
          props.municipality ||
          props.town ||
          ''
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
    setHasValidSelection(true);

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
          categories: props.categories,
          country: props.country || '',
          city: props.city || '',
          district: props.district || '',
          street: props.street || ''
        });
        break;
      default:
        onSelect(displayText);
    }
  };

  const getPlaceholder = (): string => {
    switch (type) {
      case 'country':
        return t('min_3_char');
      case 'city':
        return t('min_3_char');
      case 'district':
        return t('min_3_char');
      case 'poi':
        return t('min_3_char');
      default:
        return `Search ${type}...`;
    }
  };

  const getInputStyle = () => {
    const baseStyle = {
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
      boxSizing: 'border-box' as const
    };

    if (isLoading) {
      return {
        ...baseStyle,
        borderColor: '#ffa500',
        boxShadow: '0 0 10px rgba(255, 165, 0, 0.3)'
      };
    }

    if (hasValidSelection && inputValue.length > 0) {
      return {
        ...baseStyle,
        borderColor: '#4CAF50',
        boxShadow: '0 0 10px rgba(76, 175, 80, 0.3)'
      };
    }

    if (!hasValidSelection && inputValue.length >= 3) {
      return {
        ...baseStyle,
        borderColor: '#ff6b6b',
        boxShadow: '0 0 10px rgba(255, 107, 107, 0.2)'
      };
    }

    return baseStyle;
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          style={getInputStyle()}
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

        {isLoading && (
          <div
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#ffa500',
              fontSize: '14px'
            }}
          >
            🔍
          </div>
        )}

        {hasValidSelection && !isLoading && (
          <div
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#4CAF50',
              fontSize: '14px'
            }}
          >
            ✓
          </div>
        )}
      </div>

      {inputValue.length > 0 && inputValue.length < 3 && (
        <div
          style={{
            fontSize: '12px',
            color: '#ffa500',
            marginTop: '4px',
            paddingLeft: '4px'
          }}
        >
          {3 - inputValue.length} karakter daha yazın...
        </div>
      )}

      {isLoading && (
        <div
          style={{
            fontSize: '12px',
            color: '#ffa500',
            marginTop: '4px',
            paddingLeft: '4px'
          }}
        >
          Aranıyor...
        </div>
      )}

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
              {renderOption ? renderOption(sugg) : getDisplayText(sugg)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GeoapifyAutocomplete;
