import { getKnownUsers } from './appAuth';
import { getProposals } from './appProposalStore';
import { FREELANCERS } from './appFreelancerStore';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderEmail: string;
  text: string;
  sentAt: string;
}

export interface Conversation {
  id: string;
  userEmail: string;
  userName: string;
  freelancerId: number;
  freelancerName: string;
  freelancerEmail: string;
}

export const CHAT_EVENT = 'stella:chat-message';
export const CHAT_OPEN_EVENT = 'stella:open-chat';

const MESSAGES_KEY = 'stella_chat_messages';
const LAST_READ_KEY = 'stella_chat_last_read';
const REGISTRY_KEY  = 'stella_chat_registry';

// ── Registry: persists conversations even before first message ──

function getRegistry(): Record<string, Conversation> {
  try { return JSON.parse(localStorage.getItem(REGISTRY_KEY) || '{}'); }
  catch { return {}; }
}

export function registerConversation(conv: Conversation): void {
  const reg = getRegistry();
  reg[conv.id] = conv;
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(reg));
}

// ── Messages ──

function allMessages(): Record<string, ChatMessage[]> {
  try { return JSON.parse(localStorage.getItem(MESSAGES_KEY) || '{}'); }
  catch { return {}; }
}

export function getMessages(conversationId: string): ChatMessage[] {
  return allMessages()[conversationId] ?? [];
}

export function sendChatMessage(conversationId: string, senderEmail: string, text: string): ChatMessage {
  const msg: ChatMessage = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    conversationId,
    senderEmail,
    text: text.trim(),
    sentAt: new Date().toISOString(),
  };
  const all = allMessages();
  all[conversationId] = [...(all[conversationId] ?? []), msg];
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(all));
  window.dispatchEvent(new CustomEvent(CHAT_EVENT, { detail: { conversationId } }));
  return msg;
}

// ── Read tracking ──

export function markAsRead(conversationId: string, userEmail: string): void {
  try {
    const all = JSON.parse(localStorage.getItem(LAST_READ_KEY) || '{}');
    all[`${userEmail}||${conversationId}`] = new Date().toISOString();
    localStorage.setItem(LAST_READ_KEY, JSON.stringify(all));
  } catch { /* noop */ }
}

export function getUnreadCount(conversationId: string, userEmail: string): number {
  try {
    const all = JSON.parse(localStorage.getItem(LAST_READ_KEY) || '{}');
    const lastRead: string | null = all[`${userEmail}||${conversationId}`] ?? null;
    return getMessages(conversationId).filter(
      m => m.senderEmail !== userEmail && (!lastRead || m.sentAt > lastRead)
    ).length;
  } catch { return 0; }
}

// ── Conversation ID ──

export function makeConvId(userEmail: string, freelancerId: number): string {
  return `conv_${encodeURIComponent(userEmail)}_f${freelancerId}`;
}

// ── Conversation discovery: registry + proposals ──

export function getConversationsFor(email: string, role: string): Conversation[] {
  const proposals = getProposals();
  const knownUsers = getKnownUsers();
  const registry = getRegistry();
  const result = new Map<string, Conversation>();

  // From registry
  for (const conv of Object.values(registry)) {
    if (role === 'ROLE_USER' && conv.userEmail === email) {
      result.set(conv.id, conv);
    }
    if (role === 'ROLE_FREELANCER') {
      const myIds = FREELANCERS.filter(f => f.accountEmail === email).map(f => f.id);
      if (myIds.includes(conv.freelancerId)) result.set(conv.id, conv);
    }
  }

  // From proposals (fill any missing)
  if (role === 'ROLE_USER') {
    const seen = new Set<number>();
    proposals
      .filter(p => p.userEmail === email)
      .forEach(p => {
        if (seen.has(p.freelancerId)) return;
        seen.add(p.freelancerId);
        const fl = FREELANCERS.find(f => f.id === p.freelancerId);
        if (!fl) return;
        const id = makeConvId(email, p.freelancerId);
        if (!result.has(id)) {
          result.set(id, {
            id,
            userEmail: email,
            userName: p.userName ?? '보호자',
            freelancerId: p.freelancerId,
            freelancerName: p.freelancerName ?? fl.name,
            freelancerEmail: fl.accountEmail ?? '',
          });
        }
      });
  } else if (role === 'ROLE_FREELANCER') {
    const myIds = FREELANCERS.filter(f => f.accountEmail === email).map(f => f.id);
    const seen = new Set<string>();
    proposals
      .filter(p => myIds.includes(p.freelancerId) && !!p.userEmail)
      .forEach(p => {
        const key = `${p.userEmail}__${p.freelancerId}`;
        if (seen.has(key)) return;
        seen.add(key);
        const fl = FREELANCERS.find(f => f.id === p.freelancerId)!;
        const u = knownUsers.find(u => u.email === p.userEmail);
        const id = makeConvId(p.userEmail!, p.freelancerId);
        if (!result.has(id)) {
          result.set(id, {
            id,
            userEmail: p.userEmail!,
            userName: u?.name ?? p.userName ?? '보호자',
            freelancerId: p.freelancerId,
            freelancerName: fl.name,
            freelancerEmail: email,
          });
        }
      });
  }

  return Array.from(result.values());
}
