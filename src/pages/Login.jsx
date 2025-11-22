import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Lock, Mail } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  // Access global utilities exposed by App.jsx
  const setNotification = window.setNotification;

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('manager@stockmaster.com');
  const [password, setPassword] = useState('password');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        // --- Mock FastAPI Login Endpoint Interaction ---
        // REPLACE THIS WITH YOUR ACTUAL fetch CALL TO YOUR FastAPI BACKEND
        
        // This simulates a network delay and a successful/failed login response
        const response = await new Promise(resolve => setTimeout(() => {
            if (email === 'manager@stockmaster.com' && password === 'password') {
                // Successful response structure
                resolve({ 
                    ok: true, 
                    json: () => ({ access_token: 'mock_token', user: { email } })
                });
            } else {
                // Failed response structure
                resolve({ 
                    ok: false, 
                    status: 401,
                    json: () => ({ detail: 'Invalid credentials. Use manager@stockmaster.com / password' })
                });
            }
        }, 800));
        // --- End Mock ---

      if (response.ok) {
        // Assuming successful login returns user data or token
        window.handleAppLogin(email); // Trigger App.jsx state change
        setNotification('Login successful!', 'success');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.detail || 'Invalid Login ID or Password.';
        setNotification(errorMessage, 'error');
      }

    } catch (error) {
      console.error("Login Fetch Error:", error);
      setNotification('Network error during login. Check console.', 'error');
      
    } finally {
      setLoading(false);
    }
  };

  const forgotPasswordHandler = () => {
    setNotification('Password reset functionality to be implemented via API.', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Container for the form */}
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8">
        
        {/* Header/Logo Section */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-lg mx-auto flex items-center justify-center mb-4">
            <Package className="text-white" />
          </div>
          <h1 className="text-2xl font-bold">StockMaster</h1>
          <p className="text-gray-500">Log in to continue</p>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          
          {/* Email/Login ID Field */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 flex items-center">
              <Mail size={14} className="mr-1 text-indigo-500" /> Login ID (Email)</label>
            <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg px-3 py-2" 
                required 
                disabled={loading} 
            />
          </div>
          
          {/* Password Field */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 flex items-center"><Lock size={14} className="mr-1 text-indigo-500" /> Password</label>
            <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg px-3 py-2" 
                placeholder="password" 
                required 
                disabled={loading} 
            />
          </div>
          
          {/* Sign In Button */}
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            {loading ? 'Signing In...' : 'LOG IN'}
          </button>
        </form>

        {/* Links Section */}
        <div className="mt-4 text-center text-sm">
          <button onClick={forgotPasswordHandler} className="text-gray-500 hover:text-indigo-600 mr-2">Forget Password?</button> | 
          <button onClick={() => navigate('/signup')} className="text-indigo-600 hover:underline ml-2 font-medium">
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};