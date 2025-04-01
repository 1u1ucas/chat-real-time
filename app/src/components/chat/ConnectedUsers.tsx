import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';

interface ConnectedUsersProps {
  socket: Socket | null;
}

interface User {
  id: string;
  email: string;
  isOnline: boolean;
  socketId: string;
}

const ConnectedUsers = ({ socket }: ConnectedUsersProps) => {
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);

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

    // Écouter la déconnexion des utilisateurs
    socket.on('userDisconnected', (userEmail: string) => {
      setConnectedUsers(prevUsers => 
        prevUsers.map(user => 
          user.email === userEmail 
            ? { ...user, isOnline: false }
            : user
        )
      );
    });

    // Demander la liste initiale des utilisateurs
    socket.emit('getUserList');

    return () => {
      socket.off('userList');
      socket.off('userDisconnected');
    };
  }, [socket]);

  return (
    <div className="bg-white/30 backdrop-blur-sm rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-2">Utilisateurs connectés</h3>
      <ul className="space-y-1">
        {connectedUsers.map((user) => (
          <li key={user.socketId} className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{user.email}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConnectedUsers; 