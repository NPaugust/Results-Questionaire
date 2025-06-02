"use client";

import Sidebar from "../../Sidebar";

interface SidebarOverlayProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const SidebarOverlay: React.FC<SidebarOverlayProps> = ({
  isSidebarOpen,
  toggleSidebar,
}) => {
  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={toggleSidebar}
        />
      )}
      <div
        style={{ zIndex: "70" }}
        className={`SideBarWindow fixed top-0 left-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onClose={toggleSidebar} />
      </div>
    </>
  );
};

export default SidebarOverlay;