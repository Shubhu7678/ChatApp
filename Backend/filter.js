// Basic profanity filter. Masks matches with *** instead of blocking the message.
// Extend WORDS freely; matching tolerates case, repeated letters, leetspeak
// and separators ("f u c k", "f.u.c.k", "fuuuck", "f*ck" is not caught on purpose).
const WORDS = [
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'dick', 'pussy', 'cunt',
  'slut', 'whore', 'nigger', 'nigga', 'faggot',
  'madarchod', 'behenchod', 'bhenchod', 'bhosdike', 'bhosdi', 'chutiya',
  'chutiye', 'gandu', 'randi', 'harami', 'lund', 'gaandu',
];

const LEET = { a: 'a@4', e: 'e3', i: 'i1!', o: 'o0', s: 's$5', t: 't7', l: 'l1', b: 'b8', g: 'g9' };

const pattern = (word) =>
  [...word].map((c) => `[${LEET[c] || c}]+`).join('[\\W_]*');

const RE = new RegExp(
  `(?<![a-z0-9])(?:${WORDS.map(pattern).join('|')})(?![a-z0-9])`,
  'gi'
);

export const maskProfanity = (text) => text.replace(RE, '***');
