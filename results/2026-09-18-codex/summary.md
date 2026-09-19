# Benchmark summary

## chess-bugfix

| | Routing on | Routing off (baseline) |
| --- | ---: | ---: |
| Runs | 5 | 5 |
| Solved (every check passed) | 100% | 100% |
| Checks passed, median | 100% (+0%) | 100% |
| LLM requests, median | 5 (+0%) | 5 |
| Input tokens, median | 96,254 (-7%) | 103,128 |
| …of which cached | 80% | 83% |
| Output tokens, median | 1,226 (-57%) | 2,827 |
| …of which reasoning | 32 | 49 |
| Wall-clock seconds, median | 41.1 (-39%) | 67.4 |
| Jev calls, median | 5 | 0 |
| Requests Jev steered | 100% | 0% |
| Failed LLM requests, total | 0 | 1 |
| Agent timeouts | 0 | 0 |

## chess-san

| | Routing on | Routing off (baseline) |
| --- | ---: | ---: |
| Runs | 5 | 5 |
| Solved (every check passed) | 100% | 100% |
| Checks passed, median | 100% (+0%) | 100% |
| LLM requests, median | 7 (+0%) | 7 |
| Input tokens, median | 142,786 (+2%) | 140,372 |
| …of which cached | 83% | 88% |
| Output tokens, median | 3,663 (+0%) | 3,660 |
| …of which reasoning | 51 | 100 |
| Wall-clock seconds, median | 88.2 (+8%) | 81.4 |
| Jev calls, median | 7 | 0 |
| Requests Jev steered | 100% | 0% |
| Failed LLM requests, total | 0 | 1 |
| Agent timeouts | 0 | 0 |

Percentages in brackets compare the routing-on median with the baseline median.

