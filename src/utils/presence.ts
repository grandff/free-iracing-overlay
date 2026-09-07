import { createSignal, createEffect, onCleanup, Accessor } from "solid-js";

export interface PresenceReturn {
  mounted: Accessor<boolean>;
  visible: Accessor<boolean>;
}

/**
 * createPresence: Manages enter/exit animation lifecycle for conditional components in Solid.js.
 * Ensures the DOM remains mounted during the exit animation transition, then cleanly unmounts.
 * Follows the Ponytail principle: zero external dependencies, ultra-lightweight, 60fps/144fps GPU-accelerated.
 */
export function createPresence(
  isOpen: Accessor<boolean>,
  exitDurationMs: number = 220
): PresenceReturn {
  const [mounted, setMounted] = createSignal(isOpen());
  const [visible, setVisible] = createSignal(isOpen());

  createEffect(() => {
    const open = isOpen();
    if (open) {
      setMounted(true);
      let frame1: number | undefined;
      let frame2: number | undefined;
      frame1 = requestAnimationFrame(() => {
        frame2 = requestAnimationFrame(() => {
          setVisible(true);
        });
      });
      onCleanup(() => {
        if (frame1 !== undefined) cancelAnimationFrame(frame1);
        if (frame2 !== undefined) cancelAnimationFrame(frame2);
      });
    } else {
      setVisible(false);
      const timer = setTimeout(() => {
        setMounted(false);
      }, exitDurationMs);
      onCleanup(() => clearTimeout(timer));
    }
  });

  return { mounted, visible };
}
