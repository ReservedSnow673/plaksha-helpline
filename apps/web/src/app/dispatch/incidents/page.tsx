import { IncidentsTable } from '@/components/incidents-table';

export default function IncidentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Incidents</h1>
        <p className="text-sm text-zinc-600">All incidents across all departments.</p>
      </div>
      <IncidentsTable />
    </div>
  );
}
