import { headerClasses } from '../../styles/common-classes';

export default function PageHeader({ children, className = '' }) {
    return (
        <div className={`${headerClasses.gradient} ${className}`}>
            {children}
        </div>
    );
}