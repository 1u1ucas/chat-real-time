export function getTimeElapsed(dateString: string): string {
  try {
    // Créer un objet Date à partir de la chaîne ISO
    const date = new Date(dateString);
    
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      console.error('Date invalide:', dateString);
      return 'Date inconnue';
    }

    // Ajouter une heure à la date pour compenser le décalage
    const adjustedDate = new Date(date.getTime() + 3600000); // 3600000 ms = 1 heure
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - adjustedDate.getTime()) / 1000);

    console.log('Calcul du temps écoulé:');
    console.log('Date du message (originale):', date);
    console.log('Date du message (ajustée):', adjustedDate);
    console.log('Date actuelle:', now);
    console.log('Différence en secondes:', diffInSeconds);

    // Calculer la différence en minutes
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    console.log('Différence en minutes:', diffInMinutes);
    console.log('Différence en heures:', diffInHours);
    console.log('Différence en jours:', diffInDays);

    if (diffInMinutes < 1) {
      console.log('Retourne "à l\'instant"');
      return 'à l\'instant';
    } else if (diffInMinutes < 60) {
      console.log('Retourne "il y a X minutes"');
      return `il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    } else if (diffInHours < 24) {
      console.log('Retourne "il y a X heures"');
      return `il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    } else if (diffInDays < 7) {
      console.log('Retourne "il y a X jours"');
      return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    } else {
      console.log('Retourne la date complète');
      return adjustedDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  } catch (error) {
    console.error('Erreur lors du traitement de la date:', dateString, error);
    return 'Date invalide';
  }
} 