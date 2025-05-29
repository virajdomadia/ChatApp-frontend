// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import API from "../services/api";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import UserSearch from "../components/UserSearch";
import socket from "../utils/socket";

const Home = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await API.get("/chats", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        setChats(res.data);
      } catch (err) {
        console.error("Failed to load chats", err);
      }
    };
    fetchChats();
  }, [user]);

  useEffect(() => {
    if (user?._id) {
      socket.connect();
      socket.emit("join", user._id);
    }

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return (
    <>
      <UserSearch
        onChatStarted={(chat) => {
          setSelectedChat(chat);
          if (!chats.some((c) => c._id === chat._id)) {
            setChats([chat, ...chats]);
          }
        }}
      />
      <div className="flex h-screen">
        <ChatList
          chats={chats}
          onSelectChat={setSelectedChat}
          selectedChat={selectedChat}
        />
        <ChatWindow selectedChat={selectedChat} />
      </div>
    </>
  );
};

export default Home;
