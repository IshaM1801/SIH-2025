from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import json

# 1. Import the CORS middleware
from fastapi.middleware.cors import CORSMiddleware

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema.runnable import RunnablePassthrough
from langchain.schema.output_parser import StrOutputParser

load_dotenv()

app = FastAPI()

# 2. Define the frontend origins that are allowed to connect
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://fixmycity-opal.vercel.app", # Add your deployed frontend URL here
]

# 3. Add the CORS middleware to your application
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers
)


class ChatRequest(BaseModel):
    query: str

llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash",
                             google_api_key=os.getenv("GOOGLE_API_KEY"),
                             temperature=0.7)

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful citizen service chatbot for Mumbai. Keep answers concise and clear. If you don't know the answer, say that you don't know."),
    ("human", "{input}")
])

chain = (
    {"input": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

with open("citizen_services_geo.json", "r") as f:
    department_data = json.load(f)
    
def find_department(location: str, department: str = None):
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
    if not results:
        return "No information found."
        
    reply_parts = []
    for dept in results:
        reply_parts.append(
            f"📌 {dept['department']} - {dept['location']}\n"
            f"📍 Address: {dept['address']}\n"
            f"📞 Phone: {dept['phone']}"
        )
    return "\n\n".join(reply_parts)

@app.post("/chat")
async def chat(request: ChatRequest):
    user_query = request.query.lower()
    
    departments = ["fire", "water", "road", "electricity", "pwd"]
    locations = ["bandra", "andheri", "dadar", "borivali", "chembur"]
    
    matched_dept = None
    for dept in departments:
        if dept in user_query:
            matched_dept = dept
            break
            
    matched_loc = None
    for loc in locations:
        if loc in user_query:
            matched_loc = loc
            break
    
    if matched_loc:
        results = find_department(matched_loc, matched_dept)
        if results:
            return {"reply": f"Here's what I found for {matched_loc.title()}:\n\n{format_results(results)}"}
        else:
            return {"reply": f"Sorry, I couldn't find any department information for {matched_loc.title()}."}
        
    response = await chain.ainvoke(user_query)
    return {"reply": response}

