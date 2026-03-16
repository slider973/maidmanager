# Quickstart: Portail Personnel

**Feature**: 009-staff-portal
**Date**: 2026-02-07

Guide de test manuel pour valider la fonctionnalité.

## Prérequis

1. Avoir au moins 1 membre du personnel créé (ex: Marie - femme de ménage)
2. Avoir au moins 1 client créé (ex: Famille Dupont)
3. Le membre du personnel doit avoir un email valide

## Scénarios de test

### US1: Créer et lier un compte staff

#### Test 1.1: Invitation d'un membre du personnel

1. Se connecter en tant que gestionnaire
2. Aller sur Personnel (`/staff`)
3. Cliquer sur Marie (femme de ménage)
4. Cliquer sur "Créer un compte"
5. Vérifier que l'email de Marie est pré-rempli
6. Cliquer "Envoyer l'invitation"

**Résultat attendu** :
- ✅ Message de confirmation : "Invitation envoyée"
- ✅ Badge "Compte en attente" affiché sur la fiche
- ✅ Email d'invitation reçu par Marie

#### Test 1.2: Première connexion staff

1. Ouvrir l'email d'invitation reçu
2. Cliquer sur le lien d'invitation
3. Définir un mot de passe (min 8 caractères)
4. Se connecter avec email + mot de passe

**Résultat attendu** :
- ✅ Accès au portail personnel (pas au dashboard gestionnaire)
- ✅ Nom de Marie affiché en haut
- ✅ Bouton "Pointer mon arrivée" visible

#### Test 1.3: Compte déjà existant

1. Gestionnaire essaie de créer un second compte pour Marie

**Résultat attendu** :
- ✅ Message d'erreur : "Un compte existe déjà pour cet employé"

---

### US2: Pointer (entrée/sortie)

#### Test 2.1: Pointer son arrivée

1. Se connecter en tant que Marie (staff)
2. Cliquer sur "Pointer mon arrivée"
3. Sélectionner le client "Famille Dupont"
4. Confirmer

**Résultat attendu** :
- ✅ Heure d'arrivée affichée (ex: "Arrivée à 08:15")
- ✅ Client affiché (ex: "Chez Famille Dupont")
- ✅ Bouton devient "Pointer ma sortie"
- ✅ Chronomètre visible (temps écoulé)

#### Test 2.2: Pointer sa sortie

1. Après quelques heures de travail
2. Cliquer sur "Pointer ma sortie"
3. Confirmer

**Résultat attendu** :
- ✅ Heure de sortie enregistrée
- ✅ Durée calculée (ex: "4h15")
- ✅ Prestation créée automatiquement (work_session)
- ✅ Message : "Pointage terminé - 4h15 enregistrées"

#### Test 2.3: Pointage en cours bloque nouveau pointage

1. Marie a déjà pointé son arrivée
2. Essayer de cliquer à nouveau sur "Pointer arrivée"

**Résultat attendu** :
- ✅ Message : "Vous êtes déjà pointé(e) chez Famille Dupont"
- ✅ Seul le bouton "Pointer sortie" est actif

#### Test 2.4: Alerte pointage manquant

1. Marie a oublié de pointer sa sortie hier
2. Elle se connecte aujourd'hui

**Résultat attendu** :
- ✅ Alerte visible : "Pointage incomplet le [date]"
- ✅ Lien pour régulariser
- ✅ Notification envoyée au gestionnaire

---

### US3: Enregistrer une action par pièce

#### Test 3.1: Ajouter une action

1. Marie est pointée comme présente
2. Cliquer sur "Ajouter une action"
3. Sélectionner la pièce "Salle de bain"
4. Sélectionner l'action "Nettoyage"
5. Optionnel : ajouter une note
6. Confirmer

**Résultat attendu** :
- ✅ Action ajoutée à la liste du jour
- ✅ Heure enregistrée automatiquement
- ✅ Compteur d'actions mis à jour

#### Test 3.2: Actions filtrées par poste

1. Marie (femme de ménage) ouvre le formulaire d'action
2. Vérifier les actions disponibles

**Résultat attendu** :
- ✅ Actions visibles : Nettoyage, Dépoussiérage, Aspirateur, etc.
- ✅ Actions NON visibles : Tonte, Taille (jardinier)

#### Test 3.3: Plusieurs actions sur même journée

1. Ajouter : Salle de bain → Nettoyage
2. Ajouter : Cuisine → Vaisselle
3. Ajouter : Chambre → Nettoyage

**Résultat attendu** :
- ✅ Liste chronologique des 3 actions
- ✅ Résumé : "3 actions effectuées"

---

### US4: Consulter son historique

#### Test 4.1: Historique de la semaine

1. Marie consulte "Mon historique"
2. Filtre par défaut : semaine en cours

**Résultat attendu** :
- ✅ Liste des jours travaillés
- ✅ Total heures par jour
- ✅ Total heures semaine
- ✅ Navigation semaine précédente/suivante

#### Test 4.2: Détail d'une journée

1. Cliquer sur un jour spécifique

**Résultat attendu** :
- ✅ Heure arrivée/sortie
- ✅ Client visité
- ✅ Liste des actions effectuées
- ✅ Durée totale

---

### US5: Vue gestionnaire du travail effectué

#### Test 5.1: Dashboard travail du jour

1. Se connecter en tant que gestionnaire
2. Aller sur "Travail effectué" (nouvelle section)

**Résultat attendu** :
- ✅ Liste des employés ayant travaillé aujourd'hui
- ✅ Heures par employé
- ✅ Nombre d'actions par employé
- ✅ Total général

#### Test 5.2: Détail par employé

1. Cliquer sur Marie dans la liste

**Résultat attendu** :
- ✅ Historique complet de Marie
- ✅ Pointages avec durées
- ✅ Actions par pièce
- ✅ Possibilité de corriger un pointage

#### Test 5.3: Correction de pointage

1. Un pointage de Marie semble erroné
2. Cliquer "Modifier"
3. Corriger l'heure de sortie
4. Sauvegarder

**Résultat attendu** :
- ✅ Pointage mis à jour
- ✅ Durée recalculée
- ✅ Work_session associée mise à jour
- ✅ Historique de modification visible

---

## Checklist validation finale

- [ ] Invitation email fonctionne
- [ ] Staff accède uniquement à son portail (pas au dashboard gestionnaire)
- [ ] Pointage entrée avec sélection client obligatoire
- [ ] Pointage sortie crée automatiquement une work_session
- [ ] Actions filtrées par poste du staff
- [ ] Historique personnel accessible
- [ ] Gestionnaire voit le travail de tous les employés
- [ ] Correction de pointage fonctionne
- [ ] Alertes pointages manquants affichées
- [ ] Interface mobile-friendly (responsive)
- [ ] Messages d'erreur en français
- [ ] Temps de réponse < 10s pour pointage
