import { emailService } from './email.service';

interface OtpEntry {
  otp: string;
  expiresAt: number;
}

class OtpService {
  private otps: Map<string, OtpEntry> = new Map();
  private OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

  generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async generateAndSendOtp(email: string): Promise<boolean> {
    const otp = this.generateOtp();
    const expiresAt = Date.now() + this.OTP_EXPIRY_MS;
    this.otps.set(email, { otp, expiresAt });
    return emailService.sendOtpEmail(email, otp);
  }

  verifyOtp(email: string, otp: string): boolean {
    const entry = this.otps.get(email);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.otps.delete(email);
      return false;
    }
    if (entry.otp !== otp) return false;
    this.otps.delete(email);
    return true;
  }

  clearOtp(email: string) {
    this.otps.delete(email);
  }
}

export const otpService = new OtpService(); 