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
import { getKnowledgeBaseName } from "@/lib/getKnowledgeBaseName";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";


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
  internationalPhoneNumber?: string;
  website: string;
  googleBusiness: string;
  about: string;
  addressComponents: any[];
  workingHours?: any;
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
  editingBusiness?: Business | null;
  fetchBusinesses: () => void;
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
    type: "Salon",
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
    type: "Dry Cleaners",
    subtype: "Garment Cleaning & Care",
    icon: "svg/Dry Cleaner.svg",
  },
  {
    type: "Cleaning and Janitorial Services",
    subtype: "Professional Cleaning Solutions",
    icon: "svg/Cleaning Janitorial Service.svg",
  },
  {
    type: "Tour Guides",
    subtype: "Local Experience Experts",
    icon: "svg/Tour-Guides.svg",
  },
  {
    type: "Deli Shop",
    subtype: "Fresh Meats & Gourmet Foods",
    icon: "svg/Deli shop.svg"
  },
  {
    type: "Marketing Agency",
    subtype: "Your Journey Begins Here",
    icon: "svg/Marketing Agency.svg",
  },
  {
    type: "Digital Marketing Agency",
    subtype: "Grow Your Brand Online",
    icon: "svg/Digital-marketing-Agency.svg",
  },
  {
    type: "Car Repair & Garage",
    subtype: "Quality Repairs, Every Time",
    icon: "svg/Car Repair & Garage.svg",
  },
  {
    type: "Boat Repair",
    subtype: "Marine Care & Repair Experts",
    icon: "svg/Boat Repair & Maintenance.svg"

  },
  {
    type: "Car & Bus Services",
    subtype: "Quality Repairs, Every Time",
    icon: "svg/Car & Bus Services.svg",

  },
  {
    type: "Taxi, Cab & Limo Booking",
    subtype: "Reliable Rides, Anytime, Anywhere",
    icon: "svg/Taxi.svg",

  },
  {
    type: "Movers and Packers",
    subtype: "Safe & Hassle-Free Relocation Services",
    icon: "svg/Movers and Packers.svg",

  },
  {
    type: "Trucking Company",
    subtype: "Efficient Freight & Logistics Solutions",
    icon: "svg/Trucking Company.svg",
  },
  {
    type: "Spa & Wellness Center",
    subtype: "Relaxation & Health Services",
    icon: "svg/Hair Stylist.svg",
  },
  {
    type: "Print Shop",
    subtype: "Your Printing Solutions Partner",
    icon: "svg/Hair Stylist.svg",
  },
  {
    type: "School",
    subtype: "Education for a Brighter Future",
    icon: "svg/Hair Stylist.svg",
  },
  {
    type: "Colleges & Universities",
    subtype: "Higher Learning Institution",
    icon: "svg/Hair Stylist.svg",
  },
  {
    type: "Training Center",
    subtype: "Skill Development Hub",
    icon: "svg/Hair Stylist.svg",
  },
  {
    type: "Educational Institute",
    subtype: "Knowledge Empowerment Center",
    icon: "svg/Hair Stylist.svg",
  }

  ,

  {
    type: "Other",
    subtype: "More Ideas, More Impact",
    icon: "svg/Web-Design-Agency-icon.svg",
  }
];

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
    type: "Salon",
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
    type: "Digital Marketing Agency",
    subtype: "Business Promotion Strategies",
    icon: "svg/Digital-marketing-Agency.svg",
    services: [
      "Search Engine Optimization (SEO)",
      "Pay-Per-Click (PPC) Advertising",
      "Social Media Marketing",
      "Content Marketing",
      "Email Marketing",
      "Influencer Marketing",
      "Video Marketing",
      "Conversion Rate Optimization (CRO)",
      "Web Design & Development",
      "Branding & Strategy",
      "Analytics & Reporting",
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
    type: "Cleaning and Janitorial Services",
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
  {
    type: "Tour Guides",
    subtype: "Travel Experience Curator",
    icon: "svg/Tour-Guides.svg",
    services: [
      "Guided City Tours",
      "Historical Site Tours",
      "Adventure and Nature Tours",
      "Cultural & Art Tours",
      "Food & Culinary Tours",
      "Wildlife & Eco Tours",
      "Photography Tours",
      "Private Custom Tours",
      "Other",
    ],
  },
  {
    type: "Deli Shop",
    subtype: "Fresh Meats & Gourmet Foods",
    icon: "svg/Deli Shop.svg",
    services: [
      "Fresh Cut Meats",
      "Artisanal Cheeses",
      "Gourmet Sandwiches",
      "Prepared Salads & Sides",
      "Imported & Local Delicacies",
      "Cured Meats & Cold Cuts",
      "Ready-to-Eat Meals",
      "Bakery Items",
      "Specialty Beverages",
      "Custom Deli Platters",
      "Other",
    ],
  },
  {
    type: "Dry Cleaners",
    subtype: "Garment Cleaning & Care",
    icon: "svg/Dry Cleaner.svg",
    services: [
      "Regular Garment Dry Cleaning",
      "Suit & Blazer Cleaning",
      "Wedding Dress Cleaning",
      "Delicate Fabric Care (Silk, Wool, etc.)",
      "Stain Removal Services",
      "Curtains & Drapes Cleaning",
      "Carpet & Rug Cleaning",
      "Blankets & Quilts Cleaning",
      "Steam Ironing & Pressing",
      "Leather & Suede Cleaning",
      "Pickup & Delivery Service",
      "Express / Same-Day Cleaning",
      "Eco-Friendly Cleaning",
      "Other",
    ],
  },
  {
    type: "Car Repair & Garage",
    subtype: "Quality Repairs, Every Time",
    icon: "svg/Car Repair & Garage.svg",
    services: [
      "General Car Servicing",
      "Engine Diagnostics & Repair",
      "Brake Inspection & Repair",
      "Oil Change & Filter Replacement",
      "Battery Check & Replacement",
      "AC Repair & Gas Refill",
      "Suspension & Steering Repair",
      "Wheel Alignment & Balancing",
      "Tire Rotation & Replacement",
      "Clutch & Transmission Services",
      "Car Washing & Detailing",
      "Bodywork & Painting",
      "Accidental Repair Services",
      "Windshield & Glass Repair",
      "Pickup & Drop-off Service",
      "24/7 Emergency Roadside Assistance",
      "Pre-Purchase Car Inspection",
      "Insurance Claim Assistance",
      "Other",
    ],
  },
  {
    type: "Boat Repair",
    subtype: "Marine Care & Repair Experts",
    icon: "svg/Boat Repair & Maintenance.svg",
    services: [
      "Engine Diagnostics & Repairs",
      "Hull Cleaning & Polishing",
      "Fiberglass & Gelcoat Repair",
      "Electrical System Inspection",
      "Boat Painting & Detailing",
      "Propeller & Shaft Repair",
      "Bilge Pump Service",
      "Navigation System Maintenance",
      "Fuel System Inspection",
      "Winterizing & De-winterizing",
      "Trailer Repair & Maintenance",
      "Custom Modifications",
      "On-Site Repair Services",
      "Other",
    ],
  },
  {
    type: "Car & Bus Services",
    subtype: "Quality Repairs, Every Time",
    icon: "svg/Car Repair & Garage.svg",
    services: [
      "Engine Diagnostics & Repairs",
      "Brake Inspection & Replacement",
      "Oil Change & Filter Replacement",
      "Battery Check & Replacement",
      "Transmission Service & Repair",
      "Suspension & Steering Services",
      "AC & Heating System Repair",
      "Electrical System Troubleshooting",
      "Tire Rotation & Wheel Alignment",
      "Exhaust System Repair",
      "Fuel Injection Cleaning",
      "Coolant System Flush & Repair",
      "Bus Fleet Maintenance",
      "Roadside Assistance & Towing",
      "Preventive Maintenance Plans",
      "Other",
    ],
  },
  {
    type: "Taxi, Cab & Limo Booking",
    subtype: "Reliable Rides, Anytime, Anywhere",
    icon: "svg/Taxi.svg",
    services: [
      "Local Taxi Booking",
      "Outstation Cab Services",
      "Airport Pickup & Drop",
      "Corporate Cab Services",
      "Hourly Limo Rentals",
      "Luxury Car Chauffeur",
      "Event Transportation",
      "24/7 Cab Availability",
      "One-Way & Round Trips",
      "Shared Ride Services",
      "Other",
    ],
  },
  {
    type: "Movers and Packers",
    subtype: "Safe & Hassle-Free Relocation Services",
    icon: "svg/Movers and Packers.svg",
    services: [
      "Home Shifting",
      "Office Relocation",
      "Local & Domestic Moving",
      "Packing & Unpacking Services",
      "Loading & Unloading",
      "Furniture Dismantling & Assembly",
      "Vehicle Transportation",
      "Storage & Warehousing",
      "International Relocation",
      "Fragile Item Handling",
      "Other",
    ],
  },
  {
    type: "Trucking Company",
    subtype: "Efficient Freight & Logistics Solutions",
    icon: "svg/Trucking Company.svg",
    services: [
      "Long-Haul Trucking",
      "Local & Regional Deliveries",
      "Refrigerated Trucking",
      "Flatbed Trucking",
      "Heavy Equipment Transportation",
      "Interstate Cargo Transport",
      "Logistics & Freight Management",
      "24/7 Shipment Tracking",
      "Other",
    ],
  },
  {
    type: "Spa & Wellness Center",
    subtype: "Relaxation & Health Services",
    icon: "svg/Hair Stylist.svg",
    services: [
      "Swedish Massage",
      "Deep Tissue Massage",
      "Hot Stone Massage",
      "Aromatherapy Massage",
      "Couples Massage",
      "Classic/Custom Facial",
      "Deep-Cleansing (Acne) Facial",
      "Body Scrub / Exfoliation",
      "Detox or Hydrating Body Wrap",
      "Waxing (Face/Body)",
      "Other",
    ],
  },
  {
    type: "Print Shop",
    subtype: "Your Printing Solutions Partner",
    icon: "svg/Hair Stylist.svg",
    services: [
      "Business Cards",
      "Flyers & Brochures",
      "Posters & Banners",
      "Custom T-Shirts",
      "Photo Printing",
      "Booklets & Catalogs",
      "Invitations & Greeting Cards",
      "Stickers & Labels",
      "Large Format Printing",
      "Other",
    ],
  },
  {
    type: "School",
    subtype: "Education for a Brighter Future",
    icon: "svg/Hair Stylist.svg",
    services: [
      "Primary Education",
      "Secondary Education",
      "STEM Programs",
      "Arts & Humanities",
      "Sports & Extracurriculars",
      "Special Education",
      "Language Courses",
      "Online Learning",
      "After-School Programs",
      "Other",
    ],
  },
  {
    type: "Colleges & Universities",
    subtype: "Higher Learning Institution",
    icon: "svg/Hair Stylist.svg",
    services: [
      "Undergraduate Programs",
      "Graduate Programs",
      "Professional Degrees",
      "Online Courses",
      "Research Opportunities",
      "Internships & Co-ops",
      "Study Abroad Programs",
      "Student Support Services",
      "Extracurricular Activities",
      "Other",
    ],
  },
  {
    type: "Training Center",
    subtype: "Skill Development Hub",
    icon: "svg/Hair Stylist.svg",
    services: [
      "Technical Skills Training",
      "Soft Skills Development",
      "Certification Programs",
      "Workshops & Seminars",
      "Online Learning Modules",
      "Corporate Training Solutions",
      "Career Counseling",
      "Internship Placement",
      "Other",
    ],
  },
  {
    type: "Educational Institute",
    subtype: "Knowledge Empowerment Center",
    icon: "svg/Hair Stylist.svg",
    services: [
      "Academic Programs",
      "Vocational Training",
      "Research & Development",
      "Community Education",
      "Online Learning Platforms",
      "Student Support Services",
      "Extracurricular Activities",
      "Other",
    ],
  }
];

const BusinessDetailsStep: React.FC<BusinessDetailsStepProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
  editingBusiness,
  fetchBusinesses,
}) => {
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
      internationalPhoneNumber: "",
      website: "",
      googleBusiness: "",
      about: "",
      addressComponents: [],
      workingHours: null,
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
  const [hasNoGoogle, setHasNoGoogle] = useState(false);
  const [hasNoWebsite, setHasNoWebsite] = useState(false);
  const [sitemapUrls, setSitemapUrls] = useState<string[]>([]);
  const [showSitemap, setShowSitemap] = useState(false);
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
  const [addressComponents, setAddressComponents] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [googlelisting, setGoogleListing] = useState()
  const [loading, setLoading] = useState(false)
  
  const HTTPS_PREFIX = "https://";
  const PREFIX_LEN = HTTPS_PREFIX.length;
  useEffect(() => {
    const serviceMap: { [key: string]: string[] } = {};
    businessServices.forEach((b) => {
      serviceMap[b.type] = b.services;
    });
    setAllServices(serviceMap);
  }, []);
  const businessDetails = JSON.parse(localStorage.getItem("formData"))
  useEffect(() => {
    if (data.business || editingBusiness) {
      const business = businessDetails.business || editingBusiness;
      
      setFormData(business);
      setSelectedType(business.type);
      setAddressComponents(business.addressComponents || []);
      setHasNoGoogle(!business.googleBusiness);
      if (business.website) {
        handleWebsiteBlur();
      }
    }
  }, [data.business, editingBusiness]);

  const generateGoogleListingUrl = (place) => {
    const address = [
      place.address_components.find((c) => c.types.includes("street_number"))
        ?.long_name,
      place.address_components.find((c) => c.types.includes("route"))
        ?.long_name,
      place.address_components.find((c) => c.types.includes("premise"))
        ?.long_name,
      place.address_components.find((c) => c.types.includes("subpremise"))
        ?.long_name,
      place.address_components.find((c) =>
        c.types.includes("sublocality_level_1")
      )?.long_name,
      place.address_components.find((c) => c.types.includes("locality"))
        ?.long_name,
      place.address_components.find((c) =>
        c.types.includes("administrative_area_level_2")
      )?.long_name,
      place.address_components.find((c) =>
        c.types.includes("administrative_area_level_1")
      )?.long_name,
      place.address_components.find((c) =>
        c.types.includes("postal_code")
      )?.long_name
    ]
      .filter(Boolean)
      .join(" ");

    const googleLink = `https://www.google.com/search?q=${encodeURIComponent(
      place.name + " " + address
    )}`;
    setGoogleListing(googleLink);
  };

  useEffect(() => {
    if (!window.google?.maps?.places) return;

    const element = document.getElementById("google-autocomplete") as HTMLInputElement | null;
    if (!element) return;

    const businessAutocomplete = new window.google.maps.places.Autocomplete(element, {
      types: ["establishment"],
      fields: [
        "place_id",
        "name",
        "url",
        "formatted_address",
        "formatted_phone_number",
        "international_phone_number",
        "address_components",
        "website",
        "opening_hours",
      ],
    });

    const listener = businessAutocomplete.addListener("place_changed", () => {
      const place = businessAutocomplete.getPlace();

      generateGoogleListingUrl(place);
      if (!place.place_id) return;

      const newWebsite = place.website || "";
      setFormData((prev) => ({
        ...prev,
        googleBusiness: place.name || "",
        name: place.name || "",
        address: place.formatted_address || "",
        phone: place.formatted_phone_number || "",
        internationalPhoneNumber: place.international_phone_number || "",
        website: newWebsite,
        workingHours: place.opening_hours || null,
      }));

      setAddressComponents(place.address_components || []);
      setSelectedCountry(
        place.address_components?.find((c) => c.types.includes("country"))?.short_name || "US"
      );
      setHasNoGoogle(false);
      setErrors((prev) => ({ ...prev, googleBusiness: "", name: "", address: "", phone: "", email: "" }));

      if (newWebsite) {
        setTimeout(() => {
          verifyWebsite(newWebsite);
        }, 100);
      }
    });

    return () => {
      if (window.google.maps.event) {
        window.google.maps.event.removeListener(listener);
      }
    };
  }, []);

  useEffect(() => {
    if (!window.google?.maps?.places) return;

    const element = document.getElementById("google-address-autocomplete") as HTMLInputElement | null;
    if (!element) return;

    const addressAutocomplete = new window.google.maps.places.Autocomplete(element, {
      types: ["geocode"],
      fields: ["address_components", "formatted_address"],
    });

    const listener = addressAutocomplete.addListener("place_changed", () => {
      const place = addressAutocomplete.getPlace();
      setFormData((prev) => ({
        ...prev,
        address: place.formatted_address || "",
      }));
      setAddressComponents(place.address_components || []);
      setSelectedCountry(
        place.address_components?.find((c) => c.types.includes("country"))?.short_name || "US"
      );
      setErrors((prev) => ({ ...prev, address: "" }));
    });

    return () => {
      if (window.google.maps.event) {
        window.google.maps.event.removeListener(listener);
      }
    };
  }, []);

  const verifyWebsite = async (rawUrl?: string) => {
    const urlToVerify = rawUrl || (formData.website || "").trim();
    if (!urlToVerify) return;

    let url = urlToVerify.replace(/^https?:\/\//i, "");
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

  const handleWebsiteBlur = () => {
    verifyWebsite();
  };

  const filterCompanyPages = (urls: string[]) => {
    const companyKeywords = [
      "about",
      "our-story",
      "our-company",
      "who-we-are",
      "contact",
      "products",
      "services",
      "solutions",
      "what-we-do",
      "offerings",
      "blog",
      "news",
      "resources",
      "insights",
      "faq",
      "help",
      "pricing",
      "plans",
      "privacy",
      "terms-and-conditions",
      "terms-of-use",
      "case-studies",
      "projects",
      "portfolio",
      "testimonials",
      "reviews",
    ];
    return urls.filter((url) => companyKeywords.some((keyword) => url.toLowerCase().includes(keyword)));
  };

  const toggleOne = (url: string) => {
    setSelectedUrls((prev) => {
      const next = new Set(prev);
      next.has(url) ? next.delete(url) : next.add(url);
      localStorage.setItem(
        "selectedSitemapUrls",
        JSON.stringify([...next].map((url) => ({ url, checkedStatus: true })))
      );
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedUrls((prev) => {
      const next = prev.size === sitemapUrls.length ? new Set() : new Set(sitemapUrls);
      localStorage.setItem(
        "selectedSitemapUrls",
        JSON.stringify([...next].map((url) => ({ url, checkedStatus: true })))
      );
      return next;
    });
  };

  const validatePhoneNumber = (phone: string) => {
       try {
        const parsed = parsePhoneNumberFromString("+" + phone);
        console.log('dsds',parsed?.isValid(),parsed)
        return parsed?.isValid() || false;
      } catch (e) {
        return false;
      }
  };

  // const fetchKnowledgeBaseName = async () => {
  //   const name = await getKnowledgeBaseName();
  //   console.log("Knowledge base name:", name);
  //   localStorage.setItem("knowledgebaseName", name);
  // };

  // useEffect(() => {
  //   fetchKnowledgeBaseName();
  // }, [localStorage.getItem('BusinessId')]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.type) {
      newErrors.type = "Business type is required";
    }
    if (!formData.googleBusiness && !hasNoGoogle) {
      newErrors.googleBusiness = "Please enter Google Business ";
    }
    if (!hasNoWebsite && !formData.website) {
      newErrors.Website = "Please enter Website URL";
    }
    if (!formData.name) newErrors.name = "Business name is required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.internationalPhoneNumber) {
      newErrors.internationalPhoneNumber = "Please enter a valid phone number with country code";
    } 
    // if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    //   newErrors.email = "Valid email is required";
    // }
    if (formData.about && /[!@#$%^&*(),.?":{}|<>]/.test(formData.about)) {
      newErrors.about = "About Business cannot contain special characters or emojis";
    }
    const userId = localStorage.getItem("AgentForUserId") || "RX0ZYQ1757328630";
    if (!userId) {
      newErrors.userId = "User ID is required";
    }
    console.log(newErrors)
    
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSaveBusiness = async () => {
    if (!validate()) return;
    toggleAll();
    const userId = localStorage.getItem("AgentForUserId") || "";
    const sessionSelectedSiteMapUrls1 = JSON.parse(localStorage.getItem("selectedSitemapUrls"))

    // Extract address components
    const getAddressComponent = (type: string, field: "long_name" | "short_name") =>
      addressComponents.find((c) => c.types.includes(type))?.[field] || "";
    const payload = {
      userId,
      googleBusinessName: formData.googleBusiness || null,
      businessType: formData.type || "Other",
      businessName: formData.name || "",
      businessSize: formData.size || "",
      customBuisness: selectedType == "Other" ? newBusinessType || "Business" : "",
      buisnessService: formData.services || [],
      customServices: formData.customServices || [],
      buisnessEmail: formData.email || "",
      address1: formData.address || "",
      address2: "", // Optional, can be populated if needed
      city: getAddressComponent("locality", "long_name") || getAddressComponent("postal_town", "long_name") || "",
      state: getAddressComponent("administrative_area_level_1", "short_name") || "",
      country: getAddressComponent("country", "long_name") || "",
      postal_code: getAddressComponent("postal_code", "long_name") || "",
      street_number: getAddressComponent("street_number", "long_name") || "",
      zip: getAddressComponent("postal_code", "long_name") || "",
      isGoogleListing: !!formData.googleBusiness,
      isWebsiteUrl: !!formData.website,
      googleUrl: googlelisting || "",
      webUrl: formData.website,
      phoneNumber: formData.internationalPhoneNumber || formData.phone,
      aboutBusiness: formData.about,
      // googleBusinessName:,
      scrapedUrls: JSON.stringify(sessionSelectedSiteMapUrls1) || [],
    };

    const sessionSelectedSiteMapUrls = JSON.parse(localStorage.getItem("selectedSitemapUrls") || "[]").map(
      (item: { url: string }) => item.url
    );

    try {
      setLoading(true)
      let res;
      let businessId = localStorage.getItem('BusinessId') || '';

      if (!localStorage.getItem('BusinessId')) {
        // No BusinessId in localStorage → create new business
        res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/businessDetails/create`,
          payload,
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        businessId = res.data.record?.businessId || '';
        localStorage.setItem("agentCode", res.data.agentCode || "");
      }


      const mergedUrls = [];
      const selected = JSON.parse(
        localStorage.getItem("sitemapUrls") || "[]"
      );
      if (googlelisting) {
        mergedUrls.push(googlelisting);
      }
      if (Array.isArray(selected) && selected.length > 0) {
        mergedUrls.push(...selected);
      }

      localStorage.setItem("BusinessId", businessId);

      const knowledge_base_name = await getKnowledgeBaseName() || "My Business KB";
      localStorage.setItem("knowledgebaseName", knowledge_base_name)
      if (knowledge_base_name)
        if (true) {
          const formDataPayload = new FormData();
          formDataPayload.append("knowledge_base_name", knowledge_base_name);
          formDataPayload.append("knowledge_base_urls", JSON.stringify(mergedUrls));;
          formDataPayload.append("enable_auto_refresh", "true");
          formDataPayload.append(
            "knowledge_base_texts",
            JSON.stringify([
              {
                title: "Business Details",
                text: `Business Name: ${formData.name || ""}
                     Address: ${formData.address || ""}
                     Phone: ${formData.internationalPhoneNumber || formData.phone || ""}
                     Website: ${formData.website || "N/A"}
                     Email: ${formData.email || ""}
                     About Business: ${formData.about || ""}
                     Working Hours: ${formData.workingHours ? JSON.stringify(formData.workingHours) : "N/A"}`,
              },
            ])
          );

          const prevKb = localStorage.getItem("knowledgeBaseId");
          if (prevKb && prevKb !== "null" && prevKb !== "undefined") {
            try {
              await axios.delete(`https://api.retellai.com/delete-knowledge-base/${prevKb}`, {
                headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_RETELL_API}` },
              });
              console.log(`Knowledge base ${prevKb} deleted successfully.`);
            } catch (error) {
              console.error(`Failed to delete knowledge base ${prevKb}:`, error.response?.status || error.message);
              // Continue execution even if the delete fails (e.g., 404 not found)
            }
          }

          const kbRes = await axios.post("https://api.retellai.com/create-knowledge-base", formDataPayload, {
            headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_RETELL_API}`, "Content-Type": "multipart/form-data" },
          });

          const knowledgeBaseId = kbRes?.data?.knowledge_base_id;
          localStorage.setItem("knowledgeBaseId", knowledgeBaseId);
          const businessData1 = {
            businessName: formData.name || "N/A",
            address: formData.address || "N/A",
            phone: formData.internationalPhoneNumber || formData.phone || "N/A",
            website: formData.website || "N/A",
            email: formData.email || "N/A",
            aboutBussiness: formData.about || "N/A",
          };
          await axios.patch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/businessDetails/updateKnowledeBase/${businessId}`,
            {
              knowledge_base_id: knowledgeBaseId,
              knowledge_base_name: knowledge_base_name,
              knowledge_base_urls: JSON.stringify([...selectedUrls]),
              googleUrl: googlelisting || "",   //gmb link
              webUrl: formData.website,
              phoneNumber: formData.internationalPhoneNumber || formData.phone,
              aboutBusiness: formData.about,

              googleBusinessName: formData.googleBusiness,
              // googleBusinessName:,
              scrapedUrls: JSON.stringify(sessionSelectedSiteMapUrls1) || [],
              knowledge_base_texts: JSON.stringify(businessData1),
              agentId: localStorage.getItem("agent_id") || null,
            },
            {
              headers: { "Content-Type": "application/json" },
            }
          );
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
        internationalPhoneNumber: formData.internationalPhoneNumber,
        website: formData.website,
        googleBusiness: formData.googleBusiness,
        about: formData.about,
        addressComponents: addressComponents,
        workingHours: formData.workingHours,
      };

      onUpdate({ business: savedBusiness });
      localStorage.setItem('addressComponents', JSON.stringify(savedBusiness));
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
    } finally {
      setLoading(false)
    }
  };
  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSaveBusiness();
  };
  return (
    <StepWrapper step={2} totalSteps={7} title="Business Details" description="Provide details about the business.">
      <form onSubmit={handleNext} className="space-y-6">
        <div className={`space-y-4 ${loading ? "pointer-events-none opacity-50" : ""
          }`}>
          {/* <div className="space-y-2">
            <Label htmlFor="type">Business Type <span className="text-red-500">*</span></Label>
            <Select
              onValueChange={(val) => {
                if (val === "Other") {
                  setSelectedType("Other");
                  setFormData({ ...formData, type: "Other", subtype: "", icon: "", services: [], customServices: [] });
                  localStorage.setItem("businessType", "Other");
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
                    <SelectItem key={b.type} value={b.type}>
                      {b.type} - {b.subtype}
                    </SelectItem>
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
          </div> */}
          <div className="space-y-2">
            <Label htmlFor="type">Business Type <span className="text-red-500">*</span></Label>
            <Select
              onValueChange={(val) => {
                if (val === "Other") {
                  setSelectedType("Other");
                  setFormData((prev) => ({
                    ...prev,
                    type: "Other",
                    subtype: "Other",
                    icon: "",
                    services: [],
                    customServices: [],
                  }));
                  localStorage.setItem("businessType", "");
                  localStorage.setItem("businessServices", JSON.stringify([]));
                  localStorage.setItem("customServices", JSON.stringify([]));
                } else {
                  const selected = allBusinessTypes.find((b) => b.type === val);
                  setSelectedType(val);
                  setFormData((prev) => ({
                    ...prev,
                    type: val,
                    subtype: selected?.subtype || "",
                    icon: selected?.icon || "",
                    services: [],
                    customServices: [],
                  }));
                  localStorage.setItem("businessType", val);
                  localStorage.setItem("businessServices", JSON.stringify([]));
                  localStorage.setItem("customServices", JSON.stringify([]));
                }
                setErrors((prev) => ({ ...prev, type: "" }));
              }}
              value={selectedType || data?.business?.type}
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
                    <SelectItem key={b.type} value={b.type}>
                      {b.type} - {b.subtype}
                    </SelectItem>
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
                    // Add the new business type to allBusinessTypes
                    setAllBusinessTypes((prev) => [
                      ...prev,
                      { type: trimmed, subtype: "Custom", icon: "svg/Web-Design-Agency-icon.svg" },
                    ]);
                    setFormData((prev) => ({
                      ...prev,
                      type: trimmed,
                      subtype: "Custom",
                      icon: "svg/Web-Design-Agency-icon.svg",
                      services: [],
                      customServices: [],
                    }));
                    setAllServices((prev) => ({ ...prev, [trimmed]: [] }));
                    setSelectedType(trimmed); // Update selectedType to new type
                    localStorage.setItem("businessType", trimmed);
                    localStorage.setItem("businessServices", JSON.stringify([]));
                    localStorage.setItem("customServices", JSON.stringify([]));
                    setNewBusinessType(""); // Clear input after adding
                  }
                }}
                className="mt-2"
              />
            )}
            {errors.type && <p className="text-sm text-red-600">{errors.type}</p>}
          </div>

          <div className="space-y-3">
            <Label className="text-base font-medium">Select Services</Label>

            <div className="grid gap-2">
              {(allServices[selectedType] || []).map((service) => (
                <label
                  key={service}
                  className="flex items-center gap-2 rounded-lg border p-2 cursor-pointer hover:bg-gray-50 transition"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                    checked={formData.services?.includes(service)}
                    onChange={() => {
                      const current = formData.services || [];
                      const updated = current.includes(service)
                        ? current.filter((s) => s !== service)
                        : [...current, service];
                      setFormData({ ...formData, services: updated });
                    }}
                  />
                  <span className="text-sm">{service}</span>
                </label>
              ))}
            </div>

            {/* If no services exist, allow adding new */}
            {selectedType && !allServices[selectedType]?.length && (
              <div className="flex items-center gap-2 mt-2">
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
                      setAllServices((prev) => ({
                        ...prev,
                        [selectedType]: [...(prev[selectedType] || []), trimmed],
                      }));
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

            {/* Add "Other" option */}
            {allServices[selectedType]?.length > 0 &&
              !allServices[selectedType]?.includes("Other") && (
                <label className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                    checked={formData.services?.includes("Other")}
                    onChange={() => {
                      const current = formData.services || [];
                      const updated = current.includes("Other")
                        ? current.filter((s) => s !== "Other")
                        : [...current, "Other"];
                      setFormData({ ...formData, services: updated });
                    }}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Add more services
                  </span>
                </label>
              )}

            {/* If "Other" selected → input field */}
            {formData.services?.includes("Other") && (
              <div className="flex items-center gap-2 mt-2">
                <Input
                  placeholder="Enter new service"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={() => {
                    const trimmed = newService.trim();
                    if (trimmed && !(allServices[selectedType] || []).includes(trimmed)) {
                      setAllServices((prev) => ({
                        ...prev,
                        [selectedType]: [...(prev[selectedType] || []), trimmed],
                      }));
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

            {/* Selected services badges */}
            {formData.services?.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {formData.services.map((srv) => (
                  <span
                    key={srv}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs flex items-center gap-1"
                  >
                    {srv}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          services: (formData.services || []).filter((s) => s !== srv),
                        })
                      }
                      className="text-purple-500 hover:text-purple-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
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
                     setErrors((prev) => ({ ...prev, googleBusiness: "" }));
                  }
                }}
              />
              I don’t have Google Business
            </label>
            {errors.googleBusiness && <p className="text-sm text-red-600">{errors.googleBusiness}</p>}
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
                setHasNoWebsite(false);
                setErrors((prev) => ({ ...prev, Website: "" }));
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
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={hasNoWebsite}
                onChange={(e) => {
                  setHasNoWebsite(e.target.checked);
                  if (e.target.checked) {
                    setFormData({ ...formData, website: "" });
                    setErrors((prev) => ({ ...prev, Website: "" }));
                  }
                }}
              />
               I don’t have a business website
            </label>
            {errors.Website && <p className="text-sm text-red-600">{errors.Website}</p>}
            {/* <>
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
                      <Button variant="ghost" onClick={() => setShowSitemap(false)}>
                        Close
                      </Button>
                    </div>
                    <ul className="max-h-48 overflow-y-auto">
                      {sitemapUrls.map((u) => (
                        <li key={u} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedUrls.has(u)}
                            onChange={() => toggleOne(u)}
                          />
                          <a
                            href={u}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-purple-600 hover:underline"
                          >
                            {u}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            </> */}
          </div>

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

          {/* <div className="space-y-2">
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
          </div> */}

          <div className="space-y-2">
            <Label htmlFor="internationalPhone"> Phone Number <span className="text-red-500">*</span></Label>
                    {/* <PhoneInput
                          // id="internationalPhone"
                          country="in"
                          value={formData.internationalPhoneNumber || ""} 
                          onChange={(phoneNumber) => {
                          // Ensure exactly one '+' at the start
                          const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
                          setFormData({ ...formData, internationalPhoneNumber: formattedNumber });
                        }}
                         placeholder=" +91 99XX87XXXX21"
                          inputClass="!w-full !text-sm !rounded-md !border !border-gray-300 focus:!border-purple-500"
                          containerClass="!w-full"
                          inputProps={{ name: "internationalPhoneNumber", id: "internationalPhoneNumber", required: true }}
                          specialLabel="+91"
                        /> */}
                        
            <Input
              id="internationalPhone"
              value={formData.internationalPhoneNumber || ""}
                 onChange={(phoneNumber) => {
                          const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
                          setFormData({ ...formData, internationalPhoneNumber: formattedNumber });
                        }}
              placeholder="Enter  phone number"
            /> 
            {errors.internationalPhoneNumber && <p className="text-sm text-red-600">{errors.internationalPhoneNumber}</p>}

          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email </Label>
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

          {/* <div className="space-y-2">
            <Label htmlFor="workingHours">Working Hours</Label>
            <Textarea
              id="workingHours"
              value={
                formData.workingHours
                  ? formData.workingHours.weekday_text?.join("\n") || "Not available"
                  : ""
              }
              readOnly
              placeholder="Working hours will be populated from Google Business"
            />
          </div> */}

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
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-between">
          <Button type="button" variant="outline" onClick={onPrevious} className="w-full sm:w-auto">
            <ChevronLeft className="w-4 h-4 mr-2" /> Previous
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
            disabled={isVerifying || loading ||(formData.website && !isWebsiteValid)}
          >
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