import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { getRetellVoices } from "@/Services/auth";
import StepWrapper from "./StepWrapper";

interface FormData {
  business?: any;
  agent?: {
    name: string;
    language: string;
    agentLanguage: string;
    gender: string;
    voice: string;
    avatar: string;
    role: string;
    selectedVoice?: any;
  };
}

interface AgentCreationStepProps {
  data: FormData;
  onUpdate: (updates: Partial<FormData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

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

const roles = [
  { title: "General Receptionist", description: "A general receptionist will pick calls, provide information on your services and products, take appointments and guide callers." },
  { title: "LEAD Qualifier", description: "A LEAD Qualifier handles inbound sales queries and helps identify potential leads for your business." },
];

const languages = [
  { name: "English (US)", locale: "en-US" },
  { name: "English (UK)", locale: "en-GB" },
  { name: "Hindi", locale: "hi-IN" },
];

const AgentCreationStep: React.FC<AgentCreationStepProps> = ({ data, onUpdate, onNext, onPrevious }) => {
  const [formData, setFormData] = useState<FormData["agent"]>(
    data.agent || { name: "", language: "", agentLanguage: "", gender: "", voice: "", avatar: "", role: "" }
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [retellVoices, setRetellVoices] = useState<{ voice_id: string; voice_name: string; gender: string; accent?: string; provider: string; preview_audio_url: string }[]>([]);
  const [filteredVoices, setFilteredVoices] = useState<any[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const audioRefs = useRef<any[]>([]);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);

  useEffect(() => {
    setLoadingVoices(true);
    getRetellVoices()
      .then((data) => setRetellVoices(data))
      .catch((err) => {
        setVoiceError("Failed to load voices");
        console.error("Error fetching voices:", err);
      })
      .finally(() => setLoadingVoices(false));
  }, []);

  useEffect(() => {
    if (retellVoices && formData.gender) {
      const filtered = retellVoices.filter(
        (v) => v.provider === "elevenlabs" && v.gender?.toLowerCase() === formData.gender.toLowerCase()
      );
      setFilteredVoices(filtered);
    } else {
      setFilteredVoices([]);
    }
  }, [retellVoices, formData.gender]);

  const togglePlay = (idx: number) => {
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

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name) newErrors.name = "Agent name is required";
    if (!formData.language) newErrors.language = "Language is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.voice) newErrors.voice = "Voice is required";
    if (!formData.avatar) newErrors.avatar = "Avatar is required";
    if (!formData.role) newErrors.role = "Role is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const selectedVoice = filteredVoices.find((voice) => voice.voice_id === formData.voice);
    onUpdate({ agent: { ...formData, selectedVoice } });
    onNext();
  };

  return (
    <StepWrapper step={3} totalSteps={5} title="Agent Creation" description="Configure the agent for the business.">
      <form onSubmit={handleNext} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agentName">Agent Name <span className="text-red-500">*</span></Label>
            <Input
              id="agentName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter agent name"
            />
            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Language <span className="text-red-500">*</span></Label>
            <Select
              value={formData.language}
              onValueChange={(v) => {
                const lang = languages.find((l) => l.locale === v);
                setFormData({ ...formData, language: v, agentLanguage: lang?.name || v });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.locale} value={lang.locale}>
                    <span className="flex items-center gap-2">
                      <img
                        src={`https://flagcdn.com/w20/${lang.locale.split("-")[1]?.toLowerCase() || "us"}.png`}
                        alt="flag"
                        className="w-5 h-5"
                      />
                      {lang.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.language && <p className="text-sm text-red-600">{errors.language}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender <span className="text-red-500">*</span></Label>
            <Select
              value={formData.gender}
              onValueChange={(v) => setFormData({ ...formData, gender: v, avatar: "", voice: "" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-sm text-red-600">{errors.gender}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="voice">Voice <span className="text-red-500">*</span></Label>
            {loadingVoices ? (
              <p className="text-sm text-gray-500">Loading voices...</p>
            ) : voiceError ? (
              <p className="text-sm text-red-600">{voiceError}</p>
            ) : filteredVoices.length === 0 ? (
              <p className="text-sm text-gray-500">No voices found for selected gender</p>
            ) : (
              <Select
                value={formData.voice}
                onValueChange={(v) => {
                  setFormData({ ...formData, voice: v });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose voice" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  {filteredVoices.map((voice, index) => (
                    <SelectItem key={index} value={voice.voice_id} className="py-2">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{voice.voice_name}</p>
                          <p className="text-xs text-gray-500 capitalize">{voice.accent ? `${voice.accent} Accent` : voice.provider}</p>
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePlay(index);
                          }}
                        >
                          {playingIdx === index ? (
                            <Pause className="w-4 h-4 text-gray-500" />
                          ) : (
                            <Play className="w-4 h-4 text-gray-500" />
                          )}
                        </Button>
                        <audio ref={(el) => (audioRefs.current[index] = el)} style={{ display: "none" }}>
                          <source src={voice.preview_audio_url} type="audio/mpeg" />
                        </audio>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.voice && <p className="text-sm text-red-600">{errors.voice}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatar">Avatar <span className="text-red-500">*</span></Label>
            {formData.gender ? (
              <Select
                value={formData.avatar}
                onValueChange={(v) => setFormData({ ...formData, avatar: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose avatar" />
                </SelectTrigger>
                <SelectContent>
                  {avatars[formData.gender]?.map((av, index) => (
                    <SelectItem key={index} value={av.img}>
                      <span className="flex items-center gap-2">
                        <img src={av.img} alt={`Avatar ${index + 1}`} className="w-6 h-6 rounded-full" />
                        Avatar {index + 1}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-gray-500">Select gender to choose avatar</p>
            )}
            {errors.avatar && <p className="text-sm text-red-600">{errors.avatar}</p>}
          </div>
          <div className="space-y-2">
            <Label>Agent Role <span className="text-red-500">*</span></Label>
            {roles.map((role, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="agentRole"
                  value={role.title}
                  checked={formData.role === role.title}
                  onChange={() => setFormData({ ...formData, role: role.title })}
                />
                <div>
                  <p className="font-medium">{role.title}</p>
                  <p className="text-sm text-gray-500">{role.description}</p>
                </div>
              </div>
            ))}
            {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-between">
          <Button type="button" variant="outline" onClick={onPrevious} className="w-full sm:w-auto">
            <ChevronLeft className="w-4 h-4 mr-2" /> Previous
          </Button>
          <Button type="submit" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700">
            Next: Payment
          </Button>
        </div>
      </form>
    </StepWrapper>
  );
};

export default AgentCreationStep;