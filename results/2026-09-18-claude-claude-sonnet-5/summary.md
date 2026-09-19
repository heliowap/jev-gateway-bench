# Benchmark summary

## chess-bugfix

| | Routing on | Routing off (baseline) |
| --- | ---: | ---: |
| Runs | 5 | 5 |
| Solved (every check passed) | 100% | 100% |
| Checks passed, median | 100% (+0%) | 100% |
| LLM requests, median | 26 (-26%) | 35 |
| Input tokens, median | 616,001 (-48%) | 1,194,249 |
| …of which cached | 94% | 95% |
| Output tokens, median | 16,623 (-41%) | 28,351 |
| …of which reasoning | 0 | 0 |
| Wall-clock seconds, median | 242.9 (-25%) | 322.6 |
| Jev calls, median | 26 | 0 |
| Requests Jev steered | 31% | 0% |
| Failed LLM requests, total | 0 | 0 |
| Agent timeouts | 0 | 0 |

## chess-san

| | Routing on | Routing off (baseline) |
| --- | ---: | ---: |
| Runs | 5 | 5 |
| Solved (every check passed) | 100% | 100% |
| Checks passed, median | 100% (+0%) | 100% |
| LLM requests, median | 32 (+3%) | 31 |
| Input tokens, median | 991,498 (+16%) | 855,415 |
| …of which cached | 96% | 96% |
| Output tokens, median | 23,487 (+9%) | 21,580 |
| …of which reasoning | 0 | 0 |
| Wall-clock seconds, median | 326.7 (+37%) | 237.8 |
| Jev calls, median | 32 | 0 |
| Requests Jev steered | 44% | 0% |
| Failed LLM requests, total | 0 | 0 |
| Agent timeouts | 0 | 0 |

Percentages in brackets compare the routing-on median with the baseline median.

