const API = 'https://gmail.googleapis.com/gmail/v1/users/me';
const MAX_BODY_CHARS = 20_000;

export interface MessageSummary {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  snippet: string;
  isDraft: boolean;
}

export interface FullMessage extends MessageSummary {
  cc: string;
  messageIdHeader: string;
  body: string;
}

export interface DraftInput {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  replyToMessageId?: string;
}

interface GmailHeader {
  name: string;
  value: string;
}

interface GmailPart {
  mimeType?: string;
  body?: { data?: string };
  parts?: GmailPart[];
  headers?: GmailHeader[];
}

interface GmailMessage {
  id: string;
  threadId: string;
  snippet?: string;
  labelIds?: string[];
  payload?: GmailPart;
}

export class GmailAuthError extends Error {}

async function gmailFetch<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
  if (res.status === 401) {
    throw new GmailAuthError('Token Google scaduto o non valido: ricollega Gmail dalle impostazioni MCP.');
  }
  if (!res.ok) {
    throw new Error(`Gmail API ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as T;
}

const header = (headers: GmailHeader[] | undefined, name: string): string =>
  headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? '';

const decodeBase64Url = (data: string): string => Buffer.from(data, 'base64url').toString('utf8');

const htmlToText = (html: string): string =>
  html
    .replace(/<(style|script)[\s\S]*?<\/\1>/gi, '')
    .replace(/<br\s*\/?>|<\/(p|div|li|tr|h\d)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();

function findPart(part: GmailPart | undefined, mimeType: string): GmailPart | undefined {
  if (!part) return undefined;
  if (part.mimeType === mimeType && part.body?.data) return part;
  return part.parts?.map((p) => findPart(p, mimeType)).find(Boolean);
}

function extractBody(payload: GmailPart | undefined): string {
  const plain = findPart(payload, 'text/plain');
  if (plain?.body?.data) return decodeBase64Url(plain.body.data);
  const html = findPart(payload, 'text/html');
  if (html?.body?.data) return htmlToText(decodeBase64Url(html.body.data));
  return '';
}

function toSummary(msg: GmailMessage): MessageSummary {
  const headers = msg.payload?.headers;
  return {
    id: msg.id,
    threadId: msg.threadId,
    from: header(headers, 'From'),
    to: header(headers, 'To'),
    subject: header(headers, 'Subject'),
    date: header(headers, 'Date'),
    snippet: msg.snippet ?? '',
    isDraft: msg.labelIds?.includes('DRAFT') ?? false,
  };
}

export async function searchMessages(token: string, query: string, maxResults: number): Promise<MessageSummary[]> {
  const params = new URLSearchParams({ q: query, maxResults: String(maxResults) });
  const list = await gmailFetch<{ messages?: { id: string }[] }>(token, `/messages?${params}`);
  const metadata = ['From', 'To', 'Subject', 'Date'].map((h) => `metadataHeaders=${h}`).join('&');
  const messages = await Promise.all(
    (list.messages ?? []).map((m) =>
      gmailFetch<GmailMessage>(token, `/messages/${m.id}?format=metadata&${metadata}`),
    ),
  );
  return messages.map(toSummary);
}

export async function readMessage(token: string, id: string): Promise<FullMessage> {
  const msg = await gmailFetch<GmailMessage>(token, `/messages/${encodeURIComponent(id)}?format=full`);
  const body = extractBody(msg.payload);
  return {
    ...toSummary(msg),
    cc: header(msg.payload?.headers, 'Cc'),
    messageIdHeader: header(msg.payload?.headers, 'Message-ID'),
    body: body.length > MAX_BODY_CHARS ? `${body.slice(0, MAX_BODY_CHARS)}\n[...troncato]` : body,
  };
}

const singleLine = (value: string): string => value.replace(/[\r\n]+/g, ' ').trim();

const encodeHeaderWord = (value: string): string =>
  /^[\x20-\x7e]*$/.test(value) ? value : `=?UTF-8?B?${Buffer.from(value, 'utf8').toString('base64')}?=`;

function buildMime(input: DraftInput, reply?: FullMessage): string {
  const subject = reply && !/^re:/i.test(input.subject) ? `Re: ${input.subject}` : input.subject;
  const headers = [
    `To: ${singleLine(input.to)}`,
    input.cc ? `Cc: ${singleLine(input.cc)}` : '',
    `Subject: ${encodeHeaderWord(singleLine(subject))}`,
    reply?.messageIdHeader ? `In-Reply-To: ${reply.messageIdHeader}` : '',
    reply?.messageIdHeader ? `References: ${reply.messageIdHeader}` : '',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
  ].filter(Boolean);
  const body = Buffer.from(input.body.replace(/\r?\n/g, '\r\n'), 'utf8')
    .toString('base64')
    .replace(/.{76}/g, '$&\r\n');
  return `${headers.join('\r\n')}\r\n\r\n${body}`;
}

export async function createDraft(token: string, input: DraftInput): Promise<{ draftId: string; messageId: string }> {
  const reply = input.replyToMessageId ? await readMessage(token, input.replyToMessageId) : undefined;
  const raw = Buffer.from(buildMime(input, reply), 'utf8').toString('base64url');
  const draft = await gmailFetch<{ id: string; message: { id: string } }>(token, '/drafts', {
    method: 'POST',
    body: JSON.stringify({ message: { raw, ...(reply && { threadId: reply.threadId }) } }),
  });
  return { draftId: draft.id, messageId: draft.message.id };
}
