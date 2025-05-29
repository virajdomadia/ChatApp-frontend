import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import API from "../services/api";
import socket from "../utils/socket";

const ChatWindow = ({ selectedChat }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      try {
        const res = await API.get(`/messages/${selectedChat._id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };

    fetchMessages();
    socket.emit("joinChat", selectedChat._id);
  }, [selectedChat, user.token]);

  useEffect(() => {
    const handleReceive = (msg) => {
      if (msg.chatId === selectedChat?._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleTyping = ({ userId, userName }) => {
      if (userId !== user._id) {
        setTypingUsers((prev) => {
          if (!prev.find((u) => u.userId === userId)) {
            return [...prev, { userId, userName }];
          }
          return prev;
        });
      }
    };

    const handleStopTyping = ({ userId }) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
    };

    socket.on("receiveMessage", handleReceive);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("receiveMessage", handleReceive);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [selectedChat, user._id]);

  const handleInputChange = (e) => {
    setText(e.target.value);

    if (!selectedChat) return;

    socket.emit("typing", {
      chatId: selectedChat._id,
      userId: user._id,
      userName: user.name,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        chatId: selectedChat._id,
        userId: user._id,
      });
    }, 1500);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const res = await API.post(
        "/messages",
        {
          chatId: selectedChat._id,
          text,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const newMsg = res.data;
      setMessages((prev) => [...prev, newMsg]);

      socket.emit("sendMessage", {
        chatId: selectedChat._id,
        ...newMsg,
      });

      socket.emit("stopTyping", {
        chatId: selectedChat._id,
        userId: user._id,
      });

      setText("");
    } catch (err) {
      console.error("Send message failed", err);
    }
  };

  return (
    <div className="w-2/3 flex flex-col h-full bg-[#0F1419]">
      {selectedChat ? (
        <>
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`mb-2 p-3 rounded max-w-xs break-words ${
                  msg.sender._id === user._id
                    ? "ml-auto bg-[#0B81FF] text-white shadow-md"
                    : "mr-auto bg-[#1E2A38] text-gray-200"
                }`}
              >
                <div className="text-sm">{msg.text}</div>
                <div className="text-xs text-right mt-1 opacity-70">
                  {msg.sender.name}
                </div>
              </div>
            ))}
            {typingUsers.length > 0 && (
              <div className="italic text-blue-400 text-sm mt-2">
                {typingUsers.map((u) => u.userName).join(", ")} typing...
              </div>
            )}
          </div>
          <form
            onSubmit={sendMessage}
            className="p-4 bg-[#1E2A38] border-t border-[#243447] flex"
          >
            <input
              className="flex-1 p-3 rounded-lg bg-[#121B22] border border-[#2A3949] text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0B81FF]"
              placeholder="Type a message..."
              value={text}
              onChange={handleInputChange}
            />
            <button
              className="bg-[#0B81FF] text-white px-5 py-2 rounded-lg ml-3 hover:bg-[#0665d1] transition"
              type="submit"
            >
              Send
            </button>
          </form>
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          Select a chat to start messaging
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
