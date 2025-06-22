"""Slack diagnostics bot for Alfred platform"""

from typing import Optional, cast

import httpx
import structlog
from slack_sdk.web.async_client import AsyncWebClient
from slack_sdk.web.slack_response import SlackResponse

try:
    from alfred.integrations.pagerduty import create_alert_bridge
except ImportError:
    create_alert_bridge = None

logger = structlog.get_logger()


class DiagnosticsBot:
    """Slack bot for system diagnostics and health checks"""

    def __init__(
        self,
        slack_client: AsyncWebClient,
        prometheus_url: str = "http://prometheus:9090",
        enabled: bool = True,
    ) -> None:
        """Initialize diagnostics bot.

        Args:
            slack_client: Slack Web API client
            prometheus_url: URL for Prometheus API
            enabled: Whether bot is enabled.
        """
        self.slack_client = slack_client
        self.prometheus_url = prometheus_url
        self.enabled = enabled
        self.pagerduty_bridge = create_alert_bridge() if create_alert_bridge else None
        self.commands = {
            "/diag health": self._handle_health_command,
            "/diag metrics": self._handle_metrics_command,
            "/diag ack": self._handle_acknowledge_command,
            "/diag silence": self._handle_silence_command,
            "/diag correlate": self._handle_correlate_command,
        }

    async def handle_command(
        self, command: str, channel: str, user: str, text: str
    ) -> Optional[SlackResponse]:
        """Handle incoming slash command.

        Args:
            command: Command name (e.g., "/diag")
            channel: Channel ID where command was issued
            user: User ID who issued command
            text: Command arguments
        """
        if not self.enabled:
            logger.info("diagnostics_bot_disabled", command=command)
            return None

        # Parse command and arguments
        args = text.strip().split()
        if not args:
            return await self._send_help(channel)
        
        subcommand = args[0]
        full_command = f"{command} {subcommand}"
        logger.info("processing_command", command=full_command, channel=channel, user=user, args=args)

        handler = self.commands.get(full_command)
        if not handler:
            return await self._send_help(channel)

        try:
            # Pass additional arguments based on command type
            if subcommand in ["ack", "silence", "correlate"]:
                alert_id = args[1] if len(args) > 1 else None
                if subcommand == "silence" and len(args) > 2:
                    duration = args[2]
                    return await handler(channel, user, alert_id, duration)
                else:
                    return await handler(channel, user, alert_id)
            else:
                return await handler(channel, user)
        except Exception as e:
            logger.error("command_error", command=full_command, error=str(e))
            return cast(
                SlackResponse,
                await self.slack_client.chat_postMessage(
                    channel=channel,
                    text=f"❌ Error executing command: {str(e)}",
                ),
            )

    async def _handle_health_command(self, channel: str, user: str) -> SlackResponse:
        """Handle health check command"""
        try:
            async with httpx.AsyncClient() as client:
                # Check each service health endpoint
                services = [
                    ("alfred-core", "http://alfred-core:8000/health"),
                    ("mission-control", "http://mission-control:3000/health"),
                    ("social-intel", "http://social-intel:5002/health"),
                    ("model-registry", "http://model-registry:8001/health"),
                    ("model-router", "http://model-router:8002/health"),
                ]

                blocks = [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "🏥 *Service Health Status*",
                        },
                    }
                ]

                for service_name, url in services:
                    try:
                        response = await client.get(url, timeout=5.0)
                        status = "✅" if response.status_code == 200 else "❌"
                        health_data = response.json()
                        status_text = health_data.get("status", "unknown")
                    except Exception as e:
                        status = "❌"
                        status_text = str(e)

                    blocks.append(
                        {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": f"{status} *{service_name}*: {status_text}",
                            },
                        }
                    )

                return cast(
                    SlackResponse,
                    await self.slack_client.chat_postMessage(channel=channel, blocks=blocks),
                )

        except Exception as e:
            logger.error("health_check_error", error=str(e))
            raise

    async def _handle_metrics_command(self, channel: str, user: str) -> SlackResponse:
        """Handle metrics query command"""
        try:
            async with httpx.AsyncClient() as client:
                # Query Prometheus for key metrics
                queries = {
                    "Request Rate": "sum(rate(http_requests_total[5m]))",
                    "Error Rate": 'sum(rate(http_requests_total{status=~"5.."}[5m]))',
                    "P95 Latency": (
                        "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
                    ),
                    "Active Agents": 'up{job=~".*agent.*"}',
                }

                blocks = [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": "📊 *System Metrics*",
                        },
                    }
                ]

                for metric_name, query in queries.items():
                    try:
                        response = await client.get(
                            f"{self.prometheus_url}/api/v1/query",
                            params={"query": query},
                            timeout=5.0,
                        )
                        data = response.json()

                        if data["status"] == "success" and data["data"]["result"]:
                            value = data["data"]["result"][0]["value"][1]
                            # Format based on metric type
                            if "Rate" in metric_name:
                                formatted_value = f"{float(value):.2f} req/s"
                            elif "Latency" in metric_name:
                                formatted_value = f"{float(value)*1000:.2f} ms"
                            else:
                                formatted_value = value
                        else:
                            formatted_value = "No data"

                    except Exception as e:
                        formatted_value = f"Error: {str(e)}"

                    blocks.append(
                        {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": f"*{metric_name}*: {formatted_value}",
                            },
                        }
                    )

                return cast(
                    SlackResponse,
                    await self.slack_client.chat_postMessage(channel=channel, blocks=blocks),
                )

        except Exception as e:
            logger.error("metrics_query_error", error=str(e))
            raise

    async def _send_help(self, channel: str) -> SlackResponse:
        """Send help message"""
        blocks = [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "🤖 *Diagnostics Bot Commands*",
                },
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "• `/diag health` - Check service health status\n"
                    "• `/diag metrics` - View system metrics\n"
                    "• `/diag ack <alert-id>` - Acknowledge alert\n"
                    "• `/diag silence <alert-id> [duration]` - Silence alert\n"
                    "• `/diag correlate <alert-id>` - Show correlated alerts",
                },
            },
        ]

        return cast(
            SlackResponse,
            await self.slack_client.chat_postMessage(channel=channel, blocks=blocks),
        )

    async def _handle_acknowledge_command(self, channel: str, user: str, alert_id: str = None) -> SlackResponse:
        """Handle alert acknowledgment command"""
        if not alert_id:
            return cast(
                SlackResponse,
                await self.slack_client.chat_postMessage(
                    channel=channel,
                    text="❌ Please provide an alert ID: `/diag ack <alert-id>`",
                ),
            )

        try:
            # TODO: Integrate with existing AlertSnooze model
            # For now, return success message with interactive options
            blocks = [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"✅ Alert `{alert_id}` acknowledged by <@{user}>",
                    },
                },
                {
                    "type": "actions",
                    "elements": [
                        {
                            "type": "button",
                            "text": {"type": "plain_text", "text": "View Correlated"},
                            "action_id": "view_correlation",
                            "value": alert_id,
                        },
                        {
                            "type": "button",
                            "text": {"type": "plain_text", "text": "Silence Related"},
                            "action_id": "silence_related",
                            "value": alert_id,
                            "style": "danger",
                        },
                    ],
                },
            ]

            return cast(
                SlackResponse,
                await self.slack_client.chat_postMessage(channel=channel, blocks=blocks),
            )

        except Exception as e:
            logger.error("acknowledge_error", alert_id=alert_id, error=str(e))
            raise

    async def _handle_silence_command(self, channel: str, user: str, alert_id: str = None, duration: str = "1h") -> SlackResponse:
        """Handle alert silence command"""
        if not alert_id:
            return cast(
                SlackResponse,
                await self.slack_client.chat_postMessage(
                    channel=channel,
                    text="❌ Please provide an alert ID: `/diag silence <alert-id> [duration]`",
                ),
            )

        try:
            # TODO: Integrate with existing AlertSnooze model
            blocks = [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"🔇 Alert `{alert_id}` silenced for {duration} by <@{user}>",
                    },
                },
                {
                    "type": "context",
                    "elements": [
                        {
                            "type": "mrkdwn",
                            "text": f"Alert will auto-resume after {duration}. Use `/diag ack {alert_id}` to acknowledge instead.",
                        }
                    ],
                },
            ]

            return cast(
                SlackResponse,
                await self.slack_client.chat_postMessage(channel=channel, blocks=blocks),
            )

        except Exception as e:
            logger.error("silence_error", alert_id=alert_id, error=str(e))
            raise

    async def _handle_correlate_command(self, channel: str, user: str, alert_id: str = None) -> SlackResponse:
        """Handle alert correlation command"""
        if not alert_id:
            return cast(
                SlackResponse,
                await self.slack_client.chat_postMessage(
                    channel=channel,
                    text="❌ Please provide an alert ID: `/diag correlate <alert-id>`",
                ),
            )

        try:
            # TODO: Implement actual correlation algorithm
            # For now, simulate related alerts
            related_alerts = [
                {"id": f"{alert_id}_related_1", "service": "alfred-core", "severity": "warning", "correlation": "service"},
                {"id": f"{alert_id}_related_2", "service": "model-router", "severity": "critical", "correlation": "temporal"},
            ]

            blocks = [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"🔗 *Alerts correlated with `{alert_id}`*",
                    },
                }
            ]

            for alert in related_alerts:
                severity_emoji = "🔴" if alert["severity"] == "critical" else "🟡"
                correlation_type = f"({alert['correlation']} correlation)"
                
                blocks.extend([
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": f"{severity_emoji} `{alert['id']}` - {alert['service']} {correlation_type}",
                        },
                        "accessory": {
                            "type": "button",
                            "text": {"type": "plain_text", "text": "Acknowledge"},
                            "action_id": "ack_correlated",
                            "value": alert["id"],
                        },
                    }
                ])

            # Add bulk action buttons
            action_elements = [
                {
                    "type": "button",
                    "text": {"type": "plain_text", "text": "Acknowledge All"},
                    "action_id": "ack_all_correlated",
                    "value": alert_id,
                    "style": "primary",
                },
                {
                    "type": "button",
                    "text": {"type": "plain_text", "text": "Silence All"},
                    "action_id": "silence_all_correlated",
                    "value": alert_id,
                    "style": "danger",
                },
            ]
            
            # Add PagerDuty escalation if available
            if self.pagerduty_bridge:
                action_elements.append({
                    "type": "button",
                    "text": {"type": "plain_text", "text": "🚨 Escalate to PagerDuty"},
                    "action_id": "escalate_to_pagerduty",
                    "value": alert_id,
                })

            blocks.append({
                "type": "actions",
                "elements": action_elements,
            })

            return cast(
                SlackResponse,
                await self.slack_client.chat_postMessage(channel=channel, blocks=blocks),
            )

        except Exception as e:
            logger.error("correlate_error", alert_id=alert_id, error=str(e))
            raise

    async def handle_button_action(self, action_id: str, value: str, user: str, channel: str) -> Optional[SlackResponse]:
        """Handle button actions from interactive messages"""
        try:
            if action_id == "view_correlation":
                return await self._handle_correlate_command(channel, user, value)
            elif action_id == "ack_correlated":
                return await self._handle_acknowledge_command(channel, user, value)
            elif action_id == "silence_related":
                return await self._handle_silence_command(channel, user, value, "30m")
            elif action_id == "ack_all_correlated":
                # TODO: Implement bulk acknowledge
                return cast(
                    SlackResponse,
                    await self.slack_client.chat_postMessage(
                        channel=channel,
                        text=f"✅ All alerts correlated with `{value}` acknowledged by <@{user}>",
                    ),
                )
            elif action_id == "silence_all_correlated":
                # TODO: Implement bulk silence
                return cast(
                    SlackResponse,
                    await self.slack_client.chat_postMessage(
                        channel=channel,
                        text=f"🔇 All alerts correlated with `{value}` silenced by <@{user}>",
                    ),
                )
            elif action_id == "escalate_to_pagerduty":
                # TODO: Integrate with actual alert data
                if self.pagerduty_bridge:
                    # Simulate escalation for now
                    return cast(
                        SlackResponse,
                        await self.slack_client.chat_postMessage(
                            channel=channel,
                            text=f"🚨 Alert `{value}` escalated to PagerDuty by <@{user}>",
                        ),
                    )
                else:
                    return cast(
                        SlackResponse,
                        await self.slack_client.chat_postMessage(
                            channel=channel,
                            text="❌ PagerDuty integration not configured",
                        ),
                    )
            else:
                logger.warning("unknown_action", action_id=action_id)
                return None

        except Exception as e:
            logger.error("button_action_error", action_id=action_id, error=str(e))
            return cast(
                SlackResponse,
                await self.slack_client.chat_postMessage(
                    channel=channel,
                    text=f"❌ Error processing action: {str(e)}",
                ),
            )
