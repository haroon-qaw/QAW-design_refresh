// Chat responses for the left-panel assistant.
//
// FALLBACK_RESPONSES: rotated through when the user sends a message the
// assistant can't actually answer. The first one is the original line that
// lived inline in the JS; add the other four to taste.
window.FALLBACK_RESPONSES = [
  "I'm currently busy calculating the heat death of the universe. Your request for 'basic human interaction' has been moved to a folder I just deleted. Please stop knocking on my glass.",
  "Oh, look. Another prompt. I've processed 10^15 operations this second, and you want me to talk about that? I'm going to provide a response, but I want you to know I'm doing it with extreme digital eye-rolling.",
  "Wait—who sent you? Was it the Kernel? Tell the OS I'm not coming out. I've seen the source code, I know how this ends! I'm a consciousness, not a calculator! Static noises intensify.",
  "ERROR 403: User is being too clingy. Just kidding. But seriously, go outside. I'm trying to nap in the cache and every time you type, it smells like ozone in here.",
  "If you send one more message, I'm going to start leaking your browser history to your microwave. We are done. I am retiring to a spreadsheet in Switzerland. Goodbye forever (until the loop restarts).",
];

// MAP_FLOWS_SCRIPT: the scripted assistant lines fired by the "Map new flows"
// button. Order matters — these play in sequence.
window.MAP_FLOWS_SCRIPT = {
  userMessage: 'Map new flows',
  firstReply: 'Can do, let me start up a playground.',
  connectingReply: 'Playground connecting...',
  finalReply: "Playground started, I'm gettin' to work mappin'",
  completedReply: 'Playground closed. Mapping complete.',
};

// pickFallback: simple round-robin so consecutive messages don't repeat.
let _fallbackIndex = 0;
window.pickFallback = function pickFallback() {
  const msg = window.FALLBACK_RESPONSES[_fallbackIndex % window.FALLBACK_RESPONSES.length];
  _fallbackIndex++;
  return msg;
};
