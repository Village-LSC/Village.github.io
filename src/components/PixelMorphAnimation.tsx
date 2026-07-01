import React, { useEffect, useRef, useState } from 'react';

// 4x4 Bayer Dither Matrix for retro grayscale transitions
const bayerMatrix4x4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5]
];

interface PixelMorphProps {
  catId?: string;
  className?: string;
}

export function PixelMorphAnimation({ catId = '1', className }: PixelMorphProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [images, setImages] = useState<HTMLCanvasElement[]>([]);

  useEffect(() => {
    let active = true;

    // Load custom image and center/render inside a 128x128 buffer at 1:1 resolution (padded)
    const loadImageOnly = (src: string): Promise<HTMLCanvasElement | null> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
          if (!active) return resolve(null);
          
          const canvas = document.createElement('canvas');
          canvas.width = 128;
          canvas.height = 128;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) {
            resolve(null);
            return;
          }
          
          ctx.imageSmoothingEnabled = false;
          
          try {
            const origW = img.width || 128;
            const origH = img.height || 128;
            
            // "не во всю рамку а чуть уменьшены чтобы не касались краёв рамки"
            // Ensure maximum size inside the 128x128 frame is 118px so it is larger but never touches the borders
            const maxDim = 118;
            let drawW = origW;
            let drawH = origH;
            
            // "чтобы картинки не расширялись а были в исходном разрешении"
            // If the image fits in 118x118, draw 1:1 original size. Otherwise scale down proportionally.
            if (origW > maxDim || origH > maxDim) {
              const scale = Math.min(maxDim / origW, maxDim / origH);
              drawW = Math.round(origW * scale);
              drawH = Math.round(origH * scale);
            }
            
            const dx = Math.round((128 - drawW) / 2);
            const dy = Math.round((128 - drawH) / 2);
            
            ctx.drawImage(img, dx, dy, drawW, drawH);
            
            // Verify if image actually loaded content (not blank)
            const imgData = ctx.getImageData(0, 0, 128, 128);
            let hasContent = false;
            for (let i = 3; i < imgData.data.length; i += 4) {
              if (imgData.data[i] > 10) {
                hasContent = true;
                break;
              }
            }
            
            if (hasContent) {
              resolve(canvas);
            } else {
              resolve(null);
            }
          } catch (e) {
            resolve(null);
          }
        };

        img.onerror = () => {
          resolve(null);
        };

        img.src = src;
      });
    };

    // Determine target files based on category selection
    let sources: string[] = [];
    if (catId === '2') {
      sources = ['/src/assets/images/model_p1.png', '/src/assets/images/model_p2.png'];
    } else if (catId === '7') {
      sources = ['/src/assets/images/skin_p1.png', '/src/assets/images/skin_p2.png'];
    } else if (catId === '3') {
      sources = [
        '/src/assets/images/pricelist_uib1.png',
        '/src/assets/images/pricelist_uib2.png',
        '/src/assets/images/pricelist_uib3.png',
        '/src/assets/images/pricelist_uib4.png'
      ];
    } else if (catId === '4') {
      sources = [
        '/src/assets/images/pricelist_uim1.png',
        '/src/assets/images/pricelist_uim2.png',
        '/src/assets/images/pricelist_uim3.png'
      ];
    } else if (catId === '5') {
      sources = ['/src/assets/images/pricelist_uih1.png', '/src/assets/images/pricelist_uih2.png'];
    } else if (catId === '6') {
      sources = ['/src/assets/images/pricelist_p1.png', '/src/assets/images/pricelist_p2.png'];
    } else {
      sources = ['/src/assets/images/cat1.png', '/src/assets/images/cat2.png', '/src/assets/images/cat3.png'];
    }

    const loadAll = sources.map((src) => loadImageOnly(src));

    Promise.all(loadAll).then((loadedCanvases) => {
      if (active) {
        // Only keep successfully loaded non-empty images
        const validImages = loadedCanvases.filter((c): c is HTMLCanvasElement => c !== null);
        setImages(validImages);
      }
    });

    return () => {
      active = false;
    };
  }, [catId]);

  useEffect(() => {
    if (images.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const startTime = performance.now();

    const buffer1 = document.createElement('canvas');
    buffer1.width = 128;
    buffer1.height = 128;
    const bCtx1 = buffer1.getContext('2d', { willReadFrequently: true });

    const buffer2 = document.createElement('canvas');
    buffer2.width = 128;
    buffer2.height = 128;
    const bCtx2 = buffer2.getContext('2d', { willReadFrequently: true });

    if (!bCtx1 || !bCtx2) return;

    const drawWarped = (
      srcCanvas: HTMLCanvasElement, 
      destCtx: CanvasRenderingContext2D, 
      intensity: number, 
      now: number,
      floatOffset: number
    ) => {
      destCtx.clearRect(0, 0, 128, 128);
      destCtx.imageSmoothingEnabled = false;

      for (let y = 0; y < 128; y++) {
        const waveX = Math.sin(y * 0.08 + now * 0.01) * intensity * 12;
        destCtx.drawImage(
          srcCanvas,
          0, y, 128, 1,
          waveX, y + floatOffset, 128, 1
        );
      }
    };

    const applyWhiteFlashFilter = (destCtx: CanvasRenderingContext2D, factor: number, forceWhite = false) => {
      if (factor <= 0 && !forceWhite) return;
      const imgData = destCtx.getImageData(0, 0, 128, 128);
      const data = imgData.data;

      for (let y = 0; y < 128; y++) {
        for (let x = 0; x < 128; x++) {
          const idx = (y * 128 + x) * 4;
          const a = data[idx + 3];
          if (a > 20) {
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;
            const threshold = bayerMatrix4x4[y % 4][x % 4] * 16;
            
            let targetR = 140;
            let targetG = 140;
            let targetB = 140;

            if (lum > 110 || threshold < 110) {
              targetR = 255;
              targetG = 255;
              targetB = 255;
            }

            if (forceWhite) {
              targetR = 255;
              targetG = 255;
              targetB = 255;
            }

            data[idx] = Math.round(r + (targetR - r) * factor);
            data[idx + 1] = Math.round(g + (targetG - g) * factor);
            data[idx + 2] = Math.round(b + (targetB - b) * factor);
          }
        }
      }
      destCtx.putImageData(imgData, 0, 0);
    };

    const sparks: { x: number; y: number; vx: number; vy: number; life: number; size: number }[] = [];

    const updateAndDrawSparks = (destCtx: CanvasRenderingContext2D, shouldEmit: boolean) => {
      // Emit sparks near the center where the morphed character lives
      if (shouldEmit && Math.random() < 0.35) {
        sparks.push({
          x: 40 + Math.random() * 48,
          y: 40 + Math.random() * 48,
          vx: (Math.random() - 0.5) * 3.5,
          vy: (Math.random() - 0.5) * 3.5 - 1.2,
          life: 1.0,
          size: Math.random() * 2.5 + 1.2
        });
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 0.045;

        // Keep bounds strictly inside the 128x128 canvas
        if (s.life <= 0 || s.x < 3 || s.x > 125 || s.y < 3 || s.y > 125) {
          sparks.splice(i, 1);
          continue;
        }

        destCtx.fillStyle = `rgba(255, 255, 255, ${s.life})`;
        destCtx.fillRect(Math.round(s.x), Math.round(s.y), Math.round(s.size), Math.round(s.size));
      }
    };

    const render = (now: number) => {
      ctx.clearRect(0, 0, 128, 128);
      ctx.imageSmoothingEnabled = false;

      const elapsed = now - startTime;
      const cycleDuration = 5000;
      const timeInCycle = elapsed % cycleDuration;

      const currentIdx = Math.floor((elapsed / cycleDuration) % images.length);
      const nextIdx = (currentIdx + 1) % images.length;

      const currentImg = images[currentIdx];
      const nextImg = images[nextIdx];

      if (!currentImg || !nextImg || !(currentImg instanceof HTMLCanvasElement) || !(nextImg instanceof HTMLCanvasElement)) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const floatOffset = Math.sin(timeInCycle * 0.0018) * 3.0;
      let isTransitioning = false;

      // Handle single image case dynamically to avoid redundant transitions
      if (images.length === 1) {
        drawWarped(currentImg, bCtx1, 0, now, floatOffset);
        ctx.drawImage(buffer1, 0, 0);
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      if (timeInCycle < 3800) {
        drawWarped(currentImg, bCtx1, 0, now, floatOffset);
        ctx.drawImage(buffer1, 0, 0);

      } else if (timeInCycle >= 3800 && timeInCycle < 4100) {
        const progress = (timeInCycle - 3800) / 300; 
        isTransitioning = true;
        
        drawWarped(currentImg, bCtx1, progress * 0.7, now, floatOffset);
        applyWhiteFlashFilter(bCtx1, progress);
        ctx.drawImage(buffer1, 0, 0);

      } else if (timeInCycle >= 4100 && timeInCycle < 4600) {
        const progress = (timeInCycle - 4100) / 500; 
        isTransitioning = true;
        
        drawWarped(currentImg, bCtx1, (1 - progress) * 0.7, now, 0);
        applyWhiteFlashFilter(bCtx1, 1, true);

        drawWarped(nextImg, bCtx2, progress * 0.7, now, 0);
        applyWhiteFlashFilter(bCtx2, 1, true);

        const imgData1 = bCtx1.getImageData(0, 0, 128, 128);
        const imgData2 = bCtx2.getImageData(0, 0, 128, 128);
        const data1 = imgData1.data;
        const data2 = imgData2.data;

        for (let y = 0; y < 128; y++) {
          for (let x = 0; x < 128; x++) {
            const idx = (y * 128 + x) * 4;
            const threshold = bayerMatrix4x4[y % 4][x % 4] / 16;
            if (progress >= threshold) {
              data1[idx] = data2[idx];
              data1[idx + 1] = data2[idx + 1];
              data1[idx + 2] = data2[idx + 2];
              data1[idx + 3] = data2[idx + 3];
            }
          }
        }
        bCtx1.putImageData(imgData1, 0, 0);
        ctx.drawImage(buffer1, 0, 0);

      } else {
        const progress = (timeInCycle - 4600) / 400; 
        
        drawWarped(nextImg, bCtx1, 0, now, floatOffset);
        applyWhiteFlashFilter(bCtx1, 1 - progress);
        ctx.drawImage(buffer1, 0, 0);
      }

      updateAndDrawSparks(ctx, isTransitioning);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [images]);

  if (images.length === 0) {
    let fileList = '';
    if (catId === '2') {
      fileList = 'model_p1.png, model_p2.png';
    } else if (catId === '7') {
      fileList = 'skin_p1.png, skin_p2.png';
    } else if (catId === '3') {
      fileList = 'pricelist_uib1.png, pricelist_uib2.png...';
    } else if (catId === '4') {
      fileList = 'pricelist_uim1.png, pricelist_uim2.png...';
    } else if (catId === '5') {
      fileList = 'pricelist_uih1.png, pricelist_uih2.png';
    } else if (catId === '6') {
      fileList = 'pricelist_p1.png, pricelist_p2.png';
    } else {
      fileList = 'cat1.png, cat2.png, cat3.png';
    }
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black/40 text-center select-none">
        <span className="text-white/60 font-mono text-xs tracking-tight uppercase mb-1">Ожидание картинок</span>
        <span className="text-white/40 font-mono text-[10px] tracking-wider font-light">{fileList}</span>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={128}
      height={128}
      className={`w-full h-full object-contain ${className}`}
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
