import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import { passwordAPI } from '../../services/api';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { addToast } = useToast();
  const navigate = useNavigate();
  const resetToken = sessionStorage.getItem('resetToken');

  useEffect(() => {
    if (!resetToken) {
      navigate('/forgot-password');
    }
  }, [resetToken, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const { newPassword } = formData;

    if (!newPassword) newErrors.newPassword = 'Password is required';
    else if (newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])/.test(newPassword))
      newErrors.newPassword = 'Must contain a lowercase letter';
    else if (!/(?=.*[A-Z])/.test(newPassword))
      newErrors.newPassword = 'Must contain an uppercase letter';
    else if (!/(?=.*\d)/.test(newPassword))
      newErrors.newPassword = 'Must contain a number';
    else if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(newPassword))
      newErrors.newPassword = 'Must contain a special character';

    if (formData.newPassword !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await passwordAPI.resetPassword(
        resetToken,
        formData.newPassword,
        formData.confirmPassword
      );

      if (result.data.success) {
        addToast('Password reset successfully! Please log in.', 'success');
        sessionStorage.removeItem('resetToken');
        sessionStorage.removeItem('resetEmail');
        navigate('/login');
      } else {
        addToast(result.data.message || 'Failed to reset password', 'error');
      }
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to reset password. Token may be expired.';
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const pwd = formData.newPassword;
    if (!pwd) return { label: '', color: '', bars: 0, textColor: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/(?=.*[a-z])/.test(pwd)) score++;
    if (/(?=.*[A-Z])/.test(pwd)) score++;
    if (/(?=.*\d)/.test(pwd)) score++;
    if (/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(pwd)) score++;
    if (score <= 2) return { label: 'Weak', color: 'bg-danger', textColor: 'text-danger', bars: Math.max(1, score) };
    if (score <= 3) return { label: 'Fair', color: 'bg-warning', textColor: 'text-warning', bars: score };
    if (score <= 4) return { label: 'Good', color: 'bg-accent', textColor: 'text-accent-text', bars: score };
    return { label: 'Strong', color: 'bg-success', textColor: 'text-success', bars: score };
  };

  const strength = getPasswordStrength();

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
          Set new password
        </h1>
        <p className="text-sm text-text-textSecondary mt-1.5">
          Create a strong password for your account
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Input
            label="New Password"
            name="newPassword"
            type="password"
            placeholder="Enter new password"
            value={formData.newPassword}
            onChange={handleChange}
            error={errors.newPassword}
          />
          {formData.newPassword && (
            <div className="space-y-1.5 pt-0.5">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i <= strength.bars ? strength.color : ''
                    }`}
                    style={i <= strength.bars ? {} : { backgroundColor: 'var(--color-border)' }}
                  />
                ))}
              </div>
              <p className={`text-xs ${strength.textColor} font-medium`}>
                {strength.label} password
              </p>
            </div>
          )}
        </div>

        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          placeholder="Confirm new password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <Button type="submit" loading={loading} className="w-full" size="lg">
          {loading ? 'Resetting...' : 'Reset password'}
        </Button>
      </form>

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
