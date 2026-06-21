import { useState } from "react";

export default function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <div className="page-wrap contact-page">
      <div className="page-head center">
        <h1>Contact Us</h1>
        <p>Questions about membership or products? We're here to help.</p>
      </div>

      <div className="contact-layout">
        <div className="contact-info">
          <h3>Get in touch</h3>
          <p>📞 +91 92342 20213</p>
          <p>📞 +91 99735 96593</p>
          <p>✉️ admin@blizmatt.com</p>
          <p>✉️ info@blizmatt.com</p>
          <p>📍 N Road Bistupur, Jamshedpur, Jharkhand - 831001</p>
          <a className="btn-outline" href="https://wa.me/919234220213" target="_blank" rel="noreferrer">
            Chat on WhatsApp
          </a>
        </div>

        <form
          className="contact-form"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          {sent && <div className="info-banner success">Thanks! We'll get back to you soon.</div>}
          <label>
            Name
            <input required />
          </label>
          <label>
            Email
            <input type="email" required />
          </label>
          <label>
            Message
            <textarea rows={5} required />
          </label>
          <button className="btn-primary full">Send Message</button>
        </form>
      </div>
    </div>
  );
}
