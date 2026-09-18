# Benchmark summary

## chess-bugfix

| | Routing on | Routing off (baseline) |
| --- | ---: | ---: |
| Runs | 1 | 1 |
| Solved (every check passed) | 100% | 100% |
| Checks passed, median | 100% (+0%) | 100% |
| LLM requests, median | 4 (-33%) | 6 |
| Input tokens, median | 0 | 0 |
| …of which cached | n/a | n/a |
| Output tokens, median | 0 | 0 |
| …of which reasoning | 0 | 0 |
| Wall-clock seconds, median | 39.5 (-43%) | 69.0 |
| Jev calls, median | 4 | 0 |
| Requests Jev steered | 100% | 0% |
| Failed LLM requests, total | 0 | 0 |
| Agent timeouts | 0 | 0 |

Only 1 run per cell: agents vary a lot from one run to the next, so treat differences here as anecdotes, not measurements. Five or more repetitions per mode start to mean something.
