# Research: Suivi des paiements du personnel

**Feature**: 008-staff-payments
**Date**: 2026-02-07

## Décisions techniques

### 1. Calculs monétaires précis

**Decision**: Stocker les montants en centimes (integer) et convertir à l'affichage

**Rationale**: Les calculs en virgule flottante peuvent introduire des erreurs d'arrondi (ex: 0.1 + 0.2 ≠ 0.3 en JS). En stockant en centimes (integer), on évite ces problèmes et on garantit la précision au centime près.

**Alternatives considered**:
- Stocker en DECIMAL côté PostgreSQL : Possible mais complexité ajoutée côté TypeScript
- Utiliser une lib comme decimal.js : Overkill pour ce cas d'usage simple
- ✅ **Retenu** : Integer en centimes (1500 = 15.00€), simple et fiable

**Implementation**:
```typescript
// Stockage : centimes (integer)
amount_cents: 4500 // = 45.00€

// Affichage
const formatMoney = (cents: number): string =>
  (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
```

### 2. Calcul du solde dû

**Decision**: Calculer le solde à la volée via une requête agrégée (SUM des prestations - SUM des paiements)

**Rationale**: Évite la duplication de données et garantit la cohérence. Pour l'échelle attendue (< 10k transactions), les performances restent excellentes.

**Alternatives considered**:
- Stocker le solde dans staff_members et le mettre à jour à chaque transaction : Risque de désynchronisation
- Vue matérialisée PostgreSQL : Complexité non justifiée pour cette échelle
- ✅ **Retenu** : Calcul à la volée, simple et toujours cohérent

**Implementation**:
```sql
SELECT
  staff_member_id,
  COALESCE(SUM(work_sessions.amount_cents), 0) - COALESCE(SUM(staff_payments.amount_cents), 0) AS balance_cents
FROM staff_members
LEFT JOIN work_sessions ON ...
LEFT JOIN staff_payments ON ...
GROUP BY staff_member_id
```

### 3. Lien prestation ↔ intervention planifiée

**Decision**: Lien optionnel via `schedule_entry_id` (nullable FK)

**Rationale**: Mode hybride confirmé lors de la clarification. La prestation peut être créée depuis une intervention complétée (pré-remplissage) ou manuellement (sans lien).

**Alternatives considered**:
- Lien obligatoire : Trop restrictif, empêche les prestations non planifiées
- Pas de lien du tout : Perte d'information, impossible de tracer
- ✅ **Retenu** : FK nullable, le meilleur des deux mondes

### 4. Format de saisie des heures

**Decision**: Saisie en format décimal (1.5 = 1h30), stockage en minutes (integer)

**Rationale**: Plus intuitif pour l'utilisateur que heures/minutes séparées. Stockage en minutes pour éviter les problèmes de virgule flottante.

**Alternatives considered**:
- Deux champs séparés (heures + minutes) : Plus de champs à gérer
- Stockage en heures décimales : Problèmes de précision potentiels
- ✅ **Retenu** : Saisie décimale, stockage minutes (1.5h → 90 minutes)

**Implementation**:
```typescript
// Saisie utilisateur : 1.5 (heures)
// Stockage : 90 (minutes)
const hoursToMinutes = (hours: number): number => Math.round(hours * 60)
const minutesToHours = (minutes: number): number => minutes / 60
```

### 5. Modes de paiement

**Decision**: Champ texte libre avec suggestions (autocomplete)

**Rationale**: Maximum de flexibilité. Les modes courants (Espèces, Virement, Chèque) sont suggérés mais l'utilisateur peut saisir autre chose.

**Alternatives considered**:
- Enum strict : Trop restrictif
- Liste déroulante fixe + "Autre" : Expérience utilisateur moins fluide
- ✅ **Retenu** : Champ texte avec datalist HTML pour suggestions

### 6. Navigation et UX

**Decision**: Nouvelle page `/staff/:id/payments` pour l'historique détaillé d'un employé

**Rationale**: Séparer la vue liste (Staff.tsx) de la vue détail permet une meilleure organisation. Le solde est affiché sur la liste, le détail complet sur la page dédiée.

**Structure de navigation**:
- `/staff` → Liste avec solde par employé + total général
- `/staff/:id/payments` → Historique complet (prestations + paiements) + formulaires

## Patterns existants réutilisés

| Pattern | Source | Application |
|---------|--------|-------------|
| Service + Store | `schedule.service.ts`, `scheduleStore.ts` | `work-session.service.ts`, `workSessionStore.ts` |
| Form validation | `validateScheduleEntry()` | `validateWorkSession()`, `validatePayment()` |
| List + Card | `ScheduleList.tsx`, `ScheduleCard.tsx` | `WorkSessionList.tsx`, `WorkSessionCard.tsx` |
| Filters | `ScheduleFilters.tsx` | Filtres période/employé |
| Toast notifications | `showSuccess()`, `showError()` | Réutilisation directe |
| Loading/Empty states | Pattern CSS existant | Réutilisation classes `.loading-container`, `.empty-state` |

## Risques identifiés

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Performance calcul solde avec beaucoup de données | Moyen | Index sur staff_member_id, pagination si nécessaire |
| Erreurs d'arrondi monétaire | Élevé | ✅ Résolu : stockage en centimes |
| Incohérence solde | Élevé | ✅ Résolu : calcul à la volée, pas de cache |

## Questions résolues

1. **Lien prestation ↔ planning** : Mode hybride (optionnel)
2. **Marquage paiement prestations** : Paiement global (pas d'affectation)
3. **Format heures** : Décimal en saisie, minutes en stockage
4. **Modes paiement** : Texte libre avec suggestions
