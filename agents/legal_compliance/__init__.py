"""Stub implementation of LegalComplianceAgent."""

# Intent constants
COMPLIANCE_AUDIT = "compliance_audit"
DOCUMENT_ANALYSIS = "document_analysis"
REGULATION_CHECK = "regulation_check"
CONTRACT_REVIEW = "contract_review"

class LegalComplianceAgent:
    def __init__(self, pubsub_transport, supabase_transport, policy_middleware):
        self.pubsub_transport = pubsub_transport
        self.supabase_transport = supabase_transport
        self.policy_middleware = policy_middleware
        self.is_running = False
        self.supported_intents = [COMPLIANCE_AUDIT, DOCUMENT_ANALYSIS, REGULATION_CHECK, CONTRACT_REVIEW]
        
    async def start(self):
        self.is_running = True
        print("Starting LegalComplianceAgent...")
        
    async def stop(self):
        self.is_running = False
        print("Stopping LegalComplianceAgent...")
        
class ComplianceAuditRequest:
    @staticmethod
    def dict():
        return {}
        
class DocumentAnalysisRequest:
    @staticmethod
    def dict():
        return {}
        
class RegulationCheckRequest:
    @staticmethod
    def dict():
        return {}
        
class ContractReviewRequest:
    @staticmethod
    def dict():
        return {}
