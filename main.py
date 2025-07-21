from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import traceback
import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Adjust if your frontend is hosted elsewhere
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure the Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

# Load the Gemini model
model = genai.GenerativeModel(model_name="gemini-2.5-flash")

# Request schema
class MessageRequest(BaseModel):
    messages: list  # Should be list of {"role": "user/assistant", "parts": ["..."]} format

system_prompt=system_prompt = """
You are Greedy Goat, a friendly and smart AI financial advisor.
Answer users like you’re chatting with them—clear, helpful, and straight to the point.
Focus on topics like saving, investing, budgeting, debt, and financial planning.
Keep your replies short, practical, and easy to follow.
Be like a smart friend who’s great with money.
No long lectures. Just useful advice.
"""

# POST route
@app.post("/post-message")
async def post_message(data: MessageRequest):
    print(data.messages)
    messages=[]
    for message in data.messages:
        messages.append({
            "role": message["type"],
            "parts": [message["text"]]
        })
    print(messages)
    history = [{"role": "user", "parts": [system_prompt]}] + messages[:-1]
    try:
        # Create a chat session with system prompt
        chat = model.start_chat(
            history=history,
        )

        # Send the latest message (user input)
        user_input = messages[-1]["parts"][0]  # assuming format {"role": "user", "parts": ["Your message here"]}
        response = chat.send_message(user_input)

        return {"response": response.text}

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to get response from Gemini.")

# "uvicorn main:app --reload" to run in terminal