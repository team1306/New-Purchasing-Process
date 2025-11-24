import { infoBoxClasses } from '../../styles/common-classes';

export default function InfoBox({
                                    label,
                                    value,
                                    variant = 'default',
                                    icon: Icon,
                                    className = ''
                                }) {
    const variantClass = infoBoxClasses.variants[variant] || infoBoxClasses.variants.default;

    return (
        <div className={`${variantClass} p-3 md:p-4 rounded-lg ${className}`}>
            <div className="flex items-center gap-2 mb-1">
                {Icon && <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />}
                <p className="text-xs md:text-sm text-gray-500">{label}</p>
            </div>
            <p className="font-semibold text-sm md:text-base text-gray-800 break-words">
                {value || 'N/A'}
            </p>
        </div>
    );
}