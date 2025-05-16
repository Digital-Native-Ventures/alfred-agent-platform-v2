import asyncio
import json
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any, Dict, List, Optional

import structlog

from libs.a2a_adapter import (
    A2AEnvelope,
    PolicyMiddleware,
    PubSubTransport,
    SupabaseTransport,
)

logger = structlog.get_logger(__name__)


class BaseAgent(ABC):
    def __init__(
        self,
        name: str,
        version: str,
        supported_intents: List[str],
        pubsub_transport: PubSubTransport,
        supabase_transport: SupabaseTransport,
        policy_middleware: PolicyMiddleware,
    ):
        self.name = name
        self.version = version
        self.supported_intents = supported_intents
        self.pubsub = pubsub_transport
        self.supabase = supabase_transport
        self.policy = policy_middleware

        self.is_running = False
        self._tasks = set()

    @abstractmethod
    async def process_task(self, envelope: A2AEnvelope) -> Dict[str, Any]:
        """Process a task and return results."""
        pass

    async def start(self):
        """Start the agent."""
        logger.info(
            "agent_starting", name=self.name, version=self.version, intents=self.supported_intents
        )

        self.is_running = True

        # Register agent
        await self._register_agent()

        # Start heartbeat
        self._tasks.add(asyncio.create_task(self._heartbeat_loop()))

        # Start subscription
        subscription_name = f"{self.name}-subscription"
        await self.pubsub.subscribe(subscription_name, self._handle_message, self._handle_error)

    async def stop(self):
        """Stop the agent."""
        logger.info("agent_stopping", name=self.name)

        self.is_running = False

        # Cancel all tasks
        for task in self._tasks:
            task.cancel()

        # Wait for tasks to complete
        await asyncio.gather(*self._tasks, return_exceptions=True)

        # Update agent status
        await self._update_agent_status("inactive")

    async def _handle_message(self, envelope: A2AEnvelope):
        """Handle incoming message."""
        # Apply policy middleware
        if hasattr(self.policy, "apply_policies"):
            envelope = await self.policy.apply_policies(envelope)

        try:
            # Check if intent is supported
            if envelope.intent not in self.supported_intents:
                logger.warning("unsupported_intent", intent=envelope.intent, agent=self.name)
                return

            # Check for duplicate
            is_duplicate = await self.supabase.check_duplicate(envelope.task_id)
            if is_duplicate:
                logger.info("duplicate_message", task_id=envelope.task_id)
                return

            # Update task status to processing
            await self.supabase.update_task_status(envelope.task_id, "processing")

            # Process task
            result = await self.process_task(envelope)

            # Store result
            await self.supabase.store_task_result(envelope.task_id, "success", result)

            # Update task status to completed
            await self.supabase.update_task_status(envelope.task_id, "completed")

            # Publish completion
            completion_envelope = A2AEnvelope(
                intent=f"{envelope.intent}_COMPLETED",
                content=result,
                correlation_id=envelope.task_id,
                trace_id=envelope.trace_id,
            )

            await self.pubsub.publish_task(
                completion_envelope, topic=self.pubsub.completed_topic_path
            )

        except Exception as e:
            logger.error(
                "task_processing_failed", error=str(e), task_id=envelope.task_id, agent=self.name
            )

            # Update task status to failed
            await self.supabase.update_task_status(envelope.task_id, "failed", str(e))

    async def _handle_error(self, error: Exception):
        """Handle subscription errors."""
        logger.error("subscription_error", error=str(error), agent=self.name)

    async def _register_agent(self):
        """Register agent in database."""
        # Simplified stub implementation
        logger.info(
            "agent_registered",
            name=self.name,
            type=self.__class__.__name__,
            version=self.version,
            status="active",
            capabilities=self.supported_intents,
        )

    async def _heartbeat_loop(self):
        """Send heartbeat to maintain agent status."""
        while self.is_running:
            try:
                # Simplified stub implementation
                logger.info(
                    "agent_heartbeat", name=self.name, timestamp=datetime.utcnow().isoformat()
                )

                await asyncio.sleep(30)  # Heartbeat every 30 seconds

            except Exception as e:
                logger.error("heartbeat_failed", error=str(e), agent=self.name)
                await asyncio.sleep(5)  # Retry after 5 seconds

    async def _update_agent_status(self, status: str):
        """Update agent status in registry."""
        # Simplified stub implementation
        logger.info(
            "agent_status_updated",
            name=self.name,
            status=status,
            timestamp=datetime.utcnow().isoformat(),
        )
