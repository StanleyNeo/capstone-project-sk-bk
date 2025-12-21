import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

function PasswordStrength() {
  const { checkPasswordStrength, getPasswordStrengthData } = useAuth();
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordHistory, setPasswordHistory] = useState([]);
  
  const strengthData = getPasswordStrengthData();

  useEffect(() => {
    if (password) {
      const analysis = checkPasswordStrength(password);
      setStrength(analysis);
      
      // Update history
      setPasswordHistory(prev => {
        const newEntry = {
          password: '*'.repeat(password.length),
          strength: analysis.strength,
          score: analysis.score,
          timestamp: new Date().toISOString()
        };
        return [newEntry, ...prev.slice(0, 4)]; // Keep last 5 entries
      });
    } else {
      setStrength(null);
    }
  }, [password, checkPasswordStrength]);

  const generateStrongPassword = () => {
    const chars = {
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      numbers: '0123456789',
      special: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };
    
    let password = '';
    
    // Ensure at least one of each type
    password += chars.lowercase[Math.floor(Math.random() * chars.lowercase.length)];
    password += chars.uppercase[Math.floor(Math.random() * chars.uppercase.length)];
    password += chars.numbers[Math.floor(Math.random() * chars.numbers.length)];
    password += chars.special[Math.floor(Math.random() * chars.special.length)];
    
    // Fill remaining length (12-16 characters total)
    const allChars = chars.lowercase + chars.uppercase + chars.numbers + chars.special;
    const remainingLength = 8 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < remainingLength; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    setPassword(password);
  };

  const getStrengthBarWidth = () => {
    if (!strength) return 0;
    return strength.score;
  };

  const getStrengthColor = () => {
    if (!strength) return 'secondary';
    return strength.color;
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h3 className="card-title mb-3">🔐 Password Strength Analyzer</h3>
        
        <div className="mb-4">
          <label className="form-label fw-bold">Test Your Password Strength:</label>
          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              placeholder="Enter password to analyze..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-describedby="passwordHelp"
            />
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️‍🗨️ Hide' : '👁️ Show'}
            </button>
          </div>
          
          <div id="passwordHelp" className="form-text">
            Enter a password to see real-time strength analysis
          </div>
        </div>

        {/* Strength Meter */}
        {strength && (
          <div className="mb-4">
            <div className="d-flex justify-content-between mb-2">
              <span className="fw-bold">Password Strength:</span>
              <span className={`badge bg-${getStrengthColor()}`}>
                {strength.strength} ({strength.score}/100)
              </span>
            </div>
            
            <div className="progress" style={{ height: '10px' }}>
              {strengthData.levels.map((level, index) => (
                <div
                  key={index}
                  className={`progress-bar bg-${level.color}`}
                  style={{
                    width: `${(level.maxScore - level.minScore)}%`,
                    opacity: strength.score >= level.minScore ? 1 : 0.3
                  }}
                  role="progressbar"
                  aria-valuenow={strength.score}
                  aria-valuemin={level.minScore}
                  aria-valuemax={level.maxScore}
                ></div>
              ))}
            </div>
            
            <div className="d-flex justify-content-between mt-1">
              {strengthData.levels.map((level, index) => (
                <small key={index} className={`text-${level.color} fw-bold`}>
                  {level.name}
                </small>
              ))}
            </div>
          </div>
        )}

        {/* Password Requirements */}
        <div className="mb-4">
          <h6 className="fw-bold mb-3">Password Requirements:</h6>
          <div className="row">
            {strengthData.criteria.map((criterion, index) => {
              const isMet = strength?.requirements?.[criterion.key] || false;
              return (
                <div className="col-md-6 mb-2" key={index}>
                  <div className="d-flex align-items-center">
                    <span className={`me-2 ${isMet ? 'text-success' : 'text-danger'}`}>
                      {isMet ? '✓' : '✗'}
                    </span>
                    <span className={isMet ? 'text-success' : 'text-muted'}>
                      {criterion.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feedback Messages */}
        {strength?.messages && strength.messages.length > 0 && (
          <div className={`alert alert-${getStrengthColor()} mb-4`}>
            <h6 className="alert-heading">Suggestions to improve:</h6>
            <ul className="mb-0">
              {strength.messages.map((msg, index) => (
                <li key={index}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Password Generator */}
        <div className="mb-4">
          <h6 className="fw-bold mb-3">Generate Strong Password:</h6>
          <button
            className="btn btn-outline-primary w-100 mb-2"
            onClick={generateStrongPassword}
          >
            🎲 Generate Secure Password
          </button>
          <small className="text-muted">
            Click to generate a password that meets all security requirements
          </small>
        </div>

        {/* Security Tips */}
        <div className="alert alert-info">
          <h6 className="alert-heading">💡 Security Tips:</h6>
          <ul className="mb-0 small">
            <li>Use at least 12 characters for better security</li>
            <li>Avoid common words, names, or patterns</li>
            <li>Don't reuse passwords across different sites</li>
            <li>Consider using a password manager</li>
            <li>Enable two-factor authentication when available</li>
          </ul>
        </div>

        {/* Password History */}
        {passwordHistory.length > 0 && (
          <div className="mt-4">
            <h6 className="fw-bold mb-3">Recent Password Analysis:</h6>
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Password</th>
                    <th>Strength</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {passwordHistory.map((entry, index) => (
                    <tr key={index}>
                      <td>{entry.password}</td>
                      <td>
                        <span className={`badge bg-${entry.score >= 70 ? 'success' : entry.score >= 40 ? 'warning' : 'danger'}`}>
                          {entry.strength}
                        </span>
                      </td>
                      <td>
                        <div className="progress" style={{ height: '5px', width: '60px' }}>
                          <div 
                            className={`progress-bar bg-${entry.score >= 70 ? 'success' : entry.score >= 40 ? 'warning' : 'danger'}`}
                            style={{ width: `${entry.score}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PasswordStrength;