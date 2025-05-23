import { FiX } from "react-icons/fi";
import React from "react";

type User = {
  id: string;
  name: string;
  email: string;
  phone_number?: string;
};

interface NewChatModalProps {
  show: boolean;
  onClose: () => void;
  users: User[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  createNewChat: (userId: string) => void;
}

export default function NewChatModal({
  show,
  onClose,
  users,
  searchQuery,
  setSearchQuery,
  createNewChat
}: NewChatModalProps) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[400px] max-h-[600px] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">New Chat</h2>
          <button 
            onClick={onClose}
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
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-semibold text-gray-500 uppercase">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                  {user.phone_number && (
                    <div className="text-xs text-gray-400">{user.phone_number}</div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
} 