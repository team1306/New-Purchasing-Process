import { Spinner } from './index';

export default function LoadingState({ message = 'Loading...' }) {
    return (
        <div className="p-12 text-center">
            <Spinner size="lg" className="mx-auto" />
            <p className="mt-4 text-gray-600">{message}</p>
        </div>
    );
}