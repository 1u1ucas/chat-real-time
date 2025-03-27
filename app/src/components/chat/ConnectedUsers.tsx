import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';

interface ConnectedUsersProps {
  socket: Socket | null;
}

interface User {
  id: string;
  email: string;
}

const ConnectedUsers = ({ socket }: ConnectedUsersProps) => {
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!socket) return;

    // Écouter les mises à jour des utilisateurs connectés
    socket.on('userList', (users: User[]) => {
      setConnectedUsers(users);
    });

    // Demander la liste initiale des utilisateurs
    socket.emit('getUserList');

    return () => {
      socket.off('userList');
    };
  }, [socket]);

  return (
    <div className="bg-white/30 backdrop-blur-sm rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-2">Utilisateurs connectés</h3>
      <ul className="space-y-1">
        {connectedUsers.map((user) => (
          <li key={user.id} className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>{user.email}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConnectedUsers; 