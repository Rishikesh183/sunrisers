'use client';

import { useState } from 'react';

const AddNews = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [longDesc, setLongDesc] = useState('');

  const handleUpload = async () => {
    if (!title || !description || !imageUrl || !longDesc) {
      alert('Please fill all fields');
      return;
    }

    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, imageUrl, longDesc }),
      });

      if (!res.ok) throw new Error('Request failed');

      alert('News added successfully!');
      setTitle('');
      setDescription('');
      setImageUrl('');
      setLongDesc('');
    } catch (error) {
      console.error('Error adding news:', error);
      alert('Failed to add news');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-bg px-4">
      <div className="bg-surface border border-border rounded-xl shadow-xl w-full max-w-xl overflow-hidden">
        <div className="flex flex-col gap-6 p-8">
          <h2 className="font-display capitalize text-2xl sm:text-3xl text-accent">Add News</h2>

          <div className="space-y-4 w-full">
            <input
              className="rounded-lg w-full h-10 px-4 bg-bg border border-border text-text placeholder:text-textMuted shadow-sm focus:ring-2 focus:ring-accent focus:outline-none"
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              className="rounded-lg w-full p-4 h-24 bg-bg border border-border text-text placeholder:text-textMuted shadow-sm resize-none focus:ring-2 focus:ring-accent focus:outline-none"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <textarea
              className="rounded-lg w-full p-4 h-32 bg-bg border border-border text-text placeholder:text-textMuted shadow-sm resize-none focus:ring-2 focus:ring-accent focus:outline-none"
              placeholder="Long Description"
              value={longDesc}
              onChange={(e) => setLongDesc(e.target.value)}
            />

            <input
              className="rounded-lg w-full h-10 px-4 bg-bg border border-border text-text placeholder:text-textMuted shadow-sm focus:ring-2 focus:ring-accent focus:outline-none"
              type="text"
              placeholder="Image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />

            <button
              className="bg-accent text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-accentHover transition duration-200 focus:ring-2 focus:ring-accent focus:ring-opacity-50 focus:outline-none w-full mt-2"
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
