---
title: Prise en main
language: fr-FR
translation_key: getting-started
permalink: /posts/fr/getting-started/
description: >-
  Installez, configurez et déployez votre premier site basé sur Chirpy.
author: cotes
date: 2019-08-09 20:55:00 +0800
categories:
- Blogging
- Tutorial
tags:
- getting started
pin: true
media_subpath: /posts/20180809
---

## Créer le dépôt du site

Vous avez deux options :

### Option 1. Utilisation du démarreur (recommandé)

Simplifie les mises à niveau, isole les fichiers inutiles et vous laisse vous concentrer sur l'écriture avec une configuration minimale.

1. Connectez-vous à GitHub et ouvrez le [**starter**][starter].
2. Cliquez sur <kbd>Use this template</kbd> > <kbd>Create a new repository</kbd>.
3. Nommez le dépôt `<username>.github.io`, en remplaçant `username` par votre nom d'utilisateur GitHub en minuscules.

### Option 2. Forker le thème

Pratique pour modifier des fonctionnalités ou l'interface, mais plus difficile à mettre à niveau. Ne choisissez cette voie que si vous connaissez Jekyll et comptez modifier fortement le thème.

1. Connectez-vous à GitHub.
2. [Forkez le dépôt du thème](https://github.com/cotes2020/jekyll-theme-chirpy/fork).
3. Nommez le dépôt `<username>.github.io`, en remplaçant `username` par votre nom d'utilisateur GitHub en minuscules.

## Configuration de l'environnement

Une fois le dépôt créé, configurez votre environnement de développement de l'une des deux façons suivantes :

### Conteneurs de développement (recommandé pour Windows)

Les Dev Containers offrent un environnement Docker isolé qui évite les conflits système et gère toutes les dépendances dans le conteneur.

**Étapes** :

1. Installez Docker :
   - Windows/macOS : [Docker Desktop][docker-desktop].
   - Linux : [Docker Engine][docker-engine].
2. Installez [VS Code][vscode] et l'[extension Dev Containers][dev-containers].
3. Clonez votre dépôt :
   - Docker Desktop : démarrez VS Code et [clonez votre dépôt dans un volume conteneur][dc-clone-in-vol].
   - Docker Engine : clonez votre dépôt localement, puis [ouvrez-le dans un conteneur][dc-open-in-container] via VS Code.
4. Attendez la fin de la configuration.

### Configuration native (recommandée pour les OS de type Unix)

Sur les systèmes de type Unix, une configuration native offre les meilleures performances ; les Dev Containers fonctionnent aussi.

**Étapes** :

1. Suivez le [Jekyll installation guide](https://jekyllrb.com/docs/installation/) et assurez-vous que [Git](https://git-scm.com/) est installé.
2. Clonez votre dépôt localement.
3. Si vous avez forké le thème, installez [Node.js][nodejs] et exécutez `bash tools/init.sh` à la racine pour initialiser le dépôt.
4. Exécutez `bundle` à la racine du dépôt pour installer les dépendances.

## Utilisation

### Démarrer le serveur Jekyll

Lancez le site localement :

```terminal
$ bundle exec jekyll serve
```

> Avec les Dev Containers, exécutez cette commande dans le terminal **VS Code**.
{: .prompt-info }

Après quelques secondes, le site est disponible à <http://127.0.0.1:4000>.

### Configuration

Mettez à jour `_config.yml`{: .filepath} au besoin. Options courantes :

- `url`
- `avatar`
- `timezone`
- `lang`

### Options de contact social

Les contacts sociaux apparaissent en bas de la barre latérale. Activez-les ou désactivez-les dans `_data/contact.yml`{: .filepath}.

### Personnalisation de la feuille de style

Copiez le fichier `assets/css/jekyll-theme-chirpy.scss`{: .filepath} du thème dans le même chemin de votre site, puis ajoutez vos styles à la fin.

### Personnalisation des actifs statiques

La configuration des actifs statiques est arrivée en `5.1.0`. Leur CDN est défini dans `_data/origin/cors.yml`{: .filepath } ; remplacez des entrées selon les conditions réseau de la région où votre site est publié.

Pour auto-héberger les actifs statiques, voir le dépôt [_chirpy-static-assets_](https://github.com/cotes2020/chirpy-static-assets#readme).

## Déploiement

Avant le déploiement, vérifiez `_config.yml`{: .filepath} et définissez correctement `url`. Pour un [**project site**](https://help.github.com/en/github/working-with-github-pages/about-github-pages#types-of-github-pages-sites) sans domaine personnalisé, ou pour servir sous une base URL hors **GitHub Pages**, définissez `baseurl` avec le nom du projet précédé de `/`, par exemple `/project-name`.

Choisissez maintenant _une_ des méthodes suivantes.

### Déployer avec GitHub Actions

Préparez ce qui suit :

- Sur le forfait GitHub Free, gardez le dépôt du site public.
- Si vous avez validé `Gemfile.lock`{: .filepath} et que votre machine n'est pas sous Linux, ajoutez la plate-forme Linux :

  ```console
  $ bundle lock --add-platform x86_64-linux
  ```

Configurez ensuite _Pages_ :

1. Sur GitHub, ouvrez _Settings_ > _Pages_. Sous _Build and deployment_ > **Source**, sélectionnez [**GitHub Actions**][pages-workflow-src].  
   ![Build source](pages-source-light.png){: .light .border .normal w='375' h='140' }
   ![Build source](pages-source-dark.png){: .dark .normal w='375' h='140' }

2. Poussez un commit pour déclencher le workflow. Dans l'onglet _Actions_, suivez _Build and Deploy_ ; en cas de succès, le site se déploie automatiquement.

Ouvrez l'URL fournie par GitHub pour voir votre site.

### Construction et déploiement manuels

Pour les serveurs auto-hébergés, construisez le site localement et téléversez le résultat.

Depuis la racine du projet, construisez le site :

```console
$ JEKYLL_ENV=production bundle exec jekyll b
```

Sauf autre chemin de sortie, les fichiers sont placés dans `_site`{: .filepath}. Téléversez-les sur votre serveur.

[nodejs]: https://nodejs.org/
[starter]: https://github.com/cotes2020/chirpy-starter
[pages-workflow-src]: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow
[docker-desktop]: https://www.docker.com/products/docker-desktop/
[docker-engine]: https://docs.docker.com/engine/install/
[vscode]: https://code.visualstudio.com/
[dev-containers]: https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers
[dc-clone-in-vol]: https://code.visualstudio.com/docs/devcontainers/containers#_quick-start-open-a-git-repository-or-github-pr-in-an-isolated-container-volume
[dc-open-in-container]: https://code.visualstudio.com/docs/devcontainers/containers#_quick-start-open-an-existing-folder-in-a-container
