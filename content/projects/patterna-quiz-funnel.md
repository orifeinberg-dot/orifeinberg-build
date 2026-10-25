---
title: Patterna: from ad click to free account
summary: A clickable quiz funnel, three A/B tests and three ads for a brand-new IQ test, built in one day. How do you get a stranger to sign up before they see their score?
tags: Claude, HTML/JS, A/B testing
stack: Claude, Plain HTML/CSS/JavaScript, Inline SVG, Playwright (testing)
code: none
date: 2026-10-24
share_image: patterna-ads-contact-sheet.png
---

<!--
  Source: the project chat's handoff, converted to the site format. The fictional brand was renamed
  to Patterna. Slug and caption follow the site's public-wording rules.
  - The quiz and its three variants are published and playable (the questions, blue and logo are Ori's).
    Checked before publishing: no old brand name anywhere, no outside URLs or network calls, nothing that
    breaks out of a frame, and the signup stores no email or password (only valid/invalid flags,
    pushed to an in-page list).
  - No code link: no public repo yet. Claims stay phrased as hypotheses.
-->

## Hook

How do you get a stranger to take an IQ test, then create an account to see their score?

## Insight

A new IQ-test brand has no audience and no trust. The quiz itself is easy to build. The hard moment is asking for an account before showing the score. So I designed everything around that moment: free to start, honest up front that an account is needed for results, and a results page that makes the signup feel worth it.

Then, instead of guessing, I picked three tests that each change one thing, and ranked them by how much each could move signups. The ads reuse the same headline, blue and first puzzle as the landing screen, so the click and the page feel like one experience.

## Visual payoff

Play the real quiz here, then see the three ads that lead into it.

![Playable: the full quiz flow](patterna-quiz.html "phone")
![The three Patterna ads: full-screen mobile, square banner and mobile banner](patterna-ads-contact-sheet.png)

*Patterna is a fictional brand. The ads, quiz and tests are concept work; none of it has run with real traffic. The signup is a demo: nothing you type is saved.*

- [Take the quiz full screen](patterna-quiz.html)
- [View the ads full size](patterna-ads-contact-sheet.png)

- [Variant A](patterna-variant-a.html): the first puzzle starts on the landing screen
- [Variant B](patterna-variant-b.html): 8 questions instead of 12
- [Variant C](patterna-variant-c.html): part of the score shown before signup

## How it works

1. **Map** the path from ad click to a created account, and find the step where people are most likely to leave.
2. **Build** a 12-question quiz that runs in one file, offline, on phone and desktop.
3. **Choose** three single-change tests: a puzzle on the first screen, 8 questions instead of 12, and showing the score before signup.
4. **Design** three ads in different sizes that match the page.
5. **Check** every result by hand, clicking through each version.

## What I learned

AI wrote the first version quickly, and its mistakes were in the details. A signup button did nothing in a preview, one puzzle had two defensible answers, and the quiz-start count was recorded at the wrong moment. I only found them by clicking through everything myself. I also dropped some test ideas when I asked what the visitor gets in return, because an idea that only helps the company is hard to defend. None of the conversion ideas has been run with real traffic. They are hypotheses I would test.
