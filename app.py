import json
import boto3
import uuid
import datetime

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

bedrock = boto3.client("bedrock-runtime", region_name="us-east-1")
s3 = boto3.client("s3")

LOG_BUCKET = "wind-turbine-chat-logs"


# -------- Request Schema --------

class ChatRequest(BaseModel):
    question: str
    kpis: dict


# -------- Claude Call --------

def call_claude(question, kpis):

    prompt = f"""
You are a wind energy analytics expert.

Answer only using this data:

{json.dumps(kpis, indent=2)}

Question:
{question}

Give business-focused insights.
"""

    payload = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 800,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ]
    }

    response = bedrock.invoke_model(
        modelId="anthropic.claude-3-sonnet-20240229-v1:0",
        body=json.dumps(payload),
        contentType="application/json",
        accept="application/json"
    )

    body = json.loads(response["body"].read())

    return body["content"][0]["text"]


# -------- Save Logs --------

def save_log(q, a):

    log = {
        "id": str(uuid.uuid4()),
        "time": str(datetime.datetime.utcnow()),
        "question": q,
        "answer": a
    }

    s3.put_object(
        Bucket=LOG_BUCKET,
        Key=f"logs/{log['id']}.json",
        Body=json.dumps(log),
        ContentType="application/json"
    )


# -------- API Endpoint --------

@app.post("/chat")
def chat(req: ChatRequest):

    answer = call_claude(req.question, req.kpis)

    save_log(req.question, answer)

    return {
        "answer": answer
    }
