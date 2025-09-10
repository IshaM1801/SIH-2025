import React from "react";
import { Calendar, ThumbsUp, Share2, Image as ImageIcon } from "lucide-react";

const IssueCard = ({ issue, onViewDetails }) => {
  // Use a placeholder if no image is available
  const imageUrl = issue.image_url;
  console.log(issue);
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transform hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div className="relative">
        <img
          src={imageUrl}
          alt={issue.issue_title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 left-3 bg-white p-1 rounded-md shadow">
          <ImageIcon className="w-4 h-4 text-gray-600" />
        </div>
        <span className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-semibold px-3 py-1 rounded-full">
          Assigned
        </span>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-gray-800 font-semibold mb-3 leading-tight h-12">
          {issue.address_component ||
            issue.issue_title ||
            "No address provided"}
        </h3>

        <div className="flex items-center text-xs text-gray-500 mb-3">
          <Calendar className="w-4 h-4 mr-2" />
          <span>
            {new Date(issue.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <span className="mx-2">·</span>
          <span>Water</span>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;
