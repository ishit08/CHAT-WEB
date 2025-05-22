"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { FiSearch, FiMessageSquare, FiUsers, FiSettings, FiLogOut, FiX } from "react-icons/fi";
import { FaRegSmile } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import { AiFillHome } from "react-icons/ai";
import { BsChatDotsFill } from "react-icons/bs";
import { IoTicket } from "react-icons/io5";
import { FaChartLine, FaListUl } from "react-icons/fa6";
import { HiMegaphone } from "react-icons/hi2";
import { LuNetwork } from "react-icons/lu";
import { BsStars } from "react-icons/bs";
import { RiContactsBookFill, RiFolderImageFill } from "react-icons/ri";
import { MdChecklist } from "react-icons/md";
import { IoIosSettings } from "react-icons/io";
import { TbStarsFilled } from "react-icons/tb";
import { LuSquareChevronRight } from "react-icons/lu";

type Chat = {
  id: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: string;
};

type Message = {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
};

type User = {
  id: string;
  email: string;
  name: string;
  phone_number: string;
};

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleAuth = async () => {
      await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      setCurrentUserId(user.id);
      const { data: profile } = await supabase
        .from("users")
        .select("name, phone_number")
        .eq("id", user.id)
        .single();
      if (!profile || !profile.name || !profile.phone_number) {
        router.replace("/profile");
      } else {
        setLoading(false);
        fetchChats(user.id);
      }
    };
    handleAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Helper to get the other user's name for 1-1 chats
  const getOtherUserName = async (chatId: string, currentUserId: string) => {
    const { data: members, error } = await supabase
      .from("chat_members")
      .select("user_id, users:user_id(name)")
      .eq("chat_id", chatId);
    if (error) {
      console.error("Error fetching chat members:", error);
      return "Chat";
    }
    const membersArr = members as Array<{ user_id: string; users: { name: string } | { name: string }[] }>;
    const other = membersArr.find((m) => m.user_id !== currentUserId);
    let otherName = "Chat";
    if (other) {
      if (Array.isArray(other.users)) {
        otherName = other.users[0]?.name || "Chat";
      } else {
        otherName = other.users?.name || "Chat";
      }
    }
    return otherName;
  };

  const fetchChats = async (userId: string) => {
    const { data, error } = await supabase
      .from("chat_members")
      .select(`chat_id`)
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching chats:", error);
      return;
    }

    // For each chat, get the other user's name
    const chatPromises = (data || []).map(async (item: { chat_id: string }) => {
      const name = await getOtherUserName(item.chat_id, userId);
      return {
        id: item.chat_id,
        name,
        lastMessage: "Loading...",
        lastMessageTime: "",
      };
    });
    const formattedChats = await Promise.all(chatPromises);
    setChats(formattedChats);
    if (formattedChats.length > 0) {
      setSelectedChat(formattedChats[0].id);
    }
  };

  const fetchMessages = async (chatId: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }
    setMessages(data);
  };

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat);
      // Subscribe to new messages
      const subscription = supabase
        .channel(`chat:${selectedChat}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${selectedChat}` }, (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        })
        .subscribe();
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [selectedChat]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !currentUserId) return;
    const { error } = await supabase.from("messages").insert({
      chat_id: selectedChat,
      sender_id: currentUserId,
      content: newMessage,
    });
    if (error) {
      console.error("Error sending message:", error);
    } else {
      setNewMessage("");
    }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .neq("id", currentUserId);
    if (error) {
      console.error("Error fetching users:", error);
      return;
    }
    setUsers(data || []);
  };

  const createNewChat = async (userId: string) => {
    if (!currentUserId) return;

    // 1. Check if a 1-1 chat already exists between these two users
    const { data: existingChats, error: existingError } = await supabase
      .from("chat_members")
      .select("chat_id")
      .in("user_id", [currentUserId, userId]);

    if (existingError) {
      console.error("Error checking existing chats:", existingError);
      return;
    }

    // Count members in each chat_id
    const chatCounts: Record<string, number> = {};
    (existingChats || []).forEach((item: { chat_id: string }) => {
      chatCounts[item.chat_id] = (chatCounts[item.chat_id] || 0) + 1;
    });
    // Find a chat with exactly 2 members (1-1 chat)
    const existingChatId = Object.entries(chatCounts).find(([, count]) => count === 2)?.[0];
    if (existingChatId) {
      setSelectedChat(existingChatId);
      setShowNewChatModal(false);
      return;
    }

    // 2. If not found, create a new chat
    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .insert({})
      .select()
      .single();

    if (chatError) {
      console.error("Error creating chat:", chatError);
      return;
    }

    // Add both users as members
    const { error: membersError } = await supabase
      .from("chat_members")
      .insert([
        { chat_id: chat.id, user_id: currentUserId },
        { chat_id: chat.id, user_id: userId }
      ]);

    if (membersError) {
      console.error("Error adding members:", membersError);
      return;
    }

    // Refresh chats and select the new one
    await fetchChats(currentUserId);
    setSelectedChat(chat.id);
    setShowNewChatModal(false);
  };

  useEffect(() => {
    if (showNewChatModal && currentUserId) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showNewChatModal, currentUserId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-xl font-semibold text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f0f2f5] flex">
      {/* Pixel-perfect Vertical Sidebar */}
      <nav className="h-screen w-20 bg-white flex flex-col items-center pt-6 pb-4 select-none">
        {/* Logo */}
        <div className="relative flex items-center justify-center mb-8" style={{height: 64}}>
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-3xl leading-none">P</span>
          </div>
          <span className="absolute right-4 bottom-3 text-green-900 font-bold text-lg" style={{lineHeight: 1}}>12</span>
        </div>
        {/* Icons */}
        <button className="mb-2 flex items-center justify-center w-12 h-12 rounded-lg text-gray-500 hover:text-green-600">
          <AiFillHome size={28} />
        </button>
        <button className="mb-2 flex items-center justify-center w-12 h-12 rounded-2xl bg-green-50">
          <BsChatDotsFill size={24} className="text-green-600" />
        </button>
        <button className="mb-2 flex items-center justify-center w-12 h-12 rounded-lg text-gray-500 hover:text-green-600">
          <IoTicket size={28} />
        </button>
        <button className="mb-2 flex items-center justify-center w-12 h-12 rounded-lg text-gray-500 hover:text-green-600">
          <FaChartLine size={28} />
        </button>
        <div className="h-2" />
        <button className="mb-2 flex items-center justify-center w-12 h-12 rounded-lg text-gray-500 hover:text-green-600">
          <FaListUl size={28} />
        </button>
        <button className="mb-2 flex items-center justify-center w-12 h-12 rounded-lg text-gray-500 hover:text-green-600">
          <HiMegaphone size={28} />
        </button>
        <div className="mb-2 relative flex items-center justify-center w-12 h-12">
          <LuNetwork size={28} className="text-gray-500 hover:text-green-600" style={{ transform: 'scaleX(-1)' }} />
          <BsStars size={16} className="absolute right-0 top-1 text-yellow-400" />
        </div>
        <div className="h-2" />
        <button className="mb-2 flex items-center justify-center w-12 h-12 rounded-lg text-gray-500 hover:text-green-600">
          <RiContactsBookFill size={24} />
        </button>
        <button className="mb-2 flex items-center justify-center w-12 h-12 rounded-lg text-gray-500 hover:text-green-600">
          <RiFolderImageFill size={24} />
        </button>
        <div className="h-2" />
        <button className="mb-2 flex items-center justify-center w-12 h-12 rounded-lg text-gray-500 hover:text-green-600">
          <MdChecklist size={24} />
        </button>
        <button className="mb-2 flex items-center justify-center w-12 h-12 rounded-lg text-gray-500 hover:text-green-600">
          <IoIosSettings size={26} />
        </button>
        <div className="flex-1" />
        <button className="mb-2 flex items-center justify-center w-12 h-12 rounded-lg text-gray-500">
          <TbStarsFilled size={24} />
        </button>
        <button className="mb-2 flex items-center justify-center w-12 h-12 rounded-lg text-gray-500">
          <LuSquareChevronRight size={24} />
        </button>
      </nav>
      {/* Sidebar */}
      <aside className="w-[340px] bg-white border-r border-gray-200 flex flex-col">
        {/* Top section: Logo and nav */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg">P</div>
            <span className="font-bold text-lg text-gray-800">chats</span>
          </div>
          <button className="text-gray-400 hover:text-green-500">
            <FiSettings size={22} />
          </button>
        </div>
        {/* Search/filter */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-[#f6f6f6]">
          <button className="text-gray-400">
            <FiSearch size={20} />
          </button>
          <input
            className="flex-1 bg-transparent outline-none text-sm text-gray-700"
            placeholder="Search or start new chat"
            onClick={() => setShowNewChatModal(true)}
          />
          <button 
            className="text-gray-400 hover:text-green-500"
            onClick={() => setShowNewChatModal(true)}
          >
            <FiMessageSquare size={20} />
          </button>
        </div>

        {/* New Chat Modal */}
        {showNewChatModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-[400px] max-h-[600px] flex flex-col">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold">New Chat</h2>
                <button 
                  onClick={() => setShowNewChatModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>
              <div className="p-4 border-b">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full px-4 py-2 border rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex-1 overflow-y-auto">
                {users
                  .filter(user => 
                    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(user => (
                    <div
                      key={user.id}
                      className="p-4 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
                      onClick={() => createNewChat(user.id)}
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-[#e9edef] cursor-pointer border-b border-gray-100 ${selectedChat === chat.id ? "bg-[#e9edef]" : ""}`}
              onClick={() => setSelectedChat(chat.id)}
            >
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-500">
                {chat.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900 truncate">{chat.name}</span>
                  <span className="text-xs text-gray-400">{chat.lastMessageTime}</span>
                </div>
                <div className="text-sm text-gray-500 truncate">{chat.lastMessage}</div>
              </div>
            </div>
          ))}
        </div>
        {/* Bottom nav */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-[#f6f6f6]">
          <div className="flex gap-4">
            <button className="text-gray-400 hover:text-green-500"><FiUsers size={22} /></button>
            <button className="text-gray-400 hover:text-green-500"><FiMessageSquare size={22} /></button>
          </div>
          <button className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-bold">U</button>
        </div>
      </aside>
      {/* Main chat area */}
      <main className="flex-1 flex flex-col h-screen">
        {/* Chat header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-500">
              {selectedChat ? chats.find(c => c.id === selectedChat)?.name.charAt(0) : "?"}
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {selectedChat ? chats.find(c => c.id === selectedChat)?.name : "Select a chat"}
              </div>
              <div className="text-xs text-gray-500">Online</div>
            </div>
          </div>
          <div className="flex gap-4">
            <button className="text-gray-400 hover:text-green-500"><FiSearch size={20} /></button>
            <button className="text-gray-400 hover:text-green-500"><FiSettings size={20} /></button>
            <button className="text-gray-400 hover:text-green-500"><FiLogOut size={20} /></button>
          </div>
        </div>
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-8 py-6 bg-[#ece5dd] flex flex-col gap-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`self-${message.sender_id === currentUserId ? "end" : "start"} max-w-[60%]`}
            >
              <div className={`rounded-lg px-4 py-2 shadow text-gray-900 ${message.sender_id === currentUserId ? "bg-green-100" : "bg-white"}`}>
                {message.content}
              </div>
              <div className={`text-xs text-gray-500 mt-1 ${message.sender_id === currentUserId ? "text-right" : ""}`}>
                {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          ))}
        </div>
        {/* Message input */}
        <form onSubmit={handleSendMessage} className="flex items-center gap-4 px-6 py-4 bg-white border-t border-gray-200">
          <button type="button" className="text-gray-400 hover:text-green-500"><FaRegSmile size={22} /></button>
          <input
            className="flex-1 bg-[#f6f6f6] rounded-full px-4 py-2 outline-none text-gray-800"
            placeholder="Message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2 flex items-center justify-center">
            <IoMdSend size={22} />
          </button>
        </form>
      </main>
    </div>
  );
}
