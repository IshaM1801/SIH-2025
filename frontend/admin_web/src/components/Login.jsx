// frontend/src/pages/Login.jsx
import React, { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState(""); // "user" | "employee"
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email || !password || !role) return setMessage("⚠️ Please fill all required fields");

    try {
      let url = "";
      let body = { email, password, role };

      // User registration
      if (mode === "register") {
        if (role === "user") {
          if (!name || !phone) return setMessage("⚠️ Please fill all fields");
          url = "http://localhost:5001/auth/register";
          body = { name, phone, email, password };
        } else {
          // Employee cannot register
          return;
        }
      }

      // User or Employee login
      if (mode === "login") {
        url = "http://localhost:5001/auth/login";
        if (role === "user") body = { email, password, role, name, phone };
        else body = { email, password, role };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "⚠️ Something went wrong");
      } else {
        if (mode === "login") {
          if (role === "user") setMessage(`✅ Welcome ${data.profile.name}`);
          else setMessage(`✅ Welcome ${data.employee.name} to the Department of ${data.employee.dept_name}`);
          localStorage.setItem("token", data.user?.access_token || "");
        } else if (mode === "register") {
          setMessage("✅ Registration successful! Please check your email before logging in.");
          setMode("login"); // switch to login after registration
        }
      }
    } catch (err) {
      console.error(err);
      setMessage("⚠️ Server error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">
          {mode === "login" ? "Login" : "Register"}
        </h2>

        {/* Role toggle */}
        <div className="flex justify-between mb-4">
          <button
            onClick={() => setRole("user")}
            className={`px-4 py-2 rounded ${role === "user" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
          >
            User
          </button>
          <button
            onClick={() => setRole("employee")}
            className={`px-4 py-2 rounded ${role === "employee" ? "bg-indigo-600 text-white" : "bg-gray-200"}`}
          >
            Employee
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User registration fields */}
          {mode === "register" && role === "user" && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </>
          )}

          {/* Email & Password */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />

          {/* Submit button */}
          {!(mode === "register" && role === "employee") && (
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
            >
              {mode === "login" ? "Login" : "Register"}
            </button>
          )}
        </form>

        {message && <p className="mt-4 text-center text-sm text-red-500">{message}</p>}

        {/* Toggle login/register */}
        <p className="mt-6 text-center text-sm text-gray-600">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              {role !== "employee" && (
                <button onClick={() => setMode("register")} className="text-indigo-600 hover:underline">
                  Register
                </button>
              )}
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button onClick={() => setMode("login")} className="text-indigo-600 hover:underline">
                Login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}