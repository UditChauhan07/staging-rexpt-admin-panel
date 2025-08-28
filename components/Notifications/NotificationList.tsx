"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Edit2, Trash2 } from "lucide-react";
import axios from "axios";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ManualNotification from "./ManualNotification";

interface Attachment {
  url: string;
  filename: string;
  size: number;
  type: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  status:string;
  targetPlatform:string;
  sendType:string;
  attachments: Attachment[];
  type: string;
  createdAt: string;
  scheduledDate?: string | null;
}

export default function NotificationList() {
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
   const [sendToFilter, setSendToFilter] = useState("");   // 👈 new
  const [sendModeFilter, setSendModeFilter] = useState(""); // 👈 new
   const [debouncedSearch, setDebouncedSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const notificationsPerPage = 50;

  const SERVER_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://your-server-url";

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/getAdminNotificationList`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      const mappedNotifications: Notification[] = res?.data?.notifications?.map((n: any) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        attachments: JSON.parse(n.dataPayload || "{}")?.files?.map((file: Attachment) => ({
          ...file,
          url: `${SERVER_BASE_URL}${file.url}`,
        })) || [],
        type: n.type,
        createdAt: n.createdAt,
        scheduledDate: n.scheduledDate,
        sendType: n.sendType,
        targetPlatform: n.targetPlatform,
        status: n.status,
      })) || [];

      setAllNotifications(mappedNotifications);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // useEffect(() => {
  //   let filtered = allNotifications;
  //   if (typeFilter) filtered = filtered.filter((n) => n.type === typeFilter);
  //   if (searchText.trim()) {
  //     const text = searchText.toLowerCase();
  //     filtered = filtered.filter(
  //       (n) =>
  //         n.id.toLowerCase().includes(text) ||
  //         n.title.toLowerCase().includes(text) ||
  //         n.message.toLowerCase().includes(text)
  //     );
  //   }
  //   setNotifications(filtered);
  // }, [typeFilter, searchText, allNotifications]);
    // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchText.trim().toLowerCase());
    }, 400); // delay 400ms
    return () => clearTimeout(handler);
  }, [searchText]);

  // Fetch notifications (same as yours)...

  useEffect(() => {
    let filtered = allNotifications;

    // type filter
    if (typeFilter) filtered = filtered.filter((n) => n.type.toLowerCase() === typeFilter.toLowerCase());

    // sendTo filter
    if (sendToFilter) filtered = filtered.filter((n) => n.targetPlatform.toLowerCase() === sendToFilter.toLowerCase());

    // sendMode filter
    if (sendModeFilter) filtered = filtered.filter((n) => n.sendType.toLowerCase() === sendModeFilter.toLowerCase());

    // search filter
    if (debouncedSearch) {
      filtered = filtered.filter(
        (n) =>
          n.id.toLowerCase().includes(debouncedSearch) ||
          n.title.toLowerCase().includes(debouncedSearch) ||
          n.message.toLowerCase().includes(debouncedSearch)
      );
    }

    setNotifications(filtered);
    setCurrentPage(1); // reset page when filters change
  }, [typeFilter, sendToFilter, sendModeFilter, debouncedSearch, allNotifications]);

  const clearFilters = () => {
    setTypeFilter("");
    setSendToFilter("");
    setSendModeFilter("");
    setSearchText("");
    setCurrentPage(1);
  };

  const indexOfLastNotification = currentPage * notificationsPerPage;
  const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
  const currentNotifications = notifications.slice(indexOfFirstNotification, indexOfLastNotification);
  const totalPages = Math.ceil(notifications.length / notificationsPerPage);

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "notification":
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "email":
        return "bg-green-100 text-green-800";
      case "both":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const getStatusStyle = (type: string) => {
    switch (type) {
      case "unread":
      case "read":
        return "bg-green-100 text-greeb-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isImage = (attachment: Attachment) => attachment.type.startsWith("image/");
  const isPDF = (attachment: Attachment) => attachment.type === "application/pdf";

  const handlePreview = (attachment: Attachment) => {
    setPreviewAttachment(attachment);
    setPreviewModalOpen(true);
  };

  const handleEdit = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsEditModalOpen(true);
  };

  const handleDelete = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedNotification) return;
    setIsLoading(true);
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/delete/${selectedNotification.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Notification deleted successfully!");
      setIsDeleteModalOpen(false);
      setSelectedNotification(null);
      fetchNotifications(); // Refresh the list
    } catch (err) {
      console.error("Failed to delete notification", err);
      alert("Failed to delete notification. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notification List</h1>
          <p className="text-gray-600 mt-2">View and manage all sent and scheduled notifications</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700"
        onClick={() => setIsCreateModalOpen(true)}>Create New Notification</Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-4 md:grid-cols-4 gap-2">
        <Input placeholder="Search Notification ID, Title ... " value={searchText} onChange={(e) => setSearchText(e.target.value)} />
              <Select value={sendToFilter} onValueChange={setSendToFilter}>
          <SelectTrigger><SelectValue placeholder="Filter by Send To" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Free">Free</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="payG">payG</SelectItem>
            <SelectItem value="Starter">Starter</SelectItem>
            <SelectItem value="Scaler">Scaler</SelectItem>
            <SelectItem value="Growth">Growth</SelectItem>
            <SelectItem value="Corporate">Corporate</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sendModeFilter} onValueChange={setSendModeFilter}>
          <SelectTrigger><SelectValue placeholder="Filter by Send Mode" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="notification">Notification</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="both">Email & Notification</SelectItem>
          </SelectContent>
        </Select>
        
        {/* <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger><SelectValue placeholder="Filter by Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="notification">Notification</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select> */}
        <Button className="bg-purple-600 hover:bg-purple-700"
        onClick={clearFilters}>Clear Filters</Button>
      </div>

      {/* Table */}
      <Card className="w-full">
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Notification ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                {/* <TableHead>Type</TableHead> */}
                <TableHead>Status</TableHead>
                <TableHead>Send To(Users)</TableHead>
                <TableHead>Send Mode</TableHead>

                {/* <TableHead>Attachments</TableHead> */}
                <TableHead>Created At</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentNotifications.map((n) => (
                <TableRow key={n.id}>
                  <TableCell>{n.id}</TableCell>
                  <TableCell>{n.title}</TableCell>
                  <TableCell>{n.message}</TableCell>
                  {/* <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeStyle(n.type)}`}>
                      {n.type.charAt(0).toUpperCase() + n.type.slice(1)}
                    </span>
                  </TableCell> */}
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(n.status)}`}>
                      {n.status=='unread'?'Sent':n?.status?.charAt(0)?.toUpperCase() + n?.status?.slice(1)}
                    </span>
                  </TableCell>
                   <TableCell>{n.targetPlatform?.charAt(0)?.toUpperCase() + n?.targetPlatform?.slice(1)}</TableCell>
                   <TableCell>{n.sendType=='both'?'Email & Notification':n.sendType?.charAt(0)?.toUpperCase() + n?.sendType?.slice(1)}</TableCell>
                  {/* <TableCell>
                    {n.attachments.length > 0 ? (
                      n.attachments.map((attachment, idx) => (
                        <div key={idx} className="mb-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePreview(attachment)}
                          >
                            View {attachment.filename}
                          </Button>
                        </div>
                      ))
                    ) : (
                      "No Attachments"
                    )}
                  </TableCell> */}
                  <TableCell>{new Date(n.createdAt).toLocaleString("en-GB")}</TableCell>
                  <TableCell>{n.scheduledDate ? new Date(n.scheduledDate)?.toLocaleString("en-GB") : "N/A"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {/* <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(n)}
                              // disabled={isLoading || !n.scheduledDate || new Date(n.scheduledDate) <= new Date()}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button> */}
                            <div className="inline-block">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(n)}
                                disabled={isLoading || !n.scheduledDate || new Date(n.scheduledDate) <= new Date()}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {/* <p>Edit Notification</p> */}
                            <p>
                          {(!n.scheduledDate || new Date(n.scheduledDate) <= new Date())
                            ? "Cannot edit past notifications"
                            : "Edit Notification"
                         }
                        </p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(n)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete Notification</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Showing {indexOfFirstNotification + 1} to {Math.min(indexOfLastNotification, notifications.length)} of {notifications.length}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-3 py-1 text-sm bg-gray-100 rounded">{currentPage} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Notification Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Notification</DialogTitle>
          </DialogHeader>
          <ManualNotification onSuccess={() => { setIsCreateModalOpen(false); fetchNotifications(); }} />
        </DialogContent>
      </Dialog>

      {/* Edit Notification Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={() => { setIsEditModalOpen(false); setSelectedNotification(null); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Notification</DialogTitle>
          </DialogHeader>
          {selectedNotification && (
            <ManualNotification
              notification={selectedNotification}
              onSuccess={() => { setIsEditModalOpen(false); setSelectedNotification(null); fetchNotifications(); }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={() => { setIsDeleteModalOpen(false); setSelectedNotification(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete the notification "<strong>{selectedNotification?.title}</strong>"?</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attachment Preview Modal */}
      <Dialog open={previewModalOpen} onOpenChange={() => setPreviewModalOpen(false)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Attachment Preview</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {previewAttachment ? (
              <>
                <p><strong>Filename:</strong> {previewAttachment.filename}</p>
                {isImage(previewAttachment) ? (
                  <img
                    src={previewAttachment.url}
                    alt={previewAttachment.filename}
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />
                ) : isPDF(previewAttachment) ? (
                  <iframe
                    src={previewAttachment.url}
                    title={previewAttachment.filename}
                    className="w-full h-[70vh]"
                  />
                ) : (
                  <div>
                    <p>Preview not available for this file type.</p>
                    <a
                      href={previewAttachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Download {previewAttachment.filename}
                    </a>
                  </div>
                )}
              </>
            ) : (
              <p>No attachment selected.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


// 

// "use client";

// import { useEffect, useState } from "react";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import axios from "axios";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Card, CardContent } from "@/components/ui/card";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { format } from "date-fns";
// import { useRouter } from "next/navigation";

// interface Notification {
//   id: string;
//   title: string;
//   description: string;
//   images: string[];
//   type: "notification" | "email" | "both";
//   createdAt: string;
//   scheduledDate?: string;
// }

// export default function NotificationList() {
//   const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [searchText, setSearchText] = useState("");
//   const [typeFilter, setTypeFilter] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [previewImages, setPreviewImages] = useState<string[]>([]);
//   const [previewModalOpen, setPreviewModalOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();
//   const notificationsPerPage = 50;

//   const fetchNotifications = async () => {
//     setIsLoading(true);
//     try {
//       const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/get_notifications_by_admin`, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       });
//       setAllNotifications(res.data.notifications);
//     } catch (err) {
//       console.error("Failed to fetch notifications", err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchNotifications();
//   }, []);

//   useEffect(() => {
//     let filtered = allNotifications;

//     if (typeFilter) {
//       filtered = filtered.filter((notification) => notification.type === typeFilter);
//     }

//     if (searchText.trim()) {
//       const text = searchText.toLowerCase();
//       filtered = filtered.filter(
//         (notification) =>
//           notification.id.toLowerCase().includes(text) ||
//           notification.title.toLowerCase().includes(text) ||
//           notification.description.toLowerCase().includes(text)
//       );
//     }

//     setNotifications(filtered);
//   }, [typeFilter, searchText, allNotifications]);

//   const indexOfLastNotification = currentPage * notificationsPerPage;
//   const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
//   const currentNotifications = notifications.slice(indexOfFirstNotification, indexOfLastNotification);
//   const totalPages = Math.ceil(notifications.length / notificationsPerPage);

//   const getTypeStyle = (type: string) => {
//     switch (type) {
//       case "notification":
//         return "bg-blue-100 text-blue-800";
//       case "email":
//         return "bg-green-100 text-green-800";
//       case "both":
//         return "bg-purple-100 text-purple-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   return (
//     <div className="p-4 space-y-4">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Notification List</h1>
//           <p className="text-gray-600 mt-2">View and manage all sent and scheduled notifications</p>
//         </div>
//         <Button onClick={() => router.push("/notifications/create")}>
//           Create New Notification
//         </Button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
//         <Input
//           placeholder="Search by ID, Title, or Description"
//           value={searchText}
//           onChange={(e) => setSearchText(e.target.value)}
//         />
//         <Select value={typeFilter} onValueChange={setTypeFilter}>
//           <SelectTrigger>
//             <SelectValue placeholder="Filter by Type" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="notification">Notification</SelectItem>
//             <SelectItem value="email">Email</SelectItem>
//             <SelectItem value="both">Both</SelectItem>
//           </SelectContent>
//         </Select>
//         <Button onClick={() => { setTypeFilter(""); setSearchText(""); setCurrentPage(1); }}>
//           Clear Filters
//         </Button>
//       </div>

//       <Card className="w-full">
//         <CardContent className="pt-6">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="text-left py-3 px-4 font-semibold text-gray-700">Notification ID</TableHead>
//                 <TableHead className="text-left py-3 px-4 font-semibold text-gray-700">Title</TableHead>
//                 <TableHead className="text-left py-3 px-4 font-semibold text-gray-700">Description</TableHead>
//                 <TableHead className="text-left py-3 px-4 font-semibold text-gray-700">Type</TableHead>
//                 <TableHead className="text-left py-3 px-4 font-semibold text-gray-700">Images</TableHead>
//                 <TableHead className="text-left py-3 px-4 font-semibold text-gray-700">Created At</TableHead>
//                 <TableHead className="text-left py-3 px-4 font-semibold text-gray-700">Scheduled Date</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {currentNotifications.map((notification) => (
//                 <TableRow key={notification.id}>
//                   <TableCell style={{ border: "unset" }}>{notification.id}</TableCell>
//                   <TableCell>{notification.title}</TableCell>
//                   <TableCell>{notification.description}</TableCell>
//                   <TableCell>
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeStyle(notification.type)}`}>
//                       {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
//                     </span>
//                   </TableCell>
//                   <TableCell>
//                     {notification.images.length > 0 ? (
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => {
//                           setPreviewImages(notification.images);
//                           setPreviewModalOpen(true);
//                         }}
//                       >
//                         View Images
//                       </Button>
//                     ) : (
//                       "No Images"
//                     )}
//                   </TableCell>
//                   <TableCell>
//                     {new Date(notification.createdAt).toLocaleString("en-GB", {
//                       day: "2-digit",
//                       month: "long",
//                       year: "numeric",
//                       hour: "2-digit",
//                       minute: "2-digit",
//                       hour12: false,
//                     })}
//                   </TableCell>
//                   <TableCell>
//                     {notification.scheduledDate
//                       ? new Date(notification.scheduledDate).toLocaleString("en-GB", {
//                           day: "2-digit",
//                           month: "long",
//                           year: "numeric",
//                           hour: "2-digit",
//                           minute: "2-digit",
//                           hour12: false,
//                         })
//                       : "N/A"}
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//           <div className="flex items-center justify-between mt-6">
//             <div className="text-sm text-gray-600">
//               Showing {indexOfFirstNotification + 1} to{" "}
//               {Math.min(indexOfLastNotification, notifications.length)} of {notifications.length} notifications
//             </div>
//             <div className="flex gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
//                 disabled={currentPage === 1}
//               >
//                 <ChevronLeft className="h-4 w-4" />
//               </Button>
//               <span className="px-3 py-1 text-sm bg-gray-100 rounded">
//                 {currentPage} of {totalPages}
//               </span>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
//                 disabled={currentPage === totalPages}
//               >
//                 <ChevronRight className="h-4 w-4" />
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       <Dialog open={previewModalOpen} onOpenChange={() => setPreviewModalOpen(false)}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Image Preview</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             {previewImages.map((image, index) => (
//               <img
//                 key={index}
//                 src={image}
//                 alt={`Preview ${index}`}
//                 className="w-full h-auto max-h-[70vh] object-contain"
//               />
//             ))}
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// NotificationList.tsx
// "use client";

// import { useEffect, useState } from "react";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import axios from "axios";
// import {
//   Table, TableBody, TableCell, TableHead, TableHeader, TableRow
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Card, CardContent } from "@/components/ui/card";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import ManualNotification from "./ManualNotification"; // ✅ import form as a component

// interface Notification {
//   id: string;
//   title: string;
//   description: string;
//   images: string[];
//   type: "notification" | "email" | "both";
//   createdAt: string;
//   scheduledDate?: string;
// }

// export default function NotificationList() {
//   const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [searchText, setSearchText] = useState("");
//   const [typeFilter, setTypeFilter] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [previewImages, setPreviewImages] = useState<string[]>([]);
//   const [previewModalOpen, setPreviewModalOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // ✅ new state
//   const notificationsPerPage = 50;

//   const fetchNotifications = async () => {
//     setIsLoading(true);
//     try {
//       const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/getAdminNotificationList`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//       });
//       console.log('res',res)
//       setAllNotifications(res?.data?.notifications||[]);
//     } catch (err) {
//       console.error("Failed to fetch notifications", err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => { fetchNotifications(); }, []);

//   useEffect(() => {
//     let filtered = allNotifications;
//     if (typeFilter) filtered = filtered.filter((n) => n.type === typeFilter);
//     if (searchText.trim()) {
//       const text = searchText.toLowerCase();
//       filtered = filtered.filter(
//         (n) =>
//           n.id.toLowerCase().includes(text) ||
//           n.title.toLowerCase().includes(text) ||
//           n.description.toLowerCase().includes(text)
//       );
//     }
//     setNotifications(filtered);
//   }, [typeFilter, searchText, allNotifications]);

//   const indexOfLastNotification = currentPage * notificationsPerPage;
//   const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
//   const currentNotifications = notifications.slice(indexOfFirstNotification, indexOfLastNotification);
//   const totalPages = Math.ceil(notifications.length / notificationsPerPage);

//   const getTypeStyle = (type: string) => {
//     switch (type) {
//       case "notification": return "bg-blue-100 text-blue-800";
//       case "email": return "bg-green-100 text-green-800";
//       case "both": return "bg-purple-100 text-purple-800";
//       default: return "bg-gray-100 text-gray-800";
//     }
//   };

//   return (
//     <div className="p-4 space-y-4">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Notification List</h1>
//           <p className="text-gray-600 mt-2">View and manage all sent and scheduled notifications</p>
//         </div>
//         <Button onClick={() => setIsCreateModalOpen(true)}>Create New Notification</Button>
//       </div>

//       {/* Filters */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
//         <Input placeholder="Search..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
//         <Select value={typeFilter} onValueChange={setTypeFilter}>
//           <SelectTrigger><SelectValue placeholder="Filter by Type" /></SelectTrigger>
//           <SelectContent>
//             <SelectItem value="notification">Notification</SelectItem>
//             <SelectItem value="email">Email</SelectItem>
//             <SelectItem value="both">Both</SelectItem>
//           </SelectContent>
//         </Select>
//         <Button onClick={() => { setTypeFilter(""); setSearchText(""); setCurrentPage(1); }}>Clear Filters</Button>
//       </div>

//       {/* Table */}
//       <Card className="w-full">
//         <CardContent className="pt-6">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Notification ID</TableHead>
//                 <TableHead>Title</TableHead>
//                 <TableHead>Description</TableHead>
//                 <TableHead>Type</TableHead>
//                 <TableHead>Attachements</TableHead>
//                 <TableHead>Created At</TableHead>
//                 <TableHead>Scheduled Date</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {currentNotifications.map((n) => (
//                 <TableRow key={n.id}>
//                   <TableCell>{n.id}</TableCell>
//                   <TableCell>{n.title}</TableCell>
//                   <TableCell>{n.message}</TableCell>
//                   <TableCell>
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeStyle(n.type)}`}>
//                       {n.type.charAt(0).toUpperCase() + n.type.slice(1)}
//                     </span>
//                   </TableCell>
//                   <TableCell>
//                     {JSON.parse(n?.dataPayload || "{}")?.files?.length > 0  ? (
//                       <Button variant="outline" size="sm" onClick={() => { setPreviewImages(n.images); setPreviewModalOpen(true); }}>
//                         View Attachement
//                       </Button>
//                     ) : "No Attachement"}
//                   </TableCell>
//                   <TableCell>{new Date(n.createdAt).toLocaleString("en-GB")}</TableCell>
//                   <TableCell>{n.scheduledDate ? new Date(n.scheduledDate).toLocaleString("en-GB") : "N/A"}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>

//           {/* Pagination */}
//           <div className="flex items-center justify-between mt-6">
//             <div className="text-sm text-gray-600">
//               Showing {indexOfFirstNotification + 1} to {Math.min(indexOfLastNotification, notifications.length)} of {notifications.length}
//             </div>
//             <div className="flex gap-2">
//               <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
//                 <ChevronLeft className="h-4 w-4" />
//               </Button>
//               <span className="px-3 py-1 text-sm bg-gray-100 rounded">{currentPage} of {totalPages}</span>
//               <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
//                 <ChevronRight className="h-4 w-4" />
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Create Notification Modal */}
//       <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
//         <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>Create New Notification</DialogTitle>
//           </DialogHeader>
//           <ManualNotification onSuccess={() => { setIsCreateModalOpen(false); fetchNotifications(); }} />
//         </DialogContent>
//       </Dialog>

//       {/* Image Preview Modal */}
//       <Dialog open={previewModalOpen} onOpenChange={() => setPreviewModalOpen(false)}>
//         <DialogContent>
//           <DialogHeader><DialogTitle>Image Preview</DialogTitle></DialogHeader>
//           <div className="space-y-4">
//             {previewImages.map((image, idx) => (
//               <img key={idx} src={image} alt={`Preview ${idx}`} className="w-full h-auto max-h-[70vh] object-contain" />
//             ))}
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// "use client";

// import { useEffect, useState } from "react";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import axios from "axios";
// import {
//   Table, TableBody, TableCell, TableHead, TableHeader, TableRow
// } from "@/components/ui/table";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Card, CardContent } from "@/components/ui/card";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import ManualNotification from "./ManualNotification";

// // Define the Attachment interface
// interface Attachment {
//   url: string;
//   filename: string;
//   size: number;
//   type: string;
// }

// // Update Notification interface to include attachments
// interface Notification {
//   id: string;
//   title: string;
//   message: string;
//   attachments: Attachment[];
//   type: string; // Changed to string to match server response ("admin", etc.)
//   createdAt: string;
//   scheduledDate?: string | null;
// }

// export default function NotificationList() {
//   const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [searchText, setSearchText] = useState("");
//   const [typeFilter, setTypeFilter] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
//   const [previewModalOpen, setPreviewModalOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//   const notificationsPerPage = 50;

//   // Server base URL for attachments
//   const SERVER_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://your-server-url"; // Replace with your actual server URL

//   const fetchNotifications = async () => {
//     setIsLoading(true);
//     try {
//       const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/getAdminNotificationList`, {
//         headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//       });

//       // Map the server response to the Notification interface
//       const mappedNotifications: Notification[] = res?.data?.notifications?.map((n: any) => ({
//         id: n.id,
//         title: n.title,
//         message: n.message,
//         attachments: JSON.parse(n.dataPayload || "{}")?.files?.map((file: Attachment) => ({
//           ...file,
//           url: `${SERVER_BASE_URL}${file.url}`, // Prepend server base URL
//         })) || [],
//         type: n.type,
//         createdAt: n.createdAt,
//         scheduledDate: n.scheduledDate,
//       })) || [];

//       setAllNotifications(mappedNotifications);
//     } catch (err) {
//       console.error("Failed to fetch notifications", err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchNotifications();
//   }, []);

//   useEffect(() => {
//     let filtered = allNotifications;
//     if (typeFilter) filtered = filtered.filter((n) => n.type === typeFilter);
//     if (searchText.trim()) {
//       const text = searchText.toLowerCase();
//       filtered = filtered.filter(
//         (n) =>
//           n.id.toLowerCase().includes(text) ||
//           n.title.toLowerCase().includes(text) ||
//           n.message.toLowerCase().includes(text)
//       );
//     }
//     setNotifications(filtered);
//   }, [typeFilter, searchText, allNotifications]);

//   const indexOfLastNotification = currentPage * notificationsPerPage;
//   const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage;
//   const currentNotifications = notifications.slice(indexOfFirstNotification, indexOfLastNotification);
//   const totalPages = Math.ceil(notifications.length / notificationsPerPage);

//   const getTypeStyle = (type: string) => {
//     switch (type) {
//       case "notification":
//       case "admin":
//         return "bg-blue-100 text-blue-800";
//       case "email":
//         return "bg-green-100 text-green-800";
//       case "both":
//         return "bg-purple-100 text-purple-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   // Determine if the attachment is an image or PDF
//   const isImage = (attachment: Attachment) => attachment.type.startsWith("image/");
//   const isPDF = (attachment: Attachment) => attachment.type === "application/pdf";

//   // Handle attachment preview
//   const handlePreview = (attachment: Attachment) => {
//     console.log('attachment,attachment',attachment)
//     setPreviewAttachment(attachment);
//     setPreviewModalOpen(true);
//   };

//   return (
//     <div className="p-4 space-y-4">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Notification List</h1>
//           <p className="text-gray-600 mt-2">View and manage all sent and scheduled notifications</p>
//         </div>
//         <Button onClick={() => setIsCreateModalOpen(true)}>Create New Notification</Button>
//       </div>

//       {/* Filters */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
//         <Input placeholder="Search..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
//         <Select value={typeFilter} onValueChange={setTypeFilter}>
//           <SelectTrigger><SelectValue placeholder="Filter by Type" /></SelectTrigger>
//           <SelectContent>
//             <SelectItem value="admin">Admin</SelectItem>
//             <SelectItem value="notification">Notification</SelectItem>
//             <SelectItem value="email">Email</SelectItem>
//             <SelectItem value="both">Both</SelectItem>
//           </SelectContent>
//         </Select>
//         <Button onClick={() => { setTypeFilter(""); setSearchText(""); setCurrentPage(1); }}>Clear Filters</Button>
//       </div>

//       {/* Table */}
//       <Card className="w-full">
//         <CardContent className="pt-6">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Notification ID</TableHead>
//                 <TableHead>Title</TableHead>
//                 <TableHead>Description</TableHead>
//                 <TableHead>Type</TableHead>
//                 <TableHead>Attachments</TableHead>
//                 <TableHead>Created At</TableHead>
//                 <TableHead>Scheduled Date</TableHead>
//                 <TableHead>Action</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {currentNotifications.map((n) => (
//                 <TableRow key={n.id}>
//                   <TableCell>{n.id}</TableCell>
//                   <TableCell>{n.title}</TableCell>
//                   <TableCell>{n.message}</TableCell>
//                   <TableCell>
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeStyle(n.type)}`}>
//                       {n.type.charAt(0).toUpperCase() + n.type.slice(1)}
//                     </span>
//                   </TableCell>
//                   <TableCell>
//                     {n.attachments.length > 0 ? (
//                       n.attachments.map((attachment, idx) => (
//                         <div key={idx} className="mb-2">
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => handlePreview(attachment)}
//                           >
//                             View {attachment.filename}
//                           </Button>
//                         </div>
//                       ))
//                     ) : (
//                       "No Attachments"
//                     )}
//                   </TableCell>
//                   <TableCell>{new Date(n.createdAt).toLocaleString("en-GB")}</TableCell>
//                   <TableCell>{n.scheduledDate ? new Date(n.scheduledDate).toLocaleString("en-GB") : "N/A"}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>

//           {/* Pagination */}
//           <div className="flex items-center justify-between mt-6">
//             <div className="text-sm text-gray-600">
//               Showing {indexOfFirstNotification + 1} to {Math.min(indexOfLastNotification, notifications.length)} of {notifications.length}
//             </div>
//             <div className="flex gap-2">
//               <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
//                 <ChevronLeft className="h-4 w-4" />
//               </Button>
//               <span className="px-3 py-1 text-sm bg-gray-100 rounded">{currentPage} of {totalPages}</span>
//               <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
//                 <ChevronRight className="h-4 w-4" />
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Create Notification Modal */}
//       <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
//         <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>Create New Notification</DialogTitle>
//           </DialogHeader>
//           <ManualNotification onSuccess={() => { setIsCreateModalOpen(false); fetchNotifications(); }} />
//         </DialogContent>
//       </Dialog>

//       {/* Attachment Preview Modal */}
//       <Dialog open={previewModalOpen} onOpenChange={() => setPreviewModalOpen(false)}>
//         <DialogContent>
//           <DialogHeader><DialogTitle>Attachment Preview</DialogTitle></DialogHeader>
//           <div className="space-y-4">
//             {previewAttachment ? (
//               <>
//                 <p><strong>Filename:</strong> {previewAttachment.filename}</p>
//                 {isImage(previewAttachment) ? (
//                   <img
//                     src={previewAttachment.url}
//                     alt={previewAttachment.filename}
//                     className="w-full h-auto max-h-[70vh] object-contain"
//                   />
//                 ) : isPDF(previewAttachment) ? (
//                   <iframe
//                     src={previewAttachment.url}
//                     title={previewAttachment.filename}
//                     className="w-full h-[70vh]"
//                   />
//                 ) : (
//                   <div>
//                     <p>Preview not available for this file type.</p>
//                     <a
//                       href={previewAttachment.url}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-600 underline"
//                     >
//                       Download {previewAttachment.filename}
//                     </a>
//                   </div>
//                 )}
//               </>
//             ) : (
//               <p>No attachment selected.</p>
//             )}
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }