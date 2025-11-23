import { inputClasses, textClasses } from '../../styles/common-classes';

export default function Select({
                                   label,
                                   error,
                                   helper,
                                   required = false,
                                   disabled = false,
                                   options = [],
                                   placeholder,
                                   className = '',
                                   containerClassName = '',
                                   ...props
                               }) {
    const selectClass = `
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
            <select
                className={selectClass}
                disabled={disabled}
                {...props}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((option) => (
                    <option
                        key={typeof option === 'string' ? option : option.value}
                        value={typeof option === 'string' ? option : option.value}
                    >
                        {typeof option === 'string' ? option : option.label}
                    </option>
                ))}
            </select>
            {helper && !error && (
                <p className={textClasses.helper}>{helper}</p>
            )}
            {error && (
                <p className={textClasses.error}>{error}</p>
            )}
        </div>
    );
}