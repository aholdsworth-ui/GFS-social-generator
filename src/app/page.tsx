'use client';

import React, { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { cohorts, brandColors } from './config';
import { 
  Download, 
  Video, 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Sparkles, 
  Layers, 
  Type, 
  Globe, 
  Sliders, 
  Film
} from 'lucide-react';
import { MomentumCanvas } from './components/MomentumCanvas';

export type AspectFormat = '4:5' | '1:1' | '16:9' | '9:16';

export default function SocialAssetGenerator() {
  const [selectedFormat, setSelectedFormat] = useState<AspectFormat>('4:5');
  const [selectedCohortId, setSelectedCohortId] = useState<'forum' | 'cloud' | 'accelerator'>('forum');
  const selectedCohort = cohorts.find((c) => c.id === selectedCohortId) || cohorts[0];

  const defaultClass = selectedCohort.classes?.[2] || 'North America';
  const [selectedClass, setSelectedClass] = useState<string>(defaultClass);
  const [assetType, setAssetType] = useState<'motion' | 'static1' | 'static2'>('motion');

  const [selectedHeadline, setSelectedHeadline] = useState<string>(
    selectedCohort.headlines && selectedCohort.headlines.length > 0 ? selectedCohort.headlines[0] : ''
  );
  const [selectedSupportingText, setSelectedSupportingText] = useState<string>(
    selectedCohort.supportingTextOptions ? selectedCohort.supportingTextOptions[0] : (selectedCohort.supportingText || '')
  );

  const [enableCustomCopy, setEnableCustomCopy] = useState<boolean>(false);
  const [customHeadline, setCustomHeadline] = useState<string>('');
  const [customSupportingText, setCustomSupportingText] = useState<string>('');

  const [uploadType, setUploadType] = useState<'photo' | 'logo'>('photo');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isExportingImage, setIsExportingImage] = useState<boolean>(false);
  const [isExportingVideo, setIsExportingVideo] = useState<boolean>(false);
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const liveCanvasRef = useRef<HTMLDivElement | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const [videoLoadError, setVideoLoadError] = useState<boolean>(false);

  useEffect(() => {
    setVideoLoadError(false);
    if (selectedCohort.hasClasses && selectedCohort.classes) {
      if (!selectedCohort.classes.includes(selectedClass)) {
        setSelectedClass(selectedCohort.classes[0]);
      }
      if (selectedCohort.supportingTextOptions) {
        setSelectedSupportingText(selectedCohort.supportingTextOptions[0]);
      }
    } else {
      if (selectedCohort.headlines && selectedCohort.headlines.length > 0) {
        setSelectedHeadline(selectedCohort.headlines[0]);
      }
      setSelectedSupportingText(selectedCohort.supportingText || '');
    }
  }, [selectedCohortId, selectedCohort, selectedClass]);

  const currentHeadline = enableCustomCopy && customHeadline.trim()
    ? customHeadline
    : selectedCohort.hasClasses
      ? selectedClass
      : selectedHeadline;

  const currentSupportingText = enableCustomCopy && customSupportingText.trim()
    ? customSupportingText
    : selectedCohort.hasClasses
      ? selectedSupportingText
      : (selectedCohort.supportingText || '');

  const normalizedHeadline = currentHeadline.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

  const isCloud = selectedCohort.id === 'cloud';
  const isAccelerator = selectedCohort.id === 'accelerator';
  const isForum = selectedCohort.id === 'forum';

  const isCloudNoImage = isCloud && (normalizedHeadline.includes('(No image)') || normalizedHeadline.includes('(No Logo)'));
  const headlineLen = currentHeadline.length;

  const baseSizeRem = selectedFormat === '16:9' ? 2.25 : 3.0;
  let headlineScale = 1.0;

  if (selectedFormat === '16:9') {
    if (isForum) headlineScale = normalizedHeadline.includes('Connecting with experts') ? 1.08 : 1.2;
    else if (isCloud) headlineScale = isCloudNoImage ? 1.4 : 1.44;
    else if (isAccelerator) headlineScale = headlineLen <= 13 ? 1.575 : 0.96;
  } else if (selectedFormat === '9:16') {
    if (isForum) headlineScale = 0.9;
    else if (isCloud) headlineScale = isCloudNoImage ? 0.9 : 1.2;
    else if (isAccelerator) headlineScale = headlineLen <= 13 ? 0.8 : 0.64;
  } else if (selectedFormat === '1:1') {
    if (isCloud) headlineScale = isCloudNoImage ? 1.05 : 1.2;
    else if (isAccelerator) headlineScale = headlineLen <= 13 ? 1.0 : 0.704;
  } else {
    if (isCloud) headlineScale = isCloudNoImage ? 1.05 : 1.2;
    else if (isAccelerator) headlineScale = headlineLen <= 13 ? 1.0 : 0.8;
  }

  const mainHeadlineRem = baseSizeRem * headlineScale;

  const isConnectingExperts = isForum && normalizedHeadline.includes('Connecting with experts');
  const isConnectingExperts9to16 = isConnectingExperts && selectedFormat === '9:16';
  const isConnectingExperts16to9 = isConnectingExperts && selectedFormat === '16:9';
  const isMountainView = isForum && normalizedHeadline.includes("We're off to Mountain View");

  const isSpanishSpeakingLatinAmerica =
    isAccelerator &&
    (selectedFormat === '9:16' || selectedFormat === '4:5') &&
    normalizedHeadline.includes('Spanish-speaking Latin America');

  let headlineToRender = currentHeadline;
  if (isConnectingExperts) {
    headlineToRender = 'Connecting with\nexperts and top\nAI founders';
  } else if (isMountainView) {
    headlineToRender = "We're off to\nMountain View!";
  } else if (isSpanishSpeakingLatinAmerica) {
    headlineToRender = 'Spanish-speaking\nLatin America';
  }

  const isForum9to16 = selectedFormat === '9:16' && isForum;
  const isAcc9to16 = selectedFormat === '9:16' && isAccelerator;
  const supportingTextSizeClass = selectedFormat === '16:9'
    ? 'text-sm sm:text-base'
    : isForum9to16
    ? 'text-xs sm:text-sm md:text-base'
    : isAcc9to16
    ? 'text-sm sm:text-base md:text-lg'
    : 'text-lg sm:text-xl md:text-2xl';

  const isForum16to9 = isForum && selectedFormat === '16:9';
  const isForum16or9to16 = isForum && (selectedFormat === '16:9' || selectedFormat === '9:16');
  const shouldReduceLogoLockup = (isCloud || isAccelerator) && (selectedFormat === '16:9' || selectedFormat === '9:16');

  let uploadScale = 1.0;
  if (selectedFormat === '16:9') {
    if (isForum16to9) uploadScale = 1.0;
    else if (isCloud) uploadScale = 0.85; 
    else if (isAccelerator && headlineLen <= 13) uploadScale = 0.90;
  } else if (selectedFormat === '9:16') {
    if (isForum || isCloud || isAccelerator) uploadScale = 0.75;
  }

  const uploadScaleClass = uploadScale === 0.75 ? 'scale-75 origin-bottom-right' : uploadScale === 0.85 ? 'scale-[0.85] origin-bottom-right' : uploadScale === 0.90 ? 'scale-90 origin-bottom-right' : 'scale-100 origin-bottom-right';

  let uploadPanelAspectClass = 'aspect-square';
  if (isForum16to9 || uploadType === 'photo') uploadPanelAspectClass = 'aspect-[4/5]';
  if (selectedFormat === '1:1') uploadPanelAspectClass = 'aspect-square';
  if (selectedFormat === '16:9' && uploadType !== 'photo') uploadPanelAspectClass = 'aspect-video';

  let uploadPanelPlacementClass = '';
  if (isForum16to9) uploadPanelPlacementClass = 'bottom-3 right-3 sm:bottom-4 sm:right-4 h-[75%] w-auto max-w-none';
  else if (selectedFormat === '16:9') uploadPanelPlacementClass = 'bottom-3 right-3 sm:bottom-4 sm:right-4 w-44 sm:w-56 md:w-68';
  else if (selectedFormat === '9:16') uploadPanelPlacementClass = 'bottom-16 right-3 sm:bottom-20 sm:right-4 md:bottom-24 md:right-5 w-40 sm:w-48 md:w-56';
  else uploadPanelPlacementClass = 'bottom-2 right-2 sm:bottom-3 sm:right-3 w-32 sm:w-36 md:w-44';

  let ctaPlacementClass = 'absolute z-10 w-auto inline-flex items-center pointer-events-none transition-all duration-300 ease-in-out left-7 sm:left-9 md:left-10 ';
  if (selectedFormat === '16:9') ctaPlacementClass += 'bottom-3.5 sm:bottom-4 md:bottom-5 scale-[0.70] origin-bottom-left';
  else if (selectedFormat === '9:16') ctaPlacementClass += 'bottom-16 sm:bottom-20 md:bottom-24 scale-[0.70] origin-bottom-left';
  else ctaPlacementClass += 'bottom-7 sm:bottom-8 md:bottom-9 scale-100 origin-bottom-left';

  let copyPlacementClass = 'absolute z-10 pointer-events-none transition-all duration-300 ease-in-out text-left left-7 sm:left-9 md:left-10 ';
  if (selectedFormat === '16:9') copyPlacementClass += 'top-[28%] sm:top-[30%] max-w-[62%] sm:max-w-[65%]';
  else if (selectedFormat === '9:16') copyPlacementClass += 'top-[22%] sm:top-[24%] max-w-[86%] sm:max-w-[88%]';
  else copyPlacementClass += 'top-[33%] sm:top-[35%] max-w-[86%] sm:max-w-[88%]';

  let logoLockupPlacementClass = 'absolute z-10 flex flex-col pointer-events-none transition-all duration-300 ease-in-out items-start text-left left-7 sm:left-9 md:left-10 ';
  if (selectedFormat === '16:9') logoLockupPlacementClass += (isForum ? 'top-9 sm:top-11 ' : 'top-8 sm:top-10 ');
  else if (selectedFormat === '9:16') logoLockupPlacementClass += 'top-12 sm:top-14 ';
  else logoLockupPlacementClass += 'top-10 sm:top-12 ';

  if (isForum && selectedFormat === '9:16') logoLockupPlacementClass += '-translate-y-3 sm:-translate-y-4 ';
  if (shouldReduceLogoLockup) logoLockupPlacementClass += ' scale-[0.85] origin-top-left';
  else logoLockupPlacementClass += ' scale-100 origin-top-left';

  const currentAssetSrc = selectedCohort.assets[assetType as keyof typeof selectedCohort.assets];

  let mediaStyle: React.CSSProperties = { width: '100%', height: '100%', objectFit: 'cover' };
  if (selectedCohort.id === 'forum') {
     mediaStyle.transform = 'translate(25%, -25%) scale(2.2)';
  } else if (selectedCohort.id === 'accelerator') {
     mediaStyle.transform = 'translate(25%, 25%) scale(1.5)';
  } else if (selectedCohort.id === 'cloud') {
     if (selectedFormat === '9:16') {
         // Display approx 1/3 of the rainbow shapes on the left side
         mediaStyle.objectPosition = 'left center';
         mediaStyle.transform = 'scale(1.15) translateX(-25%)';
     } else if (selectedFormat === '16:9') {
         mediaStyle.transform = 'scaleX(-1) scale(1.15)';
         mediaStyle.transformOrigin = 'center center';
     } else {
         mediaStyle.objectPosition = 'right center';
         mediaStyle.transform = 'scale(1.15)';
         mediaStyle.transformOrigin = 'right center';
     }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => setUploadedImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeUpload = () => {
    setUploadedImage(null);
    setUploadedFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExportImage = async () => {
    if (!liveCanvasRef.current) return;
    setIsExportingImage(true);
    setExportNotice(`Rendering high-resolution ${selectedFormat} image...`);
    try {
      const dataUrl = await toPng(liveCanvasRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `GFS_${selectedCohort.id}_${assetType}_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      setExportNotice('Image exported successfully!');
      setTimeout(() => setExportNotice(null), 3500);
    } catch (err) {
      console.error('Image export failed:', err);
      setExportNotice('Image export failed. Please try again.');
      setTimeout(() => setExportNotice(null), 3500);
    } finally {
      setIsExportingImage(false);
    }
  };

  const handleExportVideo = async () => {
    if (isExportingVideo) return;
    setIsExportingVideo(true);
    setVideoProgress(0);
    setExportNotice(`Recording ${selectedFormat} motion asset for 5 seconds...`);

    try {
      const formatDims: Record<AspectFormat, { width: number; height: number }> = {
        '4:5': { width: 1080, height: 1350 },
        '1:1': { width: 1080, height: 1080 },
        '16:9': { width: 1920, height: 1080 },
        '9:16': { width: 1080, height: 1920 },
      };

      const exportWidth = formatDims[selectedFormat].width;
      const exportHeight = formatDims[selectedFormat].height;
      const canvas = document.createElement('canvas');
      canvas.width = exportWidth;
      canvas.height = exportHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Canvas 2D context not available');

      const loadImg = (src: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error(`Failed to load ${src}`));
          img.src = src;
        });

      let logoImg: HTMLImageElement | null = null;
      let userImg: HTMLImageElement | null = null;
      let bgImg: HTMLImageElement | null = null;
      let pillImg: HTMLImageElement | null = null;

      try { logoImg = await loadImg('/assets/gfs-logo-white.png'); } catch (e) { }
      try { pillImg = await loadImg('/assets/glassy-pill.png'); } catch (e) { }
      
      if (uploadedImage && !isCloudNoImage) {
        try { userImg = await loadImg(uploadedImage); } catch (e) { }
      }
      if (assetType !== 'motion') {
        try { bgImg = await loadImg(currentAssetSrc); } catch (e) { }
      }

      const drawCoverBg = (ctx: CanvasRenderingContext2D, media: HTMLImageElement | HTMLVideoElement) => {
        const mw = (media as HTMLVideoElement).videoWidth || (media as HTMLImageElement).width || 1920;
        const mh = (media as HTMLVideoElement).videoHeight || (media as HTMLImageElement).height || 1080;
        const mAspect = mw / mh;
        const cAspect = exportWidth / exportHeight;

        let dw = exportWidth; let dh = exportHeight;
        if (mAspect > cAspect) { dh = exportHeight; dw = exportHeight * mAspect; } 
        else { dw = exportWidth; dh = exportWidth / mAspect; }

        ctx.save();
        if (selectedCohort.id === 'forum') {
          ctx.translate(exportWidth * 0.75, exportHeight * 0.25);
          ctx.scale(2.2, 2.2);
          ctx.drawImage(media, -dw/2, -dh/2, dw, dh);
        } else if (selectedCohort.id === 'accelerator') {
          ctx.translate(exportWidth * 0.75, exportHeight * 0.75);
          ctx.scale(1.5, 1.5);
          ctx.drawImage(media, -dw/2, -dh/2, dw, dh);
        } else if (selectedCohort.id === 'cloud') {
          if (selectedFormat === '9:16') {
              const scaleBg = 1.15;
              const tx = -exportWidth * 0.25; // Shifts background to show approx 1/3
              ctx.translate(tx, exportHeight/2);
              ctx.scale(scaleBg, scaleBg);
              ctx.drawImage(media, 0, -dh/2, dw, dh);
          } else if (selectedFormat === '16:9') {
              ctx.translate(exportWidth/2, exportHeight/2);
              ctx.scale(-1.15, 1.15); 
              ctx.drawImage(media, -dw/2, -dh/2, dw, dh);
          } else {
              ctx.translate(exportWidth, exportHeight/2);
              ctx.scale(1.15, 1.15);
              ctx.drawImage(media, -dw, -dh/2, dw, dh); 
          }
        } else {
          const cx = (exportWidth - dw) / 2;
          const cy = (exportHeight - dh) / 2;
          ctx.drawImage(media, cx, cy, dw, dh);
        }
        ctx.restore();
      };

      const stream = canvas.captureStream(30);
      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8') ? 'video/webm;codecs=vp8' : 'video/webm';
      }

      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8000000 });
      const recordedChunks: Blob[] = [];
      recorder.ondataavailable = (event) => { if (event.data && event.data.size > 0) recordedChunks.push(event.data); };

      const durationMs = 5000;
      const startTime = performance.now();
      let animId: number;

      const renderRecordingFrame = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(100, Math.round((elapsed / durationMs) * 100));
        setVideoProgress(progress);
        const t = elapsed / 1000;

        ctx.fillStyle = brandColors.grey1200;
        ctx.fillRect(0, 0, exportWidth, exportHeight);

        const liveVideo = videoElementRef.current;
        if (assetType === 'motion' && liveVideo && !liveVideo.paused && liveVideo.readyState >= 2) {
          drawCoverBg(ctx, liveVideo);
        } else if (assetType !== 'motion' && bgImg) {
          drawCoverBg(ctx, bgImg);
        } else {
          drawProceduralMomentum(ctx, selectedCohort.id, exportWidth, exportHeight, t);
        }

        const vignette = ctx.createLinearGradient(0, 0, exportWidth, exportHeight);
        vignette.addColorStop(0, 'rgba(18, 19, 23, 0.45)');
        vignette.addColorStop(0.5, 'rgba(18, 19, 23, 0.1)');
        vignette.addColorStop(1, 'rgba(18, 19, 23, 0.4)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, exportWidth, exportHeight);

        // --- STRICT 9:16 CLOUD NO IMAGE EXPORT ---
        if (isCloudNoImage && selectedFormat === '9:16') {
          
          // 1. Logo & Program: Centered with 2x G Spacing
          const logoH = 46;
          const logoX = exportWidth / 2;
          const logoY = exportHeight * 0.10; 
          
          if (logoImg) {
            const logoW = logoH * (logoImg.width / logoImg.height);
            ctx.drawImage(logoImg, logoX - (logoW / 2), logoY, logoW, logoH);
          } else {
            drawFallbackLogo(ctx, logoX - 50, logoY, 1.0);
          }

          const programGap = logoH * 2;
          const programY = logoY + logoH + programGap;
          ctx.fillStyle = '#FFFFFF';
          ctx.font = `500 52px "Google Sans Flex", sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(selectedCohort.name, logoX, programY + 35); 

          // 2. Headline 1: True Edge-to-Edge flush with Canvas width
          const mainCopyY = exportHeight * 0.45;
          const h1Text = "We’re building"; 
          
          ctx.font = `500 100px "Google Sans Flex", sans-serif`;
          const baseWidth = ctx.measureText(h1Text).width;
          const edgeToEdgeSize = 100 * (exportWidth / baseWidth);
          
          ctx.font = `500 ${edgeToEdgeSize}px "Google Sans Flex", sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(h1Text, exportWidth / 2, mainCopyY);

          // 3. Headline 2: Faster (Flush right zero padding, scaled to sit under apostrophe)
          const fasterSize = edgeToEdgeSize * 2.4; // Considerably larger
          ctx.font = `500 ${fasterSize}px "Google Sans Flex", sans-serif`;
          ctx.textAlign = 'right';
          ctx.fillText("faster", exportWidth, mainCopyY + fasterSize * 0.85);

          // 4. CTA Pill: Centered, smaller glassy asset, 1/4 from bottom (25%)
          const pillH = 60;
          const pillW = 280;
          const ctaX = (exportWidth / 2) - (pillW / 2);
          const ctaY = (exportHeight * 0.75) - pillH;

          if (pillImg) {
            ctx.drawImage(pillImg, ctaX, ctaY, pillW, pillH);
          } else {
            ctx.beginPath();
            ctx.roundRect(ctaX, ctaY, pillW, pillH, pillH / 2);
            ctx.fillStyle = 'rgba(18, 19, 23, 0.4)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }

          ctx.fillStyle = '#FFFFFF';
          ctx.font = `500 28px "Google Sans Flex", sans-serif`; // Slightly larger text
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Find out more', ctaX + pillW / 2, ctaY + pillH / 2);

        } else if (isCloudNoImage) {
          // Fallback logic for 16:9, 1:1, 4:5
          const isLandscape = selectedFormat === '16:9';
          const baseX = exportWidth * (isLandscape ? 0.0625 : 0.074);
          const logoY = exportHeight * (isLandscape ? 0.12 : 0.10);
          const logoH = exportWidth * (isLandscape ? 0.045 : 0.075);
          
          if (logoImg) {
            const logoW = logoH * (logoImg.width / logoImg.height);
            ctx.drawImage(logoImg, baseX, logoY, logoW, logoH);
          } else {
            drawFallbackLogo(ctx, baseX, logoY, 1.0);
          }

          const programGap = logoH * 2;
          ctx.fillStyle = '#FFFFFF';
          ctx.font = `500 ${Math.round(exportWidth * (isLandscape ? 0.028 : 0.048))}px "Google Sans Flex", sans-serif`;
          ctx.textAlign = 'left';
          ctx.fillText(selectedCohort.name, baseX, logoY + logoH + programGap + (exportWidth * 0.028));

          const mainCopyY = exportHeight * (isLandscape ? 0.44 : 0.38);
          const buildSize = exportWidth * (isLandscape ? 0.0625 : 0.13);
          const fasterSize = exportWidth * (isLandscape ? 0.14 : 0.32);

          ctx.font = `500 ${Math.round(buildSize)}px "Google Sans Flex", sans-serif`;
          ctx.fillText("We’re building", baseX, mainCopyY + buildSize);

          ctx.font = `500 ${Math.round(fasterSize)}px "Google Sans Flex", sans-serif`;
          const fasterOffsetX = baseX + (isLandscape ? exportWidth * 0.15 : 0);
          ctx.fillText("faster", fasterOffsetX, mainCopyY + buildSize + (fasterSize * 0.85));

          const pillH = exportWidth * (isLandscape ? 0.035 : 0.06);
          const pillW = pillH * 4.2;
          let ctaX = baseX;
          let ctaY = exportHeight * 0.89 - pillH;

          if (isLandscape) {
            ctaX = exportWidth * 0.94 - pillW;
            ctaY = exportHeight * 0.92 - pillH;
          }

          ctx.beginPath();
          ctx.roundRect(ctaX, ctaY, pillW, pillH, pillH / 2);
          ctx.fillStyle = 'rgba(18, 19, 23, 0.4)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = `500 ${Math.round(pillH * 0.4)}px "Google Sans Flex", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Find out more', ctaX + pillW / 2, ctaY + pillH / 2);

        } else {
          // Standard Export
          const lockupScale = (isForum && selectedFormat === '16:9') ? 0.825 : (isForum && selectedFormat === '9:16') ? 0.94 : shouldReduceLogoLockup ? 0.85 : 1.0;
          const logoH = Math.round(36 * lockupScale);
          const textX = 80;
          const logoY = (isForum && selectedFormat === '16:9') ? 74 : (isForum && selectedFormat === '9:16') ? 48 : 80;
          
          if (logoImg) {
            const logoAspect = logoImg.width / logoImg.height;
            const logoW = logoH * logoAspect;
            ctx.drawImage(logoImg, textX, logoY, logoW, logoH);
          } else {
            drawFallbackLogo(ctx, textX, logoY, lockupScale);
          }

          const programGap = (isForum && selectedFormat === '16:9') ? 26 : isForum ? 30 : Math.round(logoH * 2);
          const programY = logoY + logoH + programGap;
          ctx.fillStyle = '#FFFFFF';
          ctx.font = `500 ${Math.round(48 * lockupScale)}px "Google Sans Flex", sans-serif`;
          ctx.textAlign = 'left';
          ctx.fillText(selectedCohort.name, textX, programY);

          let mainCopyY: number;
          if (isForum) {
            const topClearance = isConnectingExperts16to9 ? Math.round(10 * 1.0) : (selectedFormat === '16:9') ? Math.round(110 * 1.0) : 210; 
            mainCopyY = programY + topClearance;
          } else {
            mainCopyY = selectedFormat === '16:9' ? exportHeight * 0.32 : selectedFormat === '9:16' ? exportHeight * 0.22 : exportHeight * 0.35;
          }

          ctx.fillStyle = '#FFFFFF';
          const baseCanvasHeadlineSize = selectedFormat === '16:9' ? 64 : 88;
          const canvasHeadlineSize = Math.round(baseCanvasHeadlineSize * headlineScale);

          ctx.textAlign = 'left';
          ctx.font = `500 ${canvasHeadlineSize}px "Google Sans Flex", sans-serif`;
          const maxWidth = exportWidth * (isForum && selectedFormat === '16:9' ? 0.60 : selectedFormat === '16:9' ? 0.62 : 0.82);
          const rawLines = headlineToRender.split('\n');
          let currentY = mainCopyY;
          const lineWrapStep = Math.round(canvasHeadlineSize * 1.15);

          for (const rawLine of rawLines) {
            const words = rawLine.split(' ');
            let line = '';
            for (let n = 0; n < words.length; n++) {
              const testLine = line + words[n] + ' ';
              const metrics = ctx.measureText(testLine);
              if (metrics.width > maxWidth && n > 0) {
                ctx.fillText(line, textX, currentY);
                line = words[n] + ' ';
                currentY += lineWrapStep;
              } else {
                line = testLine;
              }
            }
            ctx.fillText(line, textX, currentY);
            currentY += lineWrapStep;
          }

          if (currentSupportingText && !isCloudNoImage) {
            const supportingFontSize = selectedFormat === '16:9' ? 30 : isForum9to16 ? 28 : isAcc9to16 ? 32 : 40;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.textAlign = 'left';
            ctx.font = `500 ${supportingFontSize}px "Google Sans Flex", sans-serif`;
            ctx.fillText(currentSupportingText, textX, mainCopyY + (canvasHeadlineSize * 1.15) * headlineToRender.split('\n').length + 12);
          }

          const ctaScale = (selectedFormat === '16:9' || selectedFormat === '9:16') ? 0.75 : 1.0;
          const pillW = Math.round(240 * ctaScale);
          const pillH = Math.round(56 * ctaScale);
          
          let ctaX = textX;
          let ctaY = selectedFormat === '9:16' ? exportHeight - 220 : exportHeight - Math.round(120 * ctaScale);

          ctx.save();
          ctx.beginPath();
          ctx.roundRect(ctaX, ctaY, pillW, pillH, pillH / 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = `500 ${Math.round(22 * ctaScale)}px "Google Sans Flex", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Find out more', ctaX + pillW / 2, ctaY + pillH / 2);
          ctx.restore();
        }

        if (elapsed < durationMs) animId = requestAnimationFrame(renderRecordingFrame);
        else recorder.stop();
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GFS_${selectedCohort.id}_Motion_${Date.now()}.webm`;
        a.click();
        setIsExportingVideo(false);
        setExportNotice('5-second WebM video exported successfully!');
        setTimeout(() => setExportNotice(null), 4000);
      };

      recorder.start();
      animId = requestAnimationFrame(renderRecordingFrame);
    } catch (err) {
      console.error('Video recording failed:', err);
      setIsExportingVideo(false);
      setExportNotice('Video export failed. Browser MediaRecorder error.');
      setTimeout(() => setExportNotice(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0e12] text-[#f1f3f4] flex flex-col font-['Google_Sans_Flex',sans-serif]">
      <header className="border-b border-white/10 bg-[#121317]/90 backdrop-blur-md px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-green-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-medium text-white flex items-center gap-2">
                Google for Startups
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10 font-normal">
                  Social Asset Generator
                </span>
              </h1>
              <p className="text-xs text-white/50 hidden sm:block">
                Standard 4:5 social assets with dynamic momentum expressions & video export
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-white/60">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {selectedFormat === '4:5'
                ? '4:5 Portrait (1080×1350)'
                : selectedFormat === '1:1'
                ? '1:1 Square (1080×1080)'
                : selectedFormat === '16:9'
                ? '16:9 Landscape (1920×1080)'
                : '9:16 Story/Reel (1080×1920)'}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 sm:p-6 lg:p-8">
        <section className="lg:col-span-7 flex flex-col items-center justify-start min-h-[580px] lg:min-h-[660px]">
          <div className="w-full flex items-center justify-between mb-3 text-xs text-white/60 px-1">
            <span className="font-medium uppercase text-[11px] text-white/50 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              Live Canvas Preview
            </span>
            <span className="text-[11px] text-white/40">
              {selectedFormat === '4:5'
                ? '4:5 (Social Portrait)'
                : selectedFormat === '1:1'
                ? '1:1 Square'
                : selectedFormat === '16:9'
                ? '16:9 Landscape'
                : '9:16 Story/Reel'} • {assetType === 'motion' ? 'MP4 Loop' : assetType === 'static1' ? 'Static 1' : 'Static 2'}
            </span>
          </div>

          <div className="w-full flex-1 flex items-center justify-center relative py-4 min-h-[520px] lg:min-h-[620px]">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-purple-600/10 rounded-3xl blur-2xl opacity-60 pointer-events-none" />

            <div
              ref={liveCanvasRef}
              className={`relative @container ${
                selectedFormat === '4:5'
                  ? 'aspect-[4/5] max-w-[460px] xl:max-w-[490px] max-h-[76vh]'
                  : selectedFormat === '1:1'
                  ? 'aspect-square max-w-[480px] xl:max-w-[510px] max-h-[76vh]'
                  : selectedFormat === '16:9'
                  ? 'aspect-video w-full max-w-[620px] xl:max-w-[680px] max-h-[68vh]'
                  : 'aspect-[9/16] max-w-[340px] sm:max-w-[360px] xl:max-w-[380px] max-h-[78vh]'
              } w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-white/10 select-none bg-[#121317] transition-all duration-300 ease-out`}
              style={{ backgroundColor: brandColors.grey1200 }}
            >
              <div className="absolute inset-0 overflow-hidden z-0">
                {assetType === 'motion' ? (
                  <>
                    <video
                      ref={videoElementRef}
                      src={currentAssetSrc}
                      autoPlay
                      loop
                      muted
                      playsInline
                      onError={() => setVideoLoadError(true)}
                      style={mediaStyle}
                      className={`w-full h-full ${selectedCohort.cropRule} ${videoLoadError ? 'hidden' : 'block'}`}
                    />
                    {videoLoadError && (
                      <MomentumCanvas
                        cohortId={selectedCohort.id}
                        className={selectedCohort.cropRule}
                        width={selectedFormat === '16:9' ? 1920 : 1080}
                        height={selectedFormat === '16:9' ? 1080 : selectedFormat === '1:1' ? 1080 : selectedFormat === '9:16' ? 1920 : 1350}
                      />
                    )}
                  </>
                ) : (
                  <img
                    src={currentAssetSrc}
                    alt={`${selectedCohort.name} backdrop`}
                    style={mediaStyle}
                    className={`w-full h-full ${selectedCohort.cropRule}`}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/35 pointer-events-none" />
              </div>

              {/* --- SAFE TAILWIND HTML PREVIEW FOR 9:16 CLOUD NO IMAGE --- */}
              {isCloudNoImage && selectedFormat === '9:16' ? (
                <div className="absolute inset-0 z-10 pointer-events-none flex flex-col">
                  
                  {/* Centered Logo Lockup & 2x G Spacing */}
                  <div className="absolute top-[10%] w-full flex flex-col items-center justify-start">
                    <img 
                      src="/assets/gfs-logo-white.png" 
                      alt="Google for Startups Logo"
                      className="h-[22px] sm:h-[26px] w-auto block"
                    />
                    <div className="text-white font-medium text-[22px] sm:text-[26px] mt-[44px] sm:mt-[52px] tracking-normal">
                      {selectedCohort.name}
                    </div>
                  </div>

                  {/* Edge-to-Edge Typography Container (Safe CSS Classes) */}
                  <div className="absolute top-[42%] left-0 w-full flex flex-col tracking-normal px-2">
                    <div className="text-white font-medium text-center leading-none w-full tracking-normal whitespace-nowrap text-[38px] sm:text-[42px] xl:text-[46px] px-0 mx-0">
                      We’re building
                    </div>
                    <div className="text-white font-medium text-right leading-[0.85] mt-1 w-full tracking-normal whitespace-nowrap text-[84px] sm:text-[96px] xl:text-[104px] pr-0">
                      faster
                    </div>
                  </div>

                  {/* 1/4 Bottom CTA Pill (bottom: 25%) */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-[25%] w-[180px] sm:w-[220px] h-[48px] sm:h-[56px] inline-flex items-center justify-center">
                    <img src="/assets/glassy-pill.png" className="absolute inset-0 w-full h-full object-fill rounded-full" onError={(e) => e.currentTarget.style.display='none'} />
                    <div className="relative px-6 py-2.5 rounded-full border border-white/40 bg-[#121317]/40 backdrop-blur-sm text-white font-medium text-[14px] sm:text-[16px] text-center whitespace-nowrap w-full h-full flex items-center justify-center">
                      Find out more
                    </div>
                  </div>

                </div>
              ) : isCloudNoImage ? (
                <div className="absolute inset-0 z-10 pointer-events-none p-7 sm:p-9 md:p-10">
                  <div className="flex flex-col items-start">
                    <img 
                      src="/assets/gfs-logo-white.png" 
                      alt="Google for Startups Logo"
                      className={`${selectedFormat === '16:9' ? 'h-4 sm:h-5 md:h-6' : 'h-5 sm:h-6 md:h-7'} w-auto`}
                    />
                    <div className={`${selectedFormat === '16:9' ? 'mt-6 sm:mt-8 md:mt-10 text-[18px] sm:text-[20px] md:text-[24px]' : 'mt-8 sm:mt-10 md:mt-12 text-[20px] sm:text-[24px] md:text-[28px]'} text-white font-medium`}>
                      {selectedCohort.name}
                    </div>
                  </div>
                  <div className={`absolute left-7 sm:left-9 md:left-10 text-left whitespace-nowrap ${selectedFormat === '16:9' ? 'top-[40%]' : 'top-[36%]'}`}>
                    <div className={`${selectedFormat === '16:9' ? 'text-[28px] sm:text-[36px] md:text-[42px]' : 'text-[40px] sm:text-[50px] md:text-[56px]'} text-white font-medium leading-[1.05] tracking-normal`}>
                      We’re building
                    </div>
                    <div className={`${selectedFormat === '16:9' ? 'text-[50px] sm:text-[68px] md:text-[80px] ml-12 sm:ml-16 md:ml-24' : 'text-[64px] sm:text-[80px] md:text-[90px] ml-0'} text-white font-medium leading-[0.85] mt-1 tracking-normal`}>
                      faster
                    </div>
                  </div>
                  <div className={`absolute w-auto inline-flex items-center pointer-events-none ${selectedFormat === '16:9' ? 'right-10 sm:right-12 bottom-8 sm:bottom-10 scale-90 origin-bottom-right' : 'left-7 sm:left-9 md:left-10 bottom-16 sm:bottom-20 scale-[0.85] origin-bottom-left'}`}>
                    <div className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-full border border-white/40 bg-[#121317]/80 text-white font-medium text-xs sm:text-sm text-center">
                      Find out more
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className={logoLockupPlacementClass}>
                    <img
                      src="/assets/gfs-logo-white.png"
                      alt="Google for Startups Logo"
                      className={`${(isForum && selectedFormat === '16:9') ? 'h-5 sm:h-5.5 md:h-[24px]' : 'h-5 sm:h-6 md:h-[26px]'} w-auto object-contain block transition-all duration-300`}
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.vector-logo-fallback')) {
                          const div = document.createElement('div');
                          div.className = `vector-logo-fallback flex items-center gap-2 text-white font-medium ${isForum16or9to16 ? 'text-xs' : 'text-base'}`;
                          div.innerHTML = `<span class="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center font-bold text-xs">G</span> Google for Startups`;
                          parent.prepend(div);
                        }
                      }}
                    />
                    <p className={`mt-[52px] text-[20px] sm:text-[24px] md:text-[26px] text-white font-medium transition-all duration-300`}>
                      {selectedCohort.name}
                    </p>

                    {isForum && (
                      <div
                        className={`${
                          isConnectingExperts16to9
                            ? 'mt-4 sm:mt-5 md:mt-6 max-w-[55%] sm:max-w-[58%] md:max-w-[60%]'
                            : (isForum && selectedFormat === '16:9')
                            ? 'mt-10 sm:mt-12 md:mt-14 max-w-[55%] sm:max-w-[58%] md:max-w-[60%]'
                            : isConnectingExperts
                            ? 'mt-14 sm:mt-16 md:mt-[4.5rem] max-w-[90%] sm:max-w-[92%] mb-4'
                            : 'mt-16 sm:mt-20 md:mt-24 max-w-[85%] sm:max-w-[88%] mb-6'
                        } pointer-events-none transition-all duration-300 ease-in-out text-left`}
                      >
                        <h2
                          style={{ fontSize: `${mainHeadlineRem}rem`, lineHeight: 1.1 }}
                          className={`text-white font-medium drop-shadow-sm transition-all duration-300 text-left`}
                        >
                          {headlineToRender.split('\n').map((line, i) => (
                            <span key={i} className="block whitespace-nowrap">{line}</span>
                          ))}
                        </h2>
                        {currentSupportingText && (
                          <p className={`mt-2.5 sm:mt-3 text-white/90 font-medium ${supportingTextSizeClass} drop-shadow-sm transition-all duration-300 text-left`}>
                            {currentSupportingText}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {!isForum && (
                    <div className={copyPlacementClass}>
                      <h2
                        style={{ fontSize: `${mainHeadlineRem}rem`, lineHeight: 1.1 }}
                        className={`text-white font-medium drop-shadow-sm transition-all duration-300 text-left tracking-normal`}
                      >
                        {headlineToRender.split('\n').map((line, i) => (
                            <span key={i} className="block whitespace-nowrap">{line}</span>
                        ))}
                      </h2>
                      {currentSupportingText && !isCloudNoImage && (
                        <p className={`mt-2.5 sm:mt-3 text-white/90 font-medium ${supportingTextSizeClass} drop-shadow-sm transition-all duration-300 text-left`}>
                          {currentSupportingText}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}

              {uploadedImage && !isCloudNoImage && (
                <div
                  className={`absolute z-10 ${uploadPanelPlacementClass} ${uploadPanelAspectClass} ${uploadScaleClass} rounded-2xl shadow-2xl shadow-black/40 overflow-hidden flex items-center justify-center transition-all duration-300 ease-in-out ${
                    uploadType === 'photo' ? 'p-0 bg-transparent' : 'p-4 sm:p-5 md:p-6 bg-white'
                  }`}
                >
                  <img
                    src={uploadedImage}
                    alt={uploadType === 'photo' ? 'Uploaded Photo' : 'Uploaded Logo'}
                    className={`w-full h-full ${uploadType === 'photo' ? 'object-cover' : 'object-contain'}`}
                  />
                </div>
              )}

              {!isCloudNoImage && (
                <div className={ctaPlacementClass}>
                  <div className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-full border border-white/40 bg-[#121317]/80 text-white font-medium text-xs sm:text-sm text-center whitespace-nowrap font-['Google_Sans_Flex',sans-serif]">
                    Find out more
                  </div>
                </div>
              )}

              {isExportingVideo && (
                <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-14 h-14 rounded-full border-4 border-red-500/20 border-t-red-500 animate-spin mb-4" />
                  <div className="flex items-center gap-2 text-red-400 font-medium text-sm mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    Recording {selectedFormat} Motion Asset...
                  </div>
                  <div className="text-white text-2xl font-bold mb-3">{videoProgress}%</div>
                  <div className="w-48 bg-white/20 h-2 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full transition-all duration-100 ease-out" style={{ width: `${videoProgress}%` }} />
                  </div>
                  <p className="text-xs text-white/60 mt-3">Recording exactly 5.0 seconds for social media</p>
                </div>
              )}
            </div>
          </div>

          {exportNotice && (
            <div className="mt-3 px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-center gap-2 animate-fade-in">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
              <span>{exportNotice}</span>
            </div>
          )}
        </section>

        <section className="lg:col-span-5 flex flex-col">
          <div className="bg-[#14161c] border border-white/10 rounded-2xl p-5 sm:p-7 shadow-xl space-y-6 overflow-y-auto max-h-[calc(100vh-7rem)]">
            <div className="border-b border-white/10 pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  Asset Configuration
                </h2>
                <span className="text-xs text-white/40">Real-time update</span>
              </div>
              <p className="text-xs text-white/50 mt-1">
                Customize format aspect ratio, program, visuals, class regional lockups, and social copy.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-white/80 uppercase flex items-center justify-between">
                <span>Format</span>
                <span className="text-[11px] text-blue-400 font-normal">Aspect Ratio</span>
              </label>
              <div className="relative">
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value as AspectFormat)}
                  className="w-full bg-[#1b1e26] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer hover:border-white/25 transition-colors font-medium"
                >
                  <option value="4:5">4:5 (Social Portrait)</option>
                  <option value="1:1">1:1 (Square)</option>
                  <option value="16:9">16:9 (Landscape)</option>
                  <option value="9:16">9:16 (Story/Reel)</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 text-xs">▼</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-white/80 uppercase flex items-center justify-between">
                <span>1. Program</span>
                <span className="text-[11px] text-white/40 normal-case font-normal">Mapped from config.ts</span>
              </label>
              <div className="relative">
                <select
                  value={selectedCohortId}
                  onChange={(e) => setSelectedCohortId(e.target.value as any)}
                  className="w-full bg-[#1b1e26] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer hover:border-white/25 transition-colors font-medium"
                >
                  {cohorts.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 text-xs">▼</div>
              </div>
              <div className="text-[11px] text-white/50 flex items-center gap-2 pt-0.5">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>Focus: {selectedCohort.id === 'forum' ? 'Connect Momentum Expression' : selectedCohort.id === 'cloud' ? 'Build Momentum Expression' : 'Scale Momentum Expression'}</span>
              </div>
            </div>

            {selectedCohort.hasClasses && selectedCohort.classes && (
              <div className="space-y-2 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 animate-fade-in">
                <label className="text-xs font-medium text-blue-300 uppercase flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-blue-400" />2. Class / Region</span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-normal">Accelerator Only</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full bg-[#1b1e26] border border-blue-500/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer font-medium"
                  >
                    <optgroup label="Americas" className="bg-[#1b1e26] text-white/90">{selectedCohort.classes.slice(0, 5).map((cls) => (<option key={cls} value={cls}>{cls}</option>))}</optgroup>
                    <optgroup label="EMEA" className="bg-[#1b1e26] text-white/90">{selectedCohort.classes.slice(5, 9).map((cls) => (<option key={cls} value={cls}>{cls}</option>))}</optgroup>
                    <optgroup label="APAC" className="bg-[#1b1e26] text-white/90">{selectedCohort.classes.slice(9).map((cls) => (<option key={cls} value={cls}>{cls}</option>))}</optgroup>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 text-xs">▼</div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-medium text-white/80 uppercase flex items-center justify-between">
                <span>{selectedCohort.hasClasses ? '3. Asset Type' : '2. Asset Type'}</span>
                <span className="text-[11px] text-white/40 font-normal">Motion vs Static</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => setAssetType('motion')} className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${assetType === 'motion' ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10' : 'bg-[#1b1e26] border-white/10 text-white/60 hover:border-white/25 hover:text-white'}`}><Film className="w-4 h-4 mb-1.5 text-blue-400" /><span>Motion</span><span className="text-[10px] text-white/40 mt-0.5">MP4 Loop</span></button>
                <button type="button" onClick={() => setAssetType('static1')} className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${assetType === 'static1' ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10' : 'bg-[#1b1e26] border-white/10 text-white/60 hover:border-white/25 hover:text-white'}`}><ImageIcon className="w-4 h-4 mb-1.5 text-emerald-400" /><span>Static 1</span><span className="text-[10px] text-white/40 mt-0.5">Framing 01</span></button>
                <button type="button" onClick={() => setAssetType('static2')} className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${assetType === 'static2' ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10' : 'bg-[#1b1e26] border-white/10 text-white/60 hover:border-white/25 hover:text-white'}`}><ImageIcon className="w-4 h-4 mb-1.5 text-amber-400" /><span>Static 2</span><span className="text-[10px] text-white/40 mt-0.5">Framing 02</span></button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-white/80 uppercase flex items-center gap-1.5"><Type className="w-3.5 h-3.5 text-blue-400" /><span>{selectedCohort.hasClasses ? '4. Supporting Copy' : '3. Copy / Headline'}</span></label>
                <button type="button" onClick={() => setEnableCustomCopy(!enableCustomCopy)} className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors">{enableCustomCopy ? 'Use Presets' : 'Custom Text'}</button>
              </div>

              {!enableCustomCopy ? (
                <>
                  {selectedCohort.hasClasses ? (
                    <div className="space-y-2">
                      <div className="relative">
                        <select value={selectedSupportingText} onChange={(e) => setSelectedSupportingText(e.target.value)} className="w-full bg-[#1b1e26] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer font-medium">
                          {selectedCohort.supportingTextOptions?.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 text-xs">▼</div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <select value={selectedHeadline} onChange={(e) => setSelectedHeadline(e.target.value)} className="w-full bg-[#1b1e26] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer font-medium">
                          {selectedCohort.headlines?.map((hl) => (<option key={hl} value={hl}>{hl}</option>))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 text-xs">▼</div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-3 p-3.5 rounded-xl bg-white/5 border border-white/10 animate-fade-in">
                  <div>
                    <label className="text-[11px] text-white/60 block mb-1">Headline Override:</label>
                    <input type="text" value={customHeadline} onChange={(e) => setCustomHeadline(e.target.value)} placeholder={currentHeadline} className="w-full bg-[#1b1e26] border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-medium" />
                  </div>
                </div>
              )}
            </div>

            {!isCloudNoImage && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-medium text-white/80 uppercase flex items-center gap-1.5"><Upload className="w-3.5 h-3.5 text-blue-400" /><span>Upload Asset</span></label>
                  <div className="inline-flex items-center bg-[#181b22] border border-white/15 p-0.5 rounded-lg">
                    <button type="button" onClick={() => setUploadType('photo')} className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${uploadType === 'photo' ? 'bg-blue-600 text-white shadow-sm' : 'text-white/60 hover:text-white'}`}>Photo</button>
                    <button type="button" onClick={() => setUploadType('logo')} className={`px-3 py-1 text-xs rounded-md font-medium transition-all ${uploadType === 'logo' ? 'bg-blue-600 text-white shadow-sm' : 'text-white/60 hover:text-white'}`}>Logo</button>
                  </div>
                </div>

                {!uploadedImage ? (
                  <div className="space-y-2">
                    <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-white/20 hover:border-blue-500/60 rounded-xl p-5 text-center cursor-pointer transition-colors bg-[#181b22]/50 hover:bg-blue-500/5 group">
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                      <Upload className="w-6 h-6 mx-auto text-white/40 group-hover:text-blue-400 mb-2 transition-colors" />
                      <p className="text-xs text-white/80 font-medium">{uploadType === 'photo' ? 'Click to upload headshot or photo' : 'Click to upload brand or startup logo'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg overflow-hidden border border-white/20 shrink-0 ${uploadType === 'photo' ? 'bg-black/40' : 'bg-white p-1.5'}`}><img src={uploadedImage} alt="Thumbnail" className={`w-full h-full ${uploadType === 'photo' ? 'object-cover' : 'object-contain'}`} /></div>
                      <div>
                        <p className="text-xs font-medium text-white truncate max-w-[170px]">{uploadedFileName || 'Uploaded Image'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={removeUpload} className="p-2 rounded-lg hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-white/10 space-y-3">
              <label className="text-xs font-medium text-white/80 uppercase block">Export Social Assets</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" disabled={isExportingImage || isExportingVideo} onClick={handleExportImage} className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-white text-[#121317] font-medium text-sm hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/10">
                  {isExportingImage ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Download className="w-4 h-4" />}<span>Export Image</span>
                </button>
                <button type="button" disabled={isExportingImage || isExportingVideo} onClick={handleExportVideo} className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25">
                  {isExportingVideo ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Video className="w-4 h-4" />}<span>Export Video</span>
                </button>
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}

function drawProceduralMomentum(ctx: CanvasRenderingContext2D, cohortId: 'forum' | 'cloud' | 'accelerator', w: number, h: number, t: number) {
  if (cohortId === 'forum') {
    const originX = w * 0.75; const originY = h * 0.25;
    const glow = ctx.createRadialGradient(originX, originY, 40, originX, originY, 750);
    glow.addColorStop(0, 'rgba(66, 133, 244, 0.45)'); glow.addColorStop(0.5, 'rgba(36, 193, 224, 0.18)'); glow.addColorStop(1, 'rgba(18, 19, 23, 0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 7; i++) {
      const radius = 240 + i * 90 + Math.sin(t * 2 + i * 0.4) * 20;
      ctx.beginPath(); ctx.arc(originX, originY, radius, Math.PI * 0.5, Math.PI * 1.05);
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(66, 133, 244, 0.5)' : 'rgba(78, 205, 196, 0.4)'; ctx.lineWidth = 4 + (i % 3) * 2; ctx.stroke();
    }
  } else if (cohortId === 'cloud') {
    const originX = w * 0.35; const originY = h * 0.5;
    const glow = ctx.createRadialGradient(originX, originY, 30, originX, originY, 750);
    glow.addColorStop(0, 'rgba(66, 133, 244, 0.5)'); glow.addColorStop(0.5, 'rgba(92, 107, 192, 0.25)'); glow.addColorStop(1, 'rgba(18, 19, 23, 0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) {
      const offsetY = originY - 320 + i * 85 + Math.sin(t * 2.5 + i) * 14;
      const beamWidth = 450 + Math.cos(t * 2 + i * 0.5) * 80 + i * 25; const startX = 0;
      const grad = ctx.createLinearGradient(startX, offsetY, startX + beamWidth, offsetY);
      grad.addColorStop(0, 'rgba(66, 133, 244, 0.6)'); grad.addColorStop(0.7, 'rgba(92, 107, 192, 0.4)'); grad.addColorStop(1, 'rgba(142, 68, 173, 0)');
      ctx.fillStyle = grad; ctx.fillRect(startX, offsetY, beamWidth, 30);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(startX + beamWidth - 20, offsetY + 6, 8, 18);
    }
  } else {
    const originX = w * 0.98; const originY = h * 0.96;
    const glow = ctx.createRadialGradient(originX, originY, 50, originX, originY, 950);
    glow.addColorStop(0, 'rgba(66, 133, 244, 0.45)'); glow.addColorStop(0.3, 'rgba(234, 67, 53, 0.25)'); glow.addColorStop(1, 'rgba(18, 19, 23, 0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
  }
}

function drawFallbackLogo(ctx: CanvasRenderingContext2D, x: number, y: number, scale = 1.0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
  ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(16, 18, 14, -0.4, 1.8 * Math.PI); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(16, 18); ctx.lineTo(30, 18); ctx.stroke();
  ctx.fillStyle = '#FFFFFF'; ctx.font = '500 28px "Google Sans Flex", sans-serif'; ctx.fillText('Google for Startups', 44, 26);
  ctx.restore();
}