export default function ActivityTimeline() {
  return (
    <div className="bg-white p-4 rounded-lg border">
      <h3 className="font-medium mb-4">Recent Activity</h3>
      <div className="space-y-3">
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
          <div>
            <p className="text-sm">Agent deployment completed</p>
            <p className="text-xs text-gray-500">2 minutes ago</p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
          <div>
            <p className="text-sm">System health check passed</p>
            <p className="text-xs text-gray-500">5 minutes ago</p>
          </div>
        </div>
      </div>
    </div>
  );
}