import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Lock, Mail, User } from "lucide-react";

// --- API Config ---
// IMPORTANT: Replace this with your actual backend URL
const API_BASE_URL = "http://localhost:8000/api/auth";

export const Login = () => {
  const navigate = useNavigate();
  const setNotification = window.setNotification;

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState(""); // For the reset step
  const [reNewPassword, setReNewPassword] = useState(""); // For the reset step

  const [forgotMode, setForgotMode] = useState(false);
  const [otpMode, setOtpMode] = useState(false);
  const [resetMode, setResetMode] = useState(false); // New state for reset password

  const length = 6; // OTP length
  const [otp, setOtp] = useState(Array(length).fill(""));
  const inputsRef = useRef([]);

  // Helper to join OTP array into a string
  const getOtpString = () => otp.join("");

  const handleOtpChange = (value, index) => {
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move focus to the next input
      if (value && index < length - 1) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  const handleOtpKeyDown = (e, index) => {
    // Move focus to the previous input on Backspace if current is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  // --- API Handlers ---

  /**
   * Step 1: Handle standard login using OAuth2PasswordRequestForm.
   */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Create Form Data for OAuth2PasswordRequestForm
    const formData = new URLSearchParams();
    formData.append("username", email); // FastAPI uses 'username' for the email field
    formData.append("password", password);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const data = await response.json();

      if (response.ok) {
        // data contains { access_token, token_type, user }
        localStorage.setItem("access_token", data.access_token);
        window.handleAppLogin(data.user); // Assuming this handles state and user info
        setNotification("Login Successful!", "success");
        navigate("/dashboard");
      } else {
        // Handle errors from FastAPI (e.g., Invalid Credentials, 404)
        setNotification(data.detail || "Login failed. Check your credentials.", "error");
      }
    } catch (error) {
      console.error("Login Fetch Error:", error);
      setNotification("Network error during login.", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 2: Request OTP via Forgot Password API.
   */
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok || response.status === 200) {
        setNotification(data.message, "success");
        setForgotMode(false);
        setOtpMode(true); // Move to OTP verification step
      } else {
        setNotification(data.detail || "Failed to initiate password reset.", "error");
      }
    } catch (error) {
      console.error("Forgot Password Fetch Error:", error);
      setNotification("Network error. Could not request OTP.", "error");
    } finally {
      setLoading(false);
    }
  };


  /**
   * Step 3: Verify the entered OTP.
   */
  const handleOtpVerificationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const enteredOtp = getOtpString();

    try {
      const response = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: enteredOtp }),
      });

      const data = await response.json();

      if (response.ok) {
        setNotification(data.message, "success");
        setOtpMode(false);
        setResetMode(true); // Move to the actual password reset form
      } else {
        setNotification(data.detail || "OTP verification failed.", "error");
      }
    } catch (error) {
      console.error("Verify OTP Fetch Error:", error);
      setNotification("Network error during OTP verification.", "error");
    } finally {
      setLoading(false);
    }
  };


  /**
   * Step 4: Reset the password.
   */
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== reNewPassword) {
      setNotification("New passwords do not match.", "error");
      return;
    }
    if (newPassword.length < 8) {
        setNotification('Password must be at least 8 characters long.', 'error');
        return;
    }
    // Minimal check from signup logic
    const hasLower = /[a-z]/.test(newPassword);
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    if (!hasLower || !hasUpper || !hasSpecial) {
        setNotification('Password must contain small case, large case, and a special character.', 'error');
        return;
    }

    setLoading(true);
    const enteredOtp = getOtpString();

    try {
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: enteredOtp,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNotification(data.message, "success");
        // Reset the entire flow and go back to login
        setResetMode(false);
        setForgotMode(false);
        setOtpMode(false);
        setPassword("");
        setOtp(Array(length).fill(""));
      } else {
        setNotification(data.detail || "Password reset failed.", "error");
      }
    } catch (error) {
      console.error("Reset Password Fetch Error:", error);
      setNotification("Network error during password reset.", "error");
    } finally {
      setLoading(false);
    }
  };


  // --- Render Logic ---
  const renderForm = () => {
    if (resetMode) {
        // --- RESET PASSWORD FORM ---
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-blue-700 mb-6">Set New Password</h1>
                <p className="text-sm text-gray-500">
                    Enter a new password for **{email}**.
                </p>
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                    {/* New Password */}
                    <div>
                        <label className="text-sm font-medium mb-1 flex items-center">
                            <Lock size={14} className="text-blue-500 mr-2" /> New Password
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            disabled={loading}
                            className="w-full bg-gray-100 border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-gray-800"
                            required
                        />
                    </div>
                    {/* Re-enter New Password */}
                    <div>
                        <label className="text-sm font-medium mb-1 flex items-center">
                            <Lock size={14} className="text-blue-500 mr-2" /> Confirm New Password
                        </label>
                        <input
                            type="password"
                            value={reNewPassword}
                            onChange={(e) => setReNewPassword(e.target.value)}
                            disabled={loading}
                            className="w-full bg-gray-100 border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 text-gray-800"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 transition py-2 rounded-lg font-semibold shadow-[0_0_15px_#3b82f6aa] text-white"
                    >
                        {loading ? "Resetting Password..." : "RESET PASSWORD"}
                    </button>
                </form>
            </div>
        );
    }

    if (otpMode) {
        // --- OTP VERIFICATION FORM ---
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-blue-700 mb-4">Enter OTP</h1>

                <p className="text-gray-600 text-sm">
                    A 6-digit verification code has been sent to **{email}**.
                </p>

                <form onSubmit={handleOtpVerificationSubmit}>
                    <div className="flex justify-center gap-4 mb-6">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                maxLength={1}
                                value={digit}
                                disabled={loading}
                                ref={(el) => (inputsRef.current[index] = el)}
                                onChange={(e) => handleOtpChange(e.target.value, index)}
                                onKeyDown={(e) => handleOtpKeyDown(e, index)}
                                className="w-12 h-12 text-center bg-gray-100 border border-blue-300 
                                rounded-lg text-xl text-gray-800 font-semibold 
                                focus:ring-2 focus:ring-blue-500 shadow-[0_0_10px_#3b82f644]"
                                required
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || getOtpString().length !== length}
                        className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold 
                        shadow-[0_0_15px_#3b82f6aa] text-white"
                    >
                        {loading ? "Verifying..." : "Verify OTP"}
                    </button>
                </form>

                <button
                    className="text-sm mt-4 text-blue-600 hover:text-blue-700 font-medium"
                    onClick={() => {
                        setOtpMode(false);
                        setForgotMode(true);
                        setOtp(Array(length).fill("")); // Clear OTP on back
                    }}
                >
                    ← Back / Request new OTP
                </button>
            </div>
        );
    }

    if (forgotMode) {
        // --- FORGOT PASSWORD (Request OTP) FORM ---
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-blue-700 mb-6">Reset Password</h1>

                <form onSubmit={handleForgotPasswordSubmit}>
                    <label className="text-sm font-medium">Enter Your Registered Email</label>
                    <input
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        className="w-full bg-gray-100 border border-blue-200 rounded-lg px-3 py-2 mt-2 
                        focus:ring-2 focus:ring-blue-500 text-gray-800"
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 mt-6 py-2 rounded-lg font-semibold
                        shadow-[0_0_15px_#3b82f6aa] text-white"
                    >
                        {loading ? "Sending OTP..." : "Send OTP"}
                    </button>
                </form>

                <button
                    className="text-sm mt-4 text-blue-600 hover:text-blue-700 font-medium"
                    onClick={() => setForgotMode(false)}
                >
                    ← Back to Login
                </button>
            </div>
        );
    }

    // --- DEFAULT LOGIN FORM ---
    return (
        <>
            <h1 className="text-3xl font-bold mb-6 text-blue-700">Welcome Back</h1>

            <form onSubmit={handleLoginSubmit} className="space-y-6">

                {/* EMAIL */}
                <div>
                    <label className="text-sm font-medium mb-1 flex items-center">
                        <Mail size={14} className="text-blue-500 mr-2" /> Login ID (Email)
                    </label>
                    <input
                        type="email"
                        value={email}
                        disabled={loading}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-100 border border-blue-200 rounded-lg px-3 py-2 
                        focus:ring-2 focus:ring-blue-500 text-gray-800"
                        required
                    />
                </div>

                {/* PASSWORD */}
                <div>
                    <label className="text-sm font-medium mb-1 flex items-center">
                        <Lock size={14} className="text-blue-500 mr-2" /> Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        disabled={loading}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-100 border border-blue-200 rounded-lg px-3 py-2 
                        focus:ring-2 focus:ring-blue-500 text-gray-800"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 transition py-2 rounded-lg font-semibold 
                    shadow-[0_0_15px_#3b82f6aa] text-white"
                >
                    {loading ? "Signing In..." : "LOG IN"}
                </button>
            </form>

            <button
                className="text-sm mt-5 text-blue-600 hover:text-blue-700"
                onClick={() => {
                    setForgotMode(true);
                    setOtp(Array(length).fill("")); // Clear OTP just in case
                }}
            >
                Forgot Password?
            </button>

            <div className="mt-8 text-sm">
                Don’t have an account?
                <button
                    className="text-blue-600 ml-1 hover:underline font-medium"
                    onClick={() => navigate("/signup")}
                >
                    Sign Up
                </button>
            </div>
        </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8 relative overflow-hidden">
      {/* ... (Background patterns remain the same) ... */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-grid-pattern [background-size:30px_30px] [mask-image:linear-gradient(to_bottom,white,transparent)]"></div>
        <div className="absolute top-1/4 right-1/4 animate-pulse-slow">
          <Lock size={80} className="text-blue-300/30 rotate-12" />
        </div>
        <div className="absolute bottom-1/3 left-1/3 animate-pulse-slow delay-500">
          <Mail size={70} className="text-blue-300/20 -rotate-6" />
        </div>
      </div>

      <div className="w-full max-w-5xl bg-white border border-blue-400/30 shadow-2xl shadow-blue-500/30 rounded-3xl grid md:grid-cols-2 overflow-hidden relative z-10">

        {/* LEFT PANEL - BRANDING/INFO */}
        <div className="bg-gradient-to-br from-blue-700 to-blue-500 p-10 text-white flex flex-col justify-center shadow-[0_0_25px_#3b82f655]">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-400/20 rounded-xl flex items-center justify-center mb-4 shadow-[0_0_20px_#60a5fafa]">
              <Package size={40} className="text-blue-200" />
            </div>

            <h2 className="text-3xl font-bold tracking-wide">StockMaster IMS</h2>
            <p className="text-blue-200 mt-2 text-sm">
              Premium enterprise Inventory Management System with secure access.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL - FORMS */}
        <div className="p-10 text-gray-800">
          {renderForm()}
        </div>
      </div>
    </div>
  );
};