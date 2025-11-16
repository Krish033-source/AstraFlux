# Optional FastAPI stub if you later want to replace ruleBased analyzer with an LLM.
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Log(BaseModel):
    message: str
    stack: str = ""
    meta: dict | None = None

@app.get("/health")
def health():
    return {"ok": True, "service": "astra-llm-stub"}

@app.post("/rca")
def rca(log: Log):
    # Replace this static JSON with actual LLM call later
    return {
        "root_cause": "Stub LLM",
        "why": "This is a placeholder explaining the error.",
        "fix": "Provide a concrete fix.",
        "severity": "med",
        "snippet": "// example code"
    }
