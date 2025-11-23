import { buttonClasses } from '../../styles/common-classes';
import { Loader } from 'lucide-react';

export default function Button({
                                   children,
                                   variant = 'primary',
                                   size = 'md',
                                   loading = false,
                                   disabled = false,
                                   icon: Icon,
                                   iconPosition = 'left',
                                   fullWidth = false,
                                   className = '',
                                   onClick,
                                   type = 'button',
                                   ...props
                               }) {
    const isDisabled = disabled || loading;

    const variantClass = buttonClasses.variants[variant] || buttonClasses.variants.primary;
    const sizeClass = buttonClasses.sizes[size];
    const disabledClass = isDisabled ? buttonClasses.disabled : '';
    const widthClass = fullWidth ? 'w-full' : '';

    const classes = `
    ${buttonClasses.base}
    ${variantClass}
    ${sizeClass}
    ${disabledClass}
    ${widthClass}
    ${className}
  `.trim().replace(/\s+/g, ' ');

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isDisabled}
            className={classes}
            {...props}
        >
            {loading && <Loader className="w-5 h-5 mr-2 animate-spin" />}
            {!loading && Icon && iconPosition === 'left' && <Icon className="w-5 h-5 mr-2" />}
            {children}
            {!loading && Icon && iconPosition === 'right' && <Icon className="w-5 h-5 ml-2" />}
        </button>
    );
}