import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/Button';
import Input from '../../components/Input';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getPasswordStrength = () => {
    const pwd = formData.password;
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

  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(formData.username))
      newErrors.username = 'Username can only contain letters, numbers, and underscores';

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Invalid email format';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])/.test(formData.password))
      newErrors.password = 'Must contain a lowercase letter';
    else if (!/(?=.*[A-Z])/.test(formData.password))
      newErrors.password = 'Must contain an uppercase letter';
    else if (!/(?=.*\d)/.test(formData.password))
      newErrors.password = 'Must contain a number';
    else if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(formData.password))
      newErrors.password = 'Must contain a special character';

    if (formData.password !== formData.confirmPassword)
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
      const result = await register(formData);
      if (result.success) {
        addToast('Account created successfully! Please log in.', 'success');
        navigate('/login');
      } else {
        addToast(result.message || 'Registration failed', 'error');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
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
          Create account
        </h1>
        <p className="text-sm text-text-textSecondary mt-1.5">
          Get started with NexPlay
        </p>
      </div>

      {/* Role Toggle */}
      <div className="flex rounded-xl p-1 gap-1"
        style={{
          backgroundColor: 'var(--surface-subtle)',
          border: '1px solid var(--color-border)',
        }}
      >
        {['user', 'company'].map((role) => (
          <button
            key={role}
            type="button"
            className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              formData.role === role
                ? 'text-accent-contrast font-bold shadow-sm'
                : 'text-text-textSecondary hover:text-textPrimary'
            }`}
            style={
              formData.role === role
                ? {
                    background: 'var(--gradient-accent)',
                    border: 'none',
                  }
                : {}
            }
            onClick={() => setFormData((prev) => ({ ...prev, role }))}
          >
            {role === 'user' ? 'Individual' : 'Company'}
          </button>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          name="fullName"
          type="text"
          placeholder={formData.role === 'company' ? 'Company name' : 'Your full name'}
          value={formData.fullName}
          onChange={handleChange}
          error={errors.fullName}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Username"
            name="username"
            type="text"
            placeholder="Choose a username"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
          />

          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />
        </div>

        <div className="space-y-1">
          <Input
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password"
            value={formData.password}
            onChange={(e) => {
              setPasswordTouched(true);
              handleChange(e);
            }}
            onFocus={() => setPasswordTouched(true)}
            error={errors.password}
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
          {passwordTouched && formData.password && (
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
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          rightAction={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="flex items-center justify-center w-7 h-7 text-text-textSecondary hover:text-text-textPrimary transition-colors"
              tabIndex={-1}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? (
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

        <Button type="submit" loading={loading} className="w-full" size="lg">
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      {/* Sign in link */}
      <div className="text-center">
        <p className="text-sm text-textSecondary">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-accent-text hover:text-accent-text/80 transition-colors font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
