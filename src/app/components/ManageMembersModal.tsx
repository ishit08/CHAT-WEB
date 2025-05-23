import { FiX } from "react-icons/fi";
import React from "react";

type User = {
  id: string;
  name: string;
  email: string;
  phone_number?: string;
};

type Chat = {
  id: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: string;
  avatarUrl?: string;
};

interface ManageMembersModalProps {
  show: boolean;
  onClose: () => void;
  allPossibleMembers: (User & { isDemo: boolean })[];
  chatMembers: string[];
  setChatMembers: (v: string[]) => void;
  selectedChat: string | null;
  currentUserId: string | null;
  fetchChats: (userId: string) => Promise<void>;
  setChatMemberNames: (names: string[]) => void;
  supabase: any;
  DEMO_CONTACTS: Chat[];
}

export default function ManageMembersModal({
  show,
  onClose,
  allPossibleMembers,
  chatMembers,
  setChatMembers,
  selectedChat,
  currentUserId,
  fetchChats,
  setChatMemberNames,
  supabase,
  DEMO_CONTACTS
}: ManageMembersModalProps) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[400px] max-h-[600px] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Manage Members</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><FiX size={20} /></button>
        </div>
        <form
          className="flex-1 overflow-y-auto p-0 flex flex-col"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!selectedChat) return;
            if (!selectedChat.startsWith('demo-') && !DEMO_CONTACTS.some(chat => chat.id === selectedChat)) {
              const { data: current } = await supabase
                .from("chat_members")
                .select("user_id")
                .eq("chat_id", selectedChat);
              const currentMembers = (current || []).map((m: { user_id: string }) => m.user_id);
              const toAdd = chatMembers.filter(id => !currentMembers.includes(id));
              if (toAdd.length > 0) {
                await supabase.from("chat_members").insert(toAdd.map(id => ({ chat_id: selectedChat, user_id: id })));
              }
              const toRemove = currentMembers.filter(id => !chatMembers.includes(id));
              if (toRemove.length > 0) {
                await supabase.from("chat_members").delete().eq("chat_id", selectedChat).in("user_id", toRemove);
              }
              // Refetch member names for header
              const { data: members, error: err2 } = await supabase
                .from("chat_members")
                .select("user_id, users:user_id(name)")
                .eq("chat_id", selectedChat);
              if (!err2 && members) {
                const names = members.map((m: any) => Array.isArray(m.users) ? m.users[0]?.name : m.users?.name).filter(Boolean);
                setChatMemberNames(names);
              } else {
                setChatMemberNames([]);
              }
              // Refresh chat list
              if (currentUserId) {
                await fetchChats(currentUserId);
              }
            }
            onClose();
          }}
        >
          <div className="p-4 flex flex-col gap-2">
            {allPossibleMembers.map(user => (
              <label
                key={user.id}
                className="flex items-start gap-3 cursor-pointer py-2 px-2 rounded hover:bg-gray-50 transition-all"
                style={{ alignItems: 'flex-start' }}
              >
                <input
                  type="checkbox"
                  checked={chatMembers.includes(user.id)}
                  onChange={e => {
                    setChatMembers(prev => e.target.checked ? [...prev, user.id] : prev.filter(id => id !== user.id));
                  }}
                  className="w-5 h-5 mt-1 accent-green-600"
                />
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-sm truncate">{user.name}</span>
                    {user.isDemo && <span className="ml-1 text-[10px] text-orange-400 bg-orange-50 px-1 py-0.5 rounded">Demo</span>}
                  </div>
                  <span className="text-xs text-gray-400 truncate">{user.email}</span>
                </div>
              </label>
            ))}
          </div>
          <div className="border-t border-gray-200 mt-2" />
          <button type="submit" className="m-4 px-3 py-2 bg-green-600 text-white rounded text-base font-semibold">Save</button>
        </form>
      </div>
    </div>
  );
} 