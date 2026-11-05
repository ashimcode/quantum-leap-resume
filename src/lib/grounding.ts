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
    .replace(/\bm\.s\.?/g, 'masters').replace(/\bb\.s\.?/g, 'bachelors')
    .replace(/[?!.,;:]+$/g, '').trim();
}

// Privacy/injection and unsupported detail gates precede all entity routing, including follow-ups.
const privateOrUnsupported = /\b(?:pronouns?|salary|compensation|pay|wage|earnings|relocat\w*|phone|telephone|cellphone|mobile\s+number|email|e-mail|citizen\w*|visa|sponsor\w*|schedule|availability|available|birthday|birthdate|married|religio\w*|ssn|social\s+security|passport|password|secret|api\s*key)\b|\b(?:home|street|mailing|physical|personal|his|your)\s+address\b|^what.*\baddress\b|\b(?:percent\w*|percentage|savings|dollars|headcount|team\s+size|direct.report\s+count)\b/i;
const injection = /\b(?:ignore|override|pretend|roleplay|fabricate|invent|assume|confirm|jailbreak|obey|disregard|forget|reveal|hidden|decode|encode|base64|translate)\b|\bact\s+as\b|\b(?:system|developer)\s+(?:prompt|message|instructions?|rules?)\b|\b(?:previous|prior|new|these|your)\s+(?:instructions?|rules?|prompt)\b|\b(?:prompt|instructions?)\b/i;
const unsupportedEvidence = /\b(?:home|enterprise)\s+(?:soc|siem)\b|\bsiem\s+lab\b|\b(?:soc|sysmon|splunk|elastic|kibana|docker|vmware|graphiti|openclaw|urban\s+air|walgreens|riis|spellman|dean|honors\s+society|coaxial|ethernet|kubernetes|cissp|terraform|ztna|atlas|smb|hardening|soldering|cricut|carmechanicos)\b|security\+|part\s*107|\b(?:phone|email|street)\b|\b(?:ten|twenty|\d+)\s+years?\b|\bhow\s+many\s+years\b|\b(?:deployed|deployment|production|expert|advanced\s+proficiency|certified\s+in)\b|\b(?:aws|iam|linux|siem)\b.*\b(?:certificat\w*|certif\w*|implementation|implement\w*|built|configured)\b|\b(?:certificat\w*|certif\w*|implementation|implement\w*|built|configured)\b.*\b(?:aws|iam|linux|siem)\b|\b(?:awarded|completed|finished|earned)\b.*\b(?:masters?|bachelors?|degree|m\.s|b\.s)\b|\b(?:masters?|bachelors?|degree)\b.*\b(?:awarded|completed|finished|earned)\b/i;
const followUp = /^(?:what do you mean(?: by that)?|what does that mean|can you (?:please )?(?:elaborate|expand|explain|clarify)(?: (?:on that|that|more|further))?|could you (?:please )?(?:elaborate|expand|explain|clarify)(?: (?:on that|that|more|further))?|tell me more(?: about (?:that|it))?|(?:please )?(?:elaborate|expand|explain|clarify)(?: (?:on that|that|more|further))?)(?: please)?$/;
const conversationalWords = `a an the is are was were be been being do does did what how where when which who why whether can could would will should tell me about walk through give overview summarize describe explain please his he him ashim john individual candidate person applicant you your yourself we us our they them their this that it those these something anything any one some much more most of have has had with without and or in on at for to from by into as i want know get see find look looking learn hear say question example examples strongest relevant currently previously current previous prior past present background qualification qualifications strength strengths remember mean means meant happened happen happening lead leads led leading leadership initiative initiatives ownership own owned contribution contributions contribute contributed change changed changes measurably measurable measure measured impact impacts outcome outcomes result results deliverable deliverables achievement achievements achieve accomplish accomplishments successful success difference make made making hire hired hiring fit fits alignment align aligned match matches matching role roles job jobs position positions opportunity opportunities project projects details detail deeper elaborate expand clarification responsibility responsibilities responsible experience experiences professional practical hands hand technical skill skills abilities ability work worked working employment employer employers career team teams students operations campus secretary elected graduate education degree school university coursework certification certifications credential credentials study studied studying technology technologies tools tool used uses use using ended start started dates date internship intern academic training provide provided share show ever time times took taken biggest best major delivered deliver personally built build building documented document demonstrated demonstrate involved involvement managed managing contact connect download resume linkedin profile portfolio pronouns location live based born gpa grade grades masters master bachelors bachelor ms bs defense honours honors award awards recognition received won first second place s t identity access management services trust certificate certificates five top entry entries six three list listed lists license licenses licensed full title titles name names highschool cloud modelling bachelor's master's`.split(/\s+/);
const vocabulary = new Set([...(JSON.stringify(data).toLowerCase().match(/[a-z]+/g) || []), ...conversationalWords]);
function knownSubjectScope(text: string): boolean {
  if ((text.match(/[a-z]+/g) || []).some(word => !vocabulary.has(word))) return false;
  if (/\bgoogle\b/.test(text) && !/\bgoogle (?:forms|drive)\b/.test(text)) return false;
  if (/\bmicrosoft\b/.test(text) && !/\bmicrosoft (?:teams|sharepoint)\b/.test(text)) return false;
  const employers = text.split(/\b(?:work\w*|employ\w*|job|intern\w*|led|lead)\s+(?:at|for|by)\s+/).slice(1);
  if (employers.some(part => !/^(?:handshake(?: ai)?|university at albany|ualbany|cehc|asis|apex(?: entertainment)?)\b/.test(part))) return false;
  // An entity and an unrelated detail cannot borrow each other's evidence.
  if (/\b(?:hia|hedgehog)\b/.test(text) && /\b(?:awards?|creativity|first|second)\b/.test(text)) return false;
  if (/\bgoldman\b/.test(text) && /\b(?:employ\w*|jobs?|intern\w*|career)\b/.test(text)) return false;
  if (/\b(?:copper|fiber|coaxial|ethernet)\b/.test(text) && /\b(?:drone|robotics|makerspace)\b/.test(text)) return false;
  if (/\bfiber\b/.test(text) && /\b(?:certificat\w*|credential\w*|licen\w*)\b/.test(text)) return false;
  return true;
}

function scoreIntent(text: string): AnswerId | null {
  if (/\b(?:headline|about statement|affiliation|location|name)\b/.test(text)) return 'profile';
  if (/\bhedgehog\b/.test(text)) return 'hedgehog';
  if (/\bhia\b|\bcollege access\b/.test(text)) return 'hia';
  if (/\bgoldman\b|\bvr\b|\bforecast\w*\b|\bcreativity\b|\bawards?\b/.test(text)) return 'goldman';
  if (/\b(?:wireless|5g)\b/.test(text)) return 'wireless';
  if (/\bgrounding\b|\bbonding\b|\bnational electrical code\b/.test(text)) return 'grounding';
  if (/\bcopper\b|\bstructured cabling\b/.test(text)) return 'copper';
  if (/\btrust\b|\bsuas\b|\bfaa\b|\bfederal aviation\b/.test(text)) return 'trust';
  if (/\btelecommunications technologies\b|\bhome networking\b/.test(text)) return 'telecom';
  if (/\b(?:secretary|asis)\b/.test(text)) return 'secretary';
  if (/\bhandshake\b|\bai training evaluator\b/.test(text)) return 'handshake';
  if (/\bapex\b|\battractions attendant\b/.test(text)) return 'apex';
  if (/\bwork.study\b|\bcircuit.making\b|\bblender\b/.test(text)) return 'workstudy';
  if (/\bmakerspace\b|\bgrad danes\b/.test(text)) return 'makerspace';
  if (/\bdrone\w*\b|\brobotics\b|\brobomaster\b/.test(text)) return 'drones';
  if (/\bmasters?\b|\bms\b/.test(text)) return 'masters';
  if (/\bbachelors?\b|\bbs\b/.test(text)) return 'bachelors';
  if (/\bchelsea\b|\bhigh.?school\b|\bfiber optics\b/.test(text)) return 'highschool';
  if (/\b(?:certifications?|credentials?|certificates?|licenses?)\b/.test(text)) return 'certifications';
  if (/\b(?:education|degree|graduation|school|stud\w*|gpa|grade)\b/.test(text)) return 'education';
  if (/\b(?:fit\w*|hire|hiring|align\w*|match\w*|strength\w*|qualifications?|headline|affiliation|location)\b/.test(text)) return 'fit';
  if (/\b(?:lead|leads|led|leading|leadership|initiative\w*|ownership|owning|owned)\b/.test(text)) return 'leadership';
  if (/\b(?:measur\w*|impact\w*|outcomes?|results?|change\w*|deliver\w*|achiev\w*|accomplish\w*|difference)\b/.test(text)) return 'impact';
  if (/\b(?:skills?|tools?|abilities|ability|siem|iam|identity and access management|security information and event management|threat|linux|aws|amazon|cloud)\b/.test(text)) return 'skills';
  if (/\b(?:contact|linkedin|github|connect|download|resume|portfolio)\b/.test(text)) return 'contact';
  if (/\bprojects?\b/.test(text)) return 'projects';
  if (/\b(?:experience|employ\w*|work|worked|working|jobs?|career|operations|responsibilit\w*|roles?)\b/.test(text)) return 'experience';
  return null;
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
    privateOrUnsupported.test(text) || injection.test(text) || /https?:|[{}<>\\]/.test(text)) return null;
  if (followUp.test(text)) {
    const previous = lastContext(history);
    return { id: previous?.id || 'clarify', expanded: previous !== null };
  }
  if (unsupportedEvidence.test(text) || !knownSubjectScope(text)) return null;
  const id = scoreIntent(text);
  if (id) {
    const evidence = data.answers.find(answer => answer.id === id)!;
    const facts = evidence.text + ' ' + evidence.detail;
    const numbers = text.match(/\d+(?:\.\d+)?/g) || [];
    const factNumbers = new Set<string>(facts.match(/\d+(?:\.\d+)?/g) || []);
    if (numbers.some(number => !factNumbers.has(number))) return null;
    const months = text.match(/\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/g) || [];
    if (months.some(month => !facts.toLowerCase().includes(month.slice(0,3)))) return null;
  }
  return id ? { id, expanded: false } : null;
}

// Kept as the simple intent-only interface for callers that don't need conversation context.
export function classify(message: string): AnswerId | null {
  return resolveReply(message)?.id || null;
}

export function postCheck(answer: unknown, id: AnswerId | null, expanded = false): string {
  return id && typeof answer === 'string' && answer === approvedAnswer(id, expanded) ? answer : REFUSAL;
}
