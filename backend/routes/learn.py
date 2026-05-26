from fastapi import APIRouter
from pydantic import BaseModel
import asyncio
import json
from agents.prompt_agent import generate_video_prompt, fuzzy_match_video
from agents.game_agent import generate_game

router = APIRouter()

with open("video_map.json") as f:
    VIDEO_MAP = json.load(f)

class LearnRequest(BaseModel):
    child_input: str
    child_profile: dict

@router.post("/api/learn")
async def learn(request: LearnRequest):
    # Both agents run at the SAME TIME
    video_prompt_task = generate_video_prompt(
        request.child_input,
        request.child_profile
    )
    game_task = generate_game(
        request.child_input,
        request.child_profile
    )

    video_prompt, game_data = await asyncio.gather(
        video_prompt_task,
        game_task
    )

    video_url = await fuzzy_match_video(request.child_input, VIDEO_MAP)

    return {
        "video_url": video_url,
        "topic": request.child_input,
        "video_prompt": video_prompt,
        "game": game_data
    }
