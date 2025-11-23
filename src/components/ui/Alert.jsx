import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

export default function Alert({
                                  type = 'info',
                                  title,
                                  children,
                                  className = ''
                              }) {
    const styles = {
        info: {
            container: 'bg-blue-50 border-blue-200',
            icon: 'text-blue-600',
            title: 'text-blue-800',
            text: 'text-blue-700',
            Icon: Info,
        },
        success: {
            container: 'bg-green-50 border-green-200',
            icon: 'text-green-600',
            title: 'text-green-800',
            text: 'text-green-700',
            Icon: CheckCircle,
        },
        warning: {
            container: 'bg-yellow-50 border-yellow-200',
            icon: 'text-yellow-600',
            title: 'text-yellow-800',
            text: 'text-yellow-700',
            Icon: AlertCircle,
        },
        error: {
            container: 'bg-red-50 border-red-200',
            icon: 'text-red-600',
            title: 'text-red-800',
            text: 'text-red-700',
            Icon: XCircle,
        },
    };

    const style = styles[type] || styles.info;
    const Icon = style.Icon;

    return (
        <div className={`border rounded-lg p-3 md:p-4 flex items-start ${style.container} ${className}`}>
            <Icon className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${style.icon}`} />
            <div className="flex-1 min-w-0">
                {title && (
                    <p className={`font-semibold text-sm md:text-base ${style.title}`}>
                        {title}
                    </p>
                )}
                <div className={`text-xs md:text-sm ${style.text} ${title ? 'mt-1' : ''}`}>
                    {children}
                </div>
            </div>
        </div>
    );
}