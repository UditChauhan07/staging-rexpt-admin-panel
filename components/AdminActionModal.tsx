// // components/AdminActionModal.tsx
// "use client";

// import { useState } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea";
// import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import axios from "axios";
// import Swal from "sweetalert2";

// interface AdminActionModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   ticketId: string | null;
//   onSuccess: () => void;
// }

// export default function AdminActionModal({
//   isOpen,
//   onClose,
//   ticketId,
//   onSuccess,
// }: AdminActionModalProps) {
//   const [status, setStatus] = useState("");
//   const [description, setDescription] = useState("");
//   const [resolvedBy, setResolvedBy] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async () => {
//     if (!ticketId || !status.trim() || !description.trim() || !resolvedBy.trim()) {
//     Swal.fire("Error","All fields are required!","error");
//     return;
//   }
//     if (!ticketId) return;
//     setLoading(true);
//     try {
//       await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/tickets/update_ticket_status_by_admin`, {
//         ticketId,
//         status,
//         resolutionNotes:description,
//         resolvedBy:localStorage.getItem("userId"),
//         role:"Admin"
//         }
//        , {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       });

//       onSuccess();
//     } catch (err) {
//       console.error("Error updating ticket:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-md">
//         <DialogHeader>
//           <DialogTitle>Admin Ticket Action</DialogTitle>
//         </DialogHeader>

//         <Select value={status} onValueChange={setStatus}>
//           <SelectTrigger>
//             <SelectValue placeholder="Select Status" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="In Progress">In Progress</SelectItem>
//             <SelectItem value="Resolved">Resolved</SelectItem>
//             <SelectItem value="Closed">Closed</SelectItem>
//             <SelectItem value="Reopened">Reopened</SelectItem>
//           </SelectContent>
//         </Select>
//         <Textarea
//           placeholder="Add resolution details..."
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//         />

//         <Input
//           placeholder="Resolved By (Admin Name)"
//           value={resolvedBy}
//           onChange={(e) => setResolvedBy(e.target.value)}
//         />

//         <Button className="w-full mt-3" onClick={handleSubmit} disabled={loading || !status}>
//           {loading ? "Submitting..." : "Submit"}
//         </Button>
//       </DialogContent>
//     </Dialog>
//   );
// }



"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import axios from "axios";

interface AdminActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string | null;
  onSuccess: () => void;
}

export default function AdminActionModal({
  isOpen,
  onClose,
  ticketId,
  onSuccess,
}: AdminActionModalProps) {
  const [status, setStatus] = useState("");
  const [description, setDescription] = useState("");
//   const [resolvedBy, setResolvedBy] = useState("");
  const [loading, setLoading] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    // check if all required fields are filled
    const valid =
      status.trim() !== "" &&
      description.trim() !== "" ;
    //   resolvedBy.trim() !== "";
    setIsFormValid(valid);
  }, [status, description]);

  const handleSubmit = async () => {
    if (!ticketId || !isFormValid) {
      console.warn("All fields required");
      return;
    }

    setLoading(true);
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tickets/update_ticket_status_by_admin`,
        {
          ticketId,
          status,
          resolutionNotes: description,
          resolvedBy: localStorage.getItem("userId"),
          role: "Admin",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setDescription("");
      setStatus("");

      onSuccess();
    } catch (err) {
      console.error("Error updating ticket:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Admin Ticket Action</DialogTitle>
        </DialogHeader>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
            <SelectItem value="Reopened">Reopened</SelectItem>
          </SelectContent>
        </Select>

        <Textarea
          placeholder="Add resolution details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
{/* 
        <Input
          placeholder="Resolved By (Admin Name)"
          value={resolvedBy}
          onChange={(e) => setResolvedBy(e.target.value)}
        /> */}

        <Button
          className="w-full mt-3"
          onClick={handleSubmit}
          disabled={loading || !isFormValid}
        >
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
