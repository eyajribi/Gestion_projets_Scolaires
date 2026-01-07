# 🚀 INSTRUCTIONS DE TEST COMPLETES

## 📋 IDENTIFIANTS DE TEST
- **Email**: `islem@gmail.com`
- **Mot de passe**: `azertyA1*`

## 🛠️ PRÉPARATION

### 1. Démarrer le backend
```bash
# Assurez-vous que le backend Spring Boot est démarré sur le port 8080
curl http://localhost:8080/auth/login
```

### 2. Lancer l'application
```bash
# Compiler et installer l'APK
./gradlew assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk
```

### 3. Démarrer l'émulateur
```bash
# Lancer un émulateur Android
emulator -avd <nom_emulateur>
```

## 🎯 MÉTHODES DE TEST

### 📱 MÉTHODE 1: Test Manuel (Recommandé)

1. **Ouvrir l'application**
2. **Se connecter** avec les identifiants
3. **Naviguer** dans toutes les sections
4. **Vérifier** les fonctionnalités

### 🤖 MÉTHODE 2: Test Automatisé

1. **Sur l'écran de connexion**
2. **Faire un long press** sur le bouton "Se connecter"
3. **Regarder les logs** pour le déroulement du test

## 📊 ÉTAPES DE TEST

### ✅ ÉTAPE 1: CONNEXION
- [ ] Email: islem@gmail.com
- [ ] Mot de passe: azertyA1*
- [ ] Vérifier le token JWT

### ✅ ÉTAPE 2: DASHBOARD
- [ ] Informations utilisateur affichées
- [ ] Nom et prénom corrects
- [ ] Email affiché

### ✅ ÉTAPE 3: PROJETS
- [ ] Cliquer sur "Mes Projets"
- [ ] Vérifier la liste des projets
- [ ] Vérifier les détails de chaque projet

### ✅ ÉTAPE 4: TÂCHES
- [ ] Cliquer sur "Mes Tâches"
- [ ] Vérifier la liste des tâches
- [ ] Vérifier les statuts

### ✅ ÉTAPE 5: DÉPÔT DE TRAVAIL
- [ ] Cliquer sur une tâche
- [ ] Sélectionner un fichier
- [ ] Déposer le fichier
- [ ] Vérifier la confirmation

### ✅ ÉTAPE 6: CHANGEMENT DE STATUT
- [ ] Marquer une tâche comme terminée
- [ ] Vérifier le changement
- [ ] Recharger la liste

### ✅ ÉTAPE 7: FEEDBACKS
- [ ] Cliquer sur "Mes Feedbacks"
- [ ] Vérifier la liste des feedbacks
- [ ] Vérifier les notes

### ✅ ÉTAPE 8: CALENDRIER
- [ ] Cliquer sur "Calendrier"
- [ ] Vérifier les événements
- [ ] Vérifier les dates

## 🔍 LOGS À SURVEILLER

### Commande pour voir les logs:
```bash
adb logcat -s ScolabStudentApp
```

### Logs de connexion attendus:
```
DEBUG: Début de connexion avec le backend
DEBUG: Email: islem@gmail.com
DEBUG: Connexion réussie - Status: success
DEBUG: Token sauvegardé: eyJhbGciOiJIUzI1NiJ9...
```

### Logs de chargement attendus:
```
DEBUG: Chargement des données du dashboard
DEBUG: Début du chargement des projets
DEBUG: Réponse projets - Code: 200, Successful: true
DEBUG: X projets chargés
```

## 🚨 DÉPANNAGE

### Erreurs courantes:

#### ❌ "Connection refused"
- **Cause**: Backend non démarré
- **Solution**: Démarrer le backend sur le port 8080

#### ❌ "401 Non autorisé"
- **Cause**: Token invalide ou expiré
- **Solution**: Se reconnecter

#### ❌ "404 Non trouvé"
- **Cause**: Endpoint inexistant
- **Solution**: Vérifier les URLs du backend

#### ❌ "500 Erreur serveur"
- **Cause**: Erreur backend
- **Solution**: Vérifier les logs du backend

### Commandes utiles:
```bash
# Vérifier la connectivité
curl http://localhost:8080/auth/login

# Vider les logs
adb logcat -c

# Réinstaller l'application
adb uninstall com.example.scolabstudentapp
adb install app/build/outputs/apk/debug/app-debug.apk
```

## 📈 RÉSULTATS ATTENDUS

### ✅ Cas de succès:
- ✅ Connexion réussie
- ✅ Dashboard avec informations
- ✅ Liste des projets chargée
- ✅ Liste des tâches fonctionnelle
- ✅ Dépôt de travail opérationnel
- ✅ Changement de statut fonctionnel
- ✅ Feedbacks affichés
- ✅ Calendrier fonctionnel

### ❌ Cas d'échec:
- ❌ Erreur de connexion
- ❌ Backend inaccessible
- ❌ Données non chargées
- ❌ Fonctionnalités non opérationnelles

## 🎯 TEST AUTOMATISÉ

### Pour lancer le test automatique:
1. **Ouvrir l'application**
2. **Faire un long press** sur le bouton "Se connecter"
3. **Les identifiants** seront remplis automatiquement
4. **Le test complet** s'exécutera
5. **Les résultats** s'afficheront dans les logs

### Logs du test automatique:
```
🚀 DÉBUT DU TEST COMPLET
📧 Email: islem@gmail.com
🔑 Mot de passe: azertyA1*
🔐 ÉTAPE 1: TEST DE CONNEXION
✅ Connexion réussie
👤 ÉTAPE 2: TEST PROFIL UTILISATEUR
✅ Profil chargé
📁 ÉTAPE 3: TEST DES PROJETS
✅ Projets chargés: X
📋 ÉTAPE 4: TEST DES TÂCHES
✅ Tâches chargées: Y
🔄 ÉTAPE 4.1: TEST CHANGEMENT STATUT TÂCHE
✅ Statut tâche changé
📅 ÉTAPE 5: TEST DU CALENDRIER
✅ Calendrier chargé
🔔 ÉTAPE 6: TEST DES NOTIFICATIONS
✅ Notifications chargées: Z
✅ TEST COMPLET TERMINÉ AVEC SUCCÈS
```

---

**🎯 PRÊT À TESTER TOUTES LES FONCTIONNALITÉS AVEC islem@gmail.com !**
