import React from "react";
import { Megaphone } from "lucide-react";

const announcements = [
  {
    id: 1,
    title: "New Safety Protocol",
    date: "Sept 23, 2025",
    body: "All personnel must wear new high-visibility vests starting tomorrow.",
  },
  {
    id: 2,
    title: "Vehicle Maintenance Schedule",
    date: "Sept 22, 2025",
    body: "Vehicle #102 is due for maintenance. Please report to the depot.",
  },
];

function AnnouncementsPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Announcements</h1>
      <div className="space-y-4">
        {announcements.map((ann) => (
          <div key={ann.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center text-gray-500 text-sm mb-2">
              <Megaphone size={16} className="mr-2" />
              <span>{ann.date}</span>
            </div>
            <h2 className="font-bold text-lg text-gray-900">{ann.title}</h2>
            <p className="text-gray-700 mt-1">{ann.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AnnouncementsPage;
