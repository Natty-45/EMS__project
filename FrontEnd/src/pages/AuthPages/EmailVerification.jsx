import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";
import useVerifyEmail from "../../hooks/authHooks/useVerifyEmail";
import { EnvelopeIcon, ArrowPathIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

const EmailVerificationPage = () => {
    const { theme } = useTheme();
    const { loading, error, verifyEmail, useResendCode } = useVerifyEmail();
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef([]);
    const email = "user@example.com"; // Replace with the actual email
    const { canResend, resendCooldown, resendVerificationCode } = useResendCode(email);

    // Handle change for the code inputs
    const handleChange = (index, value) => {
        const newCode = [...code];

        // Handle pasted content
        if (value.length > 1) {
            const pastedCode = value.slice(0, 6).split("");
            for (let i = 0; i < 6; i++) {
                newCode[i] = pastedCode[i] || "";
            }
            setCode(newCode);

            // Focus on the last non-empty input or the first empty one
            const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
            const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
            inputRefs.current[focusIndex].focus();
        } else {
            newCode[index] = value;
            setCode(newCode);

            // Move focus to the next input field if value is entered
            if (value && index < 5) {
                inputRefs.current[index + 1].focus();
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const verificationCode = code.join("");
        await verifyEmail(verificationCode);
    };

    return (
        <div className={`relative min-h-screen flex items-center justify-center overflow-hidden ${theme.background}`}>
            <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-500/25 blur-[130px] animate-float-slow" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-brand-500/20 blur-[130px] animate-float-slow" />

            <motion.div
                initial={{ opacity: 0, y: -40, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="relative z-10 w-full max-w-md px-4 pt-24 pb-16"
            >
                <div className={`relative overflow-hidden rounded-[2rem] ${theme.card} border ${theme.border} p-8 shadow-2xl shadow-brand-500/10 backdrop-blur-xl sm:p-10`}>
                    <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-gradient-to-br from-brand-600 to-brand-400 opacity-10 blur-2xl" />

                    <div className="relative mb-8 text-center">
                        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-400 shadow-lg shadow-brand-500/30">
                            <ShieldCheckIcon className="h-7 w-7 text-white" />
                        </span>
                        <h2 className={`mt-5 font-display text-2xl font-bold ${theme.text}`}>Verify Your Email</h2>
                        <p className={`mt-1 text-sm ${theme.textSecondary}`}>
                            Enter the 6-digit code sent to your email address.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="relative space-y-6">
                        <div className="flex justify-between gap-2">
                            {code.map((digit, index) => (
                                <motion.input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    whileFocus={{ scale: 1.1 }}
                                    className={`h-12 w-12 rounded-xl border-2 bg-white/70 text-center font-display text-2xl font-bold text-slate-900 outline-none transition-all duration-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/20 dark:bg-white/5 dark:text-white dark:border-white/10`}
                                />
                            ))}
                        </div>

                        {error && (
                            <motion.p
                                className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-500"
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {error}
                            </motion.p>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            type="submit"
                            disabled={loading || code.some((digit) => !digit)}
                            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <EnvelopeIcon className="h-5 w-5" />
                                    Verify Email
                                </>
                            )}
                        </motion.button>

                        <div className="text-center">
                            {canResend ? (
                                <motion.button
                                    onClick={resendVerificationCode}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="btn-ghost w-full"
                                >
                                    <ArrowPathIcon className="h-5 w-5" />
                                    Send Code Again
                                </motion.button>
                            ) : (
                                <p className={`text-sm ${theme.textSecondary}`}>
                                    You can request a new code in{" "}
                                    <span className="font-bold text-brand-500">{resendCooldown}s</span>
                                </p>
                            )}
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default EmailVerificationPage;