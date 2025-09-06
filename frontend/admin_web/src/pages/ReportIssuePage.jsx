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

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Fetched coordinates:", latitude, longitude);
  
          // Save in state and localStorage
          setCoordinates({ latitude, longitude });
          localStorage.setItem("coords", JSON.stringify({ latitude, longitude }));
          console.log("Coordinates saved in localStorage:", JSON.parse(localStorage.getItem("coords")));
  
          // Send to backend
          fetch("http://localhost:5001/issues/fetch-location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ latitude, longitude }),
          })
            .then((res) => res.json())
            .then((data) => console.log("Server response:", data))
            .catch((err) => console.error("Fetch error:", err));
        },
        (err) => {
          console.warn("Geolocation error:", err.message);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      console.warn("Geolocation is not supported by this browser");
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleImageCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
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
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
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

      // Use coordinates from localStorage if available
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

      const response = await fetch("http://localhost:5001/issues/create", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Issue submission failed");

      // Call classify-report
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

      setSuccess(`Your report has been submitted to the ${classifyData.department} department.`);

      // Reset form
      setFormData({ issue_title: "", issue_description: "" });
      setSelectedImage(null);
      setImagePreview(null);
    } catch (err) {
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

        {/* Display Coordinates */}
        {coordinates.latitude && coordinates.longitude && (
          <Card className="mb-4 border-blue-200 bg-blue-50">
            <CardContent className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              <p className="text-blue-700">
                Current Coordinates: {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
              </p>
            </CardContent>
          </Card>
        )}

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