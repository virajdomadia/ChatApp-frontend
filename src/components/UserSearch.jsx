import React, { useState } from "react";
import API from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const UserSearch = ({ onChatStarted }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user } = useAuth();

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await API.get(`/users/search?name=${query}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setResults(res.data);
    } catch (err) {
      setError("Search failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleStartChat = (userToChat) => {
    onChatStarted(userToChat);
    setQuery("");
    setResults([]);
  };

  return (
    <div className="mb-6">
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-grow rounded-md px-4 py-2 bg-[#1E2A38] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0B81FF]"
          placeholder="Search users to chat..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Search users"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-[#0B81FF] hover:bg-[#065DC1] disabled:opacity-50 text-white font-semibold px-5 rounded transition"
          aria-label="Search"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && <p className="mt-2 text-red-400">{error}</p>}

      <ul className="mt-3 max-h-48 overflow-y-auto rounded-md bg-[#121B22] shadow-inner">
        {results.map((user) => (
          <li
            key={user._id}
            onClick={() => handleStartChat(user)}
            className="cursor-pointer px-4 py-2 hover:bg-[#0B81FF]/20 text-white truncate"
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleStartChat(user);
            }}
          >
            {user.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserSearch;
