// frontend/src/pages/Login.jsx
import React, { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [empId, setEmpId] = useState("");
  const [empPassword, setEmpPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("login");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      let url, body;

      if (mode === "login") {
        if (!email || !password) return setMessage("⚠️ Please enter email and password");
        url = "http://localhost:5001/auth/login";
        body = { email, password };
      } else if (mode === "register") {
        if (!email || !name) return setMessage("⚠️ Please fill required fields");
        url = "http://localhost:5001/auth/register";

        if (role === "employee") {
          if (!empId || !empPassword )
            return setMessage("⚠️ Please fill all employee fields");

          body = {
            email,
            password: empPassword, // required by Supabase
            role,
            emp_id: empId,
            name,
          };
        } else {
          if (!password) return setMessage("⚠️ Please enter password");
          body = { email, password, role, name };
        }
      } else if (mode === "reset") {
        if (!email) return setMessage("⚠️ Please enter email");
        url = "http://localhost:5001/auth/reset-password-request";
        body = { email };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) setMessage(data.error || "⚠️ Something went wrong");
      else {
        if (mode === "register") setMessage("✅ Registration successful! Please check your email.");
        else if (mode === "login") {
          setMessage("✅ Login successful!");
          localStorage.setItem("token", data.session?.access_token || "");
        } else if (mode === "reset") setMessage("📩 Password reset email sent! Check inbox.");
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
          {mode === "register" && (
            <input
              type="text"
              placeholder="Full Name"
              className="w-full px-4 py-2 border rounded-lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {mode !== "reset" && (role !== "employee" || mode === "login") && (
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 border rounded-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}

          {mode === "register" && (
            <select
              className="w-full px-4 py-2 border rounded-lg"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Select Role</option>
              <option value="user">User</option>
              <option value="employee">Employee</option>
            </select>
          )}

          {mode === "register" && role === "employee" && (
            <>
              <input
                type="text"
                placeholder="Employee ID"
                className="w-full px-4 py-2 border rounded-lg"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Employee Password"
                className="w-full px-4 py-2 border rounded-lg"
                value={empPassword}
                onChange={(e) => setEmpPassword(e.target.value)}
                required
              />
          
            </>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
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