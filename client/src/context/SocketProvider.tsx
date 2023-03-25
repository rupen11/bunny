import { useLocation } from 'react-router-dom';
import {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { socket } from '../utils/socket';

export interface IMsg {
  user: string;
  text: string;
}

export interface IActiveUser {
  name: string;
  id: string;
}

export interface MessagePayload {
  user: string;
  text: string;
}

export type SocketContextType = {
  connected: boolean;
  setConnected: Dispatch<SetStateAction<boolean>>;
  user: string;
  messages: IMsg[];
  socket: any;
  activeUsers: IActiveUser[];
};

export const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children }: any) => {
  const [connected, setConnected] = useState<boolean>(false);
  const [user, setUser] = useState<string>('');
  const [messages, setMessages] = useState<IMsg[]>([]);
  const [activeUsers, setActiveUsers] = useState<IActiveUser[]>([]);
  const isSocketInitialize = useRef<boolean>(false);
  const location = useLocation();

  const socketInitialize = useCallback(async () => {
    isSocketInitialize.current = true;

    socket.on('connect', () => {
      const userName = prompt('Enter your name:');
      
      const roomName =
        location.search === '' ? 'General' : location.search.split('?')[1];

      if (roomName && userName) {
        setUser(userName);
        setConnected(true);

        socket.emit(
          'join',
          { name: userName, room: roomName },
          (error: string) => {
            if (error) {
              alert(error);
            }
          }
        );
      }
    });

    socket.on('message', (message: MessagePayload) => {
      setMessages((messages) => [...messages, message]);
    });

    socket.on('room', ({ users }: any) => {
      setActiveUsers(users);
    });
  }, [location.pathname]);

  useEffect(() => {
    if (!isSocketInitialize.current) socketInitialize();
  }, [socketInitialize]);

  return (
    <SocketContext.Provider
      value={{ activeUsers, connected, setConnected, user, messages, socket }}
    >
      {children}
    </SocketContext.Provider>
  );
};
