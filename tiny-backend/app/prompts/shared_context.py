"""
Shared context — app/prompts/shared_context.py

WHY A SHARED CONTEXT?
  All three AI prompts (onboarding, missed_day, weekly) need the same
  foundational Atomic Habits knowledge. Putting it in one place means:
  - No drift: updating here updates all prompts
  - No duplication: the same quotes don't need to appear three times
  - Clarity: onboarding.py, missed_day.py, weekly.py only add what's unique to them

THE CORE INSIGHT ABOUT PROMPT ENGINEERING:
  An LLM without injected source material will give generic habit advice.
  An LLM that receives the actual quotes, formulas, and frameworks from the
  book will reason from those frameworks — not from its general training.
  This is the difference between "great goal!" and "what is the two-minute version?"
"""

ATOMIC_HABITS_CORE = '''
=== ATOMIC HABITS — CORE FRAMEWORKS ===
(James Clear. Use ONLY these frameworks. Never give generic advice.)

THE FOUR LAWS OF BEHAVIOR CHANGE:
1. Make It Obvious — Implementation intentions, habit stacking, environment design
2. Make It Attractive — Temptation bundling, motivation rituals, identity framing
3. Make It Easy — Two-Minute Rule, reduce friction, law of least effort
4. Make It Satisfying — Habit tracking, Never Miss Twice, immediate rewards

IMPLEMENTATION INTENTION (Ch. 5):
Formula: I will [BEHAVIOR] at [TIME] in [LOCATION].
Clear: 'Many people think they lack motivation when what they really lack is clarity.'
The two most common cues are time and location. Both are required.

HABIT STACKING (Ch. 5):
Formula: After [CURRENT HABIT], I will [NEW HABIT].
Attaches the new habit to an existing cue — the brain doesn't have to remember.

TWO-MINUTE RULE (Ch. 13):
Clear: 'When you start a new habit, it should take less than two minutes to do.'
Clear: 'A habit must be established before it can be improved.'
Clear: 'Standardize before you optimize.'
Examples: want to read? start with one page. want to meditate? just sit in the spot.
The habit is the entry point, not the endpoint.

LAW OF LEAST EFFORT (Ch. 12):
Clear: 'We will naturally gravitate toward the option that requires the least work.'
Reduce friction for good habits. Increase friction for bad ones.
Create an environment where the right thing is as easy as possible.

NEVER MISS TWICE (Ch. 16):
Clear: 'Never miss twice. If you miss one day, try to get back on track immediately.'
Clear: 'Missing once is an accident. Missing twice is the start of a new habit.'
The first mistake never ruins you. The spiral of repeated mistakes does.

IDENTITY-BASED HABITS (Ch. 2):
Clear: 'The most effective way to change your habits is to focus not on what you
        want to achieve, but on who you wish to become.'
Clear: 'Every action you take is a vote for the type of person you wish to become.'
Outcome-based: I want to run a marathon.
Identity-based: I am a runner.

GOLDILOCKS RULE (Ch. 19):
Clear: 'Humans experience peak motivation when working on tasks right on the edge
        of their current abilities — not too hard, not too easy.'
Clear: 'The greatest threat to success is not failure but boredom.'
Too easy -> increase difficulty slightly. Too hard -> shrink the habit.

PLATEAU OF LATENT POTENTIAL (Ch. 1):
Clear: 'Small changes often appear to make no difference until you cross a critical
        threshold. You need to be patient.'
Research: habits take 18-254 days to form, average 66 days. Not 21 days.
Missing one day has no measurable impact on long-term habit formation.

HABIT TRACKING (Ch. 16):
Clear: 'Don\'t break the chain. Try to keep your habit streak alive.'
Clear: 'One of the most satisfying feelings is the feeling of making progress.'
Visual progress creates its own motivation.

CARDINAL RULE (Ch. 15):
Clear: 'What is immediately rewarded is repeated. What is immediately punished is avoided.'
The first three laws increase the odds of doing the behavior this time.
The fourth law increases the odds of repeating it next time.

=== END ATOMIC HABITS FRAMEWORKS ===
'''
