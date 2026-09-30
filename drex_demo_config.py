# DREX V2 — Demo Configuration
# ==============================
# This file documents the demonstration credential mechanism.
# For the SIH local demo, set DREX_DEMO_USERNAME and DREX_DEMO_PASSWORD
# as environment variables before launching the server.
#
# Defaults (for local SIH demonstration workstation only):
#   DREX_DEMO_USERNAME=drex_operator
#   DREX_DEMO_PASSWORD=SIH2026DREX
#
# NEVER commit real production credentials here.
# NEVER set DREX_ENV=production on a workstation using these defaults.
#
# To override for a specific demo session:
#   $env:DREX_DEMO_USERNAME = "your_username"
#   $env:DREX_DEMO_PASSWORD = "your_password"
#   python -m uvicorn drex_server:app --host 127.0.0.1 --port 8765

import os

# Demo-mode single account credentials (loaded from environment with safe defaults)
DEMO_USERNAME: str = os.environ.get("DREX_DEMO_USERNAME", "drex_operator")
DEMO_PASSWORD: str = os.environ.get("DREX_DEMO_PASSWORD", "SIH2026DREX")

# Demo persona role (always JUDGE_DEMO for SIH evaluation)
DEMO_ROLE_NAME: str = os.environ.get("DREX_DEMO_ROLE", "judge_demo")
DEMO_DISPLAY_NAME: str = os.environ.get("DREX_DEMO_DISPLAY_NAME", "DREX Demo Operator")
