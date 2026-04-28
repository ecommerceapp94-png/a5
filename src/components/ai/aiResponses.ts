export const AI_GREETINGS = [
  "Hey! I'm Elite — your private browsing copilot. Ask me anything.",
  'Welcome back. Want me to summarise your last session?',
  'I can search smarter, organise tabs and clean history. What would you help on?',
  'Tip of the day: long-press any page to access a quick action menu.',
];

export const AI_SAMPLE_QUESTIONS = [
  'Summarise this article',
  'Find similar articles',
  'Translate this page',
  'Save to bookmarks',
  'Open in private mode',
  'Block trackers on this site',
  'Show me top news today',
  'Schedule a reading reminder',
  'Compare these two products',
  'Make this URL shorter',
];

const FACT_RESPONSES = [
  "Got it — I've drafted a summary based on the visible page content. Open the AI panel to expand.",
  'Looks good. I can also fetch related articles if you want to go deeper.',
  'Done. I added a follow-up reminder to your reading list for tomorrow morning.',
  'I bundled the top 3 highlights, plus a quick TL;DR. Want me to email this to you later?',
  "Here's a clean reader-mode version with adjusted typography for nighttime browsing.",
  'I hid 14 ads, blocked 6 trackers and stopped one auto-play video. Browsing should feel snappier now.',
  "I've copied the link. Tap once on URL bar to reuse, or double-tap to share with default app.",
  'Saved to Bookmarks → Reading List → Tonight. Synced locally with AsyncStorage.',
  'I filtered this site for cleaner reading. To revert, just toggle Reader Mode off.',
  'I noticed this page has a paywall pattern. Want me to surface the cached/archive variant?',
];

const FOLLOWUPS = [
  'Want me to keep watching this page for updates?',
  'Should I auto-translate similar pages from this domain?',
  'Should I pin this to the top of the speed dials?',
  'Want me to block notifications from this site?',
  'Should I add this to your Today reading queue?',
];

export function pseudoAIReply(prompt: string, seed: number): string {
  const lower = prompt.toLowerCase();
  let factIndex = Math.abs((seed + lower.length) % FACT_RESPONSES.length);
  let followIndex = Math.abs((seed * 7 + lower.length) % FOLLOWUPS.length);
  const lead = FACT_RESPONSES[factIndex];
  const follow = FOLLOWUPS[followIndex];
  return `${lead}\n\n${follow}`;
}
