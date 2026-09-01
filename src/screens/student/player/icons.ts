import { Video, FileText, HelpCircle, ClipboardList, Download, Radio } from 'lucide-react';
import type { Lesson } from '@/lib/types';

/** Shared lesson-type → glyph map for the player (curriculum rows + stage). */
export const typeIcon: Record<Lesson['type'], typeof Video> = {
  VIDEO: Video,
  TEXT: FileText,
  QUIZ: HelpCircle,
  ASSIGNMENT: ClipboardList,
  DOWNLOAD: Download,
  LIVE_REPLAY: Radio,
};

/** Recursively flatten Tiptap-style JSON (or a plain string) into readable text. */
export function extractText(node: unknown): string {
  if (node == null) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (typeof node === 'object') {
    const o = node as Record<string, unknown>;
    let s = '';
    if (typeof o.text === 'string') s += o.text;
    if (o.content) s += extractText(o.content);
    if (o.type === 'paragraph' || o.type === 'heading' || o.type === 'listItem') s += '\n';
    return s;
  }
  return '';
}
