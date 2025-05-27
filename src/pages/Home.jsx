import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { useEffect } from "react";
import API from "../services/api";
import ChatList from "../components/ChatList";
import ChatWindow from "../components/ChatWindow";
import UserSearch from "../components/UserSearch";

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
        const data = res.data;
        setChats(data);
      } catch (err) {
        console.error("Failed to load chats", err);
      }
    };
    fetchChats();
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
