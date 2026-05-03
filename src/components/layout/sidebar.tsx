"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, TrendingUp, Activity, BookOpen, User, Users,
  Upload, MessageSquare, LogOut, Menu, ChevronRight, UserPlus, X,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Modal } from "@/components/ui/modal";
import { signOut } from "@/actions/auth";
import type { Role } from "@/lib/types";

const studentMenu = [
  { href: "/student/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { href: "/student/grades", label: "Grade Progress", icon: <TrendingUp size={18} /> },
  { href: "/student/status", label: "Learning Status", icon: <Activity size={18} /> },
  { href: "/student/reflections", label: "Reflections", icon: <BookOpen size={18} /> },
  { href: "/student/profile", label: "My Profile", icon: <User size={18} /> },
];

const teacherMenu = [
  { href: "/teacher/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { href: "/teacher/students", label: "Student Data", icon: <Users size={18} /> },
  { href: "/teacher/add-students", label: "Add Students", icon: <UserPlus size={18} /> },
  { href: "/teacher/upload", label: "Upload Grades", icon: <Upload size={18} /> },
  { href: "/teacher/reflections", label: "Reflections", icon: <MessageSquare size={18} /> },
  { href: "/teacher/profile", label: "My Profile", icon: <User size={18} /> },
];

interface SidebarProps {
  role: Role;
  userName: string;
  userSubtitle: string;
  photoUrl: string | null;
}

export function Sidebar({ role, userName, userSubtitle, photoUrl }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Detect mobile properly using JS (more reliable than CSS breakpoints)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const items = role === "student" ? studentMenu : teacherMenu;
  const sidebarWidth = collapsed ? 64 : 230;

  const NavContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full" style={{ background: "#1a4d1f" }}>
      {/* Logo row */}
      <div className="px-3.5 py-4 flex items-center gap-2.5 border-b border-white/[0.08]">
        <Logo size={36} />
        {(!collapsed || mobile) && (
          <span className="text-white text-lg font-extrabold tracking-tight">LearnTrack</span>
        )}
        <button
          onClick={() => mobile ? setMobileOpen(false) : setCollapsed(c => !c)}
          className="ml-auto bg-transparent border-none text-white/60 cursor-pointer p-1"
        >
          {mobile ? <X size={18} /> : collapsed ? <ChevronRight size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {/* User info */}
      {(!collapsed || mobile) && (
        <div className="px-4 py-3.5 border-b border-white/[0.08] flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
            {photoUrl
              ? <img src={photoUrl} alt="" className="w-full h-full object-cover" />
              : userName.charAt(0)
            }
          </div>
          <div className="overflow-hidden">
            <div className="text-white text-[13px] font-semibold truncate">{userName}</div>
            <div className="text-emerald-300 text-[11px]">{userSubtitle}</div>
          </div>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 p-2 overflow-y-auto">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed && !mobile ? item.label : undefined}
              className={`w-full flex items-center gap-2.5 rounded-[10px] mb-0.5 no-underline transition-all duration-150 ${
                collapsed && !mobile ? "px-3.5 py-2.5 justify-center" : "px-3 py-2.5"
              } ${active ? "bg-white/15 text-white font-semibold" : "text-white/65 hover:bg-white/10"}`}
            >
              <span className={`shrink-0 flex items-center ${active ? "text-emerald-300" : "text-white/55"}`}>
                {item.icon}
              </span>
              {(!collapsed || mobile) && <span className="text-[13px]">{item.label}</span>}
              {(!collapsed || mobile) && active && <ChevronRight size={13} className="ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-white/[0.08]">
        <button
          onClick={() => setShowLogout(true)}
          title={collapsed && !mobile ? "Logout" : undefined}
          className={`w-full flex items-center gap-2.5 rounded-[10px] bg-transparent border-none cursor-pointer text-white/55 text-[13px] px-3 py-2.5 hover:bg-white/10 transition-all ${
            collapsed && !mobile ? "justify-center" : ""
          }`}
        >
          <LogOut size={18} className="shrink-0" />
          {(!collapsed || mobile) && "Logout"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── DESKTOP sidebar ── */}
      {!isMobile && (
        <>
          <div
            className="fixed left-0 top-0 z-50 flex flex-col transition-all duration-300" style={{ width: sidebarWidth, height: "100vh" }}
          >
            <NavContent />
          </div>
          {/* Spacer so content doesn't go under sidebar */}
          <div className="shrink-0 transition-all duration-300" style={{ width: sidebarWidth }} />
        </>
      )}

      {/* ── MOBILE top bar ── */}
      {isMobile && (
        <>
          <div
            className="fixed top-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3 border-b border-white/10"
            style={{ background: "#1a4d1f" }}
          >
            <button
              onClick={() => setMobileOpen(true)}
              className="bg-transparent border-none text-white cursor-pointer p-1 flex items-center"
            >
              <Menu size={22} />
            </button>
            <Logo size={28} />
            <span className="text-white text-base font-extrabold tracking-tight">LearnTrack</span>
          </div>
          {/* Spacer for top bar height */}
          <div className="h-[52px] shrink-0" />
        </>
      )}

      {/* ── MOBILE drawer ── */}
      {isMobile && mobileOpen && (
        <div className="fixed inset-0 z-[100] flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer panel */}
          <div className="relative z-10 w-[260px] max-w-[80vw] h-full flex flex-col shadow-2xl">
            <NavContent mobile />
          </div>
        </div>
      )}

      {/* Logout modal */}
      <Modal open={showLogout} onClose={() => setShowLogout(false)}>
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <LogOut size={26} className="text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Sign Out</h3>
        <p className="text-gray-500 text-sm leading-relaxed mb-7">
          Are you sure you want to sign out of your LearnTrack account?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowLogout(false)}
            className="flex-1 py-2.5 rounded-[10px] border-[1.5px] border-emerald-200 bg-white text-gray-500 text-sm font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <form action={signOut} className="flex-1">
            <button
              type="submit"
              className="w-full py-2.5 rounded-[10px] border-none bg-red-400 text-white text-sm font-semibold cursor-pointer hover:bg-red-500"
            >
              Sign Out
            </button>
          </form>
        </div>
      </Modal>
    </>
  );
}
