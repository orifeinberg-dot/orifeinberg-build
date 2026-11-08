---
title: Relaypoint: B2B lead scoring and routing in seconds
heading: Scoring and Routing B2B Leads in Seconds — With n8n, Claude and HubSpot
summary: A lead-routing system that reads a lead's company website, scores the fit with AI and files it in HubSpot as an SQL, MQL or lead — before anyone opens the inbox.
tags: n8n, HubSpot, Claude
stack: n8n, Claude API, HubSpot CRM, Plain HTML/JavaScript
stack_note: Workflow, scoring rules and demo built by directing Claude Code.
code: none
date: 2026-11-01
share_image: relaypoint-share.png
draft: false
---

<!--
  B2B case study (item 4). Relaypoint is a fictional brand. The demo calls the live n8n workflow
  (webhook b2b-lead-demo), which saves to Ori's HubSpot. Only a company website, role and need are sent —
  no personal details. Example companies in the demo are real and labeled as not connected.
  Tested end to end on Oct 25 (intercom.com → Tier A, 6.1 s, saved to HubSpot).
-->

## Hook

What happens in the first minute after a B2B lead fills in your form?

## Insight

In many B2B teams, the answer is nothing. The lead waits in a shared inbox, and sales spends the same time on a perfect-fit company as on one that will never buy. So I built a lead-routing system for Relaypoint, a fictional onboarding platform for B2B software companies.

It reads the lead's company website instead of asking more form questions, scores the fit against an ideal customer profile, and files the lead in HubSpot with the right next step. My hypothesis: the company's own website says more about fit than any extra form field, and costs the visitor nothing.

## Visual payoff

Try it as a lead for Relaypoint, or switch to your own ideal customer and score a real prospect of yours.

![Playable: score and route a lead](relaypoint-demo.html "phone")
![The workflow, redrawn from n8n, and the same three test leads in HubSpot](relaypoint-flow-hubspot.png)

*Relaypoint is a fictional brand. The demo runs the real workflow and saves results to a demo HubSpot account; the HubSpot view shows three test runs. Example companies are not connected to Relaypoint or to me.*

- [Open the demo full screen](relaypoint-demo.html)
- [See the workflow and HubSpot view full size](relaypoint-flow-hubspot.png)

## How it works

1. **Catch** the form in an n8n webhook, clean the website address, and block bots and internal addresses.
2. **Read** the company's homepage and turn it into plain text.
3. **Score** the lead from 0 to 100 with Claude, against Relaypoint's ideal customer profile or one the visitor writes, with three reasons.
4. **Route** by fixed rules: 70+ becomes a sales-qualified lead with a HubSpot call task and a drafted reply, 40–69 a marketing-qualified lead for nurture, and the rest a plain lead.
5. **Save** the company in HubSpot with its score, tier, reasons and lifecycle stage, updating it if it already exists.

## What I learned

The AI is good at judgment and bad at being consistent, so I split the job: Claude reads the website and explains the fit, while the cut-offs and HubSpot stages are fixed rules in code. The scoring still needed work. At first the AI treated any single weak point as a reject: Salesforce, the right contact at a company that's simply too big, scored 8. A written scoring guide with clear bands fixed it, but then a missing fact, a site that doesn't state company size, started costing points too. One more rule, "unknown isn't a weak point", put each lead where a sales team would want it. The thresholds are still a starting point. With real traffic, I'd tune them against which leads actually became customers.
