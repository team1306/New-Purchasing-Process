import { useEffect } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './index';

export default function Modal({
                                  isOpen,
                                  onClose,
                                  title,
                                  children,
                                  size = 'md',
                                  showCloseButton = true,
                                  closeOnOverlayClick = true,
                                  closeOnEscape = true,
                                  className = '',
                              }) {
    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
        full: 'max-w-full',
    };

    useEffect(() => {
        if (!isOpen) return;

        // Prevent background scroll
        document.body.style.overflow = 'hidden';

        // Handle escape key
        const handleEscape = (e) => {
            if (closeOnEscape && e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, closeOnEscape, onClose]);

    if (!isOpen) return null;

    const handleOverlayClick = () => {
        if (closeOnOverlayClick) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn"
            onClick={handleOverlayClick}
        >
            <div
                className={`bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} animate-scaleIn ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between p-6 border-b">
                        {title && (
                            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                        )}
                        {showCloseButton && (
                            <IconButton
                                icon={X}
                                variant="ghost"
                                onClick={onClose}
                                title="Close"
                                className="text-gray-600 hover:text-gray-800"
                            />
                        )}
                    </div>
                )}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}