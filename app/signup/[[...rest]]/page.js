'use client';

import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { clerkAppearance } from '../../../lib/clerkAppearance';

export default function SignUpPage() {
  // Sub-steps of an in-progress sign-up (e.g. /signup/continue after Google asks for a username,
  // or email verification). Mid-flow, a "Sign In" / "Already have an account?" prompt only
  // confuses people - it would abandon the sign-up - so those are hidden on these routes.
  const pathname = usePathname();
  const isStep = pathname.startsWith('/signup/');
  const appearance = isStep
    ? { ...clerkAppearance, elements: { ...clerkAppearance.elements, footerAction: 'hidden' } }
    : clerkAppearance;

  return (
    <motion.div
      className="pt-8 flex min-h-screen items-center justify-center bg-bg px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="flex flex-col md:flex-row w-full max-w-4xl bg-surface border border-border shadow-2xl rounded-xl overflow-hidden"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {!isStep && (
        <motion.div
          className="w-full md:w-2/5 bg-bg p-10 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-border"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl md:text-3xl font-display text-text">Welcome Back</h1>
          <p className="text-textMuted mt-2 md:mt-4">Already have an account? Sign in to continue your journey.</p>
          <Link href="/signin" className="mt-5">
            <motion.button
              className="px-6 py-2 text-white bg-accent rounded-lg shadow-md hover:bg-accentHover transition duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign In
            </motion.button>
          </Link>
        </motion.div>
        )}

        <motion.div
          className={`w-full bg-surface p-6 md:p-10 ${isStep ? '' : 'md:w-3/5'} flex flex-col justify-center items-center`}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-full max-w-md">
            <h2 className="text-2xl md:text-3xl font-display text-text mb-4">
              {isStep ? 'Almost there' : 'Don’t have an Account?'}
            </h2>
            <SignUp
              path="/signup"
              routing="path"
              signInUrl="/signin"
              fallbackRedirectUrl="/"
              appearance={appearance}
            />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
