import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../context/StoreContext';
import { useNavigate, Link } from 'react-router';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';

const WritePost = observer(() => {
  const { blogStore } = useStore();
  const navigate = useNavigate();
  const editorInstance = useRef(null);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    // Initialize Editor.js only once
    if (!editorInstance.current) {
      editorInstance.current = new EditorJS({
        holder: 'editorjs-container',
        tools: {
          header: {
            class: Header,
            config: {
              levels: [2, 3, 4],
              defaultLevel: 2
            }
          },
          paragraph: {
            class: Paragraph,
            inlineToolbar: true,
          },
        },
        placeholder: 'Tell your story...',
      });
    }

    // Cleanup editor instance on unmount to prevent memory leaks
    return () => {
      if (editorInstance.current && typeof editorInstance.current.destroy === 'function') {
        editorInstance.current.destroy();
        editorInstance.current = null;
      }
    };
  }, []);

  const handlePublish = async () => {
    if (!title.trim()) {
      setErrorMsg('Title cannot be empty.');
      return;
    }

    if (!editorInstance.current) return;

    try {
      setErrorMsg(null);
      const outputData = await editorInstance.current.save();
      
      const payload = {
        title,
        subtitle,
        content: outputData.blocks, // Editor.js blocks map directly to Django JSONField
        is_published: true,
      };

      const newPost = await blogStore.createPost(payload);
      if (newPost) {
        navigate('/dashboard');
      } else {
        setErrorMsg(blogStore.error || 'Failed to publish post.');
      }
    } catch (err) {
      console.error('Editor save failed:', err);
      setErrorMsg('An error occurred while saving your story.');
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="flex justify-between items-center px-10 py-4 border-b border-gray-100 max-w-4xl w-full mx-auto">
        <Link to="/dashboard" className="text-sm font-medium text-gray-500 hover:text-palette-dark transition">
          ← Back to Dashboard
        </Link>
        <div className="flex items-center space-x-4">
          <button
            onClick={handlePublish}
            disabled={blogStore.loading}
            className="px-5 py-2 bg-palette-dark text-white rounded-full text-sm font-medium hover:opacity-90 transition shadow-sm"
          >
            {blogStore.loading ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </nav>

      {/* Main Writer Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12">
        {errorMsg && (
          <div className="mb-6 p-3 bg-red-50 text-palette-dark border border-palette-medium rounded-xl text-sm">
            {typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg)}
          </div>
        )}

        {/* Title Input */}
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-4xl md:text-5xl font-serif font-bold border-none outline-none placeholder-gray-300 mb-4 text-palette-dark bg-transparent"
        />

        {/* Subtitle Input */}
        <input
          type="text"
          placeholder="Subtitle (optional)"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="w-full text-xl text-gray-500 font-sans border-none outline-none placeholder-gray-300 mb-8 bg-transparent"
        />

        {/* Editor.js Container Node */}
        <div id="editorjs-container" className="prose max-w-none font-sans min-h-[400px]"></div>
      </main>
    </div>
  );
});

export default WritePost;