# Research: Supprimer les membres du personnel

**Feature**: 003-delete-staff
**Date**: 2026-02-06

## Technical Context Analysis

### Existing Infrastructure

**Decision**: Réutiliser l'infrastructure existante

**Rationale**: Le service `deleteStaffMember` existe déjà dans `staff.service.ts`. Les politiques RLS pour DELETE sont déjà en place. Le système de notification Toast est disponible.

**Code existant identifié**:
- `src/services/staff.service.ts` : fonction `deleteStaffMember(id: string)` - déjà implémentée
- `src/components/ui/Toast.tsx` : `showSuccess()`, `showError()` - disponibles
- `src/components/staff/StaffList.tsx` : mécanisme `refetch()` via `refetchSignal` - disponible

### Composant de Confirmation

**Decision**: Créer un nouveau composant `ConfirmDialog`

**Rationale**: Aucun composant de dialogue de confirmation n'existe dans le codebase. Un composant réutilisable sera plus maintenable qu'un dialogue inline dans chaque composant.

**Alternatives considered**:
1. **Dialogue inline dans StaffList** - Rejeté car non réutilisable
2. **Utiliser window.confirm()** - Rejeté car non stylisable et mauvaise UX
3. **Créer un composant ConfirmDialog réutilisable** - Choisi pour réutilisabilité

**Approche**:
- Composant modal accessible (focus trap, keyboard navigation)
- Props: `isOpen`, `title`, `message`, `onConfirm`, `onCancel`
- Fermeture sur Escape et clic à l'extérieur

### Pattern de Suppression

**Decision**: Suppression optimiste avec rollback

**Rationale**: L'UI répond immédiatement (meilleure UX), avec rollback si l'API échoue.

**Alternatives considered**:
1. **Suppression synchrone** - Attendre la réponse API avant de mettre à jour l'UI
2. **Suppression optimiste** - Mettre à jour l'UI immédiatement, rollback si erreur

**Choix final**: Suppression synchrone (plus simple, moins de risque d'incohérence pour un MVP)

### Emplacement du Bouton Supprimer

**Decision**: Ajouter un bouton dans chaque carte de membre (StaffCard)

**Rationale**: L'action de suppression doit être facilement accessible pour chaque membre sans navigation supplémentaire.

**Design**:
- Icône corbeille avec attribut `aria-label`
- Positionnement en haut à droite de la carte
- Style discret pour ne pas dominer visuellement

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| deleteStaffMember service | ✅ Existe | `src/services/staff.service.ts:168` |
| Toast notifications | ✅ Existe | `src/components/ui/Toast.tsx` |
| RLS DELETE policy | ✅ Existe | `staff_members_delete_own` |
| ConfirmDialog component | ❌ À créer | Nouveau composant UI |

## Conclusion

Toutes les questions techniques sont résolues. L'implémentation nécessite principalement:
1. Création du composant `ConfirmDialog`
2. Ajout du bouton supprimer et de la logique dans `StaffList`
3. Tests unitaires pour le dialogue et l'intégration
