import React from "react";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  return (
    <>
      <nav className="flex justify-between px-6 py-4 bg-gray-100 shadow">
        <h1 className="font-bold">Chat App</h1>
        {user && (
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-1 rounded"
          >
            Logout
          </button>
        )}
      </nav>
    </>
  );
};

export default Navbar;
