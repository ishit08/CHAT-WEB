import { FiX, FiPaperclip, FiClock } from "react-icons/fi";
import { FaRegSmile, FaMicrophone } from "react-icons/fa";
import { AiOutlineHistory } from "react-icons/ai";
import { HiOutlineSparkles } from "react-icons/hi";
import { RiBarChartBoxFill } from "react-icons/ri";
import { IoSend } from "react-icons/io5";
import Image from "next/image";
import { HiChevronUpDown } from "react-icons/hi2";
import React from "react";

export default function ChatInput({
  newMessage,
  setNewMessage,
  handleSendMessage,
  attachment,
  setAttachment,
  fileInputRef,
  handleFileSelect,
  uploading
}: {
  newMessage: string;
  setNewMessage: (v: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  attachment: File | null;
  setAttachment: (f: File | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
}) {
  return (
    <form onSubmit={handleSendMessage} className="flex flex-col gap-0 px-0 pt-4 pb-4 bg-white border-t border-gray-200">
      <div className="flex items-center w-full px-7 mb-4 relative">
        {attachment && (
          <div className="absolute bottom-full left-7 mb-2 bg-gray-100 rounded-lg p-2 flex items-center gap-2">
            <span className="text-sm text-gray-600">{attachment.name}</span>
            <button
              type="button"
              onClick={() => setAttachment(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FiX size={16} />
            </button>
          </div>
        )}
        <input
          className="flex-1 bg-transparent pt-0 pb-2 outline-none text-gray-800 border-none text-base font-bold leading-tight placeholder:font-bold placeholder:text-gray-400 placeholder:leading-tight"
          placeholder="Message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={uploading}
        />
        <div className="flex flex-col items-center ml-2">
          <button type="submit" className="p-0 m-0 bg-transparent rounded-none shadow-none flex items-center justify-center" disabled={uploading}>
            <IoSend size={28} color="#199455" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-6 mt-0 px-7">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,video/*,.pdf,.txt"
        />
        <button 
          type="button" 
          className="text-[#434B57] hover:text-green-600 focus:outline-none"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <FiPaperclip size={22} />
        </button>
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
  );
} 