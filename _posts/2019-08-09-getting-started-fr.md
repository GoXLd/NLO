---
title: Commencer
language: fr-FR
translation_key: getting-started
description: Commencez avec les bases de Chirpy dans cet aperçu complet. Vous apprendrez
  à installer, configurer et utiliser votre premier site Web basé sur Chirpy, ainsi
  qu'à le déployer sur un serveur Web.
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

## Création d'un référentiel de site

Lors de la création de votre référentiel de site, vous disposez de deux options en fonction de vos besoins :

### Option 1. Utilisation du démarreur (recommandé)

Cette approche simplifie les mises à niveau, isole les fichiers inutiles et convient parfaitement aux utilisateurs qui souhaitent se concentrer sur l'écriture avec une configuration minimale.

1. Connectez-vous à GitHub et accédez au [**starter**][starter].
2. Cliquez sur le bouton <kbd>Utiliser ce modèle</kbd>, puis sélectionnez <kbd>Créer un nouveau référentiel</kbd>.
3. Nommez le nouveau référentiel `<username>.github.io`, en remplaçant `username` par votre nom d'utilisateur GitHub minuscule.

### Option 2. Forker le thème

Cette approche est pratique pour modifier des fonctionnalités ou la conception de l’interface utilisateur, mais présente des défis lors des mises à niveau. N'essayez donc pas ceci à moins que vous ne soyez familier avec Jekyll et que vous envisagez de modifier fortement ce thème.

1. Connectez-vous à GitHub.
2. [Fork the theme repository](https://github.com/cotes2020/jekyll-theme-chirpy/fork).
3. Nommez le nouveau référentiel `<username>.github.io`, en remplaçant `username` par votre nom d'utilisateur GitHub minuscule.

## Configuration de l'environnement

Une fois votre référentiel créé, il est temps de configurer votre environnement de développement. Il existe deux méthodes principales :

### Utilisation de conteneurs de développement (recommandé pour Windows)

Les conteneurs de développement offrent un environnement isolé utilisant Docker, qui évite les conflits avec votre système et garantit que toutes les dépendances sont gérées au sein du conteneur.

**Mesures**:

1. Installez Docker :
   - Sous Windows/macOS, installez [Docker Desktop][docker-desktop].
   - Sous Linux, installez [Docker Engine][docker-engine].
2. Installez [VS Code][vscode] et l'[extension Dev Containers][dev-containers].
3. Clonez votre dépôt :
   - Pour Docker Desktop : démarrez VS Code et [clonez votre dépôt dans un volume conteneur] [dc-clone-in-vol].
   - Pour Docker Engine : clonez votre dépôt localement, puis [ouvrez-le dans un conteneur] [dc-open-in-container] via VS Code.
4. Attendez la fin de la configuration des conteneurs de développement.

### Configuration native (recommandée pour les systèmes d'exploitation de type Unix)

Pour les systèmes de type Unix, vous pouvez configurer l'environnement de manière native pour des performances optimales, mais vous pouvez également utiliser des conteneurs de développement comme alternative.

**Mesures**:

1. Suivez le [Jekyll installation guide](https://jekyllrb.com/docs/installation/) pour installer Jekyll et assurez-vous que [Git](https://git-scm.com/) est installé.
2. Clonez votre référentiel sur votre machine locale.
3. Si vous avez créé le thème, installez [Node.js][nodejs] et exécutez `bash tools/init.sh` dans le répertoire racine pour initialiser le référentiel.
4. Exécutez la commande `bundle` à la racine de votre référentiel pour installer les dépendances.

## Usage

### Démarrez le serveur Jekyll

Pour exécuter le site localement, utilisez la commande suivante :

```terminal
$ bundle exec jekyll serve
```

> Si vous utilisez des conteneurs de développement, vous devez exécuter cette commande dans le terminal **VS Code**.
{: .prompt-info }

Après quelques secondes, le serveur local sera disponible à <http://127.0.0.1:4000>.

### Configuration

Mettez à jour les variables dans `_config.yml`{: .filepath} si nécessaire. Certaines options typiques incluent :

- `url`
- `avatar`
- `timezone`
- `lang`

### Options de contact social

Les options de contact social sont affichées en bas de la barre latérale. Vous pouvez activer ou désactiver des contacts spécifiques dans le fichier `_data/contact.yml`{: .filepath}.

### Personnalisation de la feuille de style

Pour personnaliser la feuille de style, copiez le fichier `assets/css/jekyll-theme-chirpy.scss`{: .filepath} du thème dans le même chemin de votre site Jekyll et ajoutez vos styles personnalisés à la fin du fichier.

### Personnalisation des actifs statiques

La configuration des actifs statiques a été introduite dans la version `5.1.0`. Le CDN des actifs statiques est défini dans `_data/origin/cors.yml`{: .filepath }. Vous pouvez en remplacer certains en fonction des conditions du réseau dans la région où votre site Web est publié.

Si vous préférez auto-héberger les actifs statiques, référez-vous au référentiel [_chirpy-static-assets_](https://github.com/cotes2020/chirpy-static-assets#readme).

## Déploiement

Before deploying, check the `_config.yml`{: .filepath} file and ensure the `url` is configured correctly. If you prefer a [**project site**](https://help.github.com/en/github/working-with-github-pages/about-github-pages#types-of-github-pages-sites) and don't use a custom domain, or if you want to visit your website with a base URL on a web server other than **GitHub Pages**, remember to set the `baseurl` to your project name, starting with a slash, e.g., `/project-name`.

Vous pouvez désormais choisir _UNE_ des méthodes suivantes pour déployer votre site Jekyll.

### Déployer à l'aide des actions Github

Préparez ce qui suit :

- Si vous bénéficiez du forfait GitHub Free, gardez le référentiel de votre site public.
- Si vous avez validé `Gemfile.lock`{: .filepath} dans le référentiel et que votre machine locale n'exécute pas Linux, mettez à jour la liste des plates-formes du fichier de verrouillage :

  ```console
  $ bundle lock --add-platform x86_64-linux
  ```

Ensuite, configurez le service _Pages_ :

1. Accédez à votre référentiel sur GitHub. Sélectionnez l'onglet _Paramètres_, puis cliquez sur _Pages_ dans la barre de navigation de gauche. Dans la section **Source** (sous _Build et déploiement_), sélectionnez [**GitHub Actions**][pages-workflow-src] dans le menu déroulant.
   ![Build source](pages-source-light.png){ : .light .border .normal w='375' h='140' }
   ![Build source](pages-source-dark.png){ : .dark .normal w='375' h='140' }

2. Envoyez tous les commits vers GitHub pour déclencher le workflow _Actions_. Dans l'onglet _Actions_ de votre référentiel, vous devriez voir le workflow _Build and Deploy_ en cours d'exécution. Une fois la construction terminée et réussie, le site sera déployé automatiquement.

Vous pouvez maintenant visiter l'URL fournie par GitHub pour accéder à votre site.

### Construction et déploiement manuels

Pour les serveurs auto-hébergés, vous devrez créer le site sur votre ordinateur local, puis télécharger les fichiers du site sur le serveur.

Accédez à la racine du projet source et créez votre site avec la commande suivante :

```console
$ JEKYLL_ENV=production bundle exec jekyll b
```

Sauf si vous avez spécifié le chemin de sortie, les fichiers du site générés seront placés dans le dossier `_site`{: .filepath} du répertoire racine du projet. Téléchargez ces fichiers sur votre serveur cible.

[nodejs] : https://nodejs.org/
[entrée] : https://github.com/cotes2020/chirpy-starter
[pages-workflow-src] : https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow
[docker-desktop] : https://www.docker.com/products/docker-desktop/
[moteur-docker] : https://docs.docker.com/engine/install/
[vscode] : https://code.visualstudio.com/
[conteneurs de développement] : https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers
[dc-clone-in-vol] : https://code.visualstudio.com/docs/devcontainers/containers#_quick-start-open-a-git-repository-or-github-pr-in-an-isolated-container-volume
[dc-open-in-container] : https://code.visualstudio.com/docs/devcontainers/containers#_quick-start-open-an-existing-folder-in-a-container
