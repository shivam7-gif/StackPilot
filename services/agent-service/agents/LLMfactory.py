import os
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEndpoint , ChatHuggingFace

load_dotenv()


# ------------------------------------------------------------------ #
#  Available free HuggingFace models (good for code + reasoning)     #
# ------------------------------------------------------------------ #
#
#  "mistralai/Mistral-7B-Instruct-v0.3"       — fast, good general use
#  "mistralai/Mixtral-8x7B-Instruct-v0.1"     — stronger, slower
#  "Qwen/Qwen2.5-Coder-32B-Instruct"          — best for code generation
#  "microsoft/Phi-3.5-mini-instruct"           — very fast, lightweight
#  "meta-llama/Meta-Llama-3.1-8B-Instruct"    — needs HF Pro for some
#  "HuggingFaceH4/zephyr-7b-beta"             — reliable free option
#
# ------------------------------------------------------------------ #

def get_llm(model : str = "Qwen/Qwen2.5-Coder-32B-Instruct",temperature : float = 0.0) :
  endpoint = HuggingFaceEndpoint(repo_id = model, temperature=max(temperature,0.01),
  huggingfacehub_api_token =os.getenv("HUGGINGFACEHUB_.API_TOKEN"),
  max_new_tokens = 2048,
  timeout = 120,
  )
  return ChatHuggingFace(llm=endpoint)

# Basic model for planning , architecture , testing logic
default_llm = get_llm(
  model = "Qwen/Qwen2.5-Coder-32B-Instruct",
  temperature =0.0
)

# llm for H1 - H2
creative_llm = get_llm(
  model ="Qwen/Qwen2.5-coder-32B-instruct",
  temperature = 0.2
)

