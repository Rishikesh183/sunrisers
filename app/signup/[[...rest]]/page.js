'use client';

import { SignUp } from '@clerk/nextjs';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SignUpPage() {
  return (
    <motion.div
      className=" pt-8 flex min-h-screen items-center justify-center bg-gradient-to-r from-orange-500 to-orange-300 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="flex flex-col md:flex-row w-full max-w-4xl bg-white shadow-2xl rounded-xl overflow-hidden"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="w-full md:w-2/5 bg-white p-10 flex flex-col justify-center items-center text-center"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-600 mt-2 md:mt-4">Already have an account? Sign in to continue your journey.</p>
          <Link href="/signin" className="mt-5">
            <motion.button
              className="px-6 py-2 text-white bg-orange-600 rounded-lg shadow-md hover:bg-orange-700 transition duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sign In
            </motion.button>
          </Link>
        </motion.div>

        <motion.div
          className="w-full md:w-3/5 bg-orange-50 p-6 md:p-10 flex flex-col justify-center items-center"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-full max-w-md">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Don&apos;t have an Account?</h2>
            <SignUp path="/signup" routing="path" signInUrl="/signin" />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
