import { Outlet } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import ChatButton from "./ChatButton.jsx";
import BottomNav from "./BottomNav.jsx";
import PromoBar from "./PromoBar.jsx";

export default function PublicLayout() {
  return (
    <div className="site-shell">
      <Header />
      <PromoBar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <ChatButton />
      <BottomNav />
    </div>
  );
}
