import { formatDistanceToNow, parseISO, addHours } from 'date-fns';
import { fr } from 'date-fns/locale';

export const getTimeElapsed = (date: string | Date, isMessage: boolean = false): string => {
  const messageDate = typeof date === 'string' ? parseISO(date) : date;
  
  // Ajuster uniquement pour les messages (qui sont en UTC)
  const adjustedDate = isMessage ? addHours(messageDate, 2) : messageDate;
  
  return formatDistanceToNow(adjustedDate, { 
    addSuffix: true,
    locale: fr 
  });
};