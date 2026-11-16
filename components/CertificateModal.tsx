'use client';

import React, { useState } from 'react';
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
  userName = 'Aarav Sharma',
  skills = [],
  completionDate,
}: CertificateModalProps) {
  const [recipientName, setRecipientName] = useState(userName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [savingToProfile, setSavingToProfile] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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
              <p className="text-[11px] text-slate-400">Issued by PromptWars Adaptive AI Learning Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>

            <button
              onClick={handleSaveToProfile}
              disabled={savingToProfile || savedSuccess}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors ${
                savedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved to Profile ✓</span>
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
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors hover:bg-slate-800"
              title="Copy verification link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors hover:bg-slate-800 ml-2"
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
                PromptWars Academy
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
          <p className="text-xs text-slate-500">
            Click <strong>Print / Download PDF</strong> to save your certificate in pristine quality or submit it to LinkedIn.
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
