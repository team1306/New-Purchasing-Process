import { Input, Select, Textarea } from '../ui';

export default function FormField({ type = 'text', ...props }) {
    switch (type) {
        case 'select':
            return <Select {...props} />;
        case 'textarea':
            return <Textarea {...props} />;
        default:
            return <Input type={type} {...props} />;
    }
}