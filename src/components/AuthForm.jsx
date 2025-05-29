import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

const AuthForm = ({ type }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = type === "login" ? "/auth/login" : "/auth/register";
      const res = await API.post(url, formData);
      login(res.data);
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Authentication Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D1117]">
      {" "}
      {/* dark navy background */}
      <div className="w-full max-w-md bg-[#121B22] p-8 rounded-2xl shadow-lg">
        {" "}
        {/* darker card background */}
        <h2 className="text-3xl font-bold text-center mb-6 text-white">
          {type === "login" ? "Welcome Back 👋" : "Create Your Account"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {type === "register" && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#1E2A38] border border-[#2E445B] rounded-lg text-white placeholder-[#6A7D95] focus:outline-none focus:ring-2 focus:ring-[#0B81FF]"
              required
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#1E2A38] border border-[#2E445B] rounded-lg text-white placeholder-[#6A7D95] focus:outline-none focus:ring-2 focus:ring-[#0B81FF]"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#1E2A38] border border-[#2E445B] rounded-lg text-white placeholder-[#6A7D95] focus:outline-none focus:ring-2 focus:ring-[#0B81FF]"
            required
          />

          <button
            type="submit"
            className="w-full py-3 bg-[#0B81FF] hover:bg-[#0965D2] text-white font-semibold rounded-lg transition-shadow shadow-md"
          >
            {type === "login" ? "Login" : "Register"}
          </button>
        </form>
        <p className="text-center text-sm text-[#6A7D95] mt-6">
          {type === "login" ? (
            <>
              Don’t have an account?{" "}
              <Link
                to="/register"
                className="text-[#0B81FF] font-semibold hover:underline"
              >
                Register here
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#0B81FF] font-semibold hover:underline"
              >
                Login here
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
