import "../App.css";

// Put your real address here when you're ready for it to be public.
const EMAIL = "flamingcoder05@gmail.com";

export default function Contact() {
  return (
    <div className="page page-text">
      <h1>Contact</h1>
      <p>
        Questions about a machine, or a photo you'd like added? Get in touch.
      </p>
      <p>
        <a className="text-link" href={`mailto:${EMAIL}`}>
          {EMAIL}
        </a>
      </p>
    </div>
  );
}
