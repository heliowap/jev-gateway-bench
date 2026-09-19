# Benchmark summary

## chess-bugfix

| | Routing on | Routing off (baseline) |
| --- | ---: | ---: |
| Runs | 5 | 5 |
| Solved (every check passed) | 100% | 100% |
| Checks passed, median | 100% (+0%) | 100% |
| LLM requests, median | 9 (-36%) | 14 |
| Input tokens, median | 201,773 (-40%) | 335,327 |
| …of which cached | 89% | 91% |
| Output tokens, median | 3,211 (-57%) | 7,502 |
| …of which reasoning | 1,513 | 2,979 |
| Wall-clock seconds, median | 77.7 (-36%) | 122.1 |
| Jev calls, median | 9 | 0 |
| Requests Jev steered | 89% | 0% |
| Failed LLM requests, total | 1 | 0 |
| Agent timeouts | 0 | 0 |

## chess-san

| | Routing on | Routing off (baseline) |
| --- | ---: | ---: |
| Runs | 5 | 5 |
| Solved (every check passed) | 100% | 100% |
| Checks passed, median | 100% (+0%) | 100% |
| LLM requests, median | 7 (-36%) | 11 |
| Input tokens, median | 146,673 (-39%) | 239,963 |
| …of which cached | 85% | 90% |
| Output tokens, median | 5,096 (-9%) | 5,617 |
| …of which reasoning | 1,981 | 1,911 |
| Wall-clock seconds, median | 78.5 (-16%) | 94.0 |
| Jev calls, median | 7 | 0 |
| Requests Jev steered | 86% | 0% |
| Failed LLM requests, total | 0 | 0 |
| Agent timeouts | 0 | 0 |

Percentages in brackets compare the routing-on median with the baseline median.

