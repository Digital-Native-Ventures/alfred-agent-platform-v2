export default function ChartGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="font-medium mb-2">Usage Chart</h3>
        <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
          Chart Placeholder
        </div>
      </div>
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="font-medium mb-2">Performance Chart</h3>
        <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
          Chart Placeholder
        </div>
      </div>
    </div>
  );
}