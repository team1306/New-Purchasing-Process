import { LogOut, RefreshCw, Plus, Menu as MenuIcon, X, CheckSquare, Square, List, LayoutGrid } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button, IconButton, Divider } from '../ui';
import { PageHeader } from '../layout';
import UserProfile from '../common/UserProfile';

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

    const handleMenuAction = (action) => {
        action();
        handleCloseMenu();
    };

    return (
        <PageHeader>
            {/* Mobile Header */}
            <div className="md:hidden">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <UserProfile user={user} size="md" showInfo={false} />
                        <div>
                            <h1 className="text-lg font-bold">Dashboard</h1>
                            {selectionMode ? (
                                <p className="text-xs text-blue-100">{selectedCount} selected</p>
                            ) : (
                                <p className="text-xs text-blue-100">Purchase Requests</p>
                            )}
                        </div>
                    </div>

                    <IconButton
                        icon={showMenu ? X : MenuIcon}
                        variant="ghost"
                        onClick={() => setShowMenu(!showMenu)}
                        title="Toggle menu"
                    />
                </div>

                {/* Mobile Menu Dropdown */}
                {showMenu && (
                    <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            isAnimating ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                    >
                        <div className="px-4 pb-4 space-y-2 border-t border-white/20 pt-4">
                            <Button
                                variant="ghost"
                                onClick={() => handleMenuAction(onToggleViewMode)}
                                icon={viewMode === 'list' ? LayoutGrid : List}
                                fullWidth
                                className="justify-center bg-indigo-500 hover:bg-indigo-600"
                            >
                                {viewMode === 'list' ? 'Group View' : 'List View'}
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={() => handleMenuAction(onToggleSelectionMode)}
                                icon={selectionMode ? Square : CheckSquare}
                                fullWidth
                                className="justify-center bg-purple-500 hover:bg-purple-600"
                            >
                                {selectionMode ? 'Cancel Selection' : 'Multi-Select'}
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={() => handleMenuAction(onCreateRequest)}
                                icon={Plus}
                                fullWidth
                                className="justify-center bg-green-500 hover:bg-green-600"
                            >
                                Create Request
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={() => handleMenuAction(onRefresh)}
                                loading={refreshing}
                                disabled={refreshing}
                                icon={RefreshCw}
                                fullWidth
                                className="justify-center"
                            >
                                {refreshing ? 'Refreshing...' : 'Refresh'}
                            </Button>

                            <Divider className="my-2" />

                            <div className="bg-white/10 rounded-lg p-3">
                                <p className="font-semibold text-sm">{user.name}</p>
                                <p className="text-xs text-blue-100">{user.email}</p>
                            </div>

                            <Button
                                variant="ghost"
                                onClick={() => handleMenuAction(onSignOut)}
                                icon={LogOut}
                                fullWidth
                                className="justify-center"
                            >
                                Sign Out
                            </Button>
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
                                <p className="text-blue-100">
                                    {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
                                </p>
                            ) : (
                                <p className="text-blue-100">
                                    {viewMode === 'list' ? 'List View' : 'Group View'}
                                </p>
                            )}
                        </div>

                        <Button
                            variant="ghost"
                            onClick={onToggleViewMode}
                            icon={viewMode === 'list' ? LayoutGrid : List}
                            className="bg-indigo-500 hover:bg-indigo-600"
                            title={viewMode === 'list' ? "Switch to Group View" : "Switch to List View"}
                        >
                            {viewMode === 'list' ? 'Group View' : 'List View'}
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={onToggleSelectionMode}
                            icon={selectionMode ? Square : CheckSquare}
                            className="bg-purple-500 hover:bg-purple-600"
                            title={selectionMode ? "Cancel selection" : "Multi-select mode"}
                        >
                            {selectionMode ? 'Cancel Selection' : 'Multi-Select'}
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={onRefresh}
                            loading={refreshing}
                            disabled={refreshing}
                            icon={RefreshCw}
                            title="Refresh data"
                        >
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={onCreateRequest}
                            icon={Plus}
                            className="bg-green-500 hover:bg-green-600"
                        >
                            Create Request
                        </Button>
                    </div>

                    <div className="flex items-center gap-4">
                        <UserProfile user={user} size="lg" />

                        <Button
                            variant="ghost"
                            onClick={onSignOut}
                            icon={LogOut}
                            title="Sign Out"
                        >
                            Sign Out
                        </Button>
                    </div>
                </div>
            </div>
        </PageHeader>
    );
}