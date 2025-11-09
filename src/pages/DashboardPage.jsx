import { LogOut, User, Mail } from 'lucide-react';

export default function Dashboard({ user, onSignOut }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="max-w-4xl mx-auto pt-8">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
                        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                        <p className="text-blue-100">Welcome to your profile</p>
                    </div>

                    <div className="p-8">
                        <div className="flex flex-col items-center mb-8">
                            <img
                                src={user.picture}
                                alt="Profile"
                                className="w-32 h-32 rounded-full border-4 border-blue-600 shadow-lg mb-4"
                            />
                            <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                                <User className="w-6 h-6 text-blue-600 mr-4" />
                                <div>
                                    <p className="text-sm text-gray-500">Full Name</p>
                                    <p className="text-lg font-semibold text-gray-800">{user.name}</p>
                                </div>
                            </div>

                            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                                <Mail className="w-6 h-6 text-blue-600 mr-4" />
                                <div>
                                    <p className="text-sm text-gray-500">Email Address</p>
                                    <p className="text-lg font-semibold text-gray-800">{user.email}</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onSignOut}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
                        >
                            <LogOut className="w-5 h-5 mr-2" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}