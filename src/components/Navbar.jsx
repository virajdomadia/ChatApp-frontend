import React from "react";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-[#0F1419] shadow-md shadow-black/50">
      <h1 className="font-bold text-white text-xl">Chat App</h1>
      {user && (
        <button
          onClick={logout}
          className="bg-[#0B81FF] hover:bg-[#0665d1] transition text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      )}
    </nav>
  );
};

export default Navbar;
