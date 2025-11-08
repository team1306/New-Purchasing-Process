import { useAuth } from '../hooks/useAuth';

export default function DashboardPage({ user }) {
    const { handleLogout } = useAuth();

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

                <div className="space-y-6">
                    {user.picture && (
                        <div className="flex justify-center">
                            <img
                                src={user.picture}
                                alt={user.name}
                                className="w-16 h-16 rounded-full"
                            />
                        </div>
                    )}

                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Name</p>
                        <p className="text-lg text-gray-900">{user.name}</p>
                    </div>

                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Email</p>
                        <p className="text-lg text-gray-900">{user.email}</p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors mt-8"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}