# Comment exporter Quoto Connect vers GitHub

Pour copier tous les fichiers fournis et les mettre sur votre compte GitHub, vous avez deux options simples :

## Option 1 : Exportation Directe (Recommandé)
1.  Dans l'interface de **AI Studio Build**, cliquez sur l'icône **Paramètres (engrenage)** ou sur le bouton de menu (trois points) en haut à droite.
2.  Choisissez **"Export to GitHub"**.
3.  Connectez votre compte GitHub et sélectionnez (ou créez) le dépôt où vous souhaitez envoyer le code.
4.  Le système enverra automatiquement tous les dossiers et fichiers (Node.js, Android, Workflows, etc.).

## Option 2 : Téléchargement ZIP (Manuel)
1.  Dans le même menu en haut à droite, choisissez **"Download project as ZIP"**.
2.  Extrayez le fichier ZIP sur votre ordinateur (ou téléphone si vous utilisez AndroidIDE).
3.  Créez un nouveau dépôt sur GitHub.
4.  Glissez-déposez tous les fichiers extraits dans votre dépôt GitHub.

## Une fois sur GitHub :
Le build pour votre APK se lancera automatiquement grâce au fichier `.github/workflows/android.yml` que j'ai configuré pour vous. Vous pourrez télécharger l'APK dans l'onglet **Actions** de votre GitHub.

---
**Rappel :** N'oubliez pas de configurer vos Secrets sur GitHub (GEMINI_API_KEY, etc.) si vous prévoyez de déployer le backend ailleurs.
