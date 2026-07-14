---
title: Personnaliser le favicon
language: fr-FR
translation_key: customize-the-favicon
permalink: /posts/fr/customize-the-favicon/
author: GoXLd
date: 2019-08-11 00:34:00 +0800
categories:
- Blogging
- Tutorial
tags:
- favicon
---

Les [favicons](https://www.favicon-generator.org/about/) du thème [**Chirpy**](https://github.com/cotes2020/jekyll-theme-chirpy/) se trouvent dans `assets/img/favicons/`{: .filepath}. Voici comment les remplacer par les vôtres.

## Générer le favicon

Préparez une image carrée (PNG, JPG ou SVG) d'au moins 512x512, ouvrez [**Real Favicon Generator**](https://realfavicongenerator.net/) et cliquez sur <kbd>Pick your favicon image</kbd> pour la téléverser.

La page suivante affiche tous les scénarios d'utilisation. Conservez les valeurs par défaut, faites défiler jusqu'en bas et cliquez sur <kbd>Next →</kbd> pour générer le favicon.

## Télécharger et remplacer

Téléchargez le package, décompressez-le et supprimez :

- `site.webmanifest`{: .filepath}

Copiez les images restantes (`.PNG`{: .filepath}, `.ICO`{: .filepath}, `.SVG`{: .filepath}) par-dessus les originaux dans `assets/img/favicons/`{: .filepath}, en créant ce répertoire s'il n'existe pas.

Le tableau résume ce qui change :

| Fichier(s) | Depuis l'outil en ligne | Depuis Chirpy |
| ------- | :--------------: | :---------: |
| `*.PNG` |        ✓         |      ✗      |
| `*.ICO` |        ✓         |      ✗      |
| `*.SVG` |        ✓         |      ✗      |


<!-- markdownlint-disable-next-line -->
>  ✓ signifie conserver, ✗ signifie supprimer.
{: .prompt-info }

La prochaine construction utilisera votre favicon personnalisé.
