import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import API from "../services/api";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import socket from "../utils/socket";
import Navbar from "../components/Navbar";

const Home = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await API.get("/chats", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setChats(res.data);
      } catch (err) {
        console.error("Failed to load chats", err);
      }
    };

    if (user?.token) {
      fetchChats();
    }
  }, [user]);

  useEffect(() => {
    if (user?._id) {
      socket.connect();
      socket.emit("joinUser", user._id);

      socket.on("onlineUsers", (users) => {
        setOnlineUsers(users);
      });

      return () => {
        socket.disconnect();
        socket.off("onlineUsers");
      };
    }
  }, [user]);

  const handleChatStarted = (chat) => {
    setSelectedChat(chat);
    if (!chats.some((c) => c._id === chat._id)) {
      setChats([chat, ...chats]);
    }
  };

  return (
    <>
      <Navbar />
      <div
        className="flex"
        style={{
          height: "calc(100vh - 64px)", // assuming Navbar height ~64px, adjust accordingly
          overflow: "hidden",
        }}
      >
        <ChatList
          chats={chats}
          onSelectChat={setSelectedChat}
          selectedChat={selectedChat}
          user={user}
          onlineUsers={onlineUsers}
          onChatStarted={handleChatStarted}
          style={{
            height: "100%",
            overflowY: "auto",
          }}
        />
        <ChatWindow
          selectedChat={selectedChat}
          style={{
            height: "100%",
            overflowY: "auto",
            flexGrow: 1,
          }}
        />
      </div>
    </>
  );
};

export default Home;
