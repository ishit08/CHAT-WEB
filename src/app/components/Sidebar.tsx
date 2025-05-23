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
import Image from "next/image";

export default function Sidebar() {
  return (
    <nav className="h-screen w-14 bg-[#f7f7f7] border-r border-gray-200 flex flex-col items-center pt-2 pb-2 select-none">
      {/* Logo */}
      <div className="relative flex items-center justify-center mb-4" style={{height: 48}}>
        <Image src="/Logo4.svg" alt="Logo" width={40} height={40} className="w-10 h-10 rounded-full object-contain bg-white" />
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
  );
} 