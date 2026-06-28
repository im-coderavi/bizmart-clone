import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import { uniqueSlug } from "./utils/helpers.js";
import { richDescription, richShort } from "./utils/productCopy.js";

import User from "./models/User.js";
import Category from "./models/Category.js";
import Product from "./models/Product.js";
import Plan from "./models/Plan.js";
import Blog from "./models/Blog.js";

const IMG = "https://app.blizmatt.com/wp-content/uploads";

// (title, type, category, image)
const RAW_PRODUCTS = [
  ["Elementor Pro Plugin Latest Version for WordPress (Pro Elements)", "Plugin", "wordpress-plugins", `${IMG}/2025/03/Untitled-design-300x153.jpg.webp`],
  ["Astra Pro Theme for WordPress (#1 Best Selling Theme)", "Theme", "wordpress-themes", `${IMG}/2025/03/Astra-Pro-Addon-Real-GPL.jpg-300x153.webp`],
  ["Rank Math Pro (#1 SEO Plugin for WordPress)", "Plugin", "wordpress-plugins", `${IMG}/2025/03/Rank-Math-Pro-Plugin-Free-Download-300x153.webp`],
  ["XStore - Multipurpose WooCommerce Theme by 8theme", "Theme", "wordpress-themes", `${IMG}/2025/03/01-XStore-preview.__large_preview-300x153.webp`],
  ["Unlimited Elements for Elementor - WordPress Plugin", "Plugin", "wordpress-plugins", `${IMG}/2025/06/preview-1-300x153.jpg.webp`],
  ["Yoast SEO Premium (#Most Popular SEO Plugin for WordPress)", "Plugin", "wordpress-plugins", `${IMG}/2025/03/yoast_seo_homepage_og_image-e1758289104604-300x153.webp`],
  ["WoodMart - Multipurpose WooCommerce WordPress Theme", "Theme", "wordpress-themes", `${IMG}/2025/03/01_theme-preview.__large_preview-300x153.jpg.webp`],
  ["ElementsKit Pro Plugin (Elementor Addon) Download", "Plugin", "wordpress-plugins", `${IMG}/2025/03/4.-Introduction-Elementskit-300x150.png.webp`],
  ["WP Rocket Premium Plugin for WordPress", "Plugin", "wordpress-plugins", `${IMG}/2025/03/08b63700-a191-11e9-9b08-6e98986a4643-e1758029859348-300x153.png.webp`],
  ["WhatsApp Chat Pro Plugin For WordPress", "Plugin", "wordpress-plugins", `${IMG}/2025/04/WhatsApp-Chat-for-WordPress-WooCommerce-300x153.jpg.webp`],
  ["Newspaper Theme (#1 News and WooCommerce Theme by TagDiv)", "Theme", "wordpress-themes", `${IMG}/2025/03/01.__large_preview-300x153.png.webp`],
  ["WPforms Premium Plugin (#1 WordPress Form Builder Plugin)", "Plugin", "wordpress-plugins", `${IMG}/2025/08/wpforms_review-e1754585840420-300x153.png.webp`],
  ["GeneratePress Premium WordPress Theme (GP Premium)", "Theme", "wordpress-themes", `${IMG}/2025/03/GP-Home-e1757947846917-300x153.jpg.webp`],
  ["Slider Revolution Premium WordPress Plugin Download", "Plugin", "wordpress-plugins", `${IMG}/2025/03/Slider-Revolution-Plugin-Free-Download-300x153.webp`],
  ["Ultimate Member - #1 User Profile & Membership Plugin WordPress", "Plugin", "wordpress-plugins", `${IMG}/2025/03/ImagePreview2025-300x153.jpg.webp`],
  ["Dynamic Content for Elementor (Advanced Elementor Addon Plugin)", "Plugin", "wordpress-plugins", `${IMG}/2025/07/DCE_banner-300x153.webp`],
  ["Updraftplus Premium (#1 Backup WordPress Plugin)", "Plugin", "wordpress-plugins", `${IMG}/2025/06/updraftplus-premium-wp-nulled-pro-300x153.webp`],
  ["Zynex - Digital Marketing Agency Elementor Template Kit", "Template", "templates", `${IMG}/2025/06/Untitled-design-3-1-300x153.webp`],
  ["Ultimate Addons Premium Plugin for Elementor WordPress", "Plugin", "wordpress-plugins", `${IMG}/2025/03/ultimate-addons-for-elementor-300x153.webp`],
  ["Royal Elementor Addon Plugin Pro (Best Addon Plugin)", "Plugin", "wordpress-plugins", `${IMG}/2025/03/Untitled-design-7-300x153.png.webp`],
  ["Foxiz - Newspaper & Magazine WordPress Theme", "Theme", "wordpress-themes", `${IMG}/2025/03/preview.__large_preview-9-300x153.jpg.webp`],
  ["Relearn - Online Courses & E-Learning Elementor Template Kit", "Template", "templates", `${IMG}/2025/07/Relearn-Elementor-Cover-e1753121648777-300x153.jpg.webp`],
  ["Tutor LMS Pro WordPress Plugin - eLearning and Courses Plugin", "Plugin", "wordpress-plugins", `${IMG}/2025/06/Tutor-LMS-pro-300x153.png.webp`],
  ["Essential Addons Pro Plugin For Elementor WordPress", "Plugin", "wordpress-plugins", `${IMG}/2025/03/4f736023-word-image-1-1-1024x576-1-e1757923921711-300x153.webp`],
];

const CATEGORIES = [
  { name: "WordPress Themes", slug: "wordpress-themes" },
  { name: "WordPress Plugins", slug: "wordpress-plugins" },
  { name: "Shopify Themes", slug: "shopify-themes" },
  { name: "Landing Pages", slug: "landing-pages" },
  { name: "Graphics", slug: "graphics" },
  { name: "Templates", slug: "templates" },
];

const PLANS = [
  {
    name: "Lifetime Premium",
    billingType: "lifetime",
    price: 499,
    originalPrice: 3799,
    durationDays: 0,
    description: "Best value for money",
    isPopular: true,
    order: 1,
    features: [
      "Access to all premium Themes & Plugins",
      "Personal & Commercial GPL Licence",
      "Use it on Multiple Websites",
      "Unlimited Downloads",
      "Regular Future Updates for all items",
      "24x7 Dedicated Contact Support",
      "30 Days Money Back Guarantee",
      "FREE Gifts worth ₹40,000",
      "Lifetime Validity",
    ],
  },
  {
    name: "Yearly Premium",
    billingType: "yearly",
    price: 299,
    originalPrice: 1999,
    durationDays: 365,
    description: "Great for one year of access",
    order: 2,
    features: [
      "Access to all premium Themes & Plugins",
      "Use it on Multiple Websites",
      "Unlimited Downloads",
      "Regular Future Updates",
      "24x7 Support",
      "1 Year Validity",
    ],
  },
  {
    name: "Monthly Premium",
    billingType: "monthly",
    price: 99,
    originalPrice: 499,
    durationDays: 30,
    description: "Try it out for a month",
    order: 3,
    features: [
      "Access to all premium Themes & Plugins",
      "Unlimited Downloads",
      "Future Updates",
      "Email Support",
      "30 Days Validity",
    ],
  },
];

const BLOGS = [
  {
    title: "Top 10 WordPress Plugins Every Website Needs in 2025",
    category: "WordPress",
    tags: ["wordpress", "plugins", "guide"],
    excerpt: "From SEO to security, these essential plugins will supercharge your WordPress site.",
    coverImage: `${IMG}/2025/03/Rank-Math-Pro-Plugin-Free-Download-300x153.webp`,
    content:
      "<p>Choosing the right plugins is key to a fast, secure and high-converting WordPress website. In this guide we cover the must-have plugins across SEO, performance, security, forms and more.</p><h3>1. Rank Math Pro</h3><p>The most powerful SEO plugin available today.</p><h3>2. WP Rocket</h3><p>Instantly speed up your site with smart caching.</p>",
  },
  {
    title: "How GPL Licensing Works for Themes and Plugins",
    category: "Guides",
    tags: ["gpl", "licensing"],
    excerpt: "Understand what the GPL license means and how you can legally use premium products.",
    coverImage: `${IMG}/2025/03/Astra-Pro-Addon-Real-GPL.jpg-300x153.webp`,
    content:
      "<p>The GNU General Public License (GPL) is what makes WordPress and its ecosystem so flexible. Here's what you need to know about using GPL products.</p>",
  },
  {
    title: "Build a Membership Site with Tutor LMS",
    category: "Tutorials",
    tags: ["lms", "courses", "tutorial"],
    excerpt: "A step-by-step walkthrough to launch your own online course platform.",
    coverImage: `${IMG}/2025/06/Tutor-LMS-pro-300x153.png.webp`,
    content:
      "<p>Tutor LMS makes it easy to create and sell online courses. Follow this tutorial to set up your first course.</p>",
  },
];

async function run() {
  await connectDB();
  console.log("🌱 Seeding database...");

  await Promise.all([
    Product.deleteMany({}),
    Category.deleteMany({}),
    Plan.deleteMany({}),
    Blog.deleteMany({}),
  ]);

  // Admin user (upsert)
  let admin = await User.findOne({ email: process.env.ADMIN_EMAIL });
  if (!admin) {
    admin = await User.create({
      name: process.env.ADMIN_NAME || "Admin",
      email: process.env.ADMIN_EMAIL || "admin@blizmatt.com",
      password: process.env.ADMIN_PASSWORD || "admin123",
      role: "admin",
    });
    console.log(`   👤 Admin created: ${admin.email} / ${process.env.ADMIN_PASSWORD || "admin123"}`);
  } else {
    admin.role = "admin";
    await admin.save();
    console.log(`   👤 Admin exists: ${admin.email}`);
  }

  // Demo member (active membership) for testing downloads
  let demo = await User.findOne({ email: "member@demo.com" });
  if (!demo) {
    demo = await User.create({
      name: "Demo Member",
      email: "member@demo.com",
      password: "demo123",
      role: "user",
    });
    console.log("   👤 Demo member created: member@demo.com / demo123");
  }

  // Categories
  const catDocs = await Category.insertMany(
    CATEGORIES.map((c, i) => ({ ...c, order: i }))
  );
  const catBySlug = Object.fromEntries(catDocs.map((c) => [c.slug, c._id]));
  console.log(`   📁 ${catDocs.length} categories`);

  // Plans
  const planDocs = await Plan.insertMany(
    await Promise.all(
      PLANS.map(async (p) => ({ ...p, slug: await uniqueSlug(Plan, p.name) }))
    )
  );
  console.log(`   💳 ${planDocs.length} plans`);

  // Give demo member the lifetime plan
  const lifetime = planDocs.find((p) => p.billingType === "lifetime");
  demo.membership = { isActive: true, plan: lifetime._id, expiresAt: null };
  await demo.save();

  // Products
  const products = [];
  for (let i = 0; i < RAW_PRODUCTS.length; i++) {
    const [name, type, catSlug, image] = RAW_PRODUCTS[i];
    products.push({
      name,
      slug: await uniqueSlug(Product, name),
      category: catBySlug[catSlug] || catDocs[1]._id,
      type,
      thumbnail: image,
      screenshots: [image],
      shortDescription: richShort(name, type),
      description: richDescription(name, type),
      features: [
        "Latest version",
        "100% Genuine GPL",
        "Unlimited downloads",
        "Free future updates",
        "Use on multiple websites",
      ],
      version: `${1 + (i % 4)}.${i % 10}.0`,
      changelog: [
        { version: `${1 + (i % 4)}.${i % 10}.0`, notes: "Latest stable release." },
      ],
      fileSize: `${5 + (i % 40)} MB`,
      downloadUrl: `https://example.com/files/${i + 1}.zip`,
      demoUrl: "https://example.com/demo",
      price: 0,
      membershipRequired: true,
      downloadsCount: Math.floor(Math.random() * 5000),
      ratingAvg: 4 + Math.round(Math.random() * 10) / 10,
      ratingCount: Math.floor(Math.random() * 400),
      isFeatured: i < 8,
      status: "published",
    });
  }
  await Product.insertMany(products);
  console.log(`   📦 ${products.length} products`);

  // Blogs
  await Blog.insertMany(
    await Promise.all(
      BLOGS.map(async (b) => ({
        ...b,
        slug: await uniqueSlug(Blog, b.title),
        author: admin._id,
        status: "published",
      }))
    )
  );
  console.log(`   📝 ${BLOGS.length} blog posts`);

  console.log("✅ Seed complete!");
  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
