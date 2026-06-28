import { Link, useLocation } from "react-router-dom";
import { ArrowIcon } from "./Icons.jsx";

export default function PromoBar() {
  const { pathname } = useLocation();

  // Don't show on auth pages
  if (/^\/(login|register|forgot-password|reset-password)/.test(pathname)) return null;

  const onMembership = pathname.startsWith("/membership");

  if (onMembership) {
    return (
      <Link className="promo-strip membership" to="/membership">
        <strong>GET PREMIUM ACCESS TO ALL THEMES &amp; PLUGINS</strong>
        <span>Lifetime Validity + Future Updates</span>
      </Link>
    );
  }

  return (
    <Link className="promo-strip" to="/membership">
      <strong>DOWNLOAD EVERYTHING AT JUST ₹499</strong>
      <span>Get Lifetime Validity</span>
      <span className="promo-cta">
        Start now <ArrowIcon />
      </span>
    </Link>
  );
}
