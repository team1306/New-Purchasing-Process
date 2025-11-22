import { useRef, useState } from 'react';

export const useModalDrag = (sheetRef, scrollRef, headerRef, onClose) => {
    const [translateY, setTranslateY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const startYRef = useRef(0);
    const lastYRef = useRef(0);
    const velocityRef = useRef(0);
    const isDraggingFromHeaderRef = useRef(false);

    const onTouchStart = (e) => {
        // Only allow dragging on mobile
        if (window.innerWidth >= 768) return;

        if (!sheetRef.current || !headerRef.current) return;

        const touch = e.touches ? e.touches[0] : e;
        const scrollEl = scrollRef.current;

        // Check if touch started on the header
        const touchTarget = e.target;
        const isOnHeader = headerRef.current.contains(touchTarget);

        // Only initiate drag if:
        // 1. Touch started on header OR
        // 2. Content is scrolled to the very top
        const scrollAtTop = !scrollEl || scrollEl.scrollTop <= 0;

        if (!isOnHeader && !scrollAtTop) {
            return;
        }

        isDraggingFromHeaderRef.current = isOnHeader;
        startYRef.current = touch.clientY;
        lastYRef.current = touch.clientY;
        setIsDragging(true);

        // If dragging from header, prevent scroll on the content
        if (isOnHeader && scrollEl) {
            scrollEl.style.overflow = 'hidden';
        }
    };

    const onTouchMove = (e) => {
        if (!isDragging || !sheetRef.current) return;
        if (window.innerWidth >= 768) return;

        const touch = e.touches ? e.touches[0] : e;
        const deltaY = touch.clientY - startYRef.current;

        // Only allow downward dragging
        if (deltaY < 0) {
            setTranslateY(0);
            return;
        }

        // Calculate velocity for momentum-based closing
        velocityRef.current = touch.clientY - lastYRef.current;
        lastYRef.current = touch.clientY;

        // Apply rubber band effect for smooth dragging
        const damped = Math.pow(deltaY, 0.85);
        setTranslateY(damped);

        // Prevent default to stop any scrolling during drag
        if (isDraggingFromHeaderRef.current) {
            e.preventDefault();
        }
    };

    const onTouchEnd = () => {
        if (!isDragging) return;
        if (window.innerWidth >= 768) return;

        setIsDragging(false);
        isDraggingFromHeaderRef.current = false;

        // Re-enable scrolling
        const scrollEl = scrollRef.current;
        if (scrollEl) {
            scrollEl.style.overflow = 'auto';
        }

        const threshold = window.innerHeight * 0.20; // Close if dragged 20% of screen
        const velocityThreshold = 8; // Close if fast swipe

        if (translateY > threshold || velocityRef.current > velocityThreshold) {
            onClose();
        } else {
            // Snap back to original position
            setTranslateY(0);
        }

        velocityRef.current = 0;
    };

    return {
        translateY,
        onTouchStart,
        onTouchMove,
        onTouchEnd
    };
};