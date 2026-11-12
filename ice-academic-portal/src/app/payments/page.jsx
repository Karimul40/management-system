"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    CreditCard,
    ArrowLeft,
    ShieldCheck,
    CheckCircle2,
    Search,
    Printer,
    FileText,
    Building2,
    Calendar,
    Clock,
    X,
} from "lucide-react";
import PaymentGatewayModal from "@/components/PaymentGatewayModal";
import { apiRequest } from "@/lib/api";

const FEE_TYPES = [
    { id: "tuition", title: "Semester Tuition Fee (Spring 2026)", amount: 25000, desc: "Academic registration, lab access & semester examination charges" },
    { id: "exam", title: "Supplementary / Retake Exam Fee", amount: 3500, desc: "Controller of Examinations official processing fee per subject" },
    { id: "transcript", title: "Official Academic Transcript & Certificate", amount: 1500, desc: "Registrar Office verification & digital stamped hardcopy" },
    { id: "hostel", title: "Hostel & Hall Residence Charge", amount: 12000, desc: "Monthly hall accommodation, utilities & security" },
];

export default function PaymentsPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedFee, setSelectedFee] = useState(FEE_TYPES[0]);
    const [showGateway, setShowGateway] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [payments, setPayments] = useState([]);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("portal_current_user") || "null");
        if (user) {
            setCurrentUser(user);
        }

        // Load payments
        const loadHistory = async () => {
            try {
                const res = await apiRequest("/academic/payments");
                if (res && res.success && res.payments) {
                    setPayments(res.payments);
                    localStorage.setItem("portal_payments", JSON.stringify(res.payments));
                } else {
                    const local = JSON.parse(localStorage.getItem("portal_payments") || "[]");
                    setPayments(local);
                }
            } catch (e) {
                const local = JSON.parse(localStorage.getItem("portal_payments") || "[]");
                setPayments(local);
            }
        };
        loadHistory();
    }, []);

    const handleSuccess = (newTrx) => {
        const updated = [newTrx, ...payments];
        setPayments(updated);
        localStorage.setItem("portal_payments", JSON.stringify(updated));

        try {
            apiRequest("/academic/payments", "POST", newTrx).catch(console.warn);
        } catch (e) {
            console.warn(e);
        }

        setShowGateway(false);
        setSelectedReceipt(newTrx);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href={currentUser?.role ? `/dashboard/${currentUser.role}` : "/"}
                            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-indigo-400" />
                                <span>ICE Online Fee Payment Portal</span>
                            </h1>
                            <p className="text-[11px] text-slate-400">Imperial College of Engineering • Integrated Gateway</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 font-semibold text-[11px]">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            SSL Secured & PCI Compliant
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
                {/* Hero Card */}
                <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 border border-indigo-800/50 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
                    <div className="relative z-10 max-w-2xl space-y-3">
                        <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                            Instant Digital Clearance
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                            Pay Academic & Tuition Fees in Seconds
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                            Support for bKash, Nagad, Visa, Mastercard, and direct bank debit. All fees are instantly updated in your official student record.
                        </p>
                        {currentUser && (
                            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300">
                                <span className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
                                    Student: <strong className="text-white">{currentUser.fullName || currentUser.name}</strong>
                                </span>
                                <span className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 font-mono">
                                    ID: <strong className="text-indigo-300">{currentUser.studentId || "ICE-2024-001"}</strong>
                                </span>
                                <span className="bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
                                    Dept: <strong className="text-white">{currentUser.department || "ICE"}</strong>
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Fee Selection Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {FEE_TYPES.map((fee) => {
                        const isSelected = selectedFee.id === fee.id;
                        return (
                            <div
                                key={fee.id}
                                onClick={() => setSelectedFee(fee)}
                                className={`p-6 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                                    isSelected
                                        ? "bg-slate-800/90 border-indigo-500 ring-2 ring-indigo-500/40 shadow-xl"
                                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                                }`}
                            >
                                <div className="space-y-2">
                                    <div className="flex items-start justify-between">
                                        <h3 className="font-extrabold text-white text-base leading-snug">{fee.title}</h3>
                                        <span className="text-xl font-black text-indigo-400">৳{fee.amount.toLocaleString()}</span>
                                    </div>
                                    <p className="text-xs text-slate-400">{fee.desc}</p>
                                </div>

                                <div className="mt-5 pt-4 border-t border-slate-700/60 flex items-center justify-between">
                                    <span className="text-[11px] text-slate-400">Merchant: ICE Registrar</span>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedFee(fee);
                                            setShowGateway(true);
                                        }}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer active:scale-95"
                                    >
                                        Pay ৳{fee.amount.toLocaleString()} Now
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Recent Payments Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-400" />
                        <span>Recent Payment History</span>
                    </h3>

                    <div className="bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden">
                        {payments.length === 0 ? (
                            <div className="p-8 text-center text-xs text-slate-500">
                                No previous fee payment records found.
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-800">
                                {payments.slice(0, 5).map((p, idx) => (
                                    <div key={idx} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-indigo-300">{p.trxId}</span>
                                                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                                                    ✓ {p.status || "Completed"}
                                                </span>
                                            </div>
                                            <p className="text-slate-400 text-[11px]">
                                                {p.studentName} ({p.studentId}) • {p.method} • {p.date}
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-4">
                                            <span className="text-sm font-black text-white">৳{Number(p.amount || 25000).toLocaleString()}</span>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedReceipt(p)}
                                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg border border-slate-700 transition cursor-pointer flex items-center gap-1.5"
                                            >
                                                <Printer className="w-3.5 h-3.5 text-indigo-400" />
                                                <span>Receipt</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Payment Gateway Modal */}
            <PaymentGatewayModal
                isOpen={showGateway}
                onClose={() => setShowGateway(false)}
                amount={selectedFee.amount}
                semester={selectedFee.title}
                studentInfo={currentUser}
                onPaymentSuccess={handleSuccess}
            />

            {/* Official Money Receipt Modal */}
            {selectedReceipt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden text-slate-900">
                        <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between print:hidden">
                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-emerald-600" />
                                Official Tuition Fee Money Voucher • Student Copy
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => window.print()}
                                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer flex items-center gap-1.5"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>Print Receipt</span>
                                </button>
                                <button
                                    onClick={() => setSelectedReceipt(null)}
                                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-8 sm:p-10 space-y-6">
                            <div className="text-center border-b-2 border-slate-900 pb-5 space-y-1">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-900 text-white font-black text-xl mb-1 shadow-sm">
                                    ICE
                                </div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                                    Imperial College of Engineering
                                </h2>
                                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                                    Office of the Comptroller & Accounts Division • Official Fee Receipt
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                                <div>
                                    <p className="text-slate-500">Transaction ID:</p>
                                    <p className="font-mono font-bold text-slate-900">{selectedReceipt.trxId}</p>
                                    <p className="text-slate-500 mt-1">Method: <strong className="text-slate-800">{selectedReceipt.method}</strong></p>
                                </div>
                                <div className="sm:text-right">
                                    <p className="text-slate-500">Date & Time:</p>
                                    <p className="font-bold text-slate-900">{selectedReceipt.date}</p>
                                    <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-[11px] rounded-lg mt-1 uppercase">
                                        ✓ PAID & VERIFIED
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border border-slate-200 rounded-2xl text-xs">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400">Student Name</p>
                                    <p className="font-bold text-slate-900 mt-0.5">{selectedReceipt.studentName}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400">Student ID</p>
                                    <p className="font-mono font-bold text-indigo-700 mt-0.5">{selectedReceipt.studentId}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400">Department</p>
                                    <p className="font-bold text-slate-900 mt-0.5">{selectedReceipt.department || "ICE"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400">Session</p>
                                    <p className="font-bold text-slate-900 mt-0.5">{selectedReceipt.session || "2024-2025"}</p>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                                <span className="font-bold text-slate-700 text-sm">Total Amount Paid</span>
                                <span className="text-2xl font-black text-indigo-900">৳{Number(selectedReceipt.amount || 25000).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
