import { Component, JSX } from "solid-js";

// ponytail: lightweight inline SVG icons. Zero external icon fonts, zero network requests, instant theme color inheritance.

interface IconProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
  class?: string;
  size?: number;
}

export const IconFuel: Component<IconProps> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class={props.class || "w-4 h-4"}
    width={props.size}
    height={props.size}
    {...props}
  >
    <line x1="3" y1="22" x2="15" y2="22" />
    <line x1="4" y1="9" x2="14" y2="9" />
    <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18" />
    <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5" />
  </svg>
);

export const IconPit: Component<IconProps> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class={props.class || "w-4 h-4"}
    width={props.size}
    height={props.size}
    {...props}
  >
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

export const IconTirePSI: Component<IconProps> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class={props.class || "w-4 h-4"}
    width={props.size}
    height={props.size}
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 14v-4" />
    <path d="M12 6h.01" />
    <path d="m8 16 2-2" />
    <path d="m16 16-2-2" />
  </svg>
);

export const IconTireTemp: Component<IconProps> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class={props.class || "w-4 h-4"}
    width={props.size}
    height={props.size}
    {...props}
  >
    <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
  </svg>
);

export const IconWarning: Component<IconProps> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class={props.class || "w-4 h-4"}
    width={props.size}
    height={props.size}
    {...props}
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const IconCrosshair: Component<IconProps> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class={props.class || "w-4 h-4"}
    width={props.size}
    height={props.size}
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="22" y1="12" x2="18" y2="12" />
    <line x1="6" y1="12" x2="2" y2="12" />
    <line x1="12" y1="6" x2="12" y2="2" />
    <line x1="12" y1="22" x2="12" y2="18" />
  </svg>
);

export const IconCompass: Component<IconProps> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class={props.class || "w-4 h-4"}
    width={props.size}
    height={props.size}
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

export const IconStopwatch: Component<IconProps> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class={props.class || "w-4 h-4"}
    width={props.size}
    height={props.size}
    {...props}
  >
    <circle cx="12" cy="14" r="8" />
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="14" x2="15" y2="11" />
  </svg>
);

export const IconRadar: Component<IconProps> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class={props.class || "w-4 h-4"}
    width={props.size}
    height={props.size}
    {...props}
  >
    <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
    <path d="M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0" />
    <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M12 3v9l6 6" />
  </svg>
);

export const IconArrow: Component<IconProps> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    class={props.class || "w-4 h-4"}
    width={props.size}
    height={props.size}
    {...props}
  >
    <path d="M12 2L2 22l10-4 10 4L12 2z" />
  </svg>
);

export const IconChevronUp: Component<IconProps> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    class={props.class || "w-3 h-3"}
    {...props}
  >
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

export const IconChevronDown: Component<IconProps> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    class={props.class || "w-3 h-3"}
    {...props}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
