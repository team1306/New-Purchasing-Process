import { Search, X } from 'lucide-react';
import { IconButton } from '../ui';

export default function SearchBar({ value, onChange }) {
    return (
        <div className="p-4 md:p-6 border-b bg-white">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Search by item description..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
                {value && (
                    <IconButton
                        icon={X}
                        variant="ghost"
                        size="sm"
                        onClick={() => onChange('')}
                        title="Clear search"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    />
                )}
            </div>
        </div>
    );
}