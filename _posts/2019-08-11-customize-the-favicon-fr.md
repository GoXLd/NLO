---
title: Personnaliser le Favicon
language: fr-FR
translation_key: customize-the-favicon
author: GoXLd
date: 2019-08-11 00:34:00 +0800
categories:
- Blogging
- Tutorial
tags:
- favicon
---

Les [favicons](https://www.favicon-generator.org/about/) de [**Chirpy**](https://github.com/cotes2020/jekyll-theme-chirpy/) sont placés dans le répertoire `assets/img/favicons/`{: .filepath}. Vous souhaiterez peut-être les remplacer par les vôtres. Les sections suivantes vous guideront pour créer et remplacer les favicons par défaut.

## Générer le favicon

Préparez une image carrée (PNG, JPG ou SVG) d'une taille de 512x512 ou plus, puis accédez à l'outil en ligne [**Real Favicon Generator**](https://realfavicongenerator.net/) et cliquez sur le bouton <kbd>Choisissez votre image favicon</kbd> pour télécharger votre fichier image.

À l'étape suivante, la page Web affichera tous les scénarios d'utilisation. Vous pouvez conserver les options par défaut, faire défiler vers le bas de la page et cliquer sur le bouton <kbd>Suivant →</kbd> pour générer le favicon.

## Télécharger et remplacer

Téléchargez le package généré, décompressez et supprimez le(s) fichier(s) suivant(s) des fichiers extraits :

- `site.webmanifest`{ : .filepath}

Et puis copiez les fichiers image restants (`.PNG`{: .filepath}, `.ICO`{: .filepath} et `.SVG`{: .filepath}) pour couvrir les fichiers originaux dans le répertoire `assets/img/favicons/`{: .filepath} de votre site Jekyll. Si votre site Jekyll ne dispose pas encore de ce répertoire, créez-en simplement un.

Le tableau suivant vous aidera à comprendre les modifications apportées aux fichiers favicon :

| Fichier(s) | Depuis l'outil en ligne | De Chirpy |
| ------- | :--------------: | :---------: |
| `*.PNG` | None | None |
| `*.ICO` | None | None |
| `*.SVG` | None | None |


<!-- markdownlint-disable-next-line -->
>  ✓ signifie conserver, ✗ signifie supprimer.
{: .prompt-info }

La prochaine fois que vous créerez le site, le favicon sera remplacé par une édition personnalisée.
