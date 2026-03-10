export interface NavChildItem {
  label: string;
  href: string;
}

export interface NavItemType {
  label: string;
  href: string;
  isMega?: boolean;
  children?: NavChildItem[];
}

export interface CommissariatLinkType {
  slug: string;
  name: string;
  logo_univ: string;
}

export interface NavbarProps {
  scrolled?: boolean;
  pathname: string;
  navItems: NavItemType[];
  commissariatLinks: CommissariatLinkType[];
  isOpen?: boolean;
  onClose?: () => void;
}
