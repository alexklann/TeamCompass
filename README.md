# Team 8 Compass
KiQui is an environmental AI quiz game.
This repository includes both the game as a nodejs application
and the python fastapi server for communicating with the arduino from nodejs.

# Run Project
Frontend:
```
npm install
npx vite
```

Backend:
Unix:
```
cd arduino-backend
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
fastapi run main.py
```