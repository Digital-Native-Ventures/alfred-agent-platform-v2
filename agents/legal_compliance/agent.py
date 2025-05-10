"""Legal Compliance Agent Implementation"""

import os
from datetime import datetime
from typing import Dict, Any, List, Optional
from uuid import uuid4
import structlog

from libs.agent_core.base_agent import BaseAgent
from libs.a2a_adapter import A2AEnvelope, PubSubTransport, SupabaseTransport, PolicyMiddleware

from .chains import audit_chain, document_chain, regulation_chain, contract_chain
from .models import (
    ComplianceAuditRequest,
    DocumentAnalysisRequest,
    RegulationCheckRequest,
    ContractReviewRequest
)

logger = structlog.get_logger(__name__)

class LegalComplianceAgent(BaseAgent):
    def __init__(
        self,
        pubsub_transport: PubSubTransport,
        supabase_transport: SupabaseTransport,
        policy_middleware: PolicyMiddleware
    ):
        supported_intents = [
            "COMPLIANCE_AUDIT",
            "DOCUMENT_ANALYSIS",
            "REGULATION_CHECK",
            "CONTRACT_REVIEW"
        ]

        super().__init__(
            name="legal-compliance-agent",
            version="1.0.0",
            supported_intents=supported_intents,
            pubsub_transport=pubsub_transport,
            supabase_transport=supabase_transport,
            policy_middleware=policy_middleware
        )

    async def process_task(self, envelope: A2AEnvelope) -> Dict[str, Any]:
        """Process legal compliance tasks based on intent."""
        intent = envelope.intent
        content = envelope.content

        try:
            if intent == "COMPLIANCE_AUDIT":
                return await self._process_compliance_audit(content)
            elif intent == "DOCUMENT_ANALYSIS":
                return await self._process_document_analysis(content)
            elif intent == "REGULATION_CHECK":
                return await self._process_regulation_check(content)
            elif intent == "CONTRACT_REVIEW":
                return await self._process_contract_review(content)
            else:
                raise ValueError(f"Unsupported intent: {intent}")

        except Exception as e:
            logger.error(
                "task_processing_failed",
                error=str(e),
                intent=intent,
                task_id=envelope.task_id
            )
            raise

    async def _process_compliance_audit(self, content: Dict[str, Any]) -> Dict[str, Any]:
        """Process compliance audit request."""
        try:
            # Validate request
            request = ComplianceAuditRequest(**content)

            # Execute audit chain
            result = await audit_chain.arun(
                organization_name=request.organization_name,
                audit_scope=request.audit_scope,
                compliance_categories=[cat.value for cat in request.compliance_categories],
                documents=request.documents or []
            )

            # Add metadata
            result.audit_id = str(uuid4())
            result.audit_date = datetime.utcnow()

            return result.dict()

        except Exception as e:
            logger.error("compliance_audit_failed", error=str(e))
            return {
                "status": "error",
                "error": str(e),
                "error_type": "compliance_audit_error"
            }

    async def _process_document_analysis(self, content: Dict[str, Any]) -> Dict[str, Any]:
        """Process document analysis request."""
        try:
            # Validate request
            request = DocumentAnalysisRequest(**content)

            # Execute document analysis chain
            result = await document_chain.arun(
                document_type=request.document_type.value,
                document_content=request.document_content,
                compliance_frameworks=[fw.value for fw in request.compliance_frameworks],
                check_for_pii=request.check_for_pii
            )

            # Add metadata
            result.document_id = str(uuid4())
            result.analysis_date = datetime.utcnow()

            return result.dict()

        except Exception as e:
            logger.error("document_analysis_failed", error=str(e))
            return {
                "status": "error",
                "error": str(e),
                "error_type": "document_analysis_error"
            }

    async def _process_regulation_check(self, content: Dict[str, Any]) -> Dict[str, Any]:
        """Process regulation check request."""
        try:
            # Validate request
            request = RegulationCheckRequest(**content)

            # Execute regulation check chain
            result = await regulation_chain.arun(
                business_activity=request.business_activity,
                jurisdictions=request.jurisdictions,
                industry_sector=request.industry_sector,
                specific_regulations=request.specific_regulations or []
            )

            # Add metadata
            result.check_id = str(uuid4())

            return result.dict()

        except Exception as e:
            logger.error("regulation_check_failed", error=str(e))
            return {
                "status": "error",
                "error": str(e),
                "error_type": "regulation_check_error"
            }

    async def _process_contract_review(self, content: Dict[str, Any]) -> Dict[str, Any]:
        """Process contract review request."""
        try:
            # Validate request
            request = ContractReviewRequest(**content)

            # Execute contract review chain
            result = await contract_chain.arun(
                contract_type=request.contract_type,
                contract_content=request.contract_content,
                parties_involved=request.parties_involved,
                jurisdiction=request.jurisdiction,
                review_focus=request.review_focus
            )

            # Add metadata
            result.review_id = str(uuid4())
            result.review_date = datetime.utcnow()

            return result.dict()

        except Exception as e:
            logger.error("contract_review_failed", error=str(e))
            return {
                "status": "error",
                "error": str(e),
                "error_type": "contract_review_error"
            }
