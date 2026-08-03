import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.emailOrUsername.trim()) {
      newErrors.emailOrUsername = 'Email or username is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await login(
        formData.emailOrUsername,
        formData.password,
        formData.rememberMe
      );

      if (result.success) {
        addToast('Login successful!', 'success');
        const userData = result.data.user;
        const role = userData.role;

        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else if (role === 'company') {
          const verificationStatus = userData.verificationStatus;
          if (verificationStatus === 'verified') {
            navigate('/company/dashboard');
          } else if (verificationStatus === 'pending') {
            navigate('/company/verification-pending');
          } else if (verificationStatus === 'rejected') {
            navigate('/company/verification-rejected');
          } else {
            navigate('/company/verification-pending');
          }
        } else {
          navigate('/user/dashboard');
        }
      } else {
        addToast(result.message || 'Login failed', 'error');
      }
    } catch (error) {
      const message = error.message || 'Unable to login. Please try again.';
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-textPrimary">
          Welcome back
        </h1>
        <p className="text-sm text-text-textSecondary mt-1.5">
          Sign in to your account to continue
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email or Username"
          name="emailOrUsername"
          type="text"
          placeholder="you@example.com"
          value={formData.emailOrUsername}
          onChange={handleChange}
          error={errors.emailOrUsername}
          autoComplete="username"
        />

        <div>
          <Input
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="current-password"
            rightAction={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="flex items-center justify-center w-7 h-7 text-text-textSecondary hover:text-text-textPrimary transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            }
          />
          <div className="flex justify-end mt-1.5">
            <Link
              to="/forgot-password"
              className="text-xs text-text-textSecondary hover:text-accent-text transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Remember me */}
        <label className="flex items-center gap-3 cursor-pointer group py-0.5">
          <div
            className="w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center transition-all duration-200 shrink-0"
            style={{
              borderColor: formData.rememberMe ? 'rgb(var(--color-accent))' : 'var(--color-border)',
              backgroundColor: formData.rememberMe ? 'rgb(var(--color-accent))' : 'var(--color-surface)',
              boxShadow: focusVisible ? '0 0 0 2px rgba(var(--color-accent), 0.3)' : 'none',
            }}
            aria-hidden="true"
          >
            {formData.rememberMe && (
              <svg className="w-3 h-3 text-accent-contrast" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <input
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            onFocus={(e) => setFocusVisible(e.target.matches(':focus-visible'))}
            onBlur={() => setFocusVisible(false)}
            className="sr-only"
          />
          <span className="text-sm text-textSecondary group-hover:text-text-textPrimary transition-colors duration-200">
            Keep me signed in
          </span>
        </label>

        <Button type="submit" loading={loading} className="w-full" size="lg">
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      {/* Divider */}
      <div className="divider-text">
        <span>New to NexPlay?</span>
      </div>

      {/* Sign up CTA */}
      <Link to="/register" className="btn-secondary w-full py-3 text-sm font-medium block text-center">
        Create an account
      </Link>
    </div>
  );
}
