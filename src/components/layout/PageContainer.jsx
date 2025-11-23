import { containerClasses } from '../../styles/common-classes';

export default function PageContainer({ children, className = '' }) {
    return (
        <div className={containerClasses.page}>
            <div className="md:p-4">
                <div className={`${containerClasses.content} md:pt-8 ${className}`}>
                    {children}
                </div>
            </div>
        </div>
    );
}