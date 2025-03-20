import { SignIn } from "@clerk/clerk-react";
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export const SignInPage = () => {
    return (
        <motion.div
            className="flex min-h-screen items-center justify-center bg-gradient-to-r from-orange-500 to-orange-300 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            {/* Responsive Container */}
            <motion.div
                className="flex flex-col md:flex-row-reverse w-full max-w-4xl bg-white shadow-2xl rounded-xl overflow-hidden"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                {/* Left Section - Sign In Form */}
                <motion.div
                    className="w-full md:w-3/5 bg-orange-50 p-6 md:p-10 flex flex-col justify-center items-center text-center"
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <div>

                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Welcome Back</h2>
                        <div className="w-full max-w-md">
                            <SignIn path="/signin" routing="path" signUpUrl="/signup" />
                        </div>
                    </div>
                </motion.div>

                {/* Right Section - Create Account */}
                <motion.div
                    className="w-full md:w-2/5 bg-white p-8 md:p-10 flex flex-col justify-center items-center text-center"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">New Here?</h1>
                    <p className="text-gray-600 mt-2 md:mt-4">Create an account to start your journey with us.</p>
                    <Link to="/signup" className="mt-5">
                        <motion.button
                            className="px-6 py-2 text-white bg-orange-600 rounded-lg shadow-md hover:bg-orange-700 transition duration-300"
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
};

export default SignInPage;
