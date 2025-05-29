import React, { useState, useEffect } from "react";
import UserSearch from "./UserSearch";

const ChatList = ({
  chats: initialChats,
  onSelectChat,
  selectedChat,
  user,
  onlineUsers,
}) => {
  const [chats, setChats] = useState(initialChats);

  // Sync chats prop updates (optional, depending on your app flow)
  useEffect(() => {
    setChats(initialChats);
  }, [initialChats]);

  const isUserOnline = (userId) => onlineUsers.includes(userId);

  // Called when a new chat is started from UserSearch
  const handleChatStarted = (newChat) => {
    // Add new chat if not already in list
    if (!chats.some((c) => c._id === newChat._id)) {
      setChats([newChat, ...chats]);
    }
    onSelectChat(newChat);
  };

  return (
    <div className="w-1/3 bg-[#121B22] border-r border-[#243447] p-4 overflow-y-auto min-h-screen">
      <UserSearch onChatStarted={handleChatStarted} />

      <h2 className="text-xl font-semibold mb-4 text-white mt-4">Chats</h2>

      {chats.map((chat) => {
        const other = chat.participants.find((u) => u._id !== user._id);
        const online = isUserOnline(other?._id);

        return (
          <div
            key={chat._id}
            onClick={() => onSelectChat(chat)}
            className={`cursor-pointer p-3 rounded flex items-center justify-between hover:bg-[#1E2A38] transition-colors ${
              selectedChat?._id === chat._id ? "bg-[#0B81FF]" : ""
            }`}
          >
            <div>
              <div
                className={`font-medium ${
                  selectedChat?._id === chat._id
                    ? "text-white"
                    : "text-gray-200"
                }`}
              >
                {other?.name}
              </div>
              <div
                className={`text-xs ${
                  online
                    ? "text-green-400"
                    : selectedChat?._id === chat._id
                    ? "text-blue-200"
                    : "text-gray-500"
                }`}
              >
                {online ? "Online" : "Offline"}
              </div>
            </div>
            <div
              className={`w-3 h-3 rounded-full ${
                online ? "bg-green-400" : "bg-gray-600"
              }`}
            ></div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;
