# Benchmark summary

## chess-bugfix

| | Routing on | Routing off (baseline) |
| --- | ---: | ---: |
| Runs | 5 | 5 |
| Solved (every check passed) | 100% | 100% |
| Checks passed, median | 100% (+0%) | 100% |
| LLM requests, median | 14 (-22%) | 18 |
| Input tokens, median | 276,229 (-19%) | 341,729 |
| …of which cached | 91% | 92% |
| Output tokens, median | 8,675 (-13%) | 10,022 |
| …of which reasoning | 0 | 0 |
| Wall-clock seconds, median | 148.0 (+6%) | 139.1 |
| Jev calls, median | 14 | 0 |
| Requests Jev steered | 46% | 0% |
| Failed LLM requests, total | 0 | 0 |
| Agent timeouts | 0 | 0 |

## chess-san

| | Routing on | Routing off (baseline) |
| --- | ---: | ---: |
| Runs | 5 | 5 |
| Solved (every check passed) | 100% | 100% |
| Checks passed, median | 100% (+0%) | 100% |
| LLM requests, median | 13 (-19%) | 16 |
| Input tokens, median | 330,768 (-27%) | 450,325 |
| …of which cached | 91% | 91% |
| Output tokens, median | 13,497 (-24%) | 17,708 |
| …of which reasoning | 0 | 0 |
| Wall-clock seconds, median | 167.2 (-26%) | 224.6 |
| Jev calls, median | 13 | 0 |
| Requests Jev steered | 50% | 0% |
| Failed LLM requests, total | 0 | 0 |
| Agent timeouts | 0 | 0 |

Percentages in brackets compare the routing-on median with the baseline median.

