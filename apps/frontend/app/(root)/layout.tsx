import AppBar from "@/components/Appbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <AppBar />
      {children}
    </div>
  );
}
