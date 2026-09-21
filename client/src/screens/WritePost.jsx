import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../context/StoreContext';
import { useNavigate, useParams } from 'react-router';

// Editor.js core and plugins
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import Table from '@editorjs/table';
import Delimiter from '@editorjs/delimiter';
import Marker from '@editorjs/marker';
import Strikethrough from 'editorjs-strikethrough';

// Components
import HeaderNav from '../components/Header';
import Footer from '../components/Footer';

const WritePost = observer(() => {
  const { blogStore } = useStore();
  const navigate = useNavigate();
  const { slug } = useParams(); // Check if a slug exists in the URL
  const isEditing = Boolean(slug);

  const editorInstance = useRef(null);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState([]);
  const [isInitializing, setIsInitializing] = useState(true);

  // Fetch post data if we are in edit mode
  useEffect(() => {
    const loadPostData = async () => {
      if (isEditing) {
        await blogStore.fetchPostBySlug(slug);
        if (blogStore.currentPost) {
          setTitle(blogStore.currentPost.title || '');
          setSubtitle(blogStore.currentPost.subtitle || '');
        }
      }
      setIsInitializing(false);
    };

    loadPostData();
  }, [slug, isEditing, blogStore]);

  // Initialize Editor.js after data is loaded (or immediately for new posts)
  useEffect(() => {
    if (isInitializing) return;

    if (!editorInstance.current) {
      const initialData = isEditing && blogStore.currentPost?.content 
        ? { blocks: blogStore.currentPost.content } 
        : { blocks: [] };

      editorInstance.current = new EditorJS({
        holder: 'editorjs-container',
        data: initialData,
        tools: {
          header: {
            class: Header,
            config: { levels: [2, 3, 4], defaultLevel: 2 }
          },
          paragraph: {
            class: Paragraph,
            inlineToolbar: true,
          },
          list: {
            class: List,
            inlineToolbar: true,
          },
          quote: {
            class: Quote,
            inlineToolbar: true,
            config: {
              quotePlaceholder: 'Enter a quote',
              captionPlaceholder: 'Quote author',
            },
          },
          table: {
            class: Table,
            inlineToolbar: true,
          },
          delimiter: Delimiter,
          marker: Marker,
          strikethrough: Strikethrough,
        },
        placeholder: 'Tell your story... (Type "/" or click to add blocks)',
      });
    }

    // Cleanup on unmount
    return () => {
      if (editorInstance.current && typeof editorInstance.current.destroy === 'function') {
        editorInstance.current.destroy();
        editorInstance.current = null;
      }
    };
  }, [isInitializing, isEditing, blogStore.currentPost]);

  const handleSave = async (isPublished = true) => {
    if (!title.trim()) {
      setErrorMsg('Title cannot be empty.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!editorInstance.current) return;

    try {
      setErrorMsg(null);
      const outputData = await editorInstance.current.save();
      
      const payload = {
        title,
        subtitle,
        content: outputData.blocks,
        is_published: isPublished,
      };

      let success = false;
      if (isEditing) {
        success = await blogStore.updatePost(slug, payload);
      } else {
        success = await blogStore.createPost(payload);
      }

      if (success) {
        navigate('/dashboard');
      } else {
        setErrorMsg(blogStore.error || 'Failed to save story.');
      }
    } catch (err) {
      console.error('Editor save failed:', err);
      setErrorMsg('An error occurred while saving your story.');
    }
  };

  const handleOpenPreview = async () => {
    if (!editorInstance.current) return;
    try {
      const outputData = await editorInstance.current.save();
      setPreviewContent(outputData.blocks);
      setIsPreviewOpen(true);
    } catch (err) {
      console.error('Preview generation failed', err);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white font-sans text-gray-500">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col justify-between">
      <div>
        <HeaderNav />

        <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-12">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 text-palette-dark border border-palette-medium rounded-xl text-sm">
              {typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg)}
            </div>
          )}

          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-4xl md:text-5xl font-serif font-bold border-none outline-none placeholder-gray-300 mb-4 text-palette-dark bg-transparent"
          />

          <input
            type="text"
            placeholder="Subtitle (optional)"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full text-xl text-gray-500 font-sans border-none outline-none placeholder-gray-300 mb-8 bg-transparent"
          />

          <div id="editorjs-container" className="prose max-w-none font-sans min-h-[400px]"></div>
        </main>
      </div>

      <div className="sticky bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 py-4 px-6 z-40 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm font-medium text-gray-500 hover:text-palette-dark transition"
          >
            ← Back to Dashboard
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleOpenPreview}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 transition"
            >
              Preview
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={blogStore.loading}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={blogStore.loading}
              className="px-6 py-2 bg-palette-dark text-white rounded-full text-sm font-medium hover:opacity-90 transition shadow-md"
            >
              {blogStore.loading ? 'Saving...' : isEditing ? 'Update Story' : 'Publish Story'}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-palette-light animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Live Story Preview</span>
              <button 
                onClick={() => setIsPreviewOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center font-bold transition"
              >
                ✕
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-6">
              <div>
                <h1 className="text-3xl font-serif font-bold text-palette-dark mb-2">{title || 'Untitled Story'}</h1>
                {subtitle && <p className="text-lg text-gray-600 font-sans">{subtitle}</p>}
              </div>

              <div className="space-y-4 font-sans text-gray-800 border-t border-gray-100 pt-6">
                {previewContent.map((block, index) => {
                  if (block.type === 'header') {
                    const Tag = `h${block.data.level || 2}`;
                    return <Tag key={index} className="font-serif font-bold text-palette-dark mt-6 mb-2 text-2xl">{block.data.text}</Tag>;
                  }
                  if (block.type === 'paragraph') {
                    return <p key={index} className="leading-relaxed text-base" dangerouslySetInnerHTML={{ __html: block.data.text }} />;
                  }
                  if (block.type === 'list') {
                    const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
                    return (
                      <ListTag key={index} className="list-disc pl-5 space-y-1">
                        {block.data.items.map((item, i) => (
                          <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                        ))}
                      </ListTag>
                    );
                  }
                  if (block.type === 'quote') {
                    return (
                      <blockquote key={index} className="border-l-4 border-palette-dark pl-4 italic text-gray-700 my-4">
                        "{block.data.text}"
                        {block.data.caption && <span className="block text-xs text-gray-400 mt-1">— {block.data.caption}</span>}
                      </blockquote>
                    );
                  }
                  if (block.type === 'delimiter') {
                    return <hr key={index} className="my-6 border-gray-200" />;
                  }
                  return null;
                })}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-5 py-2 bg-palette-dark text-white rounded-full text-sm font-medium hover:opacity-90 transition"
              >
                Back to Editing
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
});

export default WritePost;