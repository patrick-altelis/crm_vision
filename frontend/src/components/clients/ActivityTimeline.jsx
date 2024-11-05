import React from 'react';
import { Calendar, Clock } from 'lucide-react';

export function ActivityTimeline({ activities = [] }) {
  if (!activities.length) {
    return (
      <div className="text-gray-500 text-center py-8">
        Aucune activité enregistrée
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {activities.map((activity, index) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {index < activities.length - 1 && (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center ring-8 ring-white">
                    <Calendar className="h-5 w-5 text-blue-500" />
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-800">
                      {activity.description}
                    </p>
                    {activity.note && (
                      <p className="mt-1 text-sm text-gray-600">
                        {activity.note}
                      </p>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <time dateTime={activity.date}>
                        {new Date(activity.date).toLocaleDateString()}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ActivityTimeline;
