import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Camera, FileText, Image as ImageIcon, X, CheckCircle, AlertTriangle, Loader2, MapPin } from "lucide-react";
import PWALayout from "@/components/ui/PWALayout";

function ReportIssuePage() {
  const [formData, setFormData] = useState({ issue_title: "", issue_description: "" });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [coordinates, setCoordinates] = useState({ latitude: null, longitude: null });

  // --- Fetch user location only ---
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("⚠️ Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("📍 Fetched coordinates:", latitude, longitude);

        const coords = { latitude, longitude };
        setCoordinates(coords);
        localStorage.setItem("coords", JSON.stringify(coords));
        console.log("✅ Coordinates saved:", coords);
      },
      (err) => {
        console.warn("⚠️ Geolocation error:", err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleImageCapture = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleImageSelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // --- Submit issue
 // --- Submit issue
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");
  setSuccess("");

  if (!formData.issue_title || !formData.issue_description) {
    setError("All fields are required");
    setLoading(false);
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!token || !user?.id) {
      setError("User is not logged in or token not found");
      setLoading(false);
      return;
    }

    const storedCoords = JSON.parse(localStorage.getItem("coords") || "{}");

    const payload = new FormData();
    payload.append("issue_title", formData.issue_title);
    payload.append("issue_description", formData.issue_description);
    payload.append("created_by", user.id);
    if (selectedImage) payload.append("photo", selectedImage);
    if (storedCoords.latitude && storedCoords.longitude) {
      payload.append("latitude", storedCoords.latitude);
      payload.append("longitude", storedCoords.longitude);
    }

    console.log("📡 Submitting /issues/create:", payload);

    const response = await fetch("http://localhost:5001/issues/create", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: payload,
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Issue submission failed");

    console.log("✅ /issues/create response:", data);

    // --- Classification
    const classifyRes = await fetch("http://localhost:5001/issues/classify-report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reportId: data.issue.issue_id }),
    });

    const classifyData = await classifyRes.json();
    if (!classifyRes.ok) throw new Error(classifyData.error || "Classification failed");

    console.log("📂 /issues/classify-report response:", classifyData);

    // --- Fetch address from OpenCage (frontend)
    let areaName = "unknown area";
    try {
      const openCageKey = "ceefcaa44fd14d259322d6c1000b06c3"; // or from .env
      const coordsToUse = storedCoords.latitude
        ? `${storedCoords.latitude},${storedCoords.longitude}`
        : `${data.location.latitude},${data.location.longitude}`;

      const geoRes = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${coordsToUse}&key=${openCageKey}&no_annotations=1`
      );
      const geoData = await geoRes.json();
      if (geoData?.results?.length > 0) {
        const c = geoData.results[0].components;
        areaName = c.suburb || c.neighbourhood || c.village || c.city || c.town || "your area";
      }
    } catch (geoErr) {
      console.warn("⚠️ OpenCage fetch failed:", geoErr.message);
    }

    setSuccess(
      `✅ Your report has been submitted to the ${classifyData.department} department at ${areaName}.`
    );

    // Reset form
    setFormData({ issue_title: "", issue_description: "" });
    setSelectedImage(null);
    setImagePreview(null);
  } catch (err) {
    console.error("❌ Error submitting issue:", err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <PWALayout title="Report Issue" showNotifications={true}>
      <div className="px-4 pb-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Report New Issue</h2>
          <p className="text-gray-600">Help make your city better by reporting civic issues</p>
        </div>

        {/* Location & Coordinates */}
        {coordinates.latitude && coordinates.longitude && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 mb-1">Current Location</p>
                    <p className="text-green-700 font-medium">Address will be resolved by backend</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 pt-2 border-t border-blue-200">
                  <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-600 mb-1">GPS Coordinates</p>
                    <p className="text-blue-700 text-sm font-mono">
                      {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error & Success */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <p className="text-red-700 font-medium">{error}</p>
            </CardContent>
          </Card>
        )}
        {success && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-4 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-green-700 font-medium">{success}</p>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Issue Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Issue Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                name="issue_title"
                placeholder="e.g., Broken street light"
                value={formData.issue_title}
                onChange={handleInputChange}
                className="h-12"
                required
              />
              <Textarea
                name="issue_description"
                placeholder="Provide detailed description of the issue..."
                value={formData.issue_description}
                onChange={handleInputChange}
                className="min-h-24 resize-none"
                required
              />
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Camera className="w-5 h-5" />
                <span>Add Photo</span>
              </CardTitle>
              <CardDescription>Take a photo or select from gallery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!imagePreview ? (
                <div className="grid grid-cols-1 gap-3">
                  <Button type="button" variant="outline" onClick={handleImageCapture} className="h-12 justify-start">
                    <Camera className="w-5 h-5 mr-3" />
                    Take Photo
                  </Button>
                  <Button type="button" variant="outline" onClick={handleImageSelect} className="h-12 justify-start">
                    <ImageIcon className="w-5 h-5 mr-3" />
                    Select from Gallery
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <img src={imagePreview} alt="Issue preview" className="w-full h-48 object-cover rounded-lg border" />
                  <Button type="button" variant="destructive" size="sm" onClick={removeImage} className="absolute top-2 right-2">
                    <X className="w-4 h-4" />
                  </Button>
                  <Badge className="absolute bottom-2 left-2 bg-black/70 text-white">Photo attached</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="pt-4">
            <Button type="submit" disabled={loading} className="w-full h-12 text-lg">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting Report...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </PWALayout>
  );
}

export default ReportIssuePage;