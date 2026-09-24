import { logo } from './logo';

type Props = { className?: string; title?: string; wordmark?: boolean };

export function Symbol({ className, title }: Omit<Props, 'wordmark'>) {
  const { x, y, w, h } = logo.viewBox;
  return (
    <svg className={className} viewBox={`${x} ${y} ${w} ${h}`} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <path d={logo.path} fill="currentColor" />
    </svg>
  );
}

/** Símbolo + wordmark tipográfico. */
export function Logo({ className, title = 'NUTT', wordmark = true }: Props) {
  return (
    <span className={`logo ${className ?? ''}`} role="img" aria-label={title}>
      <Symbol className="logo__symbol" />
      {wordmark && (
        <span className="logo__word" aria-hidden>
          NUTT
        </span>
      )}
    </span>
  );
}
