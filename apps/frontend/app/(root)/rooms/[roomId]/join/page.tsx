import JoinRoomLobbyComponent from "@/components/JoinRoomLobbyComponent";

export default async function JoinRoomLobby({
  params,
}: {
  params: Promise<{
    roomId: string;
  }>;
}) {
    const roomId = (await params).roomId
  return <JoinRoomLobbyComponent roomId={roomId} />
}
