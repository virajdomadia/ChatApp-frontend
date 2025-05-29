import React from "react";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-[#121B22] shadow-md border-b border-[#2F3B47]">
      <div className="text-white text-2xl font-bold tracking-wide select-none">
        ChatApp
      </div>

      {user ? (
        <button
          onClick={logout}
          className="bg-[#0B81FF] hover:bg-[#065DC1] text-white font-semibold py-2 px-4 rounded transition"
        >
          Logout
        </button>
      ) : null}
    </nav>
  );
};

export default Navbar;
