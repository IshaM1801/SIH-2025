from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import json

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from langchain.memory import ConversationBufferMemory

load_dotenv()

app = FastAPI()

class ChatRequest(BaseModel):
  query: str

llm = ChatGoogleGenerativeAI(model = "gemini-1.5-flash",
                             api_key=os.getenv("GOOGLE_API_KEY"))

memory = ConversationBufferMemory(return_messages=True)

prompt = ChatPromptTemplate.from_messages([
  ("system", "You are helpful citizen service chatbot. Keep answers short and clear")
])

with open("citizen_services_geo.json", "r") as f:
  department_data = json.load(f)
  
def find_department(location: str, department: str = None):
  """Search dataset by location (and optionally department)."""
  results = []
  for dept in department_data:
    if location.lower() in dept["location"].lower():
      if department:
        if department.lower() in dept["department"].lower():
          results.append(dept)
      else:
        results.append(dept)
  return results

def format_results(results):
    """Format department results into a chatbot-friendly string."""
    reply_parts = []
    for dept in results:
        reply_parts.append(
            f"📌 {dept['department']} - {dept['location']}\n"
            f"📍 Address: {dept['address']}\n"
            f"📞 Phone: {dept['phone']}\n"
            f"🌍 Coordinates: {dept['lat']}, {dept['lon']}\n"
        )
    return "\n---\n".join(reply_parts)

@app.post("/chat")
async def chat(request: ChatRequest):
  user_query = request.query.lower()
  
  departments = ["fire", "water", "road", "electricity"]
  matched_dept = None
  for dept in departments:
    if dept in user_query:
      matched_dept = dept
      break
  
  if "near me" in user_query or "my location" in user_query:
    location = "Bandra"
    results = find_department(location, matched_dept)
    if results:
      return{"reply" : f"{results}"}
    else:
      return{"reply" : "Sorry I couldn't find any info for bandra"}
    
  for loc in ["bandra", "andheri", "dadar", "borivali", "chembur"]:
    if loc in user_query:
      results = find_department(loc, matched_dept)
      if results:
        return {"reply": f"Here are the {loc.title()} contacts:\n\n{format_results(results)}"}
      else:
        return {"reply": f"Sorry, no department info found for {loc.title()}."}
    
  response = await llm.ainvoke(user_query)
  return {"reply": response.content}