"use client";
"use strict";
exports.__esModule = true;
exports.Sidebar = void 0;
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var navigationItems = [
    { id: "Dashboard", label: "Dashboard", icon: lucide_react_1.BarChart3 },
    { id: "users", label: "User Management", icon: lucide_react_1.Users },
    // { id: "roles", label: "Role Management", icon: Shield },
    { id: "agents", label: "Agent Business List", icon: lucide_react_1.Headphones },
    { id: "knowledgeBase", label: " Knowledge Base", icon: lucide_react_1.Shield }
    // { id: "products", label: "Product Management", icon: Package },
    // { id: "settings", label: "Settings", icon: Settings },
];
function Sidebar(_a) {
    var activeSection = _a.activeSection, onSectionChange = _a.onSectionChange, isCollapsed = _a.isCollapsed, onToggleCollapse = _a.onToggleCollapse, onLogout = _a.onLogout;
    return (React.createElement("div", { className: "bg-white border-r border-gray-200 transition-all duration-300 " + (isCollapsed ? "w-17" : "w-64") + " flex flex-col h-screen fixed left-0 top-0 z-40" },
        React.createElement("div", { className: "p-4 border-b border-gray-200 flex items-center justify-between" },
            !isCollapsed && (React.createElement("div", { className: "flex items-center gap-2" },
                React.createElement("div", { className: "text-2xl font-bold text-black" },
                    React.createElement("img", { src: "../images/logomain1.png", alt: "", className: "w-24 h-auto" })))),
            React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: onToggleCollapse, className: "h-8 w-8" }, isCollapsed ? React.createElement(lucide_react_1.Menu, { className: "h-4 w-4" }) : React.createElement(lucide_react_1.X, { className: "h-4 w-4" }))),
        React.createElement("nav", { className: "flex-1 p-4 space-y-2" }, navigationItems.map(function (item) {
            var Icon = item.icon;
            return (React.createElement("button", { key: item.id, onClick: function () { return onSectionChange(item.id); }, className: "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors " + (activeSection === item.id
                    ? "bg-purple-100 text-purple-700 border border-purple-200"
                    : "text-gray-600 hover:bg-gray-100") },
                React.createElement(Icon, { className: "h-5 w-5 flex-shrink-0" }),
                !isCollapsed && React.createElement("span", { className: "font-medium" }, item.label)));
        })),
        React.createElement("div", { className: "p-4 border-t border-gray-200" },
            React.createElement("button", { onClick: onLogout, className: "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors" },
                React.createElement(lucide_react_1.LogOut, { className: "h-5 w-5 flex-shrink-0" }),
                !isCollapsed && React.createElement("span", { className: "font-medium" }, "Logout")))));
}
exports.Sidebar = Sidebar;
