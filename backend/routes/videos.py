from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client
import os

router = APIRouter()
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

class SaveVideoRequest(BaseModel):
    child_id: str
    topic: str
    video_url: str
    thumbnail_url: str = ""

@router.post("/api/save-video")
async def save_video(request: SaveVideoRequest):
    existing = supabase.table("saved_videos")\
        .select("id")\
        .eq("child_id", request.child_id)\
        .execute()

    if len(existing.data) >= 3:
        raise HTTPException(
            status_code=400,
            detail="You already saved 3 videos! Remove one first. 💾"
        )

    saved = supabase.table("saved_videos").insert({
        "child_id": request.child_id,
        "topic": request.topic,
        "video_url": request.video_url,
        "thumbnail_url": request.thumbnail_url
    }).execute()

    return {"success": True, "video": saved.data[0]}

@router.delete("/api/save-video/{video_id}")
async def delete_video(video_id: str):
    supabase.table("saved_videos").delete().eq("id", video_id).execute()
    return {"success": True}

@router.get("/api/saved-videos/{child_id}")
async def get_saved_videos(child_id: str):
    result = supabase.table("saved_videos")\
        .select("*")\
        .eq("child_id", child_id)\
        .order("saved_at", desc=True)\
        .execute()
    return {"videos": result.data}
