"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { RiChatAiLine } from 'react-icons/ri';
import Sidebar from "./components/Sidebar";
import ChatHeader from "./components/ChatHeader";
import ChatList from "./components/ChatList";
import ChatMessages from "./components/ChatMessages";
import ChatInput from "./components/ChatInput";
import RightSidebar from "./components/RightSidebar";
import NewChatModal from "./components/NewChatModal";
import ManageMembersModal from "./components/ManageMembersModal";
import TopBar from "./components/TopBar";

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
  attachment?: {
    name: string;
    type: string;
    url: string;
  };
};

type User = {
  id: string;
  email: string;
  name: string;
  phone_number: string;
};

// DEMO CONTACTS (always shown for every user)
const DEMO_CONTACTS: Chat[] = [
  {
    id: "demo-skope-final-5",
    name: "Test Skope Final 5",
    lastMessage: "Support2: This doesn't go on Tuesday...",
    lastMessageTime: "Yesterday",
    avatarUrl: "/Logo4.svg",
  },
  {
    id: "demo-periskope-team",
    name: "Periskope Team Chat",
    lastMessage: "Periskope: Test message",
    lastMessageTime: "28-Feb-25",
    avatarUrl: "/Logo2.svg",
  },
  {
    id: "+91-9999999999",
    name: "+91 9999999999",
    lastMessage: "Hi there, I'm Swapnika, Co-Founder of ...",
    lastMessageTime: "25-Feb-25",
    avatarUrl: "/Logo2.svg",
  },
  
  {
    id: "demo-demo17",
    name: "Test Demo17",
    lastMessage: "Rohosen: 123",
    lastMessageTime: "25-Feb-25",
    avatarUrl: undefined,
  },
  {
    id: "Test-El-Centro",
    name: "Test El Centro",
    lastMessage: "Rohosen: 123",
    lastMessageTime: "25-Feb-25",
    avatarUrl: undefined,
  },
  {
    id: "Testing-group",
    name: "Testing group",
    lastMessage: "Testing 12345",
    lastMessageTime: "27-Jan-25",
    avatarUrl: undefined,
  },
  {
    id: "Yasin-3",
    name: "Yasin 3",
    lastMessage: "First Bulk Message",
    lastMessageTime: "25-Nov-24",
    avatarUrl: undefined,
  },
  {
    id: "Test-Skope-Final-9473",
    name: "Test Skope Final 9473",
    lastMessage: "Hey",
    lastMessageTime: "01-Jan-25",
    avatarUrl: undefined,
  },
  {
    id: "Skope-Demo",
    name: "Skope demo",
    lastMessage: "test 123",
    lastMessageTime: "20-Dec-24",
    avatarUrl: undefined,
  },
  {
    id: "demo-demo15",
    name: "Test Demo15",
    lastMessage: "test 123",
    lastMessageTime: "20-Dec-24",
    avatarUrl: undefined,
  },
];

// DEMO MESSAGES for each demo chat
const DEMO_MESSAGES: Record<string, Message[]> = {
  "demo-periskope-team": [
    {
      id: "1",
      content: "Periskope: Test message",
      sender_id: "demo",
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      content: "Welcome to the Periskope Team Chat!",
      sender_id: "demo",
      created_at: new Date().toISOString(),
    },
  ],
  "Test-El-Centro": [
    {
      id: "1",
      content: "Support2: This doesn't go on Tuesday...",
      sender_id: "demo",
      created_at: new Date().toISOString(),
    },
  ],
  "demo-demo17": [
    {
      id: "1",
      content: "Rohosen: 123",
      sender_id: "demo",
      created_at: new Date().toISOString(),
    },
  ],
  "demo-demo15": [
    {
      id: "1",
      content: "test 123",
      sender_id: "demo",
      created_at: new Date().toISOString(),
    },
  ],
  "Skope-Demo": [
    {
      id: "1",
      content: "Test Demo15",
      sender_id: "demo",
      created_at: new Date().toISOString(),
    },
  ],
};

// Add group chat IDs for easy checking
const GROUP_CHAT_IDS = [
  "demo-skope-final-5",
  "demo-periskope-team",
  "demo-demo17",
  "Test-El-Centro",
];

// Add chat labels and numbers for each chat (customize as needed)
const CHAT_LABELS: Record<string, { labels: string[]; numbers?: string[] }> = {
  "demo-skope-final-5": { labels: ["Demo"]},
  "demo-periskope-team": { labels: ["Demo", "internal","+1"]},
  "+91-9999999999": { labels: ["Demo", "Signup"] },
  "demo-demo17": { labels: ["Content", "Demo"]},
  "Test-El-Centro": { labels: ["Demo"], numbers: [] },
  "Testing-group": { labels: ["Demo"], numbers: [] },
  "Yasin-3": { labels: ["Demo", "Dont Send","+2"]},
  "Test-Skope-Final-9473": { labels: ["Demo"]},
  "Skope-Demo": { labels: ["Demo"], numbers: [] },
  "demo-demo15": { labels: ["Demo"], numbers: [] },
};

// Add phone numbers for each chat (customize as needed)
const CHAT_PHONES: Record<string, string> = {
  "demo-skope-final-5": "+91 99718 44008 +1",
  "demo-periskope-team": "+91 99718 44008 +3",
  "+91-9999999999": "+91 92896 65999 +1",
  "demo-demo17": "+91 99718 44008 +1",
  "Test-El-Centro": "+91 99718 44008",
  "Testing-group": "+91 92896 65999",
  "Yasin-3": "+91 99718 44008 +3",
  "Test-Skope-Final-9473": "+91 99718 44008 +1",
  "Skope-Demo": "+91 92896 65999",
  "demo-demo15": "+91 92896 65999",
};

// Hardcoded messages for Test-El-Centro
type TestElCentroMessage = {
  id: string;
  sender: string;
  phone: string;
  content: string;
  time: string;
  date: string;
  side: 'left' | 'right';
  email?: string;
};

const TEST_EL_CENTRO_MESSAGES: TestElCentroMessage[] = [
  { id: '1', sender: 'Roshnag Airtel', phone: '+91 83646 47925', content: 'CVFER', time: '11:51', date: '23-10-2024', side: 'left' },
  { id: '2', sender: 'Roshnag Airtel', phone: '+91 83646 47925', content: 'CDERT', time: '11:54', date: '23-10-2024', side: 'left' },
  { id: '4', sender: 'Roshnag Airtel', phone: '+91 83646 47925', content: 'Hello, South Euna!', time: '08:01', date: '22-01-2025', side: 'left' },
  { id: '5', sender: 'Roshnag Airtel', phone: '+91 83646 47925', content: 'Hello, Livonia!', time: '08:10', date: '23-01-2025', side: 'left' },
  { id: '3', sender: 'Periskope', phone: '+91 99718 44008', content: 'hello', time: '08:00', date: '23-01-2025', side: 'right', email: 'bharat@hashlabs.dev' },
  { id: '6', sender: 'Roshnag Airtel', phone: '+91 83646 47925', content: 'CVFER', time: '11:51', date: '23-01-2025', side: 'left' },
  { id: '7', sender: 'Periskope', phone: '+91 99718 44008', content: 'test el centro', time: '09:49', date: '23-01-2025', side: 'right', email: 'bharat@hashlabs.dev' },
  { id: '8', sender: 'Periskope', phone: '+91 99718 44008', content: 'testing', time: '09:49', date: '23-01-2025', side: 'right', email: 'bharat@hashlabs.dev' },
];

// Define Attachment type
type Attachment = {
  id: string;
  message_id: string;
  file_name: string;
  file_type: string;
  file_url: string;
  file_size: number;
  created_at: string;
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
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [demoMessages, setDemoMessages] = useState<Record<string, Message[]>>(DEMO_MESSAGES);
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachmentsMap, setAttachmentsMap] = useState<Record<string, Attachment[]>>({});
  const [uploading, setUploading] = useState(false);
  const [userMap, setUserMap] = useState<Record<string, { name: string; phone_number: string }>>({});
  const [chatSearch, setChatSearch] = useState("");
  const [chatLabelsState, setChatLabelsState] = useState(CHAT_LABELS);
  const [labelInput, setLabelInput] = useState<{[chatId: string]: string}>({});
  const [showLabelInput, setShowLabelInput] = useState<{[chatId: string]: boolean}>({});
  const labelInputRefs = useRef<{[chatId: string]: HTMLFormElement | null}>({});
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [chatSortOrder, setChatSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showManageMembersModal, setShowManageMembersModal] = useState(false);
  const [chatMembers, setChatMembers] = useState<string[]>([]);
  const [chatMemberNames, setChatMemberNames] = useState<string[]>([]);

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

    // For each chat, get the other user's name and last message
    const chatPromises = (data || []).map(async (item: { chat_id: string }) => {
      const name = await getOtherUserName(item.chat_id, userId);
      
      // Fetch the last message for this chat
      const { data: lastMessageData } = await supabase
        .from("messages")
        .select("content, created_at")
        .eq("chat_id", item.chat_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      return {
        id: item.chat_id,
        name,
        lastMessage: lastMessageData?.content || "No messages yet",
        lastMessageTime: lastMessageData?.created_at ? new Date(lastMessageData.created_at).toLocaleDateString() : "",
        avatarUrl: (await getOtherUserAvatar(item.chat_id, userId)) || undefined,
      };
    });
    const formattedChats = await Promise.all(chatPromises);

    // Filter out demo contacts that might have the same ID as a real chat
    const realChatIds = new Set(formattedChats.map(c => c.id));
    const demoChatsToAdd = DEMO_CONTACTS.filter(demo => !realChatIds.has(demo.id));
    const allChats = [...demoChatsToAdd, ...formattedChats];

    setChats(allChats);
    if (allChats.length > 0) {
      const defaultChat = allChats.find(c => c.id === 'Test-El-Centro');
      setSelectedChat(defaultChat ? defaultChat.id : allChats[0].id);
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

  const fetchMessages = useCallback(async (chatId: string) => {
    if (chatId.startsWith("demo-") || DEMO_CONTACTS.some(chat => chat.id === chatId)) {
      setMessages(demoMessages[chatId] || []);
      setAttachmentsMap({});
      return;
    }
    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }
    setMessages(messages);
    // Fetch attachments for these messages
    const messageIds = messages.map((msg: { id: string }) => msg.id);
    if (messageIds.length > 0) {
      const { data: attachments, error: attError } = await supabase
        .from("attachments")
        .select("*")
        .in("message_id", messageIds);
      if (attError) {
        console.error("Error fetching attachments:", attError);
        setAttachmentsMap({});
      } else {
        // Map message_id to array of attachments
        const map: Record<string, Attachment[]> = {};
        for (const att of attachments) {
          if (!map[att.message_id]) map[att.message_id] = [];
          map[att.message_id].push(att);
        }
        setAttachmentsMap(map);
      }
    } else {
      setAttachmentsMap({});
    }
  }, [demoMessages]);

  useEffect(() => {
    if (selectedChat) {
      if (selectedChat.startsWith("demo-") || DEMO_CONTACTS.some(chat => chat.id === selectedChat)) {
        setMessages(demoMessages[selectedChat] || []);
      } else {
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
    }
  }, [selectedChat, demoMessages, fetchMessages]);

  // Remove the polling mechanism since we're handling demo messages differently
  useEffect(() => {
    if (!selectedChat || uploading || selectedChat.startsWith("demo-") || DEMO_CONTACTS.some(chat => chat.id === selectedChat)) return;
    const interval = setInterval(() => {
      fetchMessages(selectedChat);
    }, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [selectedChat, uploading, fetchMessages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
      const ALLOWED_TYPES = [
        'image/jpeg', 'image/png', 'image/gif',
        'application/pdf', 'text/plain',
        'video/mp4', 'video/webm', 'video/ogg'
      ];
      if (file.size > MAX_FILE_SIZE) {
        alert('File is too large. Maximum size is 50MB.');
        return;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert('File type not allowed.');
        return;
      }
      setAttachment(file);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachment) || !selectedChat || !currentUserId) return;
    setUploading(true);

    if (selectedChat.startsWith("demo-") || DEMO_CONTACTS.some(chat => chat.id === selectedChat)) {
      // Handle demo chat messages (no upload)
      const newDemoMessage: Message = {
        id: Date.now().toString(),
        content: newMessage,
        sender_id: currentUserId,
        created_at: new Date().toISOString(),
        ...(attachment && {
          attachment: {
            name: attachment.name,
            type: attachment.type,
            url: URL.createObjectURL(attachment)
          }
        })
      };
      setDemoMessages(prev => ({
        ...prev,
        [selectedChat]: [...(prev[selectedChat] || []), newDemoMessage]
      }));
      setChats(prev => prev.map(chat => {
        if (chat.id === selectedChat) {
          return {
            ...chat,
            lastMessage: attachment ? `📎 ${attachment.name}` : newMessage,
            lastMessageTime: new Date().toLocaleDateString()
          };
        }
        return chat;
      }));
    } else {
      // Handle real chat messages with attachment upload
      let messageId = null;
      // 1. Create the message first
      const { data: messageData, error: messageError } = await supabase
        .from("messages")
        .insert({
          chat_id: selectedChat,
          sender_id: currentUserId,
          content: newMessage,
          has_attachments: !!attachment
        })
        .select()
        .single();
      if (messageError) {
        console.error("Error sending message:", messageError);
        return;
      }
      messageId = messageData.id;
      // 2. If there is an attachment, upload it
      if (attachment) {
        // Sanitize file name for Supabase Storage
        const safeFileName = attachment.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const filePath = `${messageId}/${safeFileName}`;
        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filePath, attachment);
        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          return;
        }
        // 3. Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('attachments')
          .getPublicUrl(filePath);
        // 4. Insert into attachments table
        const { error: dbError } = await supabase
          .from('attachments')
          .insert({
            message_id: messageId,
            file_name: attachment.name,
            file_type: attachment.type,
            file_size: attachment.size,
            file_url: publicUrl,
            created_at: new Date().toISOString()
          });
        if (dbError) {
          console.error('Error saving attachment metadata:', dbError);
        }
        // 5. Update message to indicate it has attachments (already set above)
      }
    }
    setNewMessage("");
    setAttachment(null);
    setUploading(false); // Resume polling after upload
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

  // Auto-scroll to bottom when messages or selectedChat change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedChat]);

  // Fetch all users in the chat and build a map from user_id to user info
  useEffect(() => {
    async function fetchChatUsers() {
      if (!selectedChat) return;
      // Get all user_ids in this chat
      const { data: members, error } = await supabase
        .from("chat_members")
        .select("user_id")
        .eq("chat_id", selectedChat);
      if (error || !members) return;
      const userIds = members.map((m: { user_id: string }) => m.user_id);
      if (userIds.length === 0) return;
      // Fetch user info for all user_ids
      const { data: users, error: userError } = await supabase
        .from("users")
        .select("id, name, phone_number")
        .in("id", userIds);
      if (userError || !users) return;
      const map: Record<string, { name: string; phone_number: string }> = {};
      users.forEach((u: { id: string; name: string; phone_number: string }) => {
        map[u.id] = { name: u.name, phone_number: u.phone_number };
      });
      setUserMap(map);
    }
    fetchChatUsers();
  }, [selectedChat]);

  // Filter and Search Logic
  const filteredChats = chats
    .filter(chat => {
      // Search logic
      const searchMatch =
        chat.name.toLowerCase().includes(chatSearch.toLowerCase()) ||
        (chat.lastMessage && chat.lastMessage.toLowerCase().includes(chatSearch.toLowerCase())) ||
        (CHAT_PHONES[chat.id] && CHAT_PHONES[chat.id].toLowerCase().includes(chatSearch.toLowerCase()));
      return searchMatch;
    })
    .sort((a, b) => {
      if (chatSortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });

  // useEffect to close label input on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const anyOpen = Object.values(showLabelInput).some(Boolean);
      if (!anyOpen) return;
      let clickedInside = false;
      Object.keys(showLabelInput).forEach(chatId => {
        if (showLabelInput[chatId] && labelInputRefs.current[chatId]) {
          if (labelInputRefs.current[chatId]?.contains(event.target as Node)) {
            clickedInside = true;
          }
        }
      });
      if (!clickedInside) {
        setShowLabelInput({});
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showLabelInput]);

  // 2. Fetch chat members when modal opens or selectedChat changes
  useEffect(() => {
    async function fetchMembers() {
      if (!selectedChat) return;
      const { data, error } = await supabase
        .from("chat_members")
        .select("user_id")
        .eq("chat_id", selectedChat);
      if (!error && data) {
        setChatMembers(data.map((m: { user_id: string }) => m.user_id));
      }
    }
    if (showManageMembersModal) fetchMembers();
  }, [showManageMembersModal, selectedChat]);

  // 1. Merge demo users and database users for the modal
  const allPossibleMembers = [
    ...DEMO_CONTACTS.map(dc => ({ id: dc.id, name: dc.name, email: dc.name + '@demo.com', isDemo: true })),
    ...users.filter(u => !DEMO_CONTACTS.some(dc => dc.id === u.id)).map(u => ({ ...u, isDemo: false }))
  ];

  // Add useEffect to fetch users when Manage Members modal is opened
  useEffect(() => {
    if (showManageMembersModal) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showManageMembersModal]);

  // 2. Fetch and update chat member names after saving members or when selectedChat changes
  useEffect(() => {
    async function fetchMemberNames() {
      if (!selectedChat) return;
      const { data: members, error } = await supabase
        .from("chat_members")
        .select("user_id, users:user_id(name)")
        .eq("chat_id", selectedChat);
      if (!error && members) {
        const names = members.map((m: { users: { name: string } | { name: string }[] }) => 
          Array.isArray(m.users) ? m.users[0]?.name : m.users?.name
        ).filter(Boolean);
        setChatMemberNames(names);
      } else {
        setChatMemberNames([]);
      }
    }
    fetchMemberNames();
  }, [selectedChat]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-xl font-semibold text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#f0f2f5] flex">
      {/* Pixel-perfect Vertical Sidebar */}
      <Sidebar />
      {/* Main content area (right side) */}
      <div className="flex-1 flex flex-col h-full min-h-0">
        {/* Top Bar */}
        <TopBar />
        <div className="flex flex-1 w-full h-[calc(100vh-3rem)]">
          {/* Sidebar */}
          <aside className="w-[360px] bg-white flex flex-col relative">
            {/* New Chat Modal */}
            <NewChatModal
              show={showNewChatModal}
              onClose={() => setShowNewChatModal(false)}
              users={users}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              createNewChat={createNewChat}
            />

            {/* Chat list: independently scrollable, fixed height below filter/search bar */}
            <ChatList
              chats={filteredChats}
              selectedChat={selectedChat}
              setSelectedChat={setSelectedChat}
              chatLabelsState={chatLabelsState}
              setChatLabelsState={setChatLabelsState}
              chatSearch={chatSearch}
              setChatSearch={setChatSearch}
              chatSortOrder={chatSortOrder}
              setChatSortOrder={setChatSortOrder}
              showFilterDropdown={showFilterDropdown}
              setShowFilterDropdown={setShowFilterDropdown}
              showLabelInput={showLabelInput}
              setShowLabelInput={setShowLabelInput}
              labelInput={labelInput}
              setLabelInput={setLabelInput}
              labelInputRefs={labelInputRefs}
              GROUP_CHAT_IDS={GROUP_CHAT_IDS}
              CHAT_PHONES={CHAT_PHONES}
            />
          </aside>
          {/* Main chat area */}
          <main className="flex-1 flex flex-col h-full min-h-0">
            
            <ChatHeader
              selectedChat={selectedChat}
              chats={chats}
              chatMemberNames={chatMemberNames}
              GROUP_CHAT_IDS={GROUP_CHAT_IDS}
              setShowManageMembersModal={setShowManageMembersModal}
            />
            {/* Messages area */}
            <div className="flex-1 min-h-0 overflow-y-auto px-8 py-6 bg-[#ece5dd] flex flex-col gap-1">
              <ChatMessages
                selectedChat={selectedChat}
                messages={messages}
                userMap={userMap}
                currentUserId={currentUserId}
                attachmentsMap={attachmentsMap}
                TEST_EL_CENTRO_MESSAGES={TEST_EL_CENTRO_MESSAGES}
                messagesEndRef={messagesEndRef}
              />
                                </div>
            {/* Message input */}
            <ChatInput
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              handleSendMessage={handleSendMessage}
              attachment={attachment}
              setAttachment={setAttachment}
              fileInputRef={fileInputRef}
              handleFileSelect={handleFileSelect}
              uploading={uploading}
            />
          </main>
          {/* Right Sidebar */}
          <RightSidebar />
                        </div>
                    </div>
      {!showNewChatModal && (
                    <button
          className="fixed bottom-8 left-[360px] z-50 bg-green-600 hover:bg-green-700 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
          onClick={() => setShowNewChatModal(true)}
                    >
          <RiChatAiLine size={22} />
                    </button>
      )}
      {/* Manage Members Modal */}
      <ManageMembersModal
        show={showManageMembersModal}
        onClose={() => setShowManageMembersModal(false)}
        allPossibleMembers={allPossibleMembers}
        chatMembers={chatMembers}
        setChatMembers={setChatMembers}
        selectedChat={selectedChat}
        currentUserId={currentUserId}
        fetchChats={fetchChats}
        setChatMemberNames={setChatMemberNames}
        supabase={supabase}
        DEMO_CONTACTS={DEMO_CONTACTS}
      />
    </div>
  );
}