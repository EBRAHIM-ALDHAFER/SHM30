import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Camera, X, RefreshCw, Sparkles, AlertCircle, Play, Square, SwitchCamera, Check } from "lucide-react";

interface CameraBarcodeScannerProps {
 onScanSuccess: (decodedText: string) => void;
 onClose: () => void;
 playBeep: () => void;
 theme: any;
}

export default function CameraBarcodeScanner({
 onScanSuccess,
 onClose,
 playBeep,
 theme
}: CameraBarcodeScannerProps) {
 const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
 const [activeCameraId, setActiveCameraId] = useState<string>("");
 const [isScanning, setIsScanning] = useState<boolean>(false);
 const [scanError, setScanError] = useState<string | null>(null);
 const [continuousMode, setContinuousMode] = useState<boolean>(true);
 const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
 const [lastScannedTime, setLastScannedTime] = useState<number>(0);
 
 const scannerRef = useRef<Html5Qrcode | null>(null);
 const containerId = "pos-barcode-scanner-viewport";

 // Request cameras on mount
 useEffect(() => {
 Html5Qrcode.getCameras()
 .then((devices) => {
 if (devices && devices.length > 0) {
 setCameras(devices);
 // Auto-select back camera if present, otherwise first available
 const backCam = devices.find(
 (device) =>
 device.label.toLowerCase().includes("back") ||
 device.label.toLowerCase().includes("rear") ||
 device.label.toLowerCase().includes("environment")
 );
 setActiveCameraId(backCam ? backCam.id : devices[0].id);
 } else {
 setScanError("لم يتم العثور على كاميرات نشطة في هذا الجهاز.");
 }
 })
 .catch((err) => {
 console.error("Error getting cameras", err);
 setScanError("خطأ في صلاحية الكاميرا. يرجى السماح بالوصول للكاميرا من المتصفح.");
 });

 return () => {
 stopScanning();
 };
 }, []);

 // Trigger scanning when activeCameraId or active states change
 useEffect(() => {
 if (activeCameraId && !isScanning && !scanError) {
 startScanning(activeCameraId);
 }
 }, [activeCameraId]);

 const startScanning = async (cameraId: string) => {
 try {
 setScanError(null);
 
 // If there is any existing instance, stop it
 if (scannerRef.current) {
 await stopScanning();
 }

 const formats = [
 Html5QrcodeSupportedFormats.QR_CODE,
 Html5QrcodeSupportedFormats.EAN_13,
 Html5QrcodeSupportedFormats.EAN_8,
 Html5QrcodeSupportedFormats.CODE_128,
 Html5QrcodeSupportedFormats.CODE_39,
 Html5QrcodeSupportedFormats.CODE_93,
 Html5QrcodeSupportedFormats.UPC_A,
 Html5QrcodeSupportedFormats.UPC_E,
 Html5QrcodeSupportedFormats.ITF
 ];

 const html5QrCode = new Html5Qrcode(containerId, { verbose: false, formatsToSupport: formats });
 scannerRef.current = html5QrCode;

 setIsScanning(true);

 const config = {
 fps: 15,
 // Wide rectangle box optimized for 1D barcodes and QR codes
 qrbox: (width: number, height: number) => {
 const defaultWidth = Math.min(width * 0.75, 450);
 const defaultHeight = Math.min(height * 0.45, 180);
 return {
 width: Math.max(defaultWidth, 220),
 height: Math.max(defaultHeight, 100)
 };
 },
 aspectRatio: 1.777778 // 16:9 widescreen layout prefers barcodes
 };

 await html5QrCode.start(
 cameraId,
 {
 fps: config.fps,
 qrbox: config.qrbox,
 aspectRatio: config.aspectRatio
 },
 (decodedText) => {
 handleSuccessScan(decodedText);
 },
 (errorMessage) => {
 // Dev verbose log, typically ignored to prevent flood
 }
 );
 } catch (err: any) {
 console.error("Failed to start scanning", err);
 setScanError(`فشل بدء تشغيل الكاميرا المحددة: ${err.message || err}`);
 setIsScanning(false);
 }
 };

 const stopScanning = async () => {
 if (scannerRef.current) {
 try {
 if (scannerRef.current.isScanning) {
 await scannerRef.current.stop();
 }
 } catch (err) {
 console.warn("Failed to stop scanner cleanly:", err);
 } finally {
 scannerRef.current = null;
 setIsScanning(false);
 }
 }
 };

 const handleSuccessScan = (decodedText: string) => {
 const now = Date.now();
 // Throttle duplicate scanning of the exact same code within 2 seconds
 if (decodedText === lastScannedCode && now - lastScannedTime < 2200) {
 return;
 }

 playBeep();
 setLastScannedCode(decodedText);
 setLastScannedTime(now);
 onScanSuccess(decodedText);

 if (!continuousMode) {
 stopScanning();
 onClose();
 }
 };

 const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
 const nextId = e.target.value;
 setActiveCameraId(nextId);
 };

 const toggleContinuous = () => {
 setContinuousMode((prev) => !prev);
 };

 return (
 <div className="fixed inset-0 z-5500 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-right" style={{ direction: "rtl" }}>
 <div 
 className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800 shadow-2xl flex flex-col"
 style={{ backgroundColor: theme.surface, color: theme.text }}
 >
 {/* Header */}
 <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
 <div className="flex items-center gap-2.5">
 <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
 <Camera className="w-4 h-4 text-amber-500 animate-pulse" />
 </div>
 <div>
 <h3 className="text-sm font-black text-white">ماسح الباركود بالكاميرا الثنائي المطور</h3>
 <p className="text-[10px] text-gray-400 mt-0.5">امسح الباركود (EAN, UPC, Code128) أو كود QR مباشرة وسريعاً</p>
 </div>
 </div>
 <button 
 onClick={() => {
 stopScanning().finally(onClose);
 }}
 className="p-1 px-2 text-xs font-black bg-slate-900 border border-slate-800 rounded-lg text-gray-400 hover:text-white cursor-pointer transition-all"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Camera Selector */}
 {cameras.length > 1 && (
 <div className="px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/40 flex items-center justify-between gap-3 text-xs">
 <span className="text-gray-400 font-bold flex items-center gap-1">
 <SwitchCamera className="w-3.5 h-3.5 text-amber-500" />
 <span>تبديل كاميرا الإدخال:</span>
 </span>
 <select
 value={activeCameraId}
 onChange={handleCameraChange}
 className="py-1 px-2.5 text-[11px] rounded-lg border border-slate-800 bg-slate-900 text-white outline-none focus:border-amber-500 cursor-pointer font-bold shrink-0 max-w-[200px]"
 >
 {cameras.map((cam) => (
 <option key={cam.id} value={cam.id}>
 {cam.label || `كاميرا ${cam.id.substring(0, 5)}...`}
 </option>
 ))}
 </select>
 </div>
 )}

 {/* Viewport Area */}
 <div className="relative aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
 {/* Main html5-qrcode element */}
 <div id={containerId} className="w-full h-full object-cover [&>video]:object-cover" />

 {/* Custom Overlay laser lines and box */}
 {isScanning && !scanError && (
 <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
 {/* Central scanning rectangle */}
 <div className="relative w-[75%] h-[45%] md:w-[70%] md:h-[40%] rounded-xl border-2 border-amber-500/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] flex flex-col justify-between">
 
 {/* 4 Corner brackets */}
 <div className="absolute -top-[2px] -left-[2px] w-6 h-6 border-t-4 border-l-4 border-amber-500 rounded-tl-md"></div>
 <div className="absolute -top-[2px] -right-[2px] w-6 h-6 border-t-4 border-r-4 border-amber-500 rounded-tr-md"></div>
 <div className="absolute -bottom-[2px] -left-[2px] w-6 h-6 border-b-4 border-l-4 border-amber-500 rounded-bl-md"></div>
 <div className="absolute -bottom-[2px] -right-[2px] w-6 h-6 border-b-4 border-r-4 border-amber-500 rounded-br-md"></div>

 {/* Pulsating horizontal Red Laser scanner line */}
 <div className="w-full h-[3px] bg-rose-500/95 absolute left-0 right-0 top-1/2 -translate-y-1/2 animate-bounce shadow-[0_0_12px_#ef4444]" />

 {/* Subtext info */}
 <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/75 px-3 py-1 rounded-full text-[9px] text-zinc-300 font-sans tracking-wide">
 ضع خط الباركود الفضي مقابل الخط الأحمر
 </div>
 </div>
 </div>
 )}

 {/* Scanner Errors / Grant permissions */}
 {scanError && (
 <div className="absolute inset-x-0 mx-6 p-5 rounded-2xl bg-slate-950/95 border border-rose-500/20 text-center flex flex-col items-center gap-3">
 <AlertCircle className="w-10 h-10 text-rose-500" />
 <h4 className="text-xs font-black text-rose-400">عذراً! تعذر تشغيل الكاميرا</h4>
 <p className="text-[10px] text-gray-400 leading-relaxed max-w-xs">
 {scanError}
 </p>
 <button
 onClick={() => {
 if (activeCameraId) startScanning(activeCameraId);
 else {
 Html5Qrcode.getCameras().then((devices) => {
 if (devices && devices.length > 0) {
 setCameras(devices);
 setActiveCameraId(devices[0].id);
 }
 });
 }
 }}
 className="py-1.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg text-[10px] text-rose-400 font-bold cursor-pointer transition-all flex items-center gap-1.5"
 >
 <RefreshCw className="w-3.5 h-3.5" />
 <span>إعادة المحاولة والمزامنة</span>
 </button>
 </div>
 )}

 {/* Loading source indicator */}
 {!isScanning && !scanError && (
 <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center gap-3 text-center">
 <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
 <p className="text-[10px] text-gray-400">جاري الاتصال بقناة الفيديو الآمنة للجهاز...</p>
 </div>
 )}
 </div>

 {/* Dynamic scan result display footer section */}
 <div className="p-4 bg-slate-950/60 border-t border-slate-800/60 text-xs flex flex-col gap-3">
 
 {/* Continuous Batch Scan state option */}
 <div className="flex items-center justify-between gap-4">
 <span className="text-gray-300 text-[10.5px] font-bold">آلية مسار المسح المتدفق:</span>
 
 <button
 onClick={toggleContinuous}
 className={`py-1.5 px-3 rounded-lg text-[10px] font-black border transition-all cursor-pointer flex items-center gap-1.5 ${
 continuousMode 
 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
 : "bg-slate-900 text-gray-400 border-slate-800"
 }`}
 >
 {continuousMode ? "✓ مسح دفعي متكرر (سريع)" : "مسح فردي (إقفال تلقائي)"}
 </button>
 </div>

 {/* Last scanned code logs */}
 {lastScannedCode && (
 <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between gap-3 text-[11px] animate-fade-in">
 <div className="flex items-center gap-2">
 <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
 <span className="text-zinc-400">آخر كود تم رصده تماماً:</span>
 </div>
 <span className="font-mono font-bold text-amber-400 tracking-wider bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
 {lastScannedCode}
 </span>
 </div>
 )}

 {/* Instructions and Controls */}
 <div className="flex items-center justify-between border-t border-slate-800/40 pt-3 mt-1">
 <p className="text-[9.5px] text-gray-500 leading-relaxed max-w-[280px]">
 <span className="text-amber-500/80">تلميح مالي:</span> سيقوم الماسح بالبحث عن SKU أو الباركود المطابق فوراً في مخزنك المعتمد بقاعدة البيانات وإدخاله في سلة المبيعات مع تشغيل رنة التأكيد.
 </p>
 
 <div className="flex gap-2">
 {isScanning ? (
 <button
 onClick={stopScanning}
 className="py-1.5 px-3 rounded-lg bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 text-[10px] font-black cursor-pointer transition-all flex items-center gap-1"
 >
 <Square className="w-3 h-3 fill-rose-400" />
 <span>إيقاف مؤقت</span>
 </button>
 ) : (
 activeCameraId && (
 <button
 onClick={() => startScanning(activeCameraId)}
 className="py-1.5 px-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-black cursor-pointer transition-all flex items-center gap-1"
 >
 <Play className="w-3 h-3 fill-emerald-400" />
 <span>تشغيل</span>
 </button>
 )
 )}
 </div>
 </div>

 </div>

 </div>
 </div>
 );
}
