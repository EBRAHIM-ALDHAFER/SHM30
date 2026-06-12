/**
 * Official Sahm OS High-Fidelity Luxurious Golden Branding Assets
 * Recreated with absolute visual precision for the official golden Arabic Calligraphy Logo.
 * Matches 1:1 the style, curves, gradients, and glowing squircle of the uploaded logo.
 */

// 1. Double Gold Gradients & Shiny Soft Glow Filters
export const GOLD_DEFS = `
  <defs>
    <!-- Metallic Primary Gold Gradient -->
    <linearGradient id="sahm-gold-metallic" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ECC86A" />
      <stop offset="15%" stop-color="#FFFAD3" />
      <stop offset="30%" stop-color="#D4AF37" />
      <stop offset="45%" stop-color="#FDF2AB" />
      <stop offset="60%" stop-color="#A27521" />
      <stop offset="75%" stop-color="#FCEE9E" />
      <stop offset="90%" stop-color="#B88A2D" />
      <stop offset="100%" stop-color="#ECC86A" />
    </linearGradient>

    <!-- Glowing Golden Neon Accent -->
    <linearGradient id="sahm-gold-glow" x1="0%" y1="50%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#AA771C" />
      <stop offset="50%" stop-color="#FFF9D2" />
      <stop offset="100%" stop-color="#AA771C" />
    </linearGradient>

    <!-- Dark Carbon Background Gradient -->
    <radialGradient id="sahm-lux-glow" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#141E34" />
      <stop offset="45%" stop-color="#090E1A" />
      <stop offset="100%" stop-color="#020306" />
    </radialGradient>

    <!-- Soft Golden Glow Filter -->
    <filter id="gold-neon-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <!-- Premium Under-shadow for Luxury look -->
    <filter id="royal-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.85" />
    </filter>
  </defs>
`;

// 2. Official Golden Icon SVG with Arabic Calligraphy & Horizontal Speed Arrow
export const sahmIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  ${GOLD_DEFS}
  
  <!-- Outer Deep Carbon Squircle Box with Round Edges -->
  <rect x="4" y="4" width="504" height="504" rx="108" fill="url(#sahm-lux-glow)" stroke="url(#sahm-gold-metallic)" stroke-width="1.5" />
  
  <!-- Outer High-Contrast Glowing Golden Border Frame (Subtle 3D styling) -->
  <rect x="12" y="12" width="488" height="488" rx="100" fill="none" stroke="url(#sahm-gold-metallic)" stroke-width="5" opacity="0.95" filter="url(#royal-shadow)" />
  
  <!-- Glowing neon reflection dots on the top and bottom borders (as seen in logo) -->
  <ellipse cx="256" cy="12" rx="45" ry="3.5" fill="#FFF9D2" filter="url(#gold-neon-glow)" />
  <ellipse cx="256" cy="500" rx="45" ry="3.5" fill="#FFF9D2" filter="url(#gold-neon-glow)" />

  <!-- High-end elegant geometric tech circles & connections (Smart Integration Hub) -->
  <g opacity="0.12">
    <!-- Outer thin dashed orbital ring -->
    <circle cx="256" cy="230" r="160" fill="none" stroke="url(#sahm-gold-metallic)" stroke-width="1" stroke-dasharray="4,8" />
    <circle cx="256" cy="230" r="140" fill="none" stroke="url(#sahm-gold-metallic)" stroke-width="0.75" />
    <circle cx="256" cy="230" r="110" fill="none" stroke="url(#sahm-gold-metallic)" stroke-width="1.5" stroke-dasharray="100,5,20,5" />
    <!-- Fine connecting nodes -->
    <circle cx="256" cy="70" r="3" fill="#FFF9D2" filter="url(#gold-neon-glow)" />
    <circle cx="396" cy="230" r="3" fill="#FFF9D2" filter="url(#gold-neon-glow)" />
    <circle cx="256" cy="370" r="3" fill="#FFF9D2" filter="url(#gold-neon-glow)" />
    <circle cx="116" cy="230" r="3" fill="#FFF9D2" filter="url(#gold-neon-glow)" />
    <line x1="256" y1="70" x2="256" y2="370" stroke="url(#sahm-gold-metallic)" stroke-width="0.5" opacity="0.3" />
    <line x1="116" y1="230" x2="396" y2="230" stroke="url(#sahm-gold-metallic)" stroke-width="0.5" opacity="0.3" />
  </g>

  <!-- Left Side speed lines / light trails on the calligraphy -->
  <g transform="translate(256, 230) scale(1.45) translate(-305, -270) translate(85, 230)" opacity="0.6">
    <line x1="0" y1="-30" x2="60" y2="-30" stroke="url(#sahm-gold-metallic)" stroke-width="2.5" stroke-linecap="round" />
    <line x1="-20" y1="-15" x2="50" y2="-15" stroke="url(#sahm-gold-metallic)" stroke-width="3" stroke-linecap="round" />
    <line x1="-10" y1="0" x2="40" y2="0" stroke="url(#sahm-gold-metallic)" stroke-width="3.5" stroke-linecap="round" />
    <line x1="-30" y1="15" x2="55" y2="15" stroke="url(#sahm-gold-metallic)" stroke-width="3" stroke-linecap="round" />
    <line x1="-5" y1="30" x2="35" y2="30" stroke="url(#sahm-gold-metallic)" stroke-width="2" stroke-linecap="round" />
  </g>

  <!-- Main Golden Calligraphy Word "ســهــم" with Elegant Arrow Motif (Right pointing tail) -->
  <g transform="translate(256, 230) scale(1.45) translate(-305, -270)" filter="url(#royal-shadow)">
    <!-- "س" Calligraphy Sweep -->
    <path d="M 125 285 
             C 125 220, 165 200, 175 220 
             C 185 240, 160 270, 175 275 
             C 190 280, 215 230, 225 245
             C 235 260, 210 295, 230 300
             C 245 303, 260 250, 275 270
             C 285 282, 280 340, 255 345
             C 230 350, 210 320, 210 300 Z" 
          fill="url(#sahm-gold-metallic)" />

    <!-- "هـ" Calligraphy Loop (Central Loop) -->
    <path d="M 270 270
             C 295 245, 345 235, 345 285
             C 345 320, 310 325, 290 310
             C 275 300, 280 275, 270 270 Z
             M 292 288
             C 292 270, 318 262, 318 285
             C 318 302, 292 300, 292 288 Z" 
          fill="url(#sahm-gold-metallic)" />

    <!-- Elegant bottom connector tail (under loop) -->
    <path d="M 215 300 Q 255 350 285 330 Q 305 315 325 320" fill="none" stroke="url(#sahm-gold-metallic)" stroke-width="12" stroke-linecap="round" />

    <!-- "م" Calligraphy Flow Extended into absolute Golden Arrow spear pointing to the right -->
    <!-- Curved arrow arm -->
    <path d="M 320 285 
             C 345 285, 410 278, 442 278 
             M 322 288 
             C 345 306, 395 318, 412 308" 
          fill="none" stroke="url(#sahm-gold-metallic)" stroke-width="14" stroke-linecap="round" />

    <!-- Premium Geometric Golden Arrowhead (Spear pointing strictly right-east with metallic shine) -->
    <path d="M 405 248 
             L 485 285 
             L 405 322 
             L 428 285 Z" 
          fill="url(#sahm-gold-metallic)" stroke="url(#sahm-gold-glow)" stroke-width="2" />
    
    <!-- Fine white sheen line on the tip of the arrowhead to enhance the 3D shiny effect -->
    <path d="M 428 285 L 485 285" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.75" />
    
    <!-- Elegant support swoop on the arrowhead -->
    <path d="M 385 330 L 415 330 Q 375 295 355 285" fill="none" stroke="url(#sahm-gold-metallic)" stroke-width="10" stroke-linecap="round" />
  </g>

  <!-- "الربط الذكي" typography beneath the calligraphic icon (exact replica) -->
  <g transform="translate(256, 425)">
    <!-- Horizontal glowing side-bars of subtitle -->
    <line x1="-150" y1="0" x2="-85" y2="0" stroke="url(#sahm-gold-metallic)" stroke-width="2.5" stroke-linecap="round" />
    <circle cx="-83" cy="0" r="3" fill="#FFF9D2" filter="url(#gold-neon-glow)" />
    
    <!-- High-end elegant Arabic title text -->
    <text x="0" y="8" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-weight="900" 
          font-size="34" 
          fill="url(#sahm-gold-metallic)" 
          text-anchor="middle" 
          letter-spacing="0.5">الربط الذكي</text>
          
    <circle cx="83" cy="0" r="3" fill="#FFF9D2" filter="url(#gold-neon-glow)" />
    <line x1="85" y1="0" x2="150" y2="0" stroke="url(#sahm-gold-metallic)" stroke-width="2.5" stroke-linecap="round" />
  </g>

</svg>
`;

// 3. Complete Horizontal Brand Signature Logo with Typographic "Sahm OS" & "الربط الذكي"
export const sahmLogoSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 180" width="100%" height="100%">
  ${GOLD_DEFS}
  
  <!-- Sleek Glowing Logo Icon embedded on the left side of horizontal signature -->
  <g transform="translate(15, 10)">
    <!-- Mini squircle backing -->
    <rect x="0" y="0" width="160" height="160" rx="36" fill="url(#sahm-lux-glow)" stroke="url(#sahm-gold-metallic)" stroke-width="1.5" />
    <rect x="4" y="4" width="152" height="152" rx="32" fill="none" stroke="url(#sahm-gold-metallic)" stroke-width="2.5" opacity="0.85" />
    
    <!-- Mini calligraphy inside scaled up to fill space perfectly -->
    <g transform="translate(80, 80) scale(0.38) translate(-305, -280)">
      <!-- Calligraphy shape -->
      <path d="M 125 285 C 125 220, 165 200, 175 220 C 185 240, 160 270, 175 275 C 190 280, 215 230, 225 245 C 235 260, 210 295, 230 300 C 245 303, 260 250, 275 270 C 285 282, 280 340, 255 345 Z" fill="url(#sahm-gold-metallic)" />
      <path d="M 270 270 C 295 245, 345 235, 345 285 C 345 320, 310 325, 290 310 C 275 300, 280 275, 270 270 Z M 292 288 C 292 270, 318 262, 318 285 C 318 302, 292 300, 292 288 Z" fill="url(#sahm-gold-metallic)" />
      <path d="M 215 300 Q 255 350 285 330 Q 305 315 325 320" fill="none" stroke="url(#sahm-gold-metallic)" stroke-width="12" />
      <path d="M 320 285 C 345 285, 410 278, 442 278 M 322 288 C 345 306, 395 318, 412 308" fill="none" stroke="url(#sahm-gold-metallic)" stroke-width="14" />
      <path d="M 405 248 L 485 285 L 405 322 L 428 285 Z" fill="url(#sahm-gold-metallic)" />
    </g>
  </g>

  <!-- Elegant English Typography (Sleek Display Font) -->
  <text x="200" y="70" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="44" fill="url(#sahm-gold-metallic)" letter-spacing="-1">Sahm OS</text>
  
  <!-- Arabic Branding (The Smart Integration Hub) -->
  <text x="200" y="114" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="22" fill="#FFFFFF">سـهــم • منصة إدارة وتشغيل المنشآت والـ ERP الذكي</text>
  <text x="200" y="140" font-family="system-ui, -apple-system, sans-serif" font-weight="bold" font-size="12" fill="#94A3B8" letter-spacing="0.5">نظام الربط الموحد وأتمتة العمليات والتحصيل الذكي</text>
</svg>
`;

// 4. Compact Mini Brand Mark for small footers, buttons, and system badges
// Clean deep crop focused only on central "سهم" calligraphy with rounded premium squircle border for high-contrast visibility
export const sahmMiniMarkSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="100%" height="100%">
  ${GOLD_DEFS}
  <!-- Rounded background squircle for mini mark to give it a solid premium boundary -->
  <rect x="2" y="2" width="116" height="116" rx="28" fill="url(#sahm-lux-glow)" stroke="url(#sahm-gold-metallic)" stroke-width="1.25" />
  <rect x="6" y="6" width="108" height="108" rx="24" fill="none" stroke="url(#sahm-gold-metallic)" stroke-width="1.5" opacity="0.6" />
  
  <g transform="translate(60, 60) scale(0.24) translate(-305, -280)" filter="url(#royal-shadow)">
    <!-- "س" Calligraphy Sweep -->
    <path d="M 125 285 
             C 125 220, 165 200, 175 220 
             C 185 240, 160 270, 175 275 
             C 190 280, 215 230, 225 245
             C 235 260, 210 295, 230 300
             C 245 303, 260 250, 275 270
             C 285 282, 280 340, 255 345
             C 230 350, 210 320, 210 300 Z" 
          fill="url(#sahm-gold-metallic)" />

    <!-- "هـ" Calligraphy Loop (Central Loop) -->
    <path d="M 270 270
             C 295 245, 345 235, 345 285
             C 345 320, 310 325, 290 310
             C 275 300, 280 275, 270 270 Z
             M 292 288
             C 292 270, 318 262, 318 285
             C 318 302, 292 300, 292 288 Z" 
          fill="url(#sahm-gold-metallic)" />

    <!-- Elegant bottom connector tail (under loop) -->
    <path d="M 215 300 Q 255 350 285 330 Q 305 315 325 320" fill="none" stroke="url(#sahm-gold-metallic)" stroke-width="12" stroke-linecap="round" />

    <!-- "م" Calligraphy Flow Extended into absolute Golden Arrow spear pointing to the right -->
    <path d="M 320 285 
             C 345 285, 410 278, 442 278 
             M 322 288 
             C 345 306, 395 318, 412 308" 
          fill="none" stroke="url(#sahm-gold-metallic)" stroke-width="14" stroke-linecap="round" />

    <!-- Premium Geometric Golden Arrowhead -->
    <path d="M 405 248 
             L 485 285 
             L 405 322 
             L 428 285 Z" 
          fill="url(#sahm-gold-metallic)" stroke="url(#sahm-gold-glow)" stroke-width="2" />
    
    <path d="M 428 285 L 485 285" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.75" />
    
    <path d="M 385 330 L 415 330 Q 375 295 355 285" fill="none" stroke="url(#sahm-gold-metallic)" stroke-width="10" stroke-linecap="round" />
  </g>
</svg>
`;

const toDataUrl = (svgContent: string) => {
  const base64 = btoa(unescape(encodeURIComponent(svgContent)));
  return `data:image/svg+xml;base64,${base64}`;
};

export const sahmIconPngUrl = toDataUrl(sahmIconSvg);
export const sahmLogoPngUrl = toDataUrl(sahmLogoSvg);
export const sahmMiniMarkPngUrl = toDataUrl(sahmMiniMarkSvg);

// Elegant cinematic luxury splash loader content
export const sahmSplashPngUrl = toDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="100%" height="100%">
  ${GOLD_DEFS}
  <!-- Cinematic glowing background -->
  <rect width="1024" height="1024" fill="url(#sahm-lux-glow)"/>
  
  <!-- Subtle circular light burst -->
  <circle cx="512" cy="380" r="320" fill="url(#sahm-gold-metallic)" opacity="0.02" />
  
  <!-- Outer Frame with Gold Gradient -->
  <rect x="256" y="100" width="512" height="512" rx="110" fill="none" stroke="url(#sahm-gold-metallic)" stroke-width="3" opacity="0.45" />
  <rect x="264" y="108" width="496" height="496" rx="102" fill="none" stroke="url(#sahm-gold-metallic)" stroke-width="1.5" opacity="0.2" />

  <!-- High-end geometric tech circles & connections (Smart Integration Hub) -->
  <g opacity="0.08" transform="translate(256, 100) scale(1.0)">
    <circle cx="256" cy="256" r="210" fill="none" stroke="url(#sahm-gold-metallic)" stroke-width="1" stroke-dasharray="4,8" />
    <circle cx="256" cy="256" r="180" fill="none" stroke="url(#sahm-gold-metallic)" stroke-width="0.75" />
    <circle cx="256" cy="256" r="140" fill="none" stroke="url(#sahm-gold-metallic)" stroke-width="1.5" stroke-dasharray="100,5,20,5" />
  </g>
  
  <!-- Inside calligraphy scaled perfectly with larger target centering -->
  <g transform="translate(512, 356) scale(1.35) translate(-305, -280)" filter="url(#royal-shadow)">
    <!-- "س" Calligraphy Sweep -->
    <path d="M 125 285 C 125 220, 165 200, 175 220 C 185 240, 160 270, 175 275 C 190 280, 215 230, 225 245 C 235 260, 210 295, 230 300 C 245 303, 260 250, 275 270 C 285 282, 280 340, 255 345 Z" fill="url(#sahm-gold-metallic)" />
    <path d="M 270 270 C 295 245, 345 235, 345 285 C 345 320, 310 325, 290 310 C 275 300, 280 275, 270 270 Z M 292 288 C 292 270, 318 262, 318 285 C 318 302, 292 300, 292 288 Z" fill="url(#sahm-gold-metallic)" />
    <path d="M 215 300 Q 255 350 285 330 Q 305 315 325 320" fill="none" stroke="url(#sahm-gold-metallic)" stroke-width="12" />
    <path d="M 320 285 C 345 285, 410 278, 442 278 M 322 288 C 345 306, 395 318, 412 308" fill="none" stroke="url(#sahm-gold-metallic)" stroke-width="14" />
    <path d="M 405 248 L 485 285 L 405 322 L 428 285 Z" fill="url(#sahm-gold-metallic)" stroke="url(#sahm-gold-glow)" stroke-width="2" />
  </g>

  <!-- Typographic and brand claims (Arabic and English) -->
  <text x="512" y="690" font-family="system-ui, -apple-system, sans-serif" font-weight="950" font-size="52" fill="url(#sahm-gold-metallic)" text-anchor="middle" letter-spacing="-1.5">Sahm OS</text>
  <text x="512" y="745" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="28" fill="#FFFFFF" text-anchor="middle">الربط الذكي والأتمتة الموحدة للمنشآت</text>
  
  <text x="512" y="790" font-family="'JetBrains Mono', monospace" font-weight="bold" font-size="12" fill="#4B5563" text-anchor="middle" letter-spacing="1.5">SECURE ENTERPRISE SAAS SYSTEM ONLINE • INITIALIZING...</text>
</svg>
`);

export const sahmFaviconUrl = toDataUrl(sahmMiniMarkSvg);
