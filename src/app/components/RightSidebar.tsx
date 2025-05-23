import { TbSquareChevronLeft } from "react-icons/tb";
import { LuRefreshCw, LuPencilLine } from "react-icons/lu";
import { VscListSelection } from "react-icons/vsc";
import { RiListCheck2, RiListSettingsLine } from "react-icons/ri";
import { DiHtml5Connectivity } from "react-icons/di";
import { MdGroups } from "react-icons/md";
import { FaAt } from "react-icons/fa6";
import { RiFolderImageFill } from "react-icons/ri";
import React from "react";

export default function RightSidebar() {
  return (
    <aside className="w-14 bg-white border-l border-gray-200 flex flex-col items-center py-4 gap-2">
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
        <MdGroups size={18} />
      </button>
      <button className="w-10 h-10 flex items-center justify-center text-[#A0A4AB] hover:text-green-500 transition-colors duration-150">
        <FaAt size={18} />
      </button>
      <button className="w-10 h-10 flex items-center justify-center text-[#A0A4AB] hover:text-green-500 transition-colors duration-150">
        <RiFolderImageFill size={18} />
      </button>
      <button className="w-10 h-10 flex items-center justify-center text-[#A0A4AB] hover:text-green-500 transition-colors duration-150">
        <RiListSettingsLine size={18} />
      </button>
    </aside>
  );
} 