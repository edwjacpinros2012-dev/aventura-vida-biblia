type IconProps = { className?: string };

export function SearchIcon({ className = "" }: IconProps) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2.3"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.1 4.1" /></svg>;
}

export function ArrowRight({ className = "" }: IconProps) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h13M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function Sparkle({ className = "" }: IconProps) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor"><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Zm7 14 1 3.1L23 20l-3 1-1 3-1-3-3-1 3-1 1-3ZM5 15l.8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8L5 15Z" /></svg>;
}

export function MenuIcon({ className = "" }: IconProps) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" /></svg>;
}

export function CloseIcon({ className = "" }: IconProps) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2.4"><path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" /></svg>;
}

export function CheckIcon({ className = "" }: IconProps) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="2.7"><path d="m5 12.5 4.2 4.1L19.5 6.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
