export default function UserProfile({ user, size = 'md', showInfo = true }) {
    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
    };

    return (
        <div className="flex items-center gap-3">
            <img
                src={user.picture}
                alt="Profile"
                className={`${sizes[size]} rounded-full border-2 border-white shadow-lg flex-shrink-0`}
                referrerPolicy="no-referrer"
            />
            {showInfo && (
                <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white truncate">{user.name}</p>
                    <p className="text-sm text-blue-100 truncate">{user.email}</p>
                </div>
            )}
        </div>
    );
}