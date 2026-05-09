# 🏨 Plateforme Velora Palace

THE LINK OF DEMO : https://velora-palace-hotel-system.vercel.app/

Un système complet de gestion d'hôtel et de restaurant de luxe, comprenant une interface utilisateur élégante (Frontend) et un tableau de bord d'administration robuste (Backend), propulsé par Supabase.

## 🚀 Guide de Démarrage Rapide

Suivez ces instructions pour configurer et lancer le projet sur votre environnement local.

### 1. Prérequis
- [Node.js](https://nodejs.org/) (Version 18.x ou ultérieure recommandée)
- Un compte [Supabase](https://supabase.com/) pour la base de données.

### 2. Installation des Dépendances
Le projet inclut un script pratique pour installer toutes les dépendances (racine, frontend, et backend) en une seule commande. À la racine du projet, ouvrez votre terminal et exécutez :

```bash
npm run install-all
```

### 3. Configuration de la Base de Données (Supabase)
La structure complète de la base de données a été consolidée pour faciliter le déploiement :
1. Créez un nouveau projet sur [Supabase](https://supabase.com/).
2. Accédez à l'éditeur SQL (**SQL Editor**) dans votre tableau de bord Supabase.
3. Ouvrez le fichier `supabase/full_schema.sql` situé dans ce projet.
4. Copiez l'intégralité du contenu, collez-le dans l'éditeur SQL de Supabase et cliquez sur **Run**.

### 4. Configuration des Variables d'Environnement
Vous devez configurer les variables d'environnement pour que le frontend et le backend puissent communiquer avec Supabase.

**Dans le dossier `frontend` :**
Vérifiez ou créez un fichier `.env` avec le contenu suivant :
```env
VITE_SUPABASE_URL=votre_url_de_projet_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_anonyme_supabase
VITE_BACKEND_URL=http://localhost:5000
```

**Dans le dossier `backend` :**
Vérifiez ou créez un fichier `.env` avec le contenu suivant :
```env
PORT=5000
SUPABASE_URL=votre_url_de_projet_supabase
SUPABASE_ANON_KEY=votre_clé_anonyme_supabase
JWT_SECRET=votre_clé_secrète_sécurisée
STRIPE_SECRET_KEY=sk_test_placeholder
FRONTEND_URL=http://localhost:5173
```

### 5. Lancement de l'Application
Pour démarrer simultanément les serveurs frontend et backend en mode développement, exécutez la commande suivante à la racine du projet :

```bash
npm run dev
```

- 🌐 **Interface Client (Frontend)** : [http://localhost:5173](http://localhost:5173)
- ⚙️ **Serveur (Backend)** : [http://localhost:5000](http://localhost:5000)

---

## 🛠️ Architecture du Projet
- **/frontend** : Application React moderne construite avec Vite, TypeScript et Tailwind CSS.
- **/backend** : API Node.js/Express intégrant Socket.io pour la communication en temps réel.
- **/supabase** : Scripts SQL consolidés pour l'initialisation de la base de données et des politiques de sécurité (RLS).
