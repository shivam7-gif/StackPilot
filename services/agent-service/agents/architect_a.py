"""
services/agent-service/agents/architect_a.py
Stage 3 — Architecture Agent.
Decides framework, folder structure, DB schema, and tech stack
based on the features from the Planner.
"""

import sys
import logging
sys.path.append("../../..")

from langchain_core.messages import HumanMessage, SystemMessage

from services.llm.llm_factory import default_llm
from services.llm.prompts.system_prompts import ARCHITECT_PROMPT
from services.tools.json_parser import parse_llm_json
from packages.types.agent_state import AgentState

logger = logging.getLogger(__name__)


def architect_agent(state: AgentState) -> AgentState:
    """
    Reads:  state["features"], ["modules"], ["db_tables"]
    Writes: state["framework"], ["folder_structure"], ["db_schema"], ["tech_stack"]
    Next:   "context_retrieval" stage
    """
    logger.info("Stage 3 — Architect Agent running...")

    context = {
        "features":      state.get("features", []),
        "modules":       state.get("modules", []),
        "db_tables":     state.get("db_tables", []),
        "api_endpoints": state.get("api_endpoints", []),
    }

    try:
        response = default_llm.invoke([
            SystemMessage(content=ARCHITECT_PROMPT),
            HumanMessage(content=f"Design architecture for: {context}")
        ])

        data = parse_llm_json(response.content, fallback={
            "framework": "FastAPI",
            "folder_structure": {},
            "db_schema": {},
            "tech_stack": []
        })

        logger.info(f"Architect chose framework: {data.get('framework')}")

        return {
            **state,
            "framework":        data.get("framework", "FastAPI"),
            "folder_structure": data.get("folder_structure", {}),
            "db_schema":        data.get("db_schema", {}),
            "tech_stack":       data.get("tech_stack", []),
            "stage":            "context_retrieval",
        }

    except Exception as e:
        logger.error(f"Architect Agent failed: {e}")
        return {
            **state,
            "errors": state.get("errors", []) + [f"Architect failed: {str(e)}"],
            "stage": "error",
        }