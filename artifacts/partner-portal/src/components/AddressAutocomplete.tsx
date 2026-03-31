import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, Loader2 } from "lucide-react";

interface AddressResult {
  address: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
}

interface GooglePlacesResult {
  predictions: Array<{
    place_id: string;
    description: string;
    main_text: string;
    secondary_text: string;
  }>;
  status: string;
}

interface GooglePlaceDetails {
  result: {
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
    geometry: {
      location: { lat: number; lng: number };
    };
  };
  status: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect: (result: AddressResult) => void;
  placeholder?: string;
}

export function AddressAutocomplete({ value, onChange, onAddressSelect, placeholder = "Street address" }: Props) {
  const [suggestions, setSuggestions] = useState<GooglePlacesResult["predictions"]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

  const fetchSuggestions = useCallback(
    async (input: string) => {
      if (!input.trim() || !apiKey) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
            input
          )}&key=${apiKey}&components=country:us|country:ca&types=address`
        );
        const data: GooglePlacesResult = await response.json();
        setSuggestions(data.predictions || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Address autocomplete error:", err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    [apiKey]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (value.trim()) {
        fetchSuggestions(value);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value, fetchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        suggestionsRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        !suggestionsRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = async (placeId: string, description: string) => {
    onChange(description);
    setShowSuggestions(false);
    setSuggestions([]);

    if (!apiKey) return;

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}&fields=address_components,geometry`
      );
      const data: GooglePlaceDetails = await response.json();

      if (data.status === "OK") {
        const components = data.result.address_components;
        const streetNumber = components.find(c => c.types.includes("street_number"))?.long_name || "";
        const route = components.find(c => c.types.includes("route"))?.long_name || "";
        const city = components.find(c => c.types.includes("locality"))?.long_name || "";
        const state = components.find(c => c.types.includes("administrative_area_level_1"))?.short_name || "";
        const zip = components.find(c => c.types.includes("postal_code"))?.long_name || "";
        const country = components.find(c => c.types.includes("country"))?.short_name || "";

        const address = `${streetNumber} ${route}`.trim();
        const lat = data.result.geometry.location.lat;
        const lng = data.result.geometry.location.lng;

        onAddressSelect({
          address,
          city,
          state: country === "CA" ? state : state,
          zip,
          lat,
          lng,
        });
      }
    } catch (err) {
      console.error("Place details error:", err);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => value.trim() && setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full h-9 px-3 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-[#0176d3]/30 focus:border-[#0176d3] pr-9"
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-input rounded-md shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {suggestions.map(suggestion => (
            <button
              key={suggestion.place_id}
              onClick={() => handleSelectSuggestion(suggestion.place_id, suggestion.description)}
              className="w-full text-left px-3 py-2.5 hover:bg-accent/50 flex items-start gap-2 border-b border-border last:border-b-0 transition-colors"
            >
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{suggestion.main_text}</p>
                <p className="text-xs text-muted-foreground truncate">{suggestion.secondary_text}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
