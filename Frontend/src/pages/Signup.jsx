import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, User, Mail, Lock } from 'lucide-react';

export const Signup = () => {
  const navigate = useNavigate();
  // Access global utilities exposed by App.jsx
  const setNotification = window.setNotification;

  const [loading, setLoading] = useState(false);
  
  // Signup State
  const [loginId, setLoginId] = useState(''); // Mapping "Login ID" to username or email prefix
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');

  const validateSignup = () => {
    // 1. Login ID (6-12 chars)
    if (loginId.length < 6 || loginId.length > 12) {
      setNotification('Login ID must be between 6 and 12 characters.', 'error');
      return false;
    }
    
    // 2. Passwords Match
    if (password !== rePassword) {
      setNotification('Passwords do not match.', 'error');
      return false;
    }

    // 3. Password Complexity (min 8 chars, unique, small case, large case, special character)
    if (password.length < 8) {
        setNotification('Password must be at least 8 characters long.', 'error');
        return false;
    }
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasLower || !hasUpper || !hasSpecial) {
        setNotification('Password must contain small case, large case, and a special character.', 'error');
        return false;
    }

    // 4. Basic Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setNotification('Please enter a valid Email ID.', 'error');
      return false;
    }

    // All validation passed
    return true;
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateSignup()) {
      setLoading(false);
      return;
    }
    
    try {
      // --- Mock FastAPI Registration Endpoint Interaction ---
      // REPLACE THIS WITH YOUR ACTUAL fetch CALL TO YOUR FastAPI BACKEND
      const response = await new Promise(resolve => setTimeout(() => {
          // Mock successful registration. In a real app, you'd send JSON data here:
          /*
          const payload = { login_id: loginId, email: email, password: password };
          fetch('/auth/register', { method: 'POST', body: JSON.stringify(payload) })
          */
          resolve({ 
              ok: true, 
              json: () => ({ message: 'User created', email })
          });
      }, 800));
      // --- End Mock ---
      
      if (response.ok) {
        window.handleAppLogin(email); // Trigger App.jsx state change
        setNotification('Registration successful! You are now logged in.', 'success');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.detail || 'Registration failed.';
        setNotification(errorMessage, 'error');
      }
      
    } catch (error) {
      console.error("Signup Fetch Error:", error);
      setNotification('Network error during registration. Check console.', 'error');
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-lg mx-auto flex items-center justify-center mb-4">
            <Package className="text-white" />
          </div>
          <h1 className="text-2xl font-bold">StockMaster</h1>
          <p className="text-gray-500">Create your account</p>
        </div>

        <form onSubmit={handleSignupSubmit} className="space-y-4">
          {/* Signup Form Fields */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 flex items-center"><User size={14} className="mr-1 text-indigo-500" /> Enter Login ID (6-12 chars)</label>
            <input type="text" value={loginId} onChange={e => setLoginId(e.target.value)} className="w-full border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg px-3 py-2" required disabled={loading} />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 flex items-center"><Mail size={14} className="mr-1 text-indigo-500" /> Enter Email ID</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg px-3 py-2" required disabled={loading} />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 flex items-center"><Lock size={14} className="mr-1 text-indigo-500" /> Enter Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg px-3 py-2" required disabled={loading} />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 flex items-center"><Lock size={14} className="mr-1 text-indigo-500" /> Re-Enter Password</label>
            <input type="password" value={rePassword} onChange={e => setRePassword(e.target.value)} className="w-full border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg px-3 py-2" required disabled={loading} />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
            {loading ? 'Processing...' : 'SIGN UP'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <button onClick={() => navigate('/login')} className="text-indigo-600 hover:underline font-medium">
            Already have an account? Log In
          </button>
        </div>
      </div>
    </div>
  );
};