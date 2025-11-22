import {useRef, useState} from 'react';

export const useModalDrag = (sheetRef, scrollRef, onClose) => {
    const [translateY, setTranslateY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const startYRef = useRef(0);
    const lastYRef = useRef(0);
    const velocityRef = useRef(0);

    const onTouchStart = (e) => {
        if (!sheetRef.current) return;

        const touch = e.touches ? e.touches[0] : e;
        const scrollEl = scrollRef.current;

        // Only allow drag when content is fully scrolled to top
        const scrollAtTop = !scrollEl || scrollEl.scrollTop <= 1;
        if (!scrollAtTop) return;

        startYRef.current = touch.clientY;
        lastYRef.current = touch.clientY;
        setIsDragging(true);
    };

    const onTouchMove = (e) => {
        if (!isDragging || !sheetRef.current) return;

        const touch = e.touches ? e.touches[0] : e;
        const deltaY = touch.clientY - startYRef.current;

        velocityRef.current = deltaY - translateY;

        const damped = translateY * 0.15 + deltaY * 0.85;
        setTranslateY(damped);
    };

    const onTouchEnd = () => {
        if (!isDragging) return;

        setIsDragging(false);

        const delta = lastYRef.current - startYRef.current;
        const threshold = window.innerHeight * 0.25; // must drag half screen to close

        if (delta > threshold || velocityRef.current > 15) {
            onClose();
        } else {
            setTranslateY(0);
        }
    };

    return {
        translateY,
        onTouchStart,
        onTouchMove,
        onTouchEnd
    };
};
