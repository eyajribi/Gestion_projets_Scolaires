# GUIDE DE TEST COMPLET - Scolab Student App

## IDENTIFIANTS DE TEST
- **Email**: islem@gmail.com
- **Mot de passe**: azertyA1*

## ÉTAPE 1: LANCEMENT DE L'APPLICATION

### Option A: Avec Android Studio
1. Ouvrir le projet dans Android Studio
2. Lancer un émulateur Android (API 28+)
3. Cliquer sur "Run" pour installer l'application

### Option B: Avec la ligne de commande
```bash
# Démarrer l'émulateur
emulator -avd <nom_emulateur>

# Installer l'APK
adb install app/build/outputs/apk/debug/app-debug.apk
```

## ÉTAPE 2: CONNEXION

1. **Lancer l'application**
2. **Écran de connexion**:
   - Email: `islem@gmail.com`
   - Mot de passe: `azertyA1*`
3. **Cliquer sur "Se connecter"**

### Logs à surveiller (via `adb logcat -s ScolabStudentApp`):
```
DEBUG: Début de connexion avec le backend
DEBUG: Email: islem@gmail.com
DEBUG: Connexion réussie - Status: success
DEBUG: Token sauvegardé: eyJhbGciOiJIUzI1NiJ9...
```

## ÉTAPE 3: VÉRIFICATION DU DASHBOARD

Après connexion, vérifiez:

### Informations utilisateur
- **Nom d'affichage**: "Bonjour, [Prénom] [Nom]"
- **Email**: islem@gmail.com
- **Téléphone**: [Numéro si configuré]

### Logs attendus:
```
DEBUG: Utilisateur trouvé: islem@gmail.com
DEBUG: Chargement des données du dashboard
```

## ÉTAPE 4: TEST DES PROJETS

1. **Cliquer sur "Mes Projets"** dans le dashboard
2. **Vérifier l'affichage**:
   - Liste des projets de l'utilisateur
   - Informations de chaque projet
   - Messages de chargement

### Logs attendus:
```
DEBUG: Début du chargement des projets
DEBUG: Token disponible: eyJhbGciOiJIUzI1NiJ9...
DEBUG: Chargement des projets depuis le backend
DEBUG: Réponse projets - Code: 200, Successful: true
DEBUG: X projets chargés
```

### En cas d'erreur:
```
DEBUG: Erreur chargement projets: 401 - Non autorisé
DEBUG: Erreur de connexion: Connection refused
```

## ÉTAPE 5: TEST DES TÂCHES

1. **Cliquer sur "Mes Tâches"** dans le dashboard
2. **Vérifier l'affichage**:
   - Liste des tâches avec statuts
   - Boutons d'action pour chaque tâche
   - Informations détaillées

### Logs attendus:
```
DEBUG: Début du chargement des tâches
DEBUG: Réponse tâches - Code: 200, Successful: true
DEBUG: X tâches chargées
```

## ÉTAPE 6: TEST DE DÉPÔT DE TRAVAIL

1. **Cliquer sur une tâche** dans la liste
2. **Page de dépôt**:
   - Vérifier les informations de la tâche
   - Cliquer sur "Sélectionner un fichier"
   - Choisir un fichier (PDF, DOC, etc.)
   - Cliquer sur "Déposer"

### Logs attendus:
```
DEBUG: Début de la soumission du livrable [ID]
DEBUG: Réponse soumission livrable - Code: 200, Successful: true
DEBUG: Livrable soumis avec succès
```

## ÉTAPE 7: TEST DE CHANGEMENT DE STATUT

1. **Dans la liste des tâches**
2. **Marquer une tâche comme terminée**:
   - Cliquer sur le bouton d'action
   - Vérifier le changement de statut
   - Recharger la liste

### Logs attendus:
```
DEBUG: Changement du statut de la tâche [ID] vers TERMINE
DEBUG: Réponse changement statut - Code: 200, Successful: true
DEBUG: Tâche mise à jour
```

## ÉTAPE 8: TEST DES FEEDBACKS

1. **Cliquer sur "Mes Feedbacks"** dans le dashboard
2. **Vérifier l'affichage**:
   - Liste des feedbacks reçus
   - Notes et commentaires
   - Options de réponse

### Logs attendus:
```
DEBUG: Chargement des feedbacks depuis le backend
DEBUG: X notifications/feedbacks chargés
```

## ÉTAPE 9: TEST DU CALENDRIER

1. **Cliquer sur "Calendrier"** dans le dashboard
2. **Vérifier l'affichage**:
   - Vue calendrier
   - Événements des projets
   - Dates importantes

### Logs attendus:
```
DEBUG: Chargement des événements du calendrier
DEBUG: Données calendrier chargées: [data]
```

## DÉPANNAGE

### Erreurs de connexion:
1. **Vérifier l'URL du backend**:
   - Émulateur: `http://10.0.2.2:8080/`
   - Local: `http://localhost:8080/`
   - Réseau: `http://192.168.1.100:8080/`

2. **Vérifier que le backend est démarré**:
   ```bash
   curl http://localhost:8080/auth/login
   ```

3. **Logs complets**:
   ```bash
   adb logcat -s ScolabStudentApp
   ```

### Messages d'erreur courants:
- **401 Non autorisé**: Token invalide ou expiré
- **403 Accès refusé**: Permissions insuffisantes
- **404 Non trouvé**: Endpoint inexistant
- **500 Erreur serveur**: Problème backend

## RÉSULTATS ATTENDUS

✅ **Connexion réussie** avec islem@gmail.com
✅ **Dashboard** affiche les informations utilisateur
✅ **Projets** chargés depuis le backend
✅ **Tâches** affichées avec statuts
✅ **Dépôt de travail** fonctionnel
✅ **Changement de statut** opérationnel
✅ **Feedbacks** affichés
✅ **Calendrier** fonctionnel

## COMMANDES UTILES

```bash
# Installer l'application
adb install app/build/outputs/apk/debug/app-debug.apk

# Voir les logs
adb logcat -s ScolabStudentApp

# Lancer l'application
adb shell am start -n com.example.scolabstudentapp/.LoginActivity

# Vider les logs
adb logcat -c
```

## NOTES IMPORTANTES

1. **Backend doit être démarré** sur le port 8080
2. **Émulateur Android** doit être configuré
3. **Permissions réseau** doivent être accordées
4. **Token JWT** est sauvegardé automatiquement
5. **Logs de debug** sont disponibles pour diagnostiquer

---

**Prêt à tester toutes les fonctionnalités avec islem@gmail.com !** 🚀
