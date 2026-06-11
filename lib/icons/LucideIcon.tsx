import type React from 'react';
import type { LucideIcon as LucideIconComponent, LucideProps } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import { memo } from 'react';

// Deep per-icon imports keep Metro from bundling the whole lucide barrel
// (~3,300 icon modules); only the icons registered below ship in the bundle.
// Metro resolves these file paths even though they are not in the package
// `exports` map (it falls back to file-based resolution with a warning).
import ArrowDown from 'lucide-react-native/dist/esm/icons/arrow-down.js';
import ArrowDownLeft from 'lucide-react-native/dist/esm/icons/arrow-down-left.js';
import ArrowLeft from 'lucide-react-native/dist/esm/icons/arrow-left.js';
import ArrowLeftRight from 'lucide-react-native/dist/esm/icons/arrow-left-right.js';
import ArrowRight from 'lucide-react-native/dist/esm/icons/arrow-right.js';
import ArrowUpRight from 'lucide-react-native/dist/esm/icons/arrow-up-right.js';
import Baby from 'lucide-react-native/dist/esm/icons/baby.js';
import Brain from 'lucide-react-native/dist/esm/icons/brain.js';
import Check from 'lucide-react-native/dist/esm/icons/check.js';
import ChevronDown from 'lucide-react-native/dist/esm/icons/chevron-down.js';
import ChevronRight from 'lucide-react-native/dist/esm/icons/chevron-right.js';
import ChevronUp from 'lucide-react-native/dist/esm/icons/chevron-up.js';
import CircleAlert from 'lucide-react-native/dist/esm/icons/circle-alert.js';
import CircleCheck from 'lucide-react-native/dist/esm/icons/circle-check.js';
import CircleOff from 'lucide-react-native/dist/esm/icons/circle-off.js';
import Clock3 from 'lucide-react-native/dist/esm/icons/clock-3.js';
import Coffee from 'lucide-react-native/dist/esm/icons/coffee.js';
import Cookie from 'lucide-react-native/dist/esm/icons/cookie.js';
import Database from 'lucide-react-native/dist/esm/icons/database.js';
import Download from 'lucide-react-native/dist/esm/icons/download.js';
import Flower2 from 'lucide-react-native/dist/esm/icons/flower-2.js';
import Gamepad2 from 'lucide-react-native/dist/esm/icons/gamepad-2.js';
import Ghost from 'lucide-react-native/dist/esm/icons/ghost.js';
import Image from 'lucide-react-native/dist/esm/icons/image.js';
import Languages from 'lucide-react-native/dist/esm/icons/languages.js';
import Layers from 'lucide-react-native/dist/esm/icons/layers.js';
import ListChecks from 'lucide-react-native/dist/esm/icons/list-checks.js';
import ListFilter from 'lucide-react-native/dist/esm/icons/list-filter.js';
import ListPlus from 'lucide-react-native/dist/esm/icons/list-plus.js';
import LogOut from 'lucide-react-native/dist/esm/icons/log-out.js';
import MapPin from 'lucide-react-native/dist/esm/icons/map-pin.js';
import Minus from 'lucide-react-native/dist/esm/icons/minus.js';
import MoonStar from 'lucide-react-native/dist/esm/icons/moon-star.js';
import Music4 from 'lucide-react-native/dist/esm/icons/music-4.js';
import NotebookPen from 'lucide-react-native/dist/esm/icons/notebook-pen.js';
import NotebookText from 'lucide-react-native/dist/esm/icons/notebook-text.js';
import Pencil from 'lucide-react-native/dist/esm/icons/pencil.js';
import Percent from 'lucide-react-native/dist/esm/icons/percent.js';
import Phone from 'lucide-react-native/dist/esm/icons/phone.js';
import Plus from 'lucide-react-native/dist/esm/icons/plus.js';
import ReceiptText from 'lucide-react-native/dist/esm/icons/receipt-text.js';
import Save from 'lucide-react-native/dist/esm/icons/save.js';
import ScanFace from 'lucide-react-native/dist/esm/icons/scan-face.js';
import SendHorizontal from 'lucide-react-native/dist/esm/icons/send-horizontal.js';
import Settings2 from 'lucide-react-native/dist/esm/icons/settings-2.js';
import Share2 from 'lucide-react-native/dist/esm/icons/share-2.js';
import Square from 'lucide-react-native/dist/esm/icons/square.js';
import Store from 'lucide-react-native/dist/esm/icons/store.js';
import Sun from 'lucide-react-native/dist/esm/icons/sun.js';
import Trash2 from 'lucide-react-native/dist/esm/icons/trash-2.js';
import TriangleAlert from 'lucide-react-native/dist/esm/icons/triangle-alert.js';
import Trophy from 'lucide-react-native/dist/esm/icons/trophy.js';
import Upload from 'lucide-react-native/dist/esm/icons/upload.js';
import UserPlus from 'lucide-react-native/dist/esm/icons/user-plus.js';
import UserRound from 'lucide-react-native/dist/esm/icons/user-round.js';
import UsersRound from 'lucide-react-native/dist/esm/icons/users-round.js';
import UtensilsCrossed from 'lucide-react-native/dist/esm/icons/utensils-crossed.js';
import Wallet from 'lucide-react-native/dist/esm/icons/wallet.js';
import WalletCards from 'lucide-react-native/dist/esm/icons/wallet-cards.js';
import X from 'lucide-react-native/dist/esm/icons/x.js';

const registry = {
  ArrowDown,
  ArrowDownLeft,
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  Baby,
  Brain,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleAlert,
  CircleCheck,
  CircleOff,
  Clock3,
  Coffee,
  Cookie,
  Database,
  Download,
  Flower2,
  Gamepad2,
  Ghost,
  Image,
  Languages,
  Layers,
  ListChecks,
  ListFilter,
  ListPlus,
  LogOut,
  MapPin,
  Minus,
  MoonStar,
  Music4,
  NotebookPen,
  NotebookText,
  Pencil,
  Percent,
  Phone,
  Plus,
  ReceiptText,
  Save,
  ScanFace,
  SendHorizontal,
  Settings2,
  Share2,
  Square,
  Store,
  Sun,
  Trash2,
  TriangleAlert,
  Trophy,
  Upload,
  UserPlus,
  UserRound,
  UsersRound,
  UtensilsCrossed,
  Wallet,
  WalletCards,
  X,
} satisfies Record<string, LucideIconComponent>;

export type IconName = keyof typeof registry;
type IconProps = LucideProps & { name: IconName; className?: string };

type InteropIcon = React.ComponentType<LucideProps & { className?: string }>;

// Persisted data (imported JSON ledgers) can still carry icon names outside the
// registry, so unknown names fall back to the Image glyph at runtime.
const interopCache = new Map<IconName, InteropIcon>();

function getInteropIcon(name: IconName) {
  const cached = interopCache.get(name);

  if (cached) {
    return cached;
  }

  const wrapped = cssInterop(registry[name] ?? registry.Image, {
    className: {
      target: 'style',
      nativeStyleToProp: {
        color: true,
        opacity: true,
        width: true,
        height: true,
      },
    },
  });

  interopCache.set(name, wrapped);
  return wrapped;
}

const Icon: React.FC<IconProps> = memo(({ name, className, ...rest }) => {
  const CustomIcon = getInteropIcon(name);

  return <CustomIcon className={className} {...rest} />;
});

Icon.displayName = 'LucideIcon';

export default Icon;
