# Quickstart: Suivi des paiements du personnel

**Feature**: 008-staff-payments
**Date**: 2026-02-07

Guide de test manuel pour valider la fonctionnalité.

## Prérequis

1. Avoir au moins 2 membres du personnel créés (ex: Marie - femme de ménage, Jean - jardinier)
2. Avoir quelques interventions planifiées (optionnel, pour tester le mode hybride)

## Scénarios de test

### US1: Enregistrer une prestation réalisée

#### Test 1.1: Création manuelle d'une prestation

1. Aller sur la page Personnel (`/staff`)
2. Cliquer sur un employé (ex: Marie)
3. Cliquer sur "Nouvelle prestation"
4. Remplir :
   - Date : aujourd'hui
   - Durée : 3 (heures)
   - Tarif : 15 €/h
   - Description : "Ménage complet"
5. Cliquer "Enregistrer"

**Résultat attendu** :
- ✅ Montant calculé automatiquement : 45,00 €
- ✅ La prestation apparaît dans l'historique
- ✅ Le solde de Marie passe à 45,00 €

#### Test 1.2: Création depuis une intervention complétée

1. Aller sur Planning (`/schedule`)
2. Marquer une intervention comme "Complétée"
3. Cliquer sur "Enregistrer la prestation"
4. Vérifier que les champs sont pré-remplis
5. Modifier la durée si nécessaire
6. Enregistrer

**Résultat attendu** :
- ✅ Champs pré-remplis (employé, date, description)
- ✅ Tarif pré-rempli avec le tarif par défaut de l'employé
- ✅ Lien avec l'intervention conservé

#### Test 1.3: Validation - heures négatives

1. Créer une nouvelle prestation
2. Saisir -2 dans le champ durée

**Résultat attendu** :
- ✅ Message d'erreur : "La durée doit être positive"
- ✅ Formulaire non soumis

#### Test 1.4: Avertissement tarif à 0€

1. Créer une nouvelle prestation
2. Saisir 0 dans le champ tarif
3. Soumettre

**Résultat attendu** :
- ✅ Avertissement affiché : "Tarif à 0€ - Travail bénévole ?"
- ✅ Possibilité de confirmer quand même

---

### US2: Consulter le solde dû

#### Test 2.1: Solde sur la liste du personnel

1. Aller sur Personnel (`/staff`)

**Résultat attendu** :
- ✅ Chaque employé affiche son solde (ex: "45,00 € dû")
- ✅ Solde 0€ affiché comme "À jour"
- ✅ Solde négatif affiché comme "Avance : -15,00 €"

#### Test 2.2: Total général sur le tableau de bord

1. Aller sur Accueil (`/`)

**Résultat attendu** :
- ✅ Widget "Total dû au personnel" visible
- ✅ Montant = somme des soldes individuels

---

### US3: Enregistrer un paiement

#### Test 3.1: Paiement simple

1. Aller sur la page d'un employé avec solde positif (ex: Marie - 45€)
2. Cliquer "Enregistrer un paiement"
3. Saisir :
   - Montant : 30 €
   - Date : aujourd'hui
   - Mode : Espèces
4. Enregistrer

**Résultat attendu** :
- ✅ Solde mis à jour : 45 - 30 = 15,00 €
- ✅ Paiement apparaît dans l'historique
- ✅ Toast succès affiché

#### Test 3.2: Paiement supérieur au solde (avance)

1. Employé avec solde de 15€
2. Enregistrer un paiement de 50€

**Résultat attendu** :
- ✅ Solde devient -35,00 € (avance)
- ✅ Pas de message d'erreur
- ✅ Affiché comme "Avance"

#### Test 3.3: Modes de paiement suggérés

1. Ouvrir le formulaire de paiement
2. Cliquer sur le champ "Mode de paiement"

**Résultat attendu** :
- ✅ Suggestions : Espèces, Virement, Chèque
- ✅ Possibilité de saisir autre chose (ex: "PayPal")

---

### US4: Définir le tarif horaire par défaut

#### Test 4.1: Modification du tarif

1. Aller sur Personnel (`/staff`)
2. Modifier la fiche de Marie
3. Changer "Tarif horaire" à 18 €/h
4. Enregistrer

**Résultat attendu** :
- ✅ Tarif sauvegardé
- ✅ Prestations existantes conservent leur ancien tarif

#### Test 4.2: Pré-remplissage du tarif

1. Créer une nouvelle prestation pour Marie

**Résultat attendu** :
- ✅ Champ tarif pré-rempli avec 18,00 €
- ✅ Modifiable

---

### US5: Consulter l'historique

#### Test 5.1: Historique chronologique

1. Aller sur la page d'un employé
2. Consulter la section "Historique"

**Résultat attendu** :
- ✅ Prestations et paiements mélangés
- ✅ Triés par date (récents en premier)
- ✅ Icône différente pour prestation vs paiement
- ✅ Prestations : date, description, durée, tarif, montant
- ✅ Paiements : date, montant, mode

---

### US6: Filtrer les prestations

#### Test 6.1: Filtre par période

1. Créer des prestations sur plusieurs mois
2. Filtrer par "Février 2026"

**Résultat attendu** :
- ✅ Seules les prestations de février affichées
- ✅ Compteur mis à jour

#### Test 6.2: Filtre par employé

1. Aller sur la liste globale des prestations
2. Filtrer par "Marie"

**Résultat attendu** :
- ✅ Seules les prestations de Marie affichées

---

## Checklist validation finale

- [ ] Toutes les prestations sont calculées correctement (durée × tarif)
- [ ] Les soldes sont exacts (prestations - paiements)
- [ ] Le total général sur le dashboard est correct
- [ ] Les erreurs de validation fonctionnent
- [ ] L'historique est complet et bien trié
- [ ] Les filtres fonctionnent
- [ ] Les messages sont en français
- [ ] Navigation au clavier possible
- [ ] États de chargement visibles
- [ ] États vides avec message approprié
