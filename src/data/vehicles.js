import clarenceSlides from "./clarence";

// Every machine on the site. To add one: make a photo file next to
// clarence.js exporting its slides, then add an entry here. The slug is the
// URL — /vehicles/clarence — so keep it lowercase and dash-separated.
const vehicles = [
  {
    slug: "clarence",
    name: "Clarence the Tractor",
    kind: "Tractor",
    tagline: "A slide show of one very good tractor.",
    description:
      "Photos of Clarence the Tractor -- From being in pieces to a family tractor",
    slides: clarenceSlides,
  },
];

export function findVehicle(slug) {
  return vehicles.find((vehicle) => vehicle.slug === slug);
}

export default vehicles;
