"use client";
import {
  BarChart3,
  Users,
  Shield,
  Package,
  Settings,
  LogOut,
  Menu,
  X,
  Headphones,
  Tickets,
  HelpCircleIcon,
  BadgeHelp,
  BellRing,

  GitPullRequest,
Presentation ,
  TvMinimalPlay 

} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onLogout?: () => void;
}

const navigationItems = [
  { id: "Dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "Sales", label: "Sales", icon: BarChart3 },
  { id: "users", label: "User Management", icon: Users },
  // { id: "roles", label: "Role Management", icon: Shield },
  { id: "agents", label: "Agent Business List", icon: Headphones },

  { id: "PricingEnquiry", label: "Pricing Enquiry", icon: HelpCircleIcon },
  { id: "ContactUs", label: "Contact Us Queries", icon: BadgeHelp },
  { id: "HelpUs", label: "Help Us Queries", icon: BadgeHelp },
  { id: "RaiseComment", label: "Partner Requests", icon: GitPullRequest },
  { id: "RaiseTickets", label: "Raised Tickets", icon: Tickets },
  { id: "knowledgeBase", label: " Knowledge Base", icon: Shield },
  { id: "Notifications", label: "Admin Notifications", icon: BellRing },
  { id: "PartnerResources", label: "Partner Resources", icon: TvMinimalPlay },
  { id: "Demo", label: "Demo", icon: Presentation  },

  // { id: "products", label: "Product Management", icon: Package },
  // { id: "settings", label: "Settings", icon: Settings },
];

export function Sidebar({
  activeSection,
  onSectionChange,
  isCollapsed,
  onToggleCollapse,
  onLogout, 
}: SidebarProps) {

useEffect(() => {
    // Only run on mount to set initial state based on screen size
    const handleInitialResize = () => {
      if (window.innerWidth <= 768 && !isCollapsed) {
        onToggleCollapse();
      } else if (window.innerWidth > 768 && isCollapsed) {
        onToggleCollapse();
      }
    };

    handleInitialResize(); // Run on mount only

    // No resize event listener needed to override user choice
  }, [])
  return (
    <div
      className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        isCollapsed ? "w-17" : "w-64"
      } flex flex-col h-screen fixed left-0 top-0 z-40`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-black">
              <img
                src="../images/logomain1.png"
                alt=""
                className="w-24 h-auto"
              />
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-8 w-8"
        >
          {isCollapsed ? (
            <Menu className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeSection === item.id
                  ? "bg-purple-100 text-purple-700 border border-purple-200"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}
