import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("user"); // "user" or "employee"
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
    if (successMessage) setSuccessMessage("");
  };

  // Unified login handler for user or employee
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("⚠️ All fields are required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const payload =
        mode === "user"
          ? { email: formData.email, password: formData.password }
          : { email: formData.email, password: formData.password }; // employee uses same format

      const response = await fetch("http://localhost:5001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Login failed");

      setSuccessMessage(data.message || "Login successful!");
      localStorage.setItem(
        mode === "user" ? "user" : "adminUser",
        JSON.stringify(data)
      );

      // Optional: navigate after login
      // navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-[#FAF6F0] px-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            FixMyCity Portal
          </h1>
          <p className="text-gray-600">
            {mode === "user"
              ? "Sign in to report and track civic issues"
              : "Sign in to manage civic reports"}
          </p>
        </div>

        {/* Toggle Buttons */}
        <div className="flex justify-center gap-4 mb-6">
          <Button
            variant={mode === "user" ? "default" : "outline"}
            onClick={() => setMode("user")}
          >
            User
          </Button>
          <Button
            variant={mode === "employee" ? "default" : "outline"}
            onClick={() => setMode("employee")}
          >
            Employee
          </Button>
        </div>

        <Card className="shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 min-h-[500px]">
            <div className="hidden md:block">
              <img
                className="w-full h-full object-cover"
                src="/admin_login_image.webp"
                alt="Login"
              />
            </div>

            <div className="p-8 flex flex-col justify-center">
              <CardHeader className="space-y-1 p-0 mb-6">
                <CardTitle className="text-2xl text-center">
                  {mode === "user" ? "Welcome User" : "Welcome Back Employee"}
                </CardTitle>
                <CardDescription className="text-center">
                  Enter your credentials to access the{" "}
                  {mode === "user" ? "user dashboard" : "admin dashboard"}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </div>

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
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                      {error}
                    </div>
                  )}

                  {/* Success */}
                  {successMessage && (
                    <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md">
                      {successMessage}
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

                {/* Register only for users */}
                {mode === "user" && (
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 mb-3">
                      New here?{" "}
                      <Button
                        variant="outline"
                        onClick={async () => {
                          if (!formData.email || !formData.password) {
                            setError("⚠️ Please fill all required fields");
                            return;
                          }
                          setLoading(true);
                          setError("");
                          setSuccessMessage("");
                          try {
                            const res = await fetch(
                              "http://localhost:5001/auth/register",
                              {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                  email: formData.email,
                                  password: formData.password,
                                }),
                              }
                            );
                            const data = await res.json();
                            if (!res.ok)
                              throw new Error(data.error || "Registration failed");
                            setSuccessMessage(data.message);
                          } catch (err) {
                            setError(err.message);
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={loading}
                      >
                        Register
                      </Button>
                    </p>
                  </div>
                )}
              </CardContent>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Login;