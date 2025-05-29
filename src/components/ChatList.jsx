import React from "react";

const ChatList = ({ chats, onSelectChat, selectedChat, user, onlineUsers }) => {
  const isUserOnline = (userId) => onlineUsers.includes(userId);

  return (
    <div className="w-1/3 bg-gray-100 border-r p-4 overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">Chats</h2>
      {chats.map((chat) => {
        const other = chat.participants.find((u) => u._id !== user._id);
        const online = isUserOnline(other?._id);

        return (
          <div
            key={chat._id}
            onClick={() => onSelectChat(chat)}
            className={`cursor-pointer p-2 rounded flex items-center justify-between hover:bg-gray-200 ${
              selectedChat?._id === chat._id ? "bg-gray-300" : ""
            }`}
          >
            <div>
              <div className="font-medium">{other?.name}</div>
              <div className="text-xs text-gray-500">
                {online ? "Online" : "Offline"}
              </div>
            </div>
            <div
              className={`w-3 h-3 rounded-full ${
                online ? "bg-green-500" : "bg-gray-400"
              }`}
            ></div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;
