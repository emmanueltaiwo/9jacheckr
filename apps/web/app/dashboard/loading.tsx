export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-8 pt-2">
      <div className="space-y-2">
        <div className="skeleton h-8 w-40 rounded-lg" />
        <div className="skeleton h-4 w-full max-w-sm rounded-md" />
      </div>
      <div className="skeleton h-36 rounded-2xl" />
      <div className="skeleton h-48 rounded-2xl" />
    </div>
  );
}
