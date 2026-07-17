"use client"
import Link from "next/link"
import { Calendar, Home, Building, Search, UserPlus2, User, FileText, BarChart3, Building2, LogOut, Menu, X, MenuIcon, Receipt, Recycle, Activity, ClipboardList } from "lucide-react"
import { useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useQueryClient } from "@tanstack/react-query";

import {
 
 
  FolderOpen,
 ActivityIcon,
  Wrench,
} from "lucide-react"

const navigationItems = [
  { title: "Dashboard", url: "/pages/resident/home", icon: Home },
  { title: "Profile", url: "/pages/resident/profile", icon: User },
  { title: "My Documents", url: "/pages/resident/myDocuments", icon: FolderOpen },
  { title: "Request Document", url: "/pages/resident/documentRequest", icon: FileText },
  { title: "Resident Skills", url: "/pages/resident/residentSkills", icon: Wrench },
    { title: "Activity", url: "/pages/resident/activity", icon: ActivityIcon },
]

const accountItems = [
  { title: "Logout", url: "/", icon: LogOut }
]

interface AppSidebarProps {
  className?: string
}

export function SidebarResident({ className }: AppSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)
  const closeMobileMenu = () => setIsMobileMenuOpen(false)
  const queryClient = useQueryClient();

  const logoutHandler = async () => {
    queryClient.clear();
    localStorage.clear();
    sessionStorage.clear();
  };

  return (
    <>
      {/* ── Mobile Navbar ── */}
      <div className="lg:hidden bg-sky-600 text-white p-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50 border-b border-emerald-500">
        <div className="flex items-center gap-3">
          <div className="aspect-square size-8 overflow-hidden">
            <img src="/assets/logo.jpg" alt="Logo" className="object-cover w-full h-full" />
          </div>
          <div className="flex flex-col">
            <span
              className="text-emerald-300 font-light tracking-[0.1em] uppercase text-sm"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              RRLU
            </span>
            <span className="text-[10px] text-sky-100 tracking-[0.2em] uppercase">resident</span>
          </div>
        </div>
        <button
          onClick={toggleMobileMenu}
          className="p-2 border border-sky-400 bg-sky-700 text-white hover:text-emerald-300 hover:border-emerald-400 transition-all duration-200"
        >
          {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* ── Mobile Sidebar Drawer ── */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm"
          onClick={closeMobileMenu}
        >
          <div
            className="fixed top-0 left-0 w-64 h-full bg-sky-50 border-r border-sky-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient glow */}
            <div className="pointer-events-none absolute top-0 left-0 w-full h-40 bg-emerald-400 opacity-20 blur-[60px]" />

            {/* Green top corner */}
            <div className="absolute top-0 right-0 w-10 h-10 border-t border-r border-emerald-500 opacity-40" />

            <div className="pt-20 px-4 relative">
              {/* Nav section */}
              <div className="mb-6">
                <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-700 mb-3 flex items-center gap-2">
                  <span className="h-px w-4 bg-emerald-600" />
                  Section
                </p>
                <nav className="space-y-1">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.title}
                      href={item.url}
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 px-3 py-2.5 text-sky-950 hover:text-white bg-white hover:bg-emerald-600 border border-sky-100 hover:border-emerald-500 transition-all duration-200 group"
                    >
                      <item.icon size={16} className="text-emerald-600 group-hover:text-white transition-colors duration-200" />
                      <span className="text-sm tracking-[0.06em] font-light">{item.title}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Logout */}
              <div className="absolute bottom-6 left-4 right-4 border-t border-sky-200 pt-4">
                {accountItems.map((item) => (
                  <Link
                    key={item.title}
                    href={item.url}
                    onClick={() => {
                      closeMobileMenu();
                      logoutHandler();
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 text-slate-700 hover:text-white bg-white hover:bg-red-600 border border-sky-100 hover:border-red-500 transition-all duration-200 group"
                  >
                    <item.icon size={16} className="text-red-500 group-hover:text-white transition-colors duration-200" />
                    <span className="text-sm tracking-[0.06em] font-light">{item.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop Sidebar ── */}
      <Sidebar className={`hidden lg:flex bg-sky-600 border-r border-sky-500 ${className}`}>

        {/* Header */}
        <SidebarHeader className="bg-sky-700 border-b border-sky-500 px-4 py-4 relative">
          {/* Ambient glow */}
          <div className="pointer-events-none absolute top-0 left-0 w-full h-20 bg-emerald-400 opacity-20 blur-[40px]" />
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="hover:bg-sky-800 rounded-none border border-transparent hover:border-sky-500 transition-all duration-200">
                <a href="/">
                  <div className="aspect-square size-8 overflow-hidden border border-sky-400 bg-white">
                    <img src="/assets/logo.jpg" alt="Logo" className="object-cover w-full h-full" />
                  </div>
                  <div className="grid flex-1 text-left leading-tight">
                    <span
                      className="truncate text-emerald-300 font-light tracking-[0.1em] uppercase text-sm"
                      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                    >
                      RRLU
                    </span>
                    <span className="truncate text-[10px] text-sky-100 tracking-[0.2em] uppercase">
                      resident
                    </span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* Navigation */}
        <SidebarContent className="bg-sky-50">
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.28em] text-emerald-700 px-4 py-3 flex items-center gap-2">
              <span className="h-px w-4 bg-emerald-600" />
              Section
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      /* CHANGED: Swapped group/group-hover flags out for direct hover:[&_svg]:text-white configuration */
                      className="text-sky-900 hover:text-white hover:bg-emerald-600 rounded-none border border-sky-100 hover:border-emerald-500 mx-2 transition-all duration-200 [&_svg]:text-emerald-600 hover:[&_svg]:text-white [&_svg]:transition-colors [&_svg]:duration-200"
                    >
                      <Link href={item.url} className="tracking-[0.04em] font-light text-sm">
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter className="bg-sky-100 border-t border-sky-200">
          <SidebarMenu>
            {accountItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  onClick={logoutHandler}
                  /* CHANGED: Fixed identical issue here for logout button styling */
                  className="text-slate-700 hover:text-white bg-white hover:bg-red-600 rounded-none border border-sky-100 hover:border-red-500 mx-2 transition-all duration-200 [&_svg]:transition-colors [&_svg]:duration-200 hover:[&_svg]:text-white [&_svg]:text-red-500"
                >
                  <Link href={item.url} className="tracking-[0.04em] font-light text-sm">
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>
    </>
  )
}