"""
packages/types/agent_state.py
Shared TypedDict state that flows through the entire LangGraph pipeline.
Every agent reads from and writes to this object.
"""

from typing import TypedDict, Optional


class AgentState(TypedDict):
    # --- Input ---
    user_prompt: str               # Raw idea from the developer

    #Planner output ---
    features: list[str]
    api_endpoints: list[str]
    db_tables: list[str]
    modules: list[str]

    # Architect output ---
    framework: str
    folder_structure: dict
    db_schema: dict
    tech_stack: list[str]

    # KarmaRepo context ---
    retrieved_context: list[str]   # Relevant docs/files pulled before coding

    #  Codegen output ---
    generated_code: dict           # {filename: code_string}

    # Testing output ---
    test_results: dict             # {test_name: pass/fail}
    self_healed: bool              # Did the self-heal agent fix anything?

    # DevOps output ---
    dockerfile: str
    ci_cd_config: str

    # -
    stage: str                     # Current stage name for graph routing
    errors: list[str]              # Accumulated errors across stages