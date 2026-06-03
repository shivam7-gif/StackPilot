
import sys
import logging
sys.path.append("../../..")

from langchain_core.messages import HumanMessage, SystemMessage

from services.llm.llm_factory import default_llm
from services.tools.json_parser import parse_llm_json
from packages.types.agent_state import AgentState

logger = logging.getLogger(__name__)

REQUIREMENT_PROMPT = """
You are the StackPilot Requirement Analysis Agent.
You receive a raw idea from a developer and produce a clean, enriched prompt.

Your job:
1. Clarify ambiguous parts with sensible defaults
2. Identify the app type (API, web app, CLI tool, etc.)
3. Surface any implicit requirements

Return ONLY valid JSON:
{
  "enriched_prompt": "Clear, detailed description of what needs to be built",
  "app_type": "REST API | Web App | CLI | Mobile | Other",
  "implicit_requirements": ["authentication", "rate limiting", "pagination"]
}
""".strip()


def requirement_agent(state: AgentState) -> AgentState:
    """
    Reads:  state["user_prompt"]
    Writes: state["user_prompt"] (enriched), initializes error list
    Next:   "plan" stage
    """
    logger.info("Stage 1 — Requirement Analysis Agent running...")

    try:
        response = default_llm.invoke([
            SystemMessage(content=REQUIREMENT_PROMPT),
            HumanMessage(content=f"Analyze this idea: {state['user_prompt']}")
        ])

        data = parse_llm_json(response.content, fallback={
            "enriched_prompt": state["user_prompt"],
            "app_type": "REST API",
            "implicit_requirements": []
        })

        enriched = data.get("enriched_prompt", state["user_prompt"])
        logger.info(f"App type detected: {data.get('app_type')}")

        return {
            **state,
            "user_prompt": enriched,
            "errors":      [],
            "stage":       "plan",
        }

    except Exception as e:
        logger.error(f"Requirement Agent failed: {e}")
        return {
            **state,
            "errors": [f"Requirement analysis skipped: {str(e)}"],
            "stage":  "plan",
        }