# Procédure de Génération de l'APK (Quoto Connect)

Choisissez votre méthode de compilation préférée.

## Méthode 1 : Via GitHub Actions (Automatique - Recommandé)

Si vous avez exporté votre projet vers GitHub :

1.  **Vérifiez le workflow :** Le fichier `.github/workflows/android.yml` est déjà configuré dans le projet.
2.  **Lancer le build :**
    *   Allez sur l'onglet **Actions** de votre dépôt GitHub.
    *   Sélectionnez "Build Android APK" dans la liste à gauche.
    *   Cliquez sur le bouton **Run workflow**.
3.  **Télécharger l'APK :** Une fois le build terminé (environ 5 minutes), cliquez sur le build réussi.
    *   Descendez jusqu'à la section **Artifacts**.
    *   Cliquez sur `QuotoConnect-Debug-APK` pour télécharger le fichier ZIP contenant votre APK prêt à installer.

---

## Méthode 2 : Via AndroidIDE (Mobile Local)

Si vous utilisez **AndroidIDE** sur votre smartphone, suivez ces étapes.

### Prérequis
1. Installez **AndroidIDE** (androidide.com).
2. Ouvrez le dossier du projet dans l'application.

### 1. Préparation des Fichiers (Indispensable)
*   **Firebase :** Placez le fichier `google-services.json` (téléchargé depuis la console Firebase) dans `android/app/google-services.json`.
*   **API URL :** Créez un fichier `.env` à la racine et mettez l'URL de votre serveur : `VITE_API_URL="https://votre-app.run.app"`.

### 2. Compilation
Ouvrez le terminal d'AndroidIDE et lancez :
```bash
npm install
npm run apk:build
```

### 3. Installation
L'APK sera généré dans : `/android/app/build/outputs/apk/debug/app-debug.apk`.
Installez-le directement depuis l'explorateur de fichiers d'AndroidIDE.

## Support Technique
*   **Auteur :** developpeurhacker01@gmail.com
*   **WhatsApp :** +243860553073
*   **Version :** Quoto Connect 2026.4
*   **Status :** Prêt pour production APK
