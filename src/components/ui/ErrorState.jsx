import { Button } from './index';

export default function ErrorState({
                                       message = 'Something went wrong',
                                       onRetry,
                                       icon: Icon
                                   }) {
    return (
        <div className="p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {Icon ? (
                    <Icon className="w-8 h-8 text-red-600" />
                ) : (
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                )}
            </div>
            <p className="text-red-600 mb-4 text-sm md:text-base">{message}</p>
            {onRetry && (
                <Button variant="primary" onClick={onRetry}>
                    Try Again
                </Button>
            )}
        </div>
    );
}