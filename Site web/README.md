# Ynot

Site vitrine Ynot en React, TypeScript et Vite. La page `src/pages/tele.tsx` est l’unique page du site, affichée à la racine `/`, avec son téléphone 3D interactif.

## Environnement et démarrage

Utiliser Node.js 22.12 ou supérieur, ou Node.js 20 à partir de 20.19, avec npm.
Aucune variable d’environnement ni fichier `.env` n’est nécessaire.

```bash
npm ci
npm run dev
```

Ouvrir l’adresse affichée par Vite, généralement http://127.0.0.1:5173.
Sous PowerShell, si `npm.ps1` est bloqué, utiliser `npm.cmd` à la place de `npm`.

## Vérification et production

```bash
npm run typecheck
npm run build
npm run preview
```

Le build vérifie également TypeScript et génère le site dans `dist/`.
L’aperçu de production est généralement disponible sur http://127.0.0.1:4173.

## Fichiers utiles

- `src/main.tsx` : montage de la page d’accueil.
- `src/pages/tele.tsx` : contenu et téléphone 3D.
- `src/pages/tele.css` : styles et adaptations aux mobiles.
- `public/images/tele/` : logo et icônes des boutiques.
- `public/models/smartphone.glb` : modèle du téléphone.
- `public/fonts/` : police Inter et sa licence.

React Three Fiber, Drei et Three.js assurent l’affichage du téléphone. Son éclairage « studio » charge un environnement depuis un service externe ; une connexion Internet est nécessaire pour ce chargement.
