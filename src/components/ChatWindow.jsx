import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import API from "../services/api";
import socket from "../utils/socket";
import ChatHeader from "./ChatHeader";

const ChatWindow = ({ selectedChat }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const typingTimeoutRef = useRef(null);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const navbarHeight = 64;

  const isUserNearBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    const threshold = 100;
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight <
      threshold + navbarHeight
    );
  };

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight - container.clientHeight + navbarHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });
    return () => {
      socket.off("onlineUsers");
    };
  }, []);

  useEffect(() => {
    if (!selectedChat) return;
    (async () => {
      try {
        const res = await API.get(`/messages/${selectedChat._id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    })();
    socket.emit("joinChat", selectedChat._id);
  }, [selectedChat, user.token]);

  useEffect(() => {
    const handleReceive = (msg) => {
      if (msg.chatId === selectedChat?._id) {
        const nearBottom = isUserNearBottom();
        setMessages((prev) => [...prev, msg]);
        if (nearBottom) {
          setTimeout(scrollToBottom, 100);
        }
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

  useEffect(() => {
    setTimeout(scrollToBottom, 100);
  }, [messages]);

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
        { chatId: selectedChat._id, text },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const newMsg = res.data;
      setMessages((prev) => [...prev, newMsg]);

      socket.emit("sendMessage", { chatId: selectedChat._id, ...newMsg });

      socket.emit("stopTyping", { chatId: selectedChat._id, userId: user._id });

      setText("");
    } catch (err) {
      console.error("Send message failed", err);
    }
  };

  return (
    <div className="w-2/3 flex flex-col h-full bg-[#121B26] shadow-lg">
      {selectedChat ? (
        <>
          <ChatHeader
            user={user}
            selectedChat={selectedChat}
            onlineUsers={onlineUsers}
          />
          <div
            ref={messagesContainerRef}
            className="flex-1 p-6 pt-20 overflow-y-auto scrollbar-thin scrollbar-thumb-[#4A90E2]/70 scrollbar-track-[#121B26]"
          >
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`mb-4 max-w-xs break-words p-4 rounded-2xl shadow-md ${
                  msg.sender._id === user._id
                    ? "ml-auto bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white"
                    : "mr-auto bg-[#1E2A38] text-gray-300"
                }`}
              >
                <div className="text-base leading-relaxed">{msg.text}</div>
                <div className="text-xs text-right mt-2 opacity-60 font-mono select-none">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
            {typingUsers.length > 0 && (
              <div className="text-[#A0AEC0] italic text-sm mb-4 select-none">
                {typingUsers.map((u) => u.userName).join(", ")}{" "}
                {typingUsers.length > 1 ? "are" : "is"} typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form
            onSubmit={sendMessage}
            className="p-5 border-t border-[#2C3E50] flex items-center gap-4 bg-[#182533] rounded-b-lg"
          >
            <input
              type="text"
              className="flex-grow rounded-full px-5 py-3 bg-[#1E2A38] text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4A90E2] transition"
              placeholder="Type your message..."
              value={text}
              onChange={handleInputChange}
              autoComplete="off"
            />
            <button
              type="submit"
              className="bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-full px-6 py-3 font-semibold transition-shadow shadow-md hover:shadow-lg"
            >
              Send
            </button>
          </form>
        </>
      ) : (
        <div className="flex-grow flex items-center justify-center text-gray-500 text-lg italic select-none">
          Select a chat to start messaging
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
