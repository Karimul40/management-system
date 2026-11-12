"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Bot,
    X,
    Send,
    Sparkles,
    RotateCcw,
    ExternalLink,
    FileText,
    CreditCard,
    Calendar,
    GraduationCap,
    BookOpen,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

const SUGGESTIONS = [
    { label: "📄 Course PDFs & Slides", query: "Give me the course PDFs and lecture slides for CSE-3101" },
    { label: "💳 My Fee & Due Status", query: "What is my personal tuition fee status and remaining due?" },
    { label: "📅 My Exam Routine", query: "When is my next examination and what is the official routine?" },
    { label: "🎓 CGPA & Results", query: "Show my semester exam results and CGPA transcript" },
    { label: "📚 My Borrowed Books", query: "What library books do I currently have borrowed?" },
    { label: "📝 Generate Exam Quiz", query: "Generate exam questions and quiz for CSE-3101" },
    { label: "📋 75% Attendance Rule", query: "What is the 75% attendance rule for semester exams?" },
    { label: "👨‍🏫 Faculty Directory", query: "Show me the list of faculty members and instructors" },
];

export default function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            text: "Welcome! I am the official **AI Academic Assistant** for **Imperial College of Engineering (ICE)**. 🎓\n\nHow can I help you today? You can ask me:\n- 📄 **\"Give me the PDFs for CSE-3101\"** (Lecture notes & slides uploaded by faculty)\n- 💳 **\"What is my remaining due?\"** (Live tuition balance & online payment)\n- 📅 **\"When is my next exam?\"** (Official exam routine & room schedule)\n- 🎓 **\"Show my exam results\"** (Published CGPA & grade sheet)\n- 📚 **\"What books do I have borrowed?\"** (Library book loan status)\n- 📋 **\"What is the 75% attendance rule?\"**",
            time: "Just now",
        },
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const messagesEndRef = useRef(null);

    // Auto scroll chat to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    useEffect(() => {
        try {
            const user = JSON.parse(localStorage.getItem("portal_current_user") || "null");
            if (user) setCurrentUser(user);
        } catch (e) {
            console.warn(e);
        }
    }, []);

    // Send query to backend AI Assistant API
    const handleSend = async (queryText) => {
        const text = queryText || inputValue;
        if (!text.trim() || isLoading) return;

        const userMsg = {
            role: "user",
            text: text.trim(),
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        const updated = [...messages, userMsg];
        setMessages(updated);
        setInputValue("");
        setIsLoading(true);

        try {
            // Gather client-side live portal data from localStorage
            let clientMaterials = [];
            let clientPayments = [];
            let clientBooks = [];
            try {
                clientMaterials = JSON.parse(localStorage.getItem("portal_course_materials") || "[]");
                clientPayments = JSON.parse(localStorage.getItem("portal_payments") || "[]");
                clientBooks = JSON.parse(localStorage.getItem("portal_student_books") || "[]");
            } catch (e) {
                console.warn(e);
            }

            const res = await apiRequest("/academic/ai-assistant", "POST", {
                message: userMsg.text,
                studentContext: {
                    name: currentUser?.fullName || currentUser?.name || "",
                    department: currentUser?.department || "ICE",
                    studentId: currentUser?.studentId || "",
                    role: currentUser?.role || "guest",
                    email: currentUser?.email || "",
                },
                clientMaterials,
                clientPayments,
                clientBooks,
            });

            if (res && res.success && res.reply) {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        text: res.reply,
                        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    },
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        text: "I could not retrieve an answer at this moment. Please try again or visit the Registrar Office.",
                        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    },
                ]);
            }
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    text: "Connection to the academic server was interrupted. Please try again in a few moments.",
                    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearChat = () => {
        setMessages([
            {
                role: "assistant",
                text: "Conversation cleared. How can I assist you with your academic inquiries?",
                time: "Just now",
            },
        ]);
    };

    // Helper: Parse bold text
    const renderBoldText = (text) => {
        if (!text || !text.includes("**")) return text;
        const segments = text.split("**");
        return segments.map((seg, sIdx) => {
            if (sIdx % 2 === 1) {
                return (
                    <strong key={`bold-${sIdx}`} className="font-extrabold text-slate-900">
                        {seg}
                    </strong>
                );
            }
            return seg;
        });
    };

    // Helper: Parse markdown links and inline formatting
    const renderMessageContent = (content) => {
        if (!content) return null;
        const lines = content.split("\n");

        return (
            <div className="space-y-1.5 leading-relaxed">
                {lines.map((line, lIdx) => {
                    if (!line.trim()) {
                        return <div key={`empty-${lIdx}`} className="h-1" />;
                    }

                    // Parse [Label](url) links
                    const linkRegex = /\[(.*?)\]\((.*?)\)/g;
                    const parts = [];
                    let lastIndex = 0;
                    let match;

                    while ((match = linkRegex.exec(line)) !== null) {
                        if (match.index > lastIndex) {
                            parts.push(renderBoldText(line.substring(lastIndex, match.index)));
                        }

                        const label = match[1];
                        const url = match[2];

                        parts.push(
                            <a
                                key={`link-${lIdx}-${match.index}`}
                                href={url}
                                target={url.startsWith("http") ? "_blank" : "_self"}
                                rel={url.startsWith("http") ? "noreferrer" : ""}
                                className="inline-flex items-center gap-1 font-extrabold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-md my-0.5 transition underline decoration-indigo-300 shadow-2xs"
                            >
                                <span>{label}</span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                        );

                        lastIndex = match.index + match[0].length;
                    }

                    if (lastIndex < line.length) {
                        parts.push(renderBoldText(line.substring(lastIndex)));
                    }

                    return (
                        <div key={`line-${lIdx}`} className="text-[12px]">
                            {parts}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div
            className="fixed pointer-events-none print:hidden font-sans"
            style={{
                right: "calc(max(0px, 50vw - 960px) + 24px)",
                bottom: "calc(max(0px, 50vh - 480px) + 24px)",
                zIndex: 99999,
            }}
        >
            <div className="pointer-events-auto">
                    {/* Trigger Button (Visible, Clearly Labeled Pill in Bottom Right Corner) */}
                    {!isOpen && (
                        <button
                            type="button"
                            onClick={() => setIsOpen(true)}
                            className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 text-white shadow-2xl hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all duration-300 ring-4 ring-white/20 border border-indigo-400/40 cursor-pointer"
                            aria-label="Open AI Academic Assistant"
                        >
                            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
                                <Bot className="w-5 h-5 text-white animate-pulse" />
                                <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400 border border-white"></span>
                                </span>
                            </div>
                            <div className="text-left pr-1">
                                <span className="block text-xs font-black tracking-wide leading-tight">AI Assistant</span>
                                <span className="block text-[10px] text-indigo-200 font-medium leading-none">Online • Click to Chat</span>
                            </div>
                            <Sparkles className="w-4 h-4 text-amber-300" />
                        </button>
                    )}

                    {/* Chat Panel Box (Anchored right at bottom right) */}
                    {isOpen && (
                        <div className="w-[330px] sm:w-[390px] h-[540px] max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 ring-4 ring-black/5">
                    {/* Header */}
                    <div className="p-4 bg-gradient-to-r from-indigo-800 via-indigo-700 to-blue-700 text-white flex items-center justify-between shadow-md">
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center ring-2 ring-white/30 text-white">
                                <Bot className="w-5 h-5 text-sky-200" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                                    <span>ICE AI Assistant</span>
                                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                                </h3>
                                <p className="text-[10px] text-indigo-100 font-medium flex items-center gap-1">
                                    <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                                    Academic Helper • Online
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={handleClearChat}
                                title="Reset conversation"
                                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                title="Close"
                                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/60 text-xs">
                        {messages.map((m, idx) => {
                            const isUser = m.role === "user";
                            return (
                                <div key={`msg-${idx}`} className={`flex ${isUser ? "justify-end" : "justify-start"} gap-2`}>
                                    {!isUser && (
                                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                                            <Bot className="w-3.5 h-3.5" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[85%] rounded-2xl p-3 shadow-xs space-y-1 ${
                                            isUser
                                                ? "bg-indigo-600 text-white rounded-br-xs"
                                                : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs"
                                        }`}
                                    >
                                        {isUser ? (
                                            <div className="text-[12px] whitespace-pre-wrap">{m.text}</div>
                                        ) : (
                                            renderMessageContent(m.text)
                                        )}
                                        <div className={`text-[9px] text-right font-medium ${isUser ? "text-indigo-200" : "text-slate-400"}`}>
                                            {m.time}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Typing Animation */}
                        {isLoading && (
                            <div className="flex items-center gap-2 text-slate-400 text-xs">
                                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                                    <Bot className="w-3.5 h-3.5" />
                                </div>
                                <div className="p-3 bg-white border border-slate-200 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-150" />
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce delay-300" />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Suggestion Pills */}
                    <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto scrollbar-none">
                        {SUGGESTIONS.map((s, idx) => (
                            <button
                                key={`sug-${idx}`}
                                type="button"
                                onClick={() => handleSend(s.query)}
                                disabled={isLoading}
                                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-[10px] font-semibold border border-slate-200 transition cursor-pointer shrink-0 disabled:opacity-50"
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>

                    {/* Input Bar */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend();
                        }}
                        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
                    >
                        <input
                            type="text"
                            placeholder="Ask about course PDFs, fee dues, exam routine..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={isLoading}
                            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition"
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isLoading}
                            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-bold transition cursor-pointer shrink-0 shadow-sm"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            )}
            </div>
        </div>
    );
}
