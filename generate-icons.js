const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// SVG content
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1D4ED8;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle with gradient -->
  <circle cx="128" cy="128" r="120" fill="url(#bgGradient)"/>
  
  <!-- Shadow effect -->
  <ellipse cx="128" cy="240" rx="80" ry="10" fill="#000000" opacity="0.2"/>
  
  <!-- Database layers -->
  <g transform="translate(128, 128)">
    <!-- Bottom layer (darkest) -->
    <ellipse cx="0" cy="55" rx="65" ry="18" fill="#1E3A8A"/>
    <path d="M -65 35 L -65 55 Q -65 73, 0 73 Q 65 73, 65 55 L 65 35" fill="#1E40AF"/>
    <ellipse cx="0" cy="35" rx="65" ry="18" fill="#3B82F6"/>
    
    <!-- Middle layer -->
    <ellipse cx="0" cy="0" rx="65" ry="18" fill="#1E3A8A"/>
    <path d="M -65 -20 L -65 0 Q -65 18, 0 18 Q 65 18, 65 0 L 65 -20" fill="#2563EB"/>
    <ellipse cx="0" cy="-20" rx="65" ry="18" fill="#60A5FA"/>
    
    <!-- Top layer (lightest) -->
    <ellipse cx="0" cy="-55" rx="65" ry="18" fill="#1E3A8A"/>
    <path d="M -65 -73 L -65 -55 Q -65 -37, 0 -37 Q 65 -37, 65 -55 L 65 -73" fill="#3B82F6"/>
    <ellipse cx="0" cy="-73" rx="65" ry="18" fill="#93C5FD"/>
    
    <!-- Highlight on top -->
    <ellipse cx="-15" cy="-75" rx="20" ry="5" fill="#FFFFFF" opacity="0.6"/>
    
    <!-- Alert indicator (red notification badge) -->
    <circle cx="55" cy="-80" r="15" fill="#DC2626"/>
    <circle cx="55" cy="-80" r="15" fill="none" stroke="#FFFFFF" stroke-width="2"/>
    <text x="55" y="-75" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">!</text>
  </g>
</svg>`;

// Create build directory if it doesn't exist
const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Generate PNG at different sizes for Windows ICO
async function generateIcons() {
  try {
    // Generate 256x256 PNG
    await sharp(Buffer.from(svgContent))
      .resize(256, 256)
      .png()
      .toFile(path.join(buildDir, 'icon-256.png'));
    
    console.log('✓ Generated icon-256.png');

    // Generate 128x128 PNG
    await sharp(Buffer.from(svgContent))
      .resize(128, 128)
      .png()
      .toFile(path.join(buildDir, 'icon-128.png'));
    
    console.log('✓ Generated icon-128.png');

    // Generate 64x64 PNG
    await sharp(Buffer.from(svgContent))
      .resize(64, 64)
      .png()
      .toFile(path.join(buildDir, 'icon-64.png'));
    
    console.log('✓ Generated icon-64.png');

    // Generate 32x32 PNG
    await sharp(Buffer.from(svgContent))
      .resize(32, 32)
      .png()
      .toFile(path.join(buildDir, 'icon-32.png'));
    
    console.log('✓ Generated icon-32.png');

    // Generate 16x16 PNG
    await sharp(Buffer.from(svgContent))
      .resize(16, 16)
      .png()
      .toFile(path.join(buildDir, 'icon-16.png'));
    
    console.log('✓ Generated icon-16.png');

    console.log('\n✅ All icons generated successfully!');
    console.log('Next: Use an online converter or tool to create .ico from these PNGs');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
