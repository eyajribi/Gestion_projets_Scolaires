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
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 100,
      zIndex: 1000,
      pointerEvents: 'none',
    }}>
      <button
        onClick={handleClick}
        disabled={isSubscribed}
        className={`push-notif-btn${isSubscribed ? ' subscribed' : ''}`}
        style={{
          padding: '8px 16px',
          borderRadius: '50px',
          border: 'none',
          background: isSubscribed ? '#4caf50' : '#1976d2',
          color: '#fff',
          fontWeight: 'bold',
          boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
          cursor: isSubscribed ? 'not-allowed' : 'pointer',
          fontSize: '0.95rem',
          outline: 'none',
          margin: 0,
          minWidth: '44px',
          minHeight: '44px',
          pointerEvents: 'auto',
        }}
        title={isSubscribed ? 'Vous êtes déjà abonné' : 'Recevez les notifications push'}
        aria-label="Activer les notifications push"
      >
        {isSubscribed ? (
          <svg width="20" height="20" fill="#fff" viewBox="0 0 24 24" style={{ verticalAlign: 'middle' }}><path d="M9 21h6v-1H9v1zm9-5V9c0-3.07-1.63-5.64-4.5-6.32V2a1.5 1.5 0 0 0-3 0v.68C7.63 3.36 6 5.92 6 9v7l-1.29 1.29A1 1 0 0 0 6 19h12a1 1 0 0 0 .71-1.71L18 16z"/></svg>
        ) : (
          <svg width="20" height="20" fill="#fff" viewBox="0 0 24 24" style={{ verticalAlign: 'middle' }}><path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zm6-6V9a6 6 0 0 0-12 0v7l-2 2v1h16v-1l-2-2z"/></svg>
        )}
      </button>
    </div>
  );
};

export default PushNotificationButton;
