import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/api'; // Import your ApiService

function Login() {
  const { login, register, checkPasswordStrength, validateEmail, error } = useAuth();
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

  // Real-time validation
  useEffect(() => {
    if (formData.email && touched.email) {
      setEmailValid(validateEmail(formData.email));
    }
  }, [formData.email, touched.email, validateEmail]);

  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(checkPasswordStrength(formData.password));
    } else {
      setPasswordStrength(null);
    }
  }, [formData.password, checkPasswordStrength]);

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

    if (!formData.email.trim()) {
      errors.push('Email is required');
    } else if (!validateEmail(formData.email)) {
      errors.push('Please enter a valid email address');
    }

    if (!formData.password) {
      errors.push('Password is required');
    } else if (passwordStrength?.strength === 'Weak') {
      errors.push('Password is too weak. Please choose a stronger password.');
    }

    if (!isLogin) {
      if (!formData.name.trim()) {
        errors.push('Name is required');
      }
      if (formData.password !== formData.confirmPassword) {
        errors.push('Passwords do not match');
      }
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

    if (isLogin) {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/');
      } else {
        setFormError(result.error || 'Login failed');
      }
    } else {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      if (result.success) {
        navigate('/');
      } else {
        setFormError(result.error || 'Registration failed');
      }
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white">
              <h2 className="card-title mb-0 text-center">
                {isLogin ? '🔐 Login to AI LMS' : '📝 Create New Account'}
              </h2>
            </div>
            
            <div className="card-body p-4">
              {error && (
                <div className="alert alert-danger alert-dismissible fade show">
                  {error}
                  <button type="button" className="btn-close" onClick={() => setFormError('')}></button>
                </div>
              )}

              {formError && (
                <div className="alert alert-danger alert-dismissible fade show">
                  {formError}
                  <button type="button" className="btn-close" onClick={() => setFormError('')}></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="mb-4">
                    <label className="form-label fw-bold">Full Name</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                )}

                <div className="mb-4">
                  <label className="form-label fw-bold">Email Address</label>
                  <input
                    type="email"
                    className={`form-control form-control-lg ${touched.email && !emailValid ? 'is-invalid' : ''}`}
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur('email')}
                    placeholder="you@example.com"
                    required
                  />
                  {touched.email && !emailValid && (
                    <div className="invalid-feedback">
                      Please enter a valid email address
                    </div>
                  )}
                  {touched.email && emailValid && formData.email && (
                    <div className="valid-feedback d-block">
                      ✓ Valid email format
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">Password</label>
                  <input
                    type="password"
                    className={`form-control form-control-lg ${touched.password && passwordStrength?.strength === 'Weak' ? 'is-invalid' : ''}`}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur('password')}
                    placeholder="Enter your password"
                    required
                  />
                  
                  {passwordStrength && (
                    <div className="mt-3">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="fw-bold">Password Strength:</span>
                        <span className={`badge bg-${passwordStrength.color}`}>
                          {passwordStrength.strength} ({passwordStrength.score}/100)
                        </span>
                      </div>
                      
                      <div className="progress mb-3" style={{ height: '8px' }}>
                        <div 
                          className={`progress-bar bg-${passwordStrength.color}`}
                          style={{ width: `${passwordStrength.score}%` }}
                        ></div>
                      </div>
                      
                      {/* Requirements Grid */}
                      <div className="row g-2 mb-3">
                        <div className="col-6">
                          <div className={`d-flex align-items-center ${passwordStrength.requirements.length ? 'text-success' : 'text-danger'}`}>
                            {passwordStrength.requirements.length ? '✓' : '✗'}
                            <small className="ms-2">8+ characters</small>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className={`d-flex align-items-center ${passwordStrength.requirements.uppercase ? 'text-success' : 'text-danger'}`}>
                            {passwordStrength.requirements.uppercase ? '✓' : '✗'}
                            <small className="ms-2">Uppercase letter</small>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className={`d-flex align-items-center ${passwordStrength.requirements.lowercase ? 'text-success' : 'text-danger'}`}>
                            {passwordStrength.requirements.lowercase ? '✓' : '✗'}
                            <small className="ms-2">Lowercase letter</small>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className={`d-flex align-items-center ${passwordStrength.requirements.number ? 'text-success' : 'text-danger'}`}>
                            {passwordStrength.requirements.number ? '✓' : '✗'}
                            <small className="ms-2">Number</small>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className={`d-flex align-items-center ${passwordStrength.requirements.special ? 'text-success' : 'text-danger'}`}>
                            {passwordStrength.requirements.special ? '✓' : '✗'}
                            <small className="ms-2">Special character</small>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className={`d-flex align-items-center ${passwordStrength.requirements.noSpaces ? 'text-success' : 'text-danger'}`}>
                            {passwordStrength.requirements.noSpaces ? '✓' : '✗'}
                            <small className="ms-2">No spaces</small>
                          </div>
                        </div>
                      </div>
                      
                      {passwordStrength.messages.length > 0 && (
                        <div className={`alert alert-${passwordStrength.color} py-2`}>
                          <small>
                            <strong>Suggestions:</strong> {passwordStrength.messages.join(', ')}
                          </small>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {!isLogin && (
                  <div className="mb-4">
                    <label className="form-label fw-bold">Confirm Password</label>
                    <input
                      type="password"
                      className={`form-control form-control-lg ${touched.confirmPassword && formData.password !== formData.confirmPassword ? 'is-invalid' : ''}`}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={() => handleBlur('confirmPassword')}
                      placeholder="Re-enter your password"
                      required
                    />
                    {touched.confirmPassword && formData.password !== formData.confirmPassword && (
                      <div className="invalid-feedback">
                        Passwords do not match
                      </div>
                    )}
                    {touched.confirmPassword && formData.password === formData.confirmPassword && formData.confirmPassword && (
                      <div className="valid-feedback d-block">
                        ✓ Passwords match
                      </div>
                    )}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg w-100 mb-4"
                  disabled={!isLogin && passwordStrength?.strength === 'Weak'}
                >
                  {isLogin ? 'Login to Account' : 'Create Account'}
                </button>

                <div className="text-center">
                  <p className="mb-2">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                  </p>
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setFormError('');
                      setPasswordStrength(null);
                      setFormData({
                        name: '',
                        email: '',
                        password: '',
                        confirmPassword: ''
                      });
                    }}
                  >
                    {isLogin ? 'Create New Account' : 'Login to Existing Account'}
                  </button>
                </div>
              </form>

              {/* Security Info */}
              <div className="mt-4 pt-4 border-top">
                <h6 className="fw-bold mb-3">🔒 Security Information:</h6>
                <div className="row">
                  <div className="col-md-6">
                    <div className="alert alert-light">
                      <h6 className="alert-heading">Password Requirements:</h6>
                      <ul className="mb-0 small">
                        <li>Minimum 8 characters (12+ recommended)</li>
                        <li>At least one uppercase letter</li>
                        <li>At least one lowercase letter</li>
                        <li>At least one number</li>
                        <li>At least one special character</li>
                        <li>No spaces allowed</li>
                      </ul>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="alert alert-light">
                      <h6 className="alert-heading">Best Practices:</h6>
                      <ul className="mb-0 small">
                        <li>Use a unique password for this site</li>
                        <li>Don't use personal information</li>
                        <li>Consider using a password manager</li>
                        <li>Change passwords periodically</li>
                        <li>Enable two-factor authentication</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;