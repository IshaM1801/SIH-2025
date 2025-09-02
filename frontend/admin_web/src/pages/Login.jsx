import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    employeeId: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.employeeId || !formData.password) {
      setError("Both Employee ID and Password are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await login(formData.employeeId, formData.password);
      
      if (response.employee) {
        localStorage.setItem("adminUser", JSON.stringify(response.employee));
        
        // Redirect to dashboard only after successful authentication
        navigate("/dashboard");
      } else {
        setError("Authentication failed. Invalid response from server.");
      }
    } catch (err) {
      // Display the specific error message from your backend
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-[#FAF6F0] px-4">
      <div className="w-full max-w-6xl">
        {/* Project Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            FixMyCity Admin Portal
          </h1>
          <p className="text-gray-600">
            Sign in to manage civic reports and issues
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 min-h-[500px]">
            {/* Image Section - Hidden on mobile, visible on md+ screens */}
            <div className="hidden md:block">
              <img 
                className="w-full h-full object-cover" 
                src="/admin_login_image.webp" 
                alt="Admin Login" 
              />
            </div>

            {/* Form Section */}
            <div className="p-8 flex flex-col justify-center">
              <CardHeader className="space-y-1 p-0 mb-6">
                <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
                <CardDescription className="text-center">
                  Enter your credentials to access the admin dashboard
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Employee ID Field */}
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Employee ID</Label>
                    <Input
                      id="employeeId"
                      name="employeeId"
                      type="text"
                      placeholder="Enter your employee ID"
                      value={formData.employeeId}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full"
                    />
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={loading}
                      className="w-full"
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                      {error}
                    </div>
                  )}

                  {/* Login Button */}
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

                {/* Additional Links */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    Forgot your password?
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger>
                      <Button variant="outline">Contact Admin</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Please Contact Admin</AlertDialogTitle>
                        <AlertDialogDescription>
                          Ask your admin for the password associated with your employee ID.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogAction>Okay</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Login;