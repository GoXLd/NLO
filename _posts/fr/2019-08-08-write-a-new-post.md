---
title: Rédiger un nouvel article
language: fr-FR
translation_key: write-a-new-post
permalink: /posts/fr/write-a-new-post/
author: cotes
date: 2019-08-08 14:10:00 +0800
categories:
- Blogging
- Tutorial
tags:
- writing
render_with_liquid: false
---

Ce tutoriel explique comment rédiger un article dans le modèle _Chirpy_. Il vaut la peine d'être lu même si vous connaissez Jekyll, car de nombreuses fonctionnalités reposent sur des variables spécifiques.

## Rédiger avec dumalog

![dumalog](/assets/img/dumalog-black.svg){: .light w="240" }
![dumalog](/assets/img/dumalog-white.svg){: .dark w="240" }

Envie d'éviter le passe-partout ? [**dumalog**](https://github.com/GoXLd/dumalog) est un agent d'écriture IA qui transforme vos conversations de développement (Claude Code, Codex CLI) en articles Jekyll prêts à publier. Il stocke votre historique de discussions localement dans un index [memPalace](https://github.com/MemPalace/mempalace) et rédige des brouillons avec le bon Front Matter — y compris les champs `language` / `translation_key` de NLO —, si bien que les brouillons sont directement publiables.

```bash
curl -fsSL https://raw.githubusercontent.com/GoXLd/dumalog/main/install.sh | bash
dumalog setup            # trouver votre blog et apprendre son style
dumalog write "sujet"    # rédiger un brouillon (sans sujet : suggestions)
```

Tout s'exécute localement ; seul le contexte anonymisé nécessaire au brouillon est envoyé au modèle configuré. La suite de ce guide décrit le Front Matter et le Markdown que dumalog remplit pour vous — utile pour retoucher un brouillon à la main.

## Nom et chemin

Créez un fichier nommé `YYYY-MM-DD-TITLE.EXTENSION`{: .filepath} dans le dossier `_posts`{: .filepath} à la racine. `EXTENSION`{: .filepath} doit être `md`{: .filepath} ou `markdown`{: .filepath}. Pour gagner du temps, le plugin [`Jekyll-Compose`](https://github.com/jekyll/jekyll-compose) peut créer les fichiers.

## Front Matter

Remplissez le [Front Matter](https://jekyllrb.com/docs/front-matter/) en haut de l'article :

```yaml
---
title: TITLE
date: YYYY-MM-DD HH:MM:SS +/-TTTT
categories: [TOP_CATEGORY, SUB_CATEGORY]
tags: [TAG]     # TAG names should always be lowercase
---
```

> Le _layout_ des articles vaut `post` par défaut ; inutile d'ajouter la variable _layout_ dans le Front Matter.
{: .prompt-tip }

### Fuseau horaire de la date

Pour enregistrer la date de publication avec précision, définissez le `timezone` dans `_config.yml`{: .filepath} et indiquez aussi le fuseau horaire de l'article dans son champ `date`. Format : `+/-TTTT`, par ex. `+0800`.

### Catégories et balises

Chaque article accepte jusqu'à deux `categories` et un nombre illimité de `tags`. Par exemple :

```yaml
---
categories: [Animal, Insect]
tags: [bee]
---
```

### Informations sur l'auteur

Les informations sur l'auteur n'ont généralement pas besoin de figurer dans le _Front Matter_ ; par défaut, elles proviennent de `social.name` et de la première entrée de `social.links` dans la configuration. Pour les remplacer, ajoutez l'auteur dans `_data/authors.yml` (créez le fichier s'il n'existe pas) :

```yaml
<author_id>:
  name: <full name>
  twitter: <twitter_of_author>
  url: <homepage_of_author>
```
{: file="_data/authors.yml" }

Utilisez ensuite `author` pour une entrée unique ou `authors` pour plusieurs :

```yaml
---
author: <author_id>                     # for single entry
# or
authors: [<author1_id>, <author2_id>]   # for multiple entries
---
```

La clé `author` peut aussi contenir plusieurs entrées.

> Lire l'auteur depuis `_data/authors.yml`{: .filepath } ajoute à la page la balise méta `twitter:creator`, qui enrichit les [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/guides/getting-started#card-and-content-attribution) et aide au référencement.
{: .prompt-info }

### Description de l'article

Par défaut, les premiers mots de l'article apparaissent sur la page d'accueil, dans la section _Further Reading_ et dans le flux RSS. Pour remplacer cet extrait généré automatiquement, définissez le champ `description` dans le _Front Matter_ :

```yaml
---
description: Short summary of the post.
---
```

Le texte `description` s'affiche aussi sous le titre sur la page de l'article.

## Table des matières

Par défaut, la table des matières (TOC) s'affiche dans le panneau droit. Pour la désactiver globalement, mettez `toc: false` dans `_config.yml`{: .filepath}. Pour la désactiver sur un seul article, ajoutez à son [Front Matter](https://jekyllrb.com/docs/front-matter/) :

```yaml
---
toc: false
---
```

## Commentaires

Les commentaires se règlent globalement via l'option `comments.provider` dans `_config.yml`{: .filepath}. Une fois un fournisseur choisi, les commentaires sont activés sur tous les articles.

Pour les désactiver sur un article, ajoutez à son **Front Matter** :

```yaml
---
comments: false
---
```

## Médias

Dans _Chirpy_, les images, l'audio et la vidéo sont des ressources multimédias.

### Préfixe d'URL
{: #url-prefix }

Pour éviter de répéter le même préfixe d'URL sur plusieurs ressources d'un article, définissez l'un de ces deux paramètres.

- Si un CDN héberge vos médias, indiquez `cdn` dans `_config.yml`{: .filepath }. Les URL des ressources de l'avatar du site et des articles sont alors préfixées par le domaine du CDN.

  ```yaml
  cdn: https://cdn.com
  ```
  {: file='_config.yml' .nolineno }

- Pour définir un préfixe de chemin pour l'article/la page en cours, utilisez `media_subpath` dans son _Front Matter_ :

  ```yaml
  ---
  media_subpath: /path/to/media/
  ---
  ```
  {: .nolineno }

`site.cdn` et `page.media_subpath` se combinent pour former l'URL finale : `[site.cdn/][page.media_subpath/]file.ext`

### Images

#### Légende

Mettez en italique la ligne juste après une image pour en faire une légende affichée sous l'image :

```markdown
![img-description](/path/to/image)
_Image Caption_
```
{: .nolineno}

#### Taille

Définissez la largeur et la hauteur de chaque image pour éviter que la mise en page ne bouge au chargement.

```markdown
![Desktop View](/assets/img/sample/mockup.png){: width="700" height="400" }
```
{: .nolineno}

> Pour un SVG, spécifiez au moins sa _width_, sinon il ne sera pas rendu.
{: .prompt-info }

Depuis _Chirpy v5.0.0_, `height` et `width` peuvent être abrégés (`h`, `w`). Ceci équivaut à l'exemple ci-dessus :

```markdown
![Desktop View](/assets/img/sample/mockup.png){: w="700" h="400" }
```
{: .nolineno}

#### Position

Les images sont centrées par défaut ; utilisez la classe `normal`, `left` ou `right` pour les positionner.

> Une fois la position spécifiée, n'ajoutez pas de légende à l'image.
{: .prompt-warning }

- **Position normale**

  L'image est alignée à gauche dans l'exemple ci-dessous :

  ```markdown
  ![Desktop View](/assets/img/sample/mockup.png){: .normal }
  ```
  {: .nolineno}

- **Flotter à gauche**

  ```markdown
  ![Desktop View](/assets/img/sample/mockup.png){: .left }
  ```
  {: .nolineno}

- **Flotter à droite**

  ```markdown
  ![Desktop View](/assets/img/sample/mockup.png){: .right }
  ```
  {: .nolineno}

#### Mode sombre/clair

Les images peuvent suivre le thème sombre/clair. Préparez deux images et attribuez à chacune la classe `dark` ou `light` :

```markdown
![Light mode only](/path/to/light-mode.png){: .light }
![Dark mode only](/path/to/dark-mode.png){: .dark }
```

#### Ombre

Les captures d'écran de fenêtres de programme peuvent porter un effet d'ombre :

```markdown
![Desktop View](/assets/img/sample/mockup.png){: .shadow }
```
{: .nolineno}

#### Image d'aperçu

Pour une image en haut de l'article, fournissez une image en `1200 x 630`. Si le rapport n'est pas `1.91 : 1`, l'image sera redimensionnée et recadrée.

Définissez ensuite les attributs de l'image :

```yaml
---
image:
  path: /path/to/image
  alt: image alternative text
---
```

[`media_subpath`](#url-prefix) s'applique aussi à l'image d'aperçu : une fois défini, `path` n'a besoin que du nom du fichier.

Pour les cas simples, utilisez `image` seul pour définir le chemin :

```yml
---
image: /path/to/image
---
```

#### LQIP

Pour les images d'aperçu :

```yaml
---
image:
  lqip: /path/to/lqip-file # or base64 URI
---
```

> Vous pouvez voir le LQIP sur l'aperçu de l'article « [Text and Typography](../text-and-typography/) ».

Pour les images normales :

```markdown
![Image description](/path/to/image){: lqip="/path/to/lqip-file" }
```
{: .nolineno }

### Plateformes de réseaux sociaux

Intégrez de la vidéo/audio depuis des réseaux sociaux ainsi :

```liquid
{% include embed/{Platform}.html id='{ID}' %}
```

`Platform` est le nom de la plateforme en minuscules et `ID` l'identifiant de la vidéo.

Le tableau montre comment lire les deux paramètres depuis une URL, et quelles plateformes sont prises en charge.

| URL de la vidéo | Plate-forme | ID |
| -------------------------------------------------------------------------------------------------------------------------- | ---------- | :----------------------- |
| [https://www.**youtube**.com/watch?v=**H-B46URT4mg**](https://www.youtube.com/watch?v=H-B46URT4mg) | `youtube` | `H-B46URT4mg` |
| [https://www.**twitch**.tv/videos/**1634779211**](https://www.twitch.tv/videos/1634779211) | `twitch` | `1634779211` |
| [https://www.**bilibili**.com/video/**BV1Q44y1B7Wf**](https://www.bilibili.com/video/BV1Q44y1B7Wf) | `bilibili` | `BV1Q44y1B7Wf` |
| [https://www.open.**spotify**.com/track/**3OuMIIFP5TxM8tLXMWYPGV**](https://open.spotify.com/track/3OuMIIFP5TxM8tLXMWYPGV) | `spotify` | `3OuMIIFP5TxM8tLXMWYPGV` |

Spotify prend en charge des paramètres supplémentaires :

- `compact` — afficher le lecteur compact (ex. `{% include embed/spotify.html id='3OuMIIFP5TxM8tLXMWYPGV' compact=1 %}`) ;
- `dark` — forcer le thème sombre (ex. `{% include embed/spotify.html id='3OuMIIFP5TxM8tLXMWYPGV' dark=1 %}`).

### Fichiers vidéo

Pour intégrer directement un fichier vidéo :

```liquid
{% include embed/video.html src='{URL}' %}
```

`URL` pointe vers un fichier vidéo, par ex. `/path/to/sample/video.mp4`.

La vidéo intégrée accepte aussi ces attributs :

- `poster='/path/to/poster.png'` — image d'affiche montrée pendant le téléchargement de la vidéo ;
- `title='Text'` — titre affiché sous la vidéo, comme pour les images ;
- `autoplay=true` — la vidéo démarre dès que possible ;
- `loop=true` — retour au début une fois la fin atteinte ;
- `muted=true` — le son est coupé au départ ;
- `types` — extensions de formats vidéo supplémentaires séparées par `|`. Ces fichiers doivent se trouver dans le même répertoire que le fichier principal.

Un exemple avec tous ces attributs :

```liquid
{%
  include embed/video.html
  src='/path/to/video.mp4'
  types='ogg|mov'
  poster='poster.png'
  title='Demo video'
  autoplay=true
  loop=true
  muted=true
%}
```

### Fichiers audio

Pour intégrer directement un fichier audio :

```liquid
{% include embed/audio.html src='{URL}' %}
```

`URL` pointe vers un fichier audio, par ex. `/path/to/audio.mp3`.

L'audio intégré accepte aussi ces attributs :

- `title='Text'` — titre affiché sous l'audio, comme pour les images ;
- `types` — extensions de formats audio supplémentaires séparées par `|`. Ces fichiers doivent se trouver dans le même répertoire que le fichier principal.

Un exemple avec tous ces attributs :

```liquid
{%
  include embed/audio.html
  src='/path/to/audio.mp3'
  types='ogg|wav|aac'
  title='Demo audio'
%}
```

## Articles épinglés

Épinglez un ou plusieurs articles en haut de la page d'accueil (les articles épinglés sont triés par date de publication, du plus récent au plus ancien). Activez avec :

```yaml
---
pin: true
---
```

## Invites

Les invites existent en quatre types : `tip`, `info`, `warning` et `danger`. Ajoutez la classe `prompt-{type}` à une citation. Par exemple, une invite `info` :

```md
> Example line for prompt.
{: .prompt-info }
```
{: .nolineno }

## Syntaxe

### Code en ligne

```md
`inline code part`
```
{: .nolineno }

### Mise en évidence de chemin de fichier

```md
`/path/to/a/file.extend`{: .filepath}
```
{: .nolineno }

### Bloc de code

Créez un bloc de code avec ```` ``` ```` :

````md
```
Il s'agit d'un extrait de code en texte brut.
```
````

#### Spécifier la langue

Utilisez ```` ```{language} ```` pour la coloration syntaxique :

````markdown
```yaml
key: value
```
````

> Le tag Jekyll `{% highlight %}` n'est pas compatible avec ce thème.
{: .prompt-danger }

#### Numéro de ligne

Toutes les langues sauf `plaintext`, `console` et `terminal` affichent les numéros de ligne par défaut. Pour les masquer, ajoutez la classe `nolineno` :

````markdown
```shell
echo 'Plus de numéros de ligne !'
```
{: .nolineno }
````

#### Spécifier le nom de fichier

Le langage du code s'affiche en haut du bloc. Pour le remplacer par un nom de fichier, ajoutez l'attribut `file` :

````markdown
```shell
# contenu
```
{: file="path/to/file" }
````

#### Code Liquid

Pour afficher un extrait **Liquid**, entourez-le de `{% raw %}` et `{% endraw %}` :

````markdown
{% raw %}
```liquid
{% if product.title contains 'Pack' %}
  Le titre de ce produit contient le mot Pack.
{% endif %}
```
{% endraw %}
````

Ou ajoutez `render_with_liquid: false` (nécessite Jekyll 4.0 ou supérieur) au bloc YAML de l'article.

## Mathématiques

Les mathématiques sont rendues avec [**MathJax**][mathjax]. Pour des raisons de performance, elles ne sont pas chargées par défaut ; activez-les avec :

[mathjax]: https://www.mathjax.org/

```yaml
---
math: true
---
```

Une fois activées, ajoutez des équations avec cette syntaxe :

- **Bloc mathématique** : à ajouter avec `$$ math $$`, avec des lignes vides **obligatoires** avant et après `$$`.
  - **Numérotation d'équation** : avec `$$\begin{equation} math \end{equation}$$` ;
  - **Référence à la numérotation** : avec `\label{eq:label_name}` dans le bloc d'équation et `\eqref{eq:label_name}` dans le texte (voir l'exemple ci-dessous).
- **Mathématiques en ligne** (dans le texte) : avec `$$ math $$` sans ligne vide avant ni après `$$`.
- **Mathématiques en ligne** (dans les listes) : avec `\$$ math $$`.

```markdown
<!-- Block math, keep all blank lines -->

$$
LaTeX_math_expression
$$

<!-- Equation numbering, keep all blank lines  -->

$$
\begin{equation}
  LaTeX_math_expression
  \label{eq:label_name}
\end{equation}
$$

Can be referenced as \eqref{eq:label_name}.

<!-- Inline math in lines, NO blank lines -->

"Lorem ipsum dolor sit amet, $$ LaTeX_math_expression $$ consectetur adipiscing elit."

<!-- Inline math in lists, escape the first `$` -->

1. \$$ LaTeX_math_expression $$
2. \$$ LaTeX_math_expression $$
3. \$$ LaTeX_math_expression $$
```

> Depuis `v7.0.0`, les options de configuration de **MathJax** ont été déplacées dans le fichier `assets/js/data/mathjax.js`{: .filepath }, et vous pouvez les modifier au besoin, par exemple en ajoutant des [extensions][mathjax-exts].  
> Si vous construisez le site via `chirpy-starter`, copiez ce fichier depuis le répertoire d'installation de la gem (trouvez-le avec `bundle info --path jekyll-theme-chirpy`) dans le même répertoire de votre dépôt.
{: .prompt-tip }

[mathjax-exts]: https://docs.mathjax.org/en/latest/input/tex/extensions/index.html

## Mermaid

[**Mermaid**](https://github.com/mermaid-js/mermaid) est un outil de génération de diagrammes. Activez-le par article via le bloc YAML :

```yaml
---
mermaid: true
---
```

Entourez ensuite le code du graphe de ```` ```mermaid ```` et ```` ``` ````, comme tout autre langage.

## En savoir plus

Pour en savoir plus sur les articles Jekyll, consultez [Jekyll Docs: Posts](https://jekyllrb.com/docs/posts/).
