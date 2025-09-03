import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
//.
function IssuesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-8">FixMyCity - Issues</h1>

      <div className="flex flex-col gap-4 w-full max-w-md">
        <Button onClick={() => navigate("/my-issues")} className="w-full">
          My Issues
        </Button>

        <Button onClick={() => navigate("/report-issue")} className="w-full">
          Report New Issue
        </Button>

        <Button onClick={() => navigate("/my-account")} className="w-full">
          My Account
        </Button>
      </div>
    </div>
  );
}

export default IssuesPage;