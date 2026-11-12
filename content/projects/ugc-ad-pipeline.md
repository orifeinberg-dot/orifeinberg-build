---
title: Automated UGC ads
heading: One Brief In, a Batch of Checked UGC Video Ads Out — With Claude, fal.ai and ElevenLabs
summary: One product brief in, a batch of checked UGC-style video ads out, with a pass or review mark on every ad.
tags: Python, Claude API, fal.ai
stack: Python, Claude Sonnet 5.5, Claude Haiku 5.5, fal.ai, ElevenLabs
stack_note: Built by directing Claude Code.
code: https://github.com/orifeinberg-dot/ugc-ad-demo
date: 2026-11-10
share_image: ugc-share.png
---

<!--
  UGC ad pipeline. SafeNest is a made-up product; every person and voice is AI-generated.
  showcase/ = the original run (4 ads with videos). variations/ = new versions of ad 2.
  variations/summary.html links back to ../showcase/summary.html.
  Keep the caption under the visual exactly as it is.
-->

## Hook

Can AI turn one product brief into a batch of UGC-style video ads, and keep every ad inside Facebook's rules?

## Insight

Ads that look like a real person talking to their phone are some of the best performers on Facebook, and slow to make. The hard part of automating them is not the video. It is making sure what the person says is honest, and that you can run it again for a few dollars.

So I started with the rules. A short brief names the product, the audience, the tone, and a list of things the ads must never claim. Claude reads it to write the ads, and a second, cheaper Claude model reads the same list to check them. One source of truth, two readers.

## Visual payoff

The real output of one run: four ads, each with its hook type, persona, format and policy result.

![Contact sheet of four AI-generated UGC ads, each with its picture or video, hook type, persona and pass or review mark](contact-sheet.png)

*AI-generated people and voices. SafeNest is a made-up product. Not real customers or testimonials.*

- [Open the results page](showcase/summary.html)
- [See the variations of one ad](variations/summary.html)

## How it works

1. **Brief:** one file with the product, audience, main benefit, tone and the "must not claim" list.
2. **Write and check:** Claude Sonnet 5.5 writes four ads that differ in hook, persona and format. Fixed rules plus Claude Haiku 5.5 mark each one pass or review, with the reason.
3. **Approve:** each ad gets a picture and an AI voice matched to the person's age. I read and listen first.
4. **Video:** the talking video is the expensive step, so I make it only for the ads I approve.
5. **Improve and show:** I pick one ad and name one thing to change, like the opening line. New versions keep the same person and voice and go through the check again. Every run gets one folder and a summary page with each file and the cost.

## What I learned

The policy check needs two layers. Fixed rules catch obvious phrases like "guaranteed" or "your phone is hacked" for free, and the AI model catches sneakier wording. If the AI check fails for any reason, the ad must count as "review", never "pass". A check that quietly passes when it breaks is worse than no check.

Two more things. Four ads with pictures and voices cost about 50 cents, and each video adds about a dollar, so approval comes before video. And video is the weakest part: the lips are close but not perfect, and a model that costs twice as much looked about the same. Every model sits in one settings file, so a better one is a one-line swap.
