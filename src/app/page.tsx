"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { FiSearch, FiMessageSquare, FiUsers, FiSettings, FiLogOut, FiX, FiList, FiPaperclip, FiClock } from "react-icons/fi";
import { FaRegSmile } from "react-icons/fa";
import { AiFillHome } from "react-icons/ai";
import { BsChatDotsFill } from "react-icons/bs";
import { IoTicket } from "react-icons/io5";
import { FaChartLine, FaListUl, FaAt } from "react-icons/fa6";
import { HiMegaphone } from "react-icons/hi2";
import { LuNetwork } from "react-icons/lu";
import { BsStars } from "react-icons/bs";
import { RiContactsBookFill, RiFolderImageFill } from "react-icons/ri";
import { MdChecklist } from "react-icons/md";
import { IoIosSettings } from "react-icons/io";
import { TbStarsFilled, TbRefreshDot } from "react-icons/tb";
import { LuSquareChevronRight } from "react-icons/lu";
import { HiFolderArrowDown } from "react-icons/hi2";
import { IoFilterSharp } from "react-icons/io5";
import { IoMdHelpCircleOutline } from "react-icons/io";
import { HiChevronUpDown } from "react-icons/hi2";
import { MdInstallDesktop } from "react-icons/md";
import { BiSolidBellOff } from "react-icons/bi";
import { TbSquareChevronLeft } from "react-icons/tb";
import { LuRefreshCw, LuPencilLine } from "react-icons/lu";
import { VscListSelection } from "react-icons/vsc";
import { RiListCheck2, RiListSettingsLine } from "react-icons/ri";
import { DiHtml5Connectivity } from "react-icons/di";
import { MdGroups } from "react-icons/md";
import { AiOutlineHistory } from "react-icons/ai";
import { HiOutlineSparkles } from "react-icons/hi";
import { RiBarChartBoxFill } from "react-icons/ri";
import { FaMicrophone } from "react-icons/fa";
import Image from "next/image";
import { IoSend } from "react-icons/io5";

type Chat = {
  id: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: string;
  avatarUrl?: string;
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
        avatarUrl: (await getOtherUserAvatar(item.chat_id, userId)) || undefined,
      };
    });
    const formattedChats = await Promise.all(chatPromises);
    setChats(formattedChats);
    if (formattedChats.length > 0) {
      setSelectedChat(formattedChats[0].id);
    }
  };

  const getOtherUserAvatar = async (chatId: string, currentUserId: string) => {
    const { data: members, error } = await supabase
      .from("chat_members")
      .select("user_id, users:user_id(avatar_url)")
      .eq("chat_id", chatId);
    if (error) {
      console.error("Error fetching chat members:", error);
      return null;
    }
    const membersArr = members as Array<{ user_id: string; users: { avatar_url?: string } | { avatar_url?: string }[] }>;
    const other = membersArr.find((m) => m.user_id !== currentUserId);
    let avatarUrl: string | undefined;
    if (other) {
      if (Array.isArray(other.users)) {
        avatarUrl = other.users[0]?.avatar_url;
      } else {
        avatarUrl = other.users?.avatar_url;
      }
    }
    return avatarUrl;
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
      <nav className="h-screen w-14 bg-[#f7f7f7] border-r border-gray-200 flex flex-col items-center pt-2 pb-2 select-none">
        {/* Logo */}
        <div className="relative flex items-center justify-center mb-4" style={{height: 48}}>
          <img src="/Logo4.svg" alt="Logo" className="w-10 h-10 rounded-full object-contain bg-white" />
        </div>
        {/* Icons */}
        <button className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:bg-gray-200">
          <AiFillHome size={20} />
        </button>
        {/* Divider after Home */}
        <div className="self-stretch border-b border-gray-200 my-1 mx-2" />

        <button className="flex items-center justify-center w-10 h-8 rounded-lg bg-gray-200">
          <BsChatDotsFill size={20} className="text-green-600" />
        </button>
        <button className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:bg-gray-200">
          <IoTicket size={20} />
        </button>
        <button className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:bg-gray-200">
          <FaChartLine size={20} />
        </button>
        {/* Divider after Line Chart */}
        <div className="self-stretch border-b border-gray-200 my-1 mx-2" />

        <button className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:bg-gray-200">
          <FaListUl size={20} />
        </button>
        <button className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:bg-gray-200">
          <HiMegaphone size={20} />
        </button>
        <div className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:bg-gray-200 relative">
          <LuNetwork size={20} className="text-gray-500" style={{ transform: 'scaleX(-1)' }} />
          <BsStars size={12} className="absolute right-0 top-1 text-yellow-400" />
        </div>
        {/* Divider after Network */}
        <div className="self-stretch border-b border-gray-200 my-1 mx-2" />

        <button className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:bg-gray-200">
          <RiContactsBookFill size={18} />
        </button>
        <button className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:bg-gray-200">
          <RiFolderImageFill size={18} />
        </button>
        {/* Divider after Gallery */}
        <div className="self-stretch border-b border-gray-200 my-1 mx-2" />
        <button className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:bg-gray-200">
          <MdChecklist size={18} />
        </button>
        <button className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:bg-gray-200">
          <IoIosSettings size={18} />
        </button>

        <div className="flex-1" />
        <button className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-500">
          <TbStarsFilled size={18} />
        </button>
        <button className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-500">
          <LuSquareChevronRight size={18} />
        </button>
    
      </nav>
      {/* Main content area (right side) */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="w-full h-12 bg-white border-b border-gray-200 flex items-center justify-between z-30 px-6">
          <div className="flex items-center gap-2">
            <BsChatDotsFill className="w-5 h-5" style={{ color: '#8B929C' }} />
            <span className="font-bold text-lg text-gray-400">chats</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1 px-2 py-1 border border-gray-200 rounded bg-white text-gray-600 hover:bg-gray-100 text-sm font-bold">
              <TbRefreshDot className="w-4 h-4" /> Refresh
            </button>
            <button className="flex items-center gap-1 px-2 py-1 border border-gray-200 rounded bg-white text-gray-600 hover:bg-gray-100 text-sm font-bold">
              <IoMdHelpCircleOutline className="w-4 h-4" /> Help
            </button>
            <div className="flex items-center gap-1 px-2 py-1 border border-gray-200 rounded bg-white text-gray-600 text-sm font-bold">
              <span className="w-5 h-5 flex items-center justify-center rounded-full bg-yellow-100 mr-1">
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              </span>
              5 / 6 phones
              <HiChevronUpDown className="w-4 h-4 ml-1" />
            </div>
            <button className="flex items-center justify-center px-2 py-1 border border-gray-200 rounded bg-white text-gray-600 hover:bg-gray-100">
              <MdInstallDesktop className="w-4 h-4" />
            </button>
            <button className="flex items-center justify-center px-2 py-1 border border-gray-200 rounded bg-white text-gray-600 hover:bg-gray-100">
              <BiSolidBellOff className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-center px-2 py-1 border border-gray-200 rounded bg-white text-gray-600 hover:bg-gray-100">
              <BsStars className="w-4 h-4 text-yellow-300" />
              <FiList className="w-4 h-4 text-gray-500" />
            </div>
          </div>
        </div>
        <div className="flex flex-1 w-full h-[calc(100vh-3rem)]">
          {/* Sidebar */}
          <aside className="w-[360px] bg-white flex flex-col relative">
            {/* Filter/Search Bar Section */}
            <div className="flex items-center justify-between px-3 py-3 bg-white border-b border-gray-100 text-xs border-r border-gray-200">
              {/* Left: Custom filter and Save */}
              <div className="flex items-center gap-x-1">
                <button className="flex items-center gap-1 font-semibold bg-white px-1 py-0.5 rounded border border-transparent text-xs" style={{ color: '#199455' }}>
                  <HiFolderArrowDown className="w-3 h-3" style={{ color: '#199455' }} />
                  Custom filter
                </button>
                <button className="bg-white border border-gray-300 px-1 py-0.5 rounded text-gray-700 text-xs shadow-sm">Save</button>
              </div>
              {/* Right: Search and Filtered */}
              <div className="flex items-center gap-x-2">
                <div className="flex items-center bg-white border border-gray-300 px-1 py-0.5 rounded gap-x-1">
                  <svg width="8" height="8" fill="none" viewBox="0 0 24 24" className="w-2 h-2 text-gray-700"><path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <input className="bg-transparent outline-none text-xs text-gray-700 placeholder-gray-700 w-10" placeholder="Search" onClick={() => setShowNewChatModal(true)} />
                </div>
                <div className="relative bg-white border border-gray-300 px-1 py-0.5 rounded flex items-center ml-1">
                  <button className="flex items-center gap-1 font-semibold bg-white border-none p-0 text-xs" style={{ color: '#199455' }}>
                    <IoFilterSharp className="w-2.5 h-2.5" style={{ color: '#199455' }} />
                    Filtered
                  </button>
                  <span className="absolute -top-1 -right-2 w-3 h-3 flex items-center justify-center rounded-full text-base cursor-pointer" style={{ background: '#5BA16F', color: 'white' }}>×</span>
                </div>
              </div>
            </div>
            {/* Search/filter */}
   

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
            <div className="flex-1 overflow-y-auto border-r border-gray-200">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-[#e9edef] cursor-pointer border-b border-gray-100 ${selectedChat === chat.id ? "bg-[#e9edef]" : ""}`}
                  onClick={() => setSelectedChat(chat.id)}
                >
                  {/* Avatar: show profile image if available, else fallback to initial */}
                  {chat.avatarUrl ? (
                    <img
                      src={chat.avatarUrl}
                      alt={chat.name}
                      className="w-12 h-12 rounded-full object-cover bg-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-500">
                      {chat.name.charAt(0)}
                    </div>
                  )}
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
          <main className="flex-1 flex flex-col">
            {/* Chat header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-500">
                  {selectedChat ? chats.find(c => c.id === selectedChat)?.name.charAt(0) : "?"}
                </div>
                <div>
                  <div className="font-semibold text-sm text-gray-900 leading-tight">
                    {selectedChat ? chats.find(c => c.id === selectedChat)?.name : "Select a chat"}
                  </div>
                  <div className="text-xs text-gray-500 leading-none">Online</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="text-gray-400 hover:text-green-500"><FiSearch size={16} /></button>
                <button className="text-gray-400 hover:text-green-500"><FiSettings size={16} /></button>
                <button className="text-gray-400 hover:text-green-500"><FiLogOut size={16} /></button>
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
            <form onSubmit={handleSendMessage} className="flex flex-col gap-0 px-0 pt-4 pb-4 bg-white border-t border-gray-200">
              <div className="flex items-center w-full px-7 mb-4 relative">
                <input
                  className="flex-1 bg-transparent pt-0 pb-2 outline-none text-gray-800 border-none text-base font-bold leading-tight placeholder:font-bold placeholder:text-gray-400 placeholder:leading-tight"
                  placeholder="Message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <div className="flex flex-col items-center ml-2">
                  <button type="submit" className="p-0 m-0 bg-transparent rounded-none shadow-none flex items-center justify-center">
                    <IoSend size={28} color="#199455" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-6 mt-0 px-7">
                <button type="button" className="text-[#434B57] hover:text-green-600 focus:outline-none"><FiPaperclip size={22} /></button>
                <button type="button" className="text-[#434B57] hover:text-green-600 focus:outline-none"><FaRegSmile size={22} /></button>
                <button type="button" className="text-[#434B57] hover:text-green-600 focus:outline-none"><FiClock size={22} /></button>
                <button type="button" className="text-[#434B57] hover:text-green-600 focus:outline-none"><AiOutlineHistory size={22} /></button>
                <button type="button" className="text-[#434B57] hover:text-green-600 focus:outline-none"><HiOutlineSparkles size={22} /></button>
                <button type="button" className="text-[#434B57] hover:text-green-600 focus:outline-none"><RiBarChartBoxFill size={22} /></button>
                <button type="button" className="text-[#434B57] hover:text-green-600 focus:outline-none"><FaMicrophone size={18} /></button>
                <div className="ml-auto flex items-center bg-white rounded-lg shadow-sm px-3 py-1 gap-2 border border-gray-200" style={{ minWidth: 140 }}>
                  <Image src="/Logo2.svg" alt="Periskope Logo" width={22} height={22} className="rounded-full" />
                  <span className="font-bold text-base text-black">Periskope</span>
                  <HiChevronUpDown className="text-gray-400 ml-4" size={16} />
                </div>
              </div>
            </form>
          </main>
          {/* Right Sidebar */}
          <aside className="w-14 bg-white border-l border-gray-200 flex flex-col items-center py-4 gap-2mak">
            <button className="w-10 h-10 flex items-center justify-center text-[#A0A4AB] hover:text-green-500 transition-colors duration-150">
              <TbSquareChevronLeft size={18} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-[#A0A4AB] hover:text-green-500 transition-colors duration-150">
              <LuRefreshCw size={18} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-[#A0A4AB] hover:text-green-500 transition-colors duration-150">
              <LuPencilLine size={18} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-[#A0A4AB] hover:text-green-500 transition-colors duration-150">
              <VscListSelection size={18} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-[#A0A4AB] hover:text-green-500 transition-colors duration-150">
              <RiListCheck2 size={18} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-[#A0A4AB] hover:text-green-500 transition-colors duration-150">
              <DiHtml5Connectivity size={18} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-[#A0A4AB] hover:text-green-500 transition-colors duration-150">
              <FaAt size={18} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-[#A0A4AB] hover:text-green-500 transition-colors duration-150">
              <MdGroups size={18} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-[#A0A4AB] hover:text-green-500 transition-colors duration-150">
              <RiFolderImageFill size={18} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-[#A0A4AB] hover:text-green-500 transition-colors duration-150">
              <RiListSettingsLine size={18} />
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}