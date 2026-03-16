---
name: supabase-admin
description: Effectuer des opérations admin sur la base Supabase self-hosted (query, insert, update, delete sur profiles, staff_members, etc.)
allowed-tools: Bash, Read
---

# Supabase Admin

Skill pour effectuer des opérations admin sur la base de données Supabase self-hosted.

## Configuration

Les credentials sont stockés dans `.env.supabase` (fichier gitignored).

**Avant chaque requête, charger les credentials:**
```bash
export $(grep -v '^#' .env.supabase | xargs)
```

## Requêtes

### GET (lecture)
```bash
export $(grep -v '^#' .env.supabase | xargs) && curl -s "https://db.wefamily.ch/rest/v1/TABLE?FILTERS" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
```

### POST (insertion)
```bash
export $(grep -v '^#' .env.supabase | xargs) && curl -s -X POST "https://db.wefamily.ch/rest/v1/TABLE" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"column": "value"}'
```

### PATCH (mise à jour)
```bash
export $(grep -v '^#' .env.supabase | xargs) && curl -s -X PATCH "https://db.wefamily.ch/rest/v1/TABLE?id=eq.UUID" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"column": "new_value"}'
```

### DELETE
```bash
export $(grep -v '^#' .env.supabase | xargs) && curl -s -X DELETE "https://db.wefamily.ch/rest/v1/TABLE?id=eq.UUID" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
```

### Auth Users
```bash
export $(grep -v '^#' .env.supabase | xargs) && curl -s "https://db.wefamily.ch/auth/v1/admin/users" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
```

## Tables

- `profiles` - id, staff_account_id, display_name
- `staff_members` - id, user_id, first_name, last_name, email, position
- `schedule_entries` - Entrées de planning
- `tasks` - Tâches assignées
- `time_entries` - Pointages
- `invoices` - Factures
- `clients` - Clients

## Filtres PostgREST

- `eq.` - égal: `?email=eq.test@example.com`
- `neq.` - différent
- `is.` - null: `?staff_account_id=is.null`
- `in.` - liste: `?id=in.(uuid1,uuid2)`
