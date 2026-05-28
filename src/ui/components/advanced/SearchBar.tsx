// src/ui/components/advanced/SearchBar.tsx
import React, { useState, useEffect } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { theme } from "../../../config/themes";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Buscar...",
  debounceMs = 300,
  className = "",
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChange, value]);

  const handleClear = () => {
    setLocalValue("");
    onChange("");
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FiSearch
          className="h-5 w-5"
          style={{ color: theme.colors.text.disabled }}
        />
      </div>
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="block w-full pl-10 pr-10 py-2 rounded-lg text-sm transition-all duration-200 focus:outline-none"
        style={{
          border: `1px solid ${theme.colors.border.DEFAULT}`,
          background: theme.colors.background.card,
          color: theme.colors.text.primary,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = theme.colors.primary.DEFAULT;
          e.currentTarget.style.boxShadow = theme.colors.feedback.primaryGlow;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = theme.colors.border.DEFAULT;
          e.currentTarget.style.boxShadow = "none";
        }}
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors"
          style={{ color: theme.colors.text.disabled }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = theme.colors.text.secondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = theme.colors.text.disabled;
          }}
        >
          <FiX className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
