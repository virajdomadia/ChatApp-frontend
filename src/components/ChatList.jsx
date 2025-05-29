import React, { useState, useEffect } from "react";
import UserSearch from "./UserSearch";

const ChatList = ({
  chats: initialChats,
  onSelectChat,
  selectedChat,
  user,
  onlineUsers,
}) => {
  const [chats, setChats] = React.useState(initialChats);

  React.useEffect(() => {
    setChats(initialChats);
  }, [initialChats]);

  const isUserOnline = (userId) => onlineUsers.includes(userId);

  const handleChatStarted = (newChat) => {
    if (!chats.some((c) => c._id === newChat._id)) {
      setChats([newChat, ...chats]);
    }
    onSelectChat(newChat);
  };

  const getInitials = (name) => {
    if (!name) return "";
    const names = name.trim().split(" ");
    if (names.length === 1) {
      return names[0][0].toUpperCase();
    } else {
      return (
        names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase()
      );
    }
  };

  return (
    <div className="w-1/3 bg-[#121B26] border-r border-[#2C3E50] p-6 overflow-y-auto min-h-screen flex flex-col">
      <UserSearch onChatStarted={handleChatStarted} />

      <h2 className="text-3xl font-bold mt-6 mb-5 text-white tracking-wide select-none">
        Chats
      </h2>

      <div className="flex-grow space-y-3">
        {chats.length === 0 && (
          <div className="text-gray-500 italic text-center mt-10 select-none">
            No chats found
          </div>
        )}

        {chats.map((chat) => {
          const other = chat.participants.find((u) => u._id !== user._id);
          const online = isUserOnline(other?._id);

          return (
            <div
              key={chat._id}
              onClick={() => onSelectChat(chat)}
              className={`cursor-pointer p-4 rounded-xl flex items-center justify-between
                transition-colors duration-200 shadow-sm
                ${
                  selectedChat?._id === chat._id
                    ? "bg-gradient-to-r from-[#0B81FF] to-[#065DC1] shadow-lg text-white"
                    : "bg-[#1E2A38] hover:bg-[#273849] text-gray-300"
                }`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onSelectChat(chat);
              }}
            >
              <div className="flex items-center gap-4 max-w-xs">
                {/* Avatar with initials and subtle shadow */}
                <div
                  aria-label={`Avatar for ${other?.name}`}
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#0B81FF] to-[#065DC1] text-white font-semibold text-xl shadow-md select-none flex-shrink-0"
                >
                  {getInitials(other?.name)}
                </div>

                <div className="truncate">
                  <div className="font-semibold text-lg truncate">
                    {other?.name}
                  </div>
                  <div
                    className={`text-sm ${
                      online
                        ? "text-green-400"
                        : selectedChat?._id === chat._id
                        ? "text-blue-300"
                        : "text-gray-500"
                    }`}
                  >
                    {online ? "Online" : "Offline"}
                  </div>
                </div>
              </div>

              {/* Online indicator with subtle glow */}
              <span
                className={`w-5 h-5 rounded-full flex-shrink-0 shadow-lg ${
                  online ? "bg-green-400 ring-2 ring-green-500" : "bg-gray-600"
                }`}
                aria-label={online ? "Online" : "Offline"}
                title={online ? "User Online" : "User Offline"}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatList;
