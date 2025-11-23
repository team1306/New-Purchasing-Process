import { ConfirmDialog } from './ui';

export default function CustomAlert(props) {
    // This component is now just a wrapper around ConfirmDialog
    // to maintain backwards compatibility
    return <ConfirmDialog {...props} />;
}