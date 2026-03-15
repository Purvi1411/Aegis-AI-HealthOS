import traceback
from agent import run_agent

try:
    print(run_agent('I have a headache'))
except Exception as e:
    traceback.print_exc()
