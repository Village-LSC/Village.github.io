import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, X } from 'lucide-react';

interface CanvasSizePreviewProps {
  width: number;
  height: number;
  lang: 'ru' | 'en';
}

export function CanvasSizePreview({ width, height, lang }: CanvasSizePreviewProps) {
  const [zoom, setZoom] = useState(1.0); // 0.5 to 5.0
  const [resetKey, setResetKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal zoom and reset states
  const [modalZoom, setModalZoom] = useState(2.0); // bigger default for closeup
  const [modalResetKey, setModalResetKey] = useState(0);

  // Ensure valid size bounds for drawing calculations
  const safeW = Math.max(1, width);
  const safeH = Math.max(1, height);
  const aspectRatio = safeW / safeH;

  // Container dimensions
  const containerHeight = 130;
  const maxContainerW = 280;
  const maxContainerH = containerHeight - 16; // some padding space

  // Base optimal fit dimensions for widget
  let baseW = maxContainerW;
  let baseH = baseW / aspectRatio;

  if (baseH > maxContainerH) {
    baseH = maxContainerH;
    baseW = baseH * aspectRatio;
  }

  // Apply zoom factor
  const drawW = Math.round(baseW * zoom);
  const drawH = Math.round(baseH * zoom);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(5.0, Number((prev + 0.5).toFixed(1))));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(0.5, Number((prev - 0.5).toFixed(1))));
  };

  const handleReset = () => {
    setZoom(1.0);
    setResetKey(prev => prev + 1);
  };

  // Base optimal fit dimensions for big modal
  const modalContainerW = 500;
  const modalContainerH = 350;

  let modalBaseW = modalContainerW;
  let modalBaseH = modalBaseW / aspectRatio;

  if (modalBaseH > modalContainerH) {
    modalBaseH = modalContainerH;
    modalBaseW = modalBaseH * aspectRatio;
  }

  const modalDrawW = Math.round(modalBaseW * modalZoom);
  const modalDrawH = Math.round(modalBaseH * modalZoom);

  const handleModalZoomIn = () => {
    setModalZoom(prev => Math.min(10.0, Number((prev + 0.5).toFixed(1))));
  };

  const handleModalZoomOut = () => {
    setModalZoom(prev => Math.max(0.5, Number((prev - 0.5).toFixed(1))));
  };

  const handleModalReset = () => {
    setModalZoom(2.0);
    setModalResetKey(prev => prev + 1);
  };

  const touchStartDistRef = useRef<number | null>(null);
  const touchStartZoomRef = useRef<number>(2.0);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartDistRef.current = Math.sqrt(dx * dx + dy * dy);
      touchStartZoomRef.current = modalZoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ratio = dist / touchStartDistRef.current;
      const nextZoom = Math.min(10.0, Math.max(0.5, Number((touchStartZoomRef.current * ratio).toFixed(1))));
      setModalZoom(nextZoom);
    }
  };

  const handleTouchEnd = () => {
    touchStartDistRef.current = null;
  };

  const containerRef = useRef<HTMLDivElement | null>(null);
  const modalContainerRef = useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  React.useEffect(() => {
    if (!isModalOpen) return;

    const preventDefaultWheel = (e: WheelEvent) => {
      // Always prevent default scroll behavior inside/around the modal to disable background page scroll entirely
      e.preventDefault();

      // Only zoom if hovering directly over the canvas box inside the modal
      const canvasBox = document.getElementById('modal-canvas-box');
      if (canvasBox) {
        const isOverCanvas = canvasBox === e.target || canvasBox.contains(e.target as Node);
        if (isOverCanvas) {
          const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
          setModalZoom(prev => Math.min(10.0, Math.max(0.5, Number((prev * zoomFactor).toFixed(1)))));
        }
      }
    };

    window.addEventListener('wheel', preventDefaultWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', preventDefaultWheel);
    };
  }, [isModalOpen]);

  return (
    <div className="mt-3.5 bg-[#12051d]/40 rounded-xl p-3 border border-[#3d1a56]/80 flex flex-col items-center">
      
      {/* Header with Title and Control Buttons */}
      <div className="w-full flex items-center justify-between mb-2 font-mono">
        <div className="text-xs font-bold text-[#ebd6f7]/70 uppercase tracking-wider flex items-center gap-1.5 select-none">
          <span className="inline-block w-1.5 h-1.5 bg-purple-400 rounded-sm"></span>
          <span>{lang === 'ru' ? 'Масштаб холста' : 'Canvas Proportions'}</span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {/* Reset position & zoom */}
          <button
            type="button"
            onClick={handleReset}
            className="p-1 rounded bg-[#0c0314] border border-purple-500/20 text-purple-300 hover:text-white hover:border-purple-400 transition-all active:scale-90 cursor-pointer"
            title={lang === 'ru' ? 'Сбросить позицию и зум' : 'Reset position & zoom'}
          >
            <RotateCcw size={11} className="stroke-[2.5]" />
          </button>

          {/* Zoom Out */}
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className="p-1 rounded bg-[#0c0314] border border-purple-500/20 text-purple-300 hover:text-white hover:border-purple-400 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-90 cursor-pointer"
            title={lang === 'ru' ? 'Уменьшить' : 'Zoom Out'}
          >
            <ZoomOut size={11} className="stroke-[2.5]" />
          </button>

          {/* Zoom Label */}
          <span className="px-1.5 py-0.5 rounded bg-[#0c0314] border border-purple-500/10 text-xs font-bold text-purple-300 select-none">
            {Math.round(zoom * 100)}%
          </span>

          {/* Zoom In */}
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= 5.0}
            className="p-1 rounded bg-[#0c0314] border border-purple-500/20 text-purple-300 hover:text-white hover:border-purple-400 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-90 cursor-pointer"
            title={lang === 'ru' ? 'Увеличить' : 'Zoom In'}
          >
            <ZoomIn size={11} className="stroke-[2.5]" />
          </button>

          {/* Full Screen closeup modal */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="ml-1 p-1 rounded bg-[#0c0314] border border-purple-500/20 text-purple-300 hover:text-white hover:border-purple-400 transition-all active:scale-90 cursor-pointer"
            title={lang === 'ru' ? 'Детальный просмотр холста' : 'Detailed closeup preview'}
          >
            <Maximize2 size={11} className="stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Checkered dynamic grid container with scrollable viewport if zoomed */}
      <div 
        ref={containerRef}
        style={{ height: containerHeight }}
        className="w-full bg-[#0c0314] rounded-lg border border-[#3d1a56]/50 flex items-center justify-center relative overflow-hidden p-2"
      >
        {/* Fine dark blueprint grid overlay in background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] [background-size:8px_8px] pointer-events-none"></div>

        {/* Checkered Canvas Box */}
        <motion.div
          key={resetKey}
          drag
          dragConstraints={containerRef}
          dragElastic={0.2}
          dragMomentum={true}
          layout
          animate={{ width: drawW, height: drawH }}
          transition={{ type: 'spring', stiffness: 150, damping: 20 }}
          className="relative rounded border-2 border-purple-500/40 shadow-[0_0_15px_rgba(139,92,246,0.15)] shrink-0 flex items-center justify-center select-none cursor-grab active:cursor-grabbing"
          style={{
            backgroundImage: `conic-gradient(from 0deg, #12051d 0.25turn, #200833 0.25turn 0.5turn, #12051d 0.5turn 0.75turn, #200833 0.75turn)`,
            backgroundSize: `${200 / safeW}% ${200 / safeH}%`,
            imageRendering: 'pixelated'
          }}
        />
      </div>

      {/* Subtitle / Stats - Canvas resolution dimension at the bottom behind the grid */}
      <div className="mt-1.5 w-full flex justify-between items-center text-xs font-mono text-purple-400/80 select-none">
        <span>
          {lang === 'ru' 
            ? `Масштаб: ${Math.round(zoom * 100)}% | Размер: ${safeW}×${safeH} px` 
            : `Scale: ${Math.round(zoom * 100)}% | Size: ${safeW}×${safeH} px`}
        </span>
        <span>Ratio: {aspectRatio.toFixed(2)}:1</span>
      </div>

      {/* Portal/Modalcloseup View */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl bg-[#12051d] border border-purple-500/30 rounded-2xl overflow-hidden flex flex-col shadow-[0_0_50px_rgba(139,92,246,0.3)] font-mono text-[#ebd6f7]"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-[#3d1a56]/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#0c0314]">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 bg-purple-500 rounded-sm animate-pulse"></span>
                    {lang === 'ru' ? 'Детальный предпросмотр холста' : 'Canvas Closeup Preview'}
                  </h3>
                  <p className="text-xs text-purple-300 mt-0.5">
                    {lang === 'ru' 
                      ? 'Оцените габариты пиксель-арта на максимальном масштабе. Тяните холст за ЛКМ.' 
                      : 'Examine the pixel art proportions at maximum scale. Drag canvas with mouse.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {/* Reset action */}
                  <button
                    type="button"
                    onClick={handleModalReset}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#12051d] border border-purple-500/20 hover:border-purple-400 rounded-lg text-xs font-bold text-purple-300 hover:text-white transition-all active:scale-95 cursor-pointer"
                    title={lang === 'ru' ? 'Сбросить позицию и зум' : 'Reset position & zoom'}
                  >
                    <RotateCcw size={12} className="stroke-[2.5]" />
                    <span>{lang === 'ru' ? 'Сбросить' : 'Reset'}</span>
                  </button>

                  {/* Zoom Out */}
                  <button
                    type="button"
                    onClick={handleModalZoomOut}
                    disabled={modalZoom <= 0.5}
                    className="p-1.5 rounded-lg bg-[#12051d] border border-purple-500/20 text-purple-300 hover:text-white hover:border-purple-400 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 cursor-pointer"
                  >
                    <ZoomOut size={13} className="stroke-[2.5]" />
                  </button>

                  {/* Scale indicator badge */}
                  <span className="px-2 py-1 bg-black rounded-lg border border-purple-500/20 text-xs font-bold text-purple-300 select-none">
                    {Math.round(modalZoom * 100)}%
                  </span>

                  {/* Zoom In */}
                  <button
                    type="button"
                    onClick={handleModalZoomIn}
                    disabled={modalZoom >= 10.0}
                    className="p-1.5 rounded-lg bg-[#12051d] border border-purple-500/20 text-purple-300 hover:text-white hover:border-purple-400 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 cursor-pointer"
                  >
                    <ZoomIn size={13} className="stroke-[2.5]" />
                  </button>

                  <div className="w-px h-6 bg-purple-500/20 mx-1"></div>

                  {/* Close modal */}
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 rounded-lg bg-[#3d1a56]/40 hover:bg-red-950/40 text-purple-300 hover:text-red-400 border border-purple-500/20 hover:border-red-500/30 transition-all active:scale-95 cursor-pointer"
                  >
                    <X size={14} className="stroke-[3]" />
                  </button>
                </div>
              </div>

              {/* Huge Canvas Viewport container */}
              <div 
                ref={modalContainerRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="w-full h-[60vh] bg-[#05010a] relative overflow-hidden flex items-center justify-center p-8 touch-none"
              >
                {/* Tech blue-grid background pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.04)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

                {/* Big Draggable Checkered Canvas */}
                <motion.div
                  id="modal-canvas-box"
                  key={modalResetKey}
                  drag
                  dragConstraints={modalContainerRef}
                  dragElastic={0.15}
                  dragMomentum={true}
                  layout
                  animate={{ width: modalDrawW, height: modalDrawH }}
                  transition={{ type: 'spring', stiffness: 180, damping: 25 }}
                  className="relative rounded-lg border-2 border-purple-500/60 shadow-[0_0_35px_rgba(139,92,246,0.25)] flex items-center justify-center select-none cursor-grab active:cursor-grabbing shrink-0"
                  style={{
                    backgroundImage: `conic-gradient(from 0deg, #12051d 0.25turn, #200833 0.25turn 0.5turn, #12051d 0.5turn 0.75turn, #200833 0.75turn)`,
                    backgroundSize: `${200 / safeW}% ${200 / safeH}%`,
                    imageRendering: 'pixelated'
                  }}
                />
              </div>

              {/* Modal Footer Stats */}
              <div className="p-3 bg-[#0c0314] border-t border-[#3d1a56]/80 flex justify-between text-xs text-purple-400/80 font-semibold px-5 select-none">
                <span>{lang === 'ru' ? `Разрешение: ${safeW} × ${safeH} пикселей` : `Resolution: ${safeW} × ${safeH} pixels`}</span>
                <span>{lang === 'ru' ? `Масштабирование: ${Math.round(modalZoom * 100)}%` : `Scale: ${Math.round(modalZoom * 100)}%`}</span>
                <span>Ratio: {aspectRatio.toFixed(2)}:1</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
