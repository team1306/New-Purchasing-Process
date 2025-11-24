import { useState, useEffect } from 'react';
import { Menu as MenuIcon, X } from 'lucide-react';
import { IconButton } from '../ui';
import { mobileMenuClasses } from '../../styles/common-classes';

export default function MobileMenu({
                                       trigger,
                                       children,
                                       className = ''
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
        if (typeof action === 'function') {
            action();
        }
        handleCloseMenu();
    };

    return (
        <>
            {/* Trigger or Default Button */}
            {trigger ? (
                <div onClick={() => setShowMenu(!showMenu)}>
                    {trigger}
                </div>
            ) : (
                <IconButton
                    icon={showMenu ? X : MenuIcon}
                    variant="ghost"
                    onClick={() => setShowMenu(!showMenu)}
                    title="Toggle menu"
                />
            )}

            {/* Menu Dropdown */}
            {showMenu && (
                <div
                    className={`${mobileMenuClasses.container} ${
                        isAnimating ? mobileMenuClasses.expanded : mobileMenuClasses.collapsed
                    } ${className}`}
                >
                    <div className={mobileMenuClasses.content}>
                        {typeof children === 'function'
                            ? children({ handleMenuAction, handleCloseMenu })
                            : children
                        }
                    </div>
                </div>
            )}
        </>
    );
}