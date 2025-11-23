export default function EmptyState({
                                       icon: Icon,
                                       title = 'No items found',
                                       description,
                                       action
                                   }) {
    return (
        <div className="p-8 md:p-12 text-center text-gray-500">
            {Icon && <Icon className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gray-300" />}
            <p className="text-base md:text-lg font-medium">{title}</p>
            {description && (
                <p className="text-sm text-gray-400 mt-2">{description}</p>
            )}
            {action && (
                <div className="mt-4">
                    {action}
                </div>
            )}
        </div>
    );
}