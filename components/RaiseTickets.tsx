"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react"; // Make sure this is imported

import axios from "axios";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RaiseTicketModal from "@/components/RaiseTicketModal";
import AdminActionModal from "./AdminActionModal";
import AttachmentPreviewModal from "./AttachmentPreviewModal";

export default function RaiseTickets() {
    const [allTickets, setAllTickets] = useState([]);
    const [searchText, setSearchText] = useState("");
  const [tickets, setTickets] = useState([]);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const userId=localStorage.getItem("userId");
  const [currentPage, setCurrentPage] = useState(1);
 const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
const [adminModalOpen, setAdminModalOpen] = useState(false);
const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
const [selectedAttachments, setSelectedAttachments] = useState([]);
const ticketsPerPage = 50;

  const getStatusStyle = (status: string) => {
  switch (status) {
    case "Open":
      return "bg-blue-100 text-blue-800";
    case "In Progress":
      return "bg-yellow-100 text-yellow-800";
    case "Resolved":
      return "bg-green-100 text-green-800";
    case "Reopened":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

  const fetchTickets = async () => {
    try {   
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets/get_tickets_by_admin`,{
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },  
      });
    //   console.log("Tickets fetched", res.data.tickets);
      setAllTickets(res.data.tickets);
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    }
  };

  useEffect(() => {
    if(!userId)return;
    fetchTickets();
  }, [userId]);
  useEffect(() => {
  let filtered = allTickets;

  if (status) {
    filtered = filtered.filter(ticket => ticket.status === status);
  }

  if (priority) {
    filtered = filtered.filter(ticket => ticket.priority === priority);
  }
    if (searchText.trim()) {
    const text = searchText.toLowerCase();
    filtered = filtered.filter(
      (ticket) =>
        ticket.ticketId.toLowerCase().includes(text) ||
        ticket.subject.toLowerCase().includes(text) ||
        ticket.userId.toLowerCase().includes(text) 

    );
  }


  setTickets(filtered);
}, [status, priority, allTickets,searchText]);

const indexOfLastTicket = currentPage * ticketsPerPage;
const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
const currentTickets = tickets.slice(indexOfFirstTicket, indexOfLastTicket);
const totalPages = Math.ceil(tickets.length / ticketsPerPage);

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
        <h1 className="text-3xl font-bold text-gray-900">Raised Tickets</h1>
         <p className="text-gray-600 mt-2">Manage all raised tickets </p>
        </div>
        {/* <Button onClick={() => setModalOpen(true)}>Raise New Ticket</Button> */}
      </div>

         <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            <CardTitle>All Users</CardTitle>
        {/* <Input placeholder="Search" value={userId} onChange={(e) => setUserId(e.target.value)} /> */}
        <Input
            placeholder="Search by Ticket ID or Subject"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            />

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
            <SelectItem value="Reopened">Reopened</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
          </SelectContent>
        </Select>

        {/* <Input placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} /> */}
        <Button onClick={()=>{setPriority("");setStatus("");setCurrentPage(1);}}>Clear Filter</Button>
      </div>

      <Card className="overflow-x-auto">
        <Table style={{padding:'5px'}}>

          {/* <CardHeader>
           </CardHeader> */}
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Ticket ID</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Priority</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">User ID</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Raised by</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Attachments</th>
               <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
               <th className="text-left py-3 px-4 font-semibold text-gray-700">Ticket Raised</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Last Activity</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Resolution Note</th>
            </tr>
        
          <tbody>
            {currentTickets.map((ticket) => (
              <TableRow key={ticket?.ticketId}>
                <TableCell style={{border:'unset'}}>{ticket?.ticketId}</TableCell>
                <TableCell>{ticket?.subject}</TableCell>
                <TableCell>{ticket?.priority}</TableCell>
                        <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-pointer">{ticket?.userId}</span>
                      </TooltipTrigger>
                      <TooltipContent side="top" align="center">
                        {ticket?.user?.name || "Unknown user"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>{ticket?.user?.isUserType === 2 || ticket?.user?.isUserType === 3 ? 'Partner' : 'User'}
                </TableCell>
                <TableCell>{ticket?.category}</TableCell>
                <TableCell><Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        console.log("View attachments", ticket.attachments);
                        setSelectedAttachments(ticket.attachments);
                        setAttachmentModalOpen(true);
                    }}
                    >
                    View Attachments
                    </Button>
                </TableCell>
                <TableCell>  
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(ticket?.status)}`}                >
                {ticket?.status}
                </span>
                </TableCell>
                <TableCell>  {new Date(ticket?.createdAt).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                })}
                </TableCell>
                <TableCell>  {new Date(ticket?.updatedAt).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                })}
                </TableCell>
                <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                  setSelectedTicketId(ticket?.ticketId);
                  setAdminModalOpen(true);
                  }}
                >
                  Take Action
                </Button>
              </TableCell>
              <TableCell>{ticket?.resolutionNotes}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
            <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
                Showing {indexOfFirstTicket + 1} to{" "}
                {Math.min(indexOfLastTicket, tickets.length)} of {tickets.length} tickets
            </div>
            <div className="flex gap-2">
                <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                >
                <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3 py-1 text-sm bg-gray-100 rounded">
                {currentPage} of {totalPages}
                </span>
                <Button
                variant="outline"         
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                >
                <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
            </div>

      </Card>
      
     <AdminActionModal
      isOpen={adminModalOpen}
      onClose={() => setAdminModalOpen(false)}
      ticketId={selectedTicketId}
      onSuccess={() => {
        fetchTickets();
        setAdminModalOpen(false);
      }}
    />
      <AttachmentPreviewModal
        isOpen={attachmentModalOpen}
        onClose={() => setAttachmentModalOpen(false)}
        attachments={selectedAttachments}
        />
    </div>
  );
}
// 