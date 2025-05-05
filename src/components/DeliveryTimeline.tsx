import { formatDate } from "@/lib/utils";

interface TimelineItem {
  id: number;
  status: string;
  location: string;
  timestamp: string;
  notes?: string;
}

interface DeliveryTimelineProps {
  history: TimelineItem[];
}

const DeliveryTimeline = ({ history }: DeliveryTimelineProps) => {
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return (
          <div className="h-8 w-8 rounded-full bg-amber-100 border-4 border-amber-200 flex items-center justify-center">
            <span className="text-amber-800 text-xs">⌛</span>
          </div>
        );
      case 'accepted':
        return (
          <div className="h-8 w-8 rounded-full bg-blue-100 border-4 border-blue-200 flex items-center justify-center">
            <span className="text-blue-800 text-xs">✓</span>
          </div>
        );
      case 'picked_up':
      case 'picked up':
        return (
          <div className="h-8 w-8 rounded-full bg-indigo-100 border-4 border-indigo-200 flex items-center justify-center">
            <span className="text-indigo-800 text-xs">↑</span>
          </div>
        );
      case 'in_transit':
      case 'in transit':
        return (
          <div className="h-8 w-8 rounded-full bg-purple-100 border-4 border-purple-200 flex items-center justify-center">
            <span className="text-purple-800 text-xs">🚚</span>
          </div>
        );
      case 'delivered':
        return (
          <div className="h-8 w-8 rounded-full bg-green-100 border-4 border-green-200 flex items-center justify-center">
            <span className="text-green-800 text-xs">✓✓</span>
          </div>
        );
      case 'cancelled':
        return (
          <div className="h-8 w-8 rounded-full bg-red-100 border-4 border-red-200 flex items-center justify-center">
            <span className="text-red-800 text-xs">✕</span>
          </div>
        );
      default:
        return (
          <div className="h-8 w-8 rounded-full bg-gray-100 border-4 border-gray-200 flex items-center justify-center">
            <span className="text-gray-800 text-xs">•</span>
          </div>
        );
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-muted-foreground">No timeline data available</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {sortedHistory.map((item, index) => (
        <div key={item.id} className="flex mb-8 last:mb-0 relative">
          <div className="flex-shrink-0 mr-4">
            {getStatusIcon(item.status)}
            {index < sortedHistory.length - 1 && (
              <div className="absolute left-4 top-8 -bottom-8 w-0 border-l-2 border-dashed border-gray-200 -translate-x-1/2"></div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
              <h3 className="font-medium">{formatStatus(item.status)}</h3>
              <span className="text-sm text-muted-foreground">{formatDate(item.timestamp, true)}</span>
            </div>
            {item.location && item.location !== 'N/A' && (
              <p className="text-sm text-muted-foreground mb-1">{item.location}</p>
            )}
            {item.notes && (
              <p className="text-sm mt-1 bg-muted p-2 rounded">{item.notes}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DeliveryTimeline;
