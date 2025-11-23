export default function InfoBox({
                                    label,
                                    value,
                                    variant = 'default',
                                    icon: Icon,
                                    className = ''
                                }) {
    const variants = {
        default: 'bg-gray-50',
        primary: 'bg-blue-50 border border-blue-200',
        success: 'bg-green-50 border border-green-200',
        warning: 'bg-orange-50 border border-orange-200',
        info: 'bg-indigo-50 border border-indigo-200',
    };

    return (
        <div className={`${variants[variant]} p-3 md:p-4 rounded-lg ${className}`}>
            <div className="flex items-center gap-2">
                {Icon && <Icon className="w-4 h-4 text-gray-500" />}
                <p className="text-xs md:text-sm text-gray-500 mb-1">{label}</p>
            </div>
            <p className="font-semibold text-sm md:text-base text-gray-800 break-words">
                {value || 'N/A'}
            </p>
        </div>
    );
}