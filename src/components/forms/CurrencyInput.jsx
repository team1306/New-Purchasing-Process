import { Input } from '../ui';

export default function CurrencyInput({
                                          value,
                                          onChange,
                                          label,
                                          error,
                                          helper,
                                          required,
                                          disabled,
                                          className = '',
                                          ...props
                                      }) {
    return (
        <div>
            {label && (
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-base">
          $
        </span>
                <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={value}
                    onChange={onChange}
                    error={error}
                    disabled={disabled}
                    className={`pl-8 ${className}`}
                    {...props}
                />
            </div>
            {helper && !error && (
                <p className="text-xs text-gray-500 mt-1">{helper}</p>
            )}
            {error && (
                <p className="text-xs text-red-600 mt-1">{error}</p>
            )}
        </div>
    );
}