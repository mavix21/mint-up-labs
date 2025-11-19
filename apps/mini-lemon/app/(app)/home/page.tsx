import { EventsContainer } from "@/app/_pages/my-events/ui/events-container";

export default function Home() {
  return (
    <div className="bg-background flex min-h-screen flex-col pb-24">
      <main className="flex-1">
        <EventsContainer />
      </main>
    </div>
  );
}
