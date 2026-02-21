---
title: 'NLO vs Chirpy : journal des différences'
language: fr-FR
translation_key: nlo-vs-chirpy-diff-log
description: Une liste objective des différences entre le thème NLO et le thème jekyll-chirpy
  original. Le message est mis à jour au fur et à mesure de la progression de la migration
  et du développement du sujet.
date: 2026-02-17 12:30:00 +0100
categories:
- NLO
- Migration
tags:
- nlo
- chirpy
- changelog
---

![](assets/img/logo_nlo.png)
Cet article documente les **différences techniques spécifiques** par rapport au fil de discussion d'origine.
Le format est simple : on ajoute un élément lorsqu'il est implémenté et vérifié.

## Liste de contrôle des différences

- [x] Graphique de contribution GitHub aux statistiques personnelles (accueil + barre latérale) avec mise à jour automatique via workflow
- [x] Panneau d'administration local pour l'édition de contenu, basé sur `jekyll-admin`, avec fork d'interface utilisateur à l'intérieur du projet
- [x] Connexion rapide au panneau d'administration local via un bouton séparé dans la barre latérale (développeur uniquement)
- [x] Branding de la barre latérale étendue : différents avatars pour le clair/foncé + choix du style de cadre
- [x] Mode multilingue en `lang` avec sélecteur de langue et drapeaux dans la barre latérale
- [x] Préfixes d'URL de paramètres régionaux courts (`/ru/`, `/fr/`) au lieu de longs (`/ru-RU/`, `/fr-FR/`)
- [x] Filtrage du contenu par langue de publication (`language`/`lang` en introduction)

## 1) Statistiques personnelles des contributions GitHub

Ce qui est ajouté :

- Affichez le graphique de contribution GitHub à deux endroits : sur la page principale et dans la barre latérale.
- Séparez les SVG pour les thèmes clairs et sombres.

Où est-il configuré :

- `_config.yml` -> `nlo.github_chart`.
- Clés :
  - `home_image`
  - `home_image_dark`
  - `sidebar_image`
  - `sidebar_image_dark`

Comment il se met à jour automatiquement :

- Flux de travail : `.github/workflows/update-githubchart.yml`
- Lancement programmé : 0¤¤¤ (quotidiennement) et manuellement après 1¤¤¤.
- Génération : `tools/generate-githubchart.sh`
- Lorsque des modifications sont apportées, les fichiers suivants sont validés :
  - `assets/img/githubchart.svg`
  - `assets/img/githubchart-sidebar.svg`
  - `assets/img/githubchart-dark.svg`
  - `assets/img/githubchart-sidebar-dark.svg`

## 2) Panneau d'administration local (pour le développement uniquement)

Sur quoi est-il basé :

- Fonctionnalité d'édition de base : gem `jekyll-admin`.
- L'interface utilisateur sera transférée à l'intérieur du référentiel dans le dossier `admin/` pour la personnalisation pour NLO.

Comment cela marche-t-il:

- Le plugin `_plugins/jekyll-admin-fork.rb` monte :
  - `/admin` -> UI locale à partir de `admin/`
  - `/_api` -> API à partir de `JekyllAdmin::Server`
- Fichiers d'interface personnalisés :
  - `admin/index.html`
  - `admin/nlo-admin.css`
  - `admin/nlo-admin.js`

Lancement local :

```bash
bash tools/run.sh --admin
```

URL :

```text
http://127.0.0.1:4000/admin
```

Pourquoi pas en production :

- La fonction admin est destinée au circuit de développement local.
- La gemme `jekyll-admin` est connectée en tant que dépendance de développement (`Gemfile`, groupe `:development`).
- Un site de production public ne doit rester qu’une couche de contenu sans boucle ouverte éditeur/API.

## 3) Améliorations UX de la barre latérale et de l'éditeur

Ce qui est ajouté :

- `sidebar` a ajouté un bouton `ADMIN` bien visible dans le bloc de navigation inférieur (affiché uniquement dans `development`).
- Le bloc avatar dans la barre latérale a été augmenté d'environ 30 % pour un meilleur équilibre visuel.
- Pour l'avatar, des sources distinctes sont utilisées pour les thèmes clairs et sombres :
  - `nlo.branding.avatar_light`
  - `nlo.branding.avatar_dark`
- Le paramètre de cadre d'avatar est inclus dans la configuration (`nlo.branding.avatar_frame`) et prend en charge les styles :
  - `round`
  - `discord`
- Dans un thème sombre, le cadre de l'avatar est assombri pour correspondre au ton général de l'interface.

Ce qui a été modifié dans le panneau d'administration :

- Les paramètres `GitHub Chart Palette` et `Avatar Frame` sont intégrés dans la page `Configuration` comme des éléments normaux.
- Les deux blocs de paramètres sont affichés sur une seule ligne sur le bureau (deux colonnes) et sur les écrans étroits, ils sont repliés sur une seule colonne.
- Une info-bulle explicative a été ajoutée pour le champ `author` :
  - si vous spécifiez une clé de `_data/authors.yml`, l'auteur est affiché sous forme de lien vers le profil ;
  - si la clé n'est pas trouvée, la valeur `author` est affichée en texte brut.

## 4) Changement multilingue et linguistique

Ce qui est ajouté :

- `lang` en `_config.yml` prend désormais en charge plusieurs langues séparées par des virgules :
  - exemple : `lang: en, ru-RU, fr-FR`
- Si une langue est spécifiée, le sélecteur de langue ne s'affiche pas.
- Si plusieurs langues sont spécifiées :
  - jusqu'à 3 drapeaux de langues sont affichés ;
  - si la quantité est supérieure, le compact `select` s'affiche automatiquement.
- La signature du sélecteur est localisée (`Site version`) via les fichiers de paramètres régionaux.
- Les drapeaux sont stockés localement dans `assets/img/flags/`.
- En `title`, les drapeaux affichent le nom lisible de la langue (plutôt qu'un code technique comme `ru-RU`).

Techniquement:

- La normalisation de la langue et la sélection active de la langue sont incluses dans 0¤¤¤.
- L'interface utilisateur du sélecteur est implémentée dans `_includes/lang-switch.html` et est construite comme premier élément de la barre de navigation latérale (visuellement sous la forme `HOME`).
- Ajout d'une transparence douce (`opacity: 0.7`) et d'une mise en évidence de la langue active (survol/actif -> `opacity: 1`) aux drapeaux.

## 5) URL de langue et visibilité du contenu

Ce qui a changé dans l'URL :

- Le changement de langue utilise désormais des préfixes courts :
  - `http://127.0.0.1:4000/ru/`
  - `http://127.0.0.1:4000/fr/`
- Pour les pages d'accueil localisées, des permaliens courts sont spécifiés :
  - `ru-RU/index.md` -> `/ru/`
  - `fr-FR/index.md` -> `/fr/`
- Le détecteur de langue dans `_includes/lang.html` comprend désormais à la fois le code régional complet et l'alias du préfixe court.

Ce qui a changé dans le contenu :

- Ajout de `language` en avant-première aux publications (par exemple `language: en`, `language: ru-RU`).
- Les messages sont affichés uniquement pour la langue actuelle de l’interface.
- Les publications sans `language`/`lang` sont considérées comme du contenu à `default_lang` (rétrocompatible).

Où le filtrage fonctionne :

- Accueil (`home`)
- Archives (`archives`)
- Listes de catégories/tags (`categories`, `tags`)
- Pages d'une catégorie/balise spécifique
- Barre latérale : dernières mises à jour et balises de tendance
- Articles connexes dans l'article

## Quelle est la prochaine étape

Nous ajouterons les différences suivantes au même message au fur et à mesure que nous les mettrons en œuvre afin de maintenir une liste transparente et vérifiable des modifications.
