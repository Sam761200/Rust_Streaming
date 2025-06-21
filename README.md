# 📼 PapyStreaming Frontend

Interface web moderne pour le streaming de vidéos, construite avec Next.js et Tailwind CSS.

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- npm ou yarn
- L'API Rust backend en cours d'exécution sur le port 8080

### Installation

1. Installez les dépendances :

```bash
npm install
```

2. Configurez votre clé API dans `app/config.ts` :

```typescript
export const API_CONFIG = {
  BASE_URL: "http://localhost:8080",
  API_KEY: "votre_cle_api", // Remplacez par votre vraie clé
  TIMEOUT: 10000,
} as const;
```

3. Lancez le serveur de développement :

```bash
npm run dev
```

4. Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 🎯 Fonctionnalités

- **Navigation des vidéos** : Parcourez toutes les vidéos disponibles
- **Streaming** : Regardez les vidéos directement dans le navigateur
- **Téléchargement** : Téléchargez les vidéos localement
- **Miniatures** : Prévisualisation des vidéos avec des thumbnails
- **Interface responsive** : Fonctionne sur desktop et mobile
- **Mode sombre** : Basculement automatique selon les préférences système
- **Gestion d'erreurs** : Affichage propre des erreurs et états de chargement

## 🛠️ Configuration

### Variables d'environnement

Créez un fichier `.env.local` dans la racine du projet :

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_API_KEY=votre_cle_api
```

### Personnalisation

- **Style** : Modifiez `app/globals.css` pour personnaliser les couleurs et styles
- **API** : Adaptez `app/config.ts` pour votre configuration backend
- **Layout** : Personnalisez `app/layout.tsx` pour les métadonnées et le layout global

## 📁 Structure du projet

```
papy-frontend/
├── app/
│   ├── config.ts          # Configuration API
│   ├── globals.css        # Styles globaux
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Page d'accueil avec liste des vidéos
├── public/                # Fichiers statiques
└── package.json           # Dépendances
```

## 🔧 Scripts disponibles

- `npm run dev` : Lance le serveur de développement
- `npm run build` : Construit l'application pour la production
- `npm run start` : Lance l'application en mode production
- `npm run lint` : Vérifie la qualité du code

## 🎨 Technologies utilisées

- **Next.js 15** : Framework React avec App Router
- **TypeScript** : Typage statique
- **Tailwind CSS 4** : Framework CSS utilitaire
- **React 19** : Bibliothèque d'interface utilisateur

## 🔐 Sécurité

- Authentification par clé API
- Validation des requêtes côté client
- Gestion sécurisée des erreurs
- Configuration externalisée

## 📱 Compatibilité

- ✅ Chrome/Edge 88+
- ✅ Firefox 85+
- ✅ Safari 14+
- ✅ Appareils mobiles (iOS/Android)

## 🚨 Dépannage

### L'API n'est pas accessible

- Vérifiez que le backend Rust est démarré sur le port 8080
- Contrôlez la configuration dans `app/config.ts`
- Vérifiez les logs du navigateur (F12)

### Les vidéos ne se chargent pas

- Assurez-vous que le dossier `videos/` contient des fichiers MP4
- Vérifiez que votre clé API est correcte
- Contrôlez les permissions de fichiers côté backend

### Les miniatures ne s'affichent pas

- Vérifiez la présence du dossier `thumbnails/` côté backend
- Les miniatures doivent avoir le même nom que les vidéos (format .jpg)

## 📄 Licence

Ce projet est sous licence MIT.
