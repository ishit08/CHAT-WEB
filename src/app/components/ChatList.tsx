import Image from "next/image";
import { HiFolderArrowDown } from "react-icons/hi2";
import { IoFilterSharp } from "react-icons/io5";
import { IoPerson, IoPersonCircle } from "react-icons/io5";
import { BsCheckAll } from "react-icons/bs";
import { FaPhoneAlt } from "react-icons/fa";
import { MdGroups } from "react-icons/md";

type Chat = {
  id: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: string;
  avatarUrl?: string;
};

interface ChatListProps {
  chats: Chat[];
  selectedChat: string | null;
  setSelectedChat: (id: string) => void;
  chatLabelsState: Record<string, { labels: string[]; numbers?: string[] }>;
  setChatLabelsState: React.Dispatch<React.SetStateAction<Record<string, { labels: string[]; numbers?: string[] }>>>;
  chatSearch: string;
  setChatSearch: (v: string) => void;
  chatSortOrder: 'default' | 'asc' | 'desc';
  setChatSortOrder: (v: 'default' | 'asc' | 'desc') => void;
  showFilterDropdown: boolean;
  setShowFilterDropdown: (v: boolean) => void;
  showLabelInput: { [chatId: string]: boolean };
  setShowLabelInput: React.Dispatch<React.SetStateAction<{ [chatId: string]: boolean }>>;
  labelInput: { [chatId: string]: string };
  setLabelInput: React.Dispatch<React.SetStateAction<{ [chatId: string]: string }>>;
  labelInputRefs: React.MutableRefObject<{ [chatId: string]: HTMLFormElement | null }>;
  GROUP_CHAT_IDS: string[];
  CHAT_PHONES: Record<string, string>;
}

export default function ChatList({
  chats,
  selectedChat,
  setSelectedChat,
  chatLabelsState,
  setChatLabelsState,
  chatSearch,
  setChatSearch,
  chatSortOrder,
  setChatSortOrder,
  showFilterDropdown,
  setShowFilterDropdown,
  showLabelInput,
  setShowLabelInput,
  labelInput,
  setLabelInput,
  labelInputRefs,
  GROUP_CHAT_IDS,
  CHAT_PHONES
}: ChatListProps) {
  return (
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
            <input
              className="bg-transparent outline-none text-xs text-gray-700 placeholder-gray-700 w-10"
              placeholder="Search"
              value={chatSearch}
              onChange={e => setChatSearch(e.target.value)}
            />
          </div>
          <div className="relative bg-white border border-gray-300 px-1 py-0.5 rounded flex items-center ml-1">
            <button
              className="flex items-center gap-1 font-semibold bg-white border-none p-0 text-xs"
              style={{ color: '#199455' }}
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              type="button"
            >
              <IoFilterSharp className="w-2.5 h-2.5" style={{ color: '#199455' }} />
              Filtered
            </button>
            {showFilterDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-300 rounded shadow z-50 text-xs">
                <button
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${chatSortOrder === 'asc' ? 'font-bold text-green-600' : ''}`}
                  onClick={() => { setChatSortOrder('asc'); setShowFilterDropdown(false); }}
                >A-Z</button>
                <button
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${chatSortOrder === 'desc' ? 'font-bold text-green-600' : ''}`}
                  onClick={() => { setChatSortOrder('desc'); setShowFilterDropdown(false); }}
                >Z-A</button>
              </div>
            )}
            <span
              className="absolute -top-1 -right-2 w-3 h-3 flex items-center justify-center rounded-full text-base cursor-pointer"
              style={{ background: '#5BA16F', color: 'white' }}
              onClick={() => {
                setShowFilterDropdown(false);
                setChatSortOrder('default');
                setChatSearch("");
              }}
            >×</span>
          </div>
        </div>
      </div>
      {/* Chat list: independently scrollable, fixed height below filter/search bar */}
      <div className="border-r border-gray-200 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
           style={{ height: 'calc(100vh - 48px - 48px)', overflowY: 'auto' }}>
        {chats.map((chat) => {
          const isGroup = GROUP_CHAT_IDS.includes(chat.id);
          const chatLabels = chatLabelsState[chat.id]?.labels || [];
          const chatNumbers = chatLabelsState[chat.id]?.numbers || [];
          const phone = CHAT_PHONES[chat.id] || "";
          // Blue double tick for these chats
          const blueTickIds = ["Yasin-3", "Skope-Demo", "demo-demo15"];
          const isBlueTick = blueTickIds.includes(chat.id);
          return (
            <div
              key={chat.id}
              className={`flex items-center gap-2 px-2 py-2 hover:bg-[#e9edef] cursor-pointer border-b border-gray-100 ${selectedChat === chat.id ? "bg-[#e9edef]" : ""}`}
              style={{ minHeight: 48 }}
              onClick={() => setSelectedChat(chat.id)}
            >
              {/* Avatar: show profile image if available, else fallback to initial */}
              {["Test Skope Final 5", "Test El Centro", "Testing group"].includes(chat.name) ? (
                <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: '#e3e6ea' }}>
                  <MdGroups size={22} className="text-white" />
                </div>
              ) : chat.name === "+91 9999999999" ? (
                <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: '#e3e6ea' }}>
                  <IoPerson size={18} className="text-white" />
                </div>
              ) : chat.avatarUrl ? (
                <Image
                  src={chat.avatarUrl}
                  alt={chat.name}
                  width={44}
                  height={44}
                  className="w-11 h-11 rounded-full object-cover bg-gray-200"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-base font-bold text-gray-500">
                  {chat.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0 flex flex-row items-stretch">
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="font-semibold text-xs text-gray-900 truncate">{chat.name}</div>
                  <div className="flex items-center gap-1">
                    {/* Double tick for non-group chats */}
                    {!isGroup && (
                      <BsCheckAll size={14} color={isBlueTick ? "#199455" : "#8BC34A"} className="inline-block mr-1" />
                    )}
                    <div className="text-xs text-gray-500 truncate">{chat.lastMessage}</div>
                  </div>
                  {/* Phone number below */}
                  {phone && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="flex items-center rounded-full bg-gray-100 px-2 py-0.5" style={{ minHeight: 10 }}>
                        <FaPhoneAlt size={8} className="text-gray-400 mr-1" />
                        <span className="text-[8px] text-gray-400 font-medium">{phone}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end justify-between min-w-[60px] ml-2">
                  <div className="flex flex-wrap gap-1 mb-0.5">
                    {/* Render labels */}
                    {chatLabels.map((label: string) => (
                      <span key={label} className={`px-1 py-0.5 rounded text-[10px] font-semibold ${label === 'Demo' ? 'bg-orange-100 text-orange-500' : label === 'internal' ? 'bg-green-100 text-green-600' : label === 'Signup' ? 'bg-green-100 text-green-600' : label === 'Content' ? 'bg-green-100 text-green-600' : label === 'Dont Send' ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-500'}`}>{label}</span>
                    ))}
                    {/* Add label button and input */}
                    <button
                      className="ml-1 text-green-600 text-xs"
                      onClick={e => {
                        e.stopPropagation();
                        setShowLabelInput((prev) => ({ ...prev, [chat.id]: true }));
                      }}
                      tabIndex={-1}
                      type="button"
                    >+
                    </button>
                    {showLabelInput[chat.id] && (
                      <form
                        ref={el => { labelInputRefs.current[chat.id] = el; }}
                        onSubmit={e => {
                          e.preventDefault();
                          if (labelInput[chat.id]?.trim()) {
                            setChatLabelsState((prev: Record<string, { labels: string[]; numbers?: string[] }>) => ({
                              ...prev,
                              [chat.id]: {
                                ...prev[chat.id],
                                labels: [...(prev[chat.id]?.labels || []), labelInput[chat.id].trim()]
                              }
                            }));
                            setLabelInput((prev: Record<string, string>) => ({ ...prev, [chat.id]: "" }));
                            setShowLabelInput((prev: Record<string, boolean>) => ({ ...prev, [chat.id]: false }));
                          }
                        }}
                        className="inline"
                      >
                        <input
                          className="border px-1 text-xs rounded w-16"
                          value={labelInput[chat.id] || ""}
                          onChange={e => setLabelInput((prev: Record<string, string>) => ({ ...prev, [chat.id]: e.target.value }))}
                          autoFocus
                          onClick={e => e.stopPropagation()}
                        />
                      </form>
                    )}
                    {/* Render numbers */}
                    {chatNumbers.map((num: string) => (
                      <span key={num} className="text-[10px] font-bold text-gray-500">{num}</span>
                    ))}
                  </div>
                  {chat.name === "Test El Centro" ? (
                    <Image src="/Logo2.svg" alt="Logo2" width={18} height={18} className="rounded-full" />
                  ) : (
                    <IoPersonCircle size={18} className="text-gray-200 mb-0.5" />
                  )}
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">{chat.lastMessageTime}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
} 