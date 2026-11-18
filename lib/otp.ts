// In-memory OTP storage for email verification
interface OtpEntry {
  code: string;
  expiresAt: number;
  attempts: number;
}

const otpStore = new Map<string, OtpEntry>();

// Clean expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [email, entry] of otpStore.entries()) {
      if (entry.expiresAt < now) {
        otpStore.delete(email);
      }
    }
  }, 5 * 60 * 1000);
}

export function generateOtp(email: string): string {
  const cleanEmail = email.trim().toLowerCase();
  // 6-digit random number between 100000 and 999999
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(cleanEmail, {
    code,
    expiresAt,
    attempts: 0,
  });

  return code;
}

export function verifyOtp(email: string, code: string): { valid: boolean; reason?: string } {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.trim();
  const entry = otpStore.get(cleanEmail);

  if (!entry) {
    return { valid: false, reason: 'No verification code found. Please request a new code.' };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(cleanEmail);
    return { valid: false, reason: 'Verification code has expired. Please request a new one.' };
  }

  if (entry.attempts >= 5) {
    otpStore.delete(cleanEmail);
    return { valid: false, reason: 'Too many incorrect attempts. Please request a new code.' };
  }

  if (entry.code !== cleanCode) {
    entry.attempts += 1;
    return { valid: false, reason: 'Incorrect verification code. Please try again.' };
  }

  // Verified! Remove OTP from store
  otpStore.delete(cleanEmail);
  return { valid: true };
}

export function clearOtp(email: string): void {
  otpStore.delete(email.trim().toLowerCase());
}
