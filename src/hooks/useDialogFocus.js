import { useEffect, useRef } from 'react';

export default function useDialogFocus(open, onClose) {
    const ref = useRef(null);
    useEffect(() => {
        if (!open || !ref.current) return;
        const previous = document.activeElement;
        const focusable = () => [...ref.current.querySelectorAll('a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]')].filter(element => element.getClientRects().length > 0);
        focusable()[0]?.focus();
        const handleKey = event => {
            if (event.key === 'Escape') { event.preventDefault(); onClose(); }
            if (event.key !== 'Tab') return;
            const elements = focusable();
            const first = elements[0];
            const last = elements.at(-1);
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        };
        const container = ref.current;
        container.addEventListener('keydown', handleKey);
        return () => { container.removeEventListener('keydown', handleKey); if (previous?.isConnected) previous.focus(); };
    }, [open, onClose]);
    return ref;
}
