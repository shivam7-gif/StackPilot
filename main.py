

import sys
import json
import logging
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  [%(name)s]  %(levelname)s  %(message)s",
)
logger = logging.getLogger(__name__)


def run(prompt: str, output_dir: str = "./output") -> dict:
   
    from services.orchestrator.karma_engine import run_karma_engine

    result = run_karma_engine(prompt)

    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)

    generated = result.get("generated_code", {})
    for filename, content in generated.items():
        filepath = out / filename.lstrip("/")
        filepath.parent.mkdir(parents=True, exist_ok=True)
        filepath.write_text(content)
        logger.info(f"  Written: {filepath}")

    if result.get("dockerfile"):
        (out / "Dockerfile").write_text(result["dockerfile"])
        logger.info("  Written: Dockerfile")

    if result.get("ci_cd_config"):
        ci_path = out / ".github" / "workflows" / "ci.yml"
        ci_path.parent.mkdir(parents=True, exist_ok=True)
        ci_path.write_text(result["ci_cd_config"])
        logger.info("  Written: .github/workflows/ci.yml")

    summary = {
        "prompt":       prompt,
        "features":     result.get("features", []),
        "framework":    result.get("framework", ""),
        "tech_stack":   result.get("tech_stack", []),
        "files":        list(generated.keys()),
        "self_healed":  result.get("self_healed", False),
        "errors":       result.get("errors", []),
    }
    (out / "karma_summary.json").write_text(json.dumps(summary, indent=2))
    logger.info(f"\n Done. {len(generated)} files written to {output_dir}/")

    return result


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python main.py \"Your app idea here\"")
        sys.exit(1)

    prompt = " ".join(sys.argv[1:])
    run(prompt)