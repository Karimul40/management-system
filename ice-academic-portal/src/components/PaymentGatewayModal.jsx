"use client";

import React, { useState, useEffect } from "react";
import {
    X,
    ShieldCheck,
    CreditCard,
    Smartphone,
    CheckCircle2,
    Lock,
    ArrowRight,
    RotateCcw,
    AlertCircle,
    Building2,
    HelpCircle,
    Info,
    Calendar,
    Tag,
} from "lucide-react";

const FEE_CATEGORIES = [
    { id: "Semester Tuition Fee", label: "Semester Tuition Fee", defaultAmount: 25000, icon: "🎓" },
    { id: "Monthly Fee", label: "Monthly Fee", defaultAmount: 4200, icon: "📅" },
    { id: "Mid-Term Exam Fee", label: "Mid-Term Examination Fee", defaultAmount: 2500, icon: "📝" },
    { id: "Semester Final Exam Fee", label: "Semester Final Exam Fee", defaultAmount: 3500, icon: "📑" },
    { id: "Lab & Library Fee", label: "Lab & Central Library Fee", defaultAmount: 1500, icon: "🔬" },
    { id: "Other University Fee", label: "Other / Special Assessment Fee", defaultAmount: 2000, icon: "💼" },
];

export default function PaymentGatewayModal({
    isOpen,
    onClose,
    amount = 25000,
    semester = "Spring 2026",
    studentInfo = {},
    defaultCategory = "Semester Tuition Fee",
    onPaymentSuccess,
}) {
    const [selectedGateway, setSelectedGateway] = useState("bkash"); // bkash, nagad, card
    const [step, setStep] = useState(1); // 1: Category & Amount + Phone, 2: OTP, 3: PIN, 4: Processing, 5: Success
    const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
    const [payAmount, setPayAmount] = useState(amount || 25000);
    const [isCustomAmount, setIsCustomAmount] = useState(false);
    const [walletNumber, setWalletNumber] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [pin, setPin] = useState("");
    const [timer, setTimer] = useState(45);
    const [errorMsg, setErrorMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [completedPayment, setCompletedPayment] = useState(null);

    // Card Form State
    const [cardData, setCardData] = useState({
        number: "",
        name: "",
        expiry: "",
        cvv: "",
    });

    // Reset when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setSelectedCategory(defaultCategory || "Semester Tuition Fee");
            setPayAmount(amount || 25000);
            setIsCustomAmount(amount !== 25000 && amount > 0);
            setWalletNumber(studentInfo?.phone || "017");
            setOtp(["", "", "", "", "", ""]);
            setPin("");
            setErrorMsg("");
            setTimer(45);
            setCompletedPayment(null);
        }
    }, [isOpen, amount, defaultCategory, studentInfo]);

    // OTP Timer
    useEffect(() => {
        let interval = null;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => setTimer((t) => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    if (!isOpen) return null;

    // Handle Fee Category Selection
    const handleCategoryChange = (catId) => {
        setSelectedCategory(catId);
        const cat = FEE_CATEGORIES.find((c) => c.id === catId);
        if (cat) {
            setPayAmount(cat.defaultAmount);
            setIsCustomAmount(false);
        }
    };

    // Handle Quick Amount Preset Selection
    const handleQuickAmount = (val) => {
        setPayAmount(val);
        setIsCustomAmount(false);
    };

    // Handle OTP Box Input
    const handleOtpChange = (val, index) => {
        if (!/^\d*$/.test(val)) return;
        const newOtp = [...otp];
        newOtp[index] = val.slice(-1);
        setOtp(newOtp);

        // Auto-focus next box
        if (val && index < 5) {
            const nextInput = document.getElementById(`otp-input-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    // Step 1 -> Step 2 (Send OTP)
    const handleProceedToOtp = (e) => {
        e.preventDefault();
        setErrorMsg("");

        const finalNum = Number(payAmount);
        if (!finalNum || finalNum < 500) {
            setErrorMsg("Minimum payment amount is ৳500.");
            return;
        }

        if (selectedGateway === "card") {
            if (cardData.number.replace(/\s/g, "").length < 16) {
                setErrorMsg("Please enter a valid 16-digit card number.");
                return;
            }
            if (!cardData.expiry || !cardData.cvv) {
                setErrorMsg("Please enter card expiry date and CVV.");
                return;
            }
            setStep(2); // Card 3DS OTP
            setTimer(45);
            return;
        }

        // Mobile Banking Validation (11 digits starting with 01)
        const cleanNumber = walletNumber.replace(/[^0-9]/g, "");
        if (cleanNumber.length !== 11 || !cleanNumber.startsWith("01")) {
            setErrorMsg("Please enter a valid 11-digit mobile number (e.g. 017XXXXXXXX).");
            return;
        }

        setStep(2);
        setTimer(45);
    };

    // Step 2 -> Step 3 (Verify OTP)
    const handleVerifyOtp = (e) => {
        e.preventDefault();
        setErrorMsg("");

        const otpCode = otp.join("");
        if (otpCode.length < 6) {
            setErrorMsg("Please enter the 6-digit verification code (e.g. 123456).");
            return;
        }

        if (selectedGateway === "card") {
            executePayment();
        } else {
            setStep(3); // Enter PIN
        }
    };

    // Step 3 -> Step 4 -> Complete (Enter PIN)
    const handleConfirmPin = (e) => {
        e.preventDefault();
        setErrorMsg("");

        if (pin.length < 4) {
            setErrorMsg(`Please enter your valid PIN (e.g. 1234).`);
            return;
        }

        executePayment();
    };

    // Process & Finalize
    const executePayment = () => {
        setIsSubmitting(true);
        setStep(4);

        setTimeout(() => {
            const randomCode = Math.floor(10000000 + Math.random() * 90000000);
            const prefix = selectedGateway === "bkash" ? "BKASH" : selectedGateway === "nagad" ? "NAGAD" : "CARD";
            const trxId = `TRX-${prefix}-${randomCode}`;

            const numericAmount = Number(payAmount) || 25000;
            const dueAfterThis = selectedCategory === "Semester Tuition Fee" ? Math.max(0, 25000 - numericAmount) : 0;

            const paymentRecord = {
                trxId,
                studentId: studentInfo?.studentId || "ICE-2024-001",
                studentName: studentInfo?.fullName || studentInfo?.name || "Student",
                department: studentInfo?.department || "ICE",
                session: studentInfo?.session || "2024-2025",
                semester: semester || studentInfo?.semester || "1/1",
                academicYear: new Date().getFullYear().toString(),
                feeCategory: selectedCategory,
                amount: numericAmount,
                dueRemaining: dueAfterThis,
                remarks: numericAmount < 25000 && selectedCategory === "Semester Tuition Fee" ? "Partial Installment" : "Full Payment",
                method: selectedGateway === "bkash" ? "bKash Online Gateway" : selectedGateway === "nagad" ? "Nagad Direct Checkout" : "Visa/Mastercard Online",
                status: "Completed",
                date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            };

            setCompletedPayment(paymentRecord);
            setIsSubmitting(false);
            setStep(5);

            // Call parent success handler
            if (onPaymentSuccess) {
                onPaymentSuccess(paymentRecord);
            }
        }, 1600);
    };

    // Styles per gateway
    const isBkash = selectedGateway === "bkash";
    const isNagad = selectedGateway === "nagad";
    const isCard = selectedGateway === "card";

    const brandColor = isBkash ? "bg-[#E2136E]" : isNagad ? "bg-[#F7941D]" : "bg-[#1E3A8A]";
    const brandTextColor = isBkash ? "text-[#E2136E]" : isNagad ? "text-[#F7941D]" : "text-[#1E3A8A]";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200 max-h-[92vh]">

                {/* Gateway Brand Top Bar */}
                <div className={`${brandColor} text-white px-5 py-3.5 transition-colors duration-300 relative shrink-0`}>
                    <button
                        onClick={onClose}
                        className="absolute right-3.5 top-3.5 p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white text-slate-900 flex items-center justify-center font-black shadow-md text-base">
                            {isBkash ? (
                                <span className="text-[#E2136E] font-black text-sm">bKash</span>
                            ) : isNagad ? (
                                <span className="text-[#F7941D] font-black text-sm">Nagad</span>
                            ) : (
                                <CreditCard className="w-5 h-5 text-blue-900" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-extrabold text-base tracking-tight leading-snug">
                                {isBkash ? "bKash Payment Gateway" : isNagad ? "Nagad Payment Gateway" : "Card Checkout"}
                            </h3>
                            <p className="text-[11px] text-white/85 font-medium flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Secure Payment • {selectedCategory}
                            </p>
                        </div>
                    </div>

                    {/* Amount Ribbon */}
                    <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between text-xs">
                        <span className="text-white/90">Merchant: <strong className="text-white">ICE Academic Portal</strong></span>
                        <div className="text-right">
                            <span className="text-[10px] text-white/80 block uppercase">Payment Amount</span>
                            <span className="text-lg font-black tracking-tight">৳{Number(payAmount).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Gateway Selector Tabs (Only on Step 1) */}
                {step === 1 && (
                    <div className="grid grid-cols-3 p-1.5 bg-slate-100 border-b border-slate-200 text-xs font-bold shrink-0">
                        <button
                            type="button"
                            onClick={() => { setSelectedGateway("bkash"); setErrorMsg(""); }}
                            className={`py-1.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                                isBkash ? "bg-white text-[#E2136E] shadow-xs font-extrabold" : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            <span>bKash</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => { setSelectedGateway("nagad"); setErrorMsg(""); }}
                            className={`py-1.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                                isNagad ? "bg-white text-[#F7941D] shadow-xs font-extrabold" : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            <span>Nagad</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => { setSelectedGateway("card"); setErrorMsg(""); }}
                            className={`py-1.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                                isCard ? "bg-white text-[#1E3A8A] shadow-xs font-extrabold" : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Card</span>
                        </button>
                    </div>
                )}

                {/* Body Content */}
                <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">

                    {/* Error Banner */}
                    {errorMsg && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700 animate-in fade-in">
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* ================= STEP 1: CATEGORY, AMOUNT & ACCOUNT ================= */}
                    {step === 1 && (
                        <form onSubmit={handleProceedToOtp} className="space-y-4">
                            {/* 1. Fee Category Selector */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                    <Tag className="w-3.5 h-3.5 text-indigo-600" /> Select Fee Category
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                                >
                                    {FEE_CATEGORIES.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.icon} {c.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 2. Amount Input & Quick Preset Pills */}
                            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Amount to Pay
                                    </label>
                                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                                        BDT (৳)
                                    </span>
                                </div>

                                {/* Preset Pills */}
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedCategory === "Semester Tuition Fee" ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => handleQuickAmount(25000)}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                                                    payAmount === 25000 && !isCustomAmount
                                                        ? "bg-indigo-600 text-white border-indigo-600"
                                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                                                }`}
                                            >
                                                Full ৳25,000
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleQuickAmount(13000)}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                                                    payAmount === 13000 && !isCustomAmount
                                                        ? "bg-indigo-600 text-white border-indigo-600"
                                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                                                }`}
                                            >
                                                Partial ৳13,000
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleQuickAmount(10000)}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                                                    payAmount === 10000 && !isCustomAmount
                                                        ? "bg-indigo-600 text-white border-indigo-600"
                                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                                                }`}
                                            >
                                                Partial ৳10,000
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleQuickAmount(5000)}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                                                    payAmount === 5000 && !isCustomAmount
                                                        ? "bg-indigo-600 text-white border-indigo-600"
                                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                                                }`}
                                            >
                                                Partial ৳5,000
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => handleQuickAmount(FEE_CATEGORIES.find(c => c.id === selectedCategory)?.defaultAmount || 2500)}
                                            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 text-white border border-indigo-600"
                                        >
                                            Standard ৳{FEE_CATEGORIES.find(c => c.id === selectedCategory)?.defaultAmount.toLocaleString()}
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => setIsCustomAmount(true)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                                            isCustomAmount
                                                ? "bg-amber-500 text-white border-amber-500"
                                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                                        }`}
                                    >
                                        Custom Amount ✏️
                                    </button>
                                </div>

                                {/* Amount Input Box */}
                                <div className="relative">
                                    <span className="absolute left-3.5 top-2.5 text-base font-bold text-slate-500">৳</span>
                                    <input
                                        type="number"
                                        min="500"
                                        max="100000"
                                        step="100"
                                        value={payAmount}
                                        onChange={(e) => {
                                            setPayAmount(e.target.value);
                                            setIsCustomAmount(true);
                                        }}
                                        className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 font-extrabold text-base text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none bg-white"
                                        required
                                    />
                                </div>

                                {selectedCategory === "Semester Tuition Fee" && Number(payAmount) < 25000 && (
                                    <p className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
                                        <Info className="w-3.5 h-3.5 shrink-0" />
                                        Partial payment: ৳{Number(payAmount).toLocaleString()} now, remaining due will be ৳{(25000 - Number(payAmount)).toLocaleString()} (payable anytime).
                                    </p>
                                )}
                            </div>

                            {/* 3. Account / Card details */}
                            {isCard ? (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                            Card Number
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="4123 •••• •••• 8910"
                                                maxLength="19"
                                                value={cardData.number}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
                                                    setCardData({ ...cardData, number: val });
                                                }}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-3 focus:ring-blue-100 text-sm font-mono outline-none"
                                                required
                                            />
                                            <CreditCard className="w-5 h-5 text-slate-400 absolute right-3 top-3" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                                Expiry
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="MM/YY"
                                                maxLength="5"
                                                value={cardData.expiry}
                                                onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                                CVV
                                            </label>
                                            <input
                                                type="password"
                                                placeholder="•••"
                                                maxLength="4"
                                                value={cardData.cvv}
                                                onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono outline-none"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                            Your {isBkash ? "bKash" : "Nagad"} Account Number
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="tel"
                                                placeholder="e.g. 017XXXXXXXX"
                                                maxLength="11"
                                                value={walletNumber}
                                                onChange={(e) => setWalletNumber(e.target.value)}
                                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-3 focus:ring-indigo-100 text-sm font-mono tracking-wider outline-none transition"
                                                required
                                            />
                                            <Smartphone className="w-5 h-5 text-slate-400 absolute right-3 top-3" />
                                        </div>
                                        <p className="text-[11px] text-slate-500 mt-1">
                                            A 6-digit verification OTP will be sent to this number.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                className={`w-full py-3.5 ${brandColor} text-white font-extrabold text-sm rounded-xl shadow-lg hover:brightness-105 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer`}
                            >
                                <span>Proceed to Pay ৳{Number(payAmount).toLocaleString()}</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    )}

                    {/* ================= STEP 2: ENTER OTP ================= */}
                    {step === 2 && (
                        <form onSubmit={handleVerifyOtp} className="space-y-4 text-center">
                            <div className="space-y-1">
                                <h4 className="text-base font-extrabold text-slate-900">
                                    Enter Verification Code
                                </h4>
                                <p className="text-xs text-slate-500">
                                    We sent a 6-digit OTP code to <strong>{walletNumber || "your phone"}</strong>
                                </p>
                                <p className="text-[11px] text-emerald-600 font-bold bg-emerald-50 py-0.5 px-2 rounded-full inline-block">
                                    💡 Demo OTP: Enter 123456
                                </p>
                            </div>

                            <div className="flex justify-center gap-1.5 sm:gap-2 my-2">
                                {otp.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        id={`otp-input-${idx}`}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(e.target.value, idx)}
                                        className="w-10 h-12 sm:w-11 sm:h-13 text-center text-lg sm:text-xl font-bold font-mono border-2 border-slate-300 rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                                    />
                                ))}
                            </div>

                            <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
                                {timer > 0 ? (
                                    <span>Resend OTP code in <strong>{timer}s</strong></span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => { setTimer(45); setOtp(["", "", "", "", "", ""]); }}
                                        className={`${brandTextColor} font-bold hover:underline cursor-pointer flex items-center gap-1`}
                                    >
                                        <RotateCcw className="w-3 h-3" /> Resend Code
                                    </button>
                                )}
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="w-1/3 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs rounded-xl transition cursor-pointer"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className={`w-2/3 py-3 ${brandColor} text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition active:scale-95 cursor-pointer`}
                                >
                                    Verify & Continue
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ================= STEP 3: ENTER PIN ================= */}
                    {step === 3 && (
                        <form onSubmit={handleConfirmPin} className="space-y-4 text-center">
                            <div className="space-y-1">
                                <h4 className="text-base font-extrabold text-slate-900">
                                    Enter {isBkash ? "bKash" : "Nagad"} PIN
                                </h4>
                                <p className="text-xs text-slate-500">
                                    Enter your 5-digit PIN to confirm <strong>৳{Number(payAmount).toLocaleString()}</strong> for <em>{selectedCategory}</em>
                                </p>
                                <p className="text-[11px] text-emerald-600 font-bold bg-emerald-50 py-0.5 px-2 rounded-full inline-block">
                                    💡 Demo PIN: Enter 1234
                                </p>
                            </div>

                            <div className="max-w-[200px] mx-auto my-3 relative">
                                <input
                                    type="password"
                                    inputMode="numeric"
                                    maxLength="5"
                                    placeholder="•••••"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                                    className="w-full py-3 text-center text-2xl font-black font-mono tracking-widest border-2 border-slate-300 rounded-2xl focus:border-slate-900 outline-none transition"
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className="flex gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="w-1/3 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs rounded-xl transition cursor-pointer"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className={`w-2/3 py-3.5 ${brandColor} text-white font-black text-sm rounded-xl shadow-lg transition active:scale-95 cursor-pointer`}
                                >
                                    Confirm Payment
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ================= STEP 4: PROCESSING ================= */}
                    {step === 4 && (
                        <div className="py-8 text-center space-y-4 animate-in fade-in">
                            <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-pink-600 animate-spin mx-auto" />
                            <div className="space-y-1">
                                <h4 className="text-base font-extrabold text-slate-900">Processing Payment...</h4>
                                <p className="text-xs text-slate-500">Securing transaction of ৳{Number(payAmount).toLocaleString()}</p>
                                <p className="text-[11px] text-slate-400">Please do not close or refresh this window</p>
                            </div>
                        </div>
                    )}

                    {/* ================= STEP 5: SUCCESS CHECKMARK ================= */}
                    {step === 5 && (
                        <div className="py-5 text-center space-y-3.5 animate-in zoom-in-95 duration-200">
                            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30 ring-8 ring-emerald-50">
                                <CheckCircle2 className="w-9 h-9" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xl font-black text-slate-900">Payment Successful!</h4>
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-1.5 my-2">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 font-medium">Fee Category:</span>
                                        <span className="font-bold text-slate-900">{selectedCategory}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 font-medium">Amount Paid:</span>
                                        <span className="font-extrabold text-emerald-700">৳{Number(payAmount).toLocaleString()}</span>
                                    </div>
                                    {completedPayment?.dueRemaining > 0 && (
                                        <div className="flex justify-between text-amber-700 font-bold border-t border-slate-200/80 pt-1">
                                            <span>Remaining Due for Semester:</span>
                                            <span>৳{completedPayment.dueRemaining.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-[11px] text-slate-400 border-t border-slate-200/80 pt-1 font-mono">
                                        <span>Transaction ID:</span>
                                        <span className="text-slate-700">{completedPayment?.trxId}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition cursor-pointer"
                            >
                                View Official Money Receipt
                            </button>
                        </div>
                    )}

                </div>

                {/* Footer Security Badges */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-medium shrink-0">
                    <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        PCI-DSS Compliant Gateway
                    </span>
                    <span>Imperial College of Engineering</span>
                </div>

            </div>
        </div>
    );
}