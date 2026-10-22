import BottomNav from "./BottomNav";

function AppShell({ children }) {
  return (
    <div style={{ minHeight: "100vh", paddingBottom: "76px", background: "var(--color-bg)" }}>
      {children}
      <BottomNav />
    </div>
  );
}

export default AppShell;