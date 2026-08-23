import { Link } from "react-router-dom";
import "../App.css";

export default function NotFound() {
  return (
    <div className="page page-text">
      <h1>Wrong turn</h1>
      <p>That page isn't in the shed.</p>
      <Link className="back-link" to="/">
        ← Back to the shed
      </Link>
    </div>
  );
}
