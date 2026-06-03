from typing import TypedDict , Annotated
from langgraph.graph import StateGraph , END
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage , SystemMessage

llm = ChatAnthropic(model="claude-opus-4.5",temperature=0)

class AgentState(TypedDict):
  user_prompt = str
  features : list[str]
  architecture : dict
  generated_code = dict
  errors: list[str]
  stage : str

def planner_agent(state : AgentState)-> AgentState:
  response = llm.invoke([
    SystemMessage(content = "You are a software planner , Return JSON with keys : features,api_endpoints , db_tables , modules ."),
    HumanMessage(content = f"Plan This app : {state['user_prompt']}")
  ])
  import json , re
  data = json.loads(re.search(r'\{.*\}', response.content, re.DOTALL).group())
  return {**state , "features" : data.get("features",[]), "stage" : "architect"}

def architect_agent(state : AgentState)-> AgentState:
  response = llm.invoke([
        SystemMessage(content="You are a software architect. Return JSON with: framework, folder_structure, db_schema, tech_stack."),
        HumanMessage(content=f"Design architecture for features: {state['features']}")
    ])
  import json, re
  data = json.loads(re.search(r'\{.*\}', response.content, re.DOTALL).group())
  return {**state , "architecture" : data , "stage": "code"}

def coder_agent(state : AgentState)-> AgentState:
  response = llm.invoke([
        SystemMessage(content="You are a senior engineer. Generate production-ready code files. Return JSON: {filename: code_string}."),
        HumanMessage(content=f"Generate code for: {state['architecture']}")
    ])
  import json, re
  code = json.loads(re.search(r'\{.*\}', response.content, re.DOTALL).group())
  return {**state, "generated_code": code, "stage": "done"}


graph = StateGraph(AgentState)
graph.add_node("plan",planner_agent)
graph.add_node("architect",architect_agent)
graph.add_node("code",coder_agent)
graph.set_entry_point("plan")
graph.add_conditional_edges("plan", route, {"architect": "architect"})
graph.add_conditional_edges("architect", route, {"code": "code"})
graph.add_edge("code", END)

karma_engine = graph.compile()

if __name__ == "__main__":
  result = karma_engine.invoke([{"user_prompt" :  "Build a REST API for a todo app", "stage": "plan"}])
  print(result["generated_code"])
