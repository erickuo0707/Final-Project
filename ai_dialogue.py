"""Gemini 角色對話；未設定金鑰或服務不可用時由 app.py 使用固定台詞。"""

import os
import threading
from datetime import date

import streamlit as st
from google import genai

MODEL_NAME = "gemini-3.5-flash"
MAX_AI_CALLS_PER_SESSION = 8
MAX_AI_CALLS_PER_PROCESS_PER_DAY = 100


def get_api_key() -> str:
    """讀取環境變數或 Streamlit Secrets，不輸出金鑰。"""
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if key:
        return key

    try:
        return str(st.secrets.get("GEMINI_API_KEY", "")).strip()
    except Exception:
        return ""


@st.cache_resource(show_spinner=False)
def _daily_budget() -> dict:
    """同一個 Streamlit 程序內共用的每日呼叫上限。"""
    return {"day": date.today(), "count": 0, "lock": threading.Lock()}


def generate_text(
    *, system_instruction: str, prompt: str, session_call_count: int
) -> tuple[str | None, str, bool]:
    """回傳 (生成文字, 狀態, 是否已嘗試呼叫 API)。"""
    api_key = get_api_key()
    if not api_key:
        return None, "no_key", False
    if session_call_count >= MAX_AI_CALLS_PER_SESSION:
        return None, "session_limit", False

    budget = _daily_budget()
    with budget["lock"]:
        today = date.today()
        if budget["day"] != today:
            budget["day"] = today
            budget["count"] = 0
        if budget["count"] >= MAX_AI_CALLS_PER_PROCESS_PER_DAY:
            return None, "daily_limit", False
        budget["count"] += 1

    try:
        client = genai.Client(api_key=api_key)
        interaction = client.interactions.create(
            model=MODEL_NAME,
            input=prompt,
            system_instruction=system_instruction,
            generation_config={"temperature": 0.7, "max_output_tokens": 180},
            timeout=20,
        )
        text = (interaction.output_text or "").strip()[:600]
        if not text:
            return None, "empty", True
        if not any("\u4e00" <= character <= "\u9fff" for character in text):
            return None, "invalid_language", True
        return text, "ok", True
    except Exception:
        return None, "unavailable", True
