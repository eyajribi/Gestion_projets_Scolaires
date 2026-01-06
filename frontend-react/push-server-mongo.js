// Backend Express avec MongoDB pour notifications push web
const express = require('express');
const bodyParser = require('body-parser');
const webpush = require('web-push');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.json());

// Connexion MongoDB
mongoose.connect('mongodb://localhost:27017/pushdb', { useNewUrlParser: true, useUnifiedTopology: true });

const subscriptionSchema = new mongoose.Schema({ endpoint: String, keys: Object });
const Subscription = mongoose.model('Subscription', subscriptionSchema);

// Clés VAPID
const VAPID_PUBLIC_KEY = 'BLFOJjblXG8oWrrXHWM5y_WHFDHq0u9hCHJ4vgFV5B9UM2ANrBAQZMO7X09J7jQaeuIWrpNiN94p4d7o4yLXjBs';
const VAPID_PRIVATE_KEY = 'q3zWNi38iJ5VkKlQQzPBvekR1uA6Exv1GWDZ-55vDwg';

webpush.setVapidDetails(
  'mailto:contact@tondomaine.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Route pour enregistrer l’abonnement push
app.post('/subscribe', async (req, res) => {
  const subscription = req.body;
  const exists = await Subscription.findOne({ endpoint: subscription.endpoint });
  if (!exists) {
    await Subscription.create(subscription);
  }
  res.status(201).json({ message: 'Abonnement enregistré !' });
});

// Route pour envoyer une notification à tous les abonnés
app.post('/notify', async (req, res) => {
  const { title, body } = req.body;
  const payload = JSON.stringify({ title, body });
  const subscriptions = await Subscription.find();
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
