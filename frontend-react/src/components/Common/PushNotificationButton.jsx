import React, { useState } from 'react';

const PushNotificationButton = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState(Notification.permission);

  const subscribeUser = async () => {
    if (!('serviceWorker' in navigator)) return alert('Service Worker non supporté');
    if (!('PushManager' in window)) return alert('Push API non supportée');

    const registration = await navigator.serviceWorker.ready;
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: '<VAPID_PUBLIC_KEY>' // Remplacer par ta clé VAPID publique
      });
      setIsSubscribed(true);
      alert('Abonné aux notifications push !');
        // Envoyer l'abonnement au backend
        await fetch('http://localhost:4000/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(subscription)
        });
    } catch (err) {
      alert('Erreur abonnement push: ' + err);
    }
  };

  const handleClick = async () => {
    if (permission === 'default') {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') subscribeUser();
    } else if (permission === 'granted') {
      subscribeUser();
    } else {
      alert('Permission refusée pour les notifications.');
    }
  };

  return (
    <button onClick={handleClick} disabled={isSubscribed}>
      {isSubscribed ? 'Abonné aux notifications' : 'Activer les notifications push'}
    </button>
  );
};

export default PushNotificationButton;
