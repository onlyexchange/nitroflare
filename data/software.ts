// data/software.ts
export type Sku = {
  id: string;
  label: string;
  priceUSD: number;
  wasUSD?: number;
  license: 'Lifetime' | '1 Year' | '2 Years' | 'Perpetual';
  platform: 'Windows' | 'macOS' | 'Linux' | 'Cross-platform';
  seats?: string;            // e.g. "1 PC", "5 devices"
};

export type SoftwareProduct = {
  slug: string;
  name: string;
  vendor?: string;
  category: 'OS' | 'Office' | 'Security' | 'Creative' | 'Utility' | 'Developer';
  status: 'live' | 'soon';
  blurb: string;
  monogram: string;
  vibe: { ring: string; chip: string; mono: string; glow: string };
  features: string[];
  skus: Sku[];
  activation?: {
    steps: string[];
    link?: string;
  };
};

export const SOFTWARE: SoftwareProduct[] = [
  {
    slug: 'windows-11-pro',
    name: 'Windows 11 Pro',
    vendor: 'Microsoft',
    category: 'OS',
    status: 'live',
    blurb: 'Genuine activation key — instant email delivery.',
    monogram: 'W',
    vibe: {
      ring: 'from-sky-300/70 via-sky-500/60 to-indigo-600/70',
      chip: 'from-sky-500 via-blue-600 to-indigo-600',
      mono: 'from-sky-500 via-blue-600 to-indigo-600',
      glow: 'shadow-[0_0_28px_rgba(59,130,246,0.28)]',
    },
    features: [
      'Official activation',
      'Works on new installs & upgrades',
      'Retail/Global key',
      'Email delivery in minutes',
    ],
    skus: [
      { id:'win11pro-1pc', label:'Windows 11 Pro — 1 PC', priceUSD: 24.95, wasUSD: 89.00, license:'Lifetime', platform:'Windows', seats:'1 PC' },
      { id:'win11pro-3pc', label:'Windows 11 Pro — 3 PCs', priceUSD: 59.95, wasUSD: 129.00, license:'Lifetime', platform:'Windows', seats:'3 PCs' },
    ],
    activation: {
      steps: [
        'Open Settings → System → Activation.',
        'Click “Change product key”.',
        'Paste your key and follow prompts.',
      ],
      link: 'https://support.microsoft.com/windows',
    },
  },
  {
    slug: 'office-2021-pro-plus',
    name: 'Office 2021 Pro Plus',
    vendor: 'Microsoft',
    category: 'Office',
    status: 'live',
    blurb: 'Perpetual license for classic Office apps.',
    monogram: 'O',
    vibe: {
      ring: 'from-amber-300/70 via-orange-500/60 to-rose-500/70',
      chip: 'from-amber-500 via-orange-500 to-rose-500',
      mono: 'from-amber-500 via-orange-500 to-rose-500',
      glow: 'shadow-[0_0_28px_rgba(251,191,36,0.28)]',
    },
    features: [
      'Word, Excel, PowerPoint, Outlook, Access, Publisher',
      'One-time activation (no subscription)',
      'Retail/Global key',
      'Instant delivery',
    ],
    skus: [
      { id:'o21-1pc', label:'Office 2021 Pro Plus — 1 PC', priceUSD: 29.95, wasUSD: 199.99, license:'Perpetual', platform:'Windows', seats:'1 PC' },
    ],
    activation: {
      steps: [
        'Download & install Office.',
        'Open any app → Sign in when prompted.',
        'Enter your product key to activate.',
      ],
    },
  },
  {
    slug: 'malwarebytes-premium',
    name: 'Malwarebytes Premium',
    vendor: 'Malwarebytes',
    category: 'Security',
    status: 'live',
    blurb: 'Real-time protection against malware, ransomware, and PUPs.',
    monogram: 'M',
    vibe: {
      ring: 'from-cyan-300/70 via-cyan-500/60 to-teal-600/70',
      chip: 'from-cyan-500 via-sky-500 to-teal-600',
      mono: 'from-cyan-500 via-sky-500 to-teal-600',
      glow: 'shadow-[0_0_28px_rgba(34,197,94,0.24)]',
    },
    features: [
      'Real-time protection',
      'Ransomware rollback',
      'Web shield',
      'Windows/macOS',
    ],
    skus: [
      { id:'mb-1y-1dev', label:'Premium — 1 Year / 1 Device', priceUSD: 19.95, wasUSD: 39.99, license:'1 Year', platform:'Cross-platform', seats:'1 device' },
      { id:'mb-1y-3dev', label:'Premium — 1 Year / 3 Devices', priceUSD: 29.95, wasUSD: 59.99, license:'1 Year', platform:'Cross-platform', seats:'3 devices' },
    ],
  },
  {
    slug: 'parallels-desktop',
    name: 'Parallels Desktop',
    vendor: 'Parallels',
    category: 'Utility',
    status: 'live',
    blurb: 'Run Windows on your Mac—fast, seamless, native-feeling.',
    monogram: 'P',
    vibe: {
      ring: 'from-rose-400/70 via-red-500/60 to-rose-600/70',
      chip: 'from-red-500 via-rose-500 to-rose-600',
      mono: 'from-red-500 via-rose-500 to-rose-600',
      glow: 'shadow-[0_0_28px_rgba(244,63,94,0.28)]',
    },
    features: [
      'Apple Silicon & Intel Mac support',
      'Coherence mode',
      'DirectX 11',
    ],
    skus: [
      { id:'pd-1y', label:'Parallels Desktop — 1 Year', priceUSD: 39.95, wasUSD: 99.99, license:'1 Year', platform:'macOS' },
    ],
  },
  {
    slug: 'jetbrains-toolbox',
    name: 'JetBrains Toolbox (Indie)',
    vendor: 'JetBrains',
    category: 'Developer',
    status: 'soon',
    blurb: 'Full IDE suite in one subscription.',
    monogram: 'J',
    vibe: {
      ring: 'from-fuchsia-400/70 via-purple-500/60 to-indigo-600/70',
      chip: 'from-fuchsia-500 via-purple-500 to-indigo-600',
      mono: 'from-fuchsia-500 via-purple-500 to-indigo-600',
      glow: 'shadow-[0_0_28px_rgba(168,85,247,0.28)]',
    },
    features: ['All major IDEs', 'Updates included', 'Cross-platform'],
    skus: [
      { id:'jb-1y', label:'Toolbox Indie — 1 Year', priceUSD: 129.00, license:'1 Year', platform:'Cross-platform' },
    ],
  },
];
