import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
      setError(t('login.all_fields_required'));
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        role: mode === "employee" ? "employee" : "user",
      };

      const response = await fetch("http://localhost:5001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || t('login.failed'));

      setSuccessMessage(data.message || t('login.success'));

      // Save token & user info
      if (data.type === "employee" && mode === "employee") {
        // ✅ generate custom JWT in backend
        localStorage.setItem("employee_token", data.access_token); 
        localStorage.setItem("adminUser", JSON.stringify(data.employee));
        setTimeout(() => navigate("/dashboard"), 1000);
      } else if (data.type === "user" && mode === "user") {
        // 🔑 Store Supabase user & token separately
        localStorage.setItem("token", data.access_token); // token for API requests
        localStorage.setItem("user", JSON.stringify(data.user)); // user profile
  
        setTimeout(() => navigate("/issues"), 1000);
      } else {
        setError(t('login.unknown_user_type'));
      }//.
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('app.title')} Portal</h1>
          <p className="text-gray-600">
            {mode === "user" ? t('login.subtitle_user') : t('login.subtitle_employee')}
          </p>
        </div>

        {/* Toggle Buttons */}
        <div className="flex justify-center gap-4 mb-6">
          <Button
            variant={mode === "user" ? "default" : "outline"}
            onClick={() => setMode("user")}
          >
            {t('login.user')}
          </Button>
          <Button
            variant={mode === "employee" ? "default" : "outline"}
            onClick={() => setMode("employee")}
          >
            {t('login.employee')}
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
                  {mode === "user" ? t('login.welcome_user') : t('login.welcome_employee')}
                </CardTitle>
                <CardDescription className="text-center">
                  {t('login.enter_credentials')} {mode === "user" ? t('login.user_dashboard') : t('login.admin_dashboard')}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('login.email')}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder={t('login.email_placeholder')}
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">{t('login.password')}</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder={t('login.password_placeholder')}
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
                    {loading ? t('login.signing_in') : t('login.sign_in')}
                  </Button>
                </form>

                {/* Register only for users */}
                {mode === "user" && (
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 mb-3">
                      {t('login.new_here')} {" "}
                      <Button
                        variant="outline"
                        onClick={async () => {
                          if (!formData.email || !formData.password) {
                            setError(t('login.all_fields_required_warning'));
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
                              throw new Error(data.error || t('login.registration_failed'));
                            setSuccessMessage(data.message);
                          } catch (err) {
                            setError(err.message);
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={loading}
                      >
                        {t('login.register')}
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