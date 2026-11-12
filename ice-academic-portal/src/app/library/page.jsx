"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    BookOpen,
    Search,
    ArrowLeft,
    CheckCircle2,
    Bookmark,
    Filter,
    Clock,
    ShieldCheck,
    Download,
    BookMarked,
    Sparkles,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

const DEFAULT_BOOKS = [
    { id: "b1", title: "Modern Digital Electronics", author: "R. P. Jain", category: "Electronics", copies: 8, isbn: "978-0070669116", shelf: "Rack E-04" },
    { id: "b2", title: "Introduction to Algorithms (CLRS)", author: "Cormen, Leiserson, Rivest, Stein", category: "Computer Science", copies: 5, isbn: "978-0262033848", shelf: "Rack CS-01" },
    { id: "b3", title: "Data Communications and Networking", author: "Behrouz A. Forouzan", category: "Networking", copies: 6, isbn: "978-0073376226", shelf: "Rack ICE-02" },
    { id: "b4", title: "Engineering Circuit Analysis", author: "William H. Hayt", category: "Electrical", copies: 4, isbn: "978-0073529578", shelf: "Rack EE-03" },
    { id: "b5", title: "Database System Concepts", author: "Silberschatz, Korth, Sudarshan", category: "Databases", copies: 7, isbn: "978-0073523323", shelf: "Rack CS-05" },
    { id: "b6", title: "Artificial Intelligence: A Modern Approach", author: "Stuart Russell, Peter Norvig", category: "AI & ML", copies: 3, isbn: "978-0136042594", shelf: "Rack AI-01" },
    { id: "b7", title: "Optical Fiber Communications", author: "Gerd Keiser", category: "Networking", copies: 5, isbn: "978-0073380711", shelf: "Rack ICE-03" },
    { id: "b8", title: "Microelectronic Circuits (Sedra & Smith)", author: "Adel S. Sedra, Kenneth C. Smith", category: "Electronics", copies: 6, isbn: "978-0199339136", shelf: "Rack E-02" },
];

export default function LibraryPage() {
    const [books, setBooks] = useState(DEFAULT_BOOKS);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [notice, setNotice] = useState("");
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        try {
            const user = JSON.parse(localStorage.getItem("portal_current_user") || "null");
            if (user) setCurrentUser(user);

            const stored = JSON.parse(localStorage.getItem("portal_library_books") || "null");
            if (stored && stored.length > 0) {
                setBooks(stored);
            } else {
                localStorage.setItem("portal_library_books", JSON.stringify(DEFAULT_BOOKS));
            }
        } catch (e) {
            console.error("Library storage load error:", e);
        }

        const fetchLive = async () => {
            try {
                const res = await apiRequest("/academic/library");
                if (res && res.success && res.books && res.books.length > 0) {
                    setBooks(res.books);
                    localStorage.setItem("portal_library_books", JSON.stringify(res.books));
                }
            } catch (err) {
                console.warn("Live library sync fallback:", err.message);
            }
        };
        fetchLive();
    }, []);

    const categories = ["All", "Computer Science", "Electronics", "Networking", "Electrical", "Databases", "AI & ML"];

    const filtered = books.filter((b) => {
        const matchesSearch =
            b.title.toLowerCase().includes(search.toLowerCase()) ||
            b.author.toLowerCase().includes(search.toLowerCase()) ||
            (b.isbn && b.isbn.toLowerCase().includes(search.toLowerCase()));
        const matchesCat = selectedCategory === "All" || b.category === selectedCategory;
        return matchesSearch && matchesCat;
    });

    const handleBorrow = (book) => {
        if (book.copies <= 0) {
            setNotice(`Sorry, all copies of "${book.title}" are currently in circulation.`);
            setTimeout(() => setNotice(""), 3500);
            return;
        }

        const storedBorrowed = JSON.parse(localStorage.getItem("portal_student_books") || "[]");
        if (storedBorrowed.some((b) => b.id === book.id)) {
            setNotice(`You already have an active loan for "${book.title}".`);
            setTimeout(() => setNotice(""), 3500);
            return;
        }

        const newBorrow = {
            id: book.id,
            title: book.title,
            author: book.author,
            issueDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            status: "Issued",
        };

        const updatedLoans = [...storedBorrowed, newBorrow];
        localStorage.setItem("portal_student_books", JSON.stringify(updatedLoans));

        const updatedBooks = books.map((b) => (b.id === book.id ? { ...b, copies: Math.max(0, b.copies - 1) } : b));
        setBooks(updatedBooks);
        localStorage.setItem("portal_library_books", JSON.stringify(updatedBooks));

        setNotice(`✓ "${book.title}" successfully issued to your library account for 14 days!`);
        setTimeout(() => setNotice(""), 4500);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
            {/* Header with Projector-Safe Clamping */}
            <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href={currentUser?.role ? `/dashboard/${currentUser.role}` : "/"}
                            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-indigo-400" />
                                <span>Central Engineering E-Library</span>
                            </h1>
                            <p className="text-[11px] text-slate-400">Imperial College of Engineering • Academic Catalog</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                        <Link
                            href="/dashboard/student"
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition shadow-md shadow-indigo-600/20"
                        >
                            My Student Loans ➔
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content Body */}
            <main className="flex-1 py-8 sm:py-10 px-4 sm:px-6">
                <div className="max-w-[1400px] w-full mx-auto space-y-8">
                    {/* Hero Banner */}
                    <div className="rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-indigo-800/40 p-6 sm:p-10 relative overflow-hidden shadow-2xl">
                        <div className="relative z-10 max-w-2xl space-y-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Over 12,000+ Verified Academic Volumes</span>
                            </span>
                            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                                Search, Reserve &amp; Borrow Engineering Reference Books
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                                Instant online checkout for ICE, CSE, and EEE undergraduate textbooks, research journals, and lab manuals.
                            </p>
                        </div>
                    </div>

                    {notice && (
                        <div className="p-4 bg-emerald-950/80 border border-emerald-600/40 text-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            <span>{notice}</span>
                        </div>
                    )}

                    {/* Filter & Search Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                        <div className="relative flex-1 max-w-md">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search by title, author name, or ISBN..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-indigo-500 transition"
                            />
                        </div>

                        {/* Category Filter Pills */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                                        selectedCategory === cat
                                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                                            : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Book Catalog Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {filtered.length === 0 ? (
                            <div className="col-span-full py-16 text-center text-slate-400 bg-slate-900/40 rounded-3xl border border-slate-800">
                                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30 text-indigo-400" />
                                <p className="font-bold text-sm text-slate-300">No books found matching your search</p>
                                <p className="text-xs text-slate-500 mt-1">Try another keyword or category filter.</p>
                            </div>
                        ) : (
                            filtered.map((b) => (
                                <div
                                    key={b.id}
                                    className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition flex flex-col justify-between gap-4 group"
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                                {b.category}
                                            </span>
                                            <span className={`text-[10px] font-bold ${b.copies > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                                {b.copies > 0 ? `${b.copies} In Stock` : "Checked Out"}
                                            </span>
                                        </div>
                                        <h3 className="font-extrabold text-sm text-white group-hover:text-indigo-300 transition-colors leading-snug">
                                            {b.title}
                                        </h3>
                                        <p className="text-xs text-slate-400">By {b.author}</p>
                                        <p className="text-[11px] font-mono text-slate-500">Location: {b.shelf || "Central Stacks"}</p>
                                    </div>

                                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                                        <span className="text-[10px] text-slate-500 font-mono">14 Days Loan</span>
                                        <button
                                            onClick={() => handleBorrow(b)}
                                            disabled={b.copies <= 0}
                                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                                                b.copies > 0
                                                    ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
                                                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                                            }`}
                                        >
                                            <Bookmark className="w-3.5 h-3.5" />
                                            <span>{b.copies > 0 ? "Borrow Book" : "Unavailable"}</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
                <div className="max-w-[1400px] mx-auto px-4">
                    &copy; 2026 Central Engineering Library &bull; Imperial College of Engineering
                </div>
            </footer>
        </div>
    );
}
