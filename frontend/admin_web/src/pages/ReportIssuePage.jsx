import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PWALayout from "@/components/ui/PWALayout";
import { 
  Camera, 
  MapPin, 
  FileText, 
  Building, 
  Image as ImageIcon,
  X,
  CheckCircle,
  AlertTriangle,
  Loader2
} from "lucide-react";

function ReportIssuePage() {
  const [formData, setFormData] = useState({
    issue_title: "",
    issue_description: "",
    department: "",
    latitude: null,
    longitude: null,
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [locationLoading, setLocationLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Department options
  const departments = [
    "Public Works",
    "Traffic Management",
    "Water & Sanitation",
    "Waste Management",
    "Parks & Recreation",
    "Road Maintenance",
    "Street Lighting",
    "Building Permits",
    "Public Safety",
    "Environmental Services"
  ];

  useEffect(() => {
    const fetchLocation = async () => {
      setLocationLoading(true);
      
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser");
        setLocationLoading(false);
        return;
      }

      try {
        const permissionStatus = await navigator.permissions.query({ name: "geolocation" });
        if (permissionStatus.state === "denied") {
          setError("Location access is denied. Please enable it in browser settings.");
          setLocationLoading(false);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            setFormData((prev) => ({
              ...prev,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }));
            setLocationLoading(false);
          },
          (err) => {
            console.error("Geolocation error:", err);
            setError("Could not fetch location. Please allow location access.");
            setLocationLoading(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } catch (err) {
        console.error("Permission error:", err);
        setError("Could not fetch location. Please allow location access.");
        setLocationLoading(false);
      }
    };

    fetchLocation();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleDepartmentChange = (value) => {
    setFormData(prev => ({ ...prev, department: value }));
    setError("");
    setSuccess("");
  };

  const handleImageCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use rear camera for PWA
    
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
  //
    if (
      !formData.issue_title ||
      !formData.issue_description ||
      !formData.department ||
      !formData.latitude ||
      !formData.longitude
    ) {
      setError("All fields and location are required");
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
  
      // Create FormData for sending both text fields and image
      const payload = new FormData();
      payload.append("issue_title", formData.issue_title);
      payload.append("issue_description", formData.issue_description);
      payload.append("department", formData.department);
      payload.append("latitude", formData.latitude);
      payload.append("longitude", formData.longitude);
      payload.append("created_by", user.id);
  
      if (selectedImage) {
        payload.append("photo", selectedImage); // attach file
      }
  
      const response = await fetch("http://localhost:5001/issues/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // DO NOT set Content-Type for FormData
        },
        body: payload,
      });
  
      const data = await response.json();
  
      if (!response.ok) throw new Error(data.error || "Issue submission failed");
  
      setSuccess("Issue reported successfully!");
      setFormData((prev) => ({
        ...prev,
        issue_title: "",
        issue_description: "",
        department: "",
      }));
      setSelectedImage(null);
      setImagePreview(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PWALayout title="Report Issue" showNotifications={false}>
      <div className="px-4 pb-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Report New Issue
          </h2>
          <p className="text-gray-600">
            Help make your city better by reporting civic issues
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {success && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <p className="text-green-700 font-medium">{success}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Location Status */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                locationLoading ? 'bg-yellow-100' : formData.latitude ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {locationLoading ? (
                  <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />
                ) : (
                  <MapPin className={`w-5 h-5 ${
                    formData.latitude ? 'text-green-600' : 'text-red-600'
                  }`} />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {locationLoading ? 'Fetching Location...' : 
                   formData.latitude ? 'Location Detected' : 'Location Required'}
                </p>
                {formData.latitude && (
                  <p className="text-sm text-gray-600">
                    {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Issue Title */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Issue Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Issue Title *
                </label>
                <Input
                  name="issue_title"
                  placeholder="e.g., Broken street light on Main Street"
                  value={formData.issue_title}
                  onChange={handleInputChange}
                  className="h-12"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Description *
                </label>
                <Textarea
                  name="issue_description"
                  placeholder="Provide detailed description of the issue..."
                  value={formData.issue_description}
                  onChange={handleInputChange}
                  className="min-h-24 resize-none"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Department Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Building className="w-5 h-5" />
                <span>Department</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Select Relevant Department *
              </label>
              <Select value={formData.department} onValueChange={handleDepartmentChange}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Choose department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Image Upload */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Camera className="w-5 h-5" />
                <span>Add Photo</span>
              </CardTitle>
              <CardDescription>
                Take a photo or select from gallery to help illustrate the issue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!imagePreview ? (
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleImageCapture}
                    className="h-12 justify-start"
                  >
                    <Camera className="w-5 h-5 mr-3" />
                    Take Photo
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleImageSelect}
                    className="h-12 justify-start"
                  >
                    <ImageIcon className="w-5 h-5 mr-3" />
                    Select from Gallery
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Issue preview"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeImage}
                    className="absolute top-2 right-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <Badge className="absolute bottom-2 left-2 bg-black/70 text-white">
                    Photo attached
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={loading || locationLoading}
              className="w-full h-12 text-lg"
            >
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

        {/* Helper Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Your report will be reviewed and assigned to the appropriate department
          </p>
        </div>
      </div>
    </PWALayout>
  );
}
//.
export default ReportIssuePage;