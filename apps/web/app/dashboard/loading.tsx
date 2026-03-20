export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="skeleton h-7 w-32 rounded-md" />
        <div className="skeleton h-4 w-56 rounded" />
      </div>
      <div className="skeleton h-48 w-full rounded-xl" />
      <div className="skeleton h-32 w-full rounded-xl" />
    </div>
  );
}
