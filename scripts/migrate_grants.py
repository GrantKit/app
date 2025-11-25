#!/usr/bin/env python3
"""Migrate grants from PolicyEngine grants repo to Supabase."""

import os
import yaml
from pathlib import Path
from supabase import create_client

# Supabase credentials
SUPABASE_URL = "https://jgrvjvqhrngcdmtrojlk.supabase.co"
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

# Path to grants repo
GRANTS_REPO = Path("/Users/maxghenis/PolicyEngine/grants")

def get_user_id(supabase, email):
    """Get user ID from email."""
    result = supabase.from_("auth.users").select("id").eq("email", email).execute()
    if result.data:
        return result.data[0]["id"]
    return None

def load_grant_registry():
    """Load grant registry YAML."""
    with open(GRANTS_REPO / "grant_registry.yaml") as f:
        return yaml.safe_load(f)

def load_grant_yaml(grant_path):
    """Load individual grant.yaml if exists."""
    grant_yaml_path = GRANTS_REPO / grant_path / "grant.yaml"
    if grant_yaml_path.exists():
        with open(grant_yaml_path) as f:
            return yaml.safe_load(f)
    return None

def load_responses(grant_path, grant_yaml):
    """Load response markdown files."""
    responses = []

    if not grant_yaml:
        return responses

    # Check for NSF-style sections
    nsf_sections = grant_yaml.get("nsf", {}).get("sections", [])
    for section in nsf_sections:
        file_path = GRANTS_REPO / grant_path / section.get("file", "")
        if file_path.exists():
            with open(file_path) as f:
                content = f.read()
            responses.append({
                "key": section["id"],
                "title": section["title"],
                "content": content,
                "status": "draft" if content else "empty"
            })

    return responses

def migrate_grants(user_email):
    """Migrate all grants for a user."""
    if not SUPABASE_SERVICE_KEY:
        print("Error: SUPABASE_SERVICE_KEY environment variable required")
        return

    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    # Get user ID from auth - need admin API for this
    # For now, we'll pass user_id directly

    registry = load_grant_registry()

    for grant_id, grant_data in registry.get("grants", {}).items():
        print(f"Migrating: {grant_id}")

        # Load additional details from grant.yaml
        grant_yaml = load_grant_yaml(grant_data.get("path", ""))

        # Prepare grant record
        grant_record = {
            "id": grant_id,
            "name": grant_data.get("name"),
            "foundation": grant_data.get("foundation"),
            "program": grant_data.get("program"),
            "deadline": grant_data.get("deadline"),
            "status": grant_data.get("status", "draft"),
            "amount_requested": grant_data.get("amount_requested"),
            "duration_years": grant_data.get("grant_duration_years"),
            "solicitation_url": grant_yaml.get("metadata", {}).get("solicitation_url") if grant_yaml else None,
            "repo_url": f"https://github.com/PolicyEngine/grants/tree/master/{grant_data.get('path', '')}",
            # user_id will be set after auth
        }

        # Insert grant (upsert to handle re-runs)
        result = supabase.table("grants").upsert(grant_record, on_conflict="id").execute()
        print(f"  Grant inserted: {result.data}")

        # Load and insert responses
        responses = load_responses(grant_data.get("path", ""), grant_yaml)
        for resp in responses:
            resp_record = {
                "grant_id": grant_id,
                "key": resp["key"],
                "title": resp["title"],
                "content": resp["content"],
                "status": resp["status"],
            }
            result = supabase.table("responses").upsert(
                resp_record,
                on_conflict="grant_id,key"
            ).execute()
            print(f"    Response '{resp['key']}' inserted")

if __name__ == "__main__":
    import sys
    email = sys.argv[1] if len(sys.argv) > 1 else "max@policyengine.org"
    migrate_grants(email)
