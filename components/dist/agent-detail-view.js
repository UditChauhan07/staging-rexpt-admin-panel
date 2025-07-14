"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.AgentDetailView = void 0;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var axios_1 = require("axios");
var input_1 = require("./ui/input");
var card_1 = require("@/components/ui/card");
var lucide_react_2 = require("lucide-react");
var auth_1 = require("@/Services/auth");
var sweetalert2_1 = require("sweetalert2");
var avatars = {
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
    ]
};
var modelList = [
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-4.1",
    "gpt-4.1-mini",
    "gpt-4.1-nano",
    "claude-3.7-sonnet",
    "claude-3.5-haiku",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
];
var getModelImage = function (model) {
    var modelLower = model.toLowerCase();
    if (modelLower.includes("gpt"))
        return "/images/ChatGPT-Logo.png";
    if (modelLower.includes("gemini"))
        return "/images/geminiis.png";
    if (modelLower.includes("claude"))
        return "/images/claude.png";
    return "/images/default.png";
};
var sidebarOptions = [
    // { id: "functions", label: "Functions", icon: Settings, hasDropdown: true },
    {
        id: "knowledge",
        label: "Knowledge Base",
        icon: lucide_react_2.BookOpen,
        hasDropdown: true
    },
];
var variableList = [
    { name: "AGENT NAME" },
    { name: "BUSINESS NAME" },
    { name: "BUSINESSTYPE" },
    { name: "SERVICES" },
    { name: "LANGUAGE" },
    { name: "BUSINESS EMAIL ID" },
    { name: "current_time" },
    { name: "current_time_[timezone]" },
    { name: "MORE ABOUT YOUR BUSINESS" },
    { name: "AGENTNOTE" },
];
function AgentDetailView(_a) {
    var _this = this;
    var _b, _c, _d, _e;
    var agent = _a.agent, business = _a.business, knowledge_base_texts = _a.knowledge_base_texts, total_call = _a.total_call, onBack = _a.onBack, agentName = _a.agentName, _f = _a.dropdowns, dropdowns = _f === void 0 ? {} : _f, // fallback to empty object
    toggleDropdown = _a.toggleDropdown, setShowAgentModal = _a.setShowAgentModal, setAgentData = _a.setAgentData, languages = _a.languages;
    var _g = react_1.useState("functions"), activeTab = _g[0], setActiveTab = _g[1];
    var _h = react_1.useState([] || (agent === null || agent === void 0 ? void 0 : agent.agentVoice) || "English(US)"), retellVoices = _h[0], setRetellVoices = _h[1];
    var _j = react_1.useState(false), isDynamicView = _j[0], setIsDynamicView = _j[1];
    var _k = react_1.useState(agent.rawPromptTemplate || ""), prompt = _k[0], setPrompt = _k[1];
    var dynamicPrompt = agent.dynamicPromptTemplate || "";
    var _l = react_1.useState(agent.modelName || "gemini-2.0-flash"), modelName = _l[0], setModelName = _l[1];
    var _m = react_1.useState((agent === null || agent === void 0 ? void 0 : agent.agentVoice) || ""), selectedVoiceId = _m[0], setSelectedVoiceId = _m[1];
    var _o = react_1.useState([
        "Sales Docs",
    ]), knowledgeBases = _o[0], setKnowledgeBases = _o[1]; // Dummy data; replace with fetched data if needed
    var _p = react_1.useState(""), businessSearch = _p[0], setBusinessSearch = _p[1];
    var _q = react_1.useState(""), businessSize = _q[0], setBusinessSize = _q[1];
    //  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>(allBusinessTypes)
    var _r = react_1.useState({}), allServices = _r[0], setAllServices = _r[1];
    var _s = react_1.useState(""), selectedType = _s[0], setSelectedType = _s[1];
    var _t = react_1.useState(""), newBusinessType = _t[0], setNewBusinessType = _t[1];
    var _u = react_1.useState(""), newService = _u[0], setNewService = _u[1];
    var _v = react_1.useState(false), showAddKnowledgeModal = _v[0], setShowAddKnowledgeModal = _v[1];
    // const [newKnowledgeName, setNewKnowledgeName] = useState("");
    var _w = react_1.useState(false), showAddOptions = _w[0], setShowAddOptions = _w[1];
    // const [form, setForm] = useState({ businessUrl: "", services: [], customServices: [], businessType: "" });
    var _x = react_1.useState(null), isWebsiteValid = _x[0], setIsWebsiteValid = _x[1];
    var _y = react_1.useState(false), isVerifying = _y[0], setIsVerifying = _y[1];
    var _z = react_1.useState(""), customText = _z[0], setCustomText = _z[1];
    var _0 = react_1.useState([]), uploadedFiles = _0[0], setUploadedFiles = _0[1];
    var _1 = react_1.useState({}), form = _1[0], setForm = _1[1];
    var _2 = react_1.useState(""), newKnowledgeName = _2[0], setNewKnowledgeName = _2[1];
    var _3 = react_1.useState((agent === null || agent === void 0 ? void 0 : agent.agentLanguageCode) || ""), selectedLanguage = _3[0], setSelectedLanguage = _3[1];
    var textareaRef = react_1.useRef(null);
    var parsedVariables = typeof (agent === null || agent === void 0 ? void 0 : agent.promptVariablesList) === "string"
        ? JSON.parse(agent.promptVariablesList)
        : (agent === null || agent === void 0 ? void 0 : agent.promptVariablesList) || [];
    var insertVariableAtCursor = function (variable) {
        var textarea = textareaRef.current;
        if (!textarea)
            return;
        var start = textarea.selectionStart;
        var end = textarea.selectionEnd;
        var before = prompt.slice(0, start);
        var after = prompt.slice(end);
        var variableText = "{{" + variable + "}}";
        var newPrompt = before + variableText + after;
        setPrompt(newPrompt);
        setTimeout(function () {
            textarea.focus();
            textarea.setSelectionRange(start + variableText.length, start + variableText.length);
        }, 0);
    };
    var liveDynamicPrompt = prompt.replace(/{{(.*?)}}/g, function (_match, varName) {
        var found = parsedVariables.find(function (v) { return v.name.toLowerCase() === varName.trim().toLowerCase(); });
        if (!found)
            return _match;
        var val = found.value;
        if (Array.isArray(val)) {
            return val.map(function (s) { return s.service || s; }).join(", ");
        }
        return val !== null && val !== void 0 ? val : "";
    });
    // const textareaRef = useRef<HTMLTextAreaElement>(null);
    var handledeleteknowledgebase = function (knowledge_base_id) { return __awaiter(_this, void 0, void 0, function () {
        var res, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1["default"]["delete"](process.env.NEXT_PUBLIC_API_URL + "/api/knowledgeBase/deleteKnowledgeBase/" + knowledge_base_id)];
                case 1:
                    res = _b.sent();
                    if (((_a = res.data) === null || _a === void 0 ? void 0 : _a.status) === true) {
                        sweetalert2_1["default"].fire("Deleted!", "Knowledge base deleted successfully", "success");
                        setKnowledgeBases(function (prev) { return prev.filter(function (id) { return id !== knowledge_base_id; }); });
                    }
                    else {
                        sweetalert2_1["default"].fire("Error", "Could not delete the knowledge base", "error");
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _b.sent();
                    console.error(error_1);
                    sweetalert2_1["default"].fire("Error", "Something went wrong", "error");
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleWebsiteBlur = function () { return __awaiter(_this, void 0, void 0, function () {
        var url, result, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = form.businessUrl;
                    if (!url)
                        return [2 /*return*/];
                    setIsVerifying(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, auth_1.validateWebsite(url)];
                case 2:
                    result = _a.sent();
                    setIsWebsiteValid(result.valid);
                    return [3 /*break*/, 5];
                case 3:
                    err_1 = _a.sent();
                    console.error("Website verification error:", err_1);
                    setIsWebsiteValid(false);
                    return [3 /*break*/, 5];
                case 4:
                    setIsVerifying(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var getLeadTypeChoices = function () {
        var fixedChoices = ["Spam Caller", "Irrelvant Call", "Angry Old Customer"];
        var allServices = __spreadArrays(customServices, businessServiceNames);
        var cleanedServices = allServices
            .map(function (service) { return service === null || service === void 0 ? void 0 : service.trim(); }) // remove extra whitespace
            .filter(function (service) { return service && (service === null || service === void 0 ? void 0 : service.toLowerCase()) !== "other"; })
            .map(function (service) {
            var _a;
            var normalized = (_a = service === null || service === void 0 ? void 0 : service.replace(/\s+/g, " ")) === null || _a === void 0 ? void 0 : _a.trim();
            return "Customer for " + normalized;
        });
        var combinedChoices = Array.from(new Set(__spreadArrays(fixedChoices, cleanedServices)));
        return combinedChoices;
    };
    console.log(knowledge_base_texts, "knowledge_base_texts");
    react_1.useEffect(function () {
        var fetchVoices = function () { return __awaiter(_this, void 0, void 0, function () {
            var data, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, auth_1.getRetellVoices()];
                    case 1:
                        data = _a.sent();
                        setRetellVoices(data);
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error("Failed to fetch voices", error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        fetchVoices();
    }, []);
    // const URL = "https://rex-bk.truet.net";
    var getStatusBadge = function (status) {
        var variants = {
            Online: "bg-green-100 text-green-800",
            Offline: "bg-gray-100 text-gray-800",
            Busy: "bg-yellow-100 text-yellow-800"
        };
        return React.createElement(badge_1.Badge, { className: variants[status] }, status);
    };
    return (React.createElement("div", { className: "h-screen w-full flex bg-gray-50" },
        React.createElement("div", { className: "w-80 bg-white border-r flex flex-col" },
            React.createElement("div", { className: "p-4 border-b" },
                React.createElement(button_1.Button, { variant: "ghost", onClick: onBack, className: "mb-4" },
                    React.createElement(lucide_react_2.ArrowLeft, { className: "mr-2 h-4 w-4" }),
                    " Back to Agent List"),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "p-4" },
                        React.createElement("div", { className: "flex items-center gap-3 mb-3" },
                            React.createElement("div", { className: "w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center" },
                                React.createElement("img", { src: agent.avatar, className: "h-6 w-6 text-purple-600" })),
                            React.createElement("div", null,
                                React.createElement("h3", { className: "font-semibold text-gray-900" }, (agent === null || agent === void 0 ? void 0 : agent.agentName) || "NA"),
                                getStatusBadge(agent === null || agent === void 0 ? void 0 : agent.status))),
                        React.createElement("div", { className: "space-y-2 text-sm" },
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement(lucide_react_2.Building2, { className: "h-4 w-4 text-gray-500" }),
                                React.createElement("span", null, (business === null || business === void 0 ? void 0 : business.businessName) || "NA")),
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement(lucide_react_2.User, { className: "h-4 w-4 text-gray-500" }),
                                React.createElement("span", null, (business === null || business === void 0 ? void 0 : business.businessType) || "NA")),
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement(lucide_react_2.Phone, { className: "h-4 w-4 text-gray-500" }),
                                React.createElement("span", null, ((_b = business === null || business === void 0 ? void 0 : business.knowledge_base_texts) === null || _b === void 0 ? void 0 : _b.phone) || "NA")))))),
            React.createElement("nav", { className: "flex-1 p-4 space-y-1" }, sidebarOptions.map(function (opt) {
                var Icon = opt.icon;
                var isActive = activeTab === opt.id;
                var isDropdownOpen = dropdowns[opt.id];
                return (React.createElement("div", { key: opt.id },
                    React.createElement("button", { onClick: function () {
                            setActiveTab(opt.id);
                            if (opt.hasDropdown)
                                toggleDropdown(opt.id);
                        }, className: "flex items-center justify-between w-full px-4 py-2 rounded-lg transition-all " + (isActive
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "hover:bg-gray-100") },
                        React.createElement("div", { className: "flex items-center gap-3" },
                            React.createElement(Icon, { className: "h-5 w-5" }),
                            React.createElement("span", null, opt.label)),
                        opt.hasDropdown && (isDropdownOpen ? React.createElement(lucide_react_2.ChevronUp, { className: "h-4 w-4" }) : React.createElement(lucide_react_2.ChevronDown, { className: "h-4 w-4" }))),
                    opt.id === "knowledge" && isDropdownOpen && (React.createElement("div", { className: "ml-8 mt-2 space-y-2" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("span", { className: "text-sm text-gray-700" }, agent.knowledgeBaseId),
                            React.createElement("button", { className: "text-red-500 text-xs", onClick: function () {
                                    setKnowledgeBases(function (prev) {
                                        var trimmed = newKnowledgeName.trim();
                                        return prev.includes(trimmed) ? prev : __spreadArrays(prev, [trimmed]);
                                    });
                                } },
                                React.createElement(lucide_react_1.Trash2, { onClick: function () { return handledeleteknowledgebase(agent.knowledgeBaseId); }, className: "h-4 w-4" }))),
                        React.createElement("button", { onClick: function () { return setShowAddKnowledgeModal(true); }, className: "text-blue-600 text-sm underline mt-2" }, "+ Add New")))));
            })),
            React.createElement("div", { className: "p-4 border-t bg-gray-50" },
                React.createElement("h4", { className: "text-sm font-semibold text-gray-900 mb-2" }, "Performance Stats"),
                React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                    React.createElement("div", { className: "text-center" },
                        React.createElement("div", { className: "text-2xl font-bold text-purple-600" }, total_call !== null && total_call !== void 0 ? total_call : 0),
                        React.createElement("div", { className: "text-xs text-gray-500" }, "Total Calls")),
                    React.createElement("div", { className: "text-center" },
                        React.createElement("div", { className: "text-2xl font-bold text-green-600" }, agent.avgResponseTime || "NA"),
                        React.createElement("div", { className: "text-xs text-gray-500" }, "Avg Response"))))),
        React.createElement("div", { className: "flex-1 p-6 overflow-y-auto" },
            React.createElement("div", { className: "flex items-center gap-4 mb-6" },
                React.createElement("h1", { className: "text-lg font-bold" }, agent.agentName),
                React.createElement("h2", { className: "text-gray-600" },
                    "LLMID: ",
                    agent.llmId)),
            React.createElement("div", { className: "flex flex-wrap items-center gap-4 mb-6" },
                React.createElement("div", { className: "relative" },
                    React.createElement("button", { className: "flex items-center gap-2 border rounded px-3 py-1 text-sm bg-white shadow-sm", onClick: function () { return toggleDropdown("model"); } },
                        React.createElement("img", { src: getModelImage(modelName), alt: "model", className: "w-5 h-5 rounded-full" }),
                        React.createElement("span", null, modelName))),
                React.createElement("div", { className: "relative" },
                    React.createElement("button", { className: "flex items-center gap-2 border rounded px-3 py-1 text-sm bg-white shadow-sm", onClick: function () { return toggleDropdown("agent"); } },
                        React.createElement("img", { src: ((_c = retellVoices.find(function (v) { return v.voice_id === selectedVoiceId; })) === null || _c === void 0 ? void 0 : _c.avatar_url) || "https://csspicker.dev/api/image/?q=avatar", alt: "voice", className: "w-5 h-5 rounded-full" }),
                        React.createElement("span", null, ((_d = retellVoices.find(function (v) { return v.voice_id === selectedVoiceId; })) === null || _d === void 0 ? void 0 : _d.voice_name) || "Select Voice"),
                        (dropdowns === null || dropdowns === void 0 ? void 0 : dropdowns.agent) ? (React.createElement(lucide_react_2.ChevronUp, { size: 16 })) : (React.createElement(lucide_react_2.ChevronDown, { size: 16 }))),
                    (dropdowns === null || dropdowns === void 0 ? void 0 : dropdowns.agent) && (React.createElement("div", { className: "absolute mt-1 w-64 bg-white border rounded shadow z-10 max-h-60 overflow-y-auto" }, retellVoices.map(function (voice) { return (React.createElement("div", { key: voice.voice_id, className: "flex items-center gap-2 px-4 py-2 hover:bg-gray-100 cursor-pointer", onClick: function () { return __awaiter(_this, void 0, void 0, function () {
                            var err_2;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        setSelectedVoiceId(voice.voice_id);
                                        // ✅ Only use setAgentData if it's passed
                                        if (typeof setAgentData === "function") {
                                            setAgentData(function (prev) { return (__assign(__assign({}, prev), { voice_id: voice.voice_id })); });
                                        }
                                        toggleDropdown("agent");
                                        return [4 /*yield*/, axios_1["default"].put(process.env.NEXT_PUBLIC_API_URL + "/api/agent/agent/update/" + agent.agent_id, {
                                                voice_id: voice.voice_id
                                            })];
                                    case 1:
                                        _a.sent();
                                        console.log("Voice updated successfully");
                                        return [3 /*break*/, 3];
                                    case 2:
                                        err_2 = _a.sent();
                                        console.error("Failed to update voice", err_2);
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); } },
                        React.createElement("img", { src: voice.avatar_url, alt: voice.voice_name, className: "w-5 h-5 rounded-full" }),
                        React.createElement("span", { className: "text-sm" }, voice.voice_name))); })))),
                React.createElement("div", { className: "relative" },
                    React.createElement("button", { className: "flex items-center gap-2 border rounded px-3 py-1 text-sm bg-white shadow-sm" },
                        React.createElement("span", null, Array.isArray(languages)
                            ? ((_e = languages.find(function (l) { return l.locale === selectedLanguage; })) === null || _e === void 0 ? void 0 : _e.name) || "Select Language"
                            : "Select Language")),
                    (dropdowns === null || dropdowns === void 0 ? void 0 : dropdowns.language) && (React.createElement("div", { className: "absolute mt-1 w-64 bg-white border rounded shadow z-10 max-h-60 overflow-y-auto " }, languages.map(function (lang) { return (React.createElement("div", { key: lang.locale, className: "px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm" }, lang.name)); }))))),
            React.createElement("div", { className: "relative" },
                React.createElement("button", { className: "flex items-center gap-2 border rounded px-3 py-1 text-sm bg-white shadow-sm", onClick: function () { return toggleDropdown("variables"); } },
                    React.createElement(lucide_react_1.Plus, { size: 16 }),
                    React.createElement("span", null, "Variables"),
                    (dropdowns === null || dropdowns === void 0 ? void 0 : dropdowns.variables) ? React.createElement(lucide_react_2.ChevronUp, { size: 16 }) : React.createElement(lucide_react_2.ChevronDown, { size: 16 })),
                (dropdowns === null || dropdowns === void 0 ? void 0 : dropdowns.variables) && (React.createElement("div", { className: "absolute mt-1 w-64 bg-white border rounded shadow z-10 max-h-60 overflow-y-auto", style: { zIndex: "9999" } }, parsedVariables.map(function (v) {
                    var _a;
                    return (React.createElement("div", { key: v.name, className: "flex flex-col gap-1 px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm" },
                        React.createElement("div", { className: "flex justify-between items-center" },
                            React.createElement("span", { className: "font-semibold" }, v.name),
                            React.createElement("button", { onClick: function () { return insertVariableAtCursor(v.name); } },
                                React.createElement(lucide_react_1.Plus, { size: 14, className: "text-green-600 hover:text-green-800" }))),
                        React.createElement("div", { className: "text-gray-500 truncate text-xs" }, Array.isArray(v.value)
                            ? v.value.map(function (s) { return s.service || s; }).join(", ")
                            : (_a = v.value) !== null && _a !== void 0 ? _a : "")));
                })))),
            React.createElement("div", { className: "mb-4 flex items-center justify-between" },
                React.createElement("h2", { className: "text-xl font-semibold" }, "AI Agent Prompt"),
                React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return setIsDynamicView(function (prev) { return !prev; }); }, title: isDynamicView ? "Show Raw Prompt" : "Show Dynamic Prompt" }, isDynamicView ? (React.createElement(lucide_react_1.EyeOff, { className: "w-5 h-5" })) : (React.createElement(lucide_react_1.Eye, { className: "w-5 h-5" })))),
            isDynamicView ? (React.createElement("div", { className: "min-h-[60vh] max-h-[60vh] overflow-y-auto p-4 border rounded text-sm font-mono bg-gray-50 whitespace-pre-wrap", dangerouslySetInnerHTML: {
                    __html: liveDynamicPrompt.replace(/{{(.*?)}}/g, function (_match, p1) {
                        return "<span class=\"font-semibold text-green-600\">" + p1 + "</span>";
                    })
                } })) : (React.createElement("div", { className: "relative min-h-[60vh] max-h-[60vh] overflow-y-auto border rounded" },
                React.createElement("pre", { "aria-hidden": "true", className: "absolute inset-0 z-0 p-4 text-sm font-mono bg-white text-black whitespace-pre-wrap pointer-events-none", dangerouslySetInnerHTML: {
                        __html: prompt
                            .replace(/&/g, "&amp;")
                            .replace(/</g, "&lt;")
                            .replace(/>/g, "&gt;")
                            .replace(/{{(.*?)}}/g, '<span class="bg-yellow-100 text-yellow-700 font-semibold rounded px-1">$&</span>')
                    } }),
                React.createElement("textarea", { ref: textareaRef, value: prompt, onChange: function (e) { return setPrompt(e.target.value); }, className: "absolute inset-0 z-10 w-full h-full resize-none p-4 text-sm font-mono bg-transparent text-transparent caret-black whitespace-pre-wrap overflow-y-auto focus:outline-none", placeholder: "Enter system prompt here...", spellCheck: false }))),
            React.createElement("div", { className: "flex justify-between items-center mt-4" },
                React.createElement("span", { className: "text-sm text-gray-500" },
                    "Characters: ",
                    (isDynamicView ? dynamicPrompt : prompt).length),
                React.createElement("div", { className: "space-x-2" },
                    React.createElement(button_1.Button, { variant: "outline", disabled: isDynamicView }, "Reset"),
                    React.createElement(button_1.Button, { onClick: function () { return __awaiter(_this, void 0, void 0, function () {
                            var res, err_3;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, axios_1["default"].put(process.env.NEXT_PUBLIC_API_URL + "/api/agent/llmprompt/update/" + agent.llmId, { llmId: agent.llmId, prompt: prompt })];
                                    case 1:
                                        res = _a.sent();
                                        if (res.data.message === "Prompt updated successfully.")
                                            sweetalert2_1["default"].fire("Prompt Updated Successfully");
                                        return [3 /*break*/, 3];
                                    case 2:
                                        err_3 = _a.sent();
                                        console.error("Failed to save prompt:", err_3);
                                        alert("Save failed");
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); } }, "Save Prompt"))),
            showAddKnowledgeModal && (React.createElement("div", { className: "fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center" },
                React.createElement("div", { className: "bg-white rounded-lg p-6 shadow-lg w-[500px] max-h-[90vh] overflow-y-auto" },
                    React.createElement("h3", { className: "text-lg font-semibold mb-4" }, "Add Knowledge Base"),
                    React.createElement("div", { className: "mb-4" },
                        React.createElement("label", { className: "block text-sm font-medium" }, "Knowledge Base Name"),
                        React.createElement(input_1.Input, { value: newKnowledgeName, onChange: function (e) { return setNewKnowledgeName(e.target.value); }, placeholder: "Enter knowledge base name" })),
                    newKnowledgeName.trim() !== "" && (React.createElement("div", { className: "mb-4" },
                        React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setShowAddOptions(!showAddOptions); } }, "+ Add"),
                        showAddOptions && (React.createElement("div", { className: "mt-2 space-y-3 border p-3 rounded-md bg-gray-50" },
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "Website URL"),
                                React.createElement("div", { className: "relative w-full" },
                                    React.createElement(input_1.Input, { placeholder: "https://example.com", value: form.businessUrl || "", onChange: function (e) {
                                            setForm(__assign(__assign({}, form), { businessUrl: e.target.value }));
                                            setIsWebsiteValid(null);
                                        }, onBlur: handleWebsiteBlur }),
                                    isVerifying && (React.createElement("span", { className: "absolute right-2 top-2 text-xs text-blue-500" }, "Verifying...")),
                                    isWebsiteValid === true && (React.createElement("span", { className: "absolute right-2 top-2 text-xs text-green-600" }, "\u2713 Valid")),
                                    isWebsiteValid === false && (React.createElement("span", { className: "absolute right-2 top-2 text-xs text-red-600" }, "\u2717 Invalid")))),
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "Upload Files"),
                                React.createElement(input_1.Input, { type: "file", multiple: true, accept: ".pdf,.doc,.docx,.txt", onChange: function (e) { return setUploadedFiles(__spreadArrays(e.target.files)); } })),
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium" }, "Paste Text"),
                                React.createElement("textarea", { rows: 4, className: "w-full p-2 border rounded text-sm", placeholder: "Paste business content here...", value: customText, onChange: function (e) { return setCustomText(e.target.value); } })))))),
                    React.createElement("div", { className: "flex justify-end gap-2 pt-4" },
                        React.createElement(button_1.Button, { variant: "ghost", onClick: function () {
                                setShowAddKnowledgeModal(false);
                                setNewKnowledgeName("");
                                setShowAddOptions(false);
                                setForm(__assign(__assign({}, form), { businessUrl: "" }));
                                setCustomText("");
                                setUploadedFiles([]);
                            } }, "Cancel"),
                        React.createElement(button_1.Button, { onClick: function () { return __awaiter(_this, void 0, void 0, function () {
                                var API_KEY, API_BASE_URL, texts, urls, files, formData, res, newKBId, err_4;
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            API_KEY = "Bearer YOUR_RETELL_API_KEY";
                                            API_BASE_URL = "https://api.retellai.com/v1";
                                            texts = customText.trim()
                                                ? [{ title: "Custom Text", text: customText.trim() }]
                                                : [];
                                            urls = ((_a = form.businessUrl) === null || _a === void 0 ? void 0 : _a.trim()) ? [form.businessUrl.trim()]
                                                : [];
                                            files = (uploadedFiles === null || uploadedFiles === void 0 ? void 0 : uploadedFiles.length) ? uploadedFiles : [];
                                            formData = new FormData();
                                            texts.forEach(function (t, i) {
                                                formData.append("knowledge_base_texts[" + i + "][title]", t.title);
                                                formData.append("knowledge_base_texts[" + i + "][text]", t.text);
                                            });
                                            urls.forEach(function (url, i) {
                                                formData.append("knowledge_base_urls[" + i + "]", url);
                                            });
                                            files.forEach(function (file) {
                                                formData.append("knowledge_base_files", file);
                                            });
                                            _b.label = 1;
                                        case 1:
                                            _b.trys.push([1, 6, , 7]);
                                            if (!agent.knowledgeBaseId) return [3 /*break*/, 3];
                                            // ✅ Add sources to existing KB
                                            return [4 /*yield*/, axios_1["default"].post(API_BASE_URL + "/knowledge-bases/" + agent.knowledgeBaseId + "/sources", formData, {
                                                    headers: {
                                                        Authorization: API_KEY,
                                                        "Content-Type": "multipart/form-data"
                                                    }
                                                })];
                                        case 2:
                                            // ✅ Add sources to existing KB
                                            _b.sent();
                                            return [3 /*break*/, 5];
                                        case 3:
                                            // 🆕 Create new KB
                                            formData.append("knowledge_base_name", newKnowledgeName.trim());
                                            return [4 /*yield*/, axios_1["default"].post(API_BASE_URL + "/knowledge-bases", formData, {
                                                    headers: {
                                                        Authorization: API_KEY,
                                                        "Content-Type": "multipart/form-data"
                                                    }
                                                })];
                                        case 4:
                                            res = _b.sent();
                                            newKBId = res.data.knowledge_base_id;
                                            // 🔁 Optionally update agent or store KB ID in DB/state
                                            console.log("New KB created:", newKBId);
                                            _b.label = 5;
                                        case 5:
                                            setKnowledgeBases(function (prev) { return __spreadArrays(prev, [newKnowledgeName.trim()]); });
                                            setShowAddKnowledgeModal(false);
                                            setNewKnowledgeName("");
                                            setShowAddOptions(false);
                                            setForm(__assign(__assign({}, form), { businessUrl: "" }));
                                            setCustomText("");
                                            setUploadedFiles([]);
                                            return [3 /*break*/, 7];
                                        case 6:
                                            err_4 = _b.sent();
                                            console.error("Failed to add/create KB:", err_4);
                                            return [3 /*break*/, 7];
                                        case 7: return [2 /*return*/];
                                    }
                                });
                            }); } }, "Add Knowledge Base"))))))));
}
exports.AgentDetailView = AgentDetailView;
