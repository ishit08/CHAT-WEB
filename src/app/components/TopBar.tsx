import { BsChatDotsFill } from "react-icons/bs";
import { TbRefreshDot } from "react-icons/tb";
import { IoMdHelpCircleOutline } from "react-icons/io";
import { HiChevronUpDown } from "react-icons/hi2";
import { MdInstallDesktop } from "react-icons/md";
import { BiSolidBellOff } from "react-icons/bi";
import { BsStars } from "react-icons/bs";
import { FiList } from "react-icons/fi";
import React from "react";

export default function TopBar() {
  return (
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
  );
} 