import { MdGroups } from "react-icons/md";
import { IoPerson } from "react-icons/io5";
import { HiSparkles } from "react-icons/hi";
import { FiSearch } from "react-icons/fi";
import { IoPersonCircleSharp } from "react-icons/io5";
import Image from "next/image";

type Chat = {
  id: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: string;
  avatarUrl?: string;
};

interface ChatHeaderProps {
  selectedChat: string | null;
  chats: Chat[];
  chatMemberNames: string[];
  GROUP_CHAT_IDS: string[];
  setShowManageMembersModal: (v: boolean) => void;
}

export default function ChatHeader({
  selectedChat,
  chats,
  chatMemberNames,
  GROUP_CHAT_IDS,
  setShowManageMembersModal
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-1">
        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: (selectedChat && chats.find(c => c.id === selectedChat)?.name === "Test El Centro") ? '#e3e6ea' : '#f1f4f6' }}>
          {selectedChat && chats.find(c => c.id === selectedChat)?.name === "Test El Centro" ? (
            <MdGroups size={16} className="text-white" />
          ) : selectedChat && chats.find(c => c.id === selectedChat)?.name === "+91 9999999999" ? (
            <IoPerson size={20} className="text-white" />
          ) : (
            <span className="text-sm font-bold text-gray-500">
              {selectedChat ? chats.find(c => c.id === selectedChat)?.name.charAt(0) : "?"}
            </span>
          )}
        </div>
        <div>
          <div className="font-semibold text-sm text-gray-900 leading-tight">
            {selectedChat ? chats.find(c => c.id === selectedChat)?.name : "Select a chat"}
          </div>
          <div className="text-xs text-gray-500 leading-none">
            {chatMemberNames.length > 2
              ? chatMemberNames.join(", ")
              : (selectedChat === "Test-El-Centro"
                  ? "Roshnag Airtel, Roshnag Jio, Bharat Kumar Ramesh, Periskope"
                  : "Online")}
          </div>
        </div>
      </div>
      <div className="flex gap-2 items-center">
        {selectedChat && GROUP_CHAT_IDS.includes(selectedChat) && (
          <div className="flex items-center -space-x-3 mr-2">
            {[0,1,2,3,4].map((i) => (
              i === 4 ? (
                <div className="relative" key={i}>
                  <Image src="/Logo2.svg" alt="Logo2" width={28} height={28} className="rounded-full border-2 border-white" />
                  <span className="absolute bottom-1 right-1 w-2 h-2 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
              ) : (
                <IoPersonCircleSharp key={i} size={28} className="text-gray-300 bg-white rounded-full border-2 border-white" style={{ zIndex: 10 - i }} />
              )
            ))}
            <span className="ml-2 text-xs font-semibold bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 border border-white" style={{zIndex: 0}}>+3</span>
          </div>
        )}
        <button className="text-gray-400 hover:text-green-500"><HiSparkles size={20} /></button>
        <button className="text-gray-400 hover:text-green-500"><FiSearch size={16} /></button>
        <button
          className="ml-2 px-2 py-1 border border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-100"
          onClick={() => setShowManageMembersModal(true)}
        >
          Manage Members
        </button>
      </div>
    </div>
  );
} 