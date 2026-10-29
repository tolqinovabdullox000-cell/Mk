export default function ErrorNotice({ children, className = '' }) {
  if (!children) return null;
  return <div className={`error notice ${className}`.trim()} role="alert">{children}</div>;
}
