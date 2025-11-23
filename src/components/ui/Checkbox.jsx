import { Check } from 'lucide-react';

export default function Checkbox({
                                     checked = false,
                                     indeterminate = false,
                                     disabled = false,
                                     onChange,
                                     className = '',
                                 }) {
    return (
        <div
            onClick={!disabled ? onChange : undefined}
            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition cursor-pointer ${
                checked
                    ? 'bg-blue-600 border-blue-600'
                    : indeterminate
                        ? 'bg-blue-300 border-blue-600'
                        : disabled
                            ? 'bg-gray-200 border-gray-300 cursor-not-allowed'
                            : 'bg-white border-gray-300 hover:border-blue-400'
            } ${className}`}
        >
            {(checked || indeterminate) && (
                <Check className="w-4 h-4 text-white" />
            )}
        </div>
    );
}