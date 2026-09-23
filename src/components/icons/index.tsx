import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import {
  faBookOpen,
  faShieldHalved,
  faBriefcase,
  faCircleCheck,
  faLocationDot,
  faPhone,
  faEnvelope,
  faClock,
  faArrowRight,
  faChevronDown,
  faChevronRight,
  faBars,
  faXmark,
  faUser,
  faLock,
  faFileLines,
  faDownload,
  faMagnifyingGlass,
  faFilter,
  faPlus,
  faTrash,
  faPenToSquare,
  faComments,
  faPaperPlane,
  faRightFromBracket,
  faBuilding,
  faFileArrowDown,
  faEye,
  faCheck,
  faCircleQuestion,
  faCalendarDays,
  faGears,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import {
  faWhatsapp,
  faLinkedin,
  faInstagram,
  faGoogle,
} from "@fortawesome/free-brands-svg-icons";

// Prevent Font Awesome from adding its CSS since we imported it directly
config.autoAddCss = false;

export interface IconProps {
  className?: string;
  size?: "xs" | "sm" | "lg" | "1x" | "2x" | "3x";
}

function createIcon(icon: IconDefinition, defaultClassName = "") {
  const IconComponent = ({ className = "", size }: IconProps) => (
    <FontAwesomeIcon
      icon={icon}
      size={size}
      className={className || defaultClassName}
      aria-hidden="true"
    />
  );
  IconComponent.displayName = `Icon(${icon.iconName})`;
  return IconComponent;
}

// Approved icons mapped for Zhou Consulting
export const BookIcon = createIcon(faBookOpen);
export const ShieldTaxIcon = createIcon(faShieldHalved);
export const BriefcaseIcon = createIcon(faBriefcase);
export const CheckCircleIcon = createIcon(faCircleCheck);
export const CheckIcon = createIcon(faCheck);
export const LocationIcon = createIcon(faLocationDot);
export const PhoneIcon = createIcon(faPhone);
export const EnvelopeIcon = createIcon(faEnvelope);
export const ClockIcon = createIcon(faClock);
export const ArrowRightIcon = createIcon(faArrowRight);
export const ChevronDownIcon = createIcon(faChevronDown);
export const ChevronRightIcon = createIcon(faChevronRight);
export const MenuIcon = createIcon(faBars);
export const CloseIcon = createIcon(faXmark);
export const UserIcon = createIcon(faUser);
export const LockIcon = createIcon(faLock);
export const DocumentIcon = createIcon(faFileLines);
export const DownloadIcon = createIcon(faDownload);
export const SearchIcon = createIcon(faMagnifyingGlass);
export const FilterIcon = createIcon(faFilter);
export const PlusIcon = createIcon(faPlus);
export const TrashIcon = createIcon(faTrash);
export const EditIcon = createIcon(faPenToSquare);
export const ChatbotIcon = createIcon(faComments);
export const SendIcon = createIcon(faPaperPlane);
export const LogoutIcon = createIcon(faRightFromBracket);
export const BuildingIcon = createIcon(faBuilding);
export const ExportIcon = createIcon(faFileArrowDown);
export const EyeIcon = createIcon(faEye);
export const QuestionCircleIcon = createIcon(faCircleQuestion);
export const CalendarIcon = createIcon(faCalendarDays);
export const SettingsIcon = createIcon(faGears);

// Brands
export const WhatsappIcon = createIcon(faWhatsapp);
export const LinkedinIcon = createIcon(faLinkedin);
export const InstagramIcon = createIcon(faInstagram);
export const GoogleIcon = createIcon(faGoogle);

export function GoogleColorIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

// Raw component export if custom icon definition is needed
export { FontAwesomeIcon };
