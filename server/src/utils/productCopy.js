// Generates richer, professional product copy from name + type.
// Used by the seeder and the one-time "enrich descriptions" script so
// every product gets a proper multi-paragraph description.

const TYPE_LINE = {
  Theme:
    "a lightweight, fast and highly customizable WordPress theme, perfect for blogs, businesses, eCommerce and portfolio websites",
  Plugin:
    "a powerful, well-coded WordPress plugin built to extend your site with professional features while staying fast and reliable",
  Template:
    "a beautifully designed, ready-to-import template kit that helps you launch a stunning website in minutes",
  Course:
    "a complete, structured course that takes you step-by-step from the basics to advanced, real-world skills",
  Graphic:
    "a premium, pixel-perfect graphic resource crafted to make your brand and projects stand out",
  Other:
    "a premium digital product crafted for performance, flexibility and a polished end-user experience",
};

const TYPE_MIDDLE = {
  Theme:
    "You get custom headers, footers, typography, colors and spacing controls, pre-built starter sites, and seamless integration with Elementor, Gutenberg, WooCommerce and other popular page builders.",
  Plugin:
    "It is easy to set up, fully documented, and integrates seamlessly with Elementor, WooCommerce and the rest of your favourite tools — so you can add advanced functionality without touching a single line of code.",
  Template:
    "Every page and section is fully editable in Elementor, so you can simply import the kit, swap in your own content, and go live with a professional design that looks great on every device.",
  Course:
    "Each module is packed with practical lessons, downloadable resources and real examples, so you can learn at your own pace and apply what you learn immediately.",
  Graphic:
    "All files are fully layered and easy to edit, so you can customize colors, text and layouts to match your brand in just a few clicks.",
  Other:
    "It is built with clean, modern standards and is easy to customize, so it fits right into your existing workflow.",
};

export function richShort(name, type) {
  const t = (type || "product").toLowerCase();
  return `${name} — a premium ${t} with modern design, powerful options and lifetime updates, included free with your membership.`;
}

export function richDescription(name, type) {
  const t = type || "Other";
  const lead = TYPE_LINE[t] || TYPE_LINE.Other;
  const middle = TYPE_MIDDLE[t] || TYPE_MIDDLE.Other;
  return [
    `<p><strong>${name}</strong> is ${lead}. It is trusted by thousands of creators, agencies and businesses worldwide, and is optimized for speed, SEO and a smooth experience on every screen size.</p>`,
    `<p>${middle} The modular structure lets you enable only the features you need, keeping your site lightweight, secure and efficient.</p>`,
    `<p>This is the <strong>100% genuine GPL</strong> version with the latest updates, included free with your membership. Download it unlimited times, use it on as many websites as you want, and always stay up to date with future releases — all backed by our 30-day money-back guarantee.</p>`,
  ].join("\n");
}
