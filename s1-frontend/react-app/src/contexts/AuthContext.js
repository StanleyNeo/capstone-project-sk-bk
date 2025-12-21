import React, { createContext, useState, useContext, useEffect } from 'react';
import ApiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    setLoading(false);
  }, []);

  // INDUSTRY-STANDARD PASSWORD STRENGTH CHECK
  const checkPasswordStrength = (password) => {
    if (!password) {
      return {
        strength: 'Empty',
        score: 0,
        color: 'secondary',
        requirements: {
          length: false,
          uppercase: false,
          lowercase: false,
          number: false,
          special: false,
          noSpaces: true
        },
        messages: []
      };
    }

    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password),
      noSpaces: !/\s/.test(password)
    };

    // Calculate score (0-100)
    let score = Math.floor(
      (Object.values(requirements).filter(Boolean).length / 6) * 100
    );

    // Additional scoring for length
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;

    // Cap at 100
    score = Math.min(100, score);

    // Determine strength level
    let strength, color;
    if (score < 40) {
      strength = 'Weak';
      color = 'danger';
    } else if (score < 70) {
      strength = 'Medium';
      color = 'warning';
    } else if (score < 90) {
      strength = 'Strong';
      color = 'info';
    } else {
      strength = 'Very Strong';
      color = 'success';
    }

    // Generate feedback messages
    const messages = [];
    if (!requirements.length) {
      messages.push('At least 8 characters');
    } else if (password.length < 12) {
      messages.push('Consider using 12+ characters for better security');
    }
    if (!requirements.uppercase) messages.push('Add uppercase letters (A-Z)');
    if (!requirements.lowercase) messages.push('Add lowercase letters (a-z)');
    if (!requirements.number) messages.push('Add numbers (0-9)');
    if (!requirements.special) messages.push('Add special characters (!@#$%^&*)');
    if (!requirements.noSpaces) messages.push('Remove spaces from password');

    return {
      strength,
      score,
      color,
      requirements,
      messages
    };
  };

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Backend validation simulation
  const validatePasswordBackend = (password) => {
    const strength = checkPasswordStrength(password);
    
    if (strength.strength === 'Weak') {
      return {
        valid: false,
        message: 'Password is too weak. Please choose a stronger password.',
        strength
      };
    }
    
    if (!strength.requirements.length) {
      return {
        valid: false,
        message: 'Password must be at least 8 characters long.',
        strength
      };
    }
    
    return {
      valid: true,
      message: 'Password meets security requirements.',
      strength
    };
  };

  // Registration with password validation
  const register = async (userData) => {
    setError('');
    
    // Frontend validation
    const passwordValidation = validatePasswordBackend(userData.password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message);
      return { 
        success: false, 
        error: passwordValidation.message, 
        strength: passwordValidation.strength 
      };
    }
    
    const result = await ApiService.register(userData);
    
    if (result.success) {
      localStorage.setItem('currentUser', JSON.stringify(result.user));
      setCurrentUser(result.user);
      return { success: true, user: result.user };
    } else {
      setError(result.error);
      return { success: false, error: result.error };
    }
  };

  // Login function
  const login = async (email, password) => {
    setError('');
    const result = await ApiService.login({ email, password });
    
    if (result.success) {
      localStorage.setItem('currentUser', JSON.stringify(result.user));
      setCurrentUser(result.user);
      return { success: true, user: result.user };
    } else {
      setError(result.error);
      return { success: false, error: result.error };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setError('');
  };

  // Update user data
  const updateUser = (updatedData) => {
    const updatedUser = { ...currentUser, ...updatedData };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
  };

  // Password strength visualization data
  const getPasswordStrengthData = () => ({
    levels: [
      { name: 'Weak', color: 'danger', minScore: 0, maxScore: 39 },
      { name: 'Medium', color: 'warning', minScore: 40, maxScore: 69 },
      { name: 'Strong', color: 'info', minScore: 70, maxScore: 89 },
      { name: 'Very Strong', color: 'success', minScore: 90, maxScore: 100 }
    ],
    criteria: [
      { label: '8+ characters', key: 'length' },
      { label: 'Uppercase letter', key: 'uppercase' },
      { label: 'Lowercase letter', key: 'lowercase' },
      { label: 'Number (0-9)', key: 'number' },
      { label: 'Special character', key: 'special' },
      { label: 'No spaces', key: 'noSpaces' }
    ]
  });

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      error,
      register,
      login,
      logout,
      updateUser,
      checkPasswordStrength,
      validateEmail,
      validatePasswordBackend,
      getPasswordStrengthData,
      isAuthenticated: !!currentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};