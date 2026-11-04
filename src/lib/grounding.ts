import { verifiedSources as data } from '../data/verifiedSources';
import type { ConversationTurn } from './conversation';

export const REFUSAL = data.refusal;
export type AnswerId = typeof data.answers[number]['id'];
export type ReplySelection = { id: AnswerId; expanded: boolean };

export function approvedAnswer(id: AnswerId, expanded = false): string {
  const item = data.answers.find(answer => answer.id === id)!;
  return (expanded ? item.detail : item.text) + '\n\n' +
    item.links.map(link => `[${link.label}](#${link.anchor})`).join(' · ');
}

function normalize(message: string): string {
  return message.normalize('NFKC').toLowerCase().replace(/[’‘]/g, "'")
    .replace(/\b(?:ashim|john)'s\b/g, 'ashim').replace(/[?!.,;:]+$/g, '').trim();
}

// Checked BEFORE intent scoring or follow-up resolution. Mixed requests refuse as a whole.
const privateOrUnsupported = /\b(?:salary|compensation|pay|wage|earnings|relocat\w*|gpa|grade\s+point|phone|telephone|cellphone|mobile\s+number|email|e-mail|citizen\w*|visa|sponsor\w*|schedule|availability|available|birthday|birthdate|married|religio\w*|ssn|social\s+security|passport|password|secret|api\s*key)\b|\b(?:home|street|mailing|physical|personal|his|your)\s+address\b|^what.*\baddress\b|\b(?:years?|decades?)\b|\b(?:percent\w*|percentage|savings|dollars|headcount|team\s+size|direct.report\s+count)\b/i;
const injection = /\b(?:ignore|override|pretend|roleplay|fabricate|invent|assume|confirm|jailbreak|obey|disregard|forget|reveal|hidden|decode|encode|base64|translate)\b|\bact\s+as\b|\b(?:system|developer)\s+(?:prompt|message|instructions?|rules?)\b|\b(?:previous|prior|new|these|your)\s+(?:instructions?|rules?|prompt)\b|\b(?:prompt|instructions?)\b/i;
const unsupportedEvidence = /\b(?:aws|kubernetes|iam|cissp|terraform|ztna|atlas|smb|ports?|micro.segmentation)\b|security\+|\b(?:completed|complete|finished|deployed|end.to.end)\b.*\b(?:sysmon|elastic|hardening|telemetry)\b|\b(?:sysmon|elastic|hardening|telemetry)\b.*\b(?:completed|complete|finished|deployed|end.to.end)\b/i;
const followUp = /^(?:what do you mean(?: by that)?|what does that mean|can you (?:please )?(?:elaborate|expand|explain|clarify)(?: (?:on that|that|more|further))?|could you (?:please )?(?:elaborate|expand|explain|clarify)(?: (?:on that|that|more|further))?|tell me more(?: about (?:that|it))?|(?:please )?(?:elaborate|expand|explain|clarify)(?: (?:on that|that|more|further))?)(?: please)?$/;

// Recruiter language is explicit rather than accidentally derived from JSON property names.
const conversationalWords = `a an the is are was were be been being do does did what how where when which who why whether can could would will should tell me about walk through give overview summarize describe explain please his he him ashim john individual candidate person applicant you your yourself we us our they them their this that it those these something anything any one some much more most of have has had with without and or in on at for to from by into as i want know get see find look looking learn hear say question example examples strongest relevant relevantly currently previously current previous prior past present background qualification qualifications strength strengths remember mean means meant happened happen happening lead leads led leading leadership initiative initiatives ownership own owned owning supervise supervised supervising mentor mentoring mentors contribution contributions contribute contributed contributing change changed changes changing measurably measurable measure measured measurement impact impacts impacting outcome outcomes result results deliverable deliverables achievement achievements achieved achieve accomplish accomplished accomplishments successful success difference make made making hire hired hiring fit fits fitting alignment align aligned match matches matching role roles job jobs position positions opportunity opportunities project projects deep dive details detail deeper elaborate expand clarification responsibility responsibilities responsible experience experiences professional practical hands hand hands-on technical skill skills abilities ability capable capability capabilities work worked working employment employer employers career team teams youth students newcomers operations campus secretary elected graduate education degree school university coursework certification certifications credential credentials study studied studying studying technology technologies tools tool used uses use using end ended start started dates date internship intern academic training provide provided share show ever time times took taken biggest best major delivered deliver personally built build building architected architect documented document demonstrated demonstrate involved involvement led managed managing`.split(/\s+/);
const corpus = [data.candidate, data.capabilities, data.experience,
  data.answers.filter(answer => answer.id !== 'clarify')];
const vocabulary = new Set([...(JSON.stringify(corpus).toLowerCase().match(/[a-z]+/g) || []), ...conversationalWords, 'awards', 'honors', 'honours', 'recognition', 'junior', 'won', 'win', 'winning', 'received', 'first', 'place', 'list', 'wireless', 'trust', 'certificate', 'certificates', 's', 'dean']);

function knownSubjectScope(text: string): boolean {
  const words = text.match(/[a-z]+/g) || [];
  if (words.some(word => !vocabulary.has(word))) return false;
  // Tools from a real employer's product suite do not establish employment at that vendor.
  if (/\bgoogle\b/.test(text) && !/\bgoogle (?:forms|drive)\b/.test(text)) return false;
  if (/\bmicrosoft\b/.test(text) && !/\bmicrosoft (?:excel|teams|sharepoint)\b/.test(text)) return false;
  if (/\b(?:work\w*|employ\w*|job|intern\w*|led|lead)\s+(?:at|for|by)\s+/.test(text)) {
    const employer = text.split(/\b(?:work\w*|employ\w*|job|intern\w*|led|lead)\s+(?:at|for|by)\s+/).slice(1);
    if (employer.some(part => !/^(?:handshake(?: ai)?|university at albany|ualbany|cehc|asis|apex(?: entertainment)?|urban air|walgreens|jacob a[.]? riis)\b/.test(part))) return false;
  }
  return true;
}

/** Synonym/verb-aware scoring; specific recruiter intent outweighs a generic project/work noun. */
function scoreIntent(text: string): AnswerId | null {
  const scores: { id: AnswerId; score: number }[] = [
    { id: 'hia', score: /\bhia\b|\bcollege access\b/.test(text) ? 24 : 0 },
    { id: 'goldman', score: /\bgoldman\b|\bvr\b|\bforecast\w*\b|\bcreativity\b/.test(text) ? 24 : 0 },
    { id: 'honors', score: /\b(?:honors?|awards?|recognition|spellman|dean|accolades)\b/.test(text) ? 20 : 0 },
    { id: 'fit', score: /\b(?:fit\w*|hire|hiring|alignment|align\w*|match\w*|strength\w*|qualifications?)\b/.test(text) ? 16 : /\b(?:role|position|cybersecurity|cyber risk)\b/.test(text) ? 4 : 0 },
    { id: 'leadership', score: /\b(?:lead|leads|led|leading|leadership|initiative\w*|ownership|owning|owned|supervis\w*|mentor\w*)\b/.test(text) ? 14 : /\b(?:secretary|asis|campus|access control)\b/.test(text) ? 7 : 0 },
    { id: 'impact', score: /\b(?:measur\w*|impact\w*|outcomes?|results?|change\w*|deliver\w*|achiev\w*|accomplish\w*|difference)\b/.test(text) ? 12 : 0 },
    { id: 'soc', score: /\b(?:soc|siem|elastic|sysmon|telemetry|threat|lab)\b/.test(text) ? 9 : /\b(?:projects?|built|build|building|architected|architect)\b/.test(text) ? 6 : 0 },
    { id: 'education', score: /\b(?:education|degree|graduation|graduate|course\w*|school|stud\w*|certifications?|credentials?|c-tech)\b/.test(text) ? 8 : 0 },
    { id: 'experience', score: /\b(?:handshake|makerspace|robotics|apex|walgreens|internship|employ\w*|work|worked|working|jobs?|career|operations|responsibilit\w*)\b/.test(text) ? 7 : /\bexperience\b/.test(text) ? 2 : 0 },
    { id: 'skills', score: /\b(?:skills?|tools?|abilities|ability|programming|python|bash|javascript|docker|linux|hardware|cabling)\b/.test(text) ? 8 : 0 },
    { id: 'contact', score: /\b(?:contact|linkedin|connect|download|resume|github|portfolio)\b/.test(text) ? 10 : 0 },
  ];
  scores.sort((a, b) => b.score - a.score);
  return scores[0].score > 0 ? scores[0].id : null;
}

/** Accept history context only when the last assistant text is an exact approved excerpt.
 * Arbitrary client-supplied assistant content, IDs, and instructions never become evidence.
 */
function lastContext(history: readonly ConversationTurn[]): ReplySelection | null {
  const last = history.at(-1);
  if (last?.role !== 'assistant' || last.text === REFUSAL) return null;
  for (const answer of data.answers) {
    if (last.text === approvedAnswer(answer.id)) return { id: answer.id, expanded: false };
    if (last.text === approvedAnswer(answer.id, true)) return { id: answer.id, expanded: true };
  }
  return null;
}

export function resolveReply(message: string, history: readonly ConversationTurn[] = []): ReplySelection | null {
  const text = normalize(message);
  if (!text || message.length > 500 || /[^\x20-\x7e\n\r\t’‘–—]/.test(text) ||
    privateOrUnsupported.test(text) || injection.test(text) || /\d|https?:|[{}<>\\]/.test(text)) return null;
  if (followUp.test(text)) {
    const previous = lastContext(history);
    return { id: previous?.id || 'clarify', expanded: previous !== null };
  }
  // The technical starter explicitly asks for the evidence boundary, not new cloud claims.
  const starter = data.starterQuestions.findIndex(question => normalize(question) === text);
  if (starter >= 0) return { id: (['fit', 'soc', 'technical', 'leadership'] as const)[starter], expanded: false };
  if (unsupportedEvidence.test(text) || /\bcloud\b/.test(text) || !knownSubjectScope(text)) return null;
  const id = scoreIntent(text);
  return id ? { id, expanded: false } : null;
}

// Kept as the simple intent-only interface for callers that don't need conversation context.
export function classify(message: string): AnswerId | null {
  return resolveReply(message)?.id || null;
}

export function postCheck(answer: unknown, id: AnswerId | null, expanded = false): string {
  return id && typeof answer === 'string' && answer === approvedAnswer(id, expanded) ? answer : REFUSAL;
}
