import Classify from "@/components/Classify";

export default function Home() {
  return (
    <main className="h-screen">
      <Classify studentGrade={4} studentTopic="Minecraft" />
    </main>
  );
}
