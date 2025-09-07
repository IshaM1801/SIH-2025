import React, { useState } from 'react';
import { updateIssueStatus } from '../../utils/StatusChange';

const StatusDropdown = ({ issueId, currentStatus, onStatusUpdated }) => {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const handleChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus); // optimistically update UI
    setLoading(true);
    try {
      const updatedIssue = await updateIssueStatus(issueId, newStatus);
      onStatusUpdated(updatedIssue); // notify parent to update state
    } catch (err) {
      setStatus(currentStatus); // revert UI if error
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={loading}
      className="mt-1 px-2 py-1 border border-gray-300 rounded-lg text-sm"
    >
      <option value="Pending">Pending</option>
      <option value="In Progress">In Progress</option>
      <option value="Resolved">Resolved</option>
    </select>
  );
};

export default StatusDropdown;