import { NavLink } from "react-router-dom";
import { HomeIconSvg, WalletIconSvg, HistoryIcon, GroupIcon, BudgetIcon, GlobeIcon } from "./icons";
import "./BottomNav.css";

const items = [
  { to: "/dashboard", label: "Home", Icon: HomeIconSvg },
  { to: "/wallet", label: "Wallet", Icon: WalletIconSvg },
  { to: "/transactions", label: "History", Icon: HistoryIcon },
  { to: "/split", label: "Split", Icon: GroupIcon },
  { to: "/budget", label: "Budget", Icon: BudgetIcon },
  { to: "/currency", label: "Convert", Icon: GlobeIcon },
];

function BottomNav() {
  return (
    <nav className="bottom-nav">
      {items.map(({ to, label, Icon }) => (
        <NavLink key={to} to={to} data-cursor-hover
          className={({ isActive }) => `bottom-nav-item ${isActive ? "active" : ""}`}>
          <Icon width={20} height={20} />
          <span className="bottom-nav-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default BottomNav;