import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0B0F19] text-white">
      <nav className="flex items-center justify-between px-6 md:px-12 py-6 border-b border-slate-700/60 bg-[#0E121F]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">
            X
          </div>
          <span className="text-xl font-bold">TacticBoard</span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/signin">
            <Button
              variant="ghost"
              className="text-slate-300 hover:text-white hover:bg-slate-800/40"
            >
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Sign Up
            </Button>
          </Link>
        </div>
      </nav>

      <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 inline-block px-4 py-2 bg-slate-800/60 rounded-full border border-slate-700/60">
            <span className="text-sm text-blue-400">
              Multiplayer Gaming Platform
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
            Challenge Your Friends in Real-Time
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
            Play tactical tic tac toe in instant multiplayer rooms. Create a
            room, invite friends, and compete in thrilling head-to-head matches.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              >
                Get Started Free
              </Button>
            </Link>

            <Button
              size="lg"
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-900 px-8 bg-transparent"
            >
              Watch Demo
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="p-6 bg-slate-800/40 rounded-lg border border-slate-700">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold text-lg mb-2 text-white">
                Instant Rooms
              </h3>
              <p className="text-sm text-slate-400">
                Create and join games in seconds
              </p>
            </div>

            <div className="p-6 bg-slate-800/40 rounded-lg border border-slate-700">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="font-semibold text-lg mb-2 text-white">
                Spectate
              </h3>
              <p className="text-sm text-slate-400">
                Watch friends battle in real-time
              </p>
            </div>

            <div className="p-6 bg-slate-800/40 rounded-lg border border-slate-700">
              <div className="text-3xl mb-3">🏆</div>
              <h3 className="font-semibold text-lg mb-2 text-white">
                Rankings
              </h3>
              <p className="text-sm text-slate-400">Climb the leaderboards</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 md:px-12 border-t border-slate-800 bg-[#0E121F]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-blue-400 mb-2">50K+</div>
            <p className="text-slate-400">Active Players</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-400 mb-2">1M+</div>
            <p className="text-slate-400">Games Played</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-400 mb-2">99%</div>
            <p className="text-slate-400">Uptime</p>
          </div>
        </div>
      </section>

      <footer className="py-8 px-6 md:px-12 border-t border-slate-800 text-center text-slate-500 text-sm bg-[#0B0F19]">
        <p>TacticBoard - Play. Compete. Dominate.</p>
      </footer>
    </main>
  );
}
