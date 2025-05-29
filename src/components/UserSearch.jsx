import React, { useState } from "react";
import API from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const UserSearch = ({ onChatStarted }) => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!search.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await API.get(`/auth/users?search=${search}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setResults(res.data);
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const startChat = async (userId) => {
    try {
      const res = await API.post(
        "/chats",
        { userId },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      onChatStarted(res.data);
      setSearch("");
      setResults([]);
    } catch (err) {
      setError("Failed to start chat");
    }
  };

  return (
    <div className="mb-6">
      <div className="flex mb-3">
        <input
          type="text"
          className="flex-grow p-3 rounded-l-md bg-[#1E2A38] border border-[#243447] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          disabled={loading}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !search.trim()}
          className={`px-4 py-3 rounded-r-md text-white transition-colors duration-200 ${
            loading || !search.trim()
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-[#0B81FF] hover:bg-[#0a6bd1]"
          }`}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && (
        <div className="text-red-500 text-sm font-semibold mb-3">{error}</div>
      )}

      <div className="max-h-60 overflow-y-auto rounded-md border border-[#243447] bg-[#121B22]">
        {results.length === 0 && !loading ? (
          <p className="text-gray-400 text-center text-sm p-4">
            No users found.
          </p>
        ) : (
          results.map((u) => (
            <div
              key={u._id}
              className="p-3 cursor-pointer hover:bg-[#1E2A38] transition-colors border-b border-[#243447]"
              onClick={() => startChat(u._id)}
            >
              <p className="font-medium text-white">{u.name}</p>
              <p className="text-xs text-gray-400">{u.email}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserSearch;
