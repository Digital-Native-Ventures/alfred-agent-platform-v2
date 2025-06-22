"""PagerDuty integration for Alfred platform alerts"""

import os
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime

import httpx
import structlog

logger = structlog.get_logger()


@dataclass
class PagerDutyConfig:
    """PagerDuty integration configuration"""

    api_key: str
    integration_key: str
    base_url: str = "https://api.pagerduty.com"
    timeout: int = 30


@dataclass
class PagerDutyIncident:
    """PagerDuty incident representation"""

    id: str
    title: str
    status: str
    urgency: str
    created_at: datetime
    service_name: str
    assigned_user: Optional[str] = None
    escalation_policy: Optional[str] = None


class PagerDutyClient:
    """Client for PagerDuty API operations"""

    def __init__(self, config: PagerDutyConfig):
        self.config = config
        self.headers = {
            "Authorization": f"Token token={config.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/vnd.pagerduty+json;version=2",
        }

    async def create_incident(
        self,
        title: str,
        service_id: str,
        urgency: str = "high",
        details: Optional[Dict[str, Any]] = None,
    ) -> Optional[str]:
        """Create a PagerDuty incident

        Args:
            title: Incident title
            service_id: PagerDuty service ID
            urgency: Incident urgency (high/low)
            details: Additional incident details

        Returns:
            Incident ID if successful, None otherwise
        """
        try:
            payload = {
                "incident": {
                    "type": "incident",
                    "title": title,
                    "service": {"id": service_id, "type": "service_reference"},
                    "urgency": urgency,
                    "body": {"type": "incident_body", "details": details or {}},
                }
            }

            async with httpx.AsyncClient(timeout=self.config.timeout) as client:
                response = await client.post(
                    f"{self.config.base_url}/incidents",
                    json=payload,
                    headers=self.headers,
                )
                response.raise_for_status()

                data = response.json()
                incident_id = data["incident"]["id"]
                logger.info("pagerduty_incident_created", incident_id=incident_id, title=title)
                return incident_id

        except Exception as e:
            logger.error("pagerduty_create_incident_error", error=str(e), title=title)
            return None

    async def acknowledge_incident(self, incident_id: str, user_email: str) -> bool:
        """Acknowledge a PagerDuty incident

        Args:
            incident_id: PagerDuty incident ID
            user_email: Email of acknowledging user

        Returns:
            True if successful, False otherwise
        """
        try:
            payload = {
                "incidents": [
                    {
                        "id": incident_id,
                        "type": "incident_reference",
                        "status": "acknowledged",
                    }
                ]
            }

            headers = {**self.headers, "From": user_email}

            async with httpx.AsyncClient(timeout=self.config.timeout) as client:
                response = await client.put(
                    f"{self.config.base_url}/incidents",
                    json=payload,
                    headers=headers,
                )
                response.raise_for_status()

                logger.info(
                    "pagerduty_incident_acknowledged", incident_id=incident_id, user=user_email
                )
                return True

        except Exception as e:
            logger.error("pagerduty_acknowledge_error", error=str(e), incident_id=incident_id)
            return False

    async def resolve_incident(self, incident_id: str, user_email: str) -> bool:
        """Resolve a PagerDuty incident

        Args:
            incident_id: PagerDuty incident ID
            user_email: Email of resolving user

        Returns:
            True if successful, False otherwise
        """
        try:
            payload = {
                "incidents": [
                    {
                        "id": incident_id,
                        "type": "incident_reference",
                        "status": "resolved",
                    }
                ]
            }

            headers = {**self.headers, "From": user_email}

            async with httpx.AsyncClient(timeout=self.config.timeout) as client:
                response = await client.put(
                    f"{self.config.base_url}/incidents",
                    json=payload,
                    headers=headers,
                )
                response.raise_for_status()

                logger.info("pagerduty_incident_resolved", incident_id=incident_id, user=user_email)
                return True

        except Exception as e:
            logger.error("pagerduty_resolve_error", error=str(e), incident_id=incident_id)
            return False

    async def get_incidents(
        self,
        statuses: Optional[List[str]] = None,
        service_ids: Optional[List[str]] = None,
        limit: int = 100,
    ) -> List[PagerDutyIncident]:
        """Get PagerDuty incidents

        Args:
            statuses: Filter by incident statuses
            service_ids: Filter by service IDs
            limit: Maximum number of incidents to return

        Returns:
            List of PagerDuty incidents
        """
        try:
            params = {"limit": limit}
            if statuses:
                params["statuses[]"] = statuses
            if service_ids:
                params["service_ids[]"] = service_ids

            async with httpx.AsyncClient(timeout=self.config.timeout) as client:
                response = await client.get(
                    f"{self.config.base_url}/incidents",
                    params=params,
                    headers=self.headers,
                )
                response.raise_for_status()

                data = response.json()
                incidents = []

                for incident_data in data.get("incidents", []):
                    incident = PagerDutyIncident(
                        id=incident_data["id"],
                        title=incident_data["title"],
                        status=incident_data["status"],
                        urgency=incident_data["urgency"],
                        created_at=datetime.fromisoformat(
                            incident_data["created_at"].replace("Z", "+00:00")
                        ),
                        service_name=incident_data["service"]["summary"],
                        assigned_user=incident_data.get("assignments", [{}])[0]
                        .get("assignee", {})
                        .get("summary"),
                        escalation_policy=incident_data.get("escalation_policy", {}).get("summary"),
                    )
                    incidents.append(incident)

                logger.info("pagerduty_incidents_retrieved", count=len(incidents))
                return incidents

        except Exception as e:
            logger.error("pagerduty_get_incidents_error", error=str(e))
            return []


class PagerDutyAlertBridge:
    """Bridge between Alfred alerts and PagerDuty incidents"""

    def __init__(self, client: PagerDutyClient, service_mapping: Dict[str, str]):
        """Initialize PagerDuty alert bridge

        Args:
            client: PagerDuty client instance
            service_mapping: Mapping of Alfred services to PagerDuty service IDs
        """
        self.client = client
        self.service_mapping = service_mapping

    async def escalate_alert(
        self,
        alert_id: str,
        service: str,
        title: str,
        severity: str,
        details: Optional[Dict[str, Any]] = None,
    ) -> Optional[str]:
        """Escalate Alfred alert to PagerDuty

        Args:
            alert_id: Alfred alert ID
            service: Alfred service name
            title: Alert title
            severity: Alert severity
            details: Additional alert details

        Returns:
            PagerDuty incident ID if successful, None otherwise
        """
        pagerduty_service_id = self.service_mapping.get(service)
        if not pagerduty_service_id:
            logger.warning("pagerduty_service_not_mapped", service=service, alert_id=alert_id)
            return None

        urgency = "high" if severity in ["critical", "high"] else "low"
        incident_details = {
            "alfred_alert_id": alert_id,
            "alfred_service": service,
            "severity": severity,
            **(details or {}),
        }

        incident_title = f"[Alfred] {title}"

        return await self.client.create_incident(
            title=incident_title,
            service_id=pagerduty_service_id,
            urgency=urgency,
            details=incident_details,
        )

    async def sync_alert_status(self, alert_id: str, status: str, user_email: str) -> bool:
        """Sync Alfred alert status to PagerDuty

        Args:
            alert_id: Alfred alert ID
            status: New alert status (acknowledged/resolved)
            user_email: User performing the action

        Returns:
            True if successful, False otherwise
        """
        # TODO: Implement mapping between Alfred alert IDs and PagerDuty incident IDs
        # This would require storing the mapping when incidents are created

        logger.info(
            "pagerduty_status_sync_requested", alert_id=alert_id, status=status, user=user_email
        )

        # For now, return True as this is a placeholder implementation
        return True


def create_pagerduty_client() -> Optional[PagerDutyClient]:
    """Create PagerDuty client from environment variables"""
    api_key = os.getenv("PAGERDUTY_API_KEY")
    integration_key = os.getenv("PAGERDUTY_INTEGRATION_KEY")

    if not api_key or not integration_key:
        logger.warning("pagerduty_credentials_missing")
        return None

    config = PagerDutyConfig(
        api_key=api_key,
        integration_key=integration_key,
    )

    return PagerDutyClient(config)


def create_alert_bridge() -> Optional[PagerDutyAlertBridge]:
    """Create PagerDuty alert bridge with default service mapping"""
    client = create_pagerduty_client()
    if not client:
        return None

    # Default service mapping - should be configured per deployment
    service_mapping = {
        "alfred-core": os.getenv("PAGERDUTY_SERVICE_ALFRED_CORE", ""),
        "model-router": os.getenv("PAGERDUTY_SERVICE_MODEL_ROUTER", ""),
        "model-registry": os.getenv("PAGERDUTY_SERVICE_MODEL_REGISTRY", ""),
        "mission-control": os.getenv("PAGERDUTY_SERVICE_MISSION_CONTROL", ""),
        "social-intel": os.getenv("PAGERDUTY_SERVICE_SOCIAL_INTEL", ""),
    }

    # Filter out empty mappings
    service_mapping = {k: v for k, v in service_mapping.items() if v}

    if not service_mapping:
        logger.warning("pagerduty_no_service_mappings")
        return None

    return PagerDutyAlertBridge(client, service_mapping)
