import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiEye, FiEyeOff, FiX, FiCamera } from 'react-icons/fi';

// Assuming these utils and context are correctly set up in your project
import { validateEmail } from '../../utils/helper';
import { UserContext } from '../../context/userContext';
import { API_PATHS } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';
import uploadImage from '../../utils/uploadImage';


const SignUp = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!fullName || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");

    // Signup API Call
    try {
      let profileImageUrl = "";
      if (profilePic) {
        const imgUploadRes = await uploadImage(profilePic);
        profileImageUrl = imgUploadRes.imageUrl || "";
      }

      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: fullName,
        email,
        password,
        profileImageUrl,
      });

      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        updateUser(response.data);
        navigate("/dashboard");
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl flex bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Left Side: Animated Gradient Background */}
        <div className="hidden md:flex w-1/2 p-8 relative flex-col justify-between bg-gradient-to-br from-purple-500 via-purple-400 to-white animate-gradient-xy">
            <style>
                {`
                    @keyframes gradient-xy {
                        0%, 100% { background-size: 400% 400%; background-position: 10% 0%; }
                        50% { background-size: 200% 200%; background-position: 91% 100%; }
                    }
                    .animate-gradient-xy { animation: gradient-xy 15s ease infinite; }
                `}
            </style>
            <h1 className="text-2xl font-bold text-white z-10">Hired Or Fired.</h1>
            <div className="z-10">
                <h2 className="text-3xl font-bold text-white leading-tight">
                    Create Your Account
                </h2>
                <p className="text-white/70 mt-2">
                    Join our community and unlock all features.
                </p>
            </div>
        </div>

        {/* Right Side: Sign Up Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 relative">
          <Link to="/" className="absolute top-6 right-6 text-gray-400 hover:text-gray-600">
            <FiX size={24} />
          </Link>

          <h2 className="text-3xl font-bold text-gray-800 mb-6">Sign Up</h2>

          <form className="space-y-4" onSubmit={handleSignUp}>
            <div className="flex justify-center mb-4">
                <label htmlFor="profile-pic-upload" className="cursor-pointer">
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 relative overflow-hidden">
                        {profilePicPreview ? (
                            <img src={profilePicPreview} alt="Profile Preview" className="w-full h-full object-cover" />
                        ) : (
                            <FiCamera size={32} />
                        )}
                    </div>
                    <input id="profile-pic-upload" type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} />
                </label>
            </div>

            <div className="relative">
              <label htmlFor="fullName" className="text-sm font-medium text-gray-600">Full Name</label>
              <FiUser className="absolute left-3 top-10 text-gray-400" />
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2.5 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div className="relative">
              <label htmlFor="email" className="text-sm font-medium text-gray-600">Email</label>
              <FiMail className="absolute left-3 top-10 text-gray-400" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.doe@example.com"
                className="w-full pl-10 pr-4 py-2.5 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div className="relative">
                <label htmlFor="password"className="text-sm font-medium text-gray-600">Password</label>
              <span className="absolute left-3 top-10 text-gray-400 cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 Characters"
                className="w-full pl-10 pr-4 py-2.5 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
            
            {error && <p className='text-red-500 text-xs text-center'>{error}</p>}

            <button
              type="submit"
              className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors shadow-md mt-2"
            >
              Create Account
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-purple-600 hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
