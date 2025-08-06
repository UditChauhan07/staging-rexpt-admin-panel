"use client"

import { useState, useEffect, useRef } from "react"
import Modal from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, Play, Pause } from "lucide-react"
import { languages } from "./languageOptions"

import { createAgent, getRetellVoices, updateAgent, validateWebsite } from "@/Services/auth"
import axios from "axios"
import { getAgentPrompt } from "@/lib/getAgentPrompt"
import { getKnowledgeBaseName } from "@/lib/getKnowledgeBaseName"
import Swal from "sweetalert2"
import { FadeLoader } from "react-spinners";

interface User {
  id: string
  name: string
  email: string
}
declare global {
  interface Window {
    google: any;
  }
}

interface EditAgentModalProps {
  isOpen: boolean
  onClose: () => void
  UserData: User[]
  agentId?: string;

  userId?: string;
  businessId?: string;
  onSubmit: (data: any) => void
}

interface BusinessType {
  type: string
  subtype: string
  icon: string
}

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
  }
];
const avatars = {
  Male: [
    { img: '/images/Male-01.png' },
    { img: '/images/Male-02.png' },
    { img: '/images/Male-03.png' },
    { img: '/images/Male-04.png' },
    { img: '/images/Male-05.png' },
  ],
  Female: [
    { img: '/images/Female-01.png' },
    { img: '/images/Female-02.png' },
    { img: '/images/Female-03.png' },
    { img: '/images/Female-04.png' },
    { img: '/images/Female-05.png' },
    { img: '/images/Female-06.png' },
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
      "Other"
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
      "Other"
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
      "Other"
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
      "Other"
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
      "Other"
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
      "Other"
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
      "Other"
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
      "Other"
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
      "Other"
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
      "Other"
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
      "Other"
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
      "Other"
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
      "Other"
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
      "Other"
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
      "Other"
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
      "Other"
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
      "Other"
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
      "Other"
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
      "Other"
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
      "Other"
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
      "Other"
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
      "Other"
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
      "Other"
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
      "Other"
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
      "Other"
    ],
  }
  ,
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
      "Other"
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
      "Other"
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
      "Other"
    ],
  }
  ,
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
      "Other"
    ],
  }
  ,
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
      "Other"
    ],
  }
  ,
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
      "Other"
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
      "Other"
    ],
  }



]
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
const EditAgentModal = ({ isOpen, onClose, allUsers, agentId, userId,
  businessId, onSubmit }: EditAgentModalProps) => {
  const [step, setStep] = useState(2)
  const [agentData, setAgentData] = useState(null);
  const [businessData, setBusinessData] = useState(null);
  const [userSearch, setUserSearch] = useState("")
  const [businessSearch, setBusinessSearch] = useState("")
  const [Agentdetial, setagentdetail] = useState("")
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>(allBusinessTypes)
  const [allServices, setAllServices] = useState<{ [key: string]: string[] }>({})
  const [selectedType, setSelectedType] = useState("")
  console.log(selectedType, "selectedtype")
  const [newBusinessType, setNewBusinessType] = useState("")
  const [newService, setNewService] = useState("")
  const [useWebsite, setUseWebsite] = useState(false)
  const [listVoices, setListVoices] = useState([]);
  const [form, setForm] = useState<any>({})
  const [retellVoices, setRetellVoices] = useState<{ name: string; language: string }[]>([])
  const [loadingVoices, setLoadingVoices] = useState(false)
  const [voiceError, setVoiceError] = useState("")
  const [filteredVoices, setFilteredVoices] = useState([]);
  const audioRefs = useRef([]);
  const [playingIdx, setPlayingIdx] = useState(null);

  const [businessSize, setBusinessSize] = useState();
  const [agentNote, setAgentNote] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isWebsiteValid, setIsWebsiteValid] = useState(null); // true, false, or null
  const [hasNoGoogleOrWebsite, setHasNoGoogleOrWebsite] = useState(false);

  const [loading, setLoading] = useState(false)
  console.log("userId", userId)
  localStorage.setItem("AgentForUserId",userId)
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

  const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";



  const fetchMergedAgentData = async () => {
    if (!agentId || !businessId) return;

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/agent/getUserAgentMergedDataForAgentUpdate/${agentId}`,
        {
          params: { businessId }
        }
      );
      const { agent, business } = res.data.data;
      console.log(res.data.data)
localStorage.setItem("agentCode", res.data.data.agent.agentCode)
      setAgentData(agent);
      setBusinessData(business);
      // set default form values here
    } catch (error) {
      console.error("Error fetching agent data", error);
    }
  };
  useEffect(() => {
    fetchMergedAgentData();
  }, [agentId, businessId]);
useEffect(() => {
  if (agentData && businessData) {
    // Safely parse customServices
    let parsedCustomServices = [];
    try {
      parsedCustomServices = businessData.customServices
        ? JSON.parse(businessData.customServices)
        : [];
      if (!Array.isArray(parsedCustomServices)) {
        parsedCustomServices = [];
      }
    } catch (error) {
      console.error("Error parsing customServices:", error);
      parsedCustomServices = [];
    }

    const flatCustomServiceList = parsedCustomServices.map((s) => s.service) || [];

    // Find matched business type
    const businessTypeRaw = businessData.businessType || "";
    const matchedType = allBusinessTypes.find(
      (b) => b.type.toLowerCase() === businessTypeRaw.toLowerCase()
    );

    // Set custom business if it's not in default list
    if (!matchedType && businessTypeRaw) {
      const newCustom = {
        type: businessTypeRaw,
        subtype: "Custom",
        icon: "svg/Web-Design-Agency-icon.svg",
      };

      setBusinessTypes((prev) => [...prev, newCustom]);
      setAllServices((prev) => ({
        ...prev,
        [businessTypeRaw]: flatCustomServiceList,
      }));
      setSelectedType(businessTypeRaw);
    } else if (matchedType) {
      setSelectedType(matchedType.type);
    }

    // Fix avatar path
    const fixAvatarPath = (avatar) => {
      if (!avatar) return "";
      return avatar.startsWith("/") ? avatar : `/${avatar}`;
    };

    const capitalize = (str) =>
      str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

    // Set form state
    setForm((prev) => ({
      ...prev,
      CallRecording: ["1", 1, true, "true"].includes(agentData?.CallRecording),
      userId: agentData.userId,
      agentName: agentData.agentName,
      language: agentData.agentLanguageCode || agentData.agentLanguage,
      avatar: fixAvatarPath(agentData.avatar),
      gender: capitalize(agentData.agentGender),
      voice: agentData.agentVoice,
      selectedVoice: { voice_accent: agentData.agentAccent },
      businessName: businessData.businessName,
      businessUrl: businessData.webUrl,
      email: businessData.buisnessEmail,
      about: businessData.aboutBusiness || "",
      address: `${businessData.address1 || ""}, ${businessData.city || ""}, ${businessData.state || ""}`,
      phone: agentData?.phone || "",
      businessType: businessTypeRaw,
      services: flatCustomServiceList,
      customServices: flatCustomServiceList,
      customBuisness: !matchedType ? businessTypeRaw : "",
      googleBusiness: businessData.googleBusinessName || "",
    }));

    setBusinessSize(businessData.businessSize || "");
    setSelectedRole(agentData.agentRole);
  }
}, [agentData, businessData, allBusinessTypes]);

useEffect(() => {
  if (businessData) {
    // Safely parse buisnessService
    let parsedServices = [];
    try {
      parsedServices = businessData.buisnessService
        ? JSON.parse(businessData.buisnessService)
        : [];
      if (!Array.isArray(parsedServices)) {
        parsedServices = [];
      }
    } catch (error) {
      console.error("Error parsing buisnessService:", error);
      parsedServices = [];
    }

    setForm((prev) => ({
      ...prev,
      services: parsedServices,
      customServices: [], // Populate if needed
    }));
  }

  const serviceMap = {};
  businessServices.forEach((b) => {
    serviceMap[b.type] = b.services;
  });
  setAllServices(serviceMap);
}, [businessData]);


  const fetchKnowledgeBaseName = async () => {
    const name = await getKnowledgeBaseName();
    console.log("Knowledge base name:", name);
    localStorage.setItem("knowledgebaseName", name)

  };

  useEffect(() => {
    fetchKnowledgeBaseName();
  }, [businessId]);

  const handleBusinessSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSize = e.target.value;
    setForm(prev => ({ ...prev, businessSize: selectedSize }));

  };
  const handleWebsiteBlur = async () => {
    const url = form.businessUrl;
    if (!url) return;

    setIsVerifying(true);
    try {
      const result = await validateWebsite(url); // Make sure to import this
      setIsWebsiteValid(result.valid);
    } catch (err) {
      console.error("Website verification error:", err);
      setIsWebsiteValid(false);
    } finally {
      setIsVerifying(false);
    }
  };




  //   useEffect(() => {
  //     const serviceMap: { [key: string]: string[] } = {}
  //     businessServices.forEach((b) => {
  //       serviceMap[b.type] = b.services
  //     })
  //     setAllServices(serviceMap)
  //   }, [])
  useEffect(() => {
    if (step === 4) {
      const fetchVoices = async () => {
        setLoadingVoices(true)
        setVoiceError("")
        try {
          const data = await getRetellVoices()

          setRetellVoices(data)
        } catch (err) {
          setVoiceError("Failed to load voices")
          console.error("Error fetching voices:", err)
        } finally {
          setLoadingVoices(false)
        }
      }

      fetchVoices()
    }
  }, [step])

  useEffect(() => {
    if (!isOpen) {
      setStep(2)
      setForm({})
      setSelectedType("")
      setUserSearch("")
      setBusinessSearch("")
    }
  }, [isOpen])



  const handleNext = async () => {
    // if (step === 1 && !form.userId) return Swal.fire("Select a user")
    if (step === 2 && !form.businessType) return Swal.fire("Select at least one business type")
    if (step === 3 && !form.businessName && !form.businessUrl) return Swal.fire("Please fill one of the fields")
    if (step === 4 && !form.language) return Swal.fire("Language  is required")



    setStep((prev) => prev + 1)
  }
  const knowledgebaseName = localStorage.getItem("knowledgebaseName")
  const handlePrevious = () => setStep(step - 1)
  const businessType = localStorage.getItem("businessType")
  const handleSubmit = async () => {
    setLoading(true)
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
        CallRecording
      } = form;
      



      console.log("forrrmmm", form)
      // return 
      const plan= agentData.agentPlan;
const languageAccToPlan = ["Scaler", "Growth", "Corporate"].includes(plan)
      ? "multi"
      : form.agentLanguage;

      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const currentTime = new Date().toLocaleString("en-US", { timeZone });
      const aboutBusinessForm =
        localStorage.getItem("businessonline") || form.about || "";

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
        timeZone,
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

      const promptVariablesList = extractPromptVariables(filledPrompt2, {
        industryKey: businessType === "Other" ? customBuisness : businessType,
        roleTitle: sessionStorage.getItem("agentRole"),
        agentName: { key: "AGENT NAME", value: form?.agentName || "" },
        agentGender: { key: "AGENT GENDER", value: gender || "" },
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
        currentTime: {
          key: "current_time_[timezone]",
          value: currentTime || ""
        },
        agentNote: {
          key: "AGENTNOTE",
          value: form.agentNote || ""
        }
      });



      console.log("generatePrompt", filledPrompt2);
      console.log(promptVariablesList,"dddddddd")
console.log(form.agentName,"formagentname1")
      const agentConfig = {
        version: 0,
        model: "gemini-2.0-flash-lite",
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

          // 🌟 State: Call Transfer
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
        },
        states: [
          {
            name: "information_collection",
            state_prompt: "## Task\nGreet the user and ask how you can help.",
            script: `
        if (wait_for_user_input) {
          speak("How can I assist you today?");
          wait_for_user_input();
        }
      `,
            edges: [],
          },
        ],
      };
      const knowledgeBaseId = localStorage.getItem("knowledgeBaseId");

      agentConfig.knowledge_base_ids = [knowledgeBaseId];



      const llmRes = await axios.patch(`https://api.retellai.com/update-retell-llm/${agentData.llmId}`, agentConfig, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_RETELL_API}`,
          "Content-Type": "application/json",
        },
      });
console.log(form.agentName,"formagentname2")
      const llmId = agentData.llmId;
      console.log("LLM ID", llmId);

      // ✅ RETELL AGENT CREATION (Use knowledgebaseName here)age
      const finalAgentData = {
        response_engine: { type: "retell-llm", llm_id: llmId },
        voice_id: voice,
        // language,
        agent_name: form.agentName || "Virtual Assistant",
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
            type: "string",
            name: "Detailed Call Summary",
            description: "Summary of the customer call",
          },
          {
            type: "enum",
            name: "lead_type",
            description: "Customer feedback",
            choices: ["positive", "neutral", "negative"],
          },
        ],
      };
      console.log("finalagentdata",finalAgentData)
      const agentRes = await axios.patch(`https://api.retellai.com/update-agent/${agentData.agent_id}`, finalAgentData, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_RETELL_API}`,
        },
      });

      const agentId = agentData?.agent_id;
      // const userId=localStorage.getItem("AgentForuserId")
      const agentCode = localStorage.getItem("agentCode")
      // ✅ SAVE TO DB (Use knowledgebaseName as agentName)
      // const agentId = agentRes.data.agent_id;
console.log(form.agentName,"formagentname3")
      const updatedData = {

        agent_id: agentId,
        llmId,
        avatar,
        agentVoice: voice,
        knowledgeBaseId: localStorage.getItem("knowledgeBaseId"),
        agentAccent: form.selectedVoice?.voice_accent || "American",
        agentRole: selectedRole,
        agentName: form.agentName || "Virtual Assistant",
        agentLanguageCode: languages.find((l) => l.name === languageAccToPlan)?.locale || "multi",
        agentLanguage: agentLanguage,
        dynamicPromptTemplate: filledPrompt,
        rawPromptTemplate: filledPrompt2,
        promptVariablesList: JSON.stringify(promptVariablesList),
        agentGender: gender,
        phone:[`${form?.phone}`],
        agentPlan: agentData.agentPlan,
        agentStatus: true,
        businessId: businessId,
        additionalNote: "",
        CallRecording:form.CallRecording
      };
console.log(form.agentName,"formagentname4")
console.log("updateddat",updatedData)

      const saveRes = await updateAgent(agentData.agent_id, updatedData);
      if (saveRes.status === 200 || saveRes.status === 201) {

        Swal.fire("Agent Updated successfully!");
        fetchMergedAgentData()
        localStorage.removeItem("businessType");
        localStorage.removeItem("agentCode");

        onClose();
        setLoading(false)

      } else {
        throw new Error("Agent creation failed.");
        setLoading(false)
      }
    } catch (err) {
      console.error("Error:", err);
      setLoading(false)
      alert("Agent creation failed. Please check console for details.");
    }
  };


  useEffect(() => {
    const interval = setInterval(() => {
      if (window.google?.maps?.places && document.getElementById("google-autocomplete")) {
        const autocomplete = new window.google.maps.places.Autocomplete(
          document.getElementById("google-autocomplete") as HTMLInputElement,
          { types: ["establishment"], fields: ["place_id", "name", "url", "formatted_address", "formatted_phone_number"] }
        )

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace()
          setForm({
            ...form,

            businessName: place.name,
            address: place.formatted_address,
            phone: place.formatted_phone_number,
          })
        })

        clearInterval(interval)
      }
    }, 300)
  }, [form])
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
  if (loading) {
    console.log("reachedHere");
    return (
      <div
        style={{
          position: "fixed", // ✅ overlay entire screen
          top: 0,
          left: 0,
          height: "100vh",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(255, 255, 255, 0.5)", // ✅ 50% white transparent
          zIndex: 9999, // ✅ ensure it's on top
        }}
      >
        <FadeLoader size={90} color="#6524EB" speedMultiplier={2} />
      </div>
    );
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Updating Agent" width="max-w-xl">
      <div className="space-y-4">


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
                  <SelectValue placeholder={selectedType}>{selectedType}</SelectValue>

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
                      `${b.type} ${b.subtype}`.toLowerCase().includes(businessSearch.toLowerCase())
                    )
                    .map((b) => (
                      <SelectItem key={b.type} value={b.type}>
                        {b.type} - {b.subtype}
                      </SelectItem>
                    ))}

                  {!businessTypes.some((b) => b.type.toLowerCase() === "other") && (
                    <SelectItem value="Other">Other</SelectItem>
                  )}
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
                      !businessTypes.some((b) => b.type.toLowerCase() === trimmed.toLowerCase())
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
              <label className="block text-sm font-medium mb-1">Business Size</label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={businessSize}
                onChange={(e) => setBusinessSize(e.target.value)}
              >
                <option value="" disabled>Select Business Size</option>
                <option value="1 to 10 employees">1 to 10 employees</option>
                <option value="10 to 50 employees">10 to 50 employees</option>
                <option value="50 to 100 employees">50 to 100 employees</option>
                <option value="100 to 250 employees">100 to 250 employees</option>
                <option value="250 to 500 employees">250 to 500 employees</option>
                <option value="500 to 1000 employees">500 to 1000 employees</option>
                <option value="1000+ employees">1000+ employees</option>
              </select>
            </div>

            {/* SERVICES */}
            {/* SERVICES */}
            <div>
              <label className="block text-sm font-medium">Select Services</label>

              {(allServices[selectedType] || [])?.map((service) => (
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
                      if (trimmed && !(allServices[selectedType] || []).includes(trimmed)) {
                        const updatedServices = [...(allServices[selectedType] || []), trimmed];
                        setAllServices((prev) => ({
                          ...prev,
                          [selectedType]: updatedServices,
                        }));

                        const updatedFormServices = [...(form.services || []), trimmed];
                        setForm((prev) => ({
                          ...prev,
                          services: updatedFormServices,
                          customServices: Array.from(new Set([...(prev.customServices || []), trimmed])), // prevent duplicates
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
                          customServices: [...(prev.customServices || []), trimmed],
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
                    customBuisness: selectedType === "Other" ? newBusinessType || "Business" : "",
                    buisnessService: form.services || [],
                    customServices: form.customServices || [],
                    buisnessEmail: form.email || "",
                  };

                  try {
                    // setLoading(true)
                    const res = await axios.patch(
                      `${process.env.NEXT_PUBLIC_API_URL}/api/businessDetails/updateBusinessDetailsByUserIDandBuisnessID/${userId}?businessId=${businessId}`, {
                      businessType: form.businessType || "Other",
                      businessName: form.businessName || "",
                      businessSize: businessSize || "",
                      customBuisness: selectedType === "Other" ? newBusinessType || "Business" : "",
                      buisnessService: form.services || [],
                      customServices: form.customServices || [],
                      buisnessEmail: form.email || "",
                    }
                    );
                    // console.log(res,"Step 2 business details submitted successfully");

                    // localStorage.setItem("BusinessId",res.data.record.businessId)/
                    
                    setStep((prev) => prev + 1);
                    // setLoading(false)

                  } catch (error) {
                    console.error("Error submitting business details:", error);
                    // setLoading(false)
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
              placeholder="Search business via Google"
              className="w-full"
              value={form.googleBusiness || ""}
              onChange={(e) => {
                setForm({ ...form, googleBusiness: e.target.value });
                setHasNoGoogleOrWebsite(false);
              }}
            />

            <div className="relative w-full">
              <Input
                placeholder="Website URL"
                value={form.businessUrl || ""}
                onChange={(e) => {
                  setForm({ ...form, businessUrl: e.target.value });
                  setIsWebsiteValid(null);
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
                const manuallyFilled =
                  form.businessName && form.address && form.phone ;

                if (!hasNoGoogleOrWebsite && (!hasGoogle || !hasWebsite)) {
                  alert("Please enter both Google Business and Website URL, or check the 'I don't have...' option.");
                  return;
                }

                if (hasNoGoogleOrWebsite && !manuallyFilled) {
                  alert("Please fill out the manual form.");
                  return;
                }

                const urls: string[] = [];
                if (hasWebsite) urls.push(hasWebsite);
                if (hasGoogle) {
                  const query = encodeURIComponent(form.googleBusiness);
                  urls.push(`https://www.google.com/search?q=${query}`);
                }

                const textContent = [
                  {
                    title: "Business Details",
                    text: `Name: ${form.businessName || "N/A"}
Address: ${form.address || "N/A"}
Phone: ${form.phone || "N/A"}
Website: ${form.businessUrl || "N/A"}
Email: ${form.email || "N/A"}
About: ${form.about || "N/A"}
Google: ${form.googleBusiness || "N/A"}`
                  },
                ];

                const knowledgeBaseName = localStorage.getItem("knowledgebaseName") || "My Business KB";


                try {
                  // Step 1: Delete existing knowledge base
                  let shouldCreate = false;
                  try {
                    const del = await axios.delete(
                      `https://api.retellai.com/delete-knowledge-base/${agentData.knowledgeBaseId}`,
                      {
                        headers: {
                          Authorization: `Bearer ${process.env.NEXT_PUBLIC_RETELL_API}`,
                        },
                      }
                    );

                    if (del?.data?.status === true || del?.data?.message?.toLowerCase()?.includes("not found")) {
                      shouldCreate = true;
                    } 
                    // else {
                    //   alert("Failed to delete existing knowledge base.");
                    //   return;
                    // }
                  } catch (delErr) {
                    // In case delete fails with 404 or other "not found" message
                    const msg = delErr?.response?.data?.message || "";
                    if (msg.toLowerCase().includes("not found")) {
                      shouldCreate = true;
                    } else {
                      console.error("Delete error:", delErr);
                      alert("Error deleting previous knowledge base.");
                      return;
                    }
                  }

                  // Step 2: Create new knowledge base
                  if (shouldCreate) {
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
                    // console.log
                    if (knowledgeBaseId) {
                      localStorage.setItem("knowledgeBaseId", knowledgeBaseId);

                      // Step 3: PATCH to backend
                      await axios.patch(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/businessDetails/updateKnowledeBase/${businessId}`,
                        {
                          knowledge_base_texts: {
                            businessName: form.businessName || "",
                            address: form.address || "",
                            phone: form.phone || "",
                            website: form.businessUrl || "",
                            rating: "",
                            totalRatings: "",
                            hours: "",
                            businessStatus: "",
                            categories: "",
                            email: form.email || "",
                            aboutBussiness: form.about || "",
                          },
                          googleUrl: form.googleBusiness || "",
                          webUrl: form.businessUrl || "",
                          aboutBusiness: form.about || "",
                          additionalInstruction: "",
                          agentId: localStorage.getItem("agent_id") || null,
                          googleBusinessName: form.businessName || "",
                          address1: form.address || "",
                          buisnessEmail: form.email || "",
                          businessName: form.businessName || "",
                        
                          isGoogleListing: !hasNoGoogleOrWebsite,
                          isWebsiteUrl: !!hasWebsite,
                          knowledge_base_id: knowledgeBaseId,
                          knowledge_base_name: knowledgeBaseName,
                        },
                        {
                          headers: {
                            Authorization: `Bearer ${process.env.NEXT_PUBLIC_RETELL_API}`,
                            "Content-Type": "application/json",
                          },
                        }
                      );
                      setStep((prev) => prev + 1);
                    }
                  }
                } catch (err) {
                  console.error("Failed to create or update knowledge base:", err);
                  alert("Error creating knowledge base. Try again later.");
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
            {/* Language */}
            <label className="block text-sm font-medium">Select Language</label>
            <Select
              value={form.language}
              
            onValueChange={(locale) => {
  const selectedLang = languages.find(lang => lang.locale === locale);
  setForm({
    ...form,
    agentLanguage: selectedLang?.name || "",
    language: locale
  });
}}

            >
              <SelectTrigger>
                <SelectValue placeholder="Select language">
                  {languages.find((l) => l.locale === form.language)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.locale} value={lang.locale}>
                    <span className="inline-flex items-center gap-2">
                      <img
                        src={
                          lang.locale
                            ? `https://flagcdn.com/w20/${lang.locale
                              .split("-")[1]
                              ?.toLowerCase() || "us"}.png`
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

            {/* Gender */}
            <label className="block text-sm font-medium">Gender</label>
            <Select
              value={form.gender}
              onValueChange={(v) =>
                setForm((prev) => ({
                  ...prev,
                  gender: v,
                  avatar: "", // reset avatar when gender changes
                }))
              }
            >
              <SelectTrigger>
                <SelectValue>{form.gender || "Select gender"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>


            {/* Voice */}
            <div>
              <label className="block text-sm font-medium mb-1">Voice</label>
              {filteredVoices.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No voices found for gender: {form.gender}
                </p>
              ) : (
                <Select
                  value={form.voice}
                  onValueChange={(v) => {
                    const selectedVoice = filteredVoices.find(
                      (voice) => voice.voice_id === v
                    );
                    setForm({
                      ...form,
                      voice: v,
                      selectedVoice,
                      // agentName: v.voice_name,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {
                        filteredVoices.find((v) => v.voice_id === form.voice)
                          ?.voice_name || "Select voice"
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    {filteredVoices.map((voice, index) => (
                      <SelectItem key={index} value={voice.voice_id} className="py-2">
                        <div className="flex items-center justify-between gap-2">
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
                          <div className="w-6 zIndex-999">
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
                          </div>
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

            {/* Avatar */}
            <label className="block text-sm font-medium mt-4">Avatar</label>
            {form.gender ? (
              <Select
                value={form.avatar || ""}
                onValueChange={(v) => setForm({ ...form, avatar: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose avatar">
                    {/* Show selected avatar with index */}
                    {(() => {
                      const currentList = avatars[form.gender] || [];
                      const selectedIndex = currentList.findIndex((a) => a.img === form.avatar);
                      const selectedAvatar = currentList[selectedIndex];
                      return selectedAvatar ? (
                        <span className="inline-flex items-center gap-2">
                          <img
                            src={selectedAvatar.img}
                            alt={`Avatar ${selectedIndex + 1}`}
                            className="w-6 h-6 rounded-full"
                          />
                          Avatar {selectedIndex + 1}
                        </span>
                      ) : null;
                    })()}
                  </SelectValue>
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
              <p className="text-sm text-gray-500">Select gender to choose avatar</p>
            )}


            <br />
            {roles.map((role, index) => (
              <label
                key={index}


              >
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
                  </div> &nbsp; &nbsp;
                  <div >
                    <p >{role.title}</p>

                  </div>

                </div>

              </label>

            ))}
            <div className="flex items-center justify-between mt-4">
  <label className="block text-sm font-medium">Call Recording</label>
  <button
    type="button"
    onClick={() =>
      setForm((prev) => ({
        ...prev,
        CallRecording: !prev.CallRecording,
      }))
    }
    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ${
      form.CallRecording ? "bg-purple-600" : "bg-gray-300"
    }`}
  >
    <span
      className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
        form.CallRecording ? "translate-x-6" : "translate-x-1"
      }`}
    /> 
  </button>
</div>
          </div>
        )}



        <div className="flex justify-between pt-4">
          {step > 2 && <Button variant="outline" color="purple" onClick={handlePrevious}>Previous</Button>}
          {step < 4 && <Button color="purple" className="bg-purple-600" onClick={handleNext}>Next</Button>}
          {step === 4 && <Button className="bg-purple-600 text-white" onClick={handleSubmit}>Submit</Button>}
        </div>
      </div>
    </Modal>
  )
}

export default EditAgentModal
