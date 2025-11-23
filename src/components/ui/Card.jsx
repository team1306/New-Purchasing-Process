import { cardClasses } from '../../styles/common-classes';

export default function Card({
                                 children,
                                 hover = false,
                                 bordered = false,
                                 padding = true,
                                 className = '',
                                 onClick,
                                 ...props
                             }) {
    const classes = `
    ${cardClasses.base}
    ${hover ? cardClasses.hover : ''}
    ${bordered ? cardClasses.bordered : ''}
    ${padding ? 'p-4 md:p-6' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

    return (
        <div className={classes} onClick={onClick} {...props}>
            {children}
        </div>
    );
}