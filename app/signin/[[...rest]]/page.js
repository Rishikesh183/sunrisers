'use client';

import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import { motion } from 'framer-motion';

const clerkAppearance = {
    variables: {
        colorPrimary: '#ff6b1a',
        colorBackground: '#1a2332',
        colorText: '#e8ecf1',
        colorTextSecondary: '#8b96a8',
        colorInputBackground: '#0f1419',
        colorInputText: '#e8ecf1',
        borderRadius: '10px',
    },
};

export default function SignInPage() {
    return (
        <motion.div
            className="flex min-h-screen items-center justify-center bg-bg px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            <motion.div
                className="flex flex-col md:flex-row-reverse w-full max-w-4xl bg-surface border border-border shadow-2xl rounded-xl overflow-hidden"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                <motion.div
                    className="w-full md:w-3/5 bg-surface p-6 md:p-10 flex flex-col justify-center items-center text-center"
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <div>
                        <h2 className="text-2xl md:text-3xl font-display text-text mb-4">Welcome Back</h2>
                        <div className="w-full max-w-md">
                            <SignIn path="/signin" routing="path" signUpUrl="/signup" appearance={clerkAppearance} />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="w-full md:w-2/5 bg-bg p-8 md:p-10 flex flex-col justify-center items-center text-center border-t md:border-t-0 md:border-l border-border"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-2xl md:text-3xl font-display text-text">New Here?</h1>
                    <p className="text-textMuted mt-2 md:mt-4">Create an account to start your journey with us.</p>
                    <Link href="/signup" className="mt-5">
                        <motion.button
                            className="px-6 py-2 text-white bg-accent rounded-lg shadow-md hover:bg-accentHover transition duration-300"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Sign Up
                        </motion.button>
                    </Link>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
