import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="page-wrap notfound">
      <h1>404</h1>
      <p>The page you're looking for doesn't exist.</p>
      <Link className="btn-primary" to="/">
        Go Home
      </Link>
    </div>
  );
}
