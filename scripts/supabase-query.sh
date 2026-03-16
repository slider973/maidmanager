#!/bin/bash
# Supabase Query Helper
# Usage: ./scripts/supabase-query.sh <table> [filter]
# Examples:
#   ./scripts/supabase-query.sh profiles
#   ./scripts/supabase-query.sh staff_members "email=eq.test@jojo.fr"

set -e

# Load credentials
source "$(dirname "$0")/../.env.supabase"

TABLE=$1
FILTER=$2

if [ -z "$TABLE" ]; then
  echo "Usage: $0 <table> [filter]"
  echo "Examples:"
  echo "  $0 profiles"
  echo "  $0 staff_members 'email=eq.test@jojo.fr'"
  exit 1
fi

URL="$SUPABASE_URL/rest/v1/$TABLE"
if [ -n "$FILTER" ]; then
  URL="$URL?$FILTER"
fi

curl -s "$URL" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" | jq .
