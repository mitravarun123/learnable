from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import learn, videos

app = FastAPI(title="LearnAble API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(learn.router)
app.include_router(videos.router)

@app.get("/")
def root():
    return {"message": "LearnAble API is running"}
