// Backend Express pour notifications push web
const express = require('express');
const bodyParser = require('body-parser');
const webpush = require('web-push');

const app = express();
app.use(bodyParser.json());

// Remplace par tes propres clés VAPID générées
const VAPID_PUBLIC_KEY = 'TA_CLE_PUBLIQUE';
const VAPID_PRIVATE_KEY = 'TA_CLE_PRIVEE';

webpush.setVapidDetails(
  'mailto:contact@tondomaine.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

let subscriptions = [];

// Route pour enregistrer l’abonnement push
app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({ message: 'Abonnement enregistré !' });
});

// Route pour envoyer une notification à tous les abonnés
app.post('/notify', async (req, res) => {
  const { title, body } = req.body;
  const payload = JSON.stringify({ title, body });
  const results = [];
  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(sub, payload);
      results.push({ success: true });
    } catch (err) {
      results.push({ success: false, error: err });
    }
  }
  res.json(results);
});

app.listen(4000, () => {
  console.log('Serveur push notifications sur http://localhost:4000');
});
