import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

export default function GroupNameAutocomplete({ value, onChange, existingGroups, placeholder = "e.g., Robot Build 2025" }) {
    const [isOpen, setIsOpen] = useState(false);
    const [filteredGroups, setFilteredGroups] = useState([]);
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

    // Filter groups based on input
    useEffect(() => {
        if (!value || value.trim() === '') {
            setFilteredGroups(existingGroups);
        } else {
            const filtered = existingGroups.filter(group =>
                group.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredGroups(filtered);
        }
    }, [value, existingGroups]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (group) => {
        onChange(group);
        setIsOpen(false);
        inputRef.current?.blur();
    };

    const handleInputChange = (e) => {
        onChange(e.target.value);
        if (!isOpen) setIsOpen(true);
    };

    const handleInputFocus = () => {
        setIsOpen(true);
    };

    return (
        <div ref={wrapperRef} className="relative">
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={value || ''}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    placeholder={placeholder}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-10 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700 transition text-base"
                    autoComplete="off"
                />
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                    <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Dropdown */}
            {isOpen && filteredGroups.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredGroups.map((group, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => handleSelect(group)}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 transition text-gray-700 border-b last:border-b-0 focus:bg-blue-50 focus:outline-none"
                        >
                            {group}
                        </button>
                    ))}
                </div>
            )}

            {/* No results message */}
            {isOpen && value && filteredGroups.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500 text-sm">
                    No existing groups match. Press Enter to create "{value}"
                </div>
            )}
        </div>
    );
}