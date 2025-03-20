import React, { useState } from 'react';
import { Menu, X } from 'lucide-react'; 
import { useUser, UserButton } from "@clerk/clerk-react";
import { Link } from 'react-router-dom';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { isSignedIn } = useUser(); // Correct way to check authentication

    return (
        <nav className="p-3 px-4 w-full z-10 bg-[#333]">
            <div className="flex justify-between items-center">
                <div className="md:hidden">
                    <button onClick={() => setIsOpen(!isOpen)} className="text-white">
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                <ul className={`md:flex text-white gap-4 text-lg list-none ${isOpen ? 'block' : 'hidden'} absolute top-14 left-0 w-full bg-[#333] md:static md:w-auto md:flex md:items-center md:gap-4`}>
                    <li className='hover:text-orange-400 p-2'><a href="/">Home</a></li>
                    <li className='hover:text-orange-400 p-2'><a href="/about">About</a></li>
                    <li className='hover:text-orange-400 p-2'><a href="/news">News</a></li>
                    <li className='hover:text-orange-400 p-2'><a href="/Matches">Matches</a></li>
                    <li className='hover:text-orange-400 p-2'><a href="/players">Players</a></li>
                </ul>

                <div className='md:block'>
                    {isSignedIn ? (
                        <UserButton />
                    ) : (
                        <div className='flex gap-5'>
                            
                            <Link to="/signup">
                                <button className="pt-2 pb-2 px-4 hover:bg-[#e67e22] hover:rounded-[10px] text-white cursor-pointer bg-gradient-to-r from-orange-700 to-orange-400" size="sm">Get Started</button>
                            </Link>
                            
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
