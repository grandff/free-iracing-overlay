import { Component, JSX } from "solid-js";

// ponytail: ultra-lightweight, crisp vector SVG brand emblems for sim racing cars
// Zero external font/image dependencies. Instant rendering with zero stutter.

export interface BrandIconProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
  class?: string;
  size?: number;
}

// 1. Porsche Crest
export const BrandPorsche: Component<BrandIconProps> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    class={props.class || "w-4 h-4"}
    width={props.size}
    height={props.size}
    {...props}
  >
    {/* Golden Shield */}
    <path
      d="M12 2L4.5 4.5V11C4.5 16.5 7.8 21.5 12 23C16.2 21.5 19.5 16.5 19.5 11V4.5L12 2Z"
      fill="#D4AF37"
      stroke="#111"
      stroke-width="0.8"
    />
    {/* Red Top Bar */}
    <path d="M5.8 5.8H18.2V8.2H5.8V5.8Z" fill="#B30000" />
    {/* Black and Red Bar Quarters */}
    <rect x="6.8" y="9.5" width="4.2" height="4.2" fill="#111" />
    <rect x="13" y="9.5" width="4.2" height="4.2" fill="#B30000" />
    <rect x="6.8" y="14.5" width="4.2" height="4.2" fill="#B30000" />
    <rect x="13" y="14.5" width="4.2" height="4.2" fill="#111" />
    {/* Center Horse Silhouette */}
    <path
      d="M12 11.2C12.4 11.8 12.8 12.6 12.5 13.8C12.3 13.4 11.8 13.1 11.5 12.5C11.3 12 11.5 11.6 12 11.2Z"
      fill="#D4AF37"
    />
  </svg>
);

// 2. Ferrari Shield
export const BrandFerrari: Component<BrandIconProps> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    class={props.class || "w-4 h-4"}
    width={props.size}
    height={props.size}
    {...props}
  >
    {/* Canary Yellow Shield */}
    <path
      d="M12 2L4 4.5V12C4 17.5 7.5 21.8 12 23.5C16.5 21.8 20 17.5 20 12V4.5L12 2Z"
      fill="#FFF200"
      stroke="#111"
      stroke-width="0.8"
    />
    {/* Italian Tricolor Top Banner */}
    <path d="M4.5 4.8H9.5V7H4.5V4.8Z" fill="#009246" />
    <path d="M9.5 4.8H14.5V7H9.5V4.8Z" fill="#FFFFFF" />
    <path d="M14.5 4.8H19.5V7H14.5V4.8Z" fill="#CE2B37" />
    {/* Prancing Horse Silhouette */}
    <path
      d="M13.2 8.5C12.8 8.8 12.3 8.9 12.2 9.5C12.4 9.9 12.9 10 13.1 10.4C13.4 11 12.9 11.4 12.6 11.8C12.2 12.2 11.5 12.3 11.2 12.8C10.9 13.2 11.2 13.8 11 14.3C10.8 14.8 10.4 15.3 10.2 15.8C9.9 16.3 9.4 17 9.8 17.5C10.2 18 10.8 17.6 11.2 17.2C11.7 16.7 12 16.1 12.3 15.5C12.7 15.9 13.2 16.3 13.6 16.8C13.8 17.1 14.2 16.8 14.3 16.4C14.4 15.9 14.1 15.4 13.8 15C13.5 14.4 13.5 13.8 13.7 13.2C13.9 12.6 14.5 12.2 14.7 11.5C14.9 10.9 14.5 10.4 14.3 9.8C14.1 9.3 13.7 8.9 13.2 8.5Z"
      fill="#111111"
    />
  </svg>
);

// 3. BMW Roundel
export const BrandBMW: Component<BrandIconProps> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    class={props.class || "w-4 h-4"}
    width={props.size}
    height={props.size}
    {...props}
  >
    {/* Outer Silver/Black Ring */}
    <circle cx="12" cy="12" r="11" fill="#111" stroke="#E5E7EB" stroke-width="1.2" />
    {/* Center 4 Quadrants */}
    <circle cx="12" cy="12" r="7.5" fill="#FFFFFF" />
    <path d="M12 4.5A7.5 7.5 0 0 1 19.5 12H12V4.5Z" fill="#0066B1" />
    <path d="M12 19.5A7.5 7.5 0 0 1 4.5 12H12V19.5Z" fill="#0066B1" />
    <line x1="12" y1="4.5" x2="12" y2="19.5" stroke="#FFFFFF" stroke-width="0.8" />
    <line x1="4.5" y1="12" x2="19.5" y2="12" stroke="#FFFFFF" stroke-width="0.8" />
  </svg>
);

// 4. Mercedes-Benz / AMG
export const BrandMercedes: Component<BrandIconProps> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    class={props.class || "w-4 h-4"}
    width={props.size}
    height={props.size}
    {...props}
  >
    <circle cx="12" cy="12" r="10.5" stroke="#E5E7EB" stroke-width="1.2" />
    <path d="M12 2.5L13.2 11.2L12 12L10.8 11.2L12 2.5Z" fill="#F3F4F6" stroke="#9CA3AF" stroke-width="0.4" />
    <path d="M12 12L13.2 11.2L20.2 16.5L19.2 17.5L12 12Z" fill="#9CA3AF" stroke="#6B7280" stroke-width="0.4" />
    <path d="M12 12L10.8 11.2L3.8 16.5L4.8 17.5L12 12Z" fill="#E5E7EB" stroke="#9CA3AF" stroke-width="0.4" />
    <circle cx="12" cy="12" r="1.2" fill="#D1D5DB" />
  </svg>
);

// 5. McLaren Speedmark
export const BrandMcLaren: Component<BrandIconProps> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    class={props.class || "w-4 h-4"}
    width={props.size}
    height={props.size}
    {...props}
  >
    <path
      d="M4 14.5C7.5 7.5 15.5 6 20 8.5C18 10.5 15.5 12 12.5 13C8.5 14.5 5.5 16 4 18C4 16.8 4 15.6 4 14.5Z"
      fill="#FF8000"
    />
    <path
      d="M12.5 13C16 11.5 18.5 10 20 8.5C19.2 12.5 15.8 16.2 11.5 17.5C8 18.5 5.5 18 4 18C5.5 16 8.5 14.5 12.5 13Z"
      fill="#E05A00"
    />
  </svg>
);

// 6. Audi Rings
export const BrandAudi: Component<BrandIconProps> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    class={props.class || "w-4 h-4"}
    width={props.size}
    height={props.size}
    {...props}
  >
    <g stroke="#E5E7EB" stroke-width="1.3" fill="none">
      <circle cx="5.5" cy="12" r="3.8" />
      <circle cx="9.8" cy="12" r="3.8" />
      <circle cx="14.2" cy="12" r="3.8" />
      <circle cx="18.5" cy="12" r="3.8" />
    </g>
  </svg>
);

// 7. Aston Martin Wings
export const BrandAstonMartin: Component<BrandIconProps> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    class={props.class || "w-4 h-4"}
    width={props.size}
    height={props.size}
    {...props}
  >
    <path
      d="M2 11C6 10 9 12 12 14C15 12 18 10 22 11C20.5 13.5 16.5 14.5 12 15C7.5 14.5 3.5 13.5 2 11Z"
      fill="#E5E7EB"
      stroke="#4B5563"
      stroke-width="0.6"
    />
    <path d="M4 11.8C7 11.2 9.5 12.5 12 13.8C14.5 12.5 17 11.2 20 11.8" stroke="#374151" stroke-width="0.5" />
    <rect x="7" y="10" width="10" height="3.2" rx="0.5" fill="#00594C" stroke="#E5E7EB" stroke-width="0.5" />
    <line x1="8" y1="11.6" x2="16" y2="11.6" stroke="#FFFFFF" stroke-width="0.6" />
  </svg>
);

// 8. Lamborghini Bull Shield
export const BrandLamborghini: Component<BrandIconProps> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    class={props.class || "w-4 h-4"}
    width={props.size}
    height={props.size}
    {...props}
  >
    <path
      d="M12 2L4 5V12.5C4 18 8 22 12 23.5C16 22 20 18 20 12.5V5L12 2Z"
      fill="#141414"
      stroke="#D4AF37"
      stroke-width="1"
    />
    <path
      d="M8.5 10C9 9 10 9.2 11 9.8C11.8 9.5 12.5 9.5 13.5 10C14.5 9.2 15.5 9 16 10C15.2 11 14.8 11.8 14.5 13C14.2 14.2 14.5 15.5 14 16.5C13.5 17 12.8 17 12 16.2C11.5 15.5 11 15 10.5 14C9.8 14.5 9 14.8 8.5 14.2C8 13.5 8.2 12 8.5 10Z"
      fill="#D4AF37"
    />
  </svg>
);

// 9. Corvette / Chevrolet Crossed Flags
export const BrandCorvette: Component<BrandIconProps> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    class={props.class || "w-4 h-4"}
    width={props.size}
    height={props.size}
    {...props}
  >
    {/* Left Flag (Checkered) */}
    <path d="M12 16.5L4 12V6L12 10.5V16.5Z" fill="#111" stroke="#E5E7EB" stroke-width="0.6" />
    <rect x="5.5" y="7.8" width="2.2" height="2" fill="#FFF" />
    <rect x="8" y="9.8" width="2.2" height="2" fill="#FFF" />
    <rect x="5.5" y="11.8" width="2.2" height="2" fill="#FFF" />
    {/* Right Flag (Red) */}
    <path d="M12 16.5L20 12V6L12 10.5V16.5Z" fill="#DC2626" stroke="#E5E7EB" stroke-width="0.6" />
    {/* Center Gold Bowtie */}
    <path d="M14.5 9.5H17.5V11.5H14.5V9.5Z" fill="#FBBF24" />
    {/* Stems */}
    <line x1="8" y1="18.5" x2="16" y2="9" stroke="#9CA3AF" stroke-width="0.8" />
    <line x1="16" y1="18.5" x2="8" y2="9" stroke="#9CA3AF" stroke-width="0.8" />
  </svg>
);

// 10. Ford Oval
export const BrandFord: Component<BrandIconProps> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    class={props.class || "w-4 h-4"}
    width={props.size}
    height={props.size}
    {...props}
  >
    <ellipse cx="12" cy="12" rx="10.5" ry="6.5" fill="#002C6C" stroke="#FFFFFF" stroke-width="0.9" />
    <path
      d="M6.5 12.5C7.5 10.5 9.5 10 11.5 10.2C10.5 11 9 11.8 8 13.5C9.5 13.2 11 12.5 12.5 11.5C13.5 10.8 15 10.5 16 11C16.8 11.5 16.5 12.5 15 13.2C13.5 14 11 14.2 9.5 14.5"
      stroke="#FFFFFF"
      stroke-width="1.1"
      stroke-linecap="round"
    />
  </svg>
);

// 11. Cadillac Crest
export const BrandCadillac: Component<BrandIconProps> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    class={props.class || "w-4 h-4"}
    width={props.size}
    height={props.size}
    {...props}
  >
    <path
      d="M12 4L5 7.5V13C5 17 8 20 12 21.5C16 20 19 17 19 13V7.5L12 4Z"
      stroke="#D1D5DB"
      stroke-width="0.8"
      fill="#181818"
    />
    <rect x="7.5" y="8.5" width="4" height="2" fill="#B91C1C" />
    <rect x="12.5" y="8.5" width="4" height="2" fill="#1D4ED8" />
    <rect x="7.5" y="11.5" width="4" height="2" fill="#FBBF24" />
    <rect x="12.5" y="11.5" width="4" height="2" fill="#B91C1C" />
    <rect x="9.5" y="14.5" width="5" height="2" fill="#FBBF24" />
  </svg>
);

// 12. Acura
export const BrandAcura: Component<BrandIconProps> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    class={props.class || "w-4 h-4"}
    width={props.size}
    height={props.size}
    {...props}
  >
    <circle cx="12" cy="12" r="10" stroke="#E5E7EB" stroke-width="1.2" />
    <path d="M7 16.5L12 6L17 16.5H14.2L12 11.5L9.8 16.5H7Z" fill="#FFFFFF" />
  </svg>
);

// 13. Toyota
export const BrandToyota: Component<BrandIconProps> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    class={props.class || "w-4 h-4"}
    width={props.size}
    height={props.size}
    {...props}
  >
    <ellipse cx="12" cy="12" rx="10" ry="7.5" stroke="#DC2626" stroke-width="1.2" />
    <ellipse cx="12" cy="9.5" rx="5.5" ry="2.8" stroke="#DC2626" stroke-width="1.2" />
    <ellipse cx="12" cy="12" rx="2.5" ry="7.2" stroke="#DC2626" stroke-width="1.2" />
  </svg>
);

// 14. Honda
export const BrandHonda: Component<BrandIconProps> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    class={props.class || "w-4 h-4"}
    width={props.size}
    height={props.size}
    {...props}
  >
    <rect x="3.5" y="4" width="17" height="16" rx="2.5" stroke="#E5E7EB" stroke-width="1" />
    <path d="M6.5 7L7.8 17H9.8L9.5 13H14.5L14.2 17H16.2L17.5 7H15L14.7 11H9.3L9 7H6.5Z" fill="#DC2626" />
  </svg>
);

// 15. Hyundai
export const BrandHyundai: Component<BrandIconProps> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    class={props.class || "w-4 h-4"}
    width={props.size}
    height={props.size}
    {...props}
  >
    <ellipse cx="12" cy="12" rx="10" ry="7.5" stroke="#002C6C" stroke-width="1.2" transform="rotate(-15 12 12)" />
    <path d="M7.5 16L9.5 8H11L10 12H14L15 8H16.5L14.5 16H13L13.8 13H9.8L9 16H7.5Z" fill="#002C6C" />
  </svg>
);

// 16. Mazda
export const BrandMazda: Component<BrandIconProps> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    class={props.class || "w-4 h-4"}
    width={props.size}
    height={props.size}
    {...props}
  >
    <ellipse cx="12" cy="12" rx="10" ry="7.5" stroke="#E5E7EB" stroke-width="1.2" />
    <path
      d="M6 16C8 10 10 9 12 13C14 9 16 10 18 16C16 13 14 12 12 14.5C10 12 8 13 6 16Z"
      fill="#DC2626"
    />
  </svg>
);

// 17. Red Bull
export const BrandRedBull: Component<BrandIconProps> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    class={props.class || "w-4 h-4"}
    width={props.size}
    height={props.size}
    {...props}
  >
    <circle cx="12" cy="12" r="5" fill="#FBBF24" />
    <path d="M4 14C5 12 7 11 8.5 12C9.5 12.5 10.5 12 11 11.5C10 13 8.5 14 7 14.5C5.5 15 4.5 14.5 4 14Z" fill="#DC2626" />
    <path d="M20 14C19 12 17 11 15.5 12C14.5 12.5 13.5 12 13 11.5C14 13 15.5 14 17 14.5C18.5 15 19.5 14.5 20 14Z" fill="#DC2626" />
  </svg>
);

// 18. Generic / Dallara / Silhouette
export const BrandGenericRaceCar: Component<BrandIconProps> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    class={props.class || "w-4 h-4"}
    width={props.size}
    height={props.size}
    {...props}
  >
    <path d="M3 15L5 11L9 8H16L19 11L21 14V17H3V15Z" fill="currentColor" fill-opacity="0.15" />
    <circle cx="6.5" cy="16.5" r="2" fill="#111" />
    <circle cx="17.5" cy="16.5" r="2" fill="#111" />
    <path d="M9 8V11H15V8" stroke-linecap="round" />
  </svg>
);

// Brand Resolver Map
const brandComponentMap: Record<string, Component<BrandIconProps>> = {
  porsche: BrandPorsche,
  ferrari: BrandFerrari,
  bmw: BrandBMW,
  mercedes: BrandMercedes,
  amg: BrandMercedes,
  mclaren: BrandMcLaren,
  audi: BrandAudi,
  "aston martin": BrandAstonMartin,
  aston: BrandAstonMartin,
  lamborghini: BrandLamborghini,
  lambo: BrandLamborghini,
  corvette: BrandCorvette,
  chevrolet: BrandCorvette,
  chevy: BrandCorvette,
  ford: BrandFord,
  mustang: BrandFord,
  cadillac: BrandCadillac,
  acura: BrandAcura,
  toyota: BrandToyota,
  lexus: BrandToyota,
  honda: BrandHonda,
  hyundai: BrandHyundai,
  mazda: BrandMazda,
  "red bull": BrandRedBull,
  redbull: BrandRedBull,
};

export function getCarBrandIcon(brandName?: string): Component<BrandIconProps> {
  if (!brandName) return BrandGenericRaceCar;
  const key = brandName.trim().toLowerCase();
  
  // Direct match
  if (brandComponentMap[key]) {
    return brandComponentMap[key];
  }
  
  // Partial substring match (e.g. "Porsche 911 GT3 R" -> "porsche")
  for (const [nameKey, comp] of Object.entries(brandComponentMap)) {
    if (key.includes(nameKey)) {
      return comp;
    }
  }

  return BrandGenericRaceCar;
}

export const CarBrandIcon: Component<{ brand?: string; class?: string; size?: number }> = (props) => {
  const IconComp = () => getCarBrandIcon(props.brand);
  return <IconComp class={props.class} size={props.size} />;
};
