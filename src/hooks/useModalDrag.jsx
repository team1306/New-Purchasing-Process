import { useState, useEffect, useRef } from 'react';

export const useModalDrag = (sheetRef, scrollRef, onClose) => {
    const [translateY, setTranslateY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const startYRef = useRef(0);
    const lastYRef = useRef(0);

    const onTouchStart = (e) => {
        if (!sheetRef.current) return;
        const touch = e.touches ? e.touches[0] : e;
        startYRef.current = touch.clientY;
        lastYRef.current = touch.clientY;
        setIsDragging(true);
    };

    const onTouchMove = (e) => {
        if (!isDragging || !sheetRef.current) return;
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
        if (!isDragging) return;
        setIsDragging(false);
        const delta = lastYRef.current - startYRef.current;
        const threshold = Math.min(140, window.innerHeight * 0.18);
        if (delta > threshold) {
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