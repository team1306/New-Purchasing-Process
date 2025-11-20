
import { LogOut, RefreshCw, Plus } from 'lucide-react';

export default function DashboardHeader({
                                            user,
                                            onSignOut,
                                            onRefresh,
                                            onCreateRequest,
                                            refreshing
                                        }) {
    return (
        <div className="bg-gradient-to-r from-red-700 to-orange-800 p-6 text-white">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
                        <p className="text-blue-100">Purchase Requests</p>
                    </div>
                    <button
                        onClick={onRefresh}
                        disabled={refreshing}
                        className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center"
                        title="Refresh data"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <button
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-semibold"
                        onClick={onCreateRequest}
                    >
                        <Plus size={16} /> Create Request
                    </button>
                </div>
                <div className="flex items-center gap-4">
                    <img
                        src={user.picture}
                        alt="Profile"
                        className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
                        referrerPolicy="no-referrer"
                    />
                    <div className="text-right">
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-blue-100">{user.email}</p>
                    </div>
                    <button
                        onClick={onSignOut}
                        className="ml-4 bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}