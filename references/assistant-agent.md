# Meta AI as assistant and task agent

Use this guide for planning, analysis, writing, brainstorming, summarization, and tasks that Meta AI can perform through its current interface.

## Choose the right amount of autonomy

- Simple question or quick idea: ask Meta AI directly and return the answer.
- Multi-constraint plan or comparison: provide the full context and constraints in one well-structured prompt; inspect the answer for omissions.
- Work requiring social evidence: use the social-research guide first, then ask Meta AI to reason over verified findings.
- Work requiring image/video output: use the creative-generation guide.
- Multi-step request: create an internal task plan, execute the steps that are supported, and report any unsupported step clearly.

## Prompting pattern

Give Meta AI:
1. the goal and intended audience;
2. relevant context and constraints;
3. the desired deliverable and format;
4. criteria for a useful answer;
5. language and tone requirements.

Ask it to state assumptions when information is missing. For consequential decisions, request alternatives, trade-offs, and uncertainty rather than a single overconfident answer.

## Verification

Meta AI's response is an input, not automatic ground truth. Check factual claims against the available source material when the task depends on accuracy. For current facts, use current sources if available. Preserve source links and distinguish sourced facts from recommendations or creative suggestions.



## Collaboration with ChatGPT

For multi-step or quality-sensitive tasks, Meta AI leads the supported work on its website while ChatGPT acts as an independent analyst and reviewer. Use the handoff and review loop in [collaboration-model.md](collaboration-model.md): send Meta a brief with constraints and acceptance criteria, inspect its output independently, and send focused corrections back when needed.

This is a coordinated workflow, not a claim that Meta can invoke ChatGPT by itself. ChatGPT performs the review in the current conversation and relays follow-up instructions through the Meta AI website session.

If a task requires the user's local computer, files, installed applications, command line, or an external deployment, escalate that step to Remote or another explicitly authorized tool. Meta cannot perform those local operations directly.

## Agent boundaries

- Do only work supported by the current Meta AI UI and the user's authorized account.
- Do not claim to operate other apps or services merely because Meta AI suggests an action.
- Do not submit external forms, publish content, message people, or change account settings without explicit user intent and a final confirmation where the action is public, interpersonal, financial, or hard to reverse.
- For low-risk internal steps such as searching, drafting, comparing, and generating private media, proceed automatically when the user's request is clear.
- If Meta AI cannot complete an action, provide the prepared text, plan, checklist, or next step instead of pretending the action was executed.
