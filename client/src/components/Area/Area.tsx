import React, { useContext, useEffect, useRef, useState } from 'react';
import SendOutline from '../../assets/send.png';
import { SocketContext, SocketContextType } from '../../context/SocketProvider';

export default function Area() {
  const [message, setMessage] = useState<string>('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { socket, connected, user, messages, activeUsers } = useContext(
    SocketContext
  ) as SocketContextType;

  const sendMessage = async () => {
    if (message.trim() && connected) {
      socket.emit('sendMessage', message.trim(), () => setMessage(''));
    }
  };

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  useEffect(() => {
    inputRef?.current?.focus();
  }, [inputRef]);

  return (
    <main className="flex flex-1">
      <div className="sm:mx-auto mx-1 max-w-7xl sm:px-6 lg:px-8 flex flex-col justify-between flex-1">
        <div className="flex flex-col gap-1 py-6 whitespace-pre-line overflow-auto">
          {messages.length !== 0 && (
            <>
              <div className="flex gap-3 items-center">
                <div className="text-green-600 text-xs w-20 text-ellipsis overflow-hidden text-right">
                  *
                </div>
                <span className="leading-none">:</span>
                <pre className="flex text-xs flex-1 text-green-600">
                  Active Users
                  <span>: </span>
                  {activeUsers?.map((user: any, index: any) => (
                    <div key={index}>
                      <span>{user.name}</span>
                      {activeUsers.length - 1 !== index && <span>,</span>}
                    </div>
                  ))}
                </pre>
              </div>
              {messages?.map((messages: any, index: any) => (
                <div key={index} className="flex gap-3 items-start">
                  <div
                    className={`${
                      messages.user !== '*'
                        ? 'text-[#00ADB5]'
                        : 'text-green-600'
                    } text-xs w-20 text-ellipsis overflow-hidden text-right`}
                    data-te-toggle="tooltip"
                    data-te-placement="top"
                    data-te-ripple-init
                    data-te-ripple-color="light"
                    title={messages.user === user ? 'Me' : messages.user}
                  >
                    {messages.user === user ? 'Me' : messages.user}
                  </div>
                  <span className="leading-none">:</span>
                  <pre
                    className={`${
                      messages.user !== '*'
                        ? 'text-slate-400'
                        : 'text-green-600'
                    } text-xs flex-1 whitespace-pre-wrap`}
                  >
                    {messages.text}
                  </pre>
                </div>
              ))}
            </>
          )}
        </div>
        <div className="sticky bottom-0 left-0 right-0 bg-[#222831]">
          <div className="flex items-center justify-between gap-5">
            <textarea
              ref={inputRef}
              name="message"
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[70px] max-h-[70px] flex-1 p-2 rounded outline-none bg-[#393E46] text-sm"
              placeholder="Message"
              onKeyDown={handleKeyDown}
              value={message}
            />
            <img
              src={SendOutline}
              alt="send"
              width={25}
              height={25}
              className="cursor-pointer"
              onClick={sendMessage}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
