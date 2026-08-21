import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Razorpay AI Revenue Recovery Engine"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    
    # MongoDB
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "razorpay_recovery_db"
    
    # Razorpay Credentials
    RAZORPAY_KEY_ID: str = "rzp_test_hackathon_demo"
    RAZORPAY_KEY_SECRET: str = "rzp_sec_hackathon_demo_secret"
    RAZORPAY_WEBHOOK_SECRET: str = "whsec_hackathon_demo_secret"
    
    # Groq AI & LLM Settings
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "groq/compound-mini"
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    DEFAULT_LLM_MODEL: str = "gpt-4o-mini"
    
    # Guardrail Limits
    MAX_AUTO_RETRIES: int = 3
    MAX_AUTO_RECOVERY_AMOUNT: float = 50000.0  # ₹50,000
    HIGH_VALUE_THRESHOLD: float = 10000.0      # ₹10,000
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
