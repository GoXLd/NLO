---
title: Rédiger un nouvel article
language: fr-FR
translation_key: write-a-new-post
author: cotes
date: 2019-08-08 14:10:00 +0800
categories:
- Blogging
- Tutorial
tags:
- writing
render_with_liquid: false
---

Ce tutoriel vous expliquera comment rédiger un article dans le modèle _Chirpy_, et il vaut la peine d'être lu même si vous avez déjà utilisé Jekyll, car de nombreuses fonctionnalités nécessitent la définition de variables spécifiques.

## Nom et chemin

Créez un nouveau fichier nommé `YYYY-MM-DD-TITLE.EXTENSION`{: .filepath} et placez-le dans le dossier `_posts`{: .filepath} à la racine du projet. Notez que `EXTENSION`{: .filepath} doit être `md`{: .filepath} ou `markdown`{: .filepath}. Pour gagner du temps, vous pouvez utiliser le plugin [`Jekyll-Compose`](https://github.com/jekyll/jekyll-compose).

## Front Matter

En gros, vous devez remplir le [Front Matter](https://jekyllrb.com/docs/front-matter/) comme ci-dessous en haut du message :

```yaml
---
title: TITLE
date: YYYY-MM-DD HH:MM:SS +/-TTTT
categories: [TOP_CATEGORY, SUB_CATEGORY]
tags: [TAG]     # TAG names should always be lowercase
---
```

> Le _layout_ des articles a été défini sur `post` par défaut, il n'est donc pas nécessaire d'ajouter la variable _layout_ dans le bloc Front Matter.
{: .prompt-tip }

### Fuseau horaire de la date

Pour enregistrer avec précision la date de sortie d'une publication, vous devez non seulement configurer le `timezone` de `_config.yml`{: .filepath} mais également fournir le fuseau horaire de la publication dans la variable `date` de son bloc Front Matter. Format : `+/-TTTT`, par ex. `+0800`.

### Catégories et balises

Les `categories` de chaque message sont conçus pour contenir jusqu'à deux éléments, et le nombre d'éléments dans `tags` peut être compris entre zéro et l'infini. Par exemple:

```yaml
---
categories: [Animal, Insect]
tags: [bee]
---
```

### Informations sur l'auteur

Les informations sur l'auteur du message n'ont généralement pas besoin d'être renseignées dans le _Front Matter_ , elles seront obtenues à partir des variables `social.name` et de la première entrée de `social.links` du fichier de configuration par défaut. Mais vous pouvez également le remplacer comme suit :

Ajout des informations sur l'auteur en `_data/authors.yml` (Si votre site internet ne possède pas ce fichier, n'hésitez pas à en créer un).

```yaml
<author_id>:
  name: <full name>
  twitter: <twitter_of_author>
  url: <homepage_of_author>
```
{: file="_data/authors.yml" }

Et puis utilisez `author` pour spécifier une seule entrée ou `authors` pour spécifier plusieurs entrées :

```yaml
---
author: <author_id>                     # for single entry
# or
authors: [<author1_id>, <author2_id>]   # for multiple entries
---
```

Cela dit, la clé `author` peut également identifier plusieurs entrées.

> L'avantage de lire les informations sur l'auteur du fichier `_data/authors.yml`{: .filepath } est que la page aura la balise méta `twitter:creator`, qui enrichit le [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/guides/getting-started#card-and-content-attribution) et est bonne pour le référencement.
{: .prompt-info }

### Description du poste

Par défaut, les premiers mots du post sont utilisés sur la page d'accueil, dans la section _Further Reading_ et dans le flux RSS. Si vous ne souhaitez pas utiliser cette description générée automatiquement, définissez `description` dans le _Front Matter_ :

```yaml
---
description: Short summary of the post.
---
```

De plus, le texte `description` sera également affiché sous le titre du message sur la page du message.

## Table des matières

Par défaut, la table des matières (TOC) est affichée dans le panneau droit du post. Pour la désactiver globalement, définissez `toc: false` dans `_config.yml`{: .filepath}. Pour la désactiver uniquement pour un post, ajoutez ceci dans son [Front Matter](https://jekyllrb.com/docs/front-matter/) :

```yaml
---
toc: false
---
```

## Commentaires

Le paramètre global des commentaires est défini par l'option `comments.provider` dans le fichier `_config.yml`{: .filepath}. Une fois qu'un système de commentaires est sélectionné pour cette variable, les commentaires seront activés pour toutes les publications.

Si vous souhaitez fermer le commentaire d'une publication spécifique, ajoutez ce qui suit au **Front Matter** de la publication :

```yaml
---
comments: false
---
```

## Médias

Nous faisons référence aux images, à l'audio et à la vidéo comme ressources multimédias dans _Chirpy_.

### Préfixe d'URL
{: #url-prefix }

De temps en temps, nous devons définir des préfixes d'URL en double pour plusieurs ressources dans une publication, ce qui est une tâche ennuyeuse que vous pouvez éviter en définissant deux paramètres.

- Si vous utilisez un CDN pour héberger des fichiers multimédias, vous pouvez spécifier le `cdn` dans `_config.yml`{: .filepath }. Les URL des ressources multimédias pour l'avatar du site et les publications sont ensuite préfixées par le nom de domaine CDN.

  ```yaml
  cdn: https://cdn.com
  ```
  {: file='_config.yml' .nolineno }

- Pour spécifier le préfixe du chemin de ressource pour la plage de publications/pages actuelle, définissez `media_subpath` dans le _Front Matter_ de la publication :

  ```yaml
  ---
  media_subpath: /path/to/media/
  ---
  ```
  {: .nolineno }

Les options `site.cdn` et `page.media_subpath` peuvent être utilisées individuellement ou en combinaison pour composer de manière flexible l'URL finale de la ressource : `[site.cdn/][page.media_subpath/]file.ext`

### Images

#### Légende

Ajoutez de l'italique à la ligne suivante d'une image, elle deviendra alors la légende et apparaîtra en bas de l'image :

```markdown
![img-description](/path/to/image)
_Image Caption_
```
{: .nolineno}

#### Taille

Pour éviter que la présentation du contenu de la page ne change lorsque l'image est chargée, nous devons définir la largeur et la hauteur de chaque image.

```markdown
![Desktop View](/assets/img/sample/mockup.png){: width="700" height="400" }
```
{: .nolineno}

> Pour un SVG, vous devez au moins spécifier sa _width_, sinon il ne sera pas rendu.
{: .prompt-info }

À partir de _Chirpy v5.0.0_, `height` et `width` prennent en charge les abréviations (`height` → `h`, `width` → `w`). L'exemple suivant a le même effet que celui ci-dessus :

```markdown
![Desktop View](/assets/img/sample/mockup.png){: w="700" h="400" }
```
{: .nolineno}

#### Position

Par défaut, l'image est centrée, mais vous pouvez spécifier la position en utilisant l'une des classes `normal`, `left` et `right`.

> Une fois la position spécifiée, la légende de l’image ne doit pas être ajoutée.
{: .prompt-warning }

- **Position normale**

  L'image sera alignée à gauche dans l'exemple ci-dessous :

  ```markdown
  ![Desktop View](/assets/img/sample/mockup.png){: .normal }
  ```
  {: .nolineno}

- **Flottez vers la gauche**

  ```markdown
  ![Desktop View](/assets/img/sample/mockup.png){: .left }
  ```
  {: .nolineno}

- **Flottez vers la droite**

  ```markdown
  ![Desktop View](/assets/img/sample/mockup.png){: .right }
  ```
  {: .nolineno}

#### Mode sombre/clair

Vous pouvez faire en sorte que les images suivent les préférences de thème en mode sombre/clair. Cela nécessite de préparer deux images, une pour le mode sombre et une pour le mode clair, puis de leur attribuer une classe spécifique (`dark` ou `light`) :

```markdown
![Light mode only](/path/to/light-mode.png){: .light }
![Dark mode only](/path/to/dark-mode.png){: .dark }
```

#### Ombre

Les captures d'écran de la fenêtre du programme peuvent être considérées comme montrant l'effet d'ombre :

```markdown
![Desktop View](/assets/img/sample/mockup.png){: .shadow }
```
{: .nolineno}

#### Image d'aperçu

Si vous souhaitez ajouter une image en haut de la publication, veuillez fournir une image avec une résolution de `1200 x 630`. Veuillez noter que si le rapport hauteur/largeur de l'image n'atteint pas `1.91 : 1`, l'image sera redimensionnée et recadrée.

Connaissant ces prérequis, vous pouvez commencer à définir l'attribut de l'image :

```yaml
---
image:
  path: /path/to/image
  alt: image alternative text
---
```

Notez que le [`media_subpath`](#url-prefix) peut également être transmis à l'image d'aperçu, c'est-à-dire que lorsqu'il a été défini, l'attribut `path` n'a besoin que du nom du fichier image.

Pour une utilisation simple, vous pouvez également simplement utiliser `image` pour définir le chemin.

```yml
---
image: /path/to/image
---
```

#### LQIP

Pour les images d'aperçu :

```yaml
---
image:
  lqip: /path/to/lqip-file # or base64 URI
---
```

> Vous pouvez observer LQIP dans l'image d'aperçu du message \"[Text and Typography](../text-and-typography/)\".

Pour les images normales :

```markdown
![Image description](/path/to/image){: lqip="/path/to/lqip-file" }
```
{: .nolineno }

### Plateformes de médias sociaux

Vous pouvez intégrer de la vidéo/audio à partir de plateformes de réseaux sociaux avec la syntaxe suivante :

```liquid
{% include embed/{Platform}.html id='{ID}' %}
```

Où `Platform` est la minuscule du nom de la plateforme et `ID` est l'identifiant de la vidéo.

Le tableau suivant montre comment obtenir les deux paramètres dont nous avons besoin dans une URL vidéo/audio donnée, et vous pouvez également connaître les plates-formes vidéo actuellement prises en charge.

| URL de la vidéo | Plate-forme | IDENTIFIANT |
| -------------------------------------------------------------------------------------------------------------------------- | ---------- | :----------------------- |
| [https://www.**youtube**.com/watch?v=**H-B46URT4mg**](https://www.youtube.com/watch?v=H-B46URT4mg) | `youtube` | `H-B46URT4mg` |
| [https://www.**twitch**.tv/videos/**1634779211**](https://www.twitch.tv/videos/1634779211) | `twitch` | `1634779211` |
| [https://www.**bilibili**.com/video/**BV1Q44y1B7Wf**](https://www.bilibili.com/video/BV1Q44y1B7Wf) | `bilibili` | `BV1Q44y1B7Wf` |
| [https://www.open.**spotify**.com/track/**3OuMIIFP5TxM8tLXMWYPGV**](https://open.spotify.com/track/3OuMIIFP5TxM8tLXMWYPGV) | `spotify` | `3OuMIIFP5TxM8tLXMWYPGV` |

Spotify prend en charge certains paramètres supplémentaires :

- `compact` - pour afficher le lecteur compact à la place (ex. `{% include embed/spotify.html id='3OuMIIFP5TxM8tLXMWYPGV' compact=1 %}`) ;
- `dark` - pour forcer le thème sombre (ex. `{% include embed/spotify.html id='3OuMIIFP5TxM8tLXMWYPGV' dark=1 %}`).

### Fichiers vidéo

Si vous souhaitez intégrer directement un fichier vidéo, utilisez la syntaxe suivante :

```liquid
{% include embed/video.html src='{URL}' %}
```

Où `URL` est une URL vers un fichier vidéo, par ex. `/path/to/sample/video.mp4`.

Vous pouvez également spécifier des attributs supplémentaires pour le fichier vidéo intégré. Voici une liste complète des attributs autorisés.

- `poster='/path/to/poster.png'` — image d'affiche pour une vidéo qui s'affiche pendant le téléchargement de la vidéo
- `title='Text'` — titre d'une vidéo qui apparaît sous la vidéo et ressemble à celui des images
- `autoplay=true` — la lecture de la vidéo commence automatiquement dès que possible
- `loop=true` — revient automatiquement au début une fois la fin de la vidéo atteinte
- `muted=true` — le son sera initialement réduit au silence
- `types` — spécifiez les extensions de formats vidéo supplémentaires séparées par `|`. Assurez-vous que ces fichiers existent dans le même répertoire que votre fichier vidéo principal.

Prenons un exemple utilisant tout ce qui précède :

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

Si vous souhaitez intégrer directement un fichier audio, utilisez la syntaxe suivante :

```liquid
{% include embed/audio.html src='{URL}' %}
```

Où `URL` est une URL vers un fichier audio, par ex. `/path/to/audio.mp3`.

Vous pouvez également spécifier des attributs supplémentaires pour le fichier audio intégré. Voici une liste complète des attributs autorisés.

- `title='Text'` — titre d'un audio qui apparaît sous l'audio et ressemble à celui des images
- `types` — spécifiez les extensions de formats audio supplémentaires séparées par `|`. Assurez-vous que ces fichiers existent dans le même répertoire que votre fichier audio principal.

Prenons un exemple utilisant tout ce qui précède :

```liquid
{%
  include embed/audio.html
  src='/path/to/audio.mp3'
  types='ogg|wav|aac'
  title='Demo audio'
%}
```

## Messages épinglés

Vous pouvez épingler une ou plusieurs publications en haut de la page d'accueil, et les publications corrigées sont triées dans l'ordre inverse en fonction de leur date de publication. Activer par :

```yaml
---
pin: true
---
```

## Invites

Il existe plusieurs types d'invites : `tip`, `info`, `warning` et `danger`. Ils peuvent être générés en ajoutant la classe `prompt-{type}` au blockquote. Par exemple, définissez une invite de type `info` comme suit :

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

### Point culminant du chemin de fichier

```md
`/path/to/a/file.extend`{: .filepath}
```
{: .nolineno }

### Bloc de code

Les symboles Markdown ```` ``` ```` peuvent facilement créer un bloc de code comme suit :

````md
```
Il s'agit d'un extrait de code en texte brut.
```
````

#### Spécification de la langue

En utilisant ```` ```{language} ````, vous obtiendrez un bloc de code avec une coloration syntaxique :

````markdown
```yaml
clé : valeur
```
````

> Le tag Jekyll `{% highlight %}` n'est pas compatible avec ce thème.
{: .prompt-danger }

#### Numéro de ligne

Par défaut, toutes les langues sauf `plaintext`, `console` et `terminal` afficheront les numéros de ligne. Lorsque vous souhaitez masquer le numéro de ligne d'un bloc de code, ajoutez-y la classe `nolineno` :

````markdown
```shell
echo 'Plus de numéros de ligne !'
```
{: .nolineno }
````

#### Spécification du nom de fichier

Vous avez peut-être remarqué que le langage du code sera affiché en haut du bloc de code. Si vous souhaitez le remplacer par le nom du fichier, vous pouvez ajouter l'attribut `file` pour obtenir cela :

````markdown
```shell
# contenu
```
{: file="path/to/file" }
````

#### Codes liquides

Si vous souhaitez afficher l'extrait **Liquide**, entourez le code liquide entre `{% raw %}` et `{% endraw %}` :

````markdown
{% raw %}
```liquid
{% if product.title contains 'Pack' %}
  Le titre de ce produit contient le mot Pack.
{% endif %}
```
{% endraw %}
````

Ou en ajoutant `render_with_liquid: false` (nécessite Jekyll 4.0 ou supérieur) au bloc YAML de la publication.

## Mathématiques

Nous utilisons [**MathJax**][mathjax] pour générer des mathématiques. Pour des raisons de performances du site Web, la fonctionnalité mathématique ne sera pas chargée par défaut. Mais il peut être activé par :

[mathjax] : https://www.mathjax.org/

```yaml
---
math: true
---
```

Après avoir activé la fonctionnalité mathématique, vous pouvez ajouter des équations mathématiques avec la syntaxe suivante :

- **Le bloc mathématique** doit être ajouté avec `$$ math $$` avec des lignes vides **obligatoires** avant et après `$$`
  - **Insérer la numérotation de l'équation** doit être ajouté avec `$$\begin{equation} math \end{equation}$$`
  - **La numérotation des équations de référence** doit être effectuée avec `\label{eq:label_name}` dans le bloc d'équation et `\eqref{eq:label_name}` en ligne avec le texte (voir exemple ci-dessous)
- **Les calculs en ligne** (en lignes) doivent être ajoutés avec `$$ math $$` sans aucune ligne vide avant ou après `$$`
- **Les mathématiques en ligne** (dans les listes) doivent être ajoutées avec `\$$ math $$`

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

> À partir de `v7.0.0`, les options de configuration pour **MathJax** ont été déplacées vers le fichier `assets/js/data/mathjax.js`{: .filepath }, et vous pouvez modifier les options selon vos besoins, par exemple en ajoutant des [extensions][mathjax-exts].
> Si vous créez le site via `chirpy-starter`, copiez ce fichier depuis le répertoire d'installation de la gem (vérifiez avec `bundle info --path jekyll-theme-chirpy`) dans le même répertoire de votre dépôt.
{: .prompt-tip }

[mathjax-exts]: https://docs.mathjax.org/en/latest/input/tex/extensions/index.html

## Sirène

[**Mermaid**](https://github.com/mermaid-js/mermaid) est un excellent outil de génération de diagrammes. Pour l'activer sur votre publication, ajoutez ce qui suit au bloc YAML :

```yaml
---
mermaid: true
---
```

Ensuite, vous pouvez l'utiliser comme d'autres langages de démarque : entourez le code graphique avec ```` ```mermaid ```` and ```` ``` ````.

## Apprendre encore plus

Pour plus d'informations sur les publications Jekyll, visitez le [Jekyll Docs: Posts](https://jekyllrb.com/docs/posts/).
