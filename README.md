# jev-gateway-bench

Does routing tool choices through Jev make a coding agent cheaper without making it worse?

This is the benchmark for [jev-gateway](https://github.com/vinilana/jev-gateway). It gives a real
coding agent (Codex or Claude Code) the same task twice, once with Jev routing on and once with it
off, meters every token through the gateway, and scores the result with a verifier the agent never
sees.

## Results so far

**These are preliminary: one run per mode.** Agents vary a lot from one run to the next, so read
them as a first signal, not a measurement. More repetitions are the next step.

Task `chess-bugfix` (find and fix five injected bugs in a chess engine), Codex 0.154 on a ChatGPT
subscription, model `gpt-6-astra`, real Jev (`jev-latest`), 2026-09-18:

| | Routing on | Routing off (baseline) | Difference |
| --- | ---: | ---: | ---: |
| Hidden checks passed | 36 / 36 | 36 / 36 | same |
| LLM requests | 4 | 6 | -33% |
| Input tokens | 76,678 | 118,709 | -35% |
| of which cached | 75% | 78% | |
| Output tokens | 1,313 | 3,231 | -59% |
| Wall-clock seconds | 35 | 88 | -60% |
| Jev calls | 4 | 0 | |
| Jev input tokens | 18,477 | 0 | about $0.0008 |

With routing on, Jev decided all four requests: three forced the `exec` tool (confidence 0.91,
0.99 and 0.94) and the last one, after the tests passed, switched tools off so the model would
just answer (0.98). Each Jev call took 0.3 to 0.9 seconds.

An earlier pair of runs the same day, made before a token-metering bug in the gateway was fixed,
recorded no tokens but showed the same shape: 4 requests and 40 seconds with routing on, 6 requests
and 69 seconds with it off, both solving every check.

Raw data is in [results/](results/): `runs.jsonl`, `summary.md`, and for every run the verifier's
output, the size of the agent's change, and the gateway's per-request metadata. Agent transcripts
are not published.

## Run it yourself

You need Node.js 22.15 or newer, a [TypeSafe API key](https://docs.typesafe.ai/introduction) in
`~/.jev-gateway/.env` (see the [gateway's quick start](https://github.com/vinilana/jev-gateway#quick-start)),
and Codex and/or Claude Code installed and logged in.

```bash
git clone https://github.com/vinilana/jev-gateway-bench.git
cd jev-gateway-bench
npm install

npm run selftest                                     # prove the tasks measure what they claim (no agent, ~20 s)
npm run bench -- --list                              # tasks and options
npm run bench -- --agent codex --tasks chess-bugfix  # one run with routing on, one with it off
npm run bench -- --agent codex --reps 5 --prices 1.25,0.125,10
```

**Real agents spend real quota.** Every run is a full agent session. Start with one task and
`--reps 1`, look at the numbers, and scale up from there.

## How a run works

1. A fresh workspace is created in a temp directory from the task's starting files and committed to
   a git repository of its own.
2. A fresh gateway is started just for this run, on its own port (`--port`, default 8890), with
   routing on or off. Gateways you use every day are not touched, and nothing another session does
   can leak into the numbers.
3. The agent is started unattended inside the workspace, pointed at that gateway exactly the way
   `jev-codex` and `jev-claude` do it, with edits and test runs allowed. It gets the task prompt
   and a time limit.
4. The gateway's own metering gives the totals for the run: LLM requests, input tokens (and how
   many were cached), output tokens (and how many were reasoning), Jev calls and tokens, and how
   each request was handled.
5. A hidden verifier scores the workspace.

Modes alternate within a repetition and swap order between repetitions, so neither one always goes
first.

Results land in `results/<timestamp>/`: `runs.jsonl` (one line per run), `summary.md`, and per run
the agent's output, the gateway log, the verifier's output and a diff summary. Rebuild a summary
any time with `npm run report -- <dir> [--prices in,cached,out]`.

## Reading the summary

- **Solved** means every hidden check passed. A cheaper run that is not solved is not a saving.
- **Cost per solved task** divides everything spent, failed runs included, by the runs that were
  solved. It needs `--prices` (USD per million input, cached input and output tokens for your
  model) and adds Jev's own cost. This is the number to decide on.
- **Requests Jev steered** is the share of LLM requests that were not plain passthrough. If it is
  low, routing had little chance to matter: the gateway's dashboard explains why.
- **Failed LLM requests** and **agent timeouts** catch the expensive failure: a wrongly forced tool
  can derail a turn, and one derailment can cost more than many routed turns save.
- With fewer than five runs per mode the summary says so.

## The chess tasks

All three are about one chess rules engine with a small, exact API
([SPEC.md](tasks/chess/SPEC.md)). Chess was chosen because it has an unusually objective
yardstick: **perft**, the number of move sequences of a given length from a position. The counts
are published, and one wrong rule anywhere (en passant, castling, pins, promotion) changes them.
The verifier runs perft through the public API on six standard positions, plus targeted checks for
FEN handling, draws and game endings.

| Task | The agent has to | Kind of work |
| --- | --- | --- |
| `chess-engine` | Build the whole engine from the spec | Long generation, many test runs |
| `chess-bugfix` | Find and fix five injected bugs, with failing perft tests as the only clue | Exploration and debugging |
| `chess-san` | Add algebraic notation (`san`, `moveSan`, `history`) to a working engine | A focused feature |

They differ on purpose. Routing may pay off on the mechanical middle turns of one kind of task and
not on another, and an average over one kind of work would hide that.

`tasks/chess/reference/chess.js` is a complete solution. It never reaches a workspace: it exists to
prove the verifier right, and the bugfix and SAN tasks are generated from it. `npm run selftest`
checks that the reference passes every check, that no starting workspace already passes, and that
each injected bug is caught on its own.

One caveat: this repository is public, so an agent with web access could in principle find the
reference. The agents work in a temp directory, are never told it exists, and the tasks give them
no reason to go looking.

## Testing the benchmark without an agent

`--agent fake` replaces the agent with a script that sends a few requests through the gateway and
then writes the reference solution. Together with the fake provider and the gateway's mock Jev, the
whole pipeline runs in seconds and costs nothing:

```bash
node dev/fake-upstream.mjs &
MOCK_JEV_SCRIPT=exec_command node node_modules/jev-gateway/scripts/mock-jev.mjs &
TYPESAFE_API_KEY=mock TYPESAFE_BASE_URL=http://127.0.0.1:8799 npm run bench -- --agent fake --reps 2
```

## Adding a task

A task is an object with an `id`, a `title`, a `prompt`, a `timeoutMinutes`, a `setup(workspace)`
that writes the starting files, and a `verify(workspace)` that returns the command line of a
verifier. The verifier prints `{"total": n}` and then one `{"name", "ok"}` JSON line per check, as
it goes, so a solution that hangs keeps the credit it earned before the timeout. Add the task to
`TASKS` in `run.mjs`.

## License

MIT
