import { FiPaperclip } from "react-icons/fi";
import Image from 'next/image';

interface ChatMessagesProps {
  selectedChat: string | null;
  messages: Message[];
  userMap: Record<string, { name: string; phone_number: string }>;
  currentUserId: string | null;
  attachmentsMap: Record<string, Attachment[]>;
  TEST_EL_CENTRO_MESSAGES: TestElCentroMessage[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

interface Attachment {
  id?: string;
  file_name: string;
  file_type: string;
  file_url: string;
}

interface TestElCentroMessage {
  id: string;
  sender: string;
  phone: string;
  content: string;
  time: string;
  date: string;
  side: 'left' | 'right';
  email?: string;
}

export default function ChatMessages({
  selectedChat,
  messages,
  userMap,
  currentUserId,
  attachmentsMap,
  TEST_EL_CENTRO_MESSAGES,
  messagesEndRef
}: ChatMessagesProps) {
  if (selectedChat === 'Test-El-Centro') {
    let lastDate = '';
    return (
      <>
        {TEST_EL_CENTRO_MESSAGES.map((message) => {
          const showDate = message.date !== lastDate;
          lastDate = message.date;
          return (
            <div key={message.id + message.time}>
              {showDate && (
                <div className="text-center text-[10px] text-gray-400 font-semibold my-1">{message.date}</div>
              )}
              <div className={`flex ${message.side === 'right' ? 'justify-end' : 'justify-start'}`}> 
                <div className={`max-w-[60%] ${message.side === 'right' ? 'self-end' : 'self-start'}`}> 
                  <div className={`rounded-lg px-2 py-1 shadow text-gray-900 text-xs ${message.side === 'right' ? 'bg-green-100' : 'bg-white'}`}> 
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-green-600 text-[10px]">{message.sender}</span>
                      <span className="text-[10px] text-gray-400 font-semibold">{message.phone}</span>
                    </div>
                    <div className="flex items-end justify-between w-full gap-2">
                      <div className="break-words flex-1">{message.content || (attachmentsMap[message.id] && attachmentsMap[message.id].length > 0 ? <span className="italic text-gray-400">Sent an attachment</span> : null)}</div>
                      <span className="text-[10px] text-gray-400 ml-2 whitespace-nowrap flex-shrink-0">
                        {message.time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </>
    );
  }

  return (
    <>
      {messages.map((message) => {
        const senderName = userMap[message.sender_id]?.name || (message.sender_id === currentUserId ? "You" : "User");
        const senderPhone = userMap[message.sender_id]?.phone_number || "";
        return (
          <div
            key={message.id}
            className={`flex ${message.sender_id === currentUserId ? "justify-end" : "justify-start"} mb-2`}
          >
            <div className={`max-w-[60%] ${message.sender_id === currentUserId ? "self-end" : "self-start"}`}> 
              <div className={`rounded-lg px-3 py-2 shadow text-gray-900 text-sm ${message.sender_id === currentUserId ? "bg-green-100" : "bg-white"}`}
                   style={{ minWidth: 120, position: 'relative' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-green-600 text-xs">
                    {senderName}
                  </span>
                  {senderPhone && (
                    <span className="text-[10px] text-gray-400 font-semibold">{senderPhone}</span>
                  )}
                </div>
                <div className="flex items-end justify-between w-full gap-2">
                  <div className="break-words flex-1">{message.content || (attachmentsMap[message.id] && attachmentsMap[message.id].length > 0 ? <span className="italic text-gray-400">Sent an attachment</span> : null)}</div>
                  <span className="text-[10px] text-gray-400 ml-2 whitespace-nowrap flex-shrink-0">
                    {message.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                  </span>
                </div>
              </div>
              {attachmentsMap[message.id] && attachmentsMap[message.id].length > 0 && (
                <div className="mb-2">
                  {attachmentsMap[message.id].map(att => {
                    if (att.file_type && att.file_type.startsWith('image/')) {
                      return (
                        <Image
                          key={att.id}
                          src={att.file_url}
                          alt={att.file_name}
                          width={200}
                          height={200}
                          className="mb-1 max-w-xs rounded border"
                          style={{ maxHeight: 200, objectFit: 'contain' }}
                        />
                      );
                    } else if (att.file_type && att.file_type.startsWith('video/')) {
                      return (
                        <video key={att.id} controls width="250" className="mb-1">
                          <source src={att.file_url} type={att.file_type} />
                          Your browser does not support the video tag.
                        </video>
                      );
                    } else {
                      return (
                        <a
                          key={att.id}
                          href={att.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-1"
                        >
                          <FiPaperclip size={16} />
                          <span className="text-sm">{att.file_name}</span>
                        </a>
                      );
                    }
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </>
  );
} 