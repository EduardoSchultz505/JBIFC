export default function Container({ className = "max-w-6xl", children }) {
  return <div className={`mx-auto w-full px-4 md:px-6 ${className}`}>{children}</div>;
}