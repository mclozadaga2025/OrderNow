import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import type {
  AvatarIcon,
  Group,
  Member,
  MenuCategory,
  MenuItem,
  Transaction,
  TransactionParticipant,
  Venue,
} from '@/lib/ordernows';
import type { IconName } from '@/lib/icons/LucideIcon';

export const ORDERNOWS_STORAGE_KEY = '@ordernows/local-json-ledger-v1';
export const ORDERNOWS_STORAGE_VERSION = 2;

export interface OrdernowsSnapshot {
  version: typeof ORDERNOWS_STORAGE_VERSION;
  exportedAt: string;
  ledgerName: string;
  currentUserId: string;
  groups: Group[];
  members: Member[];
  venues: Venue[];
  transactions: Transaction[];
}

export interface OrdernowsPersistableState {
  ledgerName: string;
  currentUserId: string;
  groups: Group[];
  members: Member[];
  venues: Venue[];
  transactions: Transaction[];
}

interface ExportResult {
  fileName: string;
  uri?: string;
}

const avatarFallback: AvatarIcon = 'UserRound';
const validAvatars = new Set<AvatarIcon>([
  'UserRound',
  'Flower2',
  'Ghost',
  'Baby',
  'Cookie',
  'Brain',
  'Gamepad2',
  'Music4',
]);
const validCategories = new Set<MenuCategory>(['Drinks', 'Food', 'Dessert', 'Other']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function readOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function readNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function readStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string').map((entry) => entry.trim()).filter(Boolean)
    : [];
}

function readRecordArray(value: unknown) {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function uniqueId(rawId: unknown, fallbackPrefix: string, seen: Set<string>) {
  const base = readString(rawId, `${fallbackPrefix}-${seen.size + 1}`).replace(/\s+/g, '-');
  let candidate = base;
  let suffix = 2;

  while (seen.has(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  seen.add(candidate);
  return candidate;
}

function sanitizeGroups(value: unknown) {
  const seen = new Set<string>();

  return readRecordArray(value).map((group) => ({
    id: uniqueId(group.id, 'group', seen),
    name: readString(group.name, 'Untitled Group'),
    tagline: readString(group.tagline, 'Local ledger group'),
  }));
}

function sanitizeMembers(value: unknown, groupIds: Set<string>) {
  const seen = new Set<string>();

  return readRecordArray(value).map((member) => {
    const avatar = readString(member.avatar, avatarFallback) as AvatarIcon;

    return {
      id: uniqueId(member.id, 'member', seen),
      name: readString(member.name, 'Unnamed Member'),
      initials: readString(member.initials, 'UM').slice(0, 3).toUpperCase(),
      phone: readString(member.phone, 'No phone on file'),
      favoriteDrink: readString(member.favoriteDrink, 'Unknown'),
      balance: readNumber(member.balance),
      groupIds: readStringArray(member.groupIds).filter((groupId) => groupIds.has(groupId)),
      avatar: validAvatars.has(avatar) ? avatar : avatarFallback,
      role: readOptionalString(member.role),
    };
  });
}

function sanitizeMenuItems(value: unknown) {
  const seen = new Set<string>();

  return readRecordArray(value).map((item) => {
    const category = readString(item.category, 'Other') as MenuCategory;

    return {
      id: uniqueId(item.id, 'item', seen),
      name: readString(item.name, 'Untitled Item'),
      price: Math.max(readNumber(item.price), 0),
      description: readOptionalString(item.description),
      category: validCategories.has(category) ? category : 'Other',
    } satisfies MenuItem;
  });
}

function sanitizeVenues(value: unknown) {
  const seen = new Set<string>();

  return readRecordArray(value).map((venue) => ({
    id: uniqueId(venue.id, 'venue', seen),
    name: readString(venue.name, 'Untitled Venue'),
    address: readString(venue.address, 'No address on file'),
    openUntil: readString(venue.openUntil, '10 PM'),
    icon: readString(venue.icon, 'Store') as IconName,
    menuItems: sanitizeMenuItems(venue.menuItems),
  }));
}

function sanitizeParticipants(value: unknown) {
  return readRecordArray(value).reduce<TransactionParticipant[]>((participants, participant) => {
    const memberId = readString(participant.memberId);

    if (!memberId) {
      return participants;
    }

    participants.push({
      memberId,
      item: readString(participant.item, 'Shared tab'),
      amount: Math.max(readNumber(participant.amount), 0),
      sharePercent: Math.max(readNumber(participant.sharePercent), 0),
      shared: typeof participant.shared === 'boolean' ? participant.shared : undefined,
    });

    return participants;
  }, []);
}

function sanitizeTransactions(value: unknown) {
  const seen = new Set<string>();

  return readRecordArray(value).map((transaction) => {
    const type = transaction.type === 'credit' ? 'credit' : 'debit';
    const groupId = readOptionalString(transaction.groupId);
    const venueId = readOptionalString(transaction.venueId);
    const memberId = readOptionalString(transaction.memberId);

    return {
      id: uniqueId(transaction.id, 'txn', seen),
      type,
      title: readString(transaction.title, type === 'credit' ? 'Wallet Top-up' : 'Shared Tab'),
      subtitle: readString(transaction.subtitle, type === 'credit' ? 'Manual recharge' : 'Shared tab'),
      amount: Math.max(readNumber(transaction.amount), 0),
      date: readString(transaction.date, new Date().toISOString()),
      groupId,
      venueId,
      memberId,
      note: readOptionalString(transaction.note),
      channel: readOptionalString(transaction.channel),
      subtotal: typeof transaction.subtotal === 'number' ? Math.max(transaction.subtotal, 0) : undefined,
      discountPercent:
        typeof transaction.discountPercent === 'number' ? Math.max(transaction.discountPercent, 0) : undefined,
      discountAmount:
        typeof transaction.discountAmount === 'number' ? Math.max(transaction.discountAmount, 0) : undefined,
      totalShared: typeof transaction.totalShared === 'number' ? Math.max(transaction.totalShared, 0) : undefined,
      participants: sanitizeParticipants(transaction.participants),
      settledAt: readOptionalString(transaction.settledAt),
      restorationOfId: readOptionalString(transaction.restorationOfId),
    } satisfies Transaction;
  });
}

function getTransactionBalanceChanges(transaction: Transaction) {
  const balanceChanges = new Map<string, number>();

  if (transaction.type === 'credit' && transaction.memberId) {
    balanceChanges.set(transaction.memberId, transaction.amount);
  }

  if (transaction.type === 'debit') {
    transaction.participants?.forEach((participant) => {
      balanceChanges.set(
        participant.memberId,
        (balanceChanges.get(participant.memberId) ?? 0) - participant.amount
      );
    });
  }

  return balanceChanges;
}

function repairLegacyMemberBalances(members: Member[], transactions: Transaction[]) {
  const legacyBalances = new Map<string, number>();
  const signedBalances = new Map<string, number>();

  // Add only the deficit hidden by the old zero floor so unrelated stored balance changes survive migration.
  [...transactions]
    .sort((left, right) => left.date.localeCompare(right.date))
    .forEach((transaction) => {
      getTransactionBalanceChanges(transaction).forEach((change, memberId) => {
        legacyBalances.set(memberId, Math.max((legacyBalances.get(memberId) ?? 0) + change, 0));
        signedBalances.set(memberId, (signedBalances.get(memberId) ?? 0) + change);
      });
    });

  return members.map((member) => ({
    ...member,
    balance:
      member.balance +
      (signedBalances.get(member.id) ?? 0) -
      (legacyBalances.get(member.id) ?? 0),
  }));
}

function getImportSource(value: unknown) {
  if (!isRecord(value)) {
    throw new Error('The selected file is not a valid Ordernows JSON object.');
  }

  return isRecord(value.data) ? value.data : value;
}

export function createOrdernowsSnapshot(state: OrdernowsPersistableState): OrdernowsSnapshot {
  return {
    version: ORDERNOWS_STORAGE_VERSION,
    exportedAt: new Date().toISOString(),
    ledgerName: state.ledgerName,
    currentUserId: state.currentUserId,
    groups: state.groups,
    members: state.members,
    venues: state.venues,
    transactions: state.transactions,
  };
}

export function parseOrdernowsSnapshot(text: string): OrdernowsSnapshot {
  const source = getImportSource(JSON.parse(text) as unknown);
  const groups = sanitizeGroups(source.groups);
  const groupIds = new Set(groups.map((group) => group.id));
  const venues = sanitizeVenues(source.venues);
  const transactions = sanitizeTransactions(source.transactions);
  const sanitizedMembers = sanitizeMembers(source.members, groupIds);
  const members =
    source.version === 1
      ? repairLegacyMemberBalances(sanitizedMembers, transactions)
      : sanitizedMembers;
  const memberIds = new Set(members.map((member) => member.id));
  const importedCurrentUserId = readString(source.currentUserId);
  const currentUserId = memberIds.has(importedCurrentUserId) ? importedCurrentUserId : members[0]?.id ?? '';

  return {
    version: ORDERNOWS_STORAGE_VERSION,
    exportedAt: readString(source.exportedAt, new Date().toISOString()),
    ledgerName: readString(source.ledgerName, 'Local Ledger'),
    currentUserId,
    groups,
    members,
    venues,
    transactions,
  };
}

export function serializeOrdernowsSnapshot(snapshot: OrdernowsSnapshot) {
  return JSON.stringify(snapshot, null, 2);
}

export async function loadStoredOrdernowsSnapshot() {
  const raw = await AsyncStorage.getItem(ORDERNOWS_STORAGE_KEY);
  return raw ? parseOrdernowsSnapshot(raw) : null;
}

export async function saveStoredOrdernowsSnapshot(snapshot: OrdernowsSnapshot) {
  await AsyncStorage.setItem(ORDERNOWS_STORAGE_KEY, JSON.stringify(snapshot));
}

function buildFileName() {
  const stamp = new Date().toISOString().slice(0, 10);
  return `ordernows-ledger-${stamp}.json`;
}

function exportWebJson(fileName: string, json: string) {
  const blob = new Blob([json], { type: 'application/json' });
  const url = globalThis.URL.createObjectURL(blob);
  const anchor = globalThis.document.createElement('a');

  anchor.href = url;
  anchor.download = fileName;
  anchor.style.display = 'none';
  globalThis.document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  globalThis.URL.revokeObjectURL(url);
}

export async function exportOrdernowsSnapshot(snapshot: OrdernowsSnapshot): Promise<ExportResult> {
  const fileName = buildFileName();
  const json = serializeOrdernowsSnapshot(snapshot);

  if (Platform.OS === 'web') {
    exportWebJson(fileName, json);
    return { fileName };
  }

  const file = new File(Paths.cache, fileName);
  file.write(json);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      dialogTitle: 'Export Ordernows JSON',
      mimeType: 'application/json',
      UTI: 'public.json',
    });
  }

  return { fileName, uri: file.uri };
}

async function pickWebJsonText() {
  return new Promise<string | null>((resolve, reject) => {
    const input = globalThis.document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json,text/json';

    input.onchange = () => {
      const file = input.files?.[0];

      if (!file) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => reject(new Error('Could not read the selected JSON file.'));
      reader.readAsText(file);
    };

    input.click();
  });
}

export async function importOrdernowsSnapshotFromFile() {
  if (Platform.OS === 'web') {
    const text = await pickWebJsonText();
    return text ? parseOrdernowsSnapshot(text) : null;
  }

  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/json'],
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled) {
    return null;
  }

  const uri = result.assets[0]?.uri;

  if (!uri) {
    return null;
  }

  const file = new File(uri);
  const text = await file.text();
  return parseOrdernowsSnapshot(text);
}
