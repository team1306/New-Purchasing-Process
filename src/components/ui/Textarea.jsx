import { inputClasses, textClasses } from '../../styles/common-classes';

export default function Textarea({
                                     label,
                                     error,
                                     helper,
                                     required = false,
                                     disabled = false,
                                     rows = 4,
                                     className = '',
                                     containerClassName = '',
                                     ...props
                                 }) {
    const textareaClass = `
    ${inputClasses.base}
    ${error ? inputClasses.error : ''}
    ${disabled ? inputClasses.disabled : ''}
    resize-none
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
            <textarea
                className={textareaClass}
                disabled={disabled}
                rows={rows}
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