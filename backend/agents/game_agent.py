import anthropic
import json
import os

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

GAME_TYPES = {
    "adhd": "fast tap game with immediate rewards, very short question",
    "autism": "simple predictable matching game, same structure every time",
    "dyslexia": "image matching game, minimal reading required",
    "physical": "single large button game, voice-answer supported",
    "both": "image tap game with voice support, calm pace",
    "none": "fun colorful multiple choice with big friendly buttons"
}

async def generate_game(child_input: str, child_profile: dict) -> dict:
    disability = child_profile.get("disability_type", "none")
    age = child_profile.get("age", 7)
    game_style = GAME_TYPES.get(disability, GAME_TYPES["none"])

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=400,
        system="""You create mini games for children. 
        Respond with ONLY valid JSON, no markdown, no extra text.""",
        messages=[{
            "role": "user",
            "content": f"""Create a mini game about "{child_input}" for age {age}.
Style: {game_style}

Return ONLY this JSON:
{{
  "question": "fun simple question (max 8 words)",
  "emoji": "2-3 relevant emojis",
  "options": [
    {{"text": "option 1", "emoji": "🎯"}},
    {{"text": "option 2", "emoji": "🌟"}},
    {{"text": "option 3", "emoji": "🎨"}}
  ],
  "correct_index": 0,
  "correct_message": "Amazing! You got it! 🎉",
  "try_again_message": "Almost there! Try again! 💪"
}}"""
        }]
    )
    text = response.content[0].text.strip()
    clean = text.replace("```json", "").replace("```", "").strip()
    return json.loads(clean)
