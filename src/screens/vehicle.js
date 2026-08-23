import { Link, useParams } from "react-router-dom";
import Carousel from "../components/Carousel";
import { findVehicle } from "../data/vehicles";
import "../App.css";

// One machine, one page: /vehicles/clarence
export default function Vehicle() {
  const { slug } = useParams();
  const vehicle = findVehicle(slug);

  if (!vehicle) {
    return (
      <div className="page">
        <h1>Nothing in that stall</h1>
        <p className="tagline">No vehicle here goes by “{slug}”.</p>
        <Link className="back-link" to="/">
          ← Back to the shed
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <span className="vehicle-kind">{vehicle.kind}</span>
      <h1>{vehicle.name}</h1>
      <p className="tagline">{vehicle.description}</p>

      <Carousel slides={vehicle.slides} />

      <Link className="back-link" to="/">
        ← All vehicles
      </Link>
    </div>
  );
}
