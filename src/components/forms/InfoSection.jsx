export default function InfoSection({ title, children, className = '' }) {
    return (
        <div className={className}>
            {title && (
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">
                    {title}
                </h3>
            )}
            {children}
        </div>
    );
}