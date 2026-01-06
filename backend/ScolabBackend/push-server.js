const express = require('express');
const webpush = require('web-push');
const bodyParser = require('body-parser');

const app = express();
const PORT = 4000;

app.use(bodyParser.json());

// Remplacez ces clés par celles générées avec vapid-keygen.js
const vapidKeys = {
  publicKey: 'BLFOJjblXG8oWrrXHWM5y_WHFDHq0u9hCHJ4vgFV5B9UM2ANrBAQZMO7X09J7jQaeuIWrpNiN94p4d7o4yLXjBs',
  privateKey: 'q3zWNi38iJ5VkKlQQzPBvekR1uA6Exv1GWDZ-55vDwg'
};

webpush.setVapidDetails(
  'mailto:admin@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Stockage en mémoire des abonnements
const subscriptions = [];

// Route pour recevoir les abonnements push
app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({ message: 'Abonnement enregistré.' });
});

// Route pour envoyer une notification à tous les abonnés
app.post('/notify', async (req, res) => {
  const { title, body } = req.body;
  const payload = JSON.stringify({ title, body });
  let success = 0;
  let failed = 0;

  await Promise.all(subscriptions.map(async (sub) => {
    try {
      await webpush.sendNotification(sub, payload);
      success++;
    } catch (err) {
      failed++;
    }
  }));

  res.json({ message: `Notifications envoyées. Succès: ${success}, Échecs: ${failed}` });
});

app.listen(PORT, () => {
  console.log(`Serveur push démarré sur http://localhost:${PORT}`);
});
