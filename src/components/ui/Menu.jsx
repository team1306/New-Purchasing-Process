import { useState, useEffect, useRef } from 'react';

export default function Menu({
                                 trigger,
                                 children,
                                 align = 'right',
                                 className = '',
                             }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const alignmentClass = align === 'left' ? 'left-0' : 'right-0';

    return (
        <div className="relative" ref={menuRef}>
            <div onClick={() => setIsOpen(!isOpen)}>
                {trigger}
            </div>

            {isOpen && (
                <div className={`absolute ${alignmentClass} mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-fadeIn ${className}`}>
                    {children}
                </div>
            )}
        </div>
    );
}

export function MenuItem({ icon: Icon, children, onClick, variant = 'default', className = '' }) {
    const variantClasses = {
        default: 'hover:bg-gray-50 text-gray-700',
        danger: 'hover:bg-red-50 text-red-600',
    };

    return (
        <button
            onClick={onClick}
            className={`w-full text-left px-4 py-2 flex items-center gap-3 transition ${variantClasses[variant]} ${className}`}
        >
            {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
            <span className="flex-1">{children}</span>
        </button>
    );
}