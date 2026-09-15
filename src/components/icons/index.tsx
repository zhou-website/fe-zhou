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

// Raw component export if custom icon definition is needed
export { FontAwesomeIcon };
