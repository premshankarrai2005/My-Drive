import { useEffect, useState } from 'react';
import { Upload, FolderOpen, Image, FileText, FileVideo, Folder, FileArchive, Music, File, MoreVertical } from "lucide-react";

import './App.css'


const categories = {
  Images: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
  Videos: [".mp4", ".avi", ".mov", ".mkv"],
  Text: [".txt", ".md"],
  PDF: [".pdf"],
  Code: [".js", ".jsx", ".html", ".css", ".json"],
};

// for the icon categories
const getCategoryIcon = (category) => {
  switch (category) {
    case "Images":
      return <Image className="w-5 h-5 text-pink-500 mr-2" />;
    case "Videos":
      return <FileVideo className="w-5 h-5 text-purple-500 mr-2" />;
    case "Text Files":
      return <FileText className="w-5 h-5 text-green-500 mr-2" />;
    case "Documents":
      return <FileArchive className="w-5 h-5 text-blue-500 mr-2" />;
    default:
      return <File className="w-5 h-5 text-gray-500 mr-2" />;
  }
};


function App() {
  const URL = "http://Add Your IP address:4000/" //add here your ip address
  const [directoryItems, setdirectoryItems] = useState([])
  const [progress, setProgress] = useState("0")
  const [rename, setRename] = useState("")
  const [selectedItem, setSelectedItem] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);

  async function fetchServerItems() {
    const response = await fetch(URL)
    const data = await response.json()
    setdirectoryItems(data);
  }

  useEffect(() => {
    fetchServerItems()
  }, [])

  async function uploadFile(e) {
    const file = e.target.files[0];
    const xhr = new XMLHttpRequest()
    xhr.open("POST", URL, true)

    xhr.setRequestHeader("filename", encodeURIComponent(file.name));
    xhr.addEventListener("load", (e) => {
      console.log(xhr.response);
      fetchServerItems()
    })
    xhr.upload.addEventListener("progress", (e) => {
      const progress = (e.loaded / e.total) * 100
      setProgress(progress.toFixed(2))
    })
    xhr.send(file)
  }

  async function handleDelete(filename) {
    const response = await fetch(URL, {
      method: "DELETE",
      body: filename,
    })
    const data = await response.text()
    fetchServerItems()
    console.log(data);
  }

  async function handleRename(oldname) {
    setRename(oldname)
  }

  async function handleSave(oldFileName, newName) {
    if (!newName || newName.trim() === "") return;

    const response = await fetch(URL, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ oldFileName, newName })   // ✅ use oldName instead of item
    });

    const data = await response.text();
    fetchServerItems();
    console.log(data);

    setRename("");
    setSelectedItem(null);
  }




  return (
    <>
      {/* Title */}
      <h1 className="text-5xl font-extrabold mt-6 ml-6 text-gray-800 tracking-tight flex items-center gap-2">
        <FolderOpen className="w-8 h-8 text-blue-600" />
        My Drive
      </h1>

      <div className='md:flex  '>
        {/* File Upload Input */}
        <div className="mt-6 ml-6 mr-7">
          <label className="flex items-center justify-center gap-2 w-72 px-4 py-3 
                     bg-gradient-to-r from-blue-600 to-indigo-600 text-white 
                     rounded-xl shadow-lg cursor-pointer hover:opacity-90 transition">
            <Upload className="w-5 h-5" />
            <span className="font-semibold text-sm">Upload Files</span>
            <input type="file" onChange={uploadFile} multiple className="hidden" />
          </label>
        </div>

        {/* Rename the file */}
        {selectedItem && (<div className="relative mt-6 w-72">
          <input
            type="text"
            onChange={(e) => setRename(e.target.value)}
            value={rename}
            placeholder="Rename the file"
            className="w-full h-10 px-4 pr-20 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />

          {/* Save button */}
          <button
            onClick={() => {
              if (selectedItem) {
                handleSave(selectedItem, rename);
                setSelectedItem(null);
                setRename("");
              } else {
                alert("Please select a file to rename");
              }
            }}
            className="absolute right-0 top-0 h-10 px-3 
               bg-blue-600 text-white text-sm rounded-r-xl 
               hover:bg-blue-700 transition"
          >
            Save
          </button>
        </div>)}





      </div>

      {/* Progress Section */}
      {progress > 0 && progress < 100 && (
        <div className="mt-6 ml-6 w-72">
          <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="mt-2 text-sm font-medium text-gray-700">
            {Number(progress).toFixed(2)}% Loaded
          </p>
        </div>
      )}



      {/* Categorized File List */}
      <div className="mt-8 ml-6">
        {Object.entries(
          directoryItems.reduce((groups, item) => {
            // get extension
            const ext = item.split(".").pop().toLowerCase();

            let category = "Others";
            if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext)) {
              category = "Images";
            } else if (["mp4", "mkv", "avi", "mov" ,"webm"].includes(ext)) {
              category = "Videos";
            } else if (["txt", "md"].includes(ext)) {
              category = "Text Files";
            } else if (["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext)) {
              category = "Documents";
            }

            if (!groups[category]) groups[category] = [];
            groups[category].push(item);
            return groups;
          }, {})
        ).map(([category, items]) => (
          <div key={category} className="mb-10">
            {/* Category Heading */}



            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              {getCategoryIcon(category)}
              {category}
            </h2>


            {/* File Grid */}
            <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="relative w-32 h-32 bg-gradient-to-br from-gray-50 to-gray-100 
                       border border-gray-200 rounded-2xl shadow-md flex flex-col items-center 
                       justify-center cursor-pointer hover:shadow-lg transition group"
                  onClick={() => (window.location.href = `${URL}${item}?action=open`)} // ✅ default open on click
                >
                  {/* Icon */}
                  <FolderOpen className="w-10 h-10 text-yellow-500 mb-2" />

                  {/* Filename */}
                  <span className="text-sm font-medium text-gray-700 text-center px-2 truncate">
                    {item}
                  </span>

                  {/* Three dots menu button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // prevent triggering open
                      setOpenMenu(openMenu === item ? null : item);
                    }}
                    className="absolute top-2 right-2 p-1 rounded-full 
                         hover:bg-gray-200 transition"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>

                  {/* Dropdown menu */}
                  {openMenu === item && (
                    <div
                      className="absolute top-12 right-2 bg-white border border-gray-200 
                           rounded-xl shadow-lg flex flex-col w-32 z-10 p-1"
                      onClick={(e) => e.stopPropagation()} // prevent folder open
                    >
                      {/* Open Button */}
                      <a
                        href={`${URL}${item}?action=open`}
                        className="px-3 py-2 text-sm rounded-md text-green-600 
                             hover:bg-green-50 font-medium"
                      >
                        Open
                      </a>

                      {/* Download Button */}
                      <a
                        href={`${URL}${item}?action=download`}
                        className="px-3 py-2 text-sm rounded-md text-blue-600 
                             hover:bg-blue-50 font-medium"
                      >
                        Download
                      </a>

                      {/* Rename Button */}
                      <button
                        onClick={() => {
                          handleRename(item)
                          setSelectedItem(item);   // mark this item as selected
                          setRename(item);         // pre-fill input with current name/ rename handler
                          console.log("Rename:", item);
                        }}
                        className="px-3 py-2 text-sm rounded-md text-yellow-600 
                             hover:bg-yellow-50 font-medium text-left"
                      >
                        Rename
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => {
                          handleDelete(item)
                          console.log("Delete:", item);
                        }}
                        className="px-3 py-2 text-sm rounded-md text-red-600 
                             hover:bg-red-50 font-medium text-left"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </>

  )
}

export default App
