# Quickstart: Ajouter du Personnel

**Feature**: 002-add-staff
**Date**: 2026-02-06

## Prerequisites

Before starting, ensure you have:

1. **Authentication working** (feature 001-complete-auth)
2. **Supabase project** with database access
3. **Environment variables** configured in `.env.local`

## Database Setup

### 1. Run Migration

Execute this SQL in Supabase SQL Editor:

```sql
-- Create staff_members table
CREATE TABLE IF NOT EXISTS public.staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('housekeeper', 'gardener', 'cook', 'driver', 'nanny', 'guard', 'other')),
  position_custom TEXT,
  phone TEXT,
  email TEXT,
  start_date DATE,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_staff_members_user_id ON staff_members(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_position ON staff_members(position);
CREATE INDEX IF NOT EXISTS idx_staff_members_is_active ON staff_members(is_active);

-- Enable RLS
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "staff_members_select_own" ON staff_members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "staff_members_insert_own" ON staff_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "staff_members_update_own" ON staff_members
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "staff_members_delete_own" ON staff_members
  FOR DELETE USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS staff_members_updated_at ON staff_members;
CREATE TRIGGER staff_members_updated_at
  BEFORE UPDATE ON staff_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. Update TypeScript Types

Add to `src/lib/types/database.ts`:

```typescript
// In Database interface, Tables section:
staff_members: {
  Row: {
    id: string
    user_id: string
    first_name: string
    last_name: string
    position: 'housekeeper' | 'gardener' | 'cook' | 'driver' | 'nanny' | 'guard' | 'other'
    position_custom: string | null
    phone: string | null
    email: string | null
    start_date: string | null
    notes: string | null
    is_active: boolean
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    user_id: string
    first_name: string
    last_name: string
    position: 'housekeeper' | 'gardener' | 'cook' | 'driver' | 'nanny' | 'guard' | 'other'
    position_custom?: string | null
    phone?: string | null
    email?: string | null
    start_date?: string | null
    notes?: string | null
    is_active?: boolean
  }
  Update: {
    first_name?: string
    last_name?: string
    position?: 'housekeeper' | 'gardener' | 'cook' | 'driver' | 'nanny' | 'guard' | 'other'
    position_custom?: string | null
    phone?: string | null
    email?: string | null
    start_date?: string | null
    notes?: string | null
    is_active?: boolean
  }
  Relationships: [
    {
      foreignKeyName: "staff_members_user_id_fkey"
      columns: ["user_id"]
      isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    }
  ]
}
```

## Testing Each Feature

### Test 1: Add Staff Member (P1)

1. Log in to the application
2. Navigate to the staff page
3. Click "Ajouter un membre"
4. Fill in: Prénom, Nom, select a position
5. Submit the form

**Expected**: Staff member appears in the list with the correct information.

### Test 2: Add Staff with Contact Info (P1)

1. Click "Ajouter un membre"
2. Fill in required fields
3. Add phone number and email
4. Submit

**Expected**: Contact information is saved and displayed.

### Test 3: Add Staff with Notes (P2)

1. Click "Ajouter un membre"
2. Fill in required fields
3. Set start date and add notes
4. Submit

**Expected**: All information is saved correctly.

### Test 4: View Staff List (P2)

1. Add multiple staff members with different positions
2. View the staff list

**Expected**: All members displayed with name, position, and status indicator.

### Test 5: Validation Errors

1. Try to submit form with empty required fields
2. Try to submit with invalid email format

**Expected**: Appropriate French error messages displayed inline.

### Test 6: Position Custom

1. Add staff member with position "Autre"
2. Enter custom position name
3. Submit

**Expected**: Custom position displayed instead of "Autre".

## Common Issues

### "Permission denied" error
- Check RLS policies are created correctly
- Verify user is authenticated before accessing staff page

### Staff not appearing in list
- Check user_id matches authenticated user
- Verify SELECT policy is correct
- Check for errors in browser console

### Form validation not working
- Ensure all required fields have proper validation
- Check error messages are in French

## Development Tips

### Watch Supabase queries
```typescript
// In browser console
localStorage.setItem('supabase.log.level', 'debug')
```

### Test RLS policies
```sql
-- In Supabase SQL Editor, test as a specific user
SET request.jwt.claim.sub = 'user-uuid-here';
SELECT * FROM staff_members;
```

### Check if staff exists
```typescript
const { data, error } = await supabase
  .from('staff_members')
  .select('*')
console.log('Staff members:', data, error)
```

## Validation Checklist

- [x] Can add staff member with required fields only
- [x] Can add staff member with all fields
- [x] Position dropdown shows all 7 options
- [x] Custom position field appears when "Autre" selected
- [x] Email validation works (optional field)
- [x] Error messages display in French
- [x] Staff list shows all added members
- [x] Status indicator (active/inactive) visible
- [x] Form resets after successful submission
- [x] Loading state visible during submission
- [x] Toast notification on success/error
- [x] Protected route redirects if not authenticated
- [x] Mobile responsive layout works
