# Quickstart: Supprimer les membres du personnel

**Feature**: 003-delete-staff
**Date**: 2026-02-06

## Prerequisites

Avant de commencer, assurez-vous que:

1. **Feature 002-add-staff** est complète et fonctionnelle
2. **Au moins un membre du personnel** existe dans la base de données
3. **L'utilisateur est connecté** à l'application

## Testing Each Feature

### Test 1: Bouton de suppression visible (P1)

1. Connectez-vous à l'application
2. Naviguez vers la page Personnel (`/staff`)
3. Vérifiez qu'un bouton de suppression (icône corbeille) est visible sur chaque carte de membre

**Expected**: Chaque carte de membre affiche un bouton de suppression accessible.

### Test 2: Dialogue de confirmation (P1)

1. Cliquez sur le bouton de suppression d'un membre
2. Vérifiez qu'un dialogue de confirmation s'affiche

**Expected**:
- Le dialogue affiche le nom complet du membre
- Deux boutons sont présents: "Confirmer" et "Annuler"
- Le dialogue est centré à l'écran avec un overlay

### Test 3: Annulation de la suppression (P1)

1. Ouvrez le dialogue de confirmation
2. Cliquez sur "Annuler"

**Expected**: Le dialogue se ferme et le membre reste dans la liste.

### Test 4: Fermeture par Échap (P1)

1. Ouvrez le dialogue de confirmation
2. Appuyez sur la touche Échap

**Expected**: Le dialogue se ferme sans supprimer le membre.

### Test 5: Fermeture par clic extérieur (P1)

1. Ouvrez le dialogue de confirmation
2. Cliquez en dehors du dialogue (sur l'overlay)

**Expected**: Le dialogue se ferme sans supprimer le membre.

### Test 6: Suppression réussie (P1)

1. Ouvrez le dialogue de confirmation
2. Cliquez sur "Confirmer"

**Expected**:
- Le dialogue se ferme
- Le membre disparaît de la liste
- Une notification de succès s'affiche: "Membre supprimé avec succès"

### Test 7: Notification d'erreur (P2)

1. Simulez une erreur réseau (déconnectez-vous du réseau)
2. Essayez de supprimer un membre

**Expected**:
- Une notification d'erreur s'affiche
- Le membre reste dans la liste

### Test 8: Liste vide après suppression (Edge Case)

1. Si vous n'avez qu'un seul membre, supprimez-le

**Expected**: L'état vide de la liste s'affiche avec le message "Aucun membre du personnel".

## Common Issues

### Le bouton de suppression n'apparaît pas
- Vérifiez que le CSS pour `.staff-card-delete` est présent
- Vérifiez la structure JSX dans StaffList.tsx

### Le dialogue ne s'ouvre pas
- Vérifiez que le state `memberToDelete` est correctement mis à jour
- Vérifiez que ConfirmDialog est rendu dans le composant

### La suppression échoue silencieusement
- Vérifiez les logs console pour les erreurs
- Vérifiez que l'utilisateur est bien authentifié
- Vérifiez les policies RLS dans Supabase

### Le membre reste après suppression
- Vérifiez que `refetch()` est appelé après une suppression réussie
- Vérifiez le `refetchSignal` dans le composant parent

## Development Tips

### Debug Supabase DELETE
```typescript
// Dans la console du navigateur
const result = await supabase
  .from('staff_members')
  .delete()
  .eq('id', 'member-uuid-here')
console.log('Delete result:', result)
```

### Vérifier les policies RLS
```sql
-- Dans Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'staff_members';
```

## Validation Checklist

- [ ] Bouton de suppression visible sur chaque carte
- [ ] Dialogue de confirmation s'affiche au clic
- [ ] Nom du membre affiché dans le dialogue
- [ ] Boutons Confirmer/Annuler fonctionnels
- [ ] Fermeture sur Échap
- [ ] Fermeture sur clic extérieur
- [ ] Suppression effective du membre
- [ ] Notification de succès affichée
- [ ] Notification d'erreur en cas d'échec
- [ ] Liste mise à jour après suppression
- [ ] État vide affiché si plus de membres
- [ ] Focus management correct (accessibilité)
- [ ] Responsive sur mobile
