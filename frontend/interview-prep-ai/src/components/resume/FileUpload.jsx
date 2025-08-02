// frontend/src/components/FileUpload.jsx
import React, { useState } from "react";
import axios from "axios";

const FileUpload = ({ onAnalysisComplete, onError, onLoading }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("No file chosen");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      onError("Please select a file first.");
      return;
    }

    onLoading(true);
    onError(null);
    const formData = new FormData();
    formData.append("resume", selectedFile);

    try {
      const response = await axios.post(
        `http://localhost:8000/api/resumes/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      onAnalysisComplete(response.data.analysis);
    } catch (error) {
      console.error("Error uploading file:", error);
      onError(error.response?.data?.error || "An unexpected error occurred.");
    } finally {
      onLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Upload Your Resume
      </h2>
      <p className="text-gray-600 mb-6">
        Upload a .pdf, .docx, or .txt file for analysis.
      </p>
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-8 h-8 mb-4 text-gray-500"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500">{fileName}</p>
          </div>
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt"
          />
        </label>
      </div>
      <button
        onClick={handleUpload}
        className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out"
      >
        Analyze Resume
      </button>
    </div>
  );
};

export default FileUpload;
