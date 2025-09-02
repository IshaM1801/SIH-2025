// frontend/src/pages/Login.jsx
import React, { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); // "user" | "employee"
  const [empId, setEmpId] = useState("");
  const [empPassword, setEmpPassword] = useState("");
  const [name, setName] = useState("");
  const [empDept, setEmpDept] = useState("");
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("login"); // "login" | "register" | "reset"

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      let url;
      let body;

      if (mode === "login") {
        if (!email || !password) {
          setMessage("⚠️ Please enter email and password");
          return;
        }
        url = "http://localhost:5001/auth/login";
        body = { email, password };
      } else if (mode === "register") {
        if (!email) {
          setMessage("⚠️ Please enter your email");
          return;
        }

        url = "http://localhost:5001/auth/register";

        if (role === "employee") {
          if (!empId || !empPassword || !name || !empDept) {
            setMessage("⚠️ Please fill all employee fields");
            return;
          }
          body = {
            email,
            password: empPassword, // for Supabase
            role,
            emp_id: empId,
            emp_password: empPassword,
            name,
            emp_dept: empDept,
          };
        } else {
          if (!password || !name) {
            setMessage("⚠️ Please fill all user fields");
            return;
          }
          body = { email, password, role, name };
        }
      } else if (mode === "reset") {
        if (!email) {
          setMessage("⚠️ Please enter your email");
          return;
        }
        url = "http://localhost:5001/auth/reset-password-request";
        body = { email };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Something went wrong");
      } else {
        if (mode === "register") {
          setMessage("✅ Registration successful! Please check your email.");
        } else if (mode === "login") {
          setMessage("✅ Login successful!");
          localStorage.setItem("token", data.session?.access_token || "");
        } else if (mode === "reset") {
          setMessage("📩 Password reset email sent! Check your inbox.");
        }
      }
    } catch (err) {
      setMessage("⚠️ Server error");
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">
          {mode === "login" && "Login"}
          {mode === "register" && "Register"}
          {mode === "reset" && "Reset Password"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name (only register) */}
          {mode === "register" && (
            <input
              type="text"
              placeholder="Full Name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password */}
          {mode !== "reset" && (role !== "employee" || mode === "login") && (
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}

          {/* Role selection (register only) */}
          {mode === "register" && (
            <select
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Select Role</option>
              <option value="user">User</option>
              <option value="employee">Employee</option>
            </select>
          )}

          {/* Employee-specific fields */}
          {mode === "register" && role === "employee" && (
            <>
              <input
                type="text"
                placeholder="Employee ID"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Employee Password"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={empPassword}
                onChange={(e) => setEmpPassword(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Department"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={empDept}
                onChange={(e) => setEmpDept(e.target.value)}
                required
              />
            </>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            {mode === "login" && "Login"}
            {mode === "register" && "Register"}
            {mode === "reset" && "Send Reset Link"}
          </button>
        </form>

        {message && <p className="mt-4 text-center text-sm text-red-500">{message}</p>}

        {/* Mode toggles */}
        {mode === "login" && (
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <button onClick={() => setMode("register")} className="text-indigo-600 hover:underline">
              Register
            </button>
            <br />
            <button onClick={() => setMode("reset")} className="text-indigo-600 hover:underline mt-2">
              Forgot Password?
            </button>
          </p>
        )}
        {mode === "register" && (
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <button onClick={() => setMode("login")} className="text-indigo-600 hover:underline">
              Login
            </button>
          </p>
        )}
        {mode === "reset" && (
          <p className="mt-6 text-center text-sm text-gray-600">
            Remembered your password?{" "}
            <button onClick={() => setMode("login")} className="text-indigo-600 hover:underline">
              Back to Login
            </button>
          </p>
        )}
      </div>
    </div>
  );
}