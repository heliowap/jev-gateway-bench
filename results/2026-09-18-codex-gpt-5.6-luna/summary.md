# Benchmark summary

## chess-bugfix

| | Routing on | Routing off (baseline) |
| --- | ---: | ---: |
| Runs | 4 | 5 |
| Solved (every check passed) | 25% | 0% |
| Checks passed, median | 94% (+0%) | 94% |
| LLM requests, median | 20 (-15%) | 23 |
| Input tokens, median | 505,719 (-10%) | 558,893 |
| …of which cached | 89% | 93% |
| Output tokens, median | 10,519 (-12%) | 12,007 |
| …of which reasoning | 6,724 | 7,055 |
| Wall-clock seconds, median | 200.4 (+10%) | 182.0 |
| Jev calls, median | 20 | 0 |
| Requests Jev steered | 85% | 0% |
| Failed LLM requests, total | 1 | 1 |
| Agent timeouts | 0 | 0 |

## chess-san

| | Routing on | Routing off (baseline) |
| --- | ---: | ---: |
| Runs | 5 | 5 |
| Solved (every check passed) | 60% | 100% |
| Checks passed, median | 100% (+0%) | 100% |
| LLM requests, median | 14 (-42%) | 24 |
| Input tokens, median | 314,838 (-51%) | 648,243 |
| …of which cached | 91% | 93% |
| Output tokens, median | 6,809 (-14%) | 7,942 |
| …of which reasoning | 2,455 | 3,077 |
| Wall-clock seconds, median | 121.4 (-14%) | 140.7 |
| Jev calls, median | 14 | 0 |
| Requests Jev steered | 75% | 0% |
| Failed LLM requests, total | 0 | 0 |
| Agent timeouts | 0 | 0 |

Excluded as contaminated (the agent read files outside its sandbox that it had not created): chess-bugfix.on.3.

Only 4 runs per cell: agents vary a lot from one run to the next, so treat differences here as anecdotes, not measurements. Five or more repetitions per mode start to mean something.

