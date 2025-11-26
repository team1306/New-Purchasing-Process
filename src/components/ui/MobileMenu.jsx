import { useState, useEffect, useRef } from 'react';
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
    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        if (showMenu) {
            setIsAnimating(true);
            // Prevent body scroll when menu is open
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [showMenu]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target) &&
                buttonRef.current && !buttonRef.current.contains(event.target)) {
                handleCloseMenu();
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
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
            <div ref={buttonRef}>
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
                        className="hover:bg-white/20"
                    />
                )}
            </div>

            {/* Backdrop */}
            {showMenu && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-[59] transition-opacity duration-300"
                    style={{ opacity: isAnimating ? 1 : 0 }}
                    onClick={handleCloseMenu}
                />
            )}

            {/* Menu Dropdown */}
            {showMenu && (
                <div
                    ref={menuRef}
                    className={`${mobileMenuClasses.container} ${
                        isAnimating ? mobileMenuClasses.expanded : mobileMenuClasses.collapsed
                    } ${className}`}
                    onClick={(e) => e.stopPropagation()}
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