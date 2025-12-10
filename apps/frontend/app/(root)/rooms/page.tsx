"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, Users, Gamepad2, Eye } from "lucide-react"
import Link from "next/link"
import axios from "axios"
import { BACKEND_URL } from "@/lib/config"
import { useSession } from "next-auth/react"

export default function RoomsPage() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { data, status } = useSession();

  const fetchRooms = async (pageNumber: number) => {
    setLoading(true)
    try {
      const res = await axios.get(`${BACKEND_URL}/rooms/all?page=${pageNumber}`, {
        headers : {
            Authorization : `Bearer ${data?.accessToken}`
        }
      })
      setRooms(res.data.rooms)
      setTotalPages(res.data.totalPages)
    } catch (error) {
      console.error("Error fetching rooms", error)
    }
    setLoading(false)
  }

  useEffect(() => {
    if(status === 'authenticated') {
        fetchRooms(page)
    }
  }, [status, page])

  const handlePrev = () => {
    if (page > 1) setPage(prev => prev - 1)
  }

  const handleNext = () => {
    if (page < totalPages) setPage(prev => prev + 1)
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 pt-24">
      <div className="max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-bold">Available Rooms</h1>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Card key={idx} className="bg-neutral-900 border-neutral-800 animate-pulse h-40"></Card>
            ))}
          </div>
        )}

        {!loading && rooms.length === 0 && (
          <p className="text-neutral-400 text-center mt-10">
            No rooms found.
          </p>
        )}

        {!loading && rooms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {rooms.map((room: any) => (
              <Card 
                key={room.id} 
                className="bg-neutral-900 border-neutral-800 hover:border-blue-600 transition"
              >
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5 text-blue-500" />
                    <span className="text-white">{room.name}</span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="text-neutral-400 text-sm">
                    Room Code: <span className="text-neutral-200">{room.roomCode}</span>
                  </div>

                  <div className="flex items-center gap-2 text-neutral-400 text-sm">
                    <Users className="h-4 w-4" />
                    Players: 
                    <span className="text-neutral-200 ml-1">
                      {room.player2Id ? "2/2" : "1/2"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-neutral-400 text-sm">
                    <Eye className="h-4 w-4" />
                    Max Spectators:
                    <span className="text-neutral-200 ml-1">{room.maxSpectators}</span>
                  </div>

                  {room.isPrivate && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <Lock className="h-4 w-4" />
                      Private Room
                    </div>
                  )}

                  <Link href={`/rooms/${room.id}`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Join Room
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mb-20">
            <Button 
              variant="outline"
              className="border-neutral-700 text-white"
              onClick={handlePrev}
              disabled={page === 1}
            >
              Prev
            </Button>

            <span className="text-neutral-400">
              Page <span className="text-white">{page}</span> of {totalPages}
            </span>

            <Button
              variant="outline"
              className="border-neutral-700 text-white"
              onClick={handleNext}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
