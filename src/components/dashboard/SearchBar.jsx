
import { Search } from 'lucide-react';

export default function SearchBar({ value, onChange }) {
    return (
        <div className="p-6 border-b">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search by item description..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
            </div>
        </div>
    );
}