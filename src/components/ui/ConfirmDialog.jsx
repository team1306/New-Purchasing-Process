import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import { Button } from './index';

export default function ConfirmDialog({
                                          message,
                                          type = 'info',
                                          confirmText = 'OK',
                                          cancelText,
                                          onConfirm,
                                          onCancel,
                                      }) {
    const [isClosing, setIsClosing] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Prevent background scroll
        document.body.style.overflow = 'hidden';

        // Small delay for animation
        setTimeout(() => setIsVisible(true), 10);

        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                if (cancelText) {
                    handleCancel();
                } else {
                    handleConfirm();
                }
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [cancelText]);

    const handleConfirm = () => {
        setIsClosing(true);
        setTimeout(() => {
            onConfirm?.();
        }, 200);
    };

    const handleCancel = () => {
        setIsClosing(true);
        setTimeout(() => {
            onCancel?.();
        }, 200);
    };

    const getIcon = () => {
        switch (type) {
            case 'error':
                return <XCircle className="w-12 h-12 text-red-600" />;
            case 'warning':
                return <AlertCircle className="w-12 h-12 text-orange-600" />;
            case 'success':
                return <CheckCircle className="w-12 h-12 text-green-600" />;
            default:
                return <Info className="w-12 h-12 text-blue-600" />;
        }
    };

    const getColors = () => {
        switch (type) {
            case 'error':
                return {
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    button: 'danger',
                };
            case 'warning':
                return {
                    bg: 'bg-orange-50',
                    border: 'border-orange-200',
                    button: 'warning',
                };
            case 'success':
                return {
                    bg: 'bg-green-50',
                    border: 'border-green-200',
                    button: 'success',
                };
            default:
                return {
                    bg: 'bg-blue-50',
                    border: 'border-blue-200',
                    button: 'primary',
                };
        }
    };

    const colors = getColors();

    return (
        <div
            className={`fixed inset-0 bg-black z-[9999] flex items-center justify-center p-4 transition-opacity duration-200 ${
                isClosing ? 'bg-opacity-0' : isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
            }`}
            onClick={cancelText ? handleCancel : undefined}
        >
            <div
                className={`bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transition-all duration-200 ${
                    isClosing
                        ? 'opacity-0 scale-95'
                        : isVisible
                            ? 'opacity-100 scale-100'
                            : 'opacity-0 scale-95'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Icon */}
                <div className="flex justify-center mb-4">
                    {getIcon()}
                </div>

                {/* Message */}
                <div className={`${colors.bg} border ${colors.border} rounded-lg p-4 mb-6`}>
                    <p className="text-gray-800 text-center whitespace-pre-wrap break-words">
                        {message}
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex flex-col-reverse sm:flex-row gap-3">
                    {cancelText && (
                        <Button
                            variant="secondary"
                            onClick={handleCancel}
                            fullWidth
                            className="sm:flex-1"
                        >
                            {cancelText}
                        </Button>
                    )}
                    <Button
                        variant={colors.button}
                        onClick={handleConfirm}
                        fullWidth
                        className="sm:flex-1"
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}