import { Link } from "react-router-dom";
import Photo from "../components/Photo";
import vehicles from "../data/vehicles";
import "../App.css";

export default function Default() {
  return (
    <div className="page">
      <h1>The Shed</h1>
      <p className="tagline">
        Photo tours of the machines around the place. Pick one to start the
        slide show.
      </p>

      <ul className="vehicle-grid">
        {vehicles.map((vehicle) => {
          const cover = vehicle.slides[0];
          return (
            <li key={vehicle.slug}>
              <Link className="vehicle-card" to={`/vehicles/${vehicle.slug}`}>
                <div className="vehicle-card-frame">
                  {cover && <Photo src={cover.src} alt={cover.alt} />}
                </div>
                <div className="vehicle-card-body">
                  <span className="vehicle-kind">{vehicle.kind}</span>
                  <h2>{vehicle.name}</h2>
                  <p>{vehicle.tagline}</p>
                  <span className="vehicle-count">
                    {vehicle.slides.length} photos →
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
