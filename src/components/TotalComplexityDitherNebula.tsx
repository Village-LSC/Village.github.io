import React, { useEffect, useRef } from 'react';

interface TotalComplexityDitherNebulaProps {
  complexity: number;
}

interface CanvasParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  alpha: number;
}

export function TotalComplexityDitherNebula({ complexity }: TotalComplexityDitherNebulaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Store complexity in a ref so the render loop can access the latest value
  // without resetting the continuous canvas animation state (wave position, particles, etc.)
  const complexityRef = useRef(complexity);
  
  useEffect(() => {
    complexityRef.current = complexity;
  }, [complexity]);

  // Helper to interpolate between RGB colors for the dither border
  const getInterpolatedColor = (val: number) => {
    const points = [
      { comp: 0, r: 16, g: 185, b: 129 }, // Emerald
      { comp: 22, r: 6, g: 182, b: 212 }, // Cyan
      { comp: 40, r: 245, g: 158, b: 11 }, // Amber
      { comp: 65, r: 217, g: 70, b: 239 }, // Fuchsia
      { comp: 90, r: 139, g: 92, b: 246 }, // Violet
      { comp: 110, r: 239, g: 68, b: 68 }, // Red
    ];

    const cVal = Math.max(0, Math.min(110, val));

    let p1 = points[0];
    let p2 = points[points.length - 1];

    for (let i = 0; i < points.length - 1; i++) {
      if (cVal >= points[i].comp && cVal <= points[i + 1].comp) {
        p1 = points[i];
        p2 = points[i + 1];
        break;
      }
    }

    const range = p2.comp - p1.comp;
    const factor = range === 0 ? 0 : (cVal - p1.comp) / range;

    const r = Math.round(p1.r + (p2.r - p1.r) * factor);
    const g = Math.round(p1.g + (p2.g - p1.g) * factor);
    const b = Math.round(p1.b + (p2.b - p1.b) * factor);

    return { r, g, b };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const PIXEL_SCALE = 4;

    let width = 0;
    let height = 0;

    const handleResize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        width = Math.max(1, Math.ceil(rect.width / PIXEL_SCALE));
        height = Math.max(1, Math.ceil(rect.height / PIXEL_SCALE));
        canvas.width = width;
        canvas.height = height;
      }
    };
    handleResize();

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const BAYER_4X4 = [
      [0,  8,  2,  10],
      [12, 4,  14, 6],
      [3,  11, 1,  9],
      [15, 7,  13, 5]
    ];

    let time = 0;
    // Set an initial wave position at the right edge
    let currentWaveX = width || 100;
    const particles: CanvasParticle[] = [];

    const render = () => {
      if (!canvas || !ctx || width <= 0 || height <= 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      
      // Extremely smooth, gentle time step
      time += 0.01;

      // Access the live value without tearing down/resetting the canvas state
      const liveComplexity = complexityRef.current;

      // Target wave X position based on current complexity
      const targetX = liveComplexity > 100 
        ? -15 
        : width * (1 - Math.min(1, liveComplexity / 100));
      
      // Calm, elegant easing coefficient
      currentWaveX += (targetX - currentWaveX) * 0.035;

      const imgData = ctx.createImageData(width, height);
      const data = imgData.data;

      const colorSet = getInterpolatedColor(liveComplexity);
      const waveAmplitude = 1.8;

      // Outer color components
      const voidR = 2;
      const voidG = 1;
      const voidB = 3;
      
      // Width of the dither transition zone
      const ditherBandWidth = 14;

      for (let y = 0; y < height; y++) {
        // Soft wave formula
        const wave1 = currentWaveX + Math.sin(y * 0.14 + time * 0.6) * waveAmplitude + Math.cos(y * 0.08 - time * 0.4) * (waveAmplitude * 0.5);
        const wave2 = wave1 + ditherBandWidth;

        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const threshold = BAYER_4X4[y % 4][x % 4] / 16;

          let r = 0, g = 0, b = 0, a = 0;

          if (x >= wave2) {
            // Inside the nebula: Let's apply a soft dithered void texture instead of solid color
            // This is "внутри чёрная" but with a subtle dither pattern for beautiful cosmic depth
            const innerNoise = (Math.sin(x * 0.2 + y * 0.2 + time * 0.15) + 1.0) * 0.5;
            
            // Adjust transparency slightly based on noise + dither matrix
            const innerAlpha = innerNoise > threshold ? 85 : 55;
            
            r = voidR;
            g = voidG;
            b = voidB;
            a = innerAlpha;
          } else if (x >= wave1) {
            // Wide dither transition zone
            const distFactor = (x - wave1) / ditherBandWidth;
            if (distFactor > threshold) {
              const colorAlpha = Math.floor(95 * distFactor);
              r = colorSet.r;
              g = colorSet.g;
              b = colorSet.b;
              a = colorAlpha;
            }
          }

          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = a;
        }
      }

      // ----------------------------------------------------
      // Refined Particle System (Slow drift, gradual fade-in/out)
      // ----------------------------------------------------
      // Lower spawn probability for high composure and less clutter
      if (Math.random() < 0.06 && particles.length < 15) {
        const spawnY = Math.random() * height;
        const waveEdgeX = currentWaveX + Math.sin(spawnY * 0.14 + time * 0.6) * waveAmplitude;
        
        particles.push({
          x: waveEdgeX + (Math.random() * 6 - 3),
          y: spawnY,
          vx: -(0.12 + Math.random() * 0.25), // Very slow drift to the left
          vy: (Math.random() * 0.1 - 0.05),   // Barely perceptible vertical drift
          life: 0,
          maxLife: 80 + Math.floor(Math.random() * 80), // Longer lifetime for peaceful motion
          size: Math.random() > 0.85 ? 2 : 1,
          alpha: 0 // Start at 0 for smooth fade-in
        });
      }

      // Update and draw particles directly into image buffer
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        p.x += p.vx;
        p.y += p.vy;

        // Smoothly fade-in for the first 20% of life, then fade-out to end
        const lifeRatio = p.life / p.maxLife;
        if (lifeRatio < 0.2) {
          p.alpha = lifeRatio / 0.2;
        } else {
          p.alpha = Math.max(0, 1 - (lifeRatio - 0.2) / 0.8);
        }

        if (p.life >= p.maxLife || p.x < 0 || p.y < 0 || p.y >= height) {
          particles.splice(i, 1);
          continue;
        }

        const px = Math.floor(p.x);
        const py = Math.floor(p.y);

        if (px >= 0 && px < width && py >= 0 && py < height) {
          for (let dy = 0; dy < p.size; dy++) {
            for (let dx = 0; dx < p.size; dx++) {
              const cx = px + dx;
              const cy = py + dy;
              if (cx >= 0 && cx < width && cy >= 0 && cy < height) {
                const idx = (cy * width + cx) * 4;
                
                // Merge particles elegantly using color alpha values
                const targetAlpha = Math.floor(140 * p.alpha);
                data[idx] = Math.floor((data[idx] * (255 - targetAlpha) + colorSet.r * targetAlpha) / 255);
                data[idx + 1] = Math.floor((data[idx + 1] * (255 - targetAlpha) + colorSet.g * targetAlpha) / 255);
                data[idx + 2] = Math.floor((data[idx + 2] * (255 - targetAlpha) + colorSet.b * targetAlpha) / 255);
                data[idx + 3] = Math.max(data[idx + 3], targetAlpha);
              }
            }
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, []); // Run on mount once!

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl z-0"
      style={{
        imageRendering: 'pixelated',
      }}
    />
  );
}
