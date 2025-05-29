import React from "react";

const ChatHeader = ({ user, selectedChat, onlineUsers = [] }) => {
  if (!selectedChat) return null;

  const other = selectedChat.participants.find((u) => u._id !== user._id);
  const name = other?.name || "Unknown";

  const isOnline = onlineUsers.some(
    (id) => id.toString() === other?._id.toString()
  );

  return (
    <div className="p-4 flex items-center gap-4 border-b border-[#2F3B47] bg-gradient-to-r from-[#1A1F24] to-[#20272D] shadow-sm">
      <div
        className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0B81FF] to-[#065DC1] flex items-center justify-center text-white font-extrabold text-xl select-none"
        title={name}
      >
        {name.charAt(0).toUpperCase()}
      </div>
      <div className="flex flex-col justify-center">
        <span className="text-white font-semibold text-lg tracking-wide">
          {name}
        </span>
        <div className="flex items-center gap-2">
          <span
            className={`w-3 h-3 rounded-full ${
              isOnline ? "bg-green-400" : "bg-gray-600"
            }`}
            aria-label={isOnline ? "Online" : "Offline"}
            title={isOnline ? "Online" : "Offline"}
          />
          <span
            className={`text-sm ${
              isOnline ? "text-green-400" : "text-gray-500"
            }`}
          >
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
