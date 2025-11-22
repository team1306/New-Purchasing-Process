import { LogOut, RefreshCw, Plus, Menu, X, CheckSquare, Square, List, LayoutGrid } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DashboardHeader({
                                            user,
                                            onSignOut,
                                            onRefresh,
                                            onCreateRequest,
                                            refreshing,
                                            selectionMode,
                                            onToggleSelectionMode,
                                            selectedCount,
                                            viewMode,
                                            onToggleViewMode
                                        }) {
    const [showMenu, setShowMenu] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (showMenu) {
            setIsAnimating(true);
        }
    }, [showMenu]);

    const handleCloseMenu = () => {
        setIsAnimating(false);
        setTimeout(() => setShowMenu(false), 300);
    };

    return (
        <div className="bg-gradient-to-r from-red-700 to-orange-800 text-white">
            {/* Mobile Header */}
            <div className="md:hidden">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <img
                            src={user.picture}
                            alt="Profile"
                            className="w-10 h-10 rounded-full border-2 border-white shadow-lg"
                            referrerPolicy="no-referrer"
                        />
                        <div>
                            <h1 className="text-lg font-bold">Dashboard</h1>
                            {selectionMode ? (
                                <p className="text-xs text-blue-100">{selectedCount} selected</p>
                            ) : (
                                <p className="text-xs text-blue-100">Purchase Requests</p>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 hover:bg-white/20 rounded-lg transition"
                        aria-label="Toggle menu"
                    >
                        {showMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu Dropdown */}
                {showMenu && (
                    <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            isAnimating ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                    >
                        <div className="px-4 pb-4 space-y-2 border-t border-white/20 pt-4">
                            <button
                                onClick={() => {
                                    onToggleViewMode();
                                    handleCloseMenu();
                                }}
                                className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold transition shadow-lg"
                            >
                                {viewMode === 'list' ? <LayoutGrid size={20} /> : <List size={20} />}
                                <span>{viewMode === 'list' ? 'Group View' : 'List View'}</span>
                            </button>

                            <button
                                onClick={() => {
                                    onToggleSelectionMode();
                                    handleCloseMenu();
                                }}
                                className="w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold transition shadow-lg"
                            >
                                {selectionMode ? <Square size={20} /> : <CheckSquare size={20} />}
                                <span>{selectionMode ? 'Cancel Selection' : 'Multi-Select'}</span>
                            </button>

                            <button
                                onClick={() => {
                                    onCreateRequest();
                                    handleCloseMenu();
                                }}
                                className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-semibold transition shadow-lg"
                            >
                                <Plus size={20} />
                                <span>Create Request</span>
                            </button>

                            <button
                                onClick={() => {
                                    onRefresh();
                                    handleCloseMenu();
                                }}
                                disabled={refreshing}
                                className="w-full bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
                            >
                                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                            </button>

                            <div className="bg-white/10 rounded-lg p-3">
                                <p className="font-semibold text-sm">{user.name}</p>
                                <p className="text-xs text-blue-100">{user.email}</p>
                            </div>

                            <button
                                onClick={() => {
                                    onSignOut();
                                    handleCloseMenu();
                                }}
                                className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Desktop Header */}
            <div className="hidden md:block p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
                            {selectionMode ? (
                                <p className="text-blue-100">{selectedCount} item{selectedCount !== 1 ? 's' : ''} selected</p>
                            ) : (
                                <p className="text-blue-100">{viewMode === 'list' ? 'List View' : 'Group View'}</p>
                            )}
                        </div>

                        <button
                            onClick={onToggleViewMode}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
                            title={viewMode === 'list' ? "Switch to Group View" : "Switch to List View"}
                        >
                            {viewMode === 'list' ? <LayoutGrid className="w-5 h-5" /> : <List className="w-5 h-5" />}
                            {viewMode === 'list' ? 'Group View' : 'List View'}
                        </button>

                        <button
                            onClick={onToggleSelectionMode}
                            className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
                            title={selectionMode ? "Cancel selection" : "Multi-select mode"}
                        >
                            {selectionMode ? <Square className="w-5 h-5" /> : <CheckSquare className="w-5 h-5" />}
                            {selectionMode ? 'Cancel Selection' : 'Multi-Select'}
                        </button>

                        <button
                            onClick={onRefresh}
                            disabled={refreshing}
                            className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center"
                            title="Refresh data"
                        >
                            <RefreshCw className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </button>

                        <button
                            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-semibold shadow-lg transition"
                            onClick={onCreateRequest}
                        >
                            <Plus size={20} />
                            Create Request
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
                            className="bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center"
                            title="Sign Out"
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