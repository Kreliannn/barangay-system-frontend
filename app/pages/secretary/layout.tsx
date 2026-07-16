"use client"
import Link from "next/link";


import useUserStore from "@/app/store/useUserStore";
import { TestSideBar } from "@/components/ui/sidebar.template";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarSecretary } from "@/components/ui/sidebar_secretary";


export default function AdminLayout({ children }: { children: React.ReactNode }) {

    
    return (
      <div className="flex min-h-screen ">
          <SidebarProvider>
                
                <SidebarSecretary />
               
                <main className="w-full">
                    <div className="mb-[80px] md:mb-[0px]"> </div>
                    {children}
                </main>
          </SidebarProvider>
       
      </div>
    );
  }