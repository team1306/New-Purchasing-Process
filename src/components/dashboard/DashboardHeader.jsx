import { LogOut, RefreshCw, Plus, CheckSquare, Square, List, LayoutGrid } from 'lucide-react';
import { Button, IconButton, Divider, MobileMenu } from '../ui';
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
    return (
        <PageHeader>
            {/* Mobile Header */}
            <div className="md:hidden">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <UserProfile user={user} size="md" showInfo={false} />
                        <div className="min-w-0">
                            <h1 className="text-lg font-bold truncate">Dashboard</h1>
                            {selectionMode ? (
                                <p className="text-xs text-blue-100">{selectedCount} selected</p>
                            ) : (
                                <p className="text-xs text-blue-100">
                                    {viewMode === 'list' ? 'List View' : 'Group View'}
                                </p>
                            )}
                        </div>
                    </div>

                    <MobileMenu>
                        {({ handleMenuAction }) => (
                            <>
                                <Button
                                    variant="indigo"
                                    onClick={() => handleMenuAction(onToggleViewMode)}
                                    icon={viewMode === 'list' ? LayoutGrid : List}
                                    fullWidth
                                    className="justify-center"
                                >
                                    {viewMode === 'list' ? 'Group View' : 'List View'}
                                </Button>

                                <Button
                                    variant="purple"
                                    onClick={() => handleMenuAction(onToggleSelectionMode)}
                                    icon={selectionMode ? Square : CheckSquare}
                                    fullWidth
                                    className="justify-center"
                                >
                                    {selectionMode ? 'Cancel Selection' : 'Multi-Select'}
                                </Button>

                                <Button
                                    variant="success"
                                    onClick={() => handleMenuAction(onCreateRequest)}
                                    icon={Plus}
                                    fullWidth
                                    className="justify-center"
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
                                    <p className="font-semibold text-sm truncate">{user.name}</p>
                                    <p className="text-xs text-blue-100 truncate">{user.email}</p>
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
                            </>
                        )}
                    </MobileMenu>
                </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden md:block p-6">
                <div className="flex items-center justify-between gap-4 min-w-0">
                    <div className="flex items-center gap-2 lg:gap-4 flex-shrink min-w-0">
                        <div className="flex-shrink-0">
                            <h1 className="text-2xl lg:text-3xl font-bold mb-1 whitespace-nowrap">Dashboard</h1>
                            {selectionMode ? (
                                <p className="text-blue-100 text-sm whitespace-nowrap">
                                    {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
                                </p>
                            ) : (
                                <p className="text-blue-100 text-sm whitespace-nowrap">
                                    {viewMode === 'list' ? 'List View' : 'Group View'}
                                </p>
                            )}
                        </div>

                        <Button
                            variant="indigo"
                            onClick={onToggleViewMode}
                            icon={viewMode === 'list' ? LayoutGrid : List}
                            title={viewMode === 'list' ? "Switch to Group View" : "Switch to List View"}
                            className="hidden lg:flex"
                        >
                            {viewMode === 'list' ? 'Group View' : 'List View'}
                        </Button>

                        <IconButton
                            variant="indigo"
                            icon={viewMode === 'list' ? LayoutGrid : List}
                            onClick={onToggleViewMode}
                            title={viewMode === 'list' ? "Switch to Group View" : "Switch to List View"}
                            className="lg:hidden"
                        />

                        <Button
                            variant="purple"
                            onClick={onToggleSelectionMode}
                            icon={selectionMode ? Square : CheckSquare}
                            title={selectionMode ? "Cancel selection" : "Multi-select mode"}
                            className="hidden lg:flex"
                        >
                            {selectionMode ? 'Cancel' : 'Multi-Select'}
                        </Button>

                        <IconButton
                            variant="purple"
                            icon={selectionMode ? Square : CheckSquare}
                            onClick={onToggleSelectionMode}
                            title={selectionMode ? "Cancel selection" : "Multi-select mode"}
                            className="lg:hidden"
                        />

                        <IconButton
                            variant="ghost"
                            icon={RefreshCw}
                            onClick={onRefresh}
                            loading={refreshing}
                            disabled={refreshing}
                            title="Refresh data"
                            className={refreshing ? 'animate-spin' : ''}
                        />

                        <Button
                            variant="success"
                            onClick={onCreateRequest}
                            icon={Plus}
                            className="hidden xl:flex"
                        >
                            Create Request
                        </Button>

                        <IconButton
                            variant="success"
                            icon={Plus}
                            onClick={onCreateRequest}
                            title="Create Request"
                            className="xl:hidden"
                        />
                    </div>

                    <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
                        <UserProfile user={user} size="lg" className="hidden lg:flex" />

                        <IconButton
                            variant="ghost"
                            icon={LogOut}
                            onClick={onSignOut}
                            title="Sign Out"
                        />
                    </div>
                </div>
            </div>
        </PageHeader>
    );
}