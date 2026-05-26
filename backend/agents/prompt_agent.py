import anthropic
import os

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

DISABILITY_INSTRUCTIONS = {
    "adhd": "Fast-paced, short segments, high energy, lots of color changes, quick rewards every 20 seconds",
    "autism": "Predictable calm structure, NO sudden changes, clear step-by-step, gentle repetitive patterns",
    "dyslexia": "Minimal text, heavy visuals, audio-focused, large clear fonts, image-based learning",
    "physical": "No physical interaction required, purely visual and audio, voice-narrated everything",
    "both": "Calm predictable structure, minimal text, strong audio narration, gentle pacing",
    "none": "Fun, colorful, engaging, age-appropriate, playful friendly characters"
}

async def generate_video_prompt(child_input: str, child_profile: dict) -> str:
    disability = child_profile.get("disability_type", "none")
    age = child_profile.get("age", 7)
    name = child_profile.get("name", "friend")
    style = DISABILITY_INSTRUCTIONS.get(disability, DISABILITY_INSTRUCTIONS["none"])

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=300,
        system="""You are an expert at writing prompts for children's educational 
        animated videos. Write vivid, specific, child-friendly prompts. 
        Respond with ONLY the prompt text, nothing else.""",
        messages=[{
            "role": "user",
            "content": f"""Write a video generation prompt for:
Topic: {child_input}
Child: {name}, age {age}
Style: {style}
Duration: exactly 2 minutes
Format: animated, colorful, friendly voiceover"""
        }]
    )
    return response.content[0].text

async def fuzzy_match_video(child_input: str, video_map: dict) -> str:
    topics = list(video_map.keys())
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=50,
        system="Match questions to the closest topic. Reply with ONLY the exact topic string.",
        messages=[{
            "role": "user",
            "content": f"Question: '{child_input}'\nTopics: {topics}\nBest match:"
        }]
    )
    matched = response.content[0].text.strip()
    return video_map.get(matched, list(video_map.values())[0])
