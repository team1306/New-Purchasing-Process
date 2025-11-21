import { useState, useEffect, useRef } from 'react';

export const useModalDrag = (sheetRef, scrollRef, onClose) => {
    const [translateY, setTranslateY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const startYRef = useRef(0);
    const lastYRef = useRef(0);

    const onTouchStart = (e) => {
        if (!sheetRef.current) return;

        const touch = e.touches ? e.touches[0] : e;
        const scrollEl = scrollRef.current;

        // Only allow drag when content is fully scrolled to top
        const scrollAtTop = !scrollEl || scrollEl.scrollTop <= 0;
        if (!scrollAtTop) return;

        startYRef.current = touch.clientY;
        lastYRef.current = touch.clientY;
        setIsDragging(true);
    };

    const onTouchMove = (e) => {
        if (!isDragging || !sheetRef.current) return;

        const touch = e.touches ? e.touches[0] : e;
        const deltaY = touch.clientY - startYRef.current;

        // Only drag downward, and damp movement to reduce jitter
        if (deltaY > 0) {
            setTranslateY(deltaY * 0.9);
            if (e.cancelable) e.preventDefault();
        }
    };

    const onTouchEnd = () => {
        if (!isDragging) return;

        setIsDragging(false);

        const delta = lastYRef.current - startYRef.current;
        const threshold = window.innerHeight * 0.50; // must drag half screen to close

        if (delta > threshold) {
            // Trigger animated close via parent, not instant close
            onClose();
        } else {
            setTranslateY(0);
        }
    };

    // Use pointer events for stability
    useEffect(() => {
        const el = sheetRef.current;
        if (!el) return;

        const handlePointerDown = (e) => {
            if (window.innerWidth >= 768) return;
            onTouchStart(e);
        };
        const handlePointerMove = (e) => {
            if (!isDragging) return;
            lastYRef.current = e.clientY;
            onTouchMove(e);
        };
        const handlePointerUp = () => {
            if (!isDragging) return;
            onTouchEnd();
        };

        el.addEventListener("pointerdown", handlePointerDown);
        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);

        return () => {
            el.removeEventListener("pointerdown", handlePointerDown);
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
        };
    }, [isDragging]);

    return {
        translateY,
        onTouchStart,
        onTouchMove,
        onTouchEnd
    };
};
