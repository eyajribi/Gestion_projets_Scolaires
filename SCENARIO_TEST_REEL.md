# 🧪 **Scénario de Test Complet - Projet Scolab**

## 🎯 **Objectif**
Valider le fonctionnement complet de l'application Android avec le backend Spring Boot dans un environnement réel.

## 📋 **Prérequis**

### 🔧 **Configuration Backend**
```bash
# 1. Démarrer le backend Spring Boot
cd backend/
./mvnw spring-boot:run

# 2. Vérifier que le backend est accessible
curl http://localhost:8080/api/etudiants/projets
```

### 📱 **Configuration Android**
```bash
# 1. Builder l'APK
cd mobile\ 2/
./gradlew assembleDebug

# 2. Installer sur l'émulateur
adb install app/build/outputs/apk/debug/app-debug.apk
```

### 🌐 **Configuration Réseau**
- **Backend URL** : `http://10.0.2.2:8080/` (émulateur Android)
- **Authentification** : JWT Bearer Token
- **Base de données** : PostgreSQL/H2 configurée

---

## 🎭 **Scénario de Test - Étudiant Type**

### 👤 **Profil de Test**
- **Nom** : "Yassine RIBI"
- **Email** : `eyajribi8@gmail.com`
- **Mot de passe** : `azertyA1*`
- **Rôle** : Étudiant
- **Faculté** : "Sciences"
- **Département** : "Informatique"
- **Niveau** : "Master 2"
- **Filière** : "Développement Mobile"

---

## 📱 **Scénario Complet**

### 🚪 **Étape 1 : Connexion**

#### ✅ **Test 1.1 - Connexion Réussie**
1. **Ouvrir l'application**
2. **Saisir les identifiants** :
   - Email : `eyajribi8@gmail.com`
   - Mot de passe : `azertyA1*`
3. **Cliquer sur "Se connecter"**
4. **Vérifications** :
   - ✅ Redirection vers `StudentDashboardActivity`
   - ✅ Message "Connexion réussie"
   - ✅ Affichage "Bonjour, Yassine RIBI"
   - ✅ Email et téléphone affichés

#### ❌ **Test 1.2 - Connexion Échouée**
1. **Mauvais identifiants** :
   - Email : `test@test.com`
   - Mot de passe : `wrong`
2. **Vérifications** :
   - ✅ Message d'erreur clair
   - ✅ Pas de redirection
   - ✅ Champ email/password en erreur

#### 🔄 **Test 1.3 - Connexion Google**
1. **Cliquer sur "Continuer avec Google"**
2. **Sélectionner un compte Google**
3. **Vérifications** :
   - ✅ Redirection vers dashboard
   - ✅ Profil Google récupéré

---

### 🏠 **Étape 2 : Dashboard Étudiant**

#### ✅ **Test 2.1 - Affichage Dashboard**
1. **Depuis l'écran de connexion**, se connecter avec succès
2. **Vérifications visuelles** :
   - ✅ Header avec nom complet
   - ✅ Email et téléphone affichés
   - ✅ 3 cartes d'accès rapide (Projets, Tâches, Feedbacks)
   - ✅ Section "Échéances à venir"

#### 🔄 **Test 2.2 - Navigation Dashboard**
1. **Cliquer sur "Voir tous les projets"**
2. **Vérifications** :
   - ✅ Redirection vers `ProjectsActivity`
   - ✅ Retour possible avec bouton back

3. **Cliquer sur "Voir toutes les tâches"**
4. **Vérifications** :
   - ✅ Redirection vers `TasksActivity`
   - ✅ Retour possible avec bouton back

5. **Cliquer sur "Voir les feedbacks"**
6. **Vérifications** :
   - ✅ Redirection vers `FeedbacksActivity`
   - ✅ Retour possible avec bouton back

---

### 📚 **Étape 3 : Gestion des Projets**

#### ✅ **Test 3.1 - Chargement des Projets**
1. **Accéder à ProjectsActivity**
2. **Vérifications** :
   - ✅ Loading pendant le chargement
   - ✅ Titre : "Projets - Yassine"
   - ✅ Liste des projets affichée OU message vide
   - ✅ Pas de crash

#### 🔄 **Test 3.2 - Mode Fallback**
1. **Si backend indisponible** :
   - ✅ Affichage des projets de test
   - ✅ Message "projet(s) de test affiché(s)"
   - ✅ Interface fonctionnelle

#### 📱 **Test 3.3 - Détails Projet**
1. **Cliquer sur un projet**
2. **Vérifications** :
   - ✅ Redirection vers `ProjectDetailActivity`
   - ✅ Informations du projet affichées
   - ✅ Bouton retour fonctionnel

---

### ✅ **Étape 4 : Gestion des Tâches**

#### ✅ **Test 4.1 - Chargement des Tâches**
1. **Accéder à TasksActivity**
2. **Vérifications** :
   - ✅ Loading pendant le chargement
   - ✅ Titre : "Tâches - Yassine"
   - ✅ Liste des tâches affichée OU message vide
   - ✅ Statuts visibles (TERMINEE, EN_COURS, A_FAIRE)

#### 🔄 **Test 4.2 - Mode Fallback**
1. **Si backend indisponible** :
   - ✅ Affichage des tâches de test
   - ✅ 5 tâches avec différents statuts
   - ✅ Priorités visibles (HAUTE, MOYENNE, FAIBLE)

#### ✅ **Test 4.3 - Filtrage Tâches**
1. **Utiliser les filtres** (si disponibles) :
   - ✅ Filtrer par statut
   - ✅ Filtrer par priorité
   - ✅ Mise à jour de l'interface

---

### 👤 **Étape 5 : Profil Utilisateur**

#### ✅ **Test 5.1 - Affichage Profil**
1. **Accéder à ProfileActivity**
2. **Vérifications** :
   - ✅ Tous les champs pré-remplis
   - ✅ Photo de profil (si disponible)
   - ✅ Bouton "Sauvegarder" actif

#### 🔄 **Test 5.2 - Modification Profil**
1. **Modifier un champ** (ex: téléphone)
2. **Cliquer sur "Sauvegarder"**
3. **Vérifications** :
   - ✅ Message "Profil mis à jour"
   - ✅ Données persistées
   - ✅ Pas de crash

#### 📷 **Test 5.3 - Upload Photo**
1. **Cliquer sur "Changer la photo"**
2. **Sélectionner une image**
3. **Vérifications** :
   - ✅ Image sélectionnée affichée
   - ✅ Upload initié (si implémenté)

---

### 📦 **Étape 6 : Livrables**

#### ✅ **Test 6.1 - Liste des Livrables**
1. **Accéder à DeliverablesActivity**
2. **Vérifications** :
   - ✅ Liste des livrables affichée
   - ✅ Statuts visibles
   - ✅ Boutons d'action disponibles

#### 📤 **Test 6.2 - Soumission Livrable**
1. **Cliquer sur "Soumettre" pour un livrable**
2. **Sélectionner un fichier**
3. **Vérifications** :
   - ✅ Upload progressif
   - ✅ Message de succès/échec
   - ✅ Mise à jour du statut

---

### 💬 **Étape 7 : Feedbacks**

#### ✅ **Test 7.1 - Chargement Feedbacks**
1. **Accéder à FeedbacksActivity**
2. **Vérifications** :
   - ✅ Liste des feedbacks affichée
   - ✅ Contenu visible
   - ✅ Dates/notes visibles

#### 🔄 **Test 7.2 - Réponse Feedback**
1. **Cliquer sur "Répondre"**
2. **Saisir une réponse**
3. **Vérifications** :
   - ✅ Réponse envoyée (si implémenté)
   - ✅ Mise à jour de l'interface

---

### 📅 **Étape 8 : Calendrier**

#### ✅ **Test 8.1 - Affichage Calendrier**
1. **Accéder à CalendarActivity**
2. **Vérifications** :
   - ✅ Calendrier mensuel affiché
   - ✅ Événements marqués
   - ✅ Navigation entre mois

#### 📅 **Test 8.2 - Détails Événement**
1. **Cliquer sur une date avec événement**
2. **Vérifications** :
   - ✅ Détails de l'événement
   - ✅ Informations complètes
   - ✅ Actions possibles

---

## 🔧 **Scénarios d'Erreur**

### 🌐 **Test 9.1 - Backend Indisponible**
1. **Arrêter le backend**
2. **Utiliser l'application**
3. **Vérifications** :
   - ✅ Fallback sur données de test
   - ✅ Messages d'erreur clairs
   - ✅ Application reste fonctionnelle

### 📱 **Test 9.2 - Connexion Lente**
1. **Simuler une connexion lente**
2. **Se connecter**
3. **Vérifications** :
   - ✅ Loading indéfini
   - ✅ Timeout géré
   - ✅ Message d'erreur réseau

### 🔐 **Test 9.3 - Token Expiré**
1. **Utiliser l'application pendant longtemps**
2. **Faire une action nécessitant l'authentification**
3. **Vérifications** :
   - ✅ Déconnexion automatique
   - ✅ Retour vers login
   - ✅ Message "Session expirée"

---

## 📊 **Critères de Validation**

### ✅ **Fonctionnalités Requises**
- [ ] Connexion/Déconnexion fonctionnelle
- [ ] Dashboard affiche les informations correctes
- [ ] Projets chargés depuis le backend OU fallback
- [ ] Tâches chargées depuis le backend OU fallback
- [ ] Profil modifiable et sauvegardé
- [ ] Navigation fluide entre écrans
- [ ] Gestion des erreurs réseau
- [ ] Pas de crash majeur

### 🎯 **Performance**
- [ ] Temps de chargement < 3 secondes
- [ ] Interface responsive
- [ ] Mémoire stable (< 200MB)

### 🛡️ **Sécurité**
- [ ] Authentification sécurisée
- [ ] Token géré correctement
- [ ] Pas de données sensibles en clair

---

## 📝 **Rapport de Test**

### 🎯 **Résultats Attendus**
```
✅ Scénario nominal : 100% réussi
⚠️ Scénarios d'erreur : 80% gérés
🔧 Performance : Acceptable
🛡️ Sécurité : Conforme
```

### 🐛 **Problèmes Connus**
- [ ] Upload photo (partiellement implémenté)
- [ ] Réponse feedbacks (à finaliser)
- [ ] Mode production à activer

### 🚀 **Prêt pour la Production**
- [ ] Backend stable
- [ ] APK signé
- [ ] Tests utilisateurs validés
- [ ] Documentation complète

---

## 🎯 **Conclusion**

Ce scénario couvre **100% des fonctionnalités principales** de l'application et permet de valider :

1. **🔐 Authentification** complète
2. **📱 Navigation** fluide  
3. **🔄 Fallback** intelligent
4. **🛡️ Gestion erreurs** robuste
5. **📊 Performance** acceptable

**L'application est prête pour les tests en conditions réelles !** 🚀📱✨
