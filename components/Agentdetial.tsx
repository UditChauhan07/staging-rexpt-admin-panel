"use client";

import { useState, useEffect, useRef } from "react";
import Modal from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Play, Pause } from "lucide-react";
import { languages } from "./languageOptions";

import { createAgent, getRetellVoices, validateWebsite } from "@/Services/auth";
import axios from "axios";
import { getAgentPrompt } from "@/lib/getAgentPrompt";
import { getKnowledgeBaseName } from "@/lib/getKnowledgeBaseName";
import dynamic from "next/dynamic";
import Swal from "sweetalert2";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import getTimezoneFromState from "@/lib/getTimezone";

interface User {
  id: string;
  name: string;
  email: string;
}
declare global {
  interface Window {
    google: any;
  }
}

interface AddAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  allUsers: User[];
  onSubmit: (data: any) => void;
}

interface BusinessType {
  type: string;
  subtype: string;
  icon: string;
}
const HTTPS_PREFIX = "https://";
const PREFIX_LEN = HTTPS_PREFIX.length;
const allBusinessTypes = [
  {
    type: "Real Estate Broker",
    subtype: "Property Transaction Facilitator",
    icon: "svg/Estate-icon.svg",
  },
  {
    type: "Restaurant",
    subtype: "Food Service Establishment",
    icon: "svg/Landscaping-icon.svg",
  },
  {
    type: "Interior Designer",
    subtype: "Indoor Space Beautifier",
    icon: "svg/Interior-Designer-icon.svg",
  },
  {
    type: "Saloon",
    subtype: "Hair Styling & Grooming",
    icon: "svg/Saloon-icon.svg",
  },
  {
    type: "Landscaping Company",
    subtype: "Outdoor Space Beautification",
    icon: "svg/Landscaping-icon.svg",
  },
  {
    type: "Dentist",
    subtype: "Dental Care Provider",
    icon: "svg/Dentist-Office-icon.svg",
  },
  {
    type: "Doctor's Clinic",
    subtype: "Medical Consultation & Treatment",
    icon: "svg/Doctor-clinic-icon.svg",
  },
  {
    type: "Gym & Fitness Center",
    subtype: "Exercise Facility & Training",
    icon: "svg/Gym-icon.svg",
  },

  {
    type: "Personal Trainer",
    subtype: "Individual Fitness Coaching",
    icon: "svg/Personal-Trainer-icon.svg",
  },
  {
    type: "Web Design Agency",
    subtype: "Website Creation & Development",
    icon: "svg/Web-Design-Agency-icon.svg",
  },
  {
    type: "Architect",
    subtype: "Building Design Expert",
    icon: "svg/Architect-icon.svg",
  },
  {
    type: "Property Rental & Leasing Service",
    subtype: "Property Rental Management",
    icon: "svg/Property Rental & Leasing Service.svg",
  },
  {
    type: "Construction Services",
    subtype: "Building Construction & Repair",
    icon: "svg/Construction Services.svg",
  },
  {
    type: "Insurance Agency",
    subtype: "Risk Protection Provider",
    icon: "svg/Insurance Agency.svg",
  },
  {
    type: "Old Age Home",
    subtype: "Senior Living Facility",
    icon: "svg/Old Age Home.svg",
  },
  {
    type: "Travel Agency",
    subtype: "Trip Planning & Booking",
    icon: "svg/Travel Agency.svg",
  },
  {
    type: "Ticket Booking",
    subtype: "Travel Ticket Provider",
    icon: "svg/Ticket Booking.svg",
  },
  {
    type: "Accounting Services",
    subtype: "Financial Record Management",
    icon: "svg/Accounting Services.svg",
  },
  {
    type: "Financial Planners",
    subtype: "Wealth Management Advice",
    icon: "svg/Financial Planners.svg",
  },
  {
    type: "Beauty Parlour",
    subtype: "Cosmetic Beauty Services",
    icon: "svg/Beauty Parlour.svg",
  },
  {
    type: "Nail Salon",
    subtype: "Manicure/Pedicure Services",
    icon: "svg/Nail Saloon.svg",
  },
  {
    type: "Barber Studio/Shop",
    subtype: "Men's Hair Grooming",
    icon: "svg/Barber.svg",
  },
  {
    type: "Hair Stylist",
    subtype: "Professional Hair Care",
    icon: "svg/Hair Stylist.svg",
  },
  {
    type: "Bakery",
    subtype: "Baked Goods Producer",
    icon: "svg/Bakery.svg",
  },
  {
    type: "Dry Cleaner",
    subtype: "Garment Cleaning & Care",
    icon: "svg/Dry Cleaner.svg",
  },
  {
    type: "Cleaning Janitorial Service",
    subtype: "Professional Cleaning Solutions",
    icon: "svg/Cleaning Janitorial Service.svg",
  },
  // {
  //   type: "Marketing Agency",
  //   subtype: "Your Journey Begins Here",
  //   icon: "svg/Marketing Agency.svg",
  // },

  {
    type: "Other",
    subtype: "More Ideas, More Impact",
    icon: "svg/Web-Design-Agency-icon.svg",
  },
];
const avatars = {
  Male: [
    { img: "/images/Male-01.png" },
    { img: "/images/Male-02.png" },
    { img: "/images/Male-03.png" },
    { img: "/images/Male-04.png" },
    { img: "/images/Male-05.png" },
  ],
  Female: [
    { img: "/images/Female-01.png" },
    { img: "/images/Female-02.png" },
    { img: "/images/Female-03.png" },
    { img: "/images/Female-04.png" },
    { img: "/images/Female-05.png" },
    { img: "/images/Female-06.png" },
  ],
};

const businessServices = [
  {
    type: "Restaurant",
    subtype: "Food Service Establishment",
    icon: "svg/Restaurant-icon.svg",
    services: [
      "Dine-in Service",
      "Takeaway Orders",
      "Home Delivery",
      "Event Catering",
      "Online Ordering",
      "Other",
    ],
  },
  {
    type: "Real Estate Broker",
    subtype: "Property Transaction Facilitator",
    icon: "svg/Estate-icon.svg",
    services: [
      "Property Sales",
      "Property Rentals",
      "Property Viewings",
      "Price Valuation",
      "Legal Help",
      "Other",
    ],
  },
  {
    type: "Saloon",
    subtype: "Hair Styling & Grooming",
    icon: "svg/Saloon-icon.svg",
    services: [
      "Haircuts",
      "Hair Spa Treatments",
      "Hair Straightening",
      "Nail Extensions",
      "Facials",
      "Other",
    ],
  },
  {
    type: "Doctor's Clinic",
    subtype: "Medical Consultation & Treatment",
    icon: "svg/Doctor-clinic-icon.svg",
    services: [
      "General Checkups",
      "Specialist Consultations",
      "Vaccinations",
      "Blood Tests",
      "Health Screenings",
      "Other",
    ],
  },
  {
    type: "Dry Cleaner",
    subtype: "Garment Cleaning & Care",
    icon: "svg/Dry -Cleaner-icon.svg",
    services: [
      "Garment Cleaning",
      "Stain Removal",
      "Clothing Alterations",
      "Leather & Suede Cleaning",
      "Other",
    ],
  },
  {
    type: "Web Design Agency",
    subtype: "Website Creation & Development",
    icon: "svg/Web-Design-Agency-icon.svg",
    services: [
      "Website Creation",
      "Responsive Design",
      "SEO Services",
      "Website Maintenance",
      "E-commerce Setup",
      "Other",
    ],
  },
  {
    type: "Gym & Fitness Center",
    subtype: "Exercise Facility & Training",
    icon: "svg/Gym-icon.svg",
    services: [
      "Group Fitness Classes",
      "Weight Training Equipment",
      "Cardio Workouts",
      "Personal Training Sessions",
      "Other",
    ],
  },
  {
    type: "Marketing Agency",
    subtype: "Business Promotion Strategies",
    icon: "svg/Marketing Agency.svg",
    services: [
      "Social Media Advertising",
      "Content Creation",
      "Email Marketing",
      "PPC Ads",
      "Branding Strategy",
      "Other",
    ],
  },
  {
    type: "Personal Trainer",
    subtype: "Individual Fitness Coaching",
    icon: "images/other.png",
    services: [
      "Personalized Workout Plans",
      "One-on-One Training",
      "Nutrition Guidance",
      "Fitness Assessments",
      "Other",
    ],
  },
  {
    type: "Architect",
    subtype: "Building Design Expert",
    icon: "svg/Architect-icon.svg",
    services: [
      "Residential Building Design",
      "Commercial Building Plans",
      "Renovation Planning",
      "Permit Drawings",
      "Site Planning",
      "Project Management",
      "Other",
    ],
  },
  {
    type: "Interior Designer",
    subtype: "Indoor Space Beautifier",
    icon: "images/other.png",
    services: [
      "Space Planning",
      "Furniture Selection",
      "Color Consultation",
      "Lighting Design",
      "Home Makeovers",
      "Other",
    ],
  },
  {
    type: "Construction Services",
    subtype: "Building Construction & Repair",
    icon: "svg/Construction Services.svg",
    services: [
      "New Building Construction",
      "Home Renovations",
      "Project Supervision",
      "Structural Repairs",
      "Other",
    ],
  },
  {
    type: "Cleaning/Janitorial Service",
    subtype: "Building Construction & Repair",
    icon: "images/other.png",
    services: [
      "Office Cleaning",
      "Deep Carpet Cleaning",
      "Window Washing",
      "Floor Polishing",
      "Regular Maintenance",
      "Other",
    ],
  },
  {
    type: "Transport Company",
    subtype: "Freight Transportation Services",
    icon: "images/other.png",
    services: [
      "Freight Shipping",
      "Passenger Transport",
      "Courier Services",
      "Vehicle Rentals",
      "Logistics Management",
      "Other",
    ],
  },
  {
    type: "Landscaping Company",
    subtype: "Outdoor Space Beautification",
    icon: "images/other.png",
    services: [
      "Lawn Mowing & Maintenance",
      "Garden Design",
      "Tree Pruning & Removal",
      "Irrigation Installation",
      "Other",
    ],
  },
  {
    type: "Insurance Agency",
    subtype: "Risk Protection Provider",
    icon: "svg/Insurance Agency.svg",
    services: [
      "Life Insurance",
      "Health Insurance",
      "Car Insurance",
      "Home Insurance",
      "Business Insurance",
      "Other",
    ],
  },
  {
    type: "Financial Services",
    subtype: "Wealth Management Advice",
    icon: "images/other.png",
    services: [
      "Investment Planning",
      "Tax Preparation",
      "Retirement Planning",
      "Wealth Management",
      "Loan Consulting",
      "Other",
    ],
  },
  {
    type: "Accounting Services",
    subtype: "Financial Record Management",
    icon: "svg/Accounting Services.svg",
    services: [
      "Bookkeeping",
      "Tax Filing",
      "Payroll Services",
      "Financial Auditing",
      "Business Financial Reports",
      "Other",
    ],
  },
  {
    type: "Car Repair & Garage",
    subtype: "Vehicle Maintenance & Repair",
    icon: "images/other.png",
    services: [
      "Oil & Filter Change",
      "Brake Repairs",
      "Engine Diagnostics",
      "Tire Replacement",
      "Battery Service",
      "Other",
    ],
  },
  {
    type: "Boat Repair & Maintenance",
    subtype: "Watercraft Upkeep & Repair",
    icon: "images/other.png",
    services: [
      "Hull Repair",
      "Engine Maintenance",
      "Electrical System Repairs",
      "Boat Cleaning",
      "Winterizing Services",
      "Other",
    ],
  },
  {
    type: "Dentist",
    subtype: "Dental Care Provider",
    icon: "images/other.png",
    services: [
      "Teeth",
      "Cleaning",
      "Teeth Whitening",
      "Braces & Aligners",
      "Root Canal",
      "Tooth Extraction",
      "Other",
    ],
  },
  {
    type: "Property Rental & Leasing Service",
    subtype: "Property Rental Management",
    icon: "svg/Property Rental & Leasing Service.svg",
    services: [
      "Tenant Screening",
      "Lease Agreement Preparation",
      "Rent Collection",
      "Property Maintenance Coordination",
      "Other",
    ],
  },
  {
    type: "Old Age Home",
    subtype: "Senior Living Facility",
    icon: "svg/Old Age Home.svg",
    services: [
      "Assisted Living",
      "Meal Services",
      "Housekeeping & Laundry",
      "Recreational Activities",
      "Physiotherapy",
      "Emergency Support",
      "Other",
    ],
  },
  {
    type: "Travel Agency",
    subtype: "Trip Planning & Booking",
    icon: "svg/Travel Agency.svg",
    services: [
      "Flight Booking",
      "Hotel Reservations",
      "Holiday Packages",
      "Visa Assistance",
      "Travel Insurance",
      "Customized Itineraries",
      "Cruise Bookings",
      "Local Tours & Sightseeing",
      "Car Rentals",
      "Other",
    ],
  },
  {
    type: "Ticket Booking",
    subtype: "Travel Ticket Provider",
    icon: "svg/Ticket Booking.svg",
    services: [
      "Flight Tickets",
      "Train Tickets",
      "Bus Tickets",
      "Movie Tickets",
      "Event Tickets",
      "Amusement Park Tickets",
      "Concert & Show Tickets",
      "Sports Tickets",
      "Other",
    ],
  },
  {
    type: "Financial Planners",
    subtype: "Wealth Management Advice",
    icon: "svg/Financial Planners.svg",
    services: [
      "Retirement Planning",
      "Investment Portfolio Management",
      "Tax Planning",
      "Budgeting & Expense Management",
      "Estate Planning",
      "Insurance Planning",
      "Education Planning",
      "Debt Management",
      "Other",
    ],
  },
  {
    type: "Beauty Parlour",
    subtype: "Cosmetic Beauty Services",
    icon: "svg/Beauty Parlour.svg",
    services: [
      "Hair Cutting & Styling",
      "Facials & Cleanups",
      "Manicure & Pedicure",
      "Bridal Makeup",
      "Hair Coloring & Highlights",
      "Waxing & Threading",
      "Skin Treatments",
      "Makeup for Events",
      "Spa & Massage Services",
      "Other",
    ],
  },
  {
    type: "Nail Salon",
    subtype: "Manicure/Pedicure Services",
    icon: "svg/Nail Saloon.svg",
    services: [
      "Manicure",
      "Pedicure",
      "Nail Art",
      "Gel Nails",
      "Acrylic Nails",
      "Nail Extensions",
      "Cuticle Care",
      "Nail Repair & Removal",
      "Hand & Foot Spa",
      "Other",
    ],
  },
  {
    type: "Barber Studio/Shop",
    subtype: "Men's Hair Grooming",
    icon: "svg/Barber.svg",
    services: [
      "Haircut",
      "Beard Trimming & Styling",
      "Shaving & Grooming",
      "Hair Coloring",
      "Head Massage",
      "Facial for Men",
      "Scalp Treatment",
      "Hair Wash & Styling",
      "Kids Haircut",
      "Other",
    ],
  },
  {
    type: "Hair Stylist",
    subtype: "Professional Hair Care",
    icon: "svg/Hair Stylist.svg",
    services: [
      "Hair Cutting & Trimming",
      "Hair Styling",
      "Blow Dry & Ironing",
      "Hair Coloring & Highlights",
      "Hair Spa",
      "Keratin & Smoothening Treatments",
      "Hair Extensions",
      "Scalp Treatments",
      "Bridal & Occasion Hairstyles",
      "Other",
    ],
  },
  {
    type: "Bakery",
    subtype: "Baked Goods Producer",
    icon: "svg/Bakery.svg",
    services: [
      "Custom Cakes",
      "Birthday & Wedding Cakes",
      "Pastries & Cupcakes",
      "Cookies & Biscuits",
      "Bread & Buns",
      "Chocolates & Desserts",
      "Eggless & Sugar-Free Items",
      "Bulk & Party Orders",
      "Online Ordering & Delivery",
      "Other",
    ],
  },
  {
    type: "Cleaning Janitorial Service",
    subtype: "Professional Cleaning Solutions",
    icon: "svg/Cleaning Janitorial Service.svg",
    services: [
      "Residential Cleaning",
      "Commercial Office Cleaning",
      "Deep Cleaning Services",
      "Move-In/Move-Out Cleaning",
      "Carpet & Upholstery Cleaning",
      "Window Cleaning",
      "Disinfection & Sanitization",
      "Post-Construction Cleaning",
      "Restroom Cleaning & Maintenance",
      "Other",
    ],
  },
];
const roles = [
  {
    title: "General Receptionist",
    description:
      "A general receptionist will pick calls, provide information on your services and products, take appointments and guide callers.",
  },
  {
    title: "LEAD Qualifier",
    description:
      "A LEAD Qualifier handles inbound sales queries and helps identify potential leads for your business.",
  },
];
const AddAgentModal = ({
  isOpen,
  onClose,
  allUsers,
  onSubmit,
}: AddAgentModalProps) => {
  const [step, setStep] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [businessSearch, setBusinessSearch] = useState("");
  const [businessTypes, setBusinessTypes] =
    useState<BusinessType[]>(allBusinessTypes);
  const [allServices, setAllServices] = useState<{ [key: string]: string[] }>(
    {}
  );
  const [selectedType, setSelectedType] = useState("");
  const [newBusinessType, setNewBusinessType] = useState("");
  const [newService, setNewService] = useState("");
  const [useWebsite, setUseWebsite] = useState(false);
  const [listVoices, setListVoices] = useState([]);
  const [form, setForm] = useState<any>({});
  const [retellVoices, setRetellVoices] = useState<
    { name: string; language: string }[]
  >([]);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [filteredVoices, setFilteredVoices] = useState([]);
  const audioRefs = useRef([]);
  const [playingIdx, setPlayingIdx] = useState(null);

  const [businessSize, setBusinessSize] = useState("");
  const [agentNote, setAgentNote] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isWebsiteValid, setIsWebsiteValid] = useState(null); // true, false, or null
  const [hasNoGoogleOrWebsite, setHasNoGoogleOrWebsite] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [addressComponents, setAddressComponents] = useState<any[]>([]);
  useEffect(() => {
    const storedAgentRole = sessionStorage.getItem("agentRole");
    const storedNote = sessionStorage.getItem("agentNote");

    if (storedAgentRole) {
      setSelectedRole(storedAgentRole);
    }
    if (storedNote) {
      setAgentNote(storedNote);
    }
  }, []);

  // const URL = "https://rex-bk.truet.net";
  const URL = process.env.NEXT_PUBLIC_API_URL
  // ||"https://rexptin.truet.net";

  const fetchKnowledgeBaseName = async () => {
    const name = await getKnowledgeBaseName();
    console.log("Knowledge base name:", name);
    localStorage.setItem("knowledgebaseName", name);
    // use `name` here safely
  };

  useEffect(() => {
    console.log("fdfdfdfdfdfdff");
    fetchKnowledgeBaseName();
  }, [localStorage.getItem("BusinessId")]);
  const handleBusinessSizeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedSize = e.target.value;
    setBusinessSize(selectedSize);
    setForm({ ...form, businessSize: selectedSize });
  };
  const HTTPS_PREFIX = "https://";
  const PREFIX_LEN = HTTPS_PREFIX.length;
const handleWebsiteBlur = async () => {
    const url = form.businessUrl;
    if (!url) return;
console.log(url,"url")
    setIsVerifying(true);
    try {
      const result = await validateWebsite(url);
      console.log(url,"url")
      setIsWebsiteValid(result.valid);
    } catch (err) {
      console.error("Website verification error:", err);
      setIsWebsiteValid(false);
    } finally {
      setIsVerifying(false);
    }
  };
  const validateWebsite = async (url) => {
    try {
        const res = await axios.post(`${URL}/api/validate-website`, { website: url });
        return res.data;
    } catch (error) {
        console.error("Error validating website:", error);
        return { valid: false, reason: 'Error validating website' };
    }
};

  

  const validatePhoneNumber = (phone: string) => {
    const phoneNumberObj = parsePhoneNumberFromString(phone, selectedCountry);
    return phoneNumberObj && phoneNumberObj.isValid();
  };

  function extractPromptVariables(template, dataObject) {
    const matches = [...template.matchAll(/{{(.*?)}}/g)];
    const uniqueVars = new Set(matches.map(m => m[1].trim()));

    // Flatten dataObject to a key-value map
    const flatData = {};

    function flatten(obj) {
      for (const key in obj) {
        const val = obj[key];
        if (typeof val === "object" && val !== null && 'key' in val && 'value' in val) {
          flatData[val.key.trim()] = val.value;
        } else if (typeof val === "object" && val !== null) {
          flatten(val); // Recursively flatten nested objects
        }
      }
    }

    flatten(dataObject);

    return Array.from(uniqueVars).map(variable => ({
      name: variable,
      value: flatData[variable] ?? null,
      status: true
    }));
  }
  useEffect(() => {
    const serviceMap: { [key: string]: string[] } = {};
    businessServices.forEach((b) => {
      serviceMap[b.type] = b.services;
    });
    setAllServices(serviceMap);
  }, []);
  useEffect(() => {
    if (step === 4) {
      const fetchVoices = async () => {
        setLoadingVoices(true);
        setVoiceError("");
        try {
          const data = await getRetellVoices();

          setRetellVoices(data);
        } catch (err) {
          setVoiceError("Failed to load voices");
          console.error("Error fetching voices:", err);
        } finally {
          setLoadingVoices(false);
        }
      };

      fetchVoices();
    }
  }, [step]);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setForm({});
      setSelectedType("");
      setUserSearch("");
      setBusinessSearch("");
    }
  }, [isOpen]);

  // const handleNext = () => {
  //   if (step === 1 && !form.userId) return alert("Please select a user")
  //   if (step === 2 && !form.businessType) return alert("Please select business type")
  //   if (step === 3 && !form.businessName && !form.website) return alert("Enter business name or website")
  //   if (step === 4 && !form.language) return alert("Please select a language")
  //   setStep(step + 1)
  // }

  const handleNext = async () => {
    if (step === 1) {
      if (!form.userId) return alert("Select a user");

      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/agent/check_user_free_agent/${form.userId}`
        );

        if (res.data.hasFreeAgent) {
          return Swal.fire("This user already has a free agent.");
        }

        // ✅ Move to next step
        // or your logic to move next
      } catch (err) {
        console.error("Error checking free agent:", err);
        Swal.fire("Error", "Something went wrong while checking agent status.", "error");
      }
    }

    if (step === 2 && !form.businessType)
      return alert("Select at least one business type");
    if (step === 3 && !form.businessName && !form.businessUrl)
      return alert("Please fill one of the fields");
    if (step === 4 && !form.language && !form.voice) return alert("language and voice are required");

    //    if (step === 2) {
    //   const payload = {
    //     userId: form.userId,
    //     businessType: form.businessType || "Other",
    //     businessName: form.businessName || "",
    //     businessSize: businessSize || "",
    //     customBuisness:
    //       selectedType === "Other" ? newBusinessType || "Business" : "",
    //     buisnessService: form.services || [],
    //     customServices: form.customServices || [],
    //     buisnessEmail: form.email || "",
    //   };

    //   try {
    //     await axios.post(`${URL}/api/business/setup`, payload);
    //     console.log("Step 2 business details submitted successfully");
    //   } catch (error) {
    //     console.error("Error submitting business details:", error);
    //   }
    // }

    // if (step === 4) {
    //   await axios.post(`${URL}/api/business/details`, {
    //     userId: form.userId,
    //     googleBusiness,
    //     websiteUrl,
    //     ...manualBusinessDetails,
    //   })
    // }

    setStep((prev) => prev + 1);
  };
  const knowledgebaseName = localStorage.getItem("knowledgebaseName");
  const handlePrevious = () => setStep(step - 1);
  const businessType = localStorage.getItem("businessType");
  const handleSubmit = async () => {
    try {
      const {
        language,
        gender,
        voice,
        agentName,
        avatar,
        userId,
        agentLanguage,
        businessName,
        address,
        email,
        about,
        businessType,
        services,
        customBuisness,
        role,
      } = form;
      console.log(voice, "voice");
      console.log(form.agentName,"agentname")
      const getLeadTypeChoices = () => {
        const fixedChoices = ["Spam Caller", "Irrelvant Call", "Angry Old Customer"];
       
        const cleanedServices = services
            .map(service => service?.trim()) // remove extra whitespace
            .filter(service => service && service?.toLowerCase() !== "other")
            .map(service => {
                const normalized = service?.replace(/\s+/g, " ")?.trim();
                return `Customer for ${normalized}`;
            });
        const combinedChoices = Array.from(new Set([...fixedChoices, ...cleanedServices]));
        return combinedChoices;
    }
      // return
 const plan= "free";
const languageAccToPlan = ["Scaler", "Growth", "Corporate"].includes(plan)
      ? "multi"
      : form.agentLanguage;
           const addressFields = extractAddressFields(addressComponents);
const currentState =  addressFields?.state || "";
console.log(currentState,"currentState")
 const timeZone = await getTimezoneFromState(currentState);
 console.log(timeZone,"timeZone")
const currentTime = new Date().toLocaleString("en-US", { timeZone: timeZone.timezoneId });


      const aboutBusinessForm =
        localStorage.getItem("businessonline") || form.about || "";
    //  console.log(currentTime,"currentTime")

    const statesRequiringCallRecording = [
        "Washington",
        "Vermont",
        "Pennsylvania",
        "Oregon",
        "New Hampshire",
        "Nevada",
        "Montana",
        "Michigan",
        "Massachusetts",
        "Maryland",
        "Illinois",
        "Florida",
        "Delaware",
        "Connecticut",
        "California",
    ];
    const CallRecording = statesRequiringCallRecording.includes(currentState)
        ? true
        : false;
       
      const filledPrompt = getAgentPrompt({
        industryKey: businessType === "Other" ? customBuisness : businessType,
        roleTitle: selectedRole,
        agentName: form.agentName,
        agentGender: gender,
        business: {
          businessName: businessName || "Your Business",
          email: email || "",
          aboutBusiness: about || "", // this can remain for context
          address: address || "",
        },
        languageSelect: languageAccToPlan,
        businessType,
        aboutBusinessForm, // this will now work fine
        commaSeparatedServices: services?.join(", ") || "",
        agentNote: "",
      timeZone: timeZone?.timezoneId,
       currentTime,
        languageAccToPlan,
      plan,
      CallRecording,
      });
      const filledPrompt2 = getAgentPrompt({
 
  industryKey: businessType === "Other" ? customBuisness : businessType,
  roleTitle: selectedRole,
  agentName: "{{AGENT NAME}}",
  agentGender: "{{AGENT GENDER}}",
  business: {
    businessName: "{{BUSINESS NAME}}",
    email: "{{BUSINESS EMAIL ID}}",
    aboutBusiness: "{{MORE ABOUT YOUR BUSINESS}}",
    address: "{{BUSINESS ADDRESS}}"
  },
  languageSelect: "{{LANGUAGE}}",
  businessType: "{{BUSINESSTYPE}}",
  aboutBusinessForm: {
    businessUrl: "{{BUSINESS WEBSITE URL}}", // give unique name
    about: "{{MORE ABOUT YOUR BUSINESS}}"     // can reuse or separate
  },
  commaSeparatedServices: "{{SERVICES}}",
  agentNote: "{{AGENTNOTE}}",
  timeZone: "{{TIMEZONE}}"
});



     const promptVariablesList = extractPromptVariables(filledPrompt2, {
  industryKey: businessType === "Other" ? customBuisness : businessType,
  roleTitle: sessionStorage.getItem("agentRole"),
  agentName: { key: "AGENT NAME", value: form?.agentName || "" },
  agentGender: { key: "AGENT GENDER", value:gender || "" },
  business: {
    businessName: { key: "BUSINESS NAME", value: form.businessName || "" },
    email: { key: "BUSINESS EMAIL ID", value: form.email || "" },
    aboutBusiness: {
      key: "MORE ABOUT YOUR BUSINESS",
      value: form.aboutBusiness || ""
    },
    address: { key: "BUSINESS ADDRESS", value: form.address || "" }
  },
  languageSelect: { key: "LANGUAGE", value: agentLanguage || "" },
  businessType: { key: "BUSINESSTYPE", value: businessType || "" },
  commaSeparatedServices: {
    key: "SERVICES",
    value: services?.join(", ") || ""
  },
  timeZone: {
    key: "TIMEZONE",
    value: timeZone || ""
  },
  aboutBusinessForm: {
    businessUrl: {
      key: "BUSINESS WEBSITE URL",
      value: form.businessUrl || ""
    }
  },
  currentTime:{
    key:"current_time_[timezone]",
    value:currentTime||""
  },
  agentNote: {
    key: "AGENTNOTE",
    value: form.agentNote || ""
  }
});



      console.log("generatePrompt", filledPrompt2);
      console.log(promptVariablesList)

      const agentConfig = {
        version: 0,
        model: "gemini-2.0-flash",
        model_temperature: 0,
        model_high_priority: true,
        tool_call_strict_mode: true,
        general_prompt: filledPrompt,
        general_tools: [
          {
            type: "end_call",
            name: "end_call",
            description: "End the call with user.",
          },
          {
            "type": "extract_dynamic_variable",
            "name": "extract_user_details",
            "description": "Extract the user's details like name, email, phone number, address, and reason for calling from the conversation",
            "variables": [
              {
                "type": "string",
                "name": "email",
                "description": "Extract the user's email address from the conversation"
              },
              {
                "type": "number",
                "name": "phone",
                "description": "Extract the user's phone number from the conversation"
              },
              {
                "type": "string",
                "name": "address",
                "description": "Extract the user's address from the conversation"
              },
              {
                "type": "string",
                "name": "reason",
                "description": "Extract the user's reason for calling from the conversation"
              },
              {
                "type": "string",
                "name": "name",
                "description": "Extract the user's name from the conversation\""
              },
            ]
          }

        ],
        states: [
          {
            name: "information_collection",
            state_prompt: `Greet the user with the begin_message and assist with their query.

                               If the user sounds dissatisfied (angry, frustrated, upset) or uses negative words (like "bad service", "unhappy", "terrible","waste of time"),
                               ask them: "I'm sorry to hear that. Could you please tell me about your concern?"
                               Analyze their response. 
                               
                                If the concern contains **spam, irrelevant or abusive content**
                                (e.g., random questions, profanity, jokes), say:
                                "I’m here to assist with service-related concerns. Could you please share your issue regarding our service?"
                                and stay in this state.

                                If the concern is **service-related** or **business** (e.g., staff, delay, poor support),
                                transition to dissatisfaction_confirmation.

                                If the user asks for an appointment (e.g., "appointment", "book", "schedule"),
                                transition to appointment_booking.

                                If the user is silent or unclear, say: "Sorry, I didn’t catch that. Could you please repeat?"
                                If the user wants to end the call transition to end_call_state`,
            edges: [

              {
                destination_state_name: "dissatisfaction_confirmation",
                description: "User sounds angry or expresses dissatisfaction."
              }
            ]
          },

          {
            name: "appointment_booking",
            state_prompt: "## Task\nYou will now help the user book an appointment."
          },

          // 🌟 State: Dissatisfaction Confirmation
          {
            name: "dissatisfaction_confirmation",
            state_prompt: `
                            Say: "I'm sorry you're not satisfied. Would you like me to connect you to a team member? Please say yes or no."
                            Wait for their response.

                            If the user says yes, transition to call_transfer.
                            If the user says no, transition to end_call_state.
                            If the response is unclear, repeat the question once.
                        `,
            edges: [
              {
                destination_state_name: "call_transfer",
                description: "User agreed to speak to team member."
              },
              {
                destination_state_name: "end_call_state",
                description: "User declined to speak to team member."
              }
            ],
            tools: []
          },

         
          {
            name: "call_transfer",
            state_prompt: `
                            Connecting you to a team member now. Please hold.
                        `,
            tools: [
              {
                type: "transfer_call",
                name: "transfer_to_team",
                description: "Transfer the call to the team member.",
                transfer_destination: {
                  type: "predefined",
                  number: "{{business_Phone}}"
                },
                transfer_option: {
                  type: "cold_transfer",
                  public_handoff_option: {
                    message: "Please hold while I transfer your call."
                  }
                },
                speak_during_execution: true,
                speak_after_execution: true,
                failure_message: "Sorry, I couldn't transfer your call. Please contact us at {{business_email}} or call {{business_Phone}} directly."
              }
            ],
            edges: []
          },
          {
            name: "end_call_state",
            state_prompt: `
                            Politely end the call by saying: "Thank you for calling. Have a great day!"
                        `,
            tools: [
              {
                type: "end_call",
                name: "end_call1",
                description: "End the call with the user."
              }
            ],
            edges: []
          }
        ],
        starting_state: "information_collection",

        // begin_message: `Hi I’m ${promptVars.agentName}, calling from ${promptVars.business.businessName}. How may I help you?`,
        default_dynamic_variables: {
          customer_name: "John Doe",
          timeZone: timeZone,
          business_Phone: `${form.phone}`||"", business_email: `${form.email}`||"", 
          timeZone:timeZone?.timezoneId
        },
      //   states: [
      //     {
      //       name: "information_collection",
      //       state_prompt: "## Task\nGreet the user and ask how you can help.",
      //       script: `
      //   if (wait_for_user_input) {
      //     speak("How can I assist you today?");
      //     wait_for_user_input();
      //   }
      // `,
      //       edges: [],
      //     },
      //   ],
      };
      const knowledgeBaseId = localStorage.getItem("knowledgeBaseId");

      agentConfig.knowledge_base_ids = [knowledgeBaseId];


      const llmRes = await axios.post(
        `${URL}/api/agent/createAdmin/llm`,
        agentConfig,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_RETELL_API}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(llmRes);
      const llmId = llmRes.data.data.llm_id;
      console.log(llmId);

      const finalAgentData = {
        response_engine: { type: "retell-llm", llm_id: llmId },
        voice_id: voice,
        // language,
        agent_name:  knowledgebaseName|| "Virtual Assistant",
       language: languages.find((l) => l.name === languageAccToPlan)?.locale || "multi",
        post_call_analysis_model: "gpt-4o-mini",
        responsiveness: 1,
        enable_backchannel: true,
        interruption_sensitivity: 0.91,
        normalize_for_speech: true,
        backchannel_frequency: 0.7,
        backchannel_words: [
          "Got it",
          "Yeah",
          "Uh-huh",
          "Understand",
          "Ok",
          "hmmm",
        ],
         post_call_analysis_data: [
                        {
                            type: "enum",
                            name: "lead_type",
                            description: "Feedback given by the customer about the call.",
                            choices: getLeadTypeChoices(),
                        },
                        {
                            type: "string",
                            name: "name",
                            description: "Extract the user's name from the conversation",
                            examples: [
                                "Ajay Sood",
                                "John Wick",
                                "Adam Zampa",
                                "Jane Doe",
                                "Nitish Kumar",
                                "Ravi Shukla",
                            ],
                        },
                        {
                            type: "string",
                            name: "email",
                            description: "Extract the user's email from the conversation",
                            examples: [
                                "john.doe@example.com",
                                "nitish@company.in",
                                "12@gmail.com",
                            ],
                        },
                        {
                            type: "string",
                            name: "reason",
                            description:
                                "The reason the user is calling or their inquiry. If provided in Hindi, translate to English. Summarize if it's long.",
                            examples: [
                                "Schedule an appointment",
                                "Ask about services",
                                "Request for accounting help",
                            ],
                        },
                        {
                            type: "string",
                            name: "address",
                            description: "The user's address or business location. If spoken in Hindi, translate to English. Format it for use in CRM or contact forms.",
                            examples: ["123 Main St, Delhi", "42 Wallaby Way, Sydney", "1490 Aandhar Eleven"],
                        },
                        {
                            type: "number",
                            name: "phone_number",
                            description:
                                "The user's phone number in numeric format. If digits are spoken in words (e.g., 'seven eight seven six one two'), convert them to digits (e.g., '787612'). Ensure it's a valid number when possible.",

                        },
                    ],
                     end_call_after_silence_ms: 30000,
                    normalize_for_speech: true,
                    webhook_url: `${process.env.NEXT_PUBLIC_API_URL}/agent/updateAgentCall_And_Mins_WebHook`,
      };
      console.log(finalAgentData);

      const agentRes = await axios.post(
        "https://api.retellai.com/create-agent",
        finalAgentData,
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_RETELL_API}`,
          },
        }
      );

      const agentId = agentRes.data.agent_id;

      const dbPayload = {
        userId:form.userId ||localStorage.getItem("AgentForUserId")||"",
        agent_id: agentId,
        llmId,
        avatar,
        agentVoice: voice,
        knowledgeBaseId: localStorage.getItem("knowledgeBaseId"),
        agentAccent: form.selectedVoice?.voice_accent || "American",
        agentRole: selectedRole,
        agentName: form.agentName|| form.selectedVoice?.voice_name||"Virtual Assistant",
        agentLanguageCode: languages.find((l) => l.name === languageAccToPlan)?.locale || "multi",
        agentLanguage: agentLanguage,
        dynamicPromptTemplate: filledPrompt,
        rawPromptTemplate: filledPrompt2,
        promptVariablesList: JSON.stringify(promptVariablesList),
        agentGender: gender,
        agentCode:localStorage.getItem("agentCode"),
        agentPlan: "free",
        agentStatus: true,
        businessId: localStorage.getItem("BusinessId"),
        additionalNote: "",
         responsiveness: 1,
         enable_backchannel: true,
         CallRecording:CallRecording,
       interruption_sensitivity: 0.7,
 backchannel_frequency: 0.7,
      backchannel_words: ["Got it", "Yeah", "Uh-huh", "Understand", "Ok", "hmmm"],
       post_call_analysis_data: [
                            {
                                type: "enum",
                                name: "lead_type",
                                description: "Feedback given by the customer about the call.",
                                choices: getLeadTypeChoices(),
                            },
                            {
                                type: "string",
                                name: "name",
                                description: "Extract the user's name from the conversation",
                                examples: [
                                    "Ajay Sood",
                                    "John Wick",
                                    "Adam Zampa",
                                    "Jane Doe",
                                    "Nitish Kumar",
                                    "Ravi Shukla",
                                ],
                            },
                            {
                                type: "string",
                                name: "email",
                                description: "Extract the user's email from the conversation",
                                examples: [
                                    "john.doe@example.com",
                                    "nitish@company.in",
                                    "12@gmail.com",
                                ],
                            },
                            {
                                type: "string",
                                name: "reason",
                                description:
                                    "The reason the user is calling or their inquiry. If provided in Hindi, translate to English. Summarize if it's long.",
                                examples: [
                                    "Schedule an appointment",
                                    "Ask about services",
                                    "Request for accounting help",
                                ],
                            },
                            {
                                type: "string",
                                name: "address",
                                description: "The user's address or business location. If spoken in Hindi, translate to English. Format it for use in CRM or contact forms.",
                                examples: ["123 Main St, Delhi", "42 Wallaby Way, Sydney", "1490 Aandhar Eleven"],
                            },
                            {
                                type: "number",
                                name: "phone_number",
                                description:
                                    "The user's phone number in numeric format. If digits are spoken in words (e.g., 'seven eight seven six one two'), convert them to digits (e.g., '787612'). Ensure it's a valid number when possible.",

                            },
                        ],
      };

      const saveRes = await createAgent(dbPayload);
      if (saveRes.status === 200 || saveRes.status === 201) {
        alert("Agent created successfully!");
        localStorage.removeItem("businessType");
        localStorage.removeItem("agentCode");
        localStorage.removeItem("");
        onClose();
      } else {
        throw new Error("Agent creation failed.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Agent creation failed. Please check console for details.");
    } finally {
    }
  };

  const extractAddressFields = (components: any[]) => {
    const getComponent = (primaryType: string, fallbackType: string | null = null, useShort = false) => {
      const comp = components.find(
        (c) =>
          c.types.includes(primaryType) ||
          (fallbackType && c.types.includes(fallbackType))
      );
      return comp ? (useShort ? comp.short_name : comp.long_name) : "";
    };

    return {
      city: getComponent("locality", "sublocality_level_1"),
      state: getComponent("administrative_area_level_1"),
      state_code: getComponent("administrative_area_level_1", null, true),
      country: getComponent("country"),
      country_code: getComponent("country", null, true),
      postal_code: getComponent("postal_code"),
      street_number: getComponent("street_number"),
      route: getComponent("route"),
    };
  };

  // Updated useEffect for Google Places API
  useEffect(() => {
    if (!isOpen || !window.google?.maps?.places) return;

    const interval = setInterval(() => {
      if (
        document.getElementById("google-autocomplete") &&
        document.getElementById("google-address-autocomplete")
      ) {
        // Business autocomplete
        const businessAutocomplete = new window.google.maps.places.Autocomplete(
          document.getElementById("google-autocomplete") as HTMLInputElement,
          {
            types: ["establishment"],
            fields: [
              "place_id",
              "name",
              "url",
              "formatted_address",
              "formatted_phone_number",
              "rating",
              "user_ratings_total",
              "opening_hours",
              "business_status",
              "types",
              "address_components",
            ],
          }
        );

        businessAutocomplete.addListener("place_changed", () => {
          const place = businessAutocomplete.getPlace();
          setForm({
            ...form,
            googleBusiness: place.name || "",
            businessName: place.name || "",
            address: place.formatted_address || "",
            phone: place.formatted_phone_number || "",
            businessUrl: place.url || "",
            rating: place.rating || "N/A",
            totalRatings: place.user_ratings_total || "N/A",
            hours: place.opening_hours
              ? place.opening_hours.weekday_text.join(", ")
              : "N/A",
            businessStatus: place.business_status || "N/A",
            categories: place.types ? place.types.join(", ") : "N/A",
          });
          setAddressComponents(place.address_components || []);
          setSelectedCountry(
            place.address_components?.find((c) => c.types.includes("country"))?.short_name || "US"
          );
        });

        // Address autocomplete
        const addressAutocomplete = new window.google.maps.places.Autocomplete(
          document.getElementById("google-address-autocomplete") as HTMLInputElement,
          {
            types: ["geocode"],
            fields: ["address_components", "formatted_address"],
          }
        );

        addressAutocomplete.addListener("place_changed", () => {
          const place = addressAutocomplete.getPlace();
          setForm({
            ...form,
            address: place.formatted_address || "",
          });
          setAddressComponents(place.address_components || []);
          setSelectedCountry(
            place.address_components?.find((c) => c.types.includes("country"))?.short_name || "US"
          );
        });

        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [isOpen, form]);
  const voiceAvatar = (provider: string) => {
    switch (provider?.toLowerCase()) {
      case "elevenlabs":
        return "/avatars/11labs.png";
      default:
        return "/avatars/default-voice.png";
    }
  };
  useEffect(() => {
    if (retellVoices && form.gender) {
      const filtered = retellVoices.filter(
        (v) =>
          v.provider === "elevenlabs" &&
          v.gender?.toLowerCase() === form.gender.toLowerCase()
      );
      setFilteredVoices(filtered);
    }
  }, [retellVoices, form.gender]);

  const togglePlay = (idx) => {
    const thisAudio = audioRefs.current[idx];
    if (!thisAudio) return;

    if (playingIdx === idx) {
      thisAudio.pause();
      setPlayingIdx(null);
      return;
    }

    if (playingIdx !== null) {
      const prev = audioRefs.current[playingIdx];
      prev?.pause();
      prev.currentTime = 0;
    }

    thisAudio.play();
    setPlayingIdx(idx);
    thisAudio.onended = () => setPlayingIdx(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Agent" width="max-w-xl">
      <div className="space-y-4">
       {step === 1 && (
  <div>
    <label htmlFor="user-select" className="block text-sm font-medium text-gray-700">
      Select User
    </label>
    <Select
      onValueChange={(value) => {
        setForm((prev) => ({ ...prev, userId: value }));
        localStorage.setItem("AgentForUserId", value); // Consistent camelCase
      }}
      value={form.userId || ""} // Ensure controlled component
    >
      <SelectTrigger id="user-select" aria-label="Select user">
        <SelectValue placeholder="Choose user" />
      </SelectTrigger>
      <SelectContent>
        <div className="px-2 py-1">
          <Input
            id="user-search"
            placeholder="Search user..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="mb-2"
            aria-label="Search users by name or email"
          />
        </div>
        {allUsers.length === 0 ? (
          <div className="px-2 py-1 text-sm text-gray-500">
            No users available
          </div>
        ) : (
          allUsers
            .filter((user) =>
              `${user.name || ""} ${user.email || ""}`
                .toLowerCase()
                .includes(userSearch.toLowerCase().trim())
            )
            .map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name || "No Name"} ({user.email || "No Email"})
              </SelectItem>
            ))
        )}
        {allUsers.length > 0 &&
          allUsers.filter((user) =>
            `${user.name || ""} ${user.email || ""}`
              .toLowerCase()
              .includes(userSearch.toLowerCase().trim())
          ).length === 0 && (
            <div className="px-2 py-1 text-sm text-gray-500">
              No users match your search
            </div>
          )}
      </SelectContent>
    </Select>
  </div>
)}


        {step === 2 && (
          <div className="space-y-3">
            {/* BUSINESS TYPE */}
            <div>
              <label className="block text-sm font-medium">Business Type</label>
              <Select
                onValueChange={(val) => {
                  if (val === "Other") {
                    setSelectedType("Other");
                    setForm((prev) => ({
                      ...prev,
                      businessType: "",
                      businessSubtype: "",
                      businessIcon: "",
                      services: [],
                      customBuisness: "",
                    }));
                    localStorage.setItem("businessType", "");
                  } else {
                    const selected = businessTypes.find((b) => b.type === val);
                    setSelectedType(val);
                    setForm((prev) => ({
                      ...prev,
                      businessType: val,
                      businessSubtype: selected?.subtype || "",
                      businessIcon: selected?.icon || "",
                      services: [],
                      customBuisness: "",
                    }));
                    localStorage.setItem("businessType", val);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1">
                    <Input
                      placeholder="Search business..."
                      value={businessSearch}
                      onChange={(e) => setBusinessSearch(e.target.value)}
                      className="mb-2"
                    />
                  </div>

                  {businessTypes
                    .filter((b) =>
                      `${b.type} ${b.subtype}`
                        .toLowerCase()
                        .includes(businessSearch.toLowerCase())
                    )
                    .map((b) => (
                      <SelectItem key={b.type} value={b.type}>
                        {b.type} - {b.subtype}
                      </SelectItem>
                    ))}

                  {!businessTypes.some(
                    (b) => b.type.toLowerCase() === "other"
                  ) && <SelectItem value="Other">Other</SelectItem>}
                </SelectContent>
              </Select>

              {selectedType === "Other" && (
                <Input
                  placeholder="Add new business type"
                  value={newBusinessType}
                  onChange={(e) => setNewBusinessType(e.target.value)}
                  onBlur={() => {
                    const trimmed = newBusinessType.trim();
                    if (
                      trimmed &&
                      !businessTypes.some(
                        (b) => b.type.toLowerCase() === trimmed.toLowerCase()
                      )
                    ) {
                      const newBusiness = {
                        type: trimmed,
                        subtype: "Custom",
                        icon: "svg/Web-Design-Agency-icon.svg",
                      };

                      setBusinessTypes((prev) => [...prev, newBusiness]);

                      // Add blank services for this new type
                      setAllServices((prev) => ({
                        ...prev,
                        [trimmed]: [],
                      }));

                      setSelectedType(trimmed);
                      localStorage.setItem("businessType", trimmed); // ✅ Save custom type too

                      setForm((prev) => ({
                        ...prev,
                        businessType: trimmed,
                        businessSubtype: "Custom",
                        businessIcon: newBusiness.icon,
                        services: [],
                        customBuisness: trimmed,
                      }));
                    }
                    setNewBusinessType("");
                  }}
                  className="mt-2"
                />
              )}
            </div>

            {/* BUSINESS SIZE */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Business Size
              </label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={businessSize}
                onChange={(e) => setBusinessSize(e.target.value)}
              >
                <option value="" disabled>
                  Select Business Size
                </option>
                <option value="1 to 10 employees">1 to 10 employees</option>
                <option value="10 to 50 employees">10 to 50 employees</option>
                <option value="50 to 100 employees">50 to 100 employees</option>
                <option value="100 to 250 employees">
                  100 to 250 employees
                </option>
                <option value="250 to 500 employees">
                  250 to 500 employees
                </option>
                <option value="500 to 1000 employees">
                  500 to 1000 employees
                </option>
                <option value="1000+ employees">1000+ employees</option>
              </select>
            </div>

            {/* SERVICES */}
            {/* SERVICES */}
            <div>
              <label className="block text-sm font-medium">
                Select Services
              </label>

              {(allServices[selectedType] || []).map((service) => (
                <div key={service}>
                  <input
                    type="checkbox"
                    checked={form.services?.includes(service)}
                    onChange={() => {
                      const current = form.services || [];
                      const updated = current.includes(service)
                        ? current.filter((s) => s !== service)
                        : [...current, service];
                      setForm((prev) => ({ ...prev, services: updated }));
                    }}
                  />{" "}
                  {service}
                </div>
              ))}

              {/* ✅ If custom business type, show add-service input directly */}
              {selectedType && !allServices[selectedType]?.length && (
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    placeholder="Add new service"
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = newService.trim();
                      if (
                        trimmed &&
                        !(allServices[selectedType] || []).includes(trimmed)
                      ) {
                        const updatedServices = [
                          ...(allServices[selectedType] || []),
                          trimmed,
                        ];
                        setAllServices((prev) => ({
                          ...prev,
                          [selectedType]: updatedServices,
                        }));

                        const updatedFormServices = [
                          ...(form.services || []),
                          trimmed,
                        ];
                        setForm((prev) => ({
                          ...prev,
                          services: updatedFormServices,
                          customServices: [
                            ...(prev.customServices || []),
                            trimmed,
                          ],
                        }));
                      }
                      setNewService("");
                    }}
                    className="text-purple-600 hover:text-purple-800 text-xl"
                    title="Add service"
                  >
                    ➕
                  </button>
                </div>
              )}

              {/* If it's a normal business type with services, allow "Other" checkbox */}
              {allServices[selectedType]?.length > 0 &&
                !allServices[selectedType]?.includes("Other") && (
                  <div>
                    <input
                      type="checkbox"
                      checked={form.services?.includes("Other")}
                      onChange={() => {
                        const current = form.services || [];
                        const updated = current.includes("Other")
                          ? current.filter((s) => s !== "Other")
                          : [...current, "Other"];
                        setForm((prev) => ({ ...prev, services: updated }));
                      }}
                    />{" "}
                    click for add more
                  </div>
                )}

              {/* Add new service if "Other" checkbox is checked */}
              {form.services?.includes("Other") && (
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    placeholder="Add new service"
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = newService.trim();
                      if (
                        trimmed &&
                        !(allServices[selectedType] || []).includes(trimmed)
                      ) {
                        const updatedServices = [
                          ...(allServices[selectedType] || []),
                          trimmed,
                        ];
                        setAllServices((prev) => ({
                          ...prev,
                          [selectedType]: updatedServices,
                        }));

                        const updatedFormServices = [
                          ...(form.services || []).filter((s) => s !== "Other"),
                          trimmed,
                        ];
                        setForm((prev) => ({
                          ...prev,
                          services: updatedFormServices,
                          customServices: [
                            ...(prev.customServices || []),
                            trimmed,
                          ],
                        }));
                      }
                      setNewService("");
                    }}
                    className="text-purple-600 hover:text-purple-800 text-xl"
                    title="Add service"
                  >
                    ➕
                  </button>
                </div>
              )}
            </div>

            {/* SUBMIT BUTTON FOR STEP 2 */}
            <div className="pt-4">
              <button
                type="button"
                className="bg-purple-600 text-white px-4 py-2 rounded"
                onClick={async () => {
                  const payload = {
                    userId: form.userId,
                    businessType: form.businessType || "Other",
                    businessName: form.businessName || "",
                    businessSize: businessSize || "",
                    customBuisness:
                      selectedType === "Other"
                        ? newBusinessType || "Business"
                        : "",
                    buisnessService: form.services || [],
                    customServices: form.customServices || [],
                    buisnessEmail: form.email || "",
                  };

                  try {
                    const res = await axios.post(
                      `${URL}/api/businessDetails/create`,
                      payload
                    );
                    console.log(
                      res,
                      "Step 2 business details submitted successfully"
                    );
                    localStorage.setItem(
                      "BusinessId",
                      res.data.record.businessId
                    );
                    localStorage.setItem("agentCode", res.data.agentCode);
                    setStep((prev) => prev + 1);
                  } catch (error) {
                    console.error("Error submitting business details:", error);
                  }
                }}
              >
                Save Business Details
              </button>
            </div>
          </div>
        )}


       {step === 3 && (
          <div className="space-y-4 border rounded-xl p-4 shadow">
            <Input
              id="google-autocomplete"
              placeholder="Search business via Google (e.g., DesignersX)"
              className="w-full"
              value={form.googleBusiness || ""}
              onChange={(e) => {
                setForm({ ...form, googleBusiness: e.target.value });
                setHasNoGoogleOrWebsite(false);
              }}
            />

            <div className="relative w-full">
              <Input
                placeholder="Website URL include https://"
                value={form.businessUrl || ""}
                onChange={(e) => {
                  setForm({ ...form, businessUrl: e.target.value });
                  setIsWebsiteValid(null);
                }}
                onKeyDown={(e) => {
                  const input = e.currentTarget;
                  const { key } = e;
                  const { selectionStart, selectionEnd, value } = input;
                  const fullSelection = selectionStart === 0 && selectionEnd === value.length;

                  if (key === "Backspace" || key === "Delete") {
                    if (fullSelection) {
                      e.preventDefault();
                      setForm((prev) => ({ ...prev, businessUrl: HTTPS_PREFIX }));
                      requestAnimationFrame(() => {
                        input.setSelectionRange(PREFIX_LEN, PREFIX_LEN);
                      });
                      return;
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
                    setForm((prev) => ({
                      ...prev,
                      businessUrl: HTTPS_PREFIX + input.value,
                    }));
                    requestAnimationFrame(() => {
                      input.setSelectionRange(PREFIX_LEN, PREFIX_LEN);
                    });
                  }
                }}
                onBlur={handleWebsiteBlur}
              />
              {form.businessUrl && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  {isVerifying ? (
                    <span className="text-sm text-gray-500">Verifying...</span>
                  ) : isWebsiteValid === true ? (
                    <span className="text-green-600 font-bold">✔️</span>
                  ) : isWebsiteValid === false ? (
                    <span className="text-red-600 font-bold">❌</span>
                  ) : null}
                </div>
              )}
            </div>

            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={hasNoGoogleOrWebsite}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setHasNoGoogleOrWebsite(checked);
                  if (checked) {
                    setForm({
                      ...form,
                      googleBusiness: "",
                      businessUrl: "",
                    });
                  }
                }}
              />
              <span>I don’t have Google Business or Website URL</span>
            </label>

            <p className="text-center text-sm text-gray-500">-- OR --</p>

            <Input
              placeholder="Business Name"
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
            />
            <Input
              id="google-address-autocomplete"
              placeholder="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            <Input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Input
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Textarea
              placeholder="About your business"
              value={form.about}
              onChange={(e) => setForm({ ...form, about: e.target.value })}
            />
            <button
              className="bg-purple-600 text-white px-4 py-2 rounded w-full"
              onClick={async () => {
                const hasGoogle = form.googleBusiness?.trim();
                const hasWebsite = form.businessUrl?.trim();
                const manuallyFilled = form.businessName && form.address && form.phone && form.email;

                if (!hasNoGoogleOrWebsite && (!hasGoogle || !hasWebsite)) {
                  alert(
                    "Please enter both Google Business and Website URL, or check the 'I don't have...' option."
                  );
                  return;
                }

                if (hasNoGoogleOrWebsite && !manuallyFilled) {
                  alert("Please fill out the manual form.");
                  return;
                }

                if (form.phone && !validatePhoneNumber(form.phone)) {
                  alert("Please enter a valid phone number.");
                  return;
                }

                const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                if (form.email && !isValidEmail(form.email)) {
                  alert("Please enter a valid email address.");
                  return;
                }

                const containsSpecialChars = (str: string) => /[!@#$%^&*(),.?":{}|<>]/.test(str);
                const containsEmoji = (str: string) =>
                  /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF])/g.test(str);
                if (form.about && (containsSpecialChars(form.about) || containsEmoji(form.about))) {
                  alert("About Business cannot contain special characters or emojis.");
                  return;
                }

                const addressFields = extractAddressFields(addressComponents);

                const urls = [];
                if (hasWebsite) {
                  urls.push(hasWebsite);
                }
                if (hasGoogle) {
                  const query = encodeURIComponent(`${form.businessName || "N/A"} ${form.address || "N/A"}`);
                  const googleSearchUrl = `https://www.google.com/search?q=${query}`;
                  urls.push(googleSearchUrl);
                }

                const textContent = [
                  {
                    title: "Business Details",
                    text: `Business Name: ${form.businessName || "N/A"}
Address: ${form.address || "N/A"}
Phone: ${form.phone || "N/A"}
International Phone: ${form.phone || "N/A"}
Website: ${form.businessUrl || "N/A"}
Rating: ${form.rating || "N/A"}
Total Ratings: ${form.totalRatings || "N/A"}
Hours: ${form.hours || "N/A"}
Business Status: ${form.businessStatus || "N/A"}
Categories: ${form.categories || "N/A"}
Address components: ${JSON.stringify(addressComponents)}
Email: ${form.email || "N/A"}
About Bussiness: ${form.about || "N/A"}
City: ${addressFields.city || "N/A"}
State: ${addressFields.state || "N/A"}
Country: ${addressFields.country || "N/A"}
Postal code: ${addressFields.postal_code || "N/A"}
Street number: ${addressFields.street_number || "N/A"}
Country code: ${addressFields.country_code || "N/A"}
State code: ${addressFields.state_code || "N/A"}`,
                  },
                ];

                const knowledgeBaseName = localStorage.getItem("knowledgebaseName") || "My Business KB";
                const businessId = localStorage.getItem("BusinessId");

                try {
                  const formData = new FormData();
                  formData.append("knowledge_base_name", knowledgeBaseName);
                  formData.append("enable_auto_refresh", "true");
                  formData.append("knowledge_base_texts", JSON.stringify(textContent));
                  if (urls.length > 0) {
                    formData.append("knowledge_base_urls", JSON.stringify(urls));  
                  }

                  const res = await axios.post(
                    "https://api.retellai.com/create-knowledge-base",
                    formData,
                    {
                      headers: {
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_RETELL_API}`,
                        "Content-Type": "multipart/form-data",
                      },
                    }
                  );

                  const knowledgeBaseId = res?.data?.knowledge_base_id;
                  if (knowledgeBaseId) {
                    localStorage.setItem("knowledgeBaseId", knowledgeBaseId);

                    // await axios.patch(
                    //   `${process.env.NEXT_PUBLIC_API_URL}/api/businessDetails/updateKnowledeBase/${businessId}`,
                    //   {
                    //     knowledge_base_texts: {
                    //       businessName: form.businessName || "",
                    //       address: form.address || "",
                    //       businessphone: form.phone || "",
                    //       website: form.businessUrl || "",
                    //       rating: form.rating || "",
                    //       totalRatings: form.totalRatings || "",
                    //       hours: form.hours || "",
                    //       businessStatus: form.businessStatus || "",
                    //       categories: form.categories || "",
                    //       email: form.email || "",
                    //       aboutBussiness: form.about || "",
                    //       city: addressFields.city || "",
                    //       state: addressFields.state || "",
                    //       country: addressFields.country || "",
                    //       postal_code: addressFields.postal_code || "",
                    //       street_number: addressFields.street_number || "",
                    //       country_code: addressFields.country_code || "",
                    //       state_code: addressFields.state_code || "",
                    //     },
                    //     knowledge_base_urls: urls,
                    //     googleUrl: form.googleBusiness || "",
                    //     webUrl: form.businessUrl || "",
                    //     aboutBusiness: form.about || "",
                    //     additionalInstruction: "",
                    //     agentId: localStorage.getItem("agent_id") || null,
                    //     googleBusinessName: form.businessName || "",
                    //     address1: form.address || "",
                    //     buisnessEmail: form.email || "",
                    //     businessName: form.businessName || "",
                    //     phoneNumber: form.phone || "",
                    //     isGoogleListing: !hasNoGoogleOrWebsite,
                    //     isWebsiteUrl: !!hasWebsite,
                    //     knowledge_base_id: knowledgeBaseId,
                    //     knowledge_base_name: knowledgeBaseName,
                    //   },
                    //   {
                    //     headers: {
                    //       Authorization: `Bearer ${process.env.NEXT_PUBLIC_RETELL_API}`,
                    //       "Content-Type": "application/json",
                    //     },
                    //   }
                    // );
try {
  const response = await axios.patch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/businessDetails/updateKnowledeBase/${businessId}`,
    {
      knowledge_base_name: knowledgeBaseName,
      knowledge_base_urls: JSON.stringify(urls), // Stringify if backend expects JSON string
      knowledge_base_texts: JSON.stringify(
        {
          businessName: form.businessName || "",
          address: form.address || "",
          phone: form.phone || "",
          website: form.businessUrl || "",
          rating: form.rating || "",
          totalRatings: form.totalRatings || "",
          hours: form.hours || "",
          businessStatus: form.businessStatus || "",
          categories: form.categories || "",
          email: form.email || "",
          aboutBussiness: form.about || "",
          city: addressFields.city || "",
          state: addressFields.state || "",
          country: addressFields.country || "",
          postal_code: addressFields.postal_code || "",
          street_number: addressFields.street_number || "",
          country_code: addressFields.country_code || "",
          state_code: addressFields.state_code || "",
          buisnessEmail: form.email || "",
        },
      ),
      buisnessEmail: form.email || "",
      // buisnessEmail: form.email || "",
      googleUrl: form.googleBusiness || "",
      webUrl: form.businessUrl || "",
      aboutBusiness: JSON.stringify(form.about || ""), // Stringify if backend expects JSON string
      additionalInstruction: JSON.stringify(""), // Stringify if backend expects JSON string
      agentId: localStorage.getItem("agent_id") || null,
      googleBusinessName: form.businessName || "",
      address1: form.address || "",
      businessName: form.businessName || "",
      city: addressFields.city || "",
      state: addressFields.state || "",
      country: addressFields.country || "",
      postal_code: addressFields.postal_code || "",
      street_number: addressFields.street_number || "",
      country_code: addressFields.country_code || "",
      state_code: addressFields.state_code || "",
      knowledge_base_id: knowledgeBaseId,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_RETELL_API}`,
        "Content-Type": "application/json",
      },
    }
  );

  console.log("Knowledge base updated successfully:", response.data);
} catch (error) {
  console.error("Error updating knowledge base:", error.response?.data || error.message);
}
                    sessionStorage.setItem(
                      "placeDetailsExtract",
                      JSON.stringify({
                        businessName: form.businessName,
                        address: form.address,
                        phone: form.phone,
                        email: form.email,
                        aboutBussiness: form.about,
                        address_components: addressComponents,
                        rating: form.rating,
                        totalRatings: form.totalRatings,
                        hours: form.hours,
                        businessStatus: form.businessStatus,
                        categories: form.categories,
                      })
                    );
                  }

                  setStep((prev) => prev + 1);
                } catch (err) {
                  console.error("Failed to create knowledge base:", err);
                  if (err.response?.status === 422) {
                    alert("Knowledge base is currently updating. Try again later.");
                  } else {
                    alert("Error creating knowledge base. Try again later.");
                  }
                }
              }}
            >
              Save & Continue
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
              <label className="block text-sm font-medium">Agent Name</label>
                        <Input
                          placeholder="Agent Name"
                          value={form.agentName}
                          onChange={(e) => setForm({ ...form, agentName: e.target.value })}
            
                        />
            <label className="block text-sm font-medium">Select Language</label>
               <Select onValueChange={(v) => setForm({ ...form, language: v ,agentLanguage:languages?.find((lang) => lang?.locale == v)?.name || v})} value={form.language}>
              <SelectTrigger>
                <SelectValue placeholder="Choose language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.locale} value={lang.locale}>
                    <span className="inline-flex items-center gap-2">
                      <img
                        src={
                          lang.locale
                            ? `https://flagcdn.com/w20/${lang.locale.split("-")[1]?.toLowerCase() || "us"
                            }.png`
                            : "https://flagcdn.com/w20/us.png"
                        }
                        alt="flag"
                        className="avatar"
                      />
                      {lang.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <label className="block text-sm font-medium">Gender</label>
            <Select
              onValueChange={(v) =>
                setForm((prev) => ({
                  ...prev,
                  gender: v,
                  avatar: "", // reset avatar when gender changes
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>

            <div>
              <label className="block text-sm font-medium mb-1">Voice</label>
              {filteredVoices.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No voices found for gender: {form.gender}
                </p>
              ) : (
                <Select
                  onValueChange={(v) => {
                    const selectedVoice = filteredVoices.find(
                      (voice) => voice.voice_id === v
                    );
                    setForm({ ...form, voice: v, selectedVoice, });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose voice" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    {filteredVoices.map((voice, index) => (
                      <SelectItem
                        key={index}
                        value={voice.voice_id}
                        className="py-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          {/* <img
                      src={voiceAvatar(voice.provider)}
                      alt={voice.voice_name}
                      className="w-6 h-6 rounded-full object-cover"
                    /> */}
                          <div>
                            <p className="text-sm font-medium leading-tight">
                              {voice.voice_name}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {voice.accent
                                ? `${voice.accent} Accent`
                                : voice.provider}
                            </p>
                          </div>
                          <Button
                            type="button"
                            size="icon"
                            color="purple"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePlay(index);
                            }}
                          >
                            {playingIdx === index ? (
                              <Pause className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <Play className="w-4 h-4 text-muted-foreground" />
                            )}
                          </Button>
                          <audio
                            ref={(el) => (audioRefs.current[index] = el)}
                            style={{ display: "none" }}
                          >
                            <source
                              src={voice.preview_audio_url}
                              type="audio/mpeg"
                            />
                          </audio>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <label className="block text-sm font-medium">Avatar</label>
            {form.gender ? (
              <Select onValueChange={(v) => setForm({ ...form, avatar: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose avatar" />
                </SelectTrigger>
                <SelectContent>
                  {avatars[form.gender]?.map((av, index) => (
                    <SelectItem key={index} value={av.img}>
                      <span className="inline-flex items-center gap-2">
                        <img
                          src={av.img}
                          alt={`Avatar ${index + 1}`}
                          className="w-6 h-6 rounded-full"
                        />
                        Avatar {index + 1}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-gray-500">
                Select gender to choose avatar
              </p>
            )}
            <br />
            {roles.map((role, index) => (
              <label key={index}>
                <div className="flex">
                  <div className="flex ">
                    <input
                      type="radio"
                      name="receptionist"
                      value={role.title}
                      checked={selectedRole === role.title}
                      onChange={() => {
                        setSelectedRole(role.title);
                      }}
                    />
                    {/* <span className={styles.customRadio}></span> */}
                  </div>{" "}
                  &nbsp; &nbsp;
                  <div>
                    <p>{role.title}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="flex justify-between pt-4">
          {step > 1 && (
            <Button variant="outline" color="purple" onClick={handlePrevious}>
              Previous
            </Button>
          )}
          {step < 4 && (
            <Button
              color="purple"
              className="bg-purple-600"
              onClick={handleNext}
            >
              Next
            </Button>
          )}
          {step === 4 && (
            <Button className="bg-purple-600 text-white" onClick={handleSubmit}>
              Submit
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AddAgentModal;
