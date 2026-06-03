

import sys
import logging
sys.path.append("../..")

from langgraph.graph import StateGraph, END

from packages.types.agent_state import AgentState
from services.agent_service.agents.requirem_a   import requirement_agent
from services.agent_service.agents.planner_a    import planner_agent
from services.agent_service.agents.architect_a  import architect_agent
from services.agent_service.agents.context_agent import context_retrieval_agent
from services.codegen_service.karma_h_series    import codegen_agent
from services.testing_service.testing_agent     import testing_agent
from services.devops_service.devops_agent       import devops_agent

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  [%(name)s]  %(levelname)s  %(message)s",
)
logger = logging.getLogger(__name__)


def error_handler(state: AgentState) -> AgentState:
    errors = state.get("errors", [])
    logger.error(f"Pipeline stopped with {len(errors)} error(s):")
    for err in errors:
        logger.error(f"  → {err}")
    return {**state, "stage": "done"}


def route_from_intake(state: AgentState) -> str:
    return "error" if state.get("stage") == "error" else "plan"

def route_from_plan(state: AgentState) -> str:
    return "error" if state.get("stage") == "error" else "architect"

def route_from_architect(state: AgentState) -> str:
    return "error" if state.get("stage") == "error" else "context_retrieval"

def route_from_context(state: AgentState) -> str:
    return "error" if state.get("stage") == "error" else "code"

def route_from_code(state: AgentState) -> str:
    return "error" if state.get("stage") == "error" else "testing"

def route_from_testing(state: AgentState) -> str:
    return "error" if state.get("stage") == "error" else "devops"



def build_karma_engine() -> StateGraph:
    graph = StateGraph(AgentState)

    # Register all nodes
    graph.add_node("intake",            requirement_agent)
    graph.add_node("plan",              planner_agent)
    graph.add_node("architect",         architect_agent)
    graph.add_node("context_retrieval", context_retrieval_agent)
    graph.add_node("code",              codegen_agent)
    graph.add_node("testing",           testing_agent)
    graph.add_node("devops",            devops_agent)
    graph.add_node("error",             error_handler)

    graph.set_entry_point("intake")

    graph.add_conditional_edges("intake",            route_from_intake,    {"plan": "plan",             "error": "error"})
    graph.add_conditional_edges("plan",              route_from_plan,      {"architect": "architect",   "error": "error"})
    graph.add_conditional_edges("architect",         route_from_architect, {"context_retrieval": "context_retrieval", "error": "error"})
    graph.add_conditional_edges("context_retrieval", route_from_context,   {"code": "code",             "error": "error"})
    graph.add_conditional_edges("code",              route_from_code,      {"testing": "testing",       "error": "error"})
    graph.add_conditional_edges("testing",           route_from_testing,   {"devops": "devops",         "error": "error"})

    graph.add_edge("devops", END)
    graph.add_edge("error",  END)

    return graph.compile()

karma_engine = build_karma_engine()

def run_karma_engine(user_prompt: str) -> AgentState:
    """
    Run the full StackPilot pipeline for a given idea.

    Args:
        user_prompt: The developer's raw idea, e.g. "Build a REST API for a todo app"

    Returns:
        Final AgentState with generated_code, dockerfile, ci_cd_config, etc.
    """
    logger.info(f"Karma Engine starting for: {user_prompt[:80]}...")

    initial_state: AgentState = {
        "user_prompt":       user_prompt,
        "features":          [],
        "api_endpoints":     [],
        "db_tables":         [],
        "modules":           [],
        "framework":         "",
        "folder_structure":  {},
        "db_schema":         {},
        "tech_stack":        [],
        "retrieved_context": [],
        "generated_code":    {},
        "test_results":      {},
        "self_healed":       False,
        "dockerfile":        "",
        "ci_cd_config":      "",
        "stage":             "intake",
        "errors":            [],
    }

    result = karma_engine.invoke(initial_state)
    logger.info("Karma Engine completed.")
    return result