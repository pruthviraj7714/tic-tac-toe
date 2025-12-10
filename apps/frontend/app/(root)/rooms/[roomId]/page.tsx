import RoomPageComponent from "@/components/RoomPageComponent";

export default async function RoomPage({
  params,
}: {
  params: Promise<{
    roomId: string;
  }>;
}) {
  const roomId = (await params).roomId;

  return (
    <>
      <RoomPageComponent roomId={roomId} />
    </>
  );
}
