
import sys
import logging
sys.path.append("../../..")

from packages.types.agent_state import AgentState

logger = logging.getLogger(__name__)


def context_retrieval_agent(state: AgentState) -> AgentState:
    
    logger.info("Context Retrieval (KarmaRepo) running...")

    try:
        from services.repo_service.karma_repo import karma_repo

        features  = " ".join(state.get("features", []))
        modules   = " ".join(state.get("modules", []))
        framework = state.get("framework", "")

        query = f"{features} {modules} {framework}".strip()

        if not query:
            logger.info("No query context — skipping retrieval")
            return {**state, "retrieved_context": [], "stage": "code"}

        results = karma_repo.query(query, k=6)
        logger.info(f"Retrieved {len(results)} context chunks")

        return {
            **state,
            "retrieved_context": results,
            "stage": "code",
        }

    except Exception as e:
        logger.warning(f"Context retrieval failed (non-fatal): {e}")
        return {
            **state,
            "retrieved_context": [],
            "stage": "code",
        }