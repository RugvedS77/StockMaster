import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, User, Mail, Lock, Box, ShoppingCart, Truck } from 'lucide-react';

// --- API Config ---
// IMPORTANT: Replace this with your actual backend URL
const API_BASE_URL = "http://localhost:8000/api/auth";

export const Signup = () => {
  const navigate = useNavigate();
  const setNotification = window.setNotification || console.log;

  const [loading, setLoading] = useState(false);
  
  // Mapped to 'full_name' field in your UserModel
  const [fullName, setFullName] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');

  const validateSignup = () => {
    // 1. Full Name (Login ID) length check (6-12 chars)
    if (fullName.length < 6 || fullName.length > 12) {
      setNotification('Login ID (Full Name) must be between 6 and 12 characters.', 'error');
      return false;
    }
    
    // 2. Passwords Match
    if (password !== rePassword) {
      setNotification('Passwords do not match.', 'error');
      return false;
    }

    // 3. Password Complexity (as per your requirement)
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

    return true;
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateSignup()) {
      return;
    }

    setLoading(true);
    console.log("Signup process initiated...");
    
    const userData = {
        email: email,
        password: password,
        full_name: fullName, 
    };

    try {
      console.log(`Attempting POST to: ${API_BASE_URL}/signup with data:`, userData);
      
      const response = await fetch(`${API_BASE_URL}/signup`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
      });
      
      // Crucial step: Check network status first
      if (!response.ok && response.status === 409) {
          // Specific handling for 'Email already registered' error (409 Conflict)
          const errorData = await response.json();
          setNotification(errorData.detail || 'Email already registered. Please login.', 'error');
          console.error("ERROR 409: Email already registered.", errorData);
      }
      
      console.log(`API Response Status: ${response.status} (OK: ${response.ok})`);
      
      // Attempt to parse JSON response for detailed error message
      const data = await response.json(); 
      
      if (response.ok) {
        // --- Successful Navigation Block ---
        console.log("SUCCESS: API call was successful. Navigating to /login.", data);
        setNotification('Registration successful! Please log in with your new credentials.', 'success');
        navigate('/login'); 
        // -----------------------------------
      } else {
        // --- Generic Error Block (e.g., 422, 500, or generic 400s) ---
        const errorMessage = data.detail || 'Registration failed.';
        console.error("ERROR: API call failed. Response data:", data);
        setNotification(errorMessage, 'error');
      }
      
    } catch (error) {
      // This usually catches network failures, CORS issues, or JSON parsing errors
      console.error("Network or Unexpected Error (e.g., CORS, server offline):", error);
      setNotification('Connection error or invalid server response. Check console.', 'error');
      
    } finally {
      setLoading(false);
      console.log("Signup process finished.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8 relative overflow-hidden">
      
      {/* Background patterns: Falling Products Animation */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern [background-size:30px_30px] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>

        {/* Falling Product Icons for visual interest */}
        <div className="absolute top-[-100px] left-[10%] animate-fall-loop-1">
          <Package size={60} className="text-blue-400/50 rotate-12" />
        </div>
        <div className="absolute top-[-200px] left-[40%] animate-fall-loop-2">
          <Box size={50} className="text-blue-500/50 -rotate-6" />
        </div>
        <div className="absolute top-[-50px] left-[70%] animate-fall-loop-3">
          <ShoppingCart size={70} className="text-blue-300/50 rotate-45" />
        </div>
        <div className="absolute top-[-300px] left-[5%] animate-fall-loop-4">
          <Truck size={65} className="text-blue-600/50 rotate-3" />
        </div>
        <div className="absolute top-[-150px] left-[85%] animate-fall-loop-5">
          <Package size={45} className="text-blue-400/50 -rotate-15" />
        </div>
        <div className="absolute top-[-250px] left-[25%] animate-fall-loop-6">
          <Box size={55} className="text-blue-500/50 rotate-20" />
        </div>
      </div>

      {/* Main Content Container (Z-10 to be above the background) */}
      <div className="w-full max-w-5xl bg-white border border-blue-400/30 shadow-2xl shadow-blue-500/30 rounded-3xl grid md:grid-cols-2 overflow-hidden relative z-10">

        {/* LEFT PANEL - BRANDING/INFO */}
        <div className="bg-gradient-to-br from-blue-700 to-blue-500 p-10 text-white flex flex-col justify-center shadow-[0_0_25px_#3b82f655]">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-400/20 rounded-xl flex items-center justify-center mb-4 shadow-[0_0_20px_#60a5fafa]">
              <Package size={40} className="text-blue-200" />
            </div>

            <h2 className="text-3xl font-bold tracking-wide">StockMaster IMS</h2>
            <p className="text-blue-200 mt-2 text-sm">
              Create your premium enterprise account and streamline your inventory management today.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL - SIGNUP FORM */}
        <div className="p-10 text-gray-800">

          <h1 className="text-3xl font-bold mb-6 text-blue-700">Create Account</h1>

          <form onSubmit={handleSignupSubmit} className="space-y-4">
            {/* Login ID (full_name) */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <User size={14} className="mr-2 text-blue-500" /> Enter Login ID (6-12 chars)
              </label>
              <input 
                type="text" 
                value={fullName} 
                onChange={e => setFullName(e.target.value)} 
                className="w-full bg-gray-100 border border-blue-200 rounded-lg px-3 py-2 
                focus:ring-2 focus:ring-blue-500 text-gray-800" 
                required 
                disabled={loading} 
              />
            </div>
            
            {/* Email ID */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <Mail size={14} className="mr-2 text-blue-500" /> Enter Email ID
              </label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full bg-gray-100 border border-blue-200 rounded-lg px-3 py-2 
                focus:ring-2 focus:ring-blue-500 text-gray-800" 
                required 
                disabled={loading} 
              />
            </div>
            
            {/* Password */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <Lock size={14} className="mr-2 text-blue-500" /> Enter Password
              </label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full bg-gray-100 border border-blue-200 rounded-lg px-3 py-2 
                focus:ring-2 focus:ring-blue-500 text-gray-800" 
                required 
                disabled={loading} 
              />
            </div>
            
            {/* Re-Enter Password */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 flex items-center">
                <Lock size={14} className="mr-2 text-blue-500" /> Re-Enter Password
              </label>
              <input 
                type="password" 
                value={rePassword} 
                onChange={e => setRePassword(e.target.value)} 
                className="w-full bg-gray-100 border border-blue-200 rounded-lg px-3 py-2 
                focus:ring-2 focus:ring-blue-500 text-gray-800" 
                required 
                disabled={loading} 
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-blue-600 hover:bg-blue-700 transition py-2 rounded-lg font-semibold 
              shadow-[0_0_15px_#3b82f6aa] text-white mt-6"
            >
              {loading ? 'Processing...' : 'SIGN UP'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            Already have an account?
            <button 
              onClick={() => navigate('/login')} 
              className="text-blue-600 ml-1 hover:underline font-medium"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};