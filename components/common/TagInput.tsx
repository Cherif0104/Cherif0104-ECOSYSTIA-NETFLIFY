/**
 * 🏷️ TAG INPUT
 * Composant pour gérer les tags/catégories
 */

import React, { useState, KeyboardEvent } from 'react';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  label?: string;
  suggestions?: string[];
  maxTags?: number;
}

const TagInput: React.FC<TagInputProps> = ({
  tags,
  onTagsChange,
  placeholder = "Ajouter des tags (appuyez sur Entrée)...",
  label = "Tags / Catégories",
  suggestions = ['web', 'mobile', 'urgent', 'design', 'développement', 'marketing', 'ecommerce'],
  maxTags = 10
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = suggestions.filter(
    s => s.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(s)
  );

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      onTagsChange([...tags, trimmedTag]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const tagColors = [
    'bg-blue-100 text-blue-800',
    'bg-emerald-100 text-emerald-800',
    'bg-purple-100 text-purple-800',
    'bg-pink-100 text-pink-800',
    'bg-yellow-100 text-yellow-800',
    'bg-indigo-100 text-indigo-800',
  ];

  const getTagColor = (index: number) => {
    return tagColors[index % tagColors.length];
  };

  return (
    <div>
      {/* Label */}
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <i className="fas fa-tags mr-2 text-blue-600"></i>
          {label}
        </label>
      )}

      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(e.target.value.length > 0);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(inputValue.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          className="w-full px-4 py-3 pl-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors"
          disabled={tags.length >= maxTags}
        />
        <i className="fas fa-tag absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>

        {/* Suggestions */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => addTag(suggestion)}
                className="px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors flex items-center"
              >
                <i className="fas fa-tag text-gray-400 mr-2"></i>
                <span className="text-sm text-gray-700">{suggestion}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tags affichés */}
      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <div
              key={tag}
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getTagColor(index)} shadow-sm`}
            >
              <i className="fas fa-tag text-xs mr-1.5"></i>
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-2 hover:opacity-70 transition-opacity"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <p className="mt-2 text-xs text-gray-500">
        {tags.length > 0 
          ? `${tags.length}/${maxTags} tags • Appuyez sur Entrée pour ajouter`
          : 'Tapez et appuyez sur Entrée pour ajouter des tags'
        }
      </p>
    </div>
  );
};

export default TagInput;

