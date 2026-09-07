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
      // Double requestAnimationFrame ensures browser paints the initial state before transitioning
      const frame1 = requestAnimationFrame(() => {
        const frame2 = requestAnimationFrame(() => {
          setVisible(true);
        });
        onCleanup(() => cancelAnimationFrame(frame2));
      });
      onCleanup(() => cancelAnimationFrame(frame1));
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
