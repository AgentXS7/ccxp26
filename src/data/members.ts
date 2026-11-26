import type { GroupMemberId, GroupMemberSpec } from '../types';

export const GROUP_MEMBERS: GroupMemberSpec[] = [
  { id: 'max', name: 'Max' },
  { id: 'allan', name: 'Allan' },
  { id: 'dino', name: 'Dino' },
  { id: 'leandro', name: 'Leandro' },
];

export function findMemberByNameOrId(val: string): GroupMemberSpec | undefined {
  const clean = val.trim().toLowerCase();
  if (!clean) return undefined;
  return GROUP_MEMBERS.find(
    (m) => m.id === clean || m.name.toLowerCase() === clean
  );
}

export function getMemberName(id: GroupMemberId): string {
  return GROUP_MEMBERS.find((m) => m.id === id)?.name || id;
}

export function generateTransferCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}
