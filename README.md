# Mots Croisés 

Un jeu de mots croisés développé en **HTML, CSS et JavaScript pur**. L'utilisateur doit remplir une grille de mots croisés en cliquant sur les cases et en tapant les lettres. Le jeu vérifie automatiquement les réponses et donne un score final.

---

## 📖 Description

Ce projet est un jeu de mots croisés interactif jouable directement dans le navigateur. Le joueur doit trouver les mots correspondant aux définitions et les saisir dans la grille. La vérification se fait en temps réel : les lettres correctes deviennent vertes, les erreurs deviennent rouges. Un score final est calculé automatiquement.

---

## 🚀 Technologies utilisées

| Technologie     | Utilisation                                                          
|-----------------|----------------------------------------------------------------------|
| **HTML**        | Structure de la page et de la grille                                 |
| **CSS**         | Flexbox, Grid, animations, design responsive                         |
| **JavaScript ** | Logique du jeu, gestion des événements, vérification des réponses    |

---

## ✨ Fonctionnalités principales

### 🎮 Jeu
- Grille de mots croisés dynamique
- Navigation au clavier (flèches directionnelles)
- Vérification automatique des réponses
- Indices pour chaque mot (horizontal et vertical)
- Compteur de bonnes réponses
- Boutons "Vérifier" et "Réinitialiser"

### 📱 Interface
- Design responsive (adapté aux mobiles, tablettes et ordinateurs)
- Animations fluides
- Interface intuitive et épurée

---

## 🎯 Comment jouer ?

1. **Cliquez** sur une case de la grille
2. **Tapez une lettre** sur votre clavier
3. Utilisez les **flèches directionnelles** pour naviguer entre les cases
4. La case devient **verte** si la lettre est correcte, **rouge** sinon
5. Consultez les **indices** pour vous aider
6. Terminez la grille pour voir votre score final

---

## ⚠️ La difficulté principale : faire croiser les mots

La partie la plus complexe de ce projet a été de **faire se croiser les mots entre eux**.

### Le problème
Dans un mots croisés, les mots ne sont pas placés n'importe comment. Un mot horizontal et un mot vertical doivent parfois partager la même lettre à une certaine position. Il faut donc :
- Placer chaque mot à un endroit précis
- Vérifier que les lettres qui se croisent correspondent
- Éviter les conflits (une case ne peut pas avoir deux lettres différentes)

### Ma solution

J'ai créé un tableau (`wordsList`) où chaque mot a :
- Sa position de départ (coordonnées x, y)
- Sa direction (`across` = horizontal, `down` = vertical)
- Sa définition


---


## Lien vers la page GitHub Pages
https://github.com/doua-benali/benali_doua_mots_crois-es
