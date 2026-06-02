"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BrainCircuit,
  Briefcase,
  Home,
  LayoutDashboard,
  Menu,
  Search,
  BarChart2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/predict", label: "Analyze", icon: BrainCircuit },
  { href: "/search", label: "Search", icon: Search },
  { href: "/insights", label: "Insights", icon: BarChart2 },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

function Brand() {
  return (
    <Link href="/" className="group flex min-w-0 items-center gap-2.5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg overflow-hidden">
        <Image src="/logo.png" alt="JobSeeker AI Logo" width={32} height={32} className="object-cover" />
      </div>
      <span className="truncate text-sm font-semibold tracking-tight text-foreground sm:text-base">
        JobSeeker<span className="text-[var(--sb-indigo)]"> AI</span>
      </span>
    </Link>
  );
}

function DesktopNav({ pathname }: { pathname: string }) {
  return (
    <div className="hidden items-center gap-1 md:flex">
      {NAV_LINKS.map(({ href, label, icon: Icon }) => {
        const active = isActivePath(pathname, href);

        return (
          <Button
            key={href}
            variant="ghost"
            size="xs"
            asChild
            className={cn(
              "gap-1.5 rounded-md font-medium normal-case tracking-normal",
              active
                ? "bg-[var(--sb-indigo-dim)] text-[var(--sb-indigo)]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Link href={href}>
              <Icon size={13} strokeWidth={2} />
              {label}
            </Link>
          </Button>
        );
      })}
    </div>
  );
}

function SidebarNav({ pathname }: { pathname: string }) {
  return (
    <div className="flex flex-col gap-2 px-4">
      {NAV_LINKS.map(({ href, label, icon: Icon }) => {
        const active = isActivePath(pathname, href);

        return (
          <SheetClose key={href} asChild>
            <Link
              href={href}
              className={cn(
                "flex min-h-12 items-center gap-3 rounded-xl border px-4 text-sm font-semibold transition-colors",
                active
                  ? "border-[var(--sb-indigo-glow)] bg-[var(--sb-indigo-dim)] text-[var(--sb-indigo)]"
                  : "border-[var(--sb-hairline)] bg-[var(--sb-surface-1)] text-muted-foreground hover:border-[var(--sb-hairline-strong)] hover:text-foreground"
              )}
            >
              <Icon size={17} strokeWidth={2} />
              <span>{label}</span>
            </Link>
          </SheetClose>
        );
      })}
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 h-14 border-b border-[var(--sb-hairline)]"
      style={{
        background: "rgba(2, 4, 10, 0.86)",
        backdropFilter: "blur(12px)",
      }}
    >
      <nav className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Brand />

        <DesktopNav pathname={pathname} />

        <div className="hidden items-center gap-3 md:flex">
          <Badge
            variant="secondary"
            className="rounded-full border px-2 py-0.5 font-mono normal-case tracking-normal"
            style={{
              background: "var(--sb-emerald-dim)",
              color: "var(--sb-emerald)",
              borderColor: "rgba(16,185,129,0.2)",
            }}
          >
            BETA
          </Badge>
          <Button
            size="xs"
            asChild
            className="rounded-md font-semibold normal-case tracking-normal"
            style={{ background: "var(--sb-indigo)", color: "#fff" }}
          >
            <Link href="/predict">Get Started</Link>
          </Button>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon-sm"
              className="rounded-lg md:hidden"
              aria-label="Open navigation menu"
            >
              <Menu size={18} />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[86vw] max-w-[360px] border-[var(--sb-hairline)] bg-[var(--sb-canvas)] p-0"
          >
            <SheetHeader className="p-5 pb-4">
              <div className="mb-4">
                <Brand />
              </div>
              <SheetTitle className="normal-case tracking-normal">
                Navigasi
              </SheetTitle>
              <SheetDescription>
                Akses halaman utama JobSeeker AI dari satu panel.
              </SheetDescription>
            </SheetHeader>

            <Separator />
            <SidebarNav pathname={pathname} />

            <SheetFooter className="gap-3 p-4">
              <div className="rounded-xl border border-[var(--sb-hairline)] bg-[var(--sb-surface-1)] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Status
                  </span>
                  <Badge
                    className="rounded-full border px-2 py-0.5 font-mono normal-case tracking-normal"
                    style={{
                      background: "var(--sb-emerald-dim)",
                      color: "var(--sb-emerald)",
                      borderColor: "rgba(16,185,129,0.2)",
                    }}
                  >
                    BETA
                  </Badge>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  Platform career advisor berbasis AI untuk pencocokan kerja,
                  pencarian semantik, dan analisis skill.
                </p>
              </div>
              <SheetClose asChild>
                <Button
                  asChild
                  className="h-11 rounded-lg font-semibold normal-case tracking-normal"
                  style={{ background: "var(--sb-indigo)", color: "#fff" }}
                >
                  <Link href="/predict">Get Started</Link>
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
