"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select as UISelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, X } from "lucide-react";
import { format, setHours, setMinutes, isSameDay } from "date-fns";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import imageCompression from "browser-image-compression";

// Define the Attachment interface
interface Attachment {
  url: string;
  filename: string;
  size: number;
  type: string;
}

// Define the Notification interface
interface Notification {
  id?: string;
  title: string;
  message: string;
  attachments: Attachment[];
  type: string;
  createdAt?: string;
  scheduledDate?: string | null;
}

interface ManualNotificationProps {
  notification?: Notification;
  onSuccess?: () => void;
}

export default function ManualNotification({ notification, onSuccess }: ManualNotificationProps) {
  const [title, setTitle] = useState(notification?.title || "");
  const [description, setDescription] = useState(notification?.message || "");
  const [files, setFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>(notification?.attachments || []);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(
    notification?.scheduledDate ? new Date(notification.scheduledDate) : undefined
  );
  const [scheduledTime, setScheduledTime] = useState<string>(
    notification?.scheduledDate ? format(new Date(notification.scheduledDate), "HH:mm") : ""
  );
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<{ url: string; type: string; name: string } | null>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<"notification" | "email" | "both">(
    notification?.type as any || "notification"
  );
  const [isSendLater, setIsSendLater] = useState(!!notification?.scheduledDate);

  const MAX_FILES = 5;
  const MAX_FILE_SIZE_MB = 5;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
  const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const compressionOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };

  useEffect(() => {
    if (notification) {
      setTitle(notification.title);
      setDescription(notification.message);
      setExistingAttachments(notification.attachments || []);
      setSelectedType(notification.type as "notification" | "email" | "both");
      if (notification.scheduledDate) {
        const date = new Date(notification.scheduledDate);
        setScheduledDate(date);
        setScheduledTime(format(date, "HH:mm"));
        setIsSendLater(true);
      }
    }
  }, [notification]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const totalFiles = files.length + existingAttachments.length + newFiles.length;

      if (totalFiles > MAX_FILES) {
        setError(`You can only upload up to ${MAX_FILES} files, including existing attachments.`);
        return;
      }

      const validFiles: File[] = [];
      for (const file of newFiles) {
        if (file.size > MAX_FILE_SIZE_BYTES) {
          setError(`File "${file.name}" exceeds ${MAX_FILE_SIZE_MB}MB and cannot be uploaded.`);
          continue;
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
          setError(`File "${file.name}" is not an allowed type. Only images, PDFs, .txt, .doc, and .docx are allowed.`);
          continue;
        }

        if (file.type.startsWith("image/")) {
          try {
            const compressedFile = await imageCompression(file, compressionOptions);
            validFiles.push(
              new File([compressedFile], file.name, {
                type: compressedFile.type,
                lastModified: compressedFile.lastModified,
              })
            );
          } catch (err) {
            setError(`Failed to compress "${file.name}". Please try again.`);
            console.error(err);
            continue;
          }
        } else {
          validFiles.push(file);
        }
      }

      if (validFiles.length > 0) {
        setFiles([...files, ...validFiles]);
        setError(null);
      } else if (!error) {
        setError("No valid files were selected.");
      }
    }
  };

  const removeExistingAttachment = (index: number) => {
    setExistingAttachments(existingAttachments.filter((_, i) => i !== index));
  };

  const openScheduleModal = () => {
    setIsSendLater(true);
    setScheduleModalOpen(true);
  };

  const handleConfirmSchedule = () => {
    if (!scheduledDate || !scheduledTime) {
      setError("Please select both a date and time for scheduling.");
      return;
    }
    const [hours, minutes] = scheduledTime.split(":").map(Number);
    const scheduledDateTime = setHours(setMinutes(scheduledDate, minutes), hours);
    if (scheduledDateTime < new Date()) {
      setError("Scheduled date and time cannot be in the past.");
      return;
    }
    setScheduleModalOpen(false);
    setConfirmModalOpen(true);
  };

  const handleSendNowClick = () => {
    setIsSendLater(false);
    setConfirmModalOpen(true);
  };

  const handleConfirmSend = async () => {
    setConfirmModalOpen(false);
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("type", selectedType);
      formData.append("senderType", "admin");
      files.forEach((file) => formData.append("notificationFiles", file));
      formData.append("existingAttachments", JSON.stringify(existingAttachments));

      let endpoint = notification?.id
        ? `/api/notifications/update/${notification.id}`
        : "/api/notifications/sendAdminNotification";
      if (isSendLater) {
        const [hours, minutes] = scheduledTime.split(":").map(Number);
        const scheduledDateTime = setHours(setMinutes(scheduledDate, minutes), hours);
        formData.append("scheduledDate", scheduledDateTime.toISOString());
        endpoint = notification?.id ? `/api/notifications/update/${notification.id}` : "/api/notifications/schedule";
      }

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert(notification?.id ? "Notification updated successfully!" : isSendLater ? "Notification scheduled successfully!" : "Notification sent successfully!");
      setTitle("");
      setDescription("");
      setFiles([]);
      setExistingAttachments([]);
      setScheduledDate(undefined);
      setScheduledTime("");
      setSelectedType("notification");
      setIsSendLater(false);
      onSuccess?.();
    } catch (err) {
      setError(`Failed to ${notification?.id ? "update" : isSendLater ? "schedule" : "send"} notification. Please try again.`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // const timeOptions = Array.from({ length: 96 }, (_, i) => { 15 min sot
  //   const hours = Math.floor(i / 4);
  //   const minutes = (i % 4) * 30;
  //   return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  // });
  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2);
    const minutes = (i % 2) * 30;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  });

  const filteredTimeOptions = scheduledDate && isSameDay(scheduledDate, new Date())
    ? timeOptions.filter((time) => {
        const [hours, minutes] = time.split(":").map(Number);
        const timeDate = setHours(setMinutes(new Date(), minutes), hours);
        return timeDate > new Date();
      })
    : timeOptions;

  const getFilePreview = (file: File | Attachment) => {
    const url = "url" in file ? file.url : URL.createObjectURL(file);
    const type = file.type;
    const name = "filename" in file ? file.filename : file.name;
    return { url, type, name };
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{notification?.id ? "Edit Notification" : "Send Manual Notification"}</h1>
          <p className="text-gray-600 mt-2">{notification?.id ? "Update existing notification" : "Create and send notifications to users"}</p>
        </div>
      </div>
      <Card className="w-full">
        <CardContent className="space-y-4 pt-6">
          {error && <p className="text-red-500">{error}</p>}
          <div className="space-y-2">
            <Label htmlFor="title">Notification Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notification title"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter notification description"
              rows={6}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
          <Label htmlFor="files">Attach up to 5 documents (PDF/images, max 5MB each)</Label>
            <Input
              id="files"
              type="file"
              accept={ALLOWED_TYPES.join(",")}
              multiple
              onChange={handleFileUpload}
              disabled={isLoading}
            />
            {(files.length > 0 || existingAttachments.length > 0) && (
              <div className="flex flex-wrap gap-2 mt-2">
                {existingAttachments.map((attachment, index) => (
                  <div key={`existing-${index}`} className="relative">
                    {attachment.type.startsWith("image/") ? (
                      <img
                        src={attachment.url}
                        alt={attachment.filename}
                        className="h-20 w-20 object-cover rounded cursor-pointer"
                        onClick={() => setPreviewFile(getFilePreview(attachment))}
                      />
                    ) : (
                      <div
                        className="h-20 w-20 bg-gray-100 flex items-center justify-center rounded cursor-pointer text-sm text-gray-600"
                        onClick={() => setPreviewFile(getFilePreview(attachment))}
                      >
                        {attachment.filename.split(".").pop()?.toUpperCase()}
                      </div>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-0 right-0 h-6 w-6"
                      onClick={() => removeExistingAttachment(index)}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {files.map((file, index) => (
                  <div key={`new-${index}`} className="relative">
                    {file.type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="h-20 w-20 object-cover rounded cursor-pointer"
                        onClick={() => setPreviewFile(getFilePreview(file))}
                      />
                    ) : (
                      <div
                        className="h-20 w-20 bg-gray-100 flex items-center justify-center rounded cursor-pointer text-sm text-gray-600"
                        onClick={() => setPreviewFile(getFilePreview(file))}
                      >
                        {file.name.split(".").pop()?.toUpperCase()}
                      </div>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-0 right-0 h-6 w-6"
                      onClick={() => setFiles(files.filter((_, i) => i !== index))}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-4">
            <Button onClick={handleSendNowClick} disabled={isLoading || !title || !description}>
              {isLoading ? "Processing..." : notification?.id ? "Update Now" : "Send Now"}
            </Button>
            <Button
              onClick={openScheduleModal}
              disabled={isLoading || !title || !description}
              variant="secondary"
            >
              {isLoading ? "Processing..." : notification?.id ? "Schedule Update" : "Send Later"}
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* File Preview Modal */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>File Preview: {previewFile?.name}</DialogTitle>
          </DialogHeader>
          {previewFile && (
            <div className="mt-4">
              {previewFile.type.startsWith("image/") && (
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="w-full h-auto max-h-[70vh] object-contain"
                />
              )}
              {previewFile.type === "application/pdf" && (
                <iframe
                  src={previewFile.url}
                  className="w-full h-[70vh]"
                  title={previewFile.name}
                />
              )}
              {(previewFile.type === "text/plain" ||
                previewFile.type === "application/msword" ||
                previewFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") && (
                <div className="p-4 bg-gray-100 rounded">
                  <p className="text-gray-700">File: {previewFile.name}</p>
                  <p className="text-gray-500">Type: {previewFile.type.split("/").pop()?.toUpperCase()}</p>
                  <p className="text-gray-500">
                    Size: {(files.find(f => f.name === previewFile.name)?.size / 1024 || existingAttachments.find(a => a.filename === previewFile.name)?.size / 1024 || 0).toFixed(2)} KB
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Schedule Modal */}
      <Dialog open={scheduleModalOpen} onOpenChange={() => setScheduleModalOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Notification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Pick Date</Label>
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={(date) => {
                      setScheduledDate(date);
                      setIsPopoverOpen(false);
                    }}
                    disabled={(date) => date < new Date().setHours(0, 0, 0, 0)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Pick Time</Label>
              <UISelect value={scheduledTime} onValueChange={setScheduledTime} disabled={isLoading}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pick a time" />
                </SelectTrigger>
                <SelectContent>
                  {filteredTimeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </UISelect>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setScheduleModalOpen(false)} variant="outline">Cancel</Button>
            <Button onClick={handleConfirmSchedule} disabled={!scheduledDate || !scheduledTime}>Confirm Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Confirmation Modal */}
      <Dialog open={confirmModalOpen} onOpenChange={() => setConfirmModalOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Send Option</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Select how to send:</Label>
            <RadioGroup value={selectedType} onValueChange={(value) => setSelectedType(value as "notification" | "email" | "both")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="notification" id="notification" />
                <Label htmlFor="notification">Notification Only</Label>
              </div>
              <div className="filex items-center space-x-2">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email">Email Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both">Both Notification and Email</Label>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button onClick={() => setConfirmModalOpen(false)} variant="outline">Cancel</Button>
            <Button onClick={handleConfirmSend}>{notification?.id ? "Update" : "Send"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


// "use client";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent } from "@/components/ui/card";
// import { Calendar } from "@/components/ui/calendar";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Select as UISelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { CalendarIcon, X } from "lucide-react";
// import { format, setHours, setMinutes, isSameDay } from "date-fns";
// import axios from "axios";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// export default function ManualNotification() {
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [images, setImages] = useState<File[]>([]);
//   const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
//   const [scheduledTime, setScheduledTime] = useState<string>("");
//   const [isPopoverOpen, setIsPopoverOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [previewImage, setPreviewImage] = useState<string | null>(null);
//   const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
//   const [confirmModalOpen, setConfirmModalOpen] = useState(false);
//   const [selectedType, setSelectedType] = useState<"notification" | "email" | "both">("notification");
//   const [isSendLater, setIsSendLater] = useState(false);

//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       setImages([...images, ...Array.from(e.target.files)]);
//     }
//   };

//   const openScheduleModal = () => {
//     setIsSendLater(true);
//     setScheduleModalOpen(true);
//   };

//   const handleConfirmSchedule = () => {
//     if (!scheduledDate || !scheduledTime) {
//       setError("Please select both a date and time for scheduling.");
//       return;
//     }
//     const [hours, minutes] = scheduledTime.split(":").map(Number);
//     const scheduledDateTime = setHours(setMinutes(scheduledDate, minutes), hours);
//     if (scheduledDateTime < new Date()) {
//       setError("Scheduled date and time cannot be in the past.");
//       return;
//     }
//     setScheduleModalOpen(false);
//     setConfirmModalOpen(true);
//   };

//   const handleSendNowClick = () => {
//     setIsSendLater(false);
//     setConfirmModalOpen(true);
//   };

//   const handleConfirmSend = async () => {
//     setConfirmModalOpen(false);
//     setIsLoading(true);
//     setError(null);
//     try {
//       const formData = new FormData();
//       formData.append("title", title);
//       formData.append("description", description);
//       formData.append("type", selectedType);
//       images.forEach((image) => formData.append("notificationImages", image));

//       let endpoint = "/api/notifications/send";
//       if (isSendLater) {
//         const [hours, minutes] = scheduledTime.split(":").map(Number);
//         const scheduledDateTime = setHours(setMinutes(scheduledDate, minutes), hours);
//         formData.append("scheduledDate", scheduledDateTime.toISOString());
//         endpoint = "/api/notifications/schedule";
//       }
      
//       for (let [key, value] of formData.entries()) {
//         console.log(key, value);
//       }
//       await axios.post(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, formData, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       // Placeholder for Socket.io emit
//       // if (!isSendLater) socket.emit("sendNotification", { title, description, images, type: selectedType });

//       alert(isSendLater ? "Notification scheduled successfully!" : "Notification sent successfully!");
//       setTitle("");
//       setDescription("");
//       setImages([]);
//       setScheduledDate(undefined);
//       setScheduledTime("");
//       setSelectedType("notification");
//     } catch (err) {
//       setError(`Failed to ${isSendLater ? "schedule" : "send"} notification. Please try again.`);
//       console.error(err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Generate time options (every 15 minutes)
//   const timeOptions = Array.from({ length: 96 }, (_, i) => {
//     const hours = Math.floor(i / 4);
//     const minutes = (i % 4) * 15;
//     return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
//   });

//   // Filter time options to disable past times if today is selected
//   const filteredTimeOptions = scheduledDate && isSameDay(scheduledDate, new Date())
//     ? timeOptions.filter((time) => {
//         const [hours, minutes] = time.split(":").map(Number);
//         const timeDate = setHours(setMinutes(new Date(), minutes), hours);
//         return timeDate > new Date();
//       })
//     : timeOptions;

//   return (
//     <div className="p-4 space-y-4">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Send Manual Notification</h1>
//           <p className="text-gray-600 mt-2">Create and send notifications to users</p>
//         </div>
//       </div>
//       <Card className="w-full">
//         <CardContent className="space-y-4 pt-6">
//           {error && <p className="text-red-500">{error}</p>}
//           <div className="space-y-2">
//             <Label htmlFor="title">Notification Title</Label>
//             <Input
//               id="title"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               placeholder="Enter notification title"
//               disabled={isLoading}
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="description">Description</Label>
//             <Textarea
//               id="description"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               placeholder="Enter notification description"
//               rows={6}
//               disabled={isLoading}
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="images">Upload Images</Label>
//             <Input
//               id="images"
//               type="file"
//               accept="image/*"
//               multiple
//               onChange={handleImageUpload}
//               disabled={isLoading}
//             />
//             {images.length > 0 && (
//               <div className="flex flex-wrap gap-2 mt-2">
//                 {images.map((image, index) => (
//                   <div key={index} className="relative">
//                     <img
//                       src={URL.createObjectURL(image)}
//                       alt={`Uploaded ${index}`}
//                       className="h-20 w-20 object-cover rounded cursor-pointer"
//                       onClick={() => setPreviewImage(URL.createObjectURL(image))}
//                     />
//                     <Button
//                       variant="destructive"
//                       size="sm"
//                       className="absolute top-0 right-0 h-6 w-6"
//                       onClick={() => setImages(images.filter((_, i) => i !== index))}
//                       disabled={isLoading}
//                     >
//                       <X className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//           <div className="flex gap-4">
//             <Button onClick={handleSendNowClick} disabled={isLoading || !title || !description}>
//               {isLoading ? "Sending..." : "Send Now"}
//             </Button>
//             <Button
//               onClick={openScheduleModal}
//               disabled={isLoading || !title || !description}
//               variant="secondary"
//             >
//               {isLoading ? "Scheduling..." : "Send Later"}
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//       {/* Image Preview Modal */}
//       <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Image Preview</DialogTitle>
//           </DialogHeader>
//           {previewImage && (
//             <img src={previewImage} alt="Preview" className="w-full h-auto max-h-[70vh] object-contain" />
//           )}
//         </DialogContent>
//       </Dialog>
//       {/* Schedule Modal */}
//       <Dialog open={scheduleModalOpen} onOpenChange={() => setScheduleModalOpen(false)}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Schedule Notification</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             <div className="space-y-2">
//               <Label>Pick Date</Label>
//               <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
//                 <PopoverTrigger asChild>
//                   <Button
//                     variant="outline"
//                     className="w-full justify-start text-left font-normal"
//                     disabled={isLoading}
//                   >
//                     <CalendarIcon className="mr-2 h-4 w-4" />
//                     {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-auto p-0">
//                   <Calendar
//                     mode="single"
//                     selected={scheduledDate}
//                     onSelect={(date) => {
//                       setScheduledDate(date);
//                       setIsPopoverOpen(false);
//                     }}
//                     disabled={(date) => date < new Date().setHours(0, 0, 0, 0)}
//                     initialFocus
//                   />
//                 </PopoverContent>
//               </Popover>
//             </div>
//             <div className="space-y-2">
//               <Label>Pick Time</Label>
//               <UISelect value={scheduledTime} onValueChange={setScheduledTime} disabled={isLoading}>
//                 <SelectTrigger className="w-full">
//                   <SelectValue placeholder="Pick a time" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {filteredTimeOptions.map((time) => (
//                     <SelectItem key={time} value={time}>
//                       {time}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </UISelect>
//             </div>
//           </div>
//           <DialogFooter>
//             <Button onClick={() => setScheduleModalOpen(false)} variant="outline">Cancel</Button>
//             <Button onClick={handleConfirmSchedule} disabled={!scheduledDate || !scheduledTime}>Confirm Schedule</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//       {/* Confirmation Modal */}
//       <Dialog open={confirmModalOpen} onOpenChange={() => setConfirmModalOpen(false)}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Confirm Send Option</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             <Label>Select how to send:</Label>
//             <RadioGroup value={selectedType} onValueChange={(value) => setSelectedType(value as "notification" | "email" | "both")}>
//               <div className="flex items-center space-x-2">
//                 <RadioGroupItem value="notification" id="notification" />
//                 <Label htmlFor="notification">Notification Only</Label>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <RadioGroupItem value="email" id="email" />
//                 <Label htmlFor="email">Email Only</Label>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <RadioGroupItem value="both" id="both" />
//                 <Label htmlFor="both">Both Notification and Email</Label>
//               </div>
//             </RadioGroup>
//           </div>
//           <DialogFooter>
//             <Button onClick={() => setConfirmModalOpen(false)} variant="outline">Cancel</Button>
//             <Button onClick={handleConfirmSend}>Send</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent } from "@/components/ui/card";
// import { Calendar } from "@/components/ui/calendar";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Select as UISelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { CalendarIcon, X } from "lucide-react";
// import { format, setHours, setMinutes, isSameDay } from "date-fns";
// import axios from "axios";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// interface ManualNotificationProps {
//   onSuccess?: () => void;
// }

// export default function ManualNotification({ onSuccess }: ManualNotificationProps) {
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [files, setFiles] = useState<File[]>([]);
//   const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
//   const [scheduledTime, setScheduledTime] = useState<string>("");
//   const [isPopoverOpen, setIsPopoverOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [previewFile, setPreviewFile] = useState<{ url: string; type: string; name: string } | null>(null);
//   const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
//   const [confirmModalOpen, setConfirmModalOpen] = useState(false);
//   const [selectedType, setSelectedType] = useState<"notification" | "email" | "both">("notification");
//   const [isSendLater, setIsSendLater] = useState(false);

//   const MAX_FILES = 5;
//   const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "application/pdf", "text/plain", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

//   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       const newFiles = Array.from(e.target.files);
//       const totalFiles = files.length + newFiles.length;

//       if (totalFiles > MAX_FILES) {
//         setError(`You can only upload up to ${MAX_FILES} files.`);
//         return;
//       }

//       const validFiles = newFiles.filter((file) => ALLOWED_TYPES.includes(file.type));
//       if (validFiles.length !== newFiles.length) {
//         setError("Only images, PDFs, .txt, .doc, and .docx files are allowed.");
//         return;
//       }

//       setFiles([...files, ...validFiles]);
//       setError(null);
//     }
//   };

//   const openScheduleModal = () => {
//     setIsSendLater(true);
//     setScheduleModalOpen(true);
//   };

//   const handleConfirmSchedule = () => {
//     if (!scheduledDate || !scheduledTime) {
//       setError("Please select both a date and time for scheduling.");
//       return;
//     }
//     const [hours, minutes] = scheduledTime.split(":").map(Number);
//     const scheduledDateTime = setHours(setMinutes(scheduledDate, minutes), hours);
//     if (scheduledDateTime < new Date()) {
//       setError("Scheduled date and time cannot be in the past.");
//       return;
//     }
//     setScheduleModalOpen(false);
//     setConfirmModalOpen(true);
//   };

//   const handleSendNowClick = () => {
//     setIsSendLater(false);
//     setConfirmModalOpen(true);
//   };

//   const handleConfirmSend = async () => {
//     setConfirmModalOpen(false);
//     setIsLoading(true);
//     setError(null);
//     try {
//       const formData = new FormData();
//       formData.append("title", title);
//       formData.append("description", description);
//       formData.append("type", selectedType);
//       formData.append("senderType", "admin");
//       files.forEach((file) => formData.append("notificationFiles", file));
//       let endpoint = "/api/notifications/sendAdminNotification";
//       if (isSendLater) {
//         const [hours, minutes] = scheduledTime.split(":").map(Number);
//         const scheduledDateTime = setHours(setMinutes(scheduledDate, minutes), hours);
//         formData.append("scheduledDate", scheduledDateTime.toISOString());
//         endpoint = "/api/notifications/schedule";
//       }
//         for (let [key, value] of formData.entries()) {
//         console.log(key, value);
//       }
//       await axios.post(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, formData, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       alert(isSendLater ? "Notification scheduled successfully!" : "Notification sent successfully!");
//       setTitle("");
//       setDescription("");
//       setFiles([]);
//       setScheduledDate(undefined);
//       setScheduledTime("");
//       setSelectedType("notification");
//       onSuccess?.();
//     } catch (err) {
//       setError(`Failed to ${isSendLater ? "schedule" : "send"} notification. Please try again.`);
//       console.error(err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const timeOptions = Array.from({ length: 96 }, (_, i) => {
//     const hours = Math.floor(i / 4);
//     const minutes = (i % 4) * 15;
//     return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
//   });

//   const filteredTimeOptions = scheduledDate && isSameDay(scheduledDate, new Date())
//     ? timeOptions.filter((time) => {
//         const [hours, minutes] = time.split(":").map(Number);
//         const timeDate = setHours(setMinutes(new Date(), minutes), hours);
//         return timeDate > new Date();
//       })
//     : timeOptions;

//   const getFilePreview = (file: File) => {
//     const url = URL.createObjectURL(file);
//     const type = file.type;
//     const name = file.name;
//     return { url, type, name };
//   };

//   return (
//     <div className="p-4 space-y-4">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Send Manual Notification</h1>
//           <p className="text-gray-600 mt-2">Create and send notifications to users</p>
//         </div>
//       </div>
//       <Card className="w-full">
//         <CardContent className="space-y-4 pt-6">
//           {error && <p className="text-red-500">{error}</p>}
//           <div className="space-y-2">
//             <Label htmlFor="title">Notification Title</Label>
//             <Input
//               id="title"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               placeholder="Enter notification title"
//               disabled={isLoading}
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="description">Description</Label>
//             <Textarea
//               id="description"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               placeholder="Enter notification description"
//               rows={6}
//               disabled={isLoading}
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="files">Upload Files (Images, PDFs, Documents)</Label>
//             <Input
//               id="files"
//               type="file"
//               accept="image/jpeg,image/png,image/gif,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//               multiple
//               onChange={handleFileUpload}
//               disabled={isLoading}
//             />
//             {files.length > 0 && (
//               <div className="flex flex-wrap gap-2 mt-2">
//                 {files.map((file, index) => (
//                   <div key={index} className="relative">
//                     {file.type.startsWith("image/") ? (
//                       <img
//                         src={URL.createObjectURL(file)}
//                         alt={file.name}
//                         className="h-20 w-20 object-cover rounded cursor-pointer"
//                         onClick={() => setPreviewFile(getFilePreview(file))}
//                       />
//                     ) : (
//                       <div
//                         className="h-20 w-20 bg-gray-100 flex items-center justify-center rounded cursor-pointer text-sm text-gray-600"
//                         onClick={() => setPreviewFile(getFilePreview(file))}
//                       >
//                         {file.name.split(".").pop()?.toUpperCase()}
//                       </div>
//                     )}
//                     <Button
//                       variant="destructive"
//                       size="sm"
//                       className="absolute top-0 right-0 h-6 w-6"
//                       onClick={() => setFiles(files.filter((_, i) => i !== index))}
//                       disabled={isLoading}
//                     >
//                       <X className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//           <div className="flex gap-4">
//             <Button onClick={handleSendNowClick} disabled={isLoading || !title || !description}>
//               {isLoading ? "Sending..." : "Send Now"}
//             </Button>
//             <Button
//               onClick={openScheduleModal}
//               disabled={isLoading || !title || !description}
//               variant="secondary"
//             >
//               {isLoading ? "Scheduling..." : "Send Later"}
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//       {/* File Preview Modal */}
//       <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>File Preview: {previewFile?.name}</DialogTitle>
//           </DialogHeader>
//           {previewFile && (
//             <div className="mt-4">
//               {previewFile.type.startsWith("image/") && (
//                 <img
//                   src={previewFile.url}
//                   alt={previewFile.name}
//                   className="w-full h-auto max-h-[70vh] object-contain"
//                 />
//               )}
//               {previewFile.type === "application/pdf" && (
//                 <iframe
//                   src={previewFile.url}
//                   className="w-full h-[70vh]"
//                   title={previewFile.name}
//                 />
//               )}
//               {(previewFile.type === "text/plain" ||
//                 previewFile.type === "application/msword" ||
//                 previewFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") && (
//                 <div className="p-4 bg-gray-100 rounded">
//                   <p className="text-gray-700">File: {previewFile.name}</p>
//                   <p className="text-gray-500">Type: {previewFile.type.split("/").pop()?.toUpperCase()}</p>
//                   <p className="text-gray-500">Size: {(files.find(f => f.name === previewFile.name)?.size / 1024).toFixed(2)} KB</p>
//                 </div>
//               )}
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//       {/* Schedule Modal */}
//       <Dialog open={scheduleModalOpen} onOpenChange={() => setScheduleModalOpen(false)}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Schedule Notification</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             <div className="space-y-2">
//               <Label>Pick Date</Label>
//               <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
//                 <PopoverTrigger asChild>
//                   <Button
//                     variant="outline"
//                     className="w-full justify-start text-left font-normal"
//                     disabled={isLoading}
//                   >
//                     <CalendarIcon className="mr-2 h-4 w-4" />
//                     {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-auto p-0">
//                   <Calendar
//                     mode="single"
//                     selected={scheduledDate}
//                     onSelect={(date) => {
//                       setScheduledDate(date);
//                       setIsPopoverOpen(false);
//                     }}
//                     disabled={(date) => date < new Date().setHours(0, 0, 0, 0)}
//                     initialFocus
//                   />
//                 </PopoverContent>
//               </Popover>
//             </div>
//             <div className="space-y-2">
//               <Label>Pick Time</Label>
//               <UISelect value={scheduledTime} onValueChange={setScheduledTime} disabled={isLoading}>
//                 <SelectTrigger className="w-full">
//                   <SelectValue placeholder="Pick a time" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {filteredTimeOptions.map((time) => (
//                     <SelectItem key={time} value={time}>
//                       {time}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </UISelect>
//             </div>
//           </div>
//           <DialogFooter>
//             <Button onClick={() => setScheduleModalOpen(false)} variant="outline">Cancel</Button>
//             <Button onClick={handleConfirmSchedule} disabled={!scheduledDate || !scheduledTime}>Confirm Schedule</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//       {/* Confirmation Modal */}
//       <Dialog open={confirmModalOpen} onOpenChange={() => setConfirmModalOpen(false)}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Confirm Send Option</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             <Label>Select how to send:</Label>
//             <RadioGroup value={selectedType} onValueChange={(value) => setSelectedType(value as "notification" | "email" | "both")}>
//               <div className="flex items-center space-x-2">
//                 <RadioGroupItem value="notification" id="notification" />
//                 <Label htmlFor="notification">Notification Only</Label>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <RadioGroupItem value="email" id="email" />
//                 <Label htmlFor="email">Email Only</Label>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <RadioGroupItem value="both" id="both" />
//                 <Label htmlFor="both">Both Notification and Email</Label>
//               </div>
//             </RadioGroup>
//           </div>
//           <DialogFooter>
//             <Button onClick={() => setConfirmModalOpen(false)} variant="outline">Cancel</Button>
//             <Button onClick={handleConfirmSend}>Send</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent } from "@/components/ui/card";
// import { Calendar } from "@/components/ui/calendar";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Select as UISelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { CalendarIcon, X } from "lucide-react";
// import { format, setHours, setMinutes, isSameDay } from "date-fns";
// import axios from "axios";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import imageCompression from "browser-image-compression"; // Import compression library

// interface ManualNotificationProps {
//   onSuccess?: () => void;
// }

// export default function ManualNotification({ onSuccess }: ManualNotificationProps) {
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [files, setFiles] = useState<File[]>([]);
//   const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
//   const [scheduledTime, setScheduledTime] = useState<string>("");
//   const [isPopoverOpen, setIsPopoverOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [previewFile, setPreviewFile] = useState<{ url: string; type: string; name: string } | null>(null);
//   const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
//   const [confirmModalOpen, setConfirmModalOpen] = useState(false);
//   const [selectedType, setSelectedType] = useState<"notification" | "email" | "both">("notification");
//   const [isSendLater, setIsSendLater] = useState(false);

//   const MAX_FILES = 5;
//   const MAX_FILE_SIZE_MB = 5; // Maximum file size in MB
//   const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024; // Convert MB to bytes
//   const ALLOWED_TYPES = [
//     "image/jpeg",
//     "image/png",
//     "image/gif",
//     "application/pdf",
//     "text/plain",
//     "application/msword",
//     "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//   ];

//   // Compression options for images
//   const compressionOptions = {
//     maxSizeMB: 1, // Compress images to max 1MB
//     maxWidthOrHeight: 1920, // Resize to max 1920px width or height
//     useWebWorker: true,
//   };

//   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       const newFiles = Array.from(e.target.files);
//       const totalFiles = files.length + newFiles.length;

//       // Check if total files exceed the limit
//       if (totalFiles > MAX_FILES) {
//         setError(`You can only upload up to ${MAX_FILES} files.`);
//         return;
//       }

//       const validFiles: File[] = [];
//       for (const file of newFiles) {
//         // Check file size
//         if (file.size > MAX_FILE_SIZE_BYTES) {
//           setError(`File "${file.name}" exceeds ${MAX_FILE_SIZE_MB}MB and cannot be uploaded.`);
//           continue;
//         }

//         // Check file type
//         if (!ALLOWED_TYPES.includes(file.type)) {
//           setError(`File "${file.name}" is not an allowed type. Only images, PDFs, .txt, .doc, and .docx are allowed.`);
//           continue;
//         }

//         // Compress images
//         if (file.type.startsWith("image/")) {
//           try {
//             const compressedFile = await imageCompression(file, compressionOptions);
//             validFiles.push(
//               new File([compressedFile], file.name, {
//                 type: compressedFile.type,
//                 lastModified: compressedFile.lastModified,
//               })
//             );
//           } catch (err) {
//             setError(`Failed to compress "${file.name}". Please try again.`);
//             console.error(err);
//             continue;
//           }
//         } else {
//           // Non-image files (PDF, .txt, .doc, .docx) are added without compression
//           validFiles.push(file);
//         }
//       }

//       if (validFiles.length > 0) {
//         setFiles([...files, ...validFiles]);
//         setError(null);
//       } else if (!error) {
//         setError("No valid files were selected.");
//       }
//     }
//   };

//   const openScheduleModal = () => {
//     setIsSendLater(true);
//     setScheduleModalOpen(true);
//   };

//   const handleConfirmSchedule = () => {
//     if (!scheduledDate || !scheduledTime) {
//       setError("Please select both a date and time for scheduling.");
//       return;
//     }
//     const [hours, minutes] = scheduledTime.split(":").map(Number);
//     const scheduledDateTime = setHours(setMinutes(scheduledDate, minutes), hours);
//     if (scheduledDateTime < new Date()) {
//       setError("Scheduled date and time cannot be in the past.");
//       return;
//     }
//     setScheduleModalOpen(false);
//     setConfirmModalOpen(true);
//   };

//   const handleSendNowClick = () => {
//     setIsSendLater(false);
//     setConfirmModalOpen(true);
//   };

//   const handleConfirmSend = async () => {
//     setConfirmModalOpen(false);
//     setIsLoading(true);
//     setError(null);
//     try {
//       const formData = new FormData();
//       formData.append("title", title);
//       formData.append("description", description);
//       formData.append("type", selectedType);
//       formData.append("senderType", "admin");
//       files.forEach((file) => formData.append("notificationFiles", file));
//       let endpoint = "/api/notifications/sendAdminNotification";
//       if (isSendLater) {
//         const [hours, minutes] = scheduledTime.split(":").map(Number);
//         const scheduledDateTime = setHours(setMinutes(scheduledDate, minutes), hours);
//         formData.append("scheduledDate", scheduledDateTime.toISOString());
//         endpoint = "/api/notifications/schedule";
//       }

//       await axios.post(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, formData, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       alert(isSendLater ? "Notification scheduled successfully!" : "Notification sent successfully!");
//       setTitle("");
//       setDescription("");
//       setFiles([]);
//       setScheduledDate(undefined);
//       setScheduledTime("");
//       setSelectedType("notification");
//       onSuccess?.();
//     } catch (err) {
//       setError(`Failed to ${isSendLater ? "schedule" : "send"} notification. Please try again.`);
//       console.error(err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const timeOptions = Array.from({ length: 96 }, (_, i) => {
//     const hours = Math.floor(i / 4);
//     const minutes = (i % 4) * 15;
//     return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
//   });

//   const filteredTimeOptions = scheduledDate && isSameDay(scheduledDate, new Date())
//     ? timeOptions.filter((time) => {
//         const [hours, minutes] = time.split(":").map(Number);
//         const timeDate = setHours(setMinutes(new Date(), minutes), hours);
//         return timeDate > new Date();
//       })
//     : timeOptions;

//   const getFilePreview = (file: File) => {
//     const url = URL.createObjectURL(file);
//     const type = file.type;
//     const name = file.name;
//     return { url, type, name };
//   };

//   return (
//     <div className="p-4 space-y-4">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Send Manual Notification</h1>
//           <p className="text-gray-600 mt-2">Create and send notifications to users</p>
//         </div>
//       </div>
//       <Card className="w-full">
//         <CardContent className="space-y-4 pt-6">
//           {error && <p className="text-red-500">{error}</p>}
//           <div className="space-y-2">
//             <Label htmlFor="title">Notification Title</Label>
//             <Input
//               id="title"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               placeholder="Enter notification title"
//               disabled={isLoading}
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="description">Description</Label>
//             <Textarea
//               id="description"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               placeholder="Enter notification description"
//               rows={6}
//               disabled={isLoading}
//             />
//           </div>
//           <div className="space-y-2">
//             <Label htmlFor="files">Upload Files (Images, PDFs, Documents)</Label>
//             <Input
//               id="files"
//               type="file"
//               accept={ALLOWED_TYPES.join(",")}
//               multiple
//               onChange={handleFileUpload}
//               disabled={isLoading}
//             />
//             {files.length > 0 && (
//               <div className="flex flex-wrap gap-2 mt-2">
//                 {files.map((file, index) => (
//                   <div key={index} className="relative">
//                     {file.type.startsWith("image/") ? (
//                       <img
//                         src={URL.createObjectURL(file)}
//                         alt={file.name}
//                         className="h-20 w-20 object-cover rounded cursor-pointer"
//                         onClick={() => setPreviewFile(getFilePreview(file))}
//                       />
//                     ) : (
//                       <div
//                         className="h-20 w-20 bg-gray-100 flex items-center justify-center rounded cursor-pointer text-sm text-gray-600"
//                         onClick={() => setPreviewFile(getFilePreview(file))}
//                       >
//                         {file.name.split(".").pop()?.toUpperCase()}
//                       </div>
//                     )}
//                     <Button
//                       variant="destructive"
//                       size="sm"
//                       className="absolute top-0 right-0 h-6 w-6"
//                       onClick={() => setFiles(files.filter((_, i) => i !== index))}
//                       disabled={isLoading}
//                     >
//                       <X className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//           <div className="flex gap-4">
//             <Button onClick={handleSendNowClick} disabled={isLoading || !title || !description}>
//               {isLoading ? "Sending..." : "Send Now"}
//             </Button>
//             <Button
//               onClick={openScheduleModal}
//               disabled={isLoading || !title || !description}
//               variant="secondary"
//             >
//               {isLoading ? "Scheduling..." : "Send Later"}
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//       {/* File Preview Modal */}
//       <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>File Preview: {previewFile?.name}</DialogTitle>
//           </DialogHeader>
//           {previewFile && (
//             <div className="mt-4">
//               {previewFile.type.startsWith("image/") && (
//                 <img
//                   src={previewFile.url}
//                   alt={previewFile.name}
//                   className="w-full h-auto max-h-[70vh] object-contain"
//                 />
//               )}
//               {previewFile.type === "application/pdf" && (
//                 <iframe
//                   src={previewFile.url}
//                   className="w-full h-[70vh]"
//                   title={previewFile.name}
//                 />
//               )}
//               {(previewFile.type === "text/plain" ||
//                 previewFile.type === "application/msword" ||
//                 previewFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") && (
//                 <div className="p-4 bg-gray-100 rounded">
//                   <p className="text-gray-700">File: {previewFile.name}</p>
//                   <p className="text-gray-500">Type: {previewFile.type.split("/").pop()?.toUpperCase()}</p>
//                   <p className="text-gray-500">Size: {(files.find(f => f.name === previewFile.name)?.size / 1024).toFixed(2)} KB</p>
//                 </div>
//               )}
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//       {/* Schedule Modal */}
//       <Dialog open={scheduleModalOpen} onOpenChange={() => setScheduleModalOpen(false)}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Schedule Notification</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             <div className="space-y-2">
//               <Label>Pick Date</Label>
//               <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
//                 <PopoverTrigger asChild>
//                   <Button
//                     variant="outline"
//                     className="w-full justify-start text-left font-normal"
//                     disabled={isLoading}
//                   >
//                     <CalendarIcon className="mr-2 h-4 w-4" />
//                     {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-auto p-0">
//                   <Calendar
//                     mode="single"
//                     selected={scheduledDate}
//                     onSelect={(date) => {
//                       setScheduledDate(date);
//                       setIsPopoverOpen(false);
//                     }}
//                     disabled={(date) => date < new Date().setHours(0, 0, 0, 0)}
//                     initialFocus
//                   />
//                 </PopoverContent>
//               </Popover>
//             </div>
//             <div className="space-y-2">
//               <Label>Pick Time</Label>
//               <UISelect value={scheduledTime} onValueChange={setScheduledTime} disabled={isLoading}>
//                 <SelectTrigger className="w-full">
//                   <SelectValue placeholder="Pick a time" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {filteredTimeOptions.map((time) => (
//                     <SelectItem key={time} value={time}>
//                       {time}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </UISelect>
//             </div>
//           </div>
//           <DialogFooter>
//             <Button onClick={() => setScheduleModalOpen(false)} variant="outline">Cancel</Button>
//             <Button onClick={handleConfirmSchedule} disabled={!scheduledDate || !scheduledTime}>Confirm Schedule</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//       {/* Confirmation Modal */}
//       <Dialog open={confirmModalOpen} onOpenChange={() => setConfirmModalOpen(false)}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Confirm Send Option</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             <Label>Select how to send:</Label>
//             <RadioGroup value={selectedType} onValueChange={(value) => setSelectedType(value as "notification" | "email" | "both")}>
//               <div className="flex items-center space-x-2">
//                 <RadioGroupItem value="notification" id="notification" />
//                 <Label htmlFor="notification">Notification Only</Label>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <RadioGroupItem value="email" id="email" />
//                 <Label htmlFor="email">Email Only</Label>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <RadioGroupItem value="both" id="both" />
//                 <Label htmlFor="both">Both Notification and Email</Label>
//               </div>
//             </RadioGroup>
//           </div>
//           <DialogFooter>
//             <Button onClick={() => setConfirmModalOpen(false)} variant="outline">Cancel</Button>
//             <Button onClick={handleConfirmSend}>Send</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }