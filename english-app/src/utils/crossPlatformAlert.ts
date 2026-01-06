/**
 * Web-only Alert & Confirm utilizing browser native APIs
 */

export const crossPlatformAlert = (title: string, message: string) => {
    // Browser alert only takes one argument usually
    window.alert(`${title}\n${message}`);
};

export const crossPlatformConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
) => {
    const result = window.confirm(`${title}\n${message}`);
    if (result) {
        onConfirm();
    } else {
        onCancel?.();
    }
};
