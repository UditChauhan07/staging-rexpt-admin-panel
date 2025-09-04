

//work best
// import axios from 'axios';
// import React, { useState, useRef, useEffect } from 'react';

// const PartnerResources = () => {
//   const [activeTab, setActiveTab] = useState('Sales and Marketing');
//   const [content, setContent] = useState({
//     'Sales and Marketing': [],
//     'Training Resources': [],
//     'Support & Communications': [],
//   });
//   const [showModal, setShowModal] = useState(false);
//   const [showPreviewModal, setShowPreviewModal] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [selectedLink, setSelectedLink] = useState(null);
//   const [newContent, setNewContent] = useState({
//     category: 'Sales and Marketing',
//     resourceType: '',
//     title: '',
//     description: '',
//     links: [''],
//     coverImage: null,
//     files: [],
//     coverPreview: '',
//     filePreviews: [],
//   });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(true);
//   const fileInputRef = useRef(null);

//   const tabs = ['Sales and Marketing', 'Training Resources', 'Support & Communications'];
//   const MAX_FILES = 5;

//   const resourceTypes = {
//     'Sales and Marketing': [
//       'Product Presentations',
//       'Case Studies',
//       'Brochures & Data Sheets',
//       'Marketing Collateral',
//       'Competitive Analysis',
//     ],
//     'Training Resources': [
//       'Onboarding Guides',
//       'Troubleshooting Guides',
//       'Technical Docs',
//       'FAQs',
//       'Webinar',
//     ],
//     'Support & Communications': [
//       'Leads',
//       'Partner Manager Contact Info',
//       'Newsletters',
//     ],
//   };

//   // Fetch resources on component mount
//   useEffect(() => {
//     const fetchResources = async () => {
//       try {
//         setLoading(true);
//         const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/resources/getresources`, {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem('token')}`,
//           },
//         });
//         console.log('res',res)
//         // Group resources by category
//         const groupedContent = {
//           'Sales and Marketing': [],
//           'Training Resources': [],
//           'Support & Communications': [],
//         };

//         res.data.forEach((resource) => {
//           console.log('resource1',resource)
//             let parsedLinks = [];
//             try {
//               if (typeof resource.links === "string") {
//                 parsedLinks = JSON.parse(resource.links);
//               } else if (Array.isArray(resource.links)) {
//                 parsedLinks = resource.links;
//               }
//             } catch (err) {
//               parsedLinks = [];
//             }
//           const formattedResource = {
//             ...resource,
//             coverImage: resource.coverImage
//               ? `${process.env.NEXT_PUBLIC_API_URL}${resource.coverImage}`
//               : null,
//             files: resource.files.map((file) => ({
//               name: file.fileName,
//               url: `${process.env.NEXT_PUBLIC_API_URL}${file.filePath}`,
//               type: file.fileType,
//               size: (file.fileSize / 1024).toFixed(2) + ' KB',
//               // icon: getFileIcon(file.fileType),
//             })),
//             links:parsedLinks,
//             linkThumbnails: parsedLinks.map((link) => ({
//               url: link,
//               thumbnail: getLinkThumbnail(link),
//             })),
//           };
//           console.log('formattedResource',formattedResource)
//           if (groupedContent[resource.category]) {
//             groupedContent[resource.category].push(formattedResource);
//           }
//         });
//         setContent(groupedContent);
//         setLoading(false);
//       } catch (err) {
//         setError('Failed to fetch resources.');
//         setLoading(false);
//       }
//     };

//     fetchResources();
//   }, []);

//   const handleTabChange = (tab) => {
//     setActiveTab(tab);
//     setNewContent({ ...newContent, category: tab, resourceType: '' });
//   };

//   const handleInputChange = (e, index) => {
//     const { name, value, files } = e.target;
//     if (name === 'coverImage' && files[0]) {
//       compressImage(files[0], (compressed) => {
//         const preview = URL.createObjectURL(compressed);
//         setNewContent({
//           ...newContent,
//           coverImage: compressed,
//           coverPreview: preview,
//         });
//       });
//     } else if (name === 'files') {
//       const selectedFiles = Array.from(files);
//       if (newContent.files.length + selectedFiles.length > MAX_FILES) {
//         setError(`Maximum ${MAX_FILES} files allowed.`);
//         return;
//       }
//       const previews = selectedFiles.map((file) => getFilePreview(file));
//       setNewContent({
//         ...newContent,
//         files: [...newContent.files, ...selectedFiles],
//         filePreviews: [...newContent.filePreviews, ...previews],
//       });
//       setError('');
//       fileInputRef.current.value = null;
//     } else if (name === 'link') {
//       const updatedLinks = [...newContent.links];
//       updatedLinks[index] = value;
//       setNewContent({ ...newContent, links: updatedLinks });
//     } else {
//       setNewContent({ ...newContent, [name]: value });
//     }
//   };

//   const addLinkInput = () => {
//     setNewContent({ ...newContent, links: [...newContent.links, ''] });
//   };

//   const removeLinkInput = (index) => {
//     const updatedLinks = newContent.links.filter((_, i) => i !== index);
//     setNewContent({ ...newContent, links: updatedLinks });
//   };

//   const compressImage = (file, callback) => {
//     if (!file.type.startsWith('image/')) {
//       callback(file);
//       return;
//     }

//     const img = new Image();
//     img.src = URL.createObjectURL(file);

//     img.onload = () => {
//       const canvas = document.createElement('canvas');
//       const ctx = canvas.getContext('2d');
//       const maxWidth = 800;
//       const maxHeight = 800;
//       let width = img.width;
//       let height = img.height;

//       if (width > height) {
//         if (width > maxWidth) {
//           height *= maxWidth / width;
//           width = maxWidth;
//         }
//       } else {
//         if (height > maxHeight) {
//           width *= maxHeight / height;
//           height = maxHeight;
//         }
//       }

//       canvas.width = width;
//       canvas.height = height;
//       ctx.drawImage(img, 0, 0, width, height);

//       canvas.toBlob(
//         (blob) => {
//           if (blob) {
//             const compressedFile = new File([blob], file.name, {
//               type: 'image/jpeg',
//               lastModified: Date.now(),
//             });
//             callback(compressedFile);
//           }
//         },
//         'image/jpeg',
//         0.7
//       );
//     };
//   };

//   const getFileIcon = (type) => {
//     if (type === 'application/pdf') return '/pdf-icon.png';
//     if (type.includes('word') || type.includes('msword')) return '/word-icon.png';
//     if (type.includes('spreadsheet') || type.includes('ms-excel')) return '/excel-icon.png';
//     if (type.includes('presentation') || type.includes('ms-powerpoint')) return '/ppt-icon.png';
//     if (type === 'text/plain') return '/txt-icon.png';
//     if (type === 'text/csv') return '/csv-icon.png';
//     if (type === 'application/json') return '/json-icon.png';
//     if (type === 'application/zip') return '/zip-icon.png';
//     return '/file-icon.png';
//   };

//   const getFilePreview = (file) => {
//     const type = file.type;
//     const url = URL.createObjectURL(file);
//     const size = (file.size / 1024).toFixed(2) + ' KB';
//     const icon = getFileIcon(type);
//     return { type, url, name: file.name, size, icon };
//   };

//   const removeFile = (index) => {
//     const updatedFiles = newContent.files.filter((_, i) => i !== index);
//     const updatedPreviews = newContent.filePreviews.filter((_, i) => i !== index);
//     setNewContent({
//       ...newContent,
//       files: updatedFiles,
//       filePreviews: updatedPreviews,
//     });
//     setError('');
//   };

//   const handleFileClick = (file) => {
//     setSelectedFile(file);
//     setSelectedLink(null);
//     setShowPreviewModal(true);
//   };

//   const handleLinkClick = (link) => {
//     setSelectedLink(link);
//     setSelectedFile(null);
//     setShowPreviewModal(true);
//   };

//   const handleDownload = (file) => {
//     const link = document.createElement('a');
//     link.href = file.url;
//     link.download = file.name;
//     link.click();
//   };

//   const isYouTubeLink = (link) => {
//     return link && (link.includes('youtube.com') || link.includes('youtu.be'));
//   };

//   const getYouTubeVideoId = (link) => {
//     const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
//     const match = link.match(regExp);
//     return match && match[2].length === 11 ? match[2] : null;
//   };

//   const getYouTubeEmbedUrl = (link) => {
//     const videoId = getYouTubeVideoId(link);
//     return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
//   };

//   const getLinkThumbnail = (link) => {
//     if (isYouTubeLink(link)) {
//       const videoId = getYouTubeVideoId(link);
//       return `https://img.youtube.com/vi/${videoId}/0.jpg`;
//     }
//     return '/link-icon.png';
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!newContent.title) {
//       setError('Title is required.');
//       return;
//     }
//     if (!newContent.resourceType) {
//       setError('Resource Type is required.');
//       return;
//     }
//     try {
//       const formData = new FormData();
//       formData.append('category', newContent.category);
//       formData.append('resourceType', newContent.resourceType);
//       formData.append('title', newContent.title);
//       formData.append('description', newContent.description);
//       formData.append('links', JSON.stringify(newContent.links));
//       if (newContent.coverImage) {
//         formData.append('ResourceCoverImage', newContent.coverImage);
//       }
//       newContent.files.forEach((file) => formData.append('ResourceFiles', file));

//       const res = await axios.post(
//         `${process.env.NEXT_PUBLIC_API_URL}/api/resources/createResource`,
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem('token')}`,
//             'Content-Type': 'multipart/form-data',
//           },
//         }
//       );

//       let parsedLinks = [];
//             try {
//               if (typeof resource.links === "string") {
//                 parsedLinks = JSON.parse(resource.links);
//               } else if (Array.isArray(resource.links)) {
//                 parsedLinks = resource.links;
//               }
//             } catch (err) {
//               parsedLinks = [];
//             }
//       const newResource = {
//         ...res.data,
//         coverImage: res.data.coverImage
//           ? `${process.env.NEXT_PUBLIC_API_URL}${res.data.coverImage}`
//           : null,
//         files: res.data.files.map((file) => ({
//           name: file.fileName,
//           url: `${process.env.NEXT_PUBLIC_API_URL}${file.filePath}`,
//           type: file.fileType,
//           size: (file.fileSize / 1024).toFixed(2) + ' KB',
//           // icon: getFileIcon(file.fileType),
//         })),
//           links:parsedLinks,
//             linkThumbnails: parsedLinks.map((link) => ({
//               url: link,
//               thumbnail: getLinkThumbnail(link),
//             })),
//       };

//       setContent({
//         ...content,
//         [newContent.category]: [...content[newContent.category], newResource],
//       });
//       setNewContent({
//         category: 'Sales and Marketing',
//         resourceType: '',
//         title: '',
//         description: '',
//         links: [''],
//         coverImage: null,
//         files: [],
//         coverPreview: '',
//         filePreviews: [],
//       });
//       setShowModal(false);
//       setError('');
//     } catch (err) {
//       setError('Failed to upload resource.');
//     }
//   };

//   return (
//     <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold text-gray-800">Partner Resources</h1>
//         <button
//           onClick={() => setShowModal(true)}
//           className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
//         >
//           Add Resource
//         </button>
//       </div>

//       {/* Tab Navigation */}
//       <div className="flex border-b border-gray-300 mb-6">
//         {tabs.map((tab) => (
//           <button
//             key={tab}
//             className={`px-6 py-3 font-medium text-sm transition-colors ${
//               activeTab === tab
//                 ? 'border-b-2 border-purple-600 text-purple-600'
//                 : 'text-gray-600 hover:text-purple-600'
//             }`}
//             onClick={() => handleTabChange(tab)}
//           >
//             {tab}
//           </button>
//         ))}
//       </div>

//       {/* Loading State */}
//       {loading ? (
//         <p className="text-center text-gray-500">Loading resources...</p>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {content[activeTab].length > 0 ? (
//             content[activeTab].map((item, index) => (
//               <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
//                 {item.coverImage && (
//                   <img src={item.coverImage} alt="Cover" className="w-full h-40 object-cover" />
//                 )}
//                 <div className="p-4">
//                   <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
//                   <span className="inline-block bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded mb-2">
//                     {item.resourceType}
//                   </span>
//                   <p className="text-sm text-gray-600 mb-2">{item.description}</p>
//                   {item.linkThumbnails && item.linkThumbnails.length > 0 && (
//                     <div className="mt-2 grid grid-cols-2 gap-2 mb-2">
//                       {item.linkThumbnails.map((link, idx) => (
//                         <div
//                           key={idx}
//                           className="relative cursor-pointer"
//                           onClick={() => handleLinkClick(link.url)}
//                         >
//                           <img
//                             src={link.thumbnail}
//                             alt="Link Thumbnail"
//                             className="w-full h-24 object-cover rounded-md"
//                           />
//                           <span className="absolute bottom-1 left-1 bg-purple-600 text-white text-xs px-2 py-1 rounded">
//                             Link
//                           </span>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                   {item.files.length > 0 && (
//                     <div className="mt-2 grid grid-cols-2 gap-2">
//                       {item.files.map((file, idx) => (
//                         <div
//                           key={idx}
//                           className="relative cursor-pointer"
//                           onClick={() => handleFileClick(file)}
//                         >
//                           {file.type.startsWith('image/') && (
//                             <img src={file.url} alt={file.name} className="w-full h-24 object-cover rounded-md" />
//                           )}
//                           {file.type.startsWith('video/') && (
//                             <div className="w-full h-24 bg-gray-100 rounded-md flex items-center justify-center">
//                               <video src={file.url} className="w-full h-full object-cover" muted playsInline />
//                             </div>
//                           )}
//                           {!file.type.startsWith('image/') && !file.type.startsWith('video/') && (
//                             <div className="flex flex-col items-center bg-gray-100 p-2 rounded-md">
//                               <img src={file.icon} alt="File Preview" className="w-12 h-12 object-contain" />
//                               <span className="mt-1 text-xs text-gray-600 truncate">{file.name}</span>
//                               <span className="text-xs text-gray-500">{file.size}</span>
//                             </div>
//                           )}
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))
//           ) : (
//             <p className="col-span-3 text-center text-gray-500">No resources available for this category.</p>
//           )}
//         </div>
//       )}

//       {/* Upload Modal */}
//       {showModal && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-y-auto">
//           <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto my-8">
//             <h2 className="text-2xl font-bold mb-4">Add New Resource</h2>
//             {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
//             <form onSubmit={handleSubmit}>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700">Category</label>
//                 <select
//                   name="category"
//                   value={newContent.category}
//                   onChange={(e) => handleInputChange(e)}
//                   className="mt-1 block w-full rounded-md border-none bg-gray-100 p-2 focus:ring-0"
//                 >
//                   {tabs.map((tab) => (
//                     <option key={tab} value={tab}>
//                       {tab}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700">Resource Type</label>
//                 <select
//                   name="resourceType"
//                   value={newContent.resourceType}
//                   onChange={(e) => handleInputChange(e)}
//                   className="mt-1 block w-full rounded-md border-none bg-gray-100 p-2 focus:ring-0"
//                   required
//                 >
//                   <option value="" disabled>Select Resource Type</option>
//                   {resourceTypes[newContent.category].map((type) => (
//                     <option key={type} value={type}>
//                       {type}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700">Title</label>
//                 <input
//                   type="text"
//                   name="title"
//                   value={newContent.title}
//                   onChange={(e) => handleInputChange(e)}
//                   className="mt-1 block w-full rounded-md border-none bg-gray-100 p-2 focus:ring-0"
//                   required
//                 />
//               </div>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700">Description (up to 200 chars)</label>
//                 <textarea
//                   name="description"
//                   value={newContent.description}
//                   onChange={(e) => handleInputChange(e)}
//                   maxLength={200}
//                   className="mt-1 block w-full rounded-md border-none bg-gray-100 p-2 focus:ring-0"
//                   rows={3}
//                 />
//               </div>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700">Links/URLs</label>
//                 {newContent.links.map((link, index) => (
//                   <div key={index} className="flex items-center space-x-2 mb-2">
//                     <input
//                       type="url"
//                       name="link"
//                       value={link}
//                       onChange={(e) => handleInputChange(e, index)}
//                       className="mt-1 block w-full rounded-md border-none bg-gray-100 p-2 focus:ring-0"
//                       placeholder="Enter URL"
//                     />
//                     {newContent.links.length > 1 && (
//                       <button
//                         type="button"
//                         onClick={() => removeLinkInput(index)}
//                         className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
//                       >
//                         −
//                       </button>
//                     )}
//                   </div>
//                 ))}
//                 <button
//                   type="button"
//                   onClick={addLinkInput}
//                   className="relative mt-2 bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-purple-700 group"
//                 >
//                   +
//                   <span className="absolute left-full ml-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
//                     Add More
//                   </span>
//                 </button>
//               </div>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700">Cover Image</label>
//                 <input
//                   type="file"
//                   name="coverImage"
//                   accept="image/*"
//                   onChange={(e) => handleInputChange(e)}
//                   className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
//                 />
//                 {newContent.coverPreview && (
//                   <img src={newContent.coverPreview} alt="Cover Preview" className="mt-2 w-full h-32 object-cover rounded-md" />
//                 )}
//               </div>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700">
//                   Upload Files (PDF, DOC, PPT, XLSX, TXT, CSV, JSON, ZIP, Video, Image)
//                 </label>
//                 <input
//                   type="file"
//                   name="files"
//                   accept=".pdf,.doc,.docx,.ppt,.pptx,.xlsx,.txt,.csv,.json,.zip,video/*,image/*"
//                   multiple
//                   onChange={(e) => handleInputChange(e)}
//                   ref={fileInputRef}
//                   className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
//                 />
//                 {newContent.filePreviews.length > 0 && (
//                   <div className="mt-2 grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
//                     {newContent.filePreviews.map((preview, idx) => (
//                       <div key={idx} className="relative">
//                         {preview.type.startsWith('image/') && (
//                           <img src={preview.url} alt={preview.name} className="w-full h-24 object-cover rounded-md" />
//                         )}
//                         {preview.type.startsWith('video/') && (
//                           <div className="w-full h-24 bg-gray-100 rounded-md flex items-center justify-center">
//                             <video src={preview.url} className="w-full h-full object-cover" muted playsInline />
//                           </div>
//                         )}
//                         {!preview.type.startsWith('image/') && !preview.type.startsWith('video/') && (
//                           <div className="flex flex-col items-center bg-gray-100 p-2 rounded-md">
//                             <img src={preview.icon} alt="File Preview" className="w-12 h-12 object-contain" />
//                             <span className="mt-1 text-xs text-gray-600 truncate">{preview.name}</span>
//                             <span className="text-xs text-gray-500">{preview.size}</span>
//                           </div>
//                         )}
//                         <button
//                           onClick={() => removeFile(idx)}
//                           className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
//                         >
//                           −
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//               <div className="flex justify-end space-x-3">
//                 <button
//                   type="button"
//                   onClick={() => setShowModal(false)}
//                   className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
//                 >
//                   Add
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Preview Modal */}
//       {showPreviewModal && (selectedFile || selectedLink) && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-y-auto">
//           <div className="bg-white p-8 rounded-lg shadow-xl max-w-4xl w-full my-8">
//             <h2 className="text-2xl font-bold mb-4">Preview</h2>
//             <div className="max-h-[80vh] overflow-y-auto">
//               {selectedFile && (
//                 <>
//                   <h3 className="text-lg font-semibold mb-2">{selectedFile.name}</h3>
//                   {selectedFile.type.startsWith('image/') && (
//                     <img src={selectedFile.url} alt={selectedFile.name} className="w-full max-h-[80vh] object-contain" />
//                   )}
//                   {selectedFile.type.startsWith('video/') && (
//                     <video src={selectedFile.url} controls className="w-full max-h-[80vh]" autoPlay />
//                   )}
//                   {selectedFile.type === 'application/pdf' && (
//                     <iframe
//                       src={`${selectedFile.url}#zoom=fit`}
//                       title={selectedFile.name}
//                       className="w-full h-[80vh] border-none"
//                     />
//                   )}
//                   {(!selectedFile.type.startsWith('image/') &&
//                     !selectedFile.type.startsWith('video/') &&
//                     selectedFile.type !== 'application/pdf') && (
//                     <div className="flex flex-col items-center bg-gray-100 p-4 rounded-md">
//                       <img src={selectedFile.icon} alt="File Preview" className="w-16 h-16 object-contain mb-2" />
//                       <span className="text-sm text-gray-600">{selectedFile.name}</span>
//                       <span className="text-sm text-gray-500">Size: {selectedFile.size}</span>
//                       <button
//                         onClick={() => handleDownload(selectedFile)}
//                         className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
//                       >
//                         Download
//                       </button>
//                     </div>
//                   )}
//                 </>
//               )}
//               {selectedLink && (
//                 <>
//                   <h3 className="text-lg font-semibold mb-2">{selectedLink}</h3>
//                   {isYouTubeLink(selectedLink) ? (
//                     <iframe
//                       src={getYouTubeEmbedUrl(selectedLink)}
//                       title="YouTube video player"
//                       frameBorder="0"
//                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                       allowFullScreen
//                       className="w-full h-[80vh]"
//                     />
//                   ) : (
//                     <a href={selectedLink} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
//                       Open Link in New Tab
//                     </a>
//                   )}
//                 </>
//               )}
//             </div>
//             <div className="flex justify-end mt-4">
//               <button
//                 onClick={() => setShowPreviewModal(false)}
//                 className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PartnerResources;

// import axios from 'axios';
// import React, { useState, useRef, useEffect } from 'react';

// const PartnerResources = () => {
//   const [activeTab, setActiveTab] = useState('Sales and Marketing');
//   const [content, setContent] = useState({
//     'Sales and Marketing': [],
//     'Training Resources': [],
//     'Support & Communications': [],
//   });
//   const [showModal, setShowModal] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);
//   const [editResourceId, setEditResourceId] = useState(null);
//   const [showPreviewModal, setShowPreviewModal] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [selectedLink, setSelectedLink] = useState(null);
//   const [newContent, setNewContent] = useState({
//     category: 'Sales and Marketing',
//     resourceType: '',
//     title: '',
//     description: '',
//     links: [''],
//     coverImage: null,
//     files: [],
//     coverPreview: '',
//     filePreviews: [],
//   });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(true);
//   const fileInputRef = useRef(null);

//   const tabs = ['Sales and Marketing', 'Training Resources', 'Support & Communications'];
//   const MAX_FILES = 5;

//   const resourceTypes = {
//     'Sales and Marketing': [
//       'Product Presentations',
//       'Case Studies',
//       'Brochures & Data Sheets',
//       'Marketing Collateral',
//       'Competitive Analysis',
//     ],
//     'Training Resources': [
//       'Onboarding Guides',
//       'Troubleshooting Guides',
//       'Technical Docs',
//       'FAQs',
//       'Webinar',
//     ],
//     'Support & Communications': [
//       'Leads',
//       'Partner Manager Contact Info',
//       'Newsletters',
//     ],
//   };

//   // Fetch resources on component mount
//   useEffect(() => {
//     const fetchResources = async () => {
//       try {
//         setLoading(true);
//         const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/resources/getresources`, {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem('token')}`,
//           },
//         });
//         // Group resources by category
//         const groupedContent = {
//           'Sales and Marketing': [],
//           'Training Resources': [],
//           'Support & Communications': [],
//         };

//         res.data.forEach((resource) => {
//           let parsedLinks = [];
//           try {
//             if (typeof resource.links === "string") {
//               parsedLinks = JSON.parse(resource.links);
//             } else if (Array.isArray(resource.links)) {
//               parsedLinks = resource.links;
//             }
//           } catch (err) {
//             parsedLinks = [];
//           }
//           const formattedResource = {
//             ...resource,
//             coverImage: resource.coverImage
//               ? `${process.env.NEXT_PUBLIC_API_URL}${resource.coverImage}`
//               : null,
//             files: resource.files.map((file) => ({
//               name: file.fileName,
//               url: `${process.env.NEXT_PUBLIC_API_URL}${file.filePath}`,
//               type: file.fileType,
//               size: (file.fileSize / 1024).toFixed(2) + ' KB',
//             })),
//             links: parsedLinks,
//             linkThumbnails: parsedLinks.map((link) => ({
//               url: link,
//               thumbnail: getLinkThumbnail(link),
//             })),
//           };
//           if (groupedContent[resource.category]) {
//             groupedContent[resource.category].push(formattedResource);
//           }
//         });
//         setContent(groupedContent);
//         setLoading(false);
//       } catch (err) {
//         setError('Failed to fetch resources.');
//         setLoading(false);
//       }
//     };

//     fetchResources();
//   }, []);

//   const handleTabChange = (tab) => {
//     setActiveTab(tab);
//     setNewContent({ ...newContent, category: tab, resourceType: '' });
//   };

//   const handleInputChange = (e, index) => {
//     const { name, value, files } = e.target;
//     if (name === 'coverImage' && files[0]) {
//       compressImage(files[0], (compressed) => {
//         const preview = URL.createObjectURL(compressed);
//         setNewContent({
//           ...newContent,
//           coverImage: compressed,
//           coverPreview: preview,
//         });
//       });
//     } else if (name === 'files') {
//       const selectedFiles = Array.from(files);
//       if (newContent.files.length + selectedFiles.length > MAX_FILES) {
//         setError(`Maximum ${MAX_FILES} files allowed.`);
//         return;
//       }
//       const previews = selectedFiles.map((file) => getFilePreview(file));
//       setNewContent({
//         ...newContent,
//         files: [...newContent.files, ...selectedFiles],
//         filePreviews: [...newContent.filePreviews, ...previews],
//       });
//       setError('');
//       fileInputRef.current.value = null;
//     } else if (name === 'link') {
//       const updatedLinks = [...newContent.links];
//       updatedLinks[index] = value;
//       setNewContent({ ...newContent, links: updatedLinks });
//     } else {
//       setNewContent({ ...newContent, [name]: value });
//     }
//   };

//   const addLinkInput = () => {
//     setNewContent({ ...newContent, links: [...newContent.links, ''] });
//   };

//   const removeLinkInput = (index) => {
//     const updatedLinks = newContent.links.filter((_, i) => i !== index);
//     setNewContent({ ...newContent, links: updatedLinks });
//   };

//   const compressImage = (file, callback) => {
//     if (!file.type.startsWith('image/')) {
//       callback(file);
//       return;
//     }

//     const img = new Image();
//     img.src = URL.createObjectURL(file);

//     img.onload = () => {
//       const canvas = document.createElement('canvas');
//       const ctx = canvas.getContext('2d');
//       const maxWidth = 800;
//       const maxHeight = 800;
//       let width = img.width;
//       let height = img.height;

//       if (width > height) {
//         if (width > maxWidth) {
//           height *= maxWidth / width;
//           width = maxWidth;
//         }
//       } else {
//         if (height > maxHeight) {
//           width *= maxHeight / height;
//           height = maxHeight;
//         }
//       }

//       canvas.width = width;
//       canvas.height = height;
//       ctx.drawImage(img, 0, 0, width, height);

//       canvas.toBlob(
//         (blob) => {
//           if (blob) {
//             const compressedFile = new File([blob], file.name, {
//               type: 'image/jpeg',
//               lastModified: Date.now(),
//             });
//             callback(compressedFile);
//           }
//         },
//         'image/jpeg',
//         0.7
//       );
//     };
//   };

//   const getFileIcon = (type) => {
//     if (type === 'application/pdf') return '/pdf-icon.png';
//     if (type.includes('word') || type.includes('msword')) return '/word-icon.png';
//     if (type.includes('spreadsheet') || type.includes('ms-excel')) return '/excel-icon.png';
//     if (type.includes('presentation') || type.includes('ms-powerpoint')) return '/ppt-icon.png';
//     if (type === 'text/plain') return '/txt-icon.png';
//     if (type === 'text/csv') return '/csv-icon.png';
//     if (type === 'application/json') return '/json-icon.png';
//     if (type === 'application/zip') return '/zip-icon.png';
//     return '/file-icon.png';
//   };

//   const getFilePreview = (file) => {
//     const type = file.type;
//     const url = URL.createObjectURL(file);
//     const size = (file.size / 1024).toFixed(2) + ' KB';
//     const icon = getFileIcon(type);
//     return { type, url, name: file.name, size, icon };
//   };

//   const removeFile = (index) => {
//     const updatedFiles = newContent.files.filter((_, i) => i !== index);
//     const updatedPreviews = newContent.filePreviews.filter((_, i) => i !== index);
//     setNewContent({
//       ...newContent,
//       files: updatedFiles,
//       filePreviews: updatedPreviews,
//     });
//     setError('');
//   };

//   const handleFileClick = (file) => {
//     setSelectedFile(file);
//     setSelectedLink(null);
//     setShowPreviewModal(true);
//   };

//   const handleLinkClick = (link) => {
//     setSelectedLink(link);
//     setSelectedFile(null);
//     setShowPreviewModal(true);
//   };

//   const handleDownload = (file) => {
//     const link = document.createElement('a');
//     link.href = file.url;
//     link.download = file.name;
//     link.click();
//   };

//   const isYouTubeLink = (link) => {
//     return link && (link.includes('youtube.com') || link.includes('youtu.be'));
//   };

//   const getYouTubeVideoId = (link) => {
//     const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
//     const match = link.match(regExp);
//     return match && match[2].length === 11 ? match[2] : null;
//   };

//   const getYouTubeEmbedUrl = (link) => {
//     const videoId = getYouTubeVideoId(link);
//     return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
//   };

//   const getLinkThumbnail = (link) => {
//     if (isYouTubeLink(link)) {
//       const videoId = getYouTubeVideoId(link);
//       return `https://img.youtube.com/vi/${videoId}/0.jpg`;
//     }
//     return '/link-icon.png';
//   };

//   const handleEdit = (resource) => {
//     setIsEditing(true);
//     setEditResourceId(resource.resourceId);
//     setNewContent({
//       category: resource.category,
//       resourceType: resource.resourceType,
//       title: resource.title,
//       description: resource.description,
//       links: resource.links.length > 0 ? resource.links : [''],
//       coverImage: null,
//       files: [],
//       coverPreview: resource.coverImage || '',
//       filePreviews: resource.files,
//     });
//     setShowModal(true);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!newContent.title) {
//       setError('Title is required.');
//       return;
//     }
//     if (!newContent.resourceType) {
//       setError('Resource Type is required.');
//       return;
//     }
//     try {
//       const formData = new FormData();
//       formData.append('category', newContent.category);
//       formData.append('resourceType', newContent.resourceType);
//       formData.append('title', newContent.title);
//       formData.append('description', newContent.description);
//       // formData.append('links', JSON.stringify(newContent.links));
//       if (newContent.coverImage) {
//         formData.append('ResourceCoverImage', newContent.coverImage);
//       }

//       if (newContent.links && newContent.links.some(link => link.trim() !== '')) {
//         formData.append('links', JSON.stringify(newContent.links));
//       } else {
//         formData.append('links', null); // ya formData.append('links', JSON.stringify(null));
//       }

//       newContent.files.forEach((file) => formData.append('ResourceFiles', file));
//       if (isEditing) {
//       const existingFiles = newContent.filePreviews
//         .filter(f => f.url && !f.file) // sirf purani file ka reference
//         .map(f => ({
//           fileName: f.name,
//           filePath: f.url.replace(process.env.NEXT_PUBLIC_API_URL, ''),
//           fileType: f.type,
//           fileSize: parseFloat(f.size),
//         }));
//       formData.append('files', JSON.stringify(existingFiles));
//     }
    
//       let res;
//       if (isEditing) {
//         // Update resource
//         res = await axios.put(
//           `${process.env.NEXT_PUBLIC_API_URL}/api/resources/updateResource/${editResourceId}`,
//           formData,
//           {
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem('token')}`,
//               'Content-Type': 'multipart/form-data',
//             },
//           }
//         );
//       } else {
//         // Create new resource
//         res = await axios.post(
//           `${process.env.NEXT_PUBLIC_API_URL}/api/resources/createResource`,
//           formData,
//           {
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem('token')}`,
//               'Content-Type': 'multipart/form-data',
//             },
//           }
//         );
//       }

//       let parsedLinks = [];
//       try {
//         if (typeof res.data.links === "string") {
//           parsedLinks = JSON.parse(res.data.links);
//         } else if (Array.isArray(res.data.links)) {
//           parsedLinks = res.data.links;
//         }
//       } catch (err) {
//         parsedLinks = [];
//       }
//       const newResource = {
//         ...res.data,
//         coverImage: res.data.coverImage
//           ? `${process.env.NEXT_PUBLIC_API_URL}${res.data.coverImage}`
//           : null,
//         files: res.data.files.map((file) => ({
//           name: file.fileName,
//           url: `${process.env.NEXT_PUBLIC_API_URL}${file.filePath}`,
//           type: file.fileType,
//           size: (file.fileSize / 1024).toFixed(2) + ' KB',
//         })),
//         links: parsedLinks,
//         linkThumbnails: parsedLinks.map((link) => ({
//           url: link,
//           thumbnail: getLinkThumbnail(link),
//         })),
//       };

//       if (isEditing) {
//         setContent({
//           ...content,
//           [newContent.category]: content[newContent.category].map((item) =>
//             item.resourceId === editResourceId ? newResource : item
//           ),
//         });
//       } else {
//         setContent({
//           ...content,
//           [newContent.category]: [...content[newContent.category], newResource],
//         });
//       }

//       setNewContent({
//         category: 'Sales and Marketing',
//         resourceType: '',
//         title: '',
//         description: '',
//         links: [''],
//         coverImage: null,
//         files: [],
//         coverPreview: '',
//         filePreviews: [],
//       });
//       setShowModal(false);
//       setIsEditing(false);
//       setEditResourceId(null);
//       setError('');
//     } catch (err) {
//       setError(isEditing ? 'Failed to update resource.' : 'Failed to upload resource.');
//     }
//   };

//   return (
//     <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold text-gray-800">Partner Resources</h1>
//         <button
//           onClick={() => {
//             setIsEditing(false);
//             setNewContent({
//               category: 'Sales and Marketing',
//               resourceType: '',
//               title: '',
//               description: '',
//               links: [''],
//               coverImage: null,
//               files: [],
//               coverPreview: '',
//               filePreviews: [],
//             });
//             setShowModal(true);
//           }}
//           className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
//         >
//           Add Resource
//         </button>
//       </div>

//       {/* Tab Navigation */}
//       <div className="flex border-b border-gray-300 mb-6">
//         {tabs.map((tab) => (
//           <button
//             key={tab}
//             className={`px-6 py-3 font-medium text-sm transition-colors ${
//               activeTab === tab
//                 ? 'border-b-2 border-purple-600 text-purple-600'
//                 : 'text-gray-600 hover:text-purple-600'
//             }`}
//             onClick={() => handleTabChange(tab)}
//           >
//             {tab}
//           </button>
//         ))}
//       </div>

//       {/* Loading State */}
//       {loading ? (
//         <p className="text-center text-gray-500">Loading resources...</p>
//       ) : (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {content[activeTab].length > 0 ? (
//             content[activeTab].map((item, index) => (
//               <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden relative">
//                 {item.coverImage && (
//                   <img src={item.coverImage} alt="Cover" className="w-full h-40 object-cover" />
//                 )}
//                 <div className="p-4">
//                   <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
//                   <span className="inline-block bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded mb-2">
//                     {item.resourceType}
//                   </span>
//                   <p className="text-sm text-gray-600 mb-2">{item.description}</p>
//                   {item.linkThumbnails && item.linkThumbnails.length > 0 && (
//                     <div className="mt-2 grid grid-cols-2 gap-2 mb-2">
//                       {item.linkThumbnails.map((link, idx) => (
//                         <div
//                           key={idx}
//                           className="relative cursor-pointer"
//                           onClick={() => handleLinkClick(link.url)}
//                         >
//                           <img
//                             src={link.thumbnail}
//                             alt="Link Thumbnail"
//                             className="w-full h-24 object-cover rounded-md"
//                           />
//                           <span className="absolute bottom-1 left-1 bg-purple-600 text-white text-xs px-2 py-1 rounded">
//                             Link
//                           </span>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                   {item.files.length > 0 && (
//                     <div className="mt-2 grid grid-cols-2 gap-2">
//                       {item.files.map((file, idx) => (
//                         <div
//                           key={idx}
//                           className="relative cursor-pointer"
//                           onClick={() => handleFileClick(file)}
//                         >
//                           {file.type.startsWith('image/') && (
//                             <img src={file.url} alt={file.name} className="w-full h-24 object-cover rounded-md" />
//                           )}
//                           {file.type.startsWith('video/') && (
//                             <div className="w-full h-24 bg-gray-100 rounded-md flex items-center justify-center">
//                               <video src={file.url} className="w-full h-full object-cover" muted playsInline />
//                             </div>
//                           )}
//                           {!file.type.startsWith('image/') && !file.type.startsWith('video/') && (
//                             <div className="flex flex-col items-center bg-gray-100 p-2 rounded-md">
//                               <img src={file.icon} alt="File Preview" className="w-12 h-12 object-contain" />
//                               <span className="mt-1 text-xs text-gray-600 truncate">{file.name}</span>
//                               <span className="text-xs text-gray-500">{file.size}</span>
//                             </div>
//                           )}
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//                 <button
//                   onClick={() => handleEdit(item)}
//                   className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600"
//                 >
//                   Edit
//                 </button>
//               </div>
//             ))
//           ) : (
//             <p className="col-span-3 text-center text-gray-500">No resources available for this category.</p>
//           )}
//         </div>
//       )}

//       {/* Upload/Edit Modal */}
//       {showModal && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-y-auto">
//           <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto my-8">
//             <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Edit Resource' : 'Add New Resource'}</h2>
//             {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
//             <form onSubmit={handleSubmit}>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700">Category</label>
//                 <select
//                   name="category"
//                   value={newContent.category}
//                   onChange={(e) => handleInputChange(e)}
//                   className="mt-1 block w-full rounded-md border-none bg-gray-100 p-2 focus:ring-0"
//                 >
//                   {tabs.map((tab) => (
//                     <option key={tab} value={tab}>
//                       {tab}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700">Resource Type</label>
//                 <select
//                   name="resourceType"
//                   value={newContent.resourceType}
//                   onChange={(e) => handleInputChange(e)}
//                   className="mt-1 block w-full rounded-md border-none bg-gray-100 p-2 focus:ring-0"
//                   required
//                 >
//                   <option value="" disabled>Select Resource Type</option>
//                   {resourceTypes[newContent.category].map((type) => (
//                     <option key={type} value={type}>
//                       {type}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700">Title</label>
//                 <input
//                   type="text"
//                   name="title"
//                   value={newContent.title}
//                   onChange={(e) => handleInputChange(e)}
//                   className="mt-1 block w-full rounded-md border-none bg-gray-100 p-2 focus:ring-0"
//                   required
//                 />
//               </div>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700">Description (up to 200 chars)</label>
//                 <textarea
//                   name="description"
//                   value={newContent.description}
//                   onChange={(e) => handleInputChange(e)}
//                   maxLength={200}
//                   className="mt-1 block w-full rounded-md border-none bg-gray-100 p-2 focus:ring-0"
//                   rows={3}
//                 />
//               </div>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700">Links/URLs</label>
//                 {newContent.links.map((link, index) => (
//                   <div key={index} className="flex items-center space-x-2 mb-2">
//                     <input
//                       type="url"
//                       name="link"
//                       value={link}
//                       onChange={(e) => handleInputChange(e, index)}
//                       className="mt-1 block w-full rounded-md border-none bg-gray-100 p-2 focus:ring-0"
//                       placeholder="Enter URL"
//                     />
//                     {newContent.links.length > 1 && (
//                       <button
//                         type="button"
//                         onClick={() => removeLinkInput(index)}
//                         className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
//                       >
//                         −
//                       </button>
//                     )}
//                   </div>
//                 ))}
//                 <button
//                   type="button"
//                   onClick={addLinkInput}
//                   className="relative mt-2 bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-purple-700 group"
//                 >
//                   +
//                   <span className="absolute left-full ml-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
//                     Add More
//                   </span>
//                 </button>
//               </div>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700">Cover Image</label>
//                 <input
//                   type="file"
//                   name="coverImage"
//                   accept="image/*"
//                   onChange={(e) => handleInputChange(e)}
//                   className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
//                 />
//                 {newContent.coverPreview && (
//                   <img src={newContent.coverPreview} alt="Cover Preview" className="mt-2 w-full h-32 object-cover rounded-md" />
//                 )}
//               </div>
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700">
//                   Upload Files (PDF, DOC, PPT, XLSX, TXT, CSV, JSON, ZIP, Video, Image)
//                 </label>
//                 <input
//                   type="file"
//                   name="files"
//                   accept=".pdf,.doc,.docx,.ppt,.pptx,.xlsx,.txt,.csv,.json,.zip,video/*,image/*"
//                   multiple
//                   onChange={(e) => handleInputChange(e)}
//                   ref={fileInputRef}
//                   className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
//                 />
//                 {newContent.filePreviews.length > 0 && (
//                   <div className="mt-2 grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
//                     {newContent.filePreviews.map((preview, idx) => (
//                       <div key={idx} className="relative">
//                         {preview.type.startsWith('image/') && (
//                           <img src={preview.url} alt={preview.name} className="w-full h-24 object-cover rounded-md" />
//                         )}
//                         {preview.type.startsWith('video/') && (
//                           <div className="w-full h-24 bg-gray-100 rounded-md flex items-center justify-center">
//                             <video src={preview.url} className="w-full h-full object-cover" muted playsInline />
//                           </div>
//                         )}
//                         {!preview.type.startsWith('image/') && !preview.type.startsWith('video/') && (
//                           <div className="flex flex-col items-center bg-gray-100 p-2 rounded-md">
//                             <img src={preview.icon} alt="File Preview" className="w-12 h-12 object-contain" />
//                             <span className="mt-1 text-xs text-gray-600 truncate">{preview.name}</span>
//                             <span className="text-xs text-gray-500">{preview.size}</span>
//                           </div>
//                         )}
//                         <button
//                           onClick={() => removeFile(idx)}
//                           className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
//                         >
//                           −
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//               <div className="flex justify-end space-x-3">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowModal(false);
//                     setIsEditing(false);
//                     setEditResourceId(null);
//                   }}
//                   className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
//                 >
//                   {isEditing ? 'Update' : 'Add'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Preview Modal */}
//       {showPreviewModal && (selectedFile || selectedLink) && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-y-auto">
//           <div className="bg-white p-8 rounded-lg shadow-xl max-w-4xl w-full my-8">
//             <h2 className="text-2xl font-bold mb-4">Preview</h2>
//             <div className="max-h-[80vh] overflow-y-auto">
//               {selectedFile && (
//                 <>
//                   <h3 className="text-lg font-semibold mb-2">{selectedFile.name}</h3>
//                   {selectedFile.type.startsWith('image/') && (
//                     <img src={selectedFile.url} alt={selectedFile.name} className="w-full max-h-[80vh] object-contain" />
//                   )}
//                   {selectedFile.type.startsWith('video/') && (
//                     <video src={selectedFile.url} controls className="w-full max-h-[80vh]" autoPlay />
//                   )}
//                   {selectedFile.type === 'application/pdf' && (
//                     <iframe
//                       src={`${selectedFile.url}#zoom=fit`}
//                       title={selectedFile.name}
//                       className="w-full h-[80vh] border-none"
//                     />
//                   )}
//                   {(!selectedFile.type.startsWith('image/') &&
//                     !selectedFile.type.startsWith('video/') &&
//                     selectedFile.type !== 'application/pdf') && (
//                     <div className="flex flex-col items-center bg-gray-100 p-4 rounded-md">
//                       <img src={selectedFile.icon} alt="File Preview" className="w-16 h-16 object-contain mb-2" />
//                       <span className="text-sm text-gray-600">{selectedFile.name}</span>
//                       <span className="text-sm text-gray-500">Size: {selectedFile.size}</span>
//                       <button
//                         onClick={() => handleDownload(selectedFile)}
//                         className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
//                       >
//                         Download
//                       </button>
//                     </div>
//                   )}
//                 </>
//               )}
//               {selectedLink && (
//                 <>
//                   <h3 className="text-lg font-semibold mb-2">{selectedLink}</h3>
//                   {isYouTubeLink(selectedLink) ? (
//                     <iframe
//                       src={getYouTubeEmbedUrl(selectedLink)}
//                       title="YouTube video player"
//                       frameBorder="0"
//                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                       allowFullScreen
//                       className="w-full h-[80vh]"
//                     />
//                   ) : (
//                     <a href={selectedLink} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
//                       Open Link in New Tab
//                     </a>
//                   )}
//                 </>
//               )}
//             </div>
//             <div className="flex justify-end mt-4">
//               <button
//                 onClick={() => setShowPreviewModal(false)}
//                 className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PartnerResources;

import axios from 'axios';
import React, { useState, useRef, useEffect } from 'react';

const PartnerResources = () => {
  const [activeTab, setActiveTab] = useState('Sales and Marketing');
  const [content, setContent] = useState({
    'Sales and Marketing': [],
    'Training Resources': [],
    'Support & Communications': [],
  });
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editResourceId, setEditResourceId] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedLink, setSelectedLink] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newContent, setNewContent] = useState({
    category: 'Sales and Marketing',
    resourceType: '',
    title: '',
    description: '',
    links: [''],
    coverImage: null,
    files: [],
    coverPreview: '',
    filePeviews: [],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  const tabs = ['Sales and Marketing', 'Training Resources', 'Support & Communications'];
  const MAX_FILES = 5;

  const resourceTypes = {
    'Sales and Marketing': [
      'Product Presentations',
      'Case Studies',
      'Brochures & Data Sheets',
      'Marketing Collateral',
      'Competitive Analysis',
    ],
    'Training Resources': [
      'Onboarding Guides',
      'Troubleshooting Guides',
      'Technical Docs',
      'FAQs',
      'Webinar',
    ],
    'Support & Communications': [
      'Leads',
      'Partner Manager Contact Info',
      'Newsletters',
    ],
  };

  // Custom SVG icons (replace URLs or inlineSvg with your own)
  const fileIcons = {
    'application/pdf': {
      url: '/icons/pdfs-icon.svg', // Your custom PDF SVG
      color: 'text-red-500',
      inlineSvg: null, // Example: <path d="M12 2v20M2 12h20" />
    },
    'application/msword': {
      url: '/icons/doc-icon.svg',
      color: 'text-blue-600',
      inlineSvg: null,
    },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
      url: '/icons/doc-icon.svg',
      color: 'text-blue-600',
      inlineSvg: null,
    },
    'application/vnd.ms-excel': {
      url: '/icons/excel-icon.svg',
      color: 'text-green-600',
      inlineSvg: null,
    },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
      url: '/icons/excel-icon.svg',
      color: 'text-green-600',
      inlineSvg: null,
    },
    'application/vnd.ms-powerpoint': {
      url: '/icons/ppt-icon.svg',
      color: 'text-orange-500',
      inlineSvg: null,
    },
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
      url: '/icons/ppt-icon.svg',
      color: 'text-orange-500',
      inlineSvg: null,
    },
    'text/plain': {
      url: '/icons/txt-icon.svg',
      color: 'text-gray-500',
      inlineSvg: null,
    },
    'text/csv': {
      url: '/icons/csv-icon.svg',
      color: 'text-teal-500',
      inlineSvg: null,
    },
    'application/json': {
      url: '/icons/json-icon.svg',
      color: 'text-purple-500',
      inlineSvg: null,
    },
    'application/zip': {
      url: '/icons/zip-icon.svg',
      color: 'text-yellow-500',
      inlineSvg: null,
    },
    'image': {
      url: '/icons/image-icon.svg',
      color: 'text-pink-500',
      inlineSvg: null,
    },
    'video': {
      url: '/icons/video-icon.svg',
      color: 'text-indigo-500',
      inlineSvg: null,
    },
    default: {
      url: '/icons/file-icon.svg',
      color: 'text-gray-400',
      inlineSvg: null,
    },
  };

  // Fetch resources on component mount
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/resources/getresources`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const groupedContent = {
          'Sales and Marketing': [],
          'Training Resources': [],
          'Support & Communications': [],
        };

        res.data.forEach((resource) => {
      let parsedLinks: string[] = [];

        try {
          if (typeof res.data.links === "string") {
            const parsed = JSON.parse(res.data.links || "[]");
            parsedLinks = Array.isArray(parsed) ? parsed : [];
          } else if (Array.isArray(res.data.links)) {
            parsedLinks = res.data.links;
          }
        } catch {
          parsedLinks = [];
        }
          const formattedResource = {
            ...resource,
            coverImage: resource.coverImage
              ? `${process.env.NEXT_PUBLIC_API_URL}${resource.coverImage}`
              : null,
            files: resource.files.map((file) => ({
              name: file.fileName,
              url: `${process.env.NEXT_PUBLIC_API_URL}${file.filePath}`,
              type: file.fileType,
              size: (file.fileSize / 1024).toFixed(2) + ' KB',
              iconUrl: getFileIcon(file.fileType).url,
              color: getFileIcon(file.fileType).color,
              inlineSvg: getFileIcon(file.fileType).inlineSvg,
            })),
            links: parsedLinks,
            linkThumbnails: parsedLinks.map((link) => ({
              url: link,
              thumbnail: getLinkThumbnail(link),
            })),
          };
          if (groupedContent[resource.category]) {
            groupedContent[resource.category].push(formattedResource);
          }
        });
        setContent(groupedContent);
        setLoading(false);
      } catch (err) {
        // setError('Failed to fetch resources.');
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setNewContent({ ...newContent, category: tab, resourceType: '' });
  };

  // const handleInputChange = (e, index) => {
  //   const { name, value, files } = e.target;
  //   if (name === 'coverImage' && files[0]) {
  //     compressImage(files[0], (compressed) => {
  //       const preview = URL.createObjectURL(compressed);
  //       setNewContent({
  //         ...newContent,
  //         coverImage: compressed,
  //         coverPreview: preview,
  //       });
  //     });
  //   } else if (name === 'files') {
  //     const selectedFiles = Array.from(files);
  //     if (newContent.files.length + selectedFiles.length > MAX_FILES) {
  //       setError(`Maximum ${MAX_FILES} files allowed.`);
  //       return;
  //     }
  //     const previews = selectedFiles.map((file) => getFilePreview(file));
  //     setNewContent({
  //       ...newContent,
  //       files: [...newContent.files, ...selectedFiles],
  //       filePreviews: [...newContent.filePreviews, ...previews],
  //     });
  //     setError('');
  //     fileInputRef.current.value = null;
  //   } else if (name === 'link') {
  //     const updatedLinks = [...newContent.links];
  //     updatedLinks[index] = value;
  //     setNewContent({ ...newContent, links: updatedLinks });
  //   } else {
  //     setNewContent({ ...newContent, [name]: value });
  //   }
  // };

  const handleInputChange = (e, index) => {
  const { name, value, files } = e.target;
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB in bytes

  if (name === 'coverImage' && files[0]) {
    if (files[0].size > MAX_FILE_SIZE) {
      setError('Cover image must be less than 50 MB.');
      return;
    }
    compressImage(files[0], (compressed) => {
      const preview = URL.createObjectURL(compressed);
      setNewContent({
        ...newContent,
        coverImage: compressed,
        coverPreview: preview,
      });
    });
  } else if (name === 'files') {
    const selectedFiles = Array.from(files);
    // Check file size for each selected file
    const oversizedFiles = selectedFiles.filter((file) => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      setError('All files must be less than 50 MB.');
      return;
    }
    if (newContent.files.length + selectedFiles.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} files allowed.`);
      return;
    }
    const previews = selectedFiles.map((file) => getFilePreview(file));
    setNewContent({
      ...newContent,
      files: [...newContent.files, ...selectedFiles],
      filePreviews: [...newContent.filePreviews, ...previews],
    });
    setError('');
    fileInputRef.current.value = null;
  } else if (name === 'link') {
    const updatedLinks = [...newContent.links];
    updatedLinks[index] = value;
    setNewContent({ ...newContent, links: updatedLinks });
  } else {
    setNewContent({ ...newContent, [name]: value });
  }
};

  const addLinkInput = () => {
    setNewContent({ ...newContent, links: [...newContent.links, ''] });
  };

  const removeLinkInput = (index) => {
    const updatedLinks = newContent.links.filter((_, i) => i !== index);
    setNewContent({ ...newContent, links: updatedLinks });
  };

  const compressImage = (file, callback) => {
    if (!file.type.startsWith('image/')) {
      callback(file);
      return;
    }

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const maxWidth = 800;
      const maxHeight = 800;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            callback(compressedFile);
          }
        },
        'image/jpeg',
        0.7
      );
    };
  };

  const getFileIcon = (type) => {
    if (type === 'application/pdf') return fileIcons['application/pdf'];
    if (type.includes('word') || type.includes('msword')) return fileIcons['application/msword'];
    if (type.includes('spreadsheet') || type.includes('ms-excel')) return fileIcons['application/vnd.ms-excel'];
    if (type.includes('presentation') || type.includes('ms-powerpoint')) return fileIcons['application/vnd.ms-powerpoint'];
    if (type === 'text/plain') return fileIcons['text/plain'];
    if (type === 'text/csv') return fileIcons['text/csv'];
    if (type === 'application/json') return fileIcons['application/json'];
    if (type === 'application/zip') return fileIcons['application/zip'];
    if (type.startsWith('image/')) return fileIcons['image'];
    if (type.startsWith('video/')) return fileIcons['video'];
    return fileIcons['default'];
  };

  const getFilePreview = (file) => {
    const type = file.type;
    const url = URL.createObjectURL(file);
    const size = (file.size / 1024).toFixed(2) + ' KB';
    const { iconUrl, color, inlineSvg } = getFileIcon(type);
    return { type, url, name: file.name, size, iconUrl, color, inlineSvg };
  };

  const removeFile = (index) => {
    const updatedFiles = newContent.files.filter((_, i) => i !== index);
    const updatedPreviews = newContent.filePreviews.filter((_, i) => i !== index);
    setNewContent({
      ...newContent,
      files: updatedFiles,
      filePreviews: updatedPreviews,
    });
    setError('');
  };

  const handleFileClick = (file) => {
    setSelectedFile(file);
    setSelectedLink(null);
    setShowPreviewModal(true);
  };

  const handleLinkClick = (link) => {
    setSelectedLink(link);
    setSelectedFile(null);
    setShowPreviewModal(true);
  };

  const handleDownload = (file) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
  };

  const isYouTubeLink = (link) => {
    return link && (link.includes('youtube.com') || link.includes('youtu.be'));
  };

  const getYouTubeVideoId = (link) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = link.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const getYouTubeEmbedUrl = (link) => {
    const videoId = getYouTubeVideoId(link);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const getLinkThumbnail = (link) => {
    if (isYouTubeLink(link)) {
      const videoId = getYouTubeVideoId(link);
      return `https://img.youtube.com/vi/${videoId}/0.jpg`;
    }
    return '/icons/link-icon.svg';
  };

  const handleEdit = (resource) => {
    setIsEditing(true);
    setEditResourceId(resource.resourceId);
    setNewContent({
      category: resource.category,
      resourceType: resource.resourceType,
      title: resource.title,
      description: resource.description,
      links: resource.links.length > 0 ? resource.links : [''],
      coverImage: null,
      files: [],
      coverPreview: resource.coverImage || '',
      filePreviews: resource.files,
    });
    setShowModal(true);
  };

  const handleDelete = async (resourceId, category) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/resources/deleteResource/${resourceId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setContent({
        ...content,
        [category]: content[category].filter((item) => item.resourceId !== resourceId),
      });
    } catch (err) {
      setError('Failed to delete resource.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newContent.title) {
      setError('Title is required.');
      return;
    }
    if (!newContent.resourceType) {
      setError('Resource Type is required.');
      return;
    }
    if(error){
      return
    }
    try {
      setLoading(true); // Set loading state
      setError('');
      const formData = new FormData();
      formData.append('category', newContent.category);
      formData.append('resourceType', newContent.resourceType);
      formData.append('title', newContent.title);
      formData.append('description', newContent.description);
      if (newContent.coverImage) {
        formData.append('ResourceCoverImage', newContent.coverImage);
      }
      if (newContent.links && newContent.links.some((link) => link.trim() !== '')) {
        formData.append('links', JSON.stringify(newContent.links));
      } else {
        formData.append('links', null);
      }
      newContent.files.forEach((file) => formData.append('ResourceFiles', file));
      if (isEditing) {
        const existingFiles = newContent.filePreviews
          .filter((f) => f.url && !f.file)
          .map((f) => ({
            fileName: f.name,
            filePath: f.url.replace(process.env.NEXT_PUBLIC_API_URL, ''),
            fileType: f.type,
            fileSize: parseFloat(f.size.replace(' KB', '')) * 1024,
          }));
        formData.append('files', JSON.stringify(existingFiles));
      }

      let res;
      if (isEditing) {
        res = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/api/resources/updateResource/${editResourceId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } else {
        res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/resources/createResource`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      }

     let parsedLinks: string[] = [];

        try {
          if (typeof res.data.links === "string") {
            const parsed = JSON.parse(res.data.links || "[]");
            parsedLinks = Array.isArray(parsed) ? parsed : [];
          } else if (Array.isArray(res.data.links)) {
            parsedLinks = res.data.links;
          }
        } catch {
          parsedLinks = [];
        }
      // console.log('parsedLinks',parsedLinks)
      const newResource = {
        ...res.data,
        resourceId:res?.data?.id,
        coverImage: res.data.coverImage
          ? `${process.env.NEXT_PUBLIC_API_URL}${res.data.coverImage}`
          : null,
        files: res.data.files.map((file) => ({
          name: file.fileName,
          url: `${process.env.NEXT_PUBLIC_API_URL}${file.filePath}`,
          type: file.fileType,
          size: (file.fileSize / 1024).toFixed(2) + ' KB',
          iconUrl: getFileIcon(file.fileType).url,
          color: getFileIcon(file.fileType).color,
          inlineSvg: getFileIcon(file.fileType).inlineSvg,
        })),
        links: parsedLinks,
        linkThumbnails: parsedLinks.map((link) => ({
          url: link,
          thumbnail: getLinkThumbnail(link),
        })),
      };

      if (isEditing) {
        setContent({
          ...content,
          [newContent.category]: content[newContent.category].map((item) =>
            item.resourceId === editResourceId ? newResource : item
          ),
        });
      } else {
        setContent({
          ...content,
          [newContent.category]: [...content[newContent.category], newResource],
        });
      }

      setNewContent({
        category: 'Sales and Marketing',
        resourceType: '',
        title: '',
        description: '',
        links: [''],
        coverImage: null,
        files: [],
        coverPreview: '',
        filePreviews: [],
      });
      setShowModal(false);
      setIsEditing(false);
      setEditResourceId(null);
      setError('');
    } catch (err) {
      console.log(err)
      setError(isEditing ? 'Failed to update resource.' : 'Failed to upload resource.');
    }finally {
    setLoading(false); // Reset loading state
  }
  };
  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Partner Resources</h1>
        <button
          onClick={() => {
            setIsEditing(false);
            setNewContent({
              category: 'Sales and Marketing',
              resourceType: '',
              title: '',
              description: '',
              links: [''],
              coverImage: null,
              files: [],
              coverPreview: '',
              filePreviews: [],
            });
            setShowModal(true);
          }}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          Add Resource
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-300 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
            onClick={() => handleTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading ? (
        <p className="text-center text-gray-500">Loading resources...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content[activeTab].length > 0 ? (
            content[activeTab].map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden relative hover:shadow-lg transition-shadow">
                {item.coverImage && (
                  <img src={item.coverImage} alt="Cover" className="w-full h-40 object-cover" />
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                  <span className="inline-block bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded mb-2">
                    {item.resourceType}
                  </span>
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  {item.linkThumbnails && item.linkThumbnails.length > 0 && (
                    <div className="mt-2 grid grid-cols-2 gap-2 mb-2">
                      {item.linkThumbnails.map((link, idx) => (
                        <div
                          key={idx}
                          className="relative cursor-pointer"
                          onClick={() => handleLinkClick(link.url)}
                        >
                          <img
                            src={link.thumbnail}
                            alt="Link Thumbnail"
                            className="w-full h-24 object-cover rounded-md"
                          />
                          <span className="absolute bottom-1 left-1 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                            Link
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  {item.files.length > 0 && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {item.files.map((file, idx) => (
                        <div
                          key={idx}
                          className="relative cursor-pointer"
                          onClick={() => handleFileClick(file)}
                        >
                          {file.type.startsWith('image/') && (
                            <img src={file.url} alt={file.name} className="w-full h-24 object-cover rounded-md" />
                          )}
                          {file.type.startsWith('video/') && (
                            <div className="w-full h-24 bg-gray-100 rounded-md flex items-center justify-center">
                              <video src={file.url} className="w-full h-full object-cover" muted playsInline />
                            </div>
                          )}
                          {!file.type.startsWith('image/') && !file.type.startsWith('video/') && (
                            <div className="flex flex-col items-center bg-gray-100 p-2 rounded-md hover:bg-gray-200 transition-colors">
                              {file.inlineSvg ? (
                                <svg className={`w-12 h-12 ${file.color} transform hover:scale-110 transition-transform`} viewBox="0 0 24 24">
                                  <path d={file.inlineSvg} fill="currentColor" />
                                </svg>
                              ) : (
                                <img
                                  src={file.iconUrl}
                                  alt="File Icon"
                                  className={`w-12 h-12 ${file.color} transform hover:scale-110 transition-transform object-contain`}
                                />
                              )}
                              <span className="mt-1 text-xs text-gray-600 block max-w-[120px] truncate">{file.name}</span>
                              <span className="text-xs text-gray-500">{file.size}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.resourceId, item.category)}
                    className="bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-3 text-center text-gray-500">No resources available for this category.</p>
          )}
        </div>
      )}

      {/* Upload/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto my-8">
            <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Edit Resource' : 'Add New Resource'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  name="category"
                  value={newContent.category}
                  onChange={(e) => handleInputChange(e)}
                  className="mt-1 block w-full rounded-md border-none bg-gray-100 p-2 focus:ring-0"
                >
                  {tabs.map((tab) => (
                    <option key={tab} value={tab}>
                      {tab}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Resource Type</label>
                <select
                  name="resourceType"
                  value={newContent.resourceType}
                  onChange={(e) => handleInputChange(e)}
                  className="mt-1 block w-full rounded-md border-none bg-gray-100 p-2 focus:ring-0"
                  required
                >
                  <option value="" disabled>
                    Select Resource Type
                  </option>
                  {resourceTypes[newContent.category].map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  name="title"
                  value={newContent.title}
                  onChange={(e) => handleInputChange(e)}
                  className="mt-1 block w-full rounded-md border-none bg-gray-100 p-2 focus:ring-0"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Description (up to 200 chars)</label>
                <textarea
                  name="description"
                  value={newContent.description}
                  onChange={(e) => handleInputChange(e)}
                  maxLength={200}
                  className="mt-1 block w-full rounded-md border-none bg-gray-100 p-2 focus:ring-0"
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Links/URLs</label>
                {newContent.links.map((link, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="url"
                      name="link"
                      value={link}
                      onChange={(e) => handleInputChange(e, index)}
                      className="mt-1 block w-full rounded-md border-none bg-gray-100 p-2 focus:ring-0"
                      placeholder="Enter URL"
                    />
                    {newContent.links.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLinkInput(index)}
                        className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        −
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addLinkInput}
                  className="relative mt-2 bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-purple-700 group transition-colors"
                >
                  +
                  <span className="absolute left-full ml-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                    Add More
                  </span>
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Cover Image</label>
                <input
                  type="file"
                  name="coverImage"
                  accept="image/*"
                  onChange={(e) => handleInputChange(e)}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
                {newContent.coverPreview && (
                  <img
                    src={newContent.coverPreview}
                    alt="Cover Preview"
                    className="mt-2 w-full h-32 object-cover rounded-md"
                  />
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Upload Files (PDF, DOC, PPT, XLSX, TXT, CSV, JSON, ZIP, Video, Image)
                </label>
                <input
                  type="file"
                  name="files"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xlsx,.txt,.csv,.json,.zip,video/*,image/*"
                  multiple
                  onChange={(e) => handleInputChange(e)}
                  ref={fileInputRef}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
                {/* <>
                {newContent.filePreviews.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {newContent.filePreviews.map((preview, idx) => (
                      <div key={idx} className="relative">
                        {preview.type.startsWith('image/') && (
                          <img src={preview.url} alt={preview.name} className="w-full h-24 object-cover rounded-md" />
                        )}
                        {preview.type.startsWith('video/') && (
                          <div className="w-full h-24 bg-gray-100 rounded-md flex items-center justify-center">
                            <video src={preview.url} className="w-full h-full object-cover" muted playsInline />
                          </div>
                        )}
                        {!preview.type.startsWith('image/') && !preview.type.startsWith('video/') && (
                          <div className="flex flex-col items-center bg-gray-100 p-2 rounded-md hover:bg-gray-200 transition-colors">
                            {preview.inlineSvg ? (
                              <svg className={`w-12 h-12 ${preview.color} transform hover:scale-110 transition-transform`} viewBox="0 0 24 24">
                                <path d={preview.inlineSvg} fill="currentColor" />
                              </svg>
                            ) : (
                              <img
                                src={preview.iconUrl}
                                alt="File Icon"
                                className={`w-12 h-12 ${preview.color} transform hover:scale-110 transition-transform object-contain`}
                              />
                            )}
                            <span className="mt-1 text-xs text-gray-600 truncate">{preview.name}</span>
                            <span className="text-xs text-gray-500">{preview.size}</span>
                          </div>
                        )}
                        <button
                          onClick={() => removeFile(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          −
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                </> */}
                {newContent.filePreviews.length > 0 && (
                <div className="mt-2 grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {newContent.filePreviews.map((preview, idx) => {
                    // Dynamically get icon properties if they're missing
                    const { iconUrl, color, inlineSvg } = preview.iconUrl && preview.color
                      ? { iconUrl: preview.iconUrl, color: preview.color, inlineSvg: preview.inlineSvg }
                      : getFileIcon(preview.type || 'default');

                    return (
                      <div key={idx} className="relative">
                        {preview.type.startsWith('image/') && (
                          <img src={preview.url} alt={preview.name} className="w-full h-24 object-cover rounded-md" />
                        )}
                        {preview.type.startsWith('video/') && (
                          <div className="w-full h-24 bg-gray-100 rounded-md flex items-center justify-center">
                            <video src={preview.url} className="w-full h-full object-cover" muted playsInline />
                          </div>
                        )}
                        {!preview.type.startsWith('image/') && !preview.type.startsWith('video/') && (
                          <div className="flex flex-col items-center bg-gray-100 p-2 rounded-md hover:bg-gray-200 transition-colors">
                            {inlineSvg ? (
                              <svg
                                className={`w-12 h-12 ${color} transform hover:scale-110 transition-transform`}
                                viewBox="0 0 24 24"
                              >
                                <path d={inlineSvg} fill="currentColor" />
                              </svg>
                            ) : (
                              <img
                                src={iconUrl || fileIcons.default.url} // Fallback to default icon
                                alt="File Icon"
                                className={`w-12 h-12 ${color || fileIcons.default.color} transform hover:scale-110 transition-transform object-contain`}
                                onError={(e) => {
                                  e.target.src = fileIcons.default.url; // Fallback on image load error
                                }}
                              />
                            )}
                            <span className="mt-1 text-xs text-gray-600 truncate">{preview.name}</span>
                            <span className="text-xs text-gray-500">{preview.size}</span>
                          </div>
                        )}
                        <button
                          onClick={() => removeFile(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          −
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              </div>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setIsEditing(false);
                    setEditResourceId(null);
                  }}
                    disabled={loading}
                   className={`px-4 py-2 rounded-md transition-colors 
                            ${loading 
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                              : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                            }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                   className={`px-4 py-2 rounded-md transition-colors 
                  ${loading 
                    ? "bg-purple-300 text-white cursor-not-allowed" 
                    : "bg-purple-600 text-white hover:bg-purple-700"
                  }`}
                >
                  {/* {isEditing ? 'Update' : 'Add'} */}
                    {loading 
                  ? isEditing 
                    ? "Updating..." 
                    : "Adding..." 
                  : isEditing 
                    ? "Update" 
                    : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && (selectedFile || selectedLink) && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-4xl w-full my-8">
            <h2 className="text-2xl font-bold mb-4">Preview</h2>
            <div className="max-h-[80vh] overflow-y-auto">
              {selectedFile && (
                <>
                  <h3 className="text-lg font-semibold mb-2">{selectedFile.name}</h3>
                  {selectedFile.type.startsWith('image/') && (
                    <img src={selectedFile.url} alt={selectedFile.name} className="w-full max-h-[80vh] object-contain" />
                  )}
                  {selectedFile.type.startsWith('video/') && (
                    <video src={selectedFile.url} controls className="w-full max-h-[80vh]" autoPlay />
                  )}
                  {selectedFile.type === 'application/pdf' && (
                    <iframe
                      src={`${selectedFile.url}#zoom=fit`}
                      title={selectedFile.name}
                      className="w-full h-[80vh] border-none"
                    />
                  )}
                  {!selectedFile.type.startsWith('image/') &&
                    !selectedFile.type.startsWith('video/') &&
                    selectedFile.type !== 'application/pdf' && (
                      <div className="flex flex-col items-center bg-gray-100 p-4 rounded-md">
                        {selectedFile.inlineSvg ? (
                          <svg className={`w-16 h-16 ${selectedFile.color} transform hover:scale-110 transition-transform`} viewBox="0 0 24 24">
                            <path d={selectedFile.inlineSvg} fill="currentColor" />
                          </svg>
                        ) : (
                          <img
                            src={selectedFile.iconUrl}
                            alt="File Icon"
                            className={`w-16 h-16 ${selectedFile.color} transform hover:scale-110 transition-transform object-contain`}
                          />
                        )}
                        <span className="text-sm text-gray-600">{selectedFile.name}</span>
                        <span className="text-sm text-gray-500">Size: {selectedFile.size}</span>
                        <button
                          onClick={() => handleDownload(selectedFile)}
                          className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                        >
                          Download
                        </button>
                      </div>
                    )}
                </>
              )}
              {selectedLink && (
                <>
                  <h3 className="text-lg font-semibold mb-2">{selectedLink}</h3>
                  {isYouTubeLink(selectedLink) ? (
                    <iframe
                      src={getYouTubeEmbedUrl(selectedLink)}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-[80vh]"
                    />
                  ) : (
                    <a
                      href={selectedLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:underline"
                    >
                      Open Link in New Tab
                    </a>
                  )}
                </>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerResources;