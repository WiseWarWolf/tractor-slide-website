import logo from '../logo.svg';
import '../App.css';
import { Link } from 'react-router-dom';

export default function Default() {
  return (
    <div className="Default-View">
        <h1>Welcome to the beginning of Clarence the Tractor Slide Show</h1>
        <Link to="about">About</Link>
    </div>
  );
}