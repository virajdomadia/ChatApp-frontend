// src/components/ChatWindow.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import API from "../services/api";
import socket from "../utils/socket";

const ChatWindow = ({ selectedChat }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

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
    const handleReceive = (msg) => {
      if (msg.chatId === selectedChat?._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("receiveMessage", handleReceive);
    return () => {
      socket.off("receiveMessage", handleReceive);
    };
  }, [selectedChat]);

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
          </div>

          <form onSubmit={sendMessage} className="p-4 bg-gray-50 border-t flex">
            <input
              className="flex-1 p-2 border rounded mr-2"
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
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
