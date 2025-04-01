import { useEffect, useState, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { getTimeElapsed } from '../../utils/timeUtils';
import { parseISO } from 'date-fns';

interface ConnectedUsersProps {
  socket: Socket | null;
}

interface User {
  id: string;
  email: string;
  isOnline: boolean;
  socketId: string;
  lastSeen?: string;
}

const ConnectedUsers = ({ socket }: ConnectedUsersProps) => {
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
  const [timeElapsed, setTimeElapsed] = useState<{ [key: string]: string }>({});
  const userMapRef = useRef(new Map<string, User>());

  // Fonction pour trier les utilisateurs
  const sortUsers = (users: User[]) => {
    const now = new Date();
    
    return users.sort((a, b) => {
      // Séparer les utilisateurs en ligne et hors ligne
      if (a.isOnline !== b.isOnline) {
        return a.isOnline ? -1 : 1;
      }
      
      if (a.isOnline && b.isOnline) {
        // Pour les utilisateurs en ligne, trier par temps en ligne (du plus long au plus court)
        const aTime = a.lastSeen ? parseISO(a.lastSeen) : now;
        const bTime = b.lastSeen ? parseISO(b.lastSeen) : now;
        return aTime.getTime() - bTime.getTime();
      } else {
        // Pour les utilisateurs hors ligne, trier par dernière activité (du plus récent au plus ancien)
        const aTime = a.lastSeen ? parseISO(a.lastSeen) : new Date(0);
        const bTime = b.lastSeen ? parseISO(b.lastSeen) : new Date(0);
        return bTime.getTime() - aTime.getTime();
      }
    });
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('userList', (users: User[]) => {
      const userMap = userMapRef.current;
      
      users.forEach((user) => {
        if (user.isOnline) {
          userMap.set(user.email, user);
        } else {
          const existingUser = userMap.get(user.email);
          if (existingUser) {
            userMap.set(user.email, {
              ...existingUser,
              isOnline: false,
              lastSeen: user.lastSeen || existingUser.lastSeen
            });
          } else {
            userMap.set(user.email, user);
          }
        }
      });
      
      const uniqueUsers = Array.from(userMap.values());
      const sortedUsers = sortUsers(uniqueUsers);
      setConnectedUsers(sortedUsers);
    });

    socket.on('userDisconnected', (user: User) => {
      const userMap = userMapRef.current;
      const existingUser = userMap.get(user.email);
      
      if (existingUser) {
        userMap.set(user.email, {
          ...existingUser,
          isOnline: false,
          lastSeen: user.lastSeen || existingUser.lastSeen
        });
        
        const uniqueUsers = Array.from(userMap.values());
        const sortedUsers = sortUsers(uniqueUsers);
        setConnectedUsers(sortedUsers);
      }
    });

    socket.emit('getUserList');

    return () => {
      socket.off('userList');
      socket.off('userDisconnected');
    };
  }, [socket]);

  // Mise à jour du temps écoulé toutes les minutes
  useEffect(() => {
    const updateTimeElapsed = () => {
      const newTimeElapsed: { [key: string]: string } = {};
      connectedUsers.forEach((user) => {
        if (!user.isOnline && user.lastSeen) {
          // Parser la date ISO string en objet Date
          const lastSeenDate = parseISO(user.lastSeen);
          newTimeElapsed[user.email] = getTimeElapsed(lastSeenDate);
        }
      });
      setTimeElapsed(newTimeElapsed);
    };

    updateTimeElapsed();
    const interval = setInterval(updateTimeElapsed, 60000);

    return () => clearInterval(interval);
  }, [connectedUsers]);

  return (
    <div className="bg-white/30 backdrop-blur-sm rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-2">Utilisateurs connectés</h3>
      <ul className="space-y-1">
        {connectedUsers.map((user) => (
          <li key={user.socketId} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{user.email}</span>
            </div>
            {!user.isOnline && user.lastSeen && (
              <span className="text-sm text-gray-500">
                {timeElapsed[user.email]}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConnectedUsers; 