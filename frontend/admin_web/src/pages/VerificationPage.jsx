import { useState, useEffect } from "react";

export default function VerifyPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const slides = [
    {
      text: "Welcome to FixMyCity!",
      type: "welcome"
    },
    {
      text: "What is your name?",
      type: "question",
      inputType: "name"
    },
    {
      text: "What is your phone number?",
      type: "question",
      inputType: "phone"
    }
  ];

  const typeText = (text, callback) => {
    setIsTyping(true);
    setDisplayedText("");
    let i = 0;
    
    const typeInterval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      
      if (i === text.length) {
        clearInterval(typeInterval);
        setIsTyping(false);
        if (callback) callback();
      }
    }, 50);
  };

  useEffect(() => {
    typeText(slides[currentSlide].text);
  }, [currentSlide]);

  const handleNext = () => {
    if (currentSlide === 1 && !name.trim()) {
      setMessage("Please enter your name");
      return;
    }
    
    if (currentSlide < slides.length - 1) {
      setMessage("");
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 1) {
      setMessage("");
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleSubmit = async () => {
    if (!name || !phone) {
      setMessage("Please fill both fields");
      return;
    }
  
    try {
      const token = localStorage.getItem("token"); // get token from localStorage
  
      if (!token) {
        setMessage("User not logged in or verified yet");
        return;
      }
  
      const res = await fetch("http://localhost:5001/auth/complete-profile", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // pass token to backend
        },
        body: JSON.stringify({ name, phone }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage(data.message);
        setTimeout(() => (window.location.href = "/login"), 2000);
      } else {
        setMessage(data.error);
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (currentSlide === 1) {
        handleNext();
      } else if (currentSlide === 2) {
        handleSubmit();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Progress indicator */}
        <div className="flex justify-center mb-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-8 mx-1 rounded-full transition-all duration-300 ${
                index <= currentSlide ? "bg-blue-500" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Main content area */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 min-h-[60px] flex items-center justify-center">
            {displayedText}
            {isTyping && (
              <span className="inline-block w-0.5 h-6 bg-blue-500 ml-1 animate-pulse" />
            )}
          </h1>
        </div>

        {/* Input section */}
        {currentSlide > 0 && (
          <div className="mb-6">
            {slides[currentSlide].inputType === "name" && (
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-center text-lg"
                autoFocus
              />
            )}
            
            {slides[currentSlide].inputType === "phone" && (
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-center text-lg"
                autoFocus
              />
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-center gap-4">
          {currentSlide === 0 && (
            <button
              onClick={handleNext}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 transform hover:scale-105"
            >
              Let's Start
            </button>
          )}

          {currentSlide === 1 && (
            <button
              onClick={handleNext}
              disabled={!name.trim()}
              className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 ${
                name.trim()
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          )}

          {currentSlide === 2 && (
            <>
              <button
                onClick={handlePrev}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 transform hover:scale-105"
              >
                Previous
              </button>
              <button
                onClick={handleSubmit}
                disabled={!phone.trim()}
                className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 ${
                  phone.trim()
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Submit
              </button>
            </>
          )}
        </div>

        {/* Message display */}
        {message && (
          <div className={`mt-6 p-4 rounded-lg text-center font-medium ${
            message.includes("error") || message.includes("Please fill")
              ? "bg-red-100 text-red-700 border border-red-200"
              : "bg-green-100 text-green-700 border border-green-200"
          }`}>
            {message}
          </div>
        )}

        {/* Helper text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          {currentSlide > 0 && "Press Enter to continue"}
        </div>
      </div>
    </div>
  );
}