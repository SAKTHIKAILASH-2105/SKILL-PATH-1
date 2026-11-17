'use client';

import React, { useState, useRef } from 'react';
import {
  Award,
  CheckCircle2,
  Download,
  Printer,
  Share2,
  X,
  Sparkles,
  ShieldCheck,
  Calendar,
  ExternalLink,
  Edit2,
  Check,
  Copy,
  GraduationCap,
  FileCheck,
} from 'lucide-react';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  courseId: string;
  userName?: string;
  skills?: string[];
  completionDate?: string;
}

export function CertificateModal({
  isOpen,
  onClose,
  courseTitle,
  courseId,
  userName = 'Student',
  skills = [],
  completionDate,
}: CertificateModalProps) {
  const [recipientName, setRecipientName] = useState(userName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [savingToProfile, setSavingToProfile] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const formattedDate =
    completionDate ||
    new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const certHash = Math.abs(
    (courseId + recipientName).split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
  )
    .toString(36)
    .toUpperCase()
    .padStart(8, '0');

  const verificationId = `PW-CERT-${courseId.replace('crs_', '').toUpperCase()}-${certHash}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCertificate = () => {
    setIsDownloading(true);
    try {
      const width = 1600;
      const height = 1130;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        window.print();
        setIsDownloading(false);
        return;
      }

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#fffdfa');
      bgGrad.addColorStop(0.5, '#ffffff');
      bgGrad.addColorStop(1, '#fefbf3');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Outer golden border
      ctx.lineWidth = 14;
      ctx.strokeStyle = '#d97706';
      ctx.strokeRect(30, 30, width - 60, height - 60);

      // Inner thin golden border
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#f59e0b';
      ctx.strokeRect(48, 48, width - 96, height - 96);

      // Corner ornaments
      const drawCorner = (x: number, y: number, dirX: number, dirY: number) => {
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#b45309';
        ctx.beginPath();
        ctx.moveTo(x, y + dirY * 40);
        ctx.lineTo(x, y);
        ctx.lineTo(x + dirX * 40, y);
        ctx.stroke();
      };
      drawCorner(60, 60, 1, 1);
      drawCorner(width - 60, 60, -1, 1);
      drawCorner(60, height - 60, 1, -1);
      drawCorner(width - 60, height - 60, -1, -1);

      // Top Crest Circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(width / 2, 140, 48, 0, Math.PI * 2);
      const crestGrad = ctx.createLinearGradient(width / 2 - 48, 92, width / 2 + 48, 188);
      crestGrad.addColorStop(0, '#d97706');
      crestGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = crestGrad;
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#fef3c7';
      ctx.stroke();

      // Star in crest
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★', width / 2, 140);
      ctx.restore();

      // Top Institution Name
      ctx.textAlign = 'center';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = '#92400e';
      ctx.letterSpacing = '6px';
      ctx.fillText('PROMPTWARS ACADEMY', width / 2, 220);

      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.letterSpacing = '3px';
      ctx.fillText('ADAPTIVE AI LEARNING & VERIFIED CREDENTIALS', width / 2, 246);

      // Main Certificate Title
      ctx.font = '900 48px Georgia, serif';
      ctx.fillStyle = '#0f172a';
      ctx.letterSpacing = '2px';
      ctx.fillText('CERTIFICATE OF COMPLETION', width / 2, 330);

      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.letterSpacing = '4px';
      ctx.fillText('THIS CREDENTIAL IS PROUDLY AWARDED TO', width / 2, 375);

      // Recipient Name
      ctx.font = 'bold 54px Georgia, serif';
      ctx.fillStyle = '#1e293b';
      ctx.letterSpacing = '1px';
      ctx.fillText(recipientName, width / 2, 455);

      // Gold line under name
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#d97706';
      ctx.beginPath();
      ctx.moveTo(width / 2 - 280, 480);
      ctx.lineTo(width / 2 + 280, 480);
      ctx.stroke();

      // Small diamond on line
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(width / 2, 480, 5, 0, Math.PI * 2);
      ctx.fill();

      // Body text
      ctx.font = '20px sans-serif';
      ctx.fillStyle = '#334155';
      ctx.letterSpacing = '0.5px';
      ctx.fillText(
        'for successfully mastering all modules, rigorous diagnostic evaluations,',
        width / 2,
        535
      );
      ctx.fillText(
        'hands-on video masterclasses, and verified competency assessments in',
        width / 2,
        568
      );

      // Course Title Box
      const courseBoxWidth = 750;
      const courseBoxHeight = 65;
      const courseBoxX = width / 2 - courseBoxWidth / 2;
      const courseBoxY = 605;

      ctx.fillStyle = '#fffbeb';
      ctx.fillRect(courseBoxX, courseBoxY, courseBoxWidth, courseBoxHeight);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#f59e0b';
      ctx.strokeRect(courseBoxX, courseBoxY, courseBoxWidth, courseBoxHeight);

      ctx.font = 'bold 30px Georgia, serif';
      ctx.fillStyle = '#78350f';
      ctx.fillText(courseTitle, width / 2, courseBoxY + 44);

      // Skills tags (if any)
      if (skills && skills.length > 0) {
        const skillsText = skills.slice(0, 4).join('  •  ');
        ctx.font = 'bold 15px sans-serif';
        ctx.fillStyle = '#0284c7';
        ctx.letterSpacing = '1px';
        ctx.fillText(`VERIFIED SKILLS: ${skillsText.toUpperCase()}`, width / 2, 705);
      }

      // Divider before signatures
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(120, 750);
      ctx.lineTo(width - 120, 750);
      ctx.stroke();

      // Left Signature
      ctx.font = 'italic 28px Georgia, serif';
      ctx.fillStyle = '#1e293b';
      ctx.fillText('Dr. Elena Rostova', 300, 830);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(200, 845);
      ctx.lineTo(400, 845);
      ctx.stroke();
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText('DR. ELENA ROSTOVA', 300, 870);
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('Director of Academic Affairs', 300, 890);

      // Center Official Seal
      ctx.save();
      const sealX = width / 2;
      const sealY = 850;
      ctx.beginPath();
      ctx.arc(sealX, sealY, 55, 0, Math.PI * 2);
      const sealGrad = ctx.createLinearGradient(sealX - 55, sealY - 55, sealX + 55, sealY + 55);
      sealGrad.addColorStop(0, '#fef3c7');
      sealGrad.addColorStop(0.5, '#fde68a');
      sealGrad.addColorStop(1, '#f59e0b');
      ctx.fillStyle = sealGrad;
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#b45309';
      ctx.stroke();

      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#78350f';
      ctx.letterSpacing = '2px';
      ctx.fillText('OFFICIAL SEAL', sealX, sealY - 14);
      ctx.font = '900 18px sans-serif';
      ctx.fillText('VERIFIED', sealX, sealY + 8);
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('ACCREDITED', sealX, sealY + 26);
      ctx.restore();

      // Right Signature
      ctx.font = 'italic 28px Georgia, serif';
      ctx.fillStyle = '#1e293b';
      ctx.fillText('Marcus Vance', width - 300, 830);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(width - 400, 845);
      ctx.lineTo(width - 200, 845);
      ctx.stroke();
      ctx.font = 'bold 14px sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText('MARCUS VANCE', width - 300, 870);
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('Lead Curriculum Architect', width - 300, 890);

      // Bottom Metadata Bar
      ctx.font = '13px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'left';
      ctx.fillText(`DATE OF ISSUANCE: ${formattedDate.toUpperCase()}`, 100, 1050);

      ctx.textAlign = 'right';
      ctx.font = 'bold 13px monospace';
      ctx.fillStyle = '#475569';
      ctx.fillText(`CREDENTIAL ID: ${verificationId}`, width - 100, 1050);

      // Trigger instant PNG Download
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            window.print();
            setIsDownloading(false);
            return;
          }
          const blobUrl = URL.createObjectURL(blob);
          const downloadAnchor = document.createElement('a');
          const safeName = recipientName.replace(/[^a-zA-Z0-9]/g, '_');
          const safeCourse = courseTitle.replace(/[^a-zA-Z0-9]/g, '_');
          downloadAnchor.href = blobUrl;
          downloadAnchor.download = `SkillPath_Certificate_${safeCourse}_${safeName}.png`;
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          document.body.removeChild(downloadAnchor);
          URL.revokeObjectURL(blobUrl);

          setDownloadSuccess(true);
          setTimeout(() => setDownloadSuccess(false), 3000);
          setIsDownloading(false);
        },
        'image/png',
        1.0
      );
    } catch (err) {
      console.error('Download failed, falling back to print:', err);
      window.print();
      setIsDownloading(false);
    }
  };

  const handleSaveToProfile = async () => {
    setSavingToProfile(true);
    try {
      const res = await fetch('/api/user/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${courseTitle} - Certificate of Mastery`,
          issuer: 'PromptWars Academy & Adaptive Learning Engine',
          date: new Date().toISOString().split('T')[0],
          url: `/courses/${courseId}`,
        }),
      });
      if (res.ok) {
        setSavedSuccess(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingToProfile(false);
    }
  };

  const handleCopyLink = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/courses/${courseId}?cert=${verificationId}` : '';
    if (url && navigator?.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static">
      {/* Print Specific CSS */}
      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 0;
          }
          body * {
            visibility: hidden !important;
          }
          #certificate-print-area,
          #certificate-print-area * {
            visibility: visible !important;
          }
          #certificate-print-area {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 2.5rem !important;
            background: #ffffff !important;
            box-shadow: none !important;
            border: 8px double #d97706 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200 print:border-none print:shadow-none print:rounded-none">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>Verified Certificate of Completion</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                  Official
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Issued by SkillPath AI Learning Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Primary Direct Download Button */}
            <button
              onClick={handleDownloadCertificate}
              disabled={isDownloading}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all ${
                downloadSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-700/20'
              }`}
              title="Instantly download high-resolution certificate image (PNG)"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Downloaded! ✓</span>
                </>
              ) : isDownloading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating Certificate...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Certificate</span>
                </>
              )}
            </button>

            {/* Print / Save as PDF Button */}
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleSaveToProfile}
              disabled={savingToProfile || savedSuccess}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors ${
                savedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{savingToProfile ? 'Saving...' : 'Save to Profile'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyLink}
              className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors hover:bg-slate-800"
              title="Copy verification link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors hover:bg-slate-800 ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* PRINTABLE CERTIFICATE CANVAS */}
        {/* ======================================================== */}
        <div
          id="certificate-print-area"
          className="relative p-8 sm:p-14 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 text-center select-none overflow-hidden"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.04) 0%, rgba(255, 255, 255, 1) 100%)',
          }}
        >
          {/* Decorative Outer Border */}
          <div className="absolute inset-4 sm:inset-6 border-4 border-amber-600/70 rounded-2xl pointer-events-none" />
          <div className="absolute inset-6 sm:inset-8 border border-amber-400/50 rounded-xl pointer-events-none" />

          {/* Corner Ornaments */}
          <div className="absolute top-7 left-7 sm:top-9 sm:left-9 w-6 h-6 border-t-2 border-l-2 border-amber-600 pointer-events-none" />
          <div className="absolute top-7 right-7 sm:top-9 sm:right-9 w-6 h-6 border-t-2 border-r-2 border-amber-600 pointer-events-none" />
          <div className="absolute bottom-7 left-7 sm:bottom-9 sm:left-9 w-6 h-6 border-b-2 border-l-2 border-amber-600 pointer-events-none" />
          <div className="absolute bottom-7 right-7 sm:bottom-9 sm:right-9 w-6 h-6 border-b-2 border-r-2 border-amber-600 pointer-events-none" />

          {/* Watermark Crest Background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none">
            <Award className="w-96 h-96 text-amber-900" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            {/* Academy Header */}
            <div className="flex flex-col items-center justify-center space-y-1">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-white flex items-center justify-center shadow-md mb-2 border-2 border-white">
                <Award className="w-8 h-8" />
              </div>
              <div className="tracking-[0.25em] uppercase text-[11px] font-extrabold text-amber-800">
                SkillPath Academy
              </div>
              <div className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">
                Adaptive AI Learning & Verified Credentials
              </div>
            </div>

            {/* Main Title */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight font-serif uppercase">
                Certificate of Completion
              </h1>
              <p className="text-xs text-slate-600 font-medium tracking-widest uppercase">
                This credential is proudly awarded to
              </p>
            </div>

            {/* Recipient Name with Inline Edit */}
            <div className="py-2">
              {isEditingName ? (
                <div className="no-print inline-flex items-center gap-2">
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="text-xl sm:text-2xl font-serif font-bold text-center border-b-2 border-blue-600 outline-none text-slate-900 px-3 py-1 bg-white"
                    autoFocus
                  />
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="p-1 rounded bg-blue-600 text-white text-xs font-semibold"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="group inline-flex items-center justify-center gap-2 border-b-2 border-amber-600/60 pb-1 px-8">
                  <span className="text-2xl sm:text-4xl font-serif font-black text-slate-900 tracking-wide">
                    {recipientName}
                  </span>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="no-print opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600 transition-opacity p-1"
                    title="Edit Name on Certificate"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Certificate Body Paragraph */}
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-xl mx-auto font-sans">
              for successfully mastering all modules, rigorous diagnostic evaluations, hands-on video masterclasses, and verified competency assessments in
            </p>

            {/* Course Title */}
            <div className="py-1">
              <div className="inline-block bg-amber-500/10 border border-amber-500/30 rounded-2xl px-6 py-2.5 shadow-xs">
                <h2 className="text-lg sm:text-2xl font-bold text-amber-900 font-serif">
                  {courseTitle}
                </h2>
              </div>
            </div>

            {/* Verified Skills Pill Badges */}
            {skills.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-lg mx-auto pt-1">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-700 border border-amber-200/80 shadow-2xs"
                  >
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Signatures & Seal Section */}
            <div className="grid grid-cols-3 items-end pt-8 gap-4 border-t border-slate-200 mt-6">
              {/* Left Signee */}
              <div className="text-center space-y-1">
                <div className="font-serif italic text-base sm:text-lg text-slate-800 tracking-wider">
                  Elena Rostova
                </div>
                <div className="h-0.5 w-24 bg-slate-400 mx-auto" />
                <div className="text-[10px] font-bold text-slate-700 uppercase">Dr. Elena Rostova</div>
                <div className="text-[9px] text-slate-500">Director of Academic Affairs</div>
              </div>

              {/* Center Seal */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-amber-500/80 bg-gradient-to-br from-amber-100 to-amber-200 flex flex-col items-center justify-center text-amber-800 shadow-md p-1">
                  <ShieldCheck className="w-6 h-6 text-amber-700" />
                  <span className="text-[8px] font-black uppercase tracking-wider mt-0.5">VERIFIED</span>
                </div>
                <span className="text-[9px] text-amber-900 font-bold mt-1 tracking-wider uppercase">
                  Official Seal
                </span>
              </div>

              {/* Right Signee */}
              <div className="text-center space-y-1">
                <div className="font-serif italic text-base sm:text-lg text-slate-800 tracking-wider">
                  Marcus Vance
                </div>
                <div className="h-0.5 w-24 bg-slate-400 mx-auto" />
                <div className="text-[10px] font-bold text-slate-700 uppercase">Marcus Vance</div>
                <div className="text-[9px] text-slate-500">Lead Curriculum Architect</div>
              </div>
            </div>

            {/* Bottom Metadata & Verification Code */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 border-t border-dashed border-slate-200 gap-2">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>Date of Conformance: <strong className="text-slate-700">{formattedDate}</strong></span>
              </div>

              <div className="font-mono text-[9px] sm:text-[10px] text-slate-600 bg-slate-100/80 px-2 py-0.5 rounded border border-slate-200">
                Credential ID: <strong>{verificationId}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Modal Actions (Hidden when printing) */}
        <div className="no-print bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <span>Click <strong>Download Certificate</strong> to save your high-resolution verified credential.</span>
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
