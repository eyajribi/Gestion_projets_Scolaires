# 🚀 **Guide de Test Rapide - Checklist**

## 📋 **Checklist de Test Rapide (5-10 min)**

### 🔐 **1. Connexion (2 min)**
- [ ] **Email** : `eyajribi8@gmail.com`
- [ ] **Mot de passe** : `azertyA1*`
- [ ] **Résultat** : Redirection vers dashboard
- [ ] **Message** : "Connexion réussie"

### 🏠 **2. Dashboard (1 min)**
- [ ] **Nom affiché** : "Bonjour, Yassine RIBI"
- [ ] **Email** : `eyajribi8@gmail.com`
- [ ] **3 cartes** : Projets, Tâches, Feedbacks
- [ ] **Navigation** : Cliquer sur "Projets"

### 📚 **3. Projets (2 min)**
- [ ] **Titre** : "Projets - Yassine"
- [ ] **Loading** : ProgressBar visible
- [ ] **Résultat** : Projets affichés OU message vide
- [ ] **Fallback** : Si erreur, données de test affichées

### ✅ **4. Tâches (2 min)**
- [ ] **Retour** au dashboard, cliquer sur "Tâches"
- [ ] **Titre** : "Tâches - Yassine"
- [ ] **Tâches** : 5 tâches de test avec statuts
- [ ] **Priorités** : HAUTE, MOYENNE, FAIBLE visibles

### 🔄 **5. Test d'Erreur (1 min)**
- [ ] **Mode avion** activer
- [ ] **Rafraîchir** une page
- [ ] **Résultat** : Fallback sur données de test
- [ ] **Message** : Erreur réseau gérée

### 📱 **6. Navigation (1 min)**
- [ ] **Bouton back** : Retour vers écran précédent
- [ ] **Menu hamburger** : Accès aux autres sections
- [ ] **Logout** : Retour vers login

---

## 🎯 **Critères de Succès**

### ✅ **Minimum Viable**
- [ ] Connexion réussie
- [ ] Dashboard affiché
- [ ] Projets/Tâches accessibles
- [ ] Pas de crash

### 🚀 **Optimal**
- [ ] Données backend chargées
- [ ] Fallback fonctionnel
- [ ] Navigation fluide
- [ ] Gestion erreurs

---

## 📊 **Rapport de Test**

### 📝 **À Remplir**
```
Date : ________________
Heure : ________________
Testeur : ____________

Connexion : ✅ / ❌
Dashboard : ✅ / ❌
Projets : ✅ / ❌
Tâches : ✅ / ❌
Navigation : ✅ / ❌
Erreurs : ✅ / ❌

Notes : ________________________________
_____________________________________
```

### 🎯 **Décision**
- [ ] **VALIDÉ** : Application prête pour production
- [ ] **À CORRIGER** : Problèmes identifiés
- [ ] **EN ATTENTE** : Tests supplémentaires nécessaires

---

## 🚨 **Problèmes Connus**

### ⚠️ **Non Bloquants**
- Upload photo (partiel)
- Réponse feedbacks (à finaliser)

### ❌ **Bloquants**
- Crash au démarrage
- Connexion impossible
- Données non affichées

---

## 📞 **Support**

En cas de problème :
1. **Vérifier les logs** Android Studio
2. **Consulter** `ENDPOINTS_BACKEND.md`
3. **Vérifier** le backend démarré
4. **Tester** avec les données de test

**Bon test !** 🚀📱✨
