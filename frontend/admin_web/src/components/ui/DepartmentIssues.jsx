import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import StatusDropdown from '@/components/ui/StatusDropdown';

const DepartmentIssuesComponent = () => {
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch issues from backend
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const token = localStorage.getItem("employee_token");
        if (!token) {
          console.error("No token found in localStorage");
          setLoading(false);
          return;
        }

        const response = await fetch("http://localhost:5001/issues/dept", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.status === 401) {
          console.error("Unauthorized! Token invalid or expired.");
        } else if (data.issues) {
          setIssues(data.issues);
        }
      } catch (err) {
        console.error("Error fetching department issues:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  const toggleIssueSelection = (issueId) => {
    if (selectedIssues.includes(issueId)) {
      setSelectedIssues(selectedIssues.filter(id => id !== issueId));
    } else {
      setSelectedIssues([...selectedIssues, issueId]);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short'
    });
  };

  const doneCount = issues.filter(issue => issue.status === "Resolved").length;
  const inProgressCount = issues.filter(issue => issue.status === "In Progress").length;
  const totalIssues = issues.length;

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Department Issues</h2>
          <p className="text-gray-600 text-sm">
            <span className="font-medium">{totalIssues} total</span>, proceed to resolve them
          </p>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{doneCount}</div>
            <div className="text-sm text-gray-500">Done</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{inProgressCount}</div>
            <div className="text-sm text-gray-500">In progress</div>
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 pb-3 mb-3 border-b border-gray-200">
        <div className="col-span-1"></div>
        <div className="col-span-4 text-sm font-medium text-gray-600">Issue Title</div>
        <div className="col-span-3 text-sm font-medium text-gray-600">Description</div>
        <div className="col-span-2 text-sm font-medium text-gray-600">Status</div>
        <div className="col-span-2 text-sm font-medium text-gray-600">Created At</div>
      </div>

      {/* Issues List */}
      <div className="space-y-2">
        {issues.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No issues found for your department
          </div>
        ) : (
          issues.map((issue) => (
            <div 
              key={issue.issue_id}
              className={`grid grid-cols-12 gap-4 items-center py-3 px-2 rounded-lg transition-colors ${
                selectedIssues.includes(issue.issue_id) ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              {/* Checkbox */}
              <div className="col-span-1">
                <div 
                  className={`w-5 h-5 rounded border-2 cursor-pointer flex items-center justify-center ${
                    selectedIssues.includes(issue.issue_id) 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'border-gray-300 bg-white'
                  }`}
                  onClick={() => toggleIssueSelection(issue.issue_id)}
                >
                  {selectedIssues.includes(issue.issue_id) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>

              {/* Issue Title */}
              <div className="col-span-4">
                <span className="text-gray-900 font-medium">{issue.issue_title}</span>
                <div className="text-xs text-gray-500 mt-1">{issue.department}</div>
              </div>

              {/* Description */}
              <div className="col-span-3">
                <span className="text-gray-700 text-sm line-clamp-2">
                  {issue.issue_description}
                </span>
              </div>

              {/* Status */}
              <div className="col-span-2">
                <StatusDropdown
                  issueId={issue.issue_id}
                  currentStatus={issue.status}
                  onStatusUpdated={(updatedIssue) => {
                    setIssues(prev =>
                      prev.map(i => i.issue_id === updatedIssue.issue_id ? updatedIssue : i)
                    );
                  }}
                />
              </div>

              {/* Created At */}
              <div className="col-span-2">
                <span className="px-2 py-1 rounded text-sm bg-gray-100 text-gray-700">
                  {formatDate(issue.created_at)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DepartmentIssuesComponent;