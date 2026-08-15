'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useUser, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { isSignedIn } = useUser();

    return (
        <nav className="sticky top-0 z-20 border-b border-border bg-bg/95 backdrop-blur px-4 py-3">
            <div className="flex justify-between items-center">
                <Link href="/" className="font-display text-lg tracking-wide text-accent hidden md:block">
                    SRH
                </Link>

                <div className="md:hidden">
                    <button onClick={() => setIsOpen(!isOpen)} className="text-text">
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                <ul className={`md:flex text-text gap-2 text-base font-medium list-none ${isOpen ? 'block' : 'hidden'} absolute top-14 left-0 w-full bg-bg border-b border-border md:border-none md:static md:w-auto md:flex md:items-center md:gap-2`}>
                    <li className='hover:text-accent hover:bg-surface transition-colors rounded-lg p-2 px-3'><Link href="/">Home</Link></li>
                    <li className='hover:text-accent hover:bg-surface transition-colors rounded-lg p-2 px-3'><Link href="/about">About</Link></li>
                    <li className='hover:text-accent hover:bg-surface transition-colors rounded-lg p-2 px-3'><Link href="/news">News</Link></li>
                    <li className='hover:text-accent hover:bg-surface transition-colors rounded-lg p-2 px-3'><Link href="/Matches">Matches</Link></li>
                    <li className='hover:text-accent hover:bg-surface transition-colors rounded-lg p-2 px-3'><Link href="/players">Players</Link></li>
                    <li className='hover:text-accent hover:bg-surface transition-colors rounded-lg p-2 px-3'><Link href="/300par">300 Par</Link></li>
                </ul>

                <div className='md:block'>
                    {isSignedIn ? (
                        <UserButton />
                    ) : (
                        <div className='flex gap-5'>
                            <Link href="/signup">
                                <button className="py-2 px-4 rounded-lg text-white cursor-pointer bg-accent hover:bg-accentHover transition-colors font-semibold">Get Started</button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
