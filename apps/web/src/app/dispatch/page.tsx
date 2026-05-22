import { LiveBoard } from '@/components/live-board';

export default function DispatchPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Live board</h1>
        <p className="text-sm text-zinc-600">
          Real-time view of active incidents, responder positions, and escalation state.
        </p>
      </div>
      <LiveBoard />
    </div>
  );
}
