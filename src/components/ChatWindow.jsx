// src/components/ChatWindow.jsx
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import API from "../services/api";
import socket from "../utils/socket";

const ChatWindow = ({ selectedChat }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUsers, setTypingUsers] = useState([]); // Track typing users
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!selectedChat) return;

    const fetchMessages = async () => {
      try {
        const res = await API.get(`/messages/${selectedChat._id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };

    fetchMessages();

    socket.emit("join", selectedChat._id);
  }, [selectedChat, user.token]);

  useEffect(() => {
    // Receive new message
    const handleReceive = (msg) => {
      if (msg.chatId === selectedChat?._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    // Typing event handlers
    const handleTyping = ({ userId, userName }) => {
      if (userId !== user._id) {
        setTypingUsers((prev) => {
          if (!prev.some((u) => u.userId === userId)) {
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

  // Emit typing events with debounce
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
      socket.emit("stopTyping", { chatId: selectedChat._id, userId: user._id });
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

      // Stop typing immediately after sending
      socket.emit("stopTyping", { chatId: selectedChat._id, userId: user._id });
      setText("");
    } catch (err) {
      console.error("Send message failed", err);
    }
  };

  return (
    <div className="w-2/3 flex flex-col h-full">
      {selectedChat ? (
        <>
          <div className="flex-1 p-4 overflow-y-auto bg-white">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`mb-2 p-2 rounded max-w-xs ${
                  msg.sender._id === user._id
                    ? "ml-auto bg-blue-500 text-white"
                    : "mr-auto bg-gray-200"
                }`}
              >
                <div className="text-sm">{msg.text}</div>
                <div className="text-xs text-right">{msg.sender.name}</div>
              </div>
            ))}

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="italic text-gray-500 text-sm mt-2">Typing...</div>
            )}
          </div>

          <form onSubmit={sendMessage} className="p-4 bg-gray-50 border-t flex">
            <input
              className="flex-1 p-2 border rounded mr-2"
              placeholder="Type a message..."
              value={text}
              onChange={handleInputChange}
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
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
