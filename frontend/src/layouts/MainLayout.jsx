import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

function MainLayout({ children }) {
  return (
    <div className="flex h-screen" style={{ backgroundColor: "#0f1923" }}>
      <Sidebar />

      <div className="ml-[220px] flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto px-8 py-7">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;