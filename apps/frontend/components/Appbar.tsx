"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  LogOut,
  User,
  PlusCircle,
  Gamepad2,
  Home,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { signOut } from "next-auth/react";

export default function AppBar({ user }: { user?: any }) {
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className="w-full bg-neutral-900 border-b border-neutral-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <Link href="/home" className="flex items-center gap-2">
        <Gamepad2 className="h-7 w-7 text-blue-500" />
        <h1 className="text-xl font-bold text-white">TicTac Arena</h1>
      </Link>

      <nav className="hidden md:flex items-center gap-6">
        <Link
          href="/home"
          className="text-neutral-300 hover:text-white transition flex items-center gap-1"
        >
          <Home className="h-4 w-4" /> Home
        </Link>

        <Link
          href="/rooms"
          className="text-neutral-300 hover:text-white transition flex items-center gap-1"
        >
          <Gamepad2 className="h-4 w-4" /> Rooms
        </Link>

        <Link
          href="/create-room"
          className="text-neutral-300 hover:text-white transition flex items-center gap-1"
        >
          <PlusCircle className="h-4 w-4" /> Create Room
        </Link>

        <Link
          href="/profile"
          className="text-neutral-300 hover:text-white transition flex items-center gap-1"
        >
          <User className="h-4 w-4" /> Profile
        </Link>

        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-neutral-700">
            <AvatarImage src={user?.avatar ?? ""} />
            <AvatarFallback className="bg-neutral-800 text-white">
              {user?.username?.charAt(0)?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>

          <Button
            size="sm"
            variant="outline"
            className="border-neutral-700 "
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-1" /> Logout
          </Button>
        </div>
      </nav>

      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="border-neutral-700 text-black">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="bg-neutral-900 border-neutral-800 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Gamepad2 className="h-6 w-6 text-blue-500" />
                <h1 className="text-xl font-bold text-white">TicTac Arena</h1>
              </div>

              <Button variant="ghost" onClick={() => setOpen(false)}>
                <X className="h-6 w-6 text-neutral-300" />
              </Button>
            </div>

            <div className="flex flex-col gap-6 text-lg">
              <Link href="/" className="text-neutral-300 hover:text-white">
                <Home className="inline-block h-4 w-4 mr-2" />
                Home
              </Link>

              <Link href="/rooms" className="text-neutral-300 hover:text-white">
                <Gamepad2 className="inline-block h-4 w-4 mr-2" />
                Rooms
              </Link>

              <Link
                href="/create-room"
                className="text-neutral-300 hover:text-white"
              >
                <PlusCircle className="inline-block h-4 w-4 mr-2" />
                Create Room
              </Link>

              <Link
                href="/profile"
                className="text-neutral-300 hover:text-white"
              >
                <User className="inline-block h-4 w-4 mr-2" />
                Profile
              </Link>

              <Button
                variant="outline"
                className="border-neutral-700 text-black mt-4"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
