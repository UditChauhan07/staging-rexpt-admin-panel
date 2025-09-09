"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, CheckCircle, X, Loader2 } from "lucide-react";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import Swal from "sweetalert2";
import axios from "axios";
import { validateWebsite, listSiteMap } from "@/Services/auth";
import StepWrapper from "./StepWrapper";

interface Business {
  id: string;
  type: string;
  subtype: string;
  icon: string;
  name: string;
  size: string;
  services: string[];
  customServices: string[];
  email: string;
  address: string;
  phone: string;
  website: string;
  googleBusiness: string;
  about: string;
  addressComponents: any[];
}

interface FormData {
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    referalName: string;
    password: string;
  };
  business?: Business;
}

interface BusinessDetailsStepProps {
  data: FormData;
  onUpdate: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  editingBusiness?: Business | null; // Added for edit mode
  fetchBusinesses: () => void; // Added for updating business list
}

const allBusinessTypes = [
  { type: "Real Estate Broker", subtype: "Property Transaction Facilitator", icon: "svg/Estate-icon.svg" },
  { type: "Restaurant", subtype: "Food Service Establishment", icon: "svg/Restaurant-icon.svg" },
  { type: "Interior Designer", subtype: "Indoor Space Beautifier", icon: "svg/Interior-Designer-icon.svg" },
  { type: "Saloon", subtype: "Hair Styling & Grooming", icon: "svg/Saloon-icon.svg" },
  { type: "Landscaping Company", subtype: "Outdoor Space Beautification", icon: "svg/Landscaping-icon.svg" },
  { type: "Dentist", subtype: "Dental Care Provider", icon: "svg/Dentist-Office-icon.svg" },
  { type: "Doctor's Clinic", subtype: "Medical Consultation & Treatment", icon: "svg/Doctor-clinic-icon.svg" },
  { type: "Gym & Fitness Center", subtype: "Exercise Facility & Training", icon: "svg/Gym-icon.svg" },
  { type: "Personal Trainer", subtype: "Individual Fitness Coaching", icon: "svg/Personal-Trainer-icon.svg" },
  { type: "Web Design Agency", subtype: "Website Creation & Development", icon: "svg/Web-Design-Agency-icon.svg" },
  { type: "Architect", subtype: "Building Design Expert", icon: "svg/Architect-icon.svg" },
  { type: "Property Rental & Leasing Service", subtype: "Property Rental Management", icon: "svg/Property Rental & Leasing Service.svg" },
  { type: "Construction Services", subtype: "Building Construction & Repair", icon: "svg/Construction Services.svg" },
  { type: "Insurance Agency", subtype: "Risk Protection Provider", icon: "svg/Insurance Agency.svg" },
  { type: "Old Age Home", subtype: "Senior Living Facility", icon: "svg/Old Age Home.svg" },
  { type: "Travel Agency", subtype: "Trip Planning & Booking", icon: "svg/Travel Agency.svg" },
  { type: "Ticket Booking", subtype: "Travel Ticket Provider", icon: "svg/Ticket Booking.svg" },
  { type: "Accounting Services", subtype: "Financial Record Management", icon: "svg/Accounting Services.svg" },
  { type: "Financial Planners", subtype: "Wealth Management Advice", icon: "svg/Financial Planners.svg" },
  { type: "Beauty Parlour", subtype: "Cosmetic Beauty Services", icon: "svg/Beauty Parlour.svg" },
  { type: "Nail Salon", subtype: "Manicure/Pedicure Services", icon: "svg/Nail Saloon.svg" },
  { type: "Barber Studio/Shop", subtype: "Men's Hair Grooming", icon: "svg/Barber.svg" },
  { type: "Hair Stylist", subtype: "Professional Hair Care", icon: "svg/Hair Stylist.svg" },
  { type: "Bakery", subtype: "Baked Goods Producer", icon: "svg/Bakery.svg" },
  { type: "Dry Cleaner", subtype: "Garment Cleaning & Care", icon: "svg/Dry Cleaner.svg" },
  { type: "Cleaning Janitorial Service", subtype: "Professional Cleaning Solutions", icon: "svg/Cleaning Janitorial Service.svg" },
  { type: "Other", subtype: "More Ideas, More Impact", icon: "svg/Web-Design-Agency-icon.svg" },
];

const businessServices = [
  {
    type: "Restaurant",
    subtype: "Food Service Establishment",
    icon: "svg/Restaurant-icon.svg",
    services: ["Dine-in Service", "Takeaway Orders", "Home Delivery", "Event Catering", "Online Ordering", "Other"],
  },
  {
    type: "Real Estate Broker",
    subtype: "Property Transaction Facilitator",
    icon: "svg/Estate-icon.svg",
    services: ["Property Sales", "Property Rentals", "Property Viewings", "Price Valuation", "Legal Help", "Other"],
  },
  {
    type: "Saloon",
    subtype: "Hair Styling & Grooming",
    icon: "svg/Saloon-icon.svg",
    services: ["Haircuts", "Hair Spa Treatments", "Hair Straightening", "Nail Extensions", "Facials", "Other"],
  },
  {
    type: "Doctor's Clinic",
    subtype: "Medical Consultation & Treatment",
    icon: "svg/Doctor-clinic-icon.svg",
    services: ["General Checkups", "Specialist Consultations", "Vaccinations", "Blood Tests", "Health Screenings", "Other"],
  },
  {
    type: "Dry Cleaner",
    subtype: "Garment Cleaning & Care",
    icon: "svg/Dry -Cleaner-icon.svg",
    services: ["Garment Cleaning", "Stain Removal", "Clothing Alterations", "Leather & Suede Cleaning", "Other"],
  },
  {
    type: "Web Design Agency",
    subtype: "Website Creation & Development",
    icon: "svg/Web-Design-Agency-icon.svg",
    services: ["Website Creation", "Responsive Design", "SEO Services", "Website Maintenance", "E-commerce Setup", "Other"],
  },
  {
    type: "Gym & Fitness Center",
    subtype: "Exercise Facility & Training",
    icon: "svg/Gym-icon.svg",
    services: ["Group Fitness Classes", "Weight Training Equipment", "Cardio Workouts", "Personal Training Sessions", "Other"],
  },
  {
    type: "Personal Trainer",
    subtype: "Individual Fitness Coaching",
    icon: "svg/Personal-Trainer-icon.svg",
    services: ["Personalized Workout Plans", "One-on-One Training", "Nutrition Guidance", "Fitness Assessments", "Other"],
  },
  {
    type: "Architect",
    subtype: "Building Design Expert",
    icon: "svg/Architect-icon.svg",
    services: ["Residential Building Design", "Commercial Building Plans", "Renovation Planning", "Permit Drawings", "Site Planning", "Project Management", "Other"],
  },
  {
    type: "Interior Designer",
    subtype: "Indoor Space Beautifier",
    icon: "svg/Interior-Designer-icon.svg",
    services: ["Space Planning", "Furniture Selection", "Color Consultation", "Lighting Design", "Home Makeovers", "Other"],
  },
  {
    type: "Construction Services",
    subtype: "Building Construction & Repair",
    icon: "svg/Construction Services.svg",
    services: ["New Building Construction", "Home Renovations", "Project Supervision", "Structural Repairs", "Other"],
  },
  {
    type: "Cleaning Janitorial Service",
    subtype: "Professional Cleaning Solutions",
    icon: "svg/Cleaning Janitorial Service.svg",
    services: ["Residential Cleaning", "Commercial Office Cleaning", "Deep Cleaning Services", "Move-In/Move-Out Cleaning", "Carpet & Upholstery Cleaning", "Window Cleaning", "Disinfection & Sanitization", "Post-Construction Cleaning", "Restroom Cleaning & Maintenance", "Other"],
  },
  {
    type: "Landscaping Company",
    subtype: "Outdoor Space Beautification",
    icon: "svg/Landscaping-icon.svg",
    services: ["Lawn Mowing & Maintenance", "Garden Design", "Tree Pruning & Removal", "Irrigation Installation", "Other"],
  },
  {
    type: "Insurance Agency",
    subtype: "Risk Protection Provider",
    icon: "svg/Insurance Agency.svg",
    services: ["Life Insurance", "Health Insurance", "Car Insurance", "Home Insurance", "Business Insurance", "Other"],
  },
  {
    type: "Financial Planners",
    subtype: "Wealth Management Advice",
    icon: "svg/Financial Planners.svg",
    services: ["Retirement Planning", "Investment Portfolio Management", "Tax Planning", "Budgeting & Expense Management", "Estate Planning", "Insurance Planning", "Education Planning", "Debt Management", "Other"],
  },
  {
    type: "Accounting Services",
    subtype: "Financial Record Management",
    icon: "svg/Accounting Services.svg",
    services: ["Bookkeeping", "Tax Filing", "Payroll Services", "Financial Auditing", "Business Financial Reports", "Other"],
  },
  {
    type: "Property Rental & Leasing Service",
    subtype: "Property Rental Management",
    icon: "svg/Property Rental & Leasing Service.svg",
    services: ["Tenant Screening", "Lease Agreement Preparation", "Rent Collection", "Property Maintenance Coordination", "Other"],
  },
  {
    type: "Old Age Home",
    subtype: "Senior Living Facility",
    icon: "svg/Old Age Home.svg",
    services: ["Assisted Living", "Meal Services", "Housekeeping & Laundry", "Recreational Activities", "Physiotherapy", "Emergency Support", "Other"],
  },
  {
    type: "Travel Agency",
    subtype: "Trip Planning & Booking",
    icon: "svg/Travel Agency.svg",
    services: ["Flight Booking", "Hotel Reservations", "Holiday Packages", "Visa Assistance", "Travel Insurance", "Customized Itineraries", "Cruise Bookings", "Local Tours & Sightseeing", "Car Rentals", "Other"],
  },
  {
    type: "Ticket Booking",
    subtype: "Travel Ticket Provider",
    icon: "svg/Ticket Booking.svg",
    services: ["Flight Tickets", "Train Tickets", "Bus Tickets", "Movie Tickets", "Event Tickets", "Amusement Park Tickets", "Concert & Show Tickets", "Sports Tickets", "Other"],
  },
  {
    type: "Beauty Parlour",
    subtype: "Cosmetic Beauty Services",
    icon: "svg/Beauty Parlour.svg",
    services: ["Hair Cutting & Styling", "Facials & Cleanups", "Manicure & Pedicure", "Bridal Makeup", "Hair Coloring & Highlights", "Waxing & Threading", "Skin Treatments", "Makeup for Events", "Spa & Massage Services", "Other"],
  },
  {
    type: "Nail Salon",
    subtype: "Manicure/Pedicure Services",
    icon: "svg/Nail Saloon.svg",
    services: ["Manicure", "Pedicure", "Nail Art", "Gel Nails", "Acrylic Nails", "Nail Extensions", "Cuticle Care", "Nail Repair & Removal", "Hand & Foot Spa", "Other"],
  },
  {
    type: "Barber Studio/Shop",
    subtype: "Men's Hair Grooming",
    icon: "svg/Barber.svg",
    services: ["Haircut", "Beard Trimming & Styling", "Shaving & Grooming", "Hair Coloring", "Head Massage", "Facial for Men", "Scalp Treatment", "Hair Wash & Styling", "Kids Haircut", "Other"],
  },
  {
    type: "Hair Stylist",
    subtype: "Professional Hair Care",
    icon: "svg/Hair Stylist.svg",
    services: ["Hair Cutting & Trimming", "Hair Styling", "Blow Dry & Ironing", "Hair Coloring & Highlights", "Hair Spa", "Keratin & Smoothening Treatments", "Hair Extensions", "Scalp Treatments", "Bridal & Occasion Hairstyles", "Other"],
  },
  {
    type: "Bakery",
    subtype: "Baked Goods Producer",
    icon: "svg/Bakery.svg",
    services: ["Custom Cakes", "Birthday & Wedding Cakes", "Pastries & Cupcakes", "Cookies & Biscuits", "Bread & Buns", "Chocolates & Desserts", "Eggless & Sugar-Free Items", "Bulk & Party Orders", "Online Ordering & Delivery", "Other"],
  },
  {
    type: "Cleaning Janitorial Service",
    subtype: "Professional Cleaning Solutions",
    icon: "svg/Cleaning Janitorial Service.svg",
    services: ["Residential Cleaning", "Commercial Office Cleaning", "Deep Cleaning Services", "Move-In/Move-Out Cleaning", "Carpet & Upholstery Cleaning", "Window Cleaning", "Disinfection & Sanitization", "Post-Construction Cleaning", "Restroom Cleaning & Maintenance", "Other"],
  },
];

const BusinessDetailsStep: React.FC<BusinessDetailsStepProps> = ({ data, onUpdate, onNext, onPrevious, editingBusiness, fetchBusinesses }) => {
  const [formData, setFormData] = useState<Business>(
    data.business || editingBusiness || {
      id: "",
      type: "",
      subtype: "",
      icon: "",
      name: "",
      size: "",
      services: [],
      customServices: [],
      email: "",
      address: "",
      phone: "",
      website: "",
      googleBusiness: "",
      about: "",
      addressComponents: [],
    }
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [businessSearch, setBusinessSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [newBusinessType, setNewBusinessType] = useState("");
  const [newService, setNewService] = useState("");
  const [allServices, setAllServices] = useState<{ [key: string]: string[] }>({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [isWebsiteValid, setIsWebsiteValid] = useState<boolean | null>(null);
  const [hasNoGoogleOrWebsite, setHasNoGoogleOrWebsite] = useState(false);
  const [hasNoGoogle, setHasNoGoogle] = useState(false);
  const [sitemapUrls, setSitemapUrls] = useState<string[]>([]);
  const [showSitemap, setShowSitemap] = useState(false);
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
  const [addressComponents, setAddressComponents] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("US");

  const HTTPS_PREFIX = "https://";
  const PREFIX_LEN = HTTPS_PREFIX.length;

  useEffect(() => {
    const serviceMap: { [key: string]: string[] } = {};
    businessServices.forEach((b) => {
      serviceMap[b.type] = b.services;
    });
    setAllServices(serviceMap);
  }, []);

  useEffect(() => {
    if (data.business || editingBusiness) {
      const business = data.business || editingBusiness;
      setFormData(business);
      setSelectedType(business.type);
      setAddressComponents(business.addressComponents || []);
      setHasNoGoogleOrWebsite(!business.googleBusiness && !business.website);
      setHasNoGoogle(!business.googleBusiness);
      if (business.website) {
        handleWebsiteBlur(); // Re-validate website on load
      }
    }
  }, [data.business, editingBusiness]);

  useEffect(() => {
    if (!window.google?.maps?.places) return;

    const interval = setInterval(() => {
      if (document.getElementById("google-autocomplete") && document.getElementById("google-address-autocomplete")) {
        const businessAutocomplete = new window.google.maps.places.Autocomplete(
          document.getElementById("google-autocomplete") as HTMLInputElement,
          {
            types: ["establishment"],
            fields: ["place_id", "name", "url", "formatted_address", "formatted_phone_number", "address_components"],
          }
        );

        businessAutocomplete.addListener("place_changed", () => {
          const place = businessAutocomplete.getPlace();
          setFormData({
            ...formData,
            googleBusiness: place.name || "",
            name: place.name || "",
            address: place.formatted_address || "",
            phone: place.formatted_phone_number || "",
            website: place.url || "",
          });
          setAddressComponents(place.address_components || []);
          setSelectedCountry(
            place.address_components?.find((c) => c.types.includes("country"))?.short_name || "US"
          );
          setHasNoGoogle(false);
          setErrors((prev) => ({ ...prev, googleBusiness: "", name: "", address: "", phone: "", email: "" }));
        });

        const addressAutocomplete = new window.google.maps.places.Autocomplete(
          document.getElementById("google-address-autocomplete") as HTMLInputElement,
          {
            types: ["geocode"],
            fields: ["address_components", "formatted_address"],
          }
        );

        addressAutocomplete.addListener("place_changed", () => {
          const place = addressAutocomplete.getPlace();
          setFormData({ ...formData, address: place.formatted_address || "" });
          setAddressComponents(place.address_components || []);
          setSelectedCountry(
            place.address_components?.find((c) => c.types.includes("country"))?.short_name || "US"
          );
          setErrors((prev) => ({ ...prev, address: "" }));
        });

        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [formData]);

  const handleWebsiteBlur = async () => {
    const raw = (formData.website || "").trim();
    if (!raw) return;

    let url = raw.replace(/^https?:\/\//i, "");
    url = `https://${url}`;

    setIsVerifying(true);
    try {
      const result = await validateWebsite(url);
      const isValid = result?.valid === true || String(result?.valid).toLowerCase() === "true";
      setIsWebsiteValid(isValid);
      setFormData((p) => ({ ...p, website: url }));

      if (typeof window !== "undefined") {
        sessionStorage.setItem("businessUrl", url);
        localStorage.setItem("isVerified", isValid ? "true" : "false");
      }

      if (isValid) {
        const res = await listSiteMap(url);
        if (res?.success && Array.isArray(res.urls)) {
          const filteredUrls = filterCompanyPages(res.urls);
          if (!filteredUrls.includes(url)) {
            filteredUrls.unshift(url);
          }
          setSitemapUrls(filteredUrls);
          const formattedUrls = filteredUrls.map((link) => ({
            url: link,
            checkedStatus: true,
          }));
          localStorage.setItem("selectedSitemapUrls", JSON.stringify(formattedUrls));
          localStorage.setItem("sitemapUrls", JSON.stringify(filteredUrls));
        } else {
          setSitemapUrls([]);
        }
      } else {
        setSitemapUrls([]);
      }
    } catch (err) {
      console.error("Website verification error:", err);
      setIsWebsiteValid(false);
      setSitemapUrls([]);
      localStorage.setItem("isVerified", "false");
    } finally {
      setIsVerifying(false);
    }
  };

  const filterCompanyPages = (urls: string[]) => {
    const companyKeywords = [
      "about", "our-story", "our-company", "who-we-are",
      "contact", "products", "services", "solutions", "what-we-do", "offerings",
      "blog", "news", "resources", "insights", "faq", "help",
      "pricing", "plans", "privacy", "terms-and-conditions", "terms-of-use",
      "case-studies", "projects", "portfolio", "testimonials", "reviews"
    ];
    return urls.filter(url => companyKeywords.some(keyword => url.toLowerCase().includes(keyword)));
  };

  const toggleOne = (url: string) => {
    setSelectedUrls((prev) => {
      const next = new Set(prev);
      next.has(url) ? next.delete(url) : next.add(url);
      localStorage.setItem("selectedSitemapUrls", JSON.stringify([...next]));
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedUrls((prev) => {
      const next = prev.size === sitemapUrls.length ? new Set() : new Set(sitemapUrls);
      localStorage.setItem("selectedSitemapUrls", JSON.stringify([...next]));
      return next;
    });
  };

  const validatePhoneNumber = (phone: string) => {
    const phoneNumberObj = parsePhoneNumberFromString(phone, selectedCountry);
    return phoneNumberObj && phoneNumberObj.isValid();
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.type) {
      newErrors.type = "Business type is required";
    }
    if (!hasNoGoogleOrWebsite && !formData.googleBusiness && !formData.website) {
      newErrors.googleBusiness = "Please enter Google Business or Website URL, or check 'I don’t have...' option";
    }
    if (hasNoGoogleOrWebsite) {
      if (!formData.name) newErrors.name = "Business name is required";
      if (!formData.address) newErrors.address = "Address is required";
      if (!formData.phone || !validatePhoneNumber(formData.phone)) {
        newErrors.phone = "Valid phone number is required";
      }
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Valid email is required";
      }
    }
    if (formData.about && /[!@#$%^&*(),.?":{}|<>]/.test(formData.about)) {
      newErrors.about = "About Business cannot contain special characters or emojis";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveBusiness = async () => {
    if (!validate()) return;

    const userId =  localStorage.getItem("userId") || "RX0ZYQ1757328630";
    const payload = {
      id: editingBusiness?.id || undefined,
      userId,
      businessType: formData.type || "Other",
      businessName: formData.name || "",
      businessSize: formData.size || "",
      customBuisness: selectedType === "Other" ? newBusinessType || "Business" : "",
      buisnessService: formData.services || [],
      customServices: formData.customServices || [],
      buisnessEmail: formData.email || "",
      googleUrl: formData.googleBusiness || "",
      webUrl: formData.website || "",
      aboutBusiness: formData.about || "",
      address1: formData.address || "",
      knowledge_base_name: formData.name || "My Business KB",
      scrapedUrls: JSON.stringify([...selectedUrls]),
      knowledge_base_texts: JSON.stringify([{
        title: "Business Details",
        text: `Business Name: ${formData.name || "N/A"}
Address: ${formData.address || "N/A"}
Phone: ${formData.phone || "N/A"}
Website: ${formData.website || "N/A"}
Email: ${formData.email || "N/A"}
About Business: ${formData.about || "N/A"}`
      }]),
      knowledge_base_id: localStorage.getItem("knowledgeBaseId") || undefined,
    };

    try {
      let res;
      if (editingBusiness?.id) {
        res = await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/businessDetails/update/${editingBusiness.id}`, payload, {
          headers: { "Content-Type": "application/json" }
        });
      } else {
        res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/businessDetails/create`, payload, {
          headers: { "Content-Type": "application/json" }
        });
      }

      const businessId = editingBusiness?.id || res.data.record?.businessId || `BIZ${Date.now()}`;
      localStorage.setItem("BusinessId", businessId);
      localStorage.setItem("agentCode", res.data.agentCode || `AGENT${Date.now()}`);
      localStorage.setItem("knowledgebaseName", formData.name || "My Business KB");

      if (formData.website && isWebsiteValid) {
        const formDataPayload = new FormData();
        formDataPayload.append("knowledge_base_name", formData.name || "My Business KB");
        formDataPayload.append("knowledge_base_urls", JSON.stringify([...selectedUrls]));
        formDataPayload.append("enable_auto_refresh", "true");
        formDataPayload.append("knowledge_base_texts", JSON.stringify([{
          title: "Business Details",
          text: `Business Name: ${formData.name || "N/A"}
Address: ${formData.address || "N/A"}
Phone: ${formData.phone || "N/A"}
Website: ${formData.website || "N/A"}
Email: ${formData.email || "N/A"}
About Business: ${formData.about || "N/A"}`
        }]));

        const prevKb = localStorage.getItem("knowledgeBaseId");
        if (prevKb && prevKb !== "null" && prevKb !== "undefined") {
          await axios.delete(`https://api.retellai.com/delete-knowledge-base/${prevKb}`, {
            headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_RETELL_API}` }
          });
        }

        const kbRes = await axios.post("https://api.retellai.com/create-knowledge-base", formDataPayload, {
          headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_RETELL_API}`, "Content-Type": "multipart/form-data" }
        });

        const knowledgeBaseId = kbRes?.data?.knowledge_base_id;
        localStorage.setItem("knowledgeBaseId", knowledgeBaseId);

        await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/businessDetails/updateKnowledeBase/${businessId}`, {
          knowledge_base_id: knowledgeBaseId,
          knowledge_base_name: formData.name || "My Business KB",
          scrapedUrls: JSON.stringify([...selectedUrls]),
          knowledge_base_texts: JSON.stringify([{
            title: "Business Details",
            text: `Business Name: ${formData.name || "N/A"}
Address: ${formData.address || "N/A"}
Phone: ${formData.phone || "N/A"}
Website: ${formData.website || "N/A"}
Email: ${formData.email || "N/A"}
About Business: ${formData.about || "N/A"}`
          }]),
        }, {
          headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_RETELL_API}`, "Content-Type": "application/json" }
        });
      }

      const savedBusiness: Business = {
        id: businessId,
        type: formData.type,
        subtype: formData.subtype,
        icon: formData.icon,
        name: formData.name,
        size: formData.size,
        services: formData.services,
        customServices: formData.customServices,
        email: formData.email,
        address: formData.address,
        phone: formData.phone,
        website: formData.website,
        googleBusiness: formData.googleBusiness,
        about: formData.about,
        addressComponents: addressComponents,
      };

      onUpdate({ business: savedBusiness });
      fetchBusinesses();

      Swal.fire({
        icon: "success",
        title: editingBusiness ? "Business Updated" : "Business Created",
        text: editingBusiness ? "Business details updated successfully!" : "Business details saved successfully!",
        timer: 1500,
        showConfirmButton: false,
      });

      onNext();
    } catch (error: any) {
      console.error("Error saving business details:", error);
      let errorMsg = "Failed to save business details.";
      if (error?.response?.data?.error) {
        errorMsg = error.response.data.error;
      } else if (error?.message) {
        errorMsg = error.message;
      }
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMsg,
      });
    }
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSaveBusiness();
  };

  return (
    <StepWrapper step={2} totalSteps={5} title="Business Details" description="Provide details about the business.">
      <form onSubmit={handleNext} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Business Type <span className="text-red-500">*</span></Label>
            <Select
              onValueChange={(val) => {
                if (val === "Other") {
                  setSelectedType("Other");
                  setFormData({ ...formData, type: "", subtype: "", icon: "", services: [], customServices: [] });
                  localStorage.setItem("businessType", "");
                } else {
                  const selected = allBusinessTypes.find((b) => b.type === val);
                  setSelectedType(val);
                  setFormData({
                    ...formData,
                    type: val,
                    subtype: selected?.subtype || "",
                    icon: selected?.icon || "",
                    services: [],
                    customServices: [],
                  });
                  localStorage.setItem("businessType", val);
                }
                setErrors((prev) => ({ ...prev, type: "" }));
              }}
              value={selectedType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <Input
                  placeholder="Search business..."
                  value={businessSearch}
                  onChange={(e) => setBusinessSearch(e.target.value)}
                  className="mb-2 mx-2"
                />
                {allBusinessTypes
                  .filter((b) => `${b.type} ${b.subtype}`.toLowerCase().includes(businessSearch.toLowerCase()))
                  .map((b) => (
                    <SelectItem key={b.type} value={b.type}>{b.type} - {b.subtype}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {selectedType === "Other" && (
              <Input
                placeholder="Add new business type"
                value={newBusinessType}
                onChange={(e) => setNewBusinessType(e.target.value)}
                onBlur={() => {
                  const trimmed = newBusinessType.trim();
                  if (trimmed && !allBusinessTypes.some((b) => b.type.toLowerCase() === trimmed.toLowerCase())) {
                    setFormData({
                      ...formData,
                      type: trimmed,
                      subtype: "Custom",
                      icon: "svg/Web-Design-Agency-icon.svg",
                      services: [],
                      customServices: [],
                    });
                    setAllServices((prev) => ({ ...prev, [trimmed]: [] }));
                    setSelectedType(trimmed);
                    localStorage.setItem("businessType", trimmed);
                  }
                  setNewBusinessType("");
                }}
                className="mt-2"
              />
            )}
            {errors.type && <p className="text-sm text-red-600">{errors.type}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="size">Business Size</Label>
            <Select
              value={formData.size}
              onValueChange={(value) => setFormData({ ...formData, size: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select business size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1 to 10 employees">1 to 10 employees</SelectItem>
                <SelectItem value="10 to 50 employees">10 to 50 employees</SelectItem>
                <SelectItem value="50 to 100 employees">50 to 100 employees</SelectItem>
                <SelectItem value="100 to 250 employees">100 to 250 employees</SelectItem>
                <SelectItem value="250 to 500 employees">250 to 500 employees</SelectItem>
                <SelectItem value="500 to 1000 employees">500 to 1000 employees</SelectItem>
                <SelectItem value="1000+ employees">1000+ employees</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Select Services</Label>
            {(allServices[selectedType] || []).map((service) => (
              <div key={service} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.services?.includes(service)}
                  onChange={() => {
                    const current = formData.services || [];
                    const updated = current.includes(service)
                      ? current.filter((s) => s !== service)
                      : [...current, service];
                    setFormData({ ...formData, services: updated });
                  }}
                />
                {service}
              </div>
            ))}
            {selectedType && !allServices[selectedType]?.length && (
              <div className="mt-2 flex items-center gap-2">
                <Input
                  placeholder="Add new service"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={() => {
                    const trimmed = newService.trim();
                    if (trimmed && !(allServices[selectedType] || []).includes(trimmed)) {
                      setAllServices((prev) => ({ ...prev, [selectedType]: [...(prev[selectedType] || []), trimmed] }));
                      setFormData({
                        ...formData,
                        services: [...(formData.services || []), trimmed],
                        customServices: [...(formData.customServices || []), trimmed],
                      });
                    }
                    setNewService("");
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                  size="sm"
                >
                  Add
                </Button>
              </div>
            )}
            {allServices[selectedType]?.length > 0 && !allServices[selectedType]?.includes("Other") && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.services?.includes("Other")}
                  onChange={() => {
                    const current = formData.services || [];
                    const updated = current.includes("Other")
                      ? current.filter((s) => s !== "Other")
                      : [...current, "Other"];
                    setFormData({ ...formData, services: updated });
                  }}
                />
                Add more services
              </div>
            )}
            {formData.services?.includes("Other") && (
              <div className="mt-2 flex items-center gap-2">
                <Input
                  placeholder="Add new service"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={() => {
                    const trimmed = newService.trim();
                    if (trimmed && !(allServices[selectedType] || []).includes(trimmed)) {
                      setAllServices((prev) => ({ ...prev, [selectedType]: [...(prev[selectedType] || []), trimmed] }));
                      setFormData({
                        ...formData,
                        services: [...(formData.services || []).filter((s) => s !== "Other"), trimmed],
                        customServices: [...(formData.customServices || []), trimmed],
                      });
                    }
                    setNewService("");
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                  size="sm"
                >
                  Add
                </Button>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="google-autocomplete">Google Business</Label>
            <Input
              id="google-autocomplete"
              placeholder="Search business via Google (e.g., DesignersX)"
              value={formData.googleBusiness}
              onChange={(e) => {
                setFormData({ ...formData, googleBusiness: e.target.value });
                setHasNoGoogle(false);
                setErrors((prev) => ({ ...prev, googleBusiness: "" }));
              }}
            />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={hasNoGoogle}
                onChange={(e) => {
                  setHasNoGoogle(e.target.checked);
                  if (e.target.checked) {
                    setFormData({ ...formData, googleBusiness: "" });
                  }
                }}
              />
              I don’t have Google Business
            </label>
          </div>
          <div className="space-y-2 relative">
            <Label htmlFor="website">Website URL</Label>
            <Input
              id="website"
              placeholder="Website URL include https://"
              value={formData.website}
              onChange={(e) => {
                setFormData({ ...formData, website: e.target.value });
                setIsWebsiteValid(null);
                setErrors((prev) => ({ ...prev, googleBusiness: "" }));
              }}
              onKeyDown={(e) => {
                const input = e.currentTarget;
                const { key } = e;
                const { selectionStart, selectionEnd, value } = input;
                const fullSelection = selectionStart === 0 && selectionEnd === value.length;
                if (key === "Backspace" || key === "Delete") {
                  if (fullSelection) {
                    e.preventDefault();
                    setFormData({ ...formData, website: HTTPS_PREFIX });
                    requestAnimationFrame(() => input.setSelectionRange(PREFIX_LEN, PREFIX_LEN));
                  }
                  if (selectionStart <= PREFIX_LEN) {
                    e.preventDefault();
                    input.setSelectionRange(PREFIX_LEN, PREFIX_LEN);
                  }
                }
              }}
              onClick={(e) => {
                const input = e.currentTarget;
                if (input.selectionStart < PREFIX_LEN) {
                  input.setSelectionRange(PREFIX_LEN, PREFIX_LEN);
                }
              }}
              onFocus={(e) => {
                const input = e.currentTarget;
                if (!input.value.startsWith(HTTPS_PREFIX)) {
                  setFormData({ ...formData, website: HTTPS_PREFIX + input.value });
                  requestAnimationFrame(() => input.setSelectionRange(PREFIX_LEN, PREFIX_LEN));
                }
              }}
              onBlur={handleWebsiteBlur}
            />
            {formData.website && (
              <div className="absolute right-2 top-10">
                {isVerifying ? (
                  <span className="text-sm text-gray-500">Verifying...</span>
                ) : isWebsiteValid === true ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : isWebsiteValid === false ? (
                  <X className="w-5 h-5 text-red-600" />
                ) : null}
              </div>
            )}
            {isWebsiteValid && sitemapUrls.length > 0 && (
              <div className="mt-3">
                <Button
                  type="button"
                  onClick={() => setShowSitemap((v) => !v)}
                  className="bg-purple-600 hover:bg-purple-700"
                  size="sm"
                >
                  View Sitemap
                </Button>
                {showSitemap && (
                  <div className="mt-2 p-4 bg-white shadow-xl rounded-lg">
                    <div className="flex justify-between mb-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedUrls.size === sitemapUrls.length}
                          onChange={toggleAll}
                        />
                        Select All
                      </label>
                      <Button variant="ghost" onClick={() => setShowSitemap(false)}>Close</Button>
                    </div>
                    <ul className="max-h-48 overflow-y-auto">
                      {sitemapUrls.map((u) => (
                        <li key={u} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedUrls.has(u)}
                            onChange={() => toggleOne(u)}
                          />
                          <a href={u} target="_blank" rel="noreferrer" className="text-sm text-purple-600 hover:underline">{u}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={hasNoGoogleOrWebsite}
              onChange={(e) => {
                setHasNoGoogleOrWebsite(e.target.checked);
                if (e.target.checked) {
                  setFormData({ ...formData, googleBusiness: "", website: "" });
                  setIsWebsiteValid(null);
                  setSitemapUrls([]);
                }
                setErrors((prev) => ({ ...prev, googleBusiness: "" }));
              }}
            />
            I don’t have Google Business or Website
          </label>
          {hasNoGoogleOrWebsite && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Business Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  placeholder="Enter business name"
                />
                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="google-address-autocomplete">Address <span className="text-red-500">*</span></Label>
                <Input
                  id="google-address-autocomplete"
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    setErrors((prev) => ({ ...prev, address: "" }));
                  }}
                  placeholder="Enter address"
                />
                {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    setErrors((prev) => ({ ...prev, phone: "" }));
                  }}
                  placeholder="Enter phone number"
                />
                {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  placeholder="Enter email"
                />
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="about">About Business</Label>
                <Textarea
                  id="about"
                  value={formData.about}
                  onChange={(e) => {
                    setFormData({ ...formData, about: e.target.value });
                    setErrors((prev) => ({ ...prev, about: "" }));
                  }}
                  placeholder="Describe your business"
                />
                {errors.about && <p className="text-sm text-red-600">{errors.about}</p>}
              </div>
            </>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-between">
          <Button type="button" variant="outline" onClick={onPrevious} className="w-full sm:w-auto">
            <ChevronLeft className="w-4 h-4 mr-2" /> Previous
          </Button>
          <Button type="submit" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700" disabled={isVerifying}>
            {isVerifying ? (
              <span className="flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...
              </span>
            ) : (
              <span className="flex items-center">
                Next: Agent Creation <ChevronRight className="w-4 h-4 ml-2" />
              </span>
            )}
          </Button>
        </div>
      </form>
    </StepWrapper>
  );
};

export default BusinessDetailsStep;