export default function Divider({ className = '', vertical = false }) {
    if (vertical) {
        return <div className={`w-px bg-gray-200 ${className}`} />;
    }

    return <div className={`h-px bg-gray-200 ${className}`} />;
}