import pyfirmata2, asyncio, pyautogui, time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal
from pynput.keyboard import Controller
from contextlib import asynccontextmanager

PORT = pyfirmata2.Arduino.AUTODETECT
board = pyfirmata2.Arduino(PORT)
board.samplingOn()

keyboard = Controller()

@asynccontextmanager
async def lifetime(app: FastAPI):
    asyncio.create_task(arduino_keyboard_input())
    yield

app = FastAPI(lifespan=lifetime)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get('/')
def index():
    board.digital[13].write(True) # write onboard led to high for debug

def change_port_status(register: Literal['analog'] | Literal['digital'], port: int, status: bool | int) -> None:
    if register == 'analog':
        board.analog[port].write(status)
    elif register == 'digital':
        board.digital[port].write(status)

class LEDModel(BaseModel):
    port: int
    status: bool

@app.post('/led')
def change_led(inputs: LEDModel):
    change_port_status('digital', inputs.port, inputs.status)


THRESHOLD = 0.8           # Analog value trigger threshold
COOLDOWN = 0.5            # Seconds between repeated triggers

# Track last known state and last trigger time
sensor_state = {
    'green': {'last_value': 0.0, 'last_trigger': 0.0},
    'red': {'last_value': 0.0, 'last_trigger': 0.0}
}

def handle_sensor(name: str, key: str, value: float):
    now = time.monotonic()
    state = sensor_state[name]

    # Detect rising edge: crossed from below to above threshold
    rising_edge = value > THRESHOLD and state['last_value'] <= THRESHOLD
    enough_time_passed = now - state['last_trigger'] > COOLDOWN

    if rising_edge and enough_time_passed:
        pyautogui.press(key)
        state['last_trigger'] = now

    state['last_value'] = value

async def arduino_keyboard_input():
    button_green = board.analog[1]
    button_red = board.analog[2]

    button_green.register_callback(lambda v: handle_sensor('green', '1', v))
    button_red.register_callback(lambda v: handle_sensor('red', '2', v))

    button_green.enable_reporting()
    button_red.enable_reporting()

    while True:
        await asyncio.sleep(3600)
