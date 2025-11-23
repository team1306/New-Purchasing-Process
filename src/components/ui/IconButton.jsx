import { buttonClasses } from '../../styles/common-classes';
import { Loader } from 'lucide-react';

export default function IconButton({
                                       icon: Icon,
                                       variant = 'primary',
                                       size = 'md',
                                       loading = false,
                                       disabled = false,
                                       className = '',
                                       title,
                                       ...props
                                   }) {
    const isDisabled = disabled || loading;

    const sizeClasses = {
        sm: 'p-1.5',
        md: 'p-2',
        lg: 'p-3',
    };

    const iconSizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    const variantClass = buttonClasses.variants[variant] || buttonClasses.variants.primary;
    const sizeClass = sizeClasses[size];
    const iconSize = iconSizeClasses[size];
    const disabledClass = isDisabled ? buttonClasses.disabled : '';

    const classes = `
    ${buttonClasses.base}
    ${variantClass}
    ${sizeClass}
    ${disabledClass}
    rounded-full
    ${className}
  `.trim().replace(/\s+/g, ' ');

    return (
        <button
            disabled={isDisabled}
            className={classes}
            title={title}
            {...props}
        >
            {loading ? (
                <Loader className={`${iconSize} animate-spin`} />
            ) : (
                Icon && <Icon className={iconSize} />
            )}
        </button>
    );
}