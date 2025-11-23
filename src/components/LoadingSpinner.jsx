import { Spinner } from './ui';
import { containerClasses } from '../styles/common-classes';

export default function LoadingSpinner() {
    return (
        <div className={`${containerClasses.page} flex items-center justify-center`}>
            <div className="text-center">
                <Spinner size="xl" className="mx-auto mb-4" />
                <p className="text-gray-600">Loading...</p>
            </div>
        </div>
    );
}