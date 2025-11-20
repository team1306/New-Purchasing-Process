import { LogOut, RefreshCw, Plus } from 'lucide-react';

export default function DashboardHeader({
                                            user,
                                            onSignOut,
                                            onRefresh,
                                            onCreateRequest,
                                            refreshing
                                        }) {
    return (
        <div className="bg-gradient-to-r from-red-700 to-orange-800 p-4 md:p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                {/* Left Section */}
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="text-center md:text-left">
                        <h1 className="text-2xl md:text-3xl font-bold mb-1">Dashboard</h1>
                        <p className="text-blue-100 text-sm md:text-base">Purchase Requests</p>
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={onRefresh}
                        disabled={refreshing}
                        className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white font-semibold py-2 px-3 md:px-4 rounded-lg transition duration-200 flex items-center justify-center"
                        title="Refresh data"
                    >
                        <RefreshCw className={`w-5 h-5 md:mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        <span className="hidden md:inline">
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </span>
                    </button>

                    {/* Create Request */}
                    <button
                        className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 px-3 md:px-4 rounded-lg font-semibold"
                        onClick={onCreateRequest}
                    >
                        <Plus size={18} />
                        <span className="hidden md:inline">Create Request</span>
                    </button>
                </div>

                {/* Right Section */}
                <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">

                    {/* Profile Pic */}
                    <img
                        src={user.picture}
                        alt="Profile"
                        className="w-8 h-8 md:w-12 md:h-12 rounded-full border-2 border-white shadow-lg"
                        referrerPolicy="no-referrer"
                    />

                    {/* User Info (hidden on small screens) */}
                    <div className="hidden md:block text-right">
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-blue-100">{user.email}</p>
                    </div>

                    {/* Sign Out */}
                    <button
                        onClick={onSignOut}
                        className="bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-3 md:px-4 rounded-lg transition duration-200 flex items-center justify-center"
                        title="Sign Out"
                    >
                        <LogOut className="w-5 h-5 md:mr-2" />
                        <span className="hidden md:inline">Sign Out</span>
                    </button>
                </div>

            </div>
        </div>
    );
}
