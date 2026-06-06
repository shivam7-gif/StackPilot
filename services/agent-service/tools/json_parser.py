"""
services/tools/json_parser.py
Safely extract JSON from LLM responses.
LLMs sometimes wrap JSON in markdown fences — this handles all cases.
"""

import json
import re
import logging

logger = logging.getLogger(__name__)


def parse_llm_json(raw: str, fallback: dict | None = None) -> dict:
 
    if fallback is None:
        fallback = {}

    cleaned = re.sub(r"```(?:json)?\s*", "", raw).replace("```", "").strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    match = re.search(r"\[.*\]", cleaned, re.DOTALL)
    if match:
        try:
            return {"items": json.loads(match.group())}
        except json.JSONDecodeError:
            pass

    logger.warning(f"Failed to parse JSON from LLM response. Raw (first 200 chars): {raw[:200]}")
    return fallback