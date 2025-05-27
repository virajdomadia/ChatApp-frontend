// components/UserSearch.jsx
import React, { useState } from "react";
import API from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const UserSearch = ({ onChatStarted }) => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const res = await API.get(`/auth/users?search=${search}`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });
    const data = res.data;
    setResults(data);
  };

  const startChat = async (userId) => {
    const res = await API.post(
      "/chats",
      { userId },
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );
    const data = res.data;
    onChatStarted(data); // update selected chat
  };

  return (
    <div className="p-4 bg-white border-b">
      <input
        className="p-2 border rounded mr-2"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button
        onClick={handleSearch}
        className="bg-blue-500 text-white px-3 py-2 rounded"
      >
        Search
      </button>

      {results.map((u) => (
        <div
          key={u._id}
          className="mt-2 p-2 bg-gray-100 rounded cursor-pointer"
          onClick={() => startChat(u._id)}
        >
          {u.name}
        </div>
      ))}
    </div>
  );
};

export default UserSearch;
