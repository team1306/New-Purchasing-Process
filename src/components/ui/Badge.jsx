import { badgeClasses } from '../../styles/common-classes';
import { stateColors } from '../../styles/design-tokens';

export default function Badge({
                                  children,
                                  variant = 'default',
                                  state = null,
                                  className = ''
                              }) {
    let colorClasses = 'bg-gray-100 text-gray-800';

    // If state prop is provided, use state-specific colors
    if (state && stateColors[state]) {
        colorClasses = `${stateColors[state].bg} ${stateColors[state].text}`;
    } else {
        // Otherwise use variant-based colors
        const variantColors = {
            default: 'bg-gray-100 text-gray-800',
            primary: 'bg-blue-100 text-blue-800',
            success: 'bg-green-100 text-green-800',
            warning: 'bg-yellow-100 text-yellow-800',
            danger: 'bg-red-100 text-red-800',
            purple: 'bg-purple-100 text-purple-800',
        };
        colorClasses = variantColors[variant] || variantColors.default;
    }

    const classes = `
    ${badgeClasses.base}
    ${colorClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

    return (
        <span className={classes}>
      {children}
    </span>
    );
}