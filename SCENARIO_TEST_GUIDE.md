# 🎯 **Scénario de Test - Instructions Étape par Étape**

## 📱 **Test 1 : Connexion et Dashboard (3 minutes)**

### Étape 1.1 : Démarrage
1. **Ouvrir l'application** sur l'émulateur
2. **Vérifier** : Page de connexion s'affiche
3. **Champs** : Email et mot de passe visibles

### Étape 1.2 : Connexion Réussie
1. **Saisir** :
   - Email : `eyajribi8@gmail.com`
   - Mot de passe : `azertyA1*`
2. **Cliquer** sur "Se connecter"
3. **Attendre** le chargement
4. **Vérifier** :
   - ✅ Redirection vers dashboard
   - ✅ Message "Connexion réussie"
   - ✅ Nom "Yassine RIBI" affiché

---

## 📚 **Test 2 : Projets (2 minutes)**

### Étape 2.1 : Accès aux Projets
1. **Depuis dashboard**, cliquer sur "Voir tous les projets"
2. **Vérifier** :
   - ✅ Redirection vers ProjectsActivity
   - ✅ Titre "Projets - Yassine"
   - ✅ Loading visible

### Étape 2.2 : Chargement des Projets
1. **Attendre** la fin du chargement
2. **Deux cas possibles** :
   - **Backend OK** : Projets réels affichés
   - **Backend KO** : 3 projets de test affichés
3. **Vérifier** :
   - ✅ Pas de crash
   - ✅ Données affichées
   - ✅ Message informatif si vide

---

## ✅ **Test 3 : Tâches (2 minutes)**

### Étape 3.1 : Accès aux Tâches
1. **Retour** au dashboard (bouton back)
2. **Cliquer** sur "Voir toutes les tâches"
3. **Vérifier** :
   - ✅ Redirection vers TasksActivity
   - ✅ Titre "Tâches - Yassine"
   - ✅ Loading visible

### Étape 3.2 : Chargement des Tâches
1. **Attendre** la fin du chargement
2. **Vérifier** :
   - ✅ 5 tâches affichées (test)
   - ✅ Statuts : TERMINEE, EN_COURS, A_FAIRE
   - ✅ Priorités : HAUTE, MOYENNE, FAIBLE
   - ✅ Pas de crash

---

## 🔄 **Test 4 : Gestion d'Erreur (1 minute)**

### Étape 4.1 : Simulation d'Erreur
1. **Activer** le mode avion
2. **Rafraîchir** une page (swipe down)
3. **Vérifier** :
   - ✅ Message d'erreur réseau
   - ✅ Fallback sur données de test
   - ✅ Application reste utilisable

### Étape 4.2 : Retour à la normale
1. **Désactiver** le mode avion
2. **Rafraîchir** à nouveau
3. **Vérifier** :
   - ✅ Tentative de reconnexion
   - ✅ Données mises à jour si possible

---

## 👤 **Test 5 : Profil (2 minutes)**

### Étape 5.1 : Accès au Profil
1. **Depuis dashboard**, cliquer sur l'icône profil
2. **Vérifier** :
   - ✅ ProfileActivity s'ouvre
   - ✅ Champs pré-remplis
   - ✅ Informations correctes

### Étape 5.2 : Modification du Profil
1. **Modifier** le champ téléphone
2. **Cliquer** sur "Sauvegarder"
3. **Vérifier** :
   - ✅ Message "Profil mis à jour"
   - ✅ Données sauvegardées
   - ✅ Pas de crash

---

## 📦 **Test 6 : Navigation Finale (1 minute)**

### Étape 6.1 : Test de Navigation
1. **Utiliser** le bouton back systématiquement
2. **Vérifier** :
   - ✅ Retour vers écran précédent
   - ✅ Pas de perte de données
   - ✅ Navigation fluide

### Étape 6.2 : Déconnexion
1. **Cliquer** sur menu (3 points)
2. **Choisir** "Déconnexion"
3. **Vérifier** :
   - ✅ Retour vers login
   - ✅ Token effacé
   - ✅ Possibilité de se reconnecter

---

## 📊 **Grille d'Évaluation**

| Test | ✅ Succès | ❌ Échec | ⚠️ Partiel | Notes |
|------|-----------|-----------|-------------|-------|
| **Connexion** | | | | |
| **Dashboard** | | | | |
| **Projets** | | | | |
| **Tâches** | | | | |
| **Gestion Erreur** | | | | |
| **Profil** | | | | |
| **Navigation** | | | | |

### 🎯 **Score Final**
- **7/7 ✅** : **EXCELLENT** - Prêt pour production
- **5-6/7 ✅** : **BON** - Mineures à corriger
- **3-4/7 ✅** : **MOYEN** : Corrections nécessaires
- **0-2/7 ✅** : **CRITIQUE** : Refonte requise

---

## 🚨 **Points de Vigilance**

### ❌ **Critiques**
- Crash au démarrage
- Connexion impossible
- Données non affichées

### ⚠️ **Importants**
- Navigation cassée
- Erreurs non gérées
- Performance dégradée

### 💡 **Améliorations**
- Messages d'erreur plus clairs
- Loading plus rapide
- Interface plus fluide

---

## 📝 **Compte-Rendu Type**

```
📅 Date : 07/01/2026
👤 Testeur : [Votre Nom]
📱 Appareil : Émulateur Android 12

✅ Connexion : OK - Redirection réussie
✅ Dashboard : OK - Informations affichées
✅ Projets : OK - 3 projets de test (backend KO)
✅ Tâches : OK - 5 tâches avec statuts
⚠️ Erreur : OK - Fallback fonctionnel
✅ Profil : OK - Modification sauvegardée
✅ Navigation : OK - Retour fluide

🎯 Score : 6/7 - BON
📝 Notes : Backend non démarré, fallback bien géré
🚀 Décision : Prêt pour tests avec backend réel
```

**Ce scénario garantit une validation complète en 10-15 minutes !** 🚀📱✨
