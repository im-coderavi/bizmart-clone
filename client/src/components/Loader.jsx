export default function Loader({ label = "Loading..." }) {
  return (
    <div className="loader">
      <span className="spinner" />
      <p>{label}</p>
    </div>
  );
}

export function PageMessage({ children }) {
  return <div className="page-message">{children}</div>;
}
