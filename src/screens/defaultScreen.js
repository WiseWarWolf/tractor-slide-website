import '../App.css';
import { Link } from 'react-router-dom';
import Carousel from '../components/Carousel';
import slides from '../data/slides';

export default function Default() {
  return (
    <div className="Default-View">
        <h1>Clarence the Tractor</h1>
        <p className="tagline">
          A slide show of one very good tractor. Scroll through at your own pace.
        </p>

        <Carousel slides={slides} />

        <nav>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>
    </div>
  );
}
