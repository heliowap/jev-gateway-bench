# Benchmark summary

## chess-bugfix

| | Routing on | Routing off (baseline) |
| --- | ---: | ---: |
| Runs | 5 | 5 |
| Solved (every check passed) | 100% | 100% |
| Checks passed, median | 100% (+0%) | 100% |
| LLM requests, median | 18 (-14%) | 21 |
| Input tokens, median | 405,881 (-22%) | 523,359 |
| …of which cached | 92% | 93% |
| Output tokens, median | 16,693 (-7%) | 17,876 |
| …of which reasoning | 0 | 0 |
| Wall-clock seconds, median | 218.0 (+2%) | 214.2 |
| Jev calls, median | 18 | 0 |
| Requests Jev steered | 37% | 0% |
| Failed LLM requests, total | 0 | 0 |
| Agent timeouts | 0 | 0 |

## chess-san

| | Routing on | Routing off (baseline) |
| --- | ---: | ---: |
| Runs | 5 | 5 |
| Solved (every check passed) | 100% | 100% |
| Checks passed, median | 100% (+0%) | 100% |
| LLM requests, median | 25 (+47%) | 17 |
| Input tokens, median | 676,113 (+61%) | 419,985 |
| …of which cached | 95% | 92% |
| Output tokens, median | 20,152 (+22%) | 16,529 |
| …of which reasoning | 0 | 0 |
| Wall-clock seconds, median | 389.5 (+83%) | 212.8 |
| Jev calls, median | 25 | 0 |
| Requests Jev steered | 44% | 0% |
| Failed LLM requests, total | 0 | 0 |
| Agent timeouts | 0 | 0 |

Percentages in brackets compare the routing-on median with the baseline median.

