interface IconProps {
  name:
    | 'play' | 'login' | 'userPlus' | 'settings' | 'volume' | 'close'
    | 'exit' | 'star' | 'points' | 'arrow' | 'replay' | 'book'
    | 'ball' | 'market' | 'user' | 'check'| 'lock';
  size?: number;
  className?: string;
}

export default function Icon({ name, size = 22, className = '' }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  };

  const paths: Record<IconProps['name'], React.ReactNode> = {
    play: <path d="M6 4l14 8-14 8z" />,
    login: <><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M13 3h5a3 3 0 013 3v12a3 3 0 01-3 3h-5" /></>,
    userPlus: <><path d="M15 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8" cy="7" r="4" /><path d="M19 8v6M16 11h6" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0015 19.4a1.7 1.7 0 00-1 .6 1.7 1.7 0 00-.4 1.1V21h-4v-.1A1.7 1.7 0 008.6 19.4a1.7 1.7 0 00-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 004.6 15a1.7 1.7 0 00-.6-1 1.7 1.7 0 00-1.1-.4H3v-4h.1A1.7 1.7 0 004.6 8.6a1.7 1.7 0 00-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 009 4.6a1.7 1.7 0 001-.6 1.7 1.7 0 00.4-1.1V3h4v.1A1.7 1.7 0 0015.4 4.6a1.7 1.7 0 001.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0019.4 9c.14.38.36.72.64 1 .28.28.62.5 1 .64H21v4h-.1a1.7 1.7 0 00-1.5.36z" /></>,
    volume: <><path d="M11 5L6 9H2v6h4l5 4z" /><path d="M15.5 8.5a5 5 0 010 7" /><path d="M18 6a8 8 0 010 12" /></>,
    close: <path d="M18 6L6 18M6 6l12 12" />,
    exit: <><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M21 19V5a2 2 0 00-2-2h-6" /></>,
    star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />,
    points: <><circle cx="12" cy="12" r="9" /><path d="M12 7v10M9 10h4.5a2 2 0 010 4H10a2 2 0 000 4h5" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    replay: <><path d="M3 12a9 9 0 109-9 9 9 0 00-6.36 2.64L3 8" /><path d="M3 3v5h5" /></>,
    book: <><path d="M4 4h7a3 3 0 013 3v13a3 3 0 00-3-3H4z" /><path d="M20 4h-7a3 3 0 00-3 3" /></>,
    ball: <><circle cx="12" cy="12" r="9" /><path d="M12 7l3 2-1 4h-4L9 9zM8 4l1 5M16 4l-1 5M4 14l6-1M20 14l-6-1M8 20l2-7M16 20l-2-7" /></>,
    market: <><path d="M3 9h18l-2-5H5z" /><path d="M5 9v11h14V9" /><path d="M8 20v-6h4v6M15 13h2" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></>,
    check: <path d="M5 12l4 4L19 6" />,
    lock: (
  <>
    <rect
      x="5"
      y="10"
      width="14"
      height="10"
      rx="2"
    />
    <path d="M8 10V7a4 4 0 018 0v3" />
  </>
),
  };

  return <svg {...common}>{paths[name]}</svg>;
}
