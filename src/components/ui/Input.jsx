import { inputClasses, textClasses } from '../../styles/common-classes';

export default function Input({
                                  label,
                                  error,
                                  helper,
                                  required = false,
                                  disabled = false,
                                  className = '',
                                  containerClassName = '',
                                  ...props
                              }) {
    const inputClass = `
    ${inputClasses.base}
    ${error ? inputClasses.error : ''}
    ${disabled ? inputClasses.disabled : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

    return (
        <div className={containerClassName}>
            {label && (
                <label className={textClasses.label}>
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <input
                className={inputClass}
                disabled={disabled}
                {...props}
            />
            {helper && !error && (
                <p className={textClasses.helper}>{helper}</p>
            )}
            {error && (
                <p className={textClasses.error}>{error}</p>
            )}
        </div>
    );
}