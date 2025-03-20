import React, { useState } from "react";
import { db } from "../firebase.config";
import { collection, addDoc, Timestamp } from "firebase/firestore";

const AddNews = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [longDesc, setLongDesc] = useState("");

  const handleUpload = async () => {
    if (!title || !description || !imageUrl || !longDesc) {
      alert("Please fill all fields");
      return;
    }

    try {
      await addDoc(collection(db, "news"), {
        title,
        description,
        imageUrl,
        longDesc,
        timestamp: Timestamp.now(),
      });

      alert("News added successfully!");
      setTitle("");
      setDescription("");
      setImageUrl("");
      setLongDesc("")
    } catch (error) {
      console.error("Error adding news:", error);
      alert("Failed to add news");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-gradient-to-r from-cyan-500 to-teal-600 rounded-xl shadow-xl w-full max-w-xl overflow-hidden">
        <div className="flex flex-col gap-6 p-8">
          <h2 className="font-bold capitalize text-3xl text-white">Add News</h2>
          
          <div className="space-y-4 w-full">
            <input
              className="rounded-lg w-full h-10 px-4 shadow-sm focus:ring-2 focus:ring-cyan-300 focus:outline-none"
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            
            <textarea
              className="rounded-lg w-full p-4 h-24 shadow-sm resize-none focus:ring-2 focus:ring-cyan-300 focus:outline-none"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            
            <textarea
              className="rounded-lg w-full p-4 h-32 shadow-sm resize-none focus:ring-2 focus:ring-cyan-300 focus:outline-none"
              placeholder="Long Description"
              value={longDesc}
              onChange={(e) => setLongDesc(e.target.value)}
            />
            
            <input
              className="rounded-lg w-full h-10 px-4 shadow-sm focus:ring-2 focus:ring-cyan-300 focus:outline-none"
              type="text"
              placeholder="Image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            
            <button 
              className="bg-white text-teal-600 font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-gray-50 transition duration-200 focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:outline-none w-full mt-2"
              onClick={handleUpload}
            >
              Add News
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNews;
