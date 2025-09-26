//report issue

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Camera,
  FileText,
  Image as ImageIcon,
  X,
  CheckCircle,
  AlertTriangle,
  Loader2,
  MapPin,
  Shield,
  Eye,
} from "lucide-react";
import PWALayout from "@/components/ui/PWALayout";
import { API_BASE_URL } from "@/config/api";

function ReportIssuePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    issue_title: "",
    issue_description: "",
  });
  // ✅ UPDATED: State to handle multiple images and a single video
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoPreview, setVideoPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [coordinates, setCoordinates] = useState({
    latitude: null,
    longitude: null,
  });
  const [address, setAddress] = useState("");
  const [addressLoading, setAddressLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);

  useEffect(() => {
    const fetchLocation = () => {
      if (navigator.geolocation) {
        setAddressLoading(true);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log("📍 Fetched coordinates:", latitude, longitude);

            const coords = { latitude, longitude };
            setCoordinates(coords);
            localStorage.setItem("coords", JSON.stringify(coords));
            console.log("✅ Coordinates saved:", coords);

            fetchAddressFromBackend(latitude, longitude);
          },
          (err) => {
            console.warn("⚠️ Geolocation error:", err.message);
            setAddressLoading(false);
            setAddress("Location access denied");
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        console.warn("⚠️ Geolocation is not supported by this browser");
        setAddress("Geolocation not supported");
      }
    };

    fetchLocation();
  }, []);

  const fetchAddressFromBackend = async (latitude, longitude) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/issues/fetch-address`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ latitude, longitude }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch address");

      console.log("🏠 Address from backend:", data.address);
      setAddress(data.address);
    } catch (err) {
      console.error("❌ Error fetching address:", err);
      setAddress("Unable to fetch address");
    } finally {
      setAddressLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  // ✅ UNIFIED: Handles both image and video selection from camera/gallery
  const handleMediaSelection = (fromCamera = false) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*";
    input.multiple = true; // Allows multiple files to be selected

    if (fromCamera) {
      input.capture = "environment";
    }

    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        files.forEach((file) => {
          if (file.type.startsWith("image/")) {
            setSelectedImages((prev) => [...prev, file]);
            const reader = new FileReader();
            reader.onload = (e) => {
              setImagePreviews((prev) => [...prev, e.target.result]);
            };
            reader.readAsDataURL(file);
          } else if (file.type.startsWith("video/")) {
            setSelectedVideo(file);
            const reader = new FileReader();
            reader.onload = (e) => {
              setVideoPreview(e.target.result);
            };
            reader.readAsDataURL(file);
          }
        });
        setError("");
        setSuccess("");
      }
    };
    input.click();
  };

  // ✅ UPDATED: Function to remove a specific image
  const removeImage = (indexToRemove) => {
    setSelectedImages((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
    setImagePreviews((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  // ✅ NEW: Function to remove the selected video
  const removeVideo = () => {
    setSelectedVideo(null);
    setVideoPreview(null);
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

      const storedCoords = JSON.parse(localStorage.getItem("coords") || "{}");

      const payload = new FormData();
      payload.append("issue_title", formData.issue_title);
      payload.append("issue_description", formData.issue_description);
      payload.append("created_by", user.id);
      payload.append("is_anonymous", isAnonymous.toString());

      // ✅ Append all images to the payload
      selectedImages.forEach((image) => {
        payload.append(`photos`, image);
      });

      // ✅ Append the video to the payload
      if (selectedVideo) {
        payload.append("video", selectedVideo);
      }

      if (storedCoords.latitude && storedCoords.longitude) {
        payload.append("latitude", storedCoords.latitude);
        payload.append("longitude", storedCoords.longitude);
      }

      const response = await fetch(`${API_BASE_URL}/issues/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Issue submission failed");

      console.log("✅ Issue created:", data);

      const resolvedAddress = data.location?.address || address || "your area";

      const classifyRes = await fetch(
        `${API_BASE_URL}/issues/classify-report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reportId: data.issue.issue_id }),
        }
      );

      const classifyData = await classifyRes.json();
      if (!classifyRes.ok) {
        console.warn("Classification failed:", classifyData.error);
        setSuccess(
          `✅ Your ${
            isAnonymous ? "anonymous " : ""
          }report has been submitted successfully at ${resolvedAddress}. Classification pending.`
        );
      } else {
        setSuccess(
          `✅ Your ${
            isAnonymous ? "anonymous " : ""
          }report has been submitted to the ${
            classifyData.department
          } department at ${resolvedAddress}.`
        );
      }

      setFormData({ issue_title: "", issue_description: "" });
      setSelectedImages([]);
      setSelectedVideo(null);
      setImagePreviews([]);
      setVideoPreview(null);
      setIsAnonymous(true);

      setTimeout(() => {
        navigate("/my-reports");
      }, 3000);
    } catch (err) {
      console.error("❌ Submission error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PWALayout title="Report Issue" showNotifications={true}>
      <div className="px-4 pb-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Report New Issue
          </h2>
          <p className="text-gray-600">
            Help make your city better by reporting civic issues
          </p>
        </div>

        {coordinates.latitude && coordinates.longitude && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Current Location
                    </p>
                    {addressLoading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                        <p className="text-blue-700">Fetching address...</p>
                      </div>
                    ) : address ? (
                      <p className="text-green-700 font-medium">{address}</p>
                    ) : (
                      <p className="text-gray-500">Address not available</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-2 border-t border-blue-200">
                  <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="mt-3 text-xs text-gray-600 mb-1">
                      GPS Coordinates
                    </p>
                    <p className="text-blue-700 text-sm font-mono">
                      {coordinates.latitude.toFixed(6)},{" "}
                      {coordinates.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Privacy Setting</span>
              </CardTitle>
              <CardDescription>
                Choose how your identity will be handled with this report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isAnonymous
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 bg-gray-50 hover:border-gray-300"
                  }`}
                  onClick={() => setIsAnonymous(true)}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isAnonymous
                          ? "border-green-500 bg-green-500"
                          : "border-gray-400"
                      }`}
                    >
                      {isAnonymous && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          Submit Anonymously
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Your identity will be kept private. Only authorities can
                        access reporter details if needed for follow-up.
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    !isAnonymous
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-gray-50 hover:border-gray-300"
                  }`}
                  onClick={() => setIsAnonymous(false)}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        !isAnonymous
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-400"
                      }`}
                    >
                      {!isAnonymous && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          Submit Publicly
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Your name and profile will be visible to other users.
                        This helps build community trust and accountability.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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

          {/* ✅ UPDATED: Media Upload Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Camera className="w-5 h-5" />
                <span>Add Photos & Videos</span>
              </CardTitle>
              <CardDescription>
                Take a photo/video or select from your gallery.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image previews grid */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {imagePreviews.map((previewUrl, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={previewUrl}
                        alt={`Preview ${index}`}
                        className="w-full h-full object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 h-6 w-6 rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Video preview section */}
              {videoPreview && (
                <div className="relative aspect-video">
                  <video
                    src={videoPreview}
                    controls
                    className="w-full h-full object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={removeVideo}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Badge className="absolute bottom-2 left-2 bg-black/70 text-white">
                    Video attached
                  </Badge>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleMediaSelection(true)}
                  className="h-12 justify-start"
                >
                  <Camera className="w-5 h-5 mr-3" />
                  Take Photo / Video
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleMediaSelection(false)}
                  className="h-12 justify-start"
                >
                  <ImageIcon className="w-5 h-5 mr-3" />
                  Select from Gallery
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting {isAnonymous ? "Anonymous " : ""}Report...
                </>
              ) : (
                <>
                  {<FileText className="w-5 h-5 mr-2" />}
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
