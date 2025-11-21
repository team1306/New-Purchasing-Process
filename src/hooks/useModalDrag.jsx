import { useState, useEffect, useRef } from 'react';

export const useModalDrag = (sheetRef, scrollRef, headerRef, onClose) => {
    const [translateY, setTranslateY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const startYRef = useRef(0);
    const lastYRef = useRef(0);
    const dragStartedOnHeaderRef = useRef(false);

    const onTouchStart = (e) => {
        if (!sheetRef.current || !headerRef.current) return;

        // Check if touch started on the header
        const touch = e.touches ? e.touches[0] : e;
        const headerRect = headerRef.current.getBoundingClientRect();
        const touchedHeader = touch.clientY >= headerRect.top && touch.clientY <= headerRect.bottom;

        if (!touchedHeader) {
            dragStartedOnHeaderRef.current = false;
            return;
        }

        dragStartedOnHeaderRef.current = true;
        startYRef.current = touch.clientY;
        lastYRef.current = touch.clientY;
        setIsDragging(true);
    };

    const onTouchMove = (e) => {
        if (!isDragging || !sheetRef.current || !dragStartedOnHeaderRef.current) return;

        const touch = e.touches ? e.touches[0] : e;
        const deltaY = touch.clientY - startYRef.current;
        lastYRef.current = touch.clientY;

        const scrollEl = scrollRef.current;
        const scrollAtTop = !scrollEl || scrollEl.scrollTop <= 0;

        if (deltaY > 0 && scrollAtTop) {
            setTranslateY(deltaY);
            if (e.cancelable) e.preventDefault();
        } else if (deltaY < 0 && translateY > 0) {
            setTranslateY(Math.max(0, deltaY));
            if (e.cancelable) e.preventDefault();
        }
    };

    const onTouchEnd = () => {
        if (!isDragging || !dragStartedOnHeaderRef.current) return;
        setIsDragging(false);
        dragStartedOnHeaderRef.current = false;

        const delta = lastYRef.current - startYRef.current;
        const threshold = Math.min(140, window.innerHeight * 0.18);
        if (delta > threshold) {
            // Let the parent handle the close with animation
            onClose();
        } else {
            setTranslateY(0);
        }
    };

    useEffect(() => {
        const el = sheetRef.current;
        if (!el) return;

        const onPointerDown = (e) => {
            if (window.innerWidth >= 768) return;
            el.setPointerCapture?.(e.pointerId);
            onTouchStart(e);
        };
        const onPointerMove = (e) => {
            if (!isDragging) return;
            onTouchMove(e);
        };
        const onPointerUp = (e) => {
            if (!isDragging) return;
            onTouchEnd(e);
            el.releasePointerCapture?.(e.pointerId);
        };

        el.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);

        return () => {
            el.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        };
    }, [isDragging]);

    return {
        translateY,
        onTouchStart,
        onTouchMove,
        onTouchEnd
    };
};