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

// ================= MOTORSPORT SERIES LOGOS =================

export const LogoF1: Component<{ class?: string; size?: number; fill?: string }> = (props) => (
  <svg
    viewBox="0 0 1600 400"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    class={props.class || "h-5 w-auto"}
    height={props.size}
  >
    <title>Formula 1 Official Logo</title>
    <path
      d="M1367.21 312.501C1379.83 312.501 1390.25 316.71 1398.5 325.168C1406.75 333.626 1410.88 344.001 1410.88 356.334C1410.88 368.667 1406.79 379.043 1398.58 387.418C1390.38 395.793 1380 400.001 1367.38 400.001C1354.75 400.001 1344.25 395.792 1335.92 387.334C1327.54 378.876 1323.38 368.501 1323.38 356.168C1323.38 343.835 1327.54 333.459 1335.83 325.084C1344.13 316.709 1354.59 312.501 1367.21 312.501ZM1167.04 149.792H635.292C501.959 149.792 473.584 160.083 403.667 227.875H403.708L226.292 400H0L281.542 120.583C386.208 17 436.667 4.27469e-06 615.125 0H1320.04L1167.04 149.792ZM1144.21 173.708L1003.96 313.958H641.125C574.625 313.958 559.917 317.083 526.917 350.083L477 400H267.167L422.292 244.875C483.209 184 504.209 173.708 638.5 173.708H1144.21ZM1600 0L1198.92 400H950.875L1350.88 0H1600ZM1367.13 319.376C1356.79 319.376 1348.13 322.96 1341.13 330.126C1334.17 337.293 1330.67 345.96 1330.67 356.168C1330.67 366.376 1334.17 375.042 1341.13 382.209C1348.09 389.376 1356.75 392.959 1367.13 392.959C1377.5 392.959 1386.13 389.418 1393.13 382.293C1400.09 375.168 1403.58 366.501 1403.58 356.251C1403.58 346.001 1400.09 337.293 1393.13 330.126C1386.17 322.959 1377.5 319.376 1367.13 319.376ZM1367.21 332.084C1373.5 332.084 1378.25 333.251 1381.42 335.626C1384.58 337.959 1386.17 341.501 1386.17 346.209C1386.17 350.917 1385.54 354.417 1384.25 356.709C1382.96 359.001 1380.79 360.834 1377.71 362.251L1386.83 380.668H1376.71L1368.42 363.501H1358.63L1358.58 363.459V380.626H1348.96V332.084H1367.21ZM1358.42 355.918H1368.21C1371.21 355.918 1373.38 355.293 1374.67 354.001C1376 352.709 1376.67 350.626 1376.67 347.751C1376.67 342.293 1373.25 339.584 1366.38 339.584H1358.42V355.918Z"
      fill={props.fill || "#E10600"}
    />
  </svg>
);

export const LogoWEC: Component<{ class?: string }> = (props) => (
  <svg
    viewBox="0 0 100 24"
    fill="currentColor"
    class={props.class || "h-4 w-auto"}
  >
    <path d="M4 3h7l4 11 4-11h5l4 11 4-11h7l-7 18h-6l-4-11-4 11h-6L4 3zm36 0h17v4H47v3h8v4h-8v3h10v4H40V3zm22 10c0-5 3.5-10 10-10 6 0 9 4 9 4l-4 3.5s-2-2.5-5-2.5c-3 0-5 2-5 5s2 5 5 5c3 0 5-2.5 5-2.5l4 3.5s-3 4-9 4c-6.5 0-10-5-10-10z" />
  </svg>
);

export const LogoWRC: Component<{ class?: string }> = (props) => (
  <svg
    viewBox="0 0 100 24"
    fill="currentColor"
    class={props.class || "h-4 w-auto"}
  >
    <path d="M2 4h6l4 11 4-11h4l4 11 4-11h6l-7 16h-5l-4-10-4 10h-5L2 4zm34 0h12c5 0 8 3 8 7 0 3-2 5.5-5 6.5l6 2.5h-6l-5-2.5H41v2.5h-5V4zm5 3.5v4.5h6c2 0 3.5-1 3.5-2.2 0-1.3-1.5-2.3-3.5-2.3h-6zm23-3.5h15v4h-10v3h8v4h-8v5h-5V4z" />
  </svg>
);

export const LogoIndyCar: Component<{ class?: string }> = (props) => (
  <svg
    viewBox="0 0 100 24"
    fill="currentColor"
    class={props.class || "h-4 w-auto"}
  >
    <path d="M6 4h6v16H6V4zm11 0h5l8 10V4h6v16h-5l-8-10v10h-6V4zm24 0h8c7 0 11 4 11 8s-4 8-11 8h-8V4zm6 4v8h2c4 0 5-2 5-4s-1-4-5-4h-2zm17-4h6l4 7 4-7h6l-7 10v6h-6v-6l-7-10z" />
  </svg>
);

export const LogoGT: Component<{ class?: string }> = (props) => (
  <svg
    viewBox="0 0 80 24"
    fill="currentColor"
    class={props.class || "h-4 w-auto"}
  >
    <path d="M4 12c0-5 3.5-9 9.5-9 5.5 0 8 3 8 3l-3 3.5s-2-2-5-2c-3.5 0-5 2-5 4.5s1.5 4.5 5 4.5c2 0 3.5-.8 4.5-1.5v-2h-5v-4h9.5v8c-2.5 2-5.5 3-9 3C7.5 21 4 17 4 12zm23-9h19v4.5h-7v13.5h-5V7.5h-7V3z" />
  </svg>
);

