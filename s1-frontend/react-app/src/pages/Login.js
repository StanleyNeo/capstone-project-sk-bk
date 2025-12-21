import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/api'; // Use the patched ApiService

function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [emailValid, setEmailValid] = useState(true);
  const [formError, setFormError] = useState('');
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false
  });

  // Simple email validation
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  // Password strength placeholder (you can reuse your existing function)
  const checkPasswordStrength = (password) => {
    if (!password) return null;
    let score = 0;
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      noSpaces: !/\s/.test(password)
    };
    score = Object.values(requirements).filter(v => v).length * 20;
    let strength = 'Weak', color = 'danger';
    if (score >= 80) { strength = 'Very Strong'; color = 'success'; }
    else if (score >= 60) { strength = 'Strong'; color = 'primary'; }
    else if (score >= 40) { strength = 'Medium'; color = 'warning'; }
    return { score, strength, color, requirements };
  };

  // Real-time validation
  useEffect(() => {
    if (formData.email && touched.email) {
      setEmailValid(validateEmail(formData.email));
    }
  }, [formData.email, touched.email]);

  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(formData.password));
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setTouched({ ...touched, [name]: true });
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.email.trim()) errors.push('Email is required');
    else if (!validateEmail(formData.email)) errors.push('Please enter a valid email address');

    if (!formData.password) errors.push('Password is required');
    else if (passwordStrength?.strength === 'Weak') errors.push('Password is too weak.');

    if (!isLogin) {
      if (!formData.name.trim()) errors.push('Name is required');
      if (formData.password !== formData.confirmPassword) errors.push('Passwords do not match');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const errors = validateForm();
    if (errors.length > 0) {
      setFormError(errors[0]);
      return;
    }

    try {
      let result;
      if (isLogin) {
        result = await ApiService.login({
          email: formData.email,
          password: formData.password
        });
      } else {
        result = await ApiService.register({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
      }

      if (result.success) {
        navigate('/');
      } else {
        setFormError(result.error || (isLogin ? 'Login failed' : 'Registration failed'));
      }
    } catch (err) {
      console.error('Submit error:', err);
      setFormError('Connection failed. Please try again later.');
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white text-center">
              <h2>{isLogin ? '🔐 Login to AI LMS' : '📝 Create New Account'}</h2>
            </div>
            <div className="card-body p-4">
              {formError && <div className="alert alert-danger">{formError}</div>}

              <form onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className={`form-control ${touched.email && !emailValid ? 'is-invalid' : ''}`}
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur('email')}
                    placeholder="you@example.com"
                    required
                  />
                  {touched.email && !emailValid && <div className="invalid-feedback">Invalid email address</div>}
                </div>

                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    name="password"
                    className={`form-control ${touched.password && passwordStrength?.strength === 'Weak' ? 'is-invalid' : ''}`}
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur('password')}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                {!isLogin && (
                  <div className="mb-3">
                    <label className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className={`form-control ${touched.confirmPassword && formData.password !== formData.confirmPassword ? 'is-invalid' : ''}`}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={() => handleBlur('confirmPassword')}
                      placeholder="Re-enter password"
                      required
                    />
                  </div>
                )}

                <button type="submit" className="btn btn-primary w-100 mb-3">
                  {isLogin ? 'Login' : 'Register'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setFormError('');
                      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                    }}
                  >
                    {isLogin ? 'Create New Account' : 'Login to Existing Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
