import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { passwordAPI } from '../../services/api';
import Button from '../../components/Button';

export default function OTPVerificationPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const inputRefs = useRef([]);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const email = sessionStorage.getItem('resetEmail');

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index, value) => {
    if (value.length > 1) {
      value = value[value.length - 1];
    }
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    if (pasted.length === 6) {
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      addToast('Please enter the complete OTP', 'warning');
      return;
    }

    setLoading(true);
    try {
      const result = await passwordAPI.verifyOTP(email, otpString);
      if (result.data.success) {
        addToast('OTP verified successfully!', 'success');
        sessionStorage.setItem('resetToken', result.data.data.resetToken);
        navigate('/reset-password');
      } else {
        addToast(result.data.message || 'Invalid OTP', 'error');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid or expired OTP';
      addToast(message, 'error');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    try {
      await passwordAPI.resendOTP(email);
      addToast('New OTP sent!', 'success');
      setCountdown(30);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error) {
      addToast('Failed to resend OTP. Please try again.', 'error');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{
            backgroundColor: 'rgba(var(--color-accent), 0.1)',
            border: '1px solid rgba(var(--color-accent), 0.15)',
          }}
        >
          <svg className="w-6 h-6" style={{ color: 'rgb(var(--color-accent))' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-textPrimary">
          Check your email
        </h1>
        <p className="text-sm text-text-textSecondary mt-1.5">
          Enter the 6-digit code sent to <span className="text-text-textPrimary font-medium">{email}</span>
        </p>
      </div>

      {/* OTP Input */}
      <div className="flex justify-center gap-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            className="w-12 h-14 text-center text-lg font-bold rounded-xl transition-all duration-200 text-textPrimary"
            style={{
              backgroundColor: digit ? 'rgba(var(--color-accent), 0.08)' : 'var(--color-surface)',
              border: digit
                ? '1px solid rgba(var(--color-accent), 0.3)'
                : '1px solid var(--color-border)',
              caretColor: 'rgb(var(--color-accent))',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(var(--color-accent), 0.4)';
              e.target.style.boxShadow = '0 0 0 3px rgba(var(--color-accent), 0.08)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = digit
                ? 'rgba(var(--color-accent), 0.3)'
                : 'var(--color-border)';
              e.target.style.boxShadow = 'none';
            }}
          />
        ))}
      </div>

      {/* Submit */}
      <Button
        type="button"
        onClick={handleSubmit}
        loading={loading}
        className="w-full"
        size="lg"
      >
        {loading ? 'Verifying...' : 'Verify code'}
      </Button>

      {/* Resend */}
      <div className="text-center">
        <p className="text-sm text-textSecondary">
          Didn&apos;t receive a code?{' '}
          {countdown > 0 ? (
            <span className="text-text-textSecondary font-medium">Resend in {countdown}s</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="text-accent-text hover:text-accent-text/80 transition-colors font-medium disabled:opacity-50"
            >
              {resendLoading ? 'Sending...' : 'Resend code'}
            </button>
          )}
        </p>
      </div>

      {/* Back link */}
      <div className="text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-text-textSecondary hover:text-accent-text transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to login
        </Link>
      </div>
    </div>
  );
}
