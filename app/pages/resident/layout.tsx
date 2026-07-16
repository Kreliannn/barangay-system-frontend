"use client"
import Link from "next/link";


import useUserStore from "@/app/store/useUserStore";
import { TestSideBar } from "@/components/ui/sidebar.template";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarResident } from "@/components/ui/sidebar_resident";
import ResidentPending from "@/components/ui/residentPending";
import ResidentRejected from "@/components/ui/residentRejected";

export default function AdminLayout({ children }: { children: React.ReactNode }) {

    const {user} = useUserStore()

    if(user?.status == "pending" ) return <ResidentPending />
    if(user?.status == "rejected" ) return <ResidentRejected />

    return (
      <div className="flex min-h-screen ">
          <SidebarProvider>
                
                <SidebarResident />
               
                <main className="w-full">
                    <div className="mb-[80px] md:mb-[0px]"> </div>
                    {children}
                </main>
          </SidebarProvider>
       
      </div>
    );
  }