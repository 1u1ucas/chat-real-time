import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!socket) return;

    // Écouter les mises à jour des utilisateurs connectés
    socket.on('userList', (users: User[]) => {
      // Filtrer pour n'avoir qu'un seul utilisateur par email
      const uniqueUsers = users.reduce((acc, current) => {
        const existingUser = acc.find(user => user.email === current.email);
        if (!existingUser) {
          acc.push(current);
        }
        return acc;
      }, [] as User[]);
      
      setConnectedUsers(uniqueUsers);
    });

    // Demander la liste initiale des utilisateurs
    socket.emit('getUserList');

    return () => {
      socket.off('userList');
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
                {timeElapsed[user.email] || getTimeElapsed(parseISO(user.lastSeen), false)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConnectedUsers; 