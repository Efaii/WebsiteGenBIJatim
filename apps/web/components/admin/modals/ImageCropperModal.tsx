"use client";

import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, Check, RotateCw, ZoomIn, ZoomOut, RefreshCcw } from 'lucide-react';
import getCroppedImg from '@/lib/utils/cropImage';

interface ImageCropperModalProps {
  isOpen: boolean;
  image: string;
  onCropComplete: (croppedImage: Blob) => void;
  onClose: () => void;
  aspectRatio?: number;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export function ImageCropperModal({
  isOpen,
  image,
  onCropComplete,
  onClose,
  aspectRatio = 4 / 4.5, 
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setLoadError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspectRatio));
    setLoading(false);
  }

  function onImageError() {
    setLoading(false);
    setLoadError(true);
  }

  const rotate90 = () => {
    setRotation((prev) => prev + 90);
  };

  const reset = () => {
    if (imgRef.current) {
        const { width, height } = imgRef.current;
        setCrop(centerAspectCrop(width, height, aspectRatio));
        setRotation(0);
        setZoom(1);
    }
  };

  // Zoom logic for react-image-crop: Scale the image container instead of the box
  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
    // If we scale the photo, the grid stays resizable but follows the photo size
  };

  const showCroppedImage = useCallback(async () => {
    if (completedCrop && imgRef.current) {
        try {
          const img = imgRef.current;
          // Scale remains the same because ReactCrop works on the element's actual layout dimensions
          const scaleX = img.naturalWidth / img.width;
          const scaleY = img.naturalHeight / img.height;

          const naturalCrop = {
            x: completedCrop.x * scaleX,
            y: completedCrop.y * scaleY,
            width: completedCrop.width * scaleX,
            height: completedCrop.height * scaleY,
          };

          const croppedImage = await getCroppedImg(
            img.src,
            naturalCrop,
            rotation % 360
          );
          if (croppedImage) {
            onCropComplete(croppedImage);
          }
        } catch (e) {
          console.error(e);
        }
    }
  }, [completedCrop, rotation, onCropComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0e2f5a]/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100">
          
          {/* Header */}
          <div className="px-8 py-5 bg-white border-b border-slate-50 shrink-0 flex justify-between items-center relative">
            <h2 className="text-[11px] font-black text-[#0e2f5a] uppercase tracking-[0.25em] mx-auto">Edit Foto</h2>
            <button 
              onClick={onClose} 
              className="absolute bg-slate-100 right-6 p-2 text-slate-500 hover:text-red-500 hover:bg-slate-200 rounded-full transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cropper Container - Made scrollable if zoomed */}
          <div className="relative flex-1 bg-[#f8fafc] overflow-auto p-4 flex items-center justify-center min-h-[400px]">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center z-20 bg-[#f8fafc]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0e2f5a]"></div>
                </div>
            )}
            
            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-[#f8fafc] p-6 text-center">
                    <p className="text-sm font-bold text-red-500 mb-2">Gagal memuat foto</p>
                    <p className="text-xs text-slate-400">Pastikan koneksi internet stabil atau coba upload ulang.</p>
                </div>
            )}

            <div 
                style={{ 
                    transform: `rotate(${rotation}deg)`, 
                    transition: 'transform 0.3s ease',
                    width: zoom === 1 ? 'auto' : `${zoom * 100}%`,
                    height: zoom === 1 ? '380px' : 'auto',
                    visibility: loading || error ? 'hidden' : 'visible'
                }} 
                className="flex items-center justify-center shrink-0"
            >
                <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={aspectRatio}
                    ruleOfThirds
                    className="shadow-2xl rounded-lg overflow-hidden border border-slate-200"
                >
                    <img
                    ref={imgRef}
                    alt="" 
                    src={image}
                    crossOrigin="anonymous"
                    onLoad={onImageLoad}
                    onError={onImageError}
                    style={{ 
                        maxHeight: zoom === 1 ? '380px' : 'none',
                        maxWidth: zoom === 1 ? '100%' : 'none',
                        width: zoom === 1 ? 'auto' : '100%',
                    }}
                    className="block"
                    />
                </ReactCrop>
            </div>
          </div>

          {/* Controls - More compact footer */}
          <div className="p-6 bg-white space-y-5 shrink-0 border-t border-slate-50">
            <div className="flex items-center gap-6">
                  {/* Zoom Control Group */}
                  <div className="flex-1 flex items-center gap-3 bg-slate-100 p-2 rounded-2xl border border-slate-100">
                      <button 
                          onClick={() => handleZoomChange(Math.max(1, zoom - 0.2))}
                          className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-[#0e2f5a] transition-colors cursor-pointer"
                      >
                          <ZoomOut size={18} />
                      </button>
                      <input
                          type="range"
                          value={zoom}
                          min={1}
                          max={3}
                          step={0.1}
                          onChange={(e) => handleZoomChange(Number(e.target.value))}
                          className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0e2f5a]"
                      />
                      <button 
                          onClick={() => handleZoomChange(Math.min(3, zoom + 0.2))}
                          className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-[#0e2f5a] transition-colors cursor-pointer"
                      >
                          <ZoomIn size={18} />
                      </button>
                  </div>

                  {/* Rotation & Reset */}
                  <div className="flex items-center gap-2">
                        <button 
                            onClick={rotate90}
                            className="w-12 h-12 flex items-center justify-center bg-slate-100 hover:bg-slate-100 text-slate-500 rounded-2xl border border-slate-100 transition-all active:scale-95 shadow-sm cursor-pointer"
                        >
                            <RotateCw size={18} />
                        </button>
                        <button 
                            onClick={reset}
                            className="w-12 h-12 flex items-center justify-center bg-slate-100 hover:bg-slate-100 text-slate-500 rounded-2xl border border-slate-100 transition-all active:scale-95 shadow-sm cursor-pointer"
                        >
                            <RefreshCcw size={18} />
                        </button>
                  </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button 
                onClick={onClose}
                className="flex-1 py-3 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold uppercase tracking-widest rounded-2xl transition-all border border-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button 
                onClick={showCroppedImage}
                className="flex-1 py-3 text-[11px] bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-medium uppercase tracking-widest transition-all shadow-xl shadow-[#0e2f5a]/20 active:scale-[0.98] cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
