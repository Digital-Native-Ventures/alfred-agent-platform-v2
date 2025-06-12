#!/usr/bin/env python3
"""
Schema utilities for Alfred metrics.

Provides functions for loading and validating JSON schemas.
"""
import jsonLFfrom pathlib import PathLFfrom typing import Any, Dict, castLFLFLFdef load_schema(schema_name: str) -> Dict[str, Any]:LF    """Load JSON schema from the schemas directory."""
    schema_path = Path(__file__).parent.parent / "schemas" / f"{schema_name}.json"

    if not schema_path.exists():
        raise FileNotFoundError(f"Schema file not found: {schema_path}")

    try:
        with open(schema_path, "r", encoding="utf-8") as f:
            return cast(Dict[str, Any], json.load(f))
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON in schema {schema_name}: {e}")
    except Exception as e:
        raise RuntimeError(f"Error loading schema {schema_name}: {e}")


def get_default_config() -> Dict[str, Any]:
    """Get default CVE waiver configuration."""
    return {
        "max_age_days": 30,
        "alertable_severities": ["critical", "high"],
        "message_format": {
            "max_displayed_vulns": 10,
            "severity_emojis": {"critical": "🔴", "high": "🟠", "medium": "🟡", "low": "🔵"},
        },
    }
