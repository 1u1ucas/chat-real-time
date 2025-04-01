import { formatDistanceToNow, parseISO, addHours } from 'date-fns';
import { fr } from 'date-fns/locale';

export const getTimeElapsed = (date: string | Date): string => {
  const messageDate = typeof date === 'string' ? parseISO(date) : date;
  // Ajustement pour le fuseau horaire français (UTC+2)
  const adjustedDate = addHours(messageDate, 2);
  
  return formatDistanceToNow(adjustedDate, { 
    addSuffix: true,
    locale: fr 
  });
};