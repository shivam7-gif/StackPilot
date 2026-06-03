

import sys
import logging
sys.path.append("../../..")

from langchain_core.messages import HumanMessage, SystemMessage

from services.llm.llm_factory import default_llm
from services.llm.prompts.system_prompts import PLANNER_PROMPT
from services.tools.json_parser import parse_llm_json
from packages.types.agent_state import AgentState

logger = logging.getLogger(__name__)


def planner_agent(state: AgentState) -> AgentState:
    """
    Reads:  state["user_prompt"]
    Writes: state["features"], ["api_endpoints"], ["db_tables"], ["modules"]
    Next:   "architect" stage
    """
    logger.info("Stage 2 — Planner Agent running...")

    try:
        response = default_llm.invoke([
            SystemMessage(content=PLANNER_PROMPT),
            HumanMessage(content=f"Plan this application: {state['user_prompt']}")
        ])

        data = parse_llm_json(response.content, fallback={
            "features": [],
            "api_endpoints": [],
            "db_tables": [],
            "modules": []
        })

        logger.info(f"Planner found {len(data.get('features', []))} features")

        return {
            **state,
            "features":      data.get("features", []),
            "api_endpoints": data.get("api_endpoints", []),
            "db_tables":     data.get("db_tables", []),
            "modules":       data.get("modules", []),
            "stage":         "architect",
        }

    except Exception as e:
        logger.error(f"Planner Agent failed: {e}")
        return {
            **state,
            "errors": state.get("errors", []) + [f"Planner failed: {str(e)}"],
            "stage": "error",
        }