# Pagos repository instructions

> **STOP. Read `PROJECT_STATE.md` before anything else, and update it before
> your final response. Every session, every task, no exceptions.**
>
> These rules have been ignored in practice: a long session read the file once
> at the start, then completed roughly fifteen further tasks without updating
> it once, leaving the user to re-explain context that was supposed to be
> written down. Reading it is not enough. The update is part of finishing.
>
> A task is not complete until `PROJECT_STATE.md` reflects it — even if the
> task changed no code, even if the user did not ask.

## Mandatory project continuity

These rules apply to every session and every task in this repository, whichever
assistant is running:

1. Read the root `PROJECT_STATE.md` before doing any work, including analysis, planning, edits, or commands beyond locating and reading that file.
2. Before the final response for every task, update `PROJECT_STATE.md` automatically. Do this even when the task made no code changes; record any newly verified state, decision, blocker, or next step that matters.
3. Keep `PROJECT_STATE.md` consistent with the actual repository. Verify relevant files, Git state, and test/build results rather than relying on prior chat context or assumptions.
4. Maintain, at minimum: completed work, the current step, important decisions, unresolved issues, test/build status, and one exact next action.
5. Treat `PROJECT_STATE.md` as a current handoff snapshot, not an append-only diary. Replace outdated statements, remove resolved or stale information, and keep only history that is still useful for continuing the project.
6. Never claim that work, a build, a test, a commit, a push, or device validation succeeded unless there is repository or command evidence for it. Clearly label configured-but-not-run work.
7. When a task changes the worktree, update the state file after the implementation and verification so it describes the resulting state.
8. Record *why* a decision was made, not only what was decided. A future
   session that knows only the "what" will reverse it as an inconsistency. The
   design decisions and traps sections exist for exactly this reason.
9. Never report a visual change as done on the strength of source code or a
   computed style alone. Confirm it by screenshot. This project has produced
   several changes that were provably correct at every level except the one
   that mattered.

`PROJECT_STATE.md` is the continuity source of truth. Product constraints and scope are also documented in `CLAUDE.md`; if those instructions conflict with the repository or with each other, record the conflict in `PROJECT_STATE.md` and ask before making a consequential assumption.
