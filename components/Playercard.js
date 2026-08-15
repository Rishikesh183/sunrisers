import React from 'react';
import images from './images.js';

function calculateAge(dob) {
    const [day, month, year] = dob.split('-').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

export default function PlayerCard(props) {
    const dob = calculateAge(props.Age);

    return (
        <div className="card my-3 bg-surface border border-border rounded-xl m-2 w-full max-w-[300px] min-w-[10vw] break-words flex flex-col overflow-hidden transition-colors hover:border-accent/40 hover:bg-surfaceHover">
            <div
                className="relative inline-block w-full bg-cover bg-center rounded-t-xl"
                style={{ backgroundImage: `url(${images.eagle_bgi})` }}
            >
                {(props.captain === "Captain") && <img src={images.captain} alt="" className="absolute top-2.5 left-12 w-[clamp(20px,10%,30px)] h-auto z-10" />}
                {(props.country !== "India") && <img src={images.foreign} alt="" className="absolute top-2.5 left-2.5 w-[clamp(20px,10%,30px)] h-auto z-10" />}
                {(props.role.includes("Wicketkeeper")) && <img src={images.wicketkeeper} alt="" className="absolute top-2.5 right-2.5 w-[clamp(20px,10%,30px)] h-auto z-10" />}
                {(props.role.includes("All-rounder")) && <img src={images.allrounder} alt="" className="absolute top-2.5 right-2.5 w-[clamp(20px,10%,30px)] h-auto z-10" />}
                {(props.role === "Bowler") && <img src={images.bowler} alt="" className="absolute top-2.5 right-2.5 w-[clamp(20px,10%,30px)] h-auto z-10" />}
                {(props.role.includes("Batsman")) && !props.role.includes("Wicketkeeper") && <img src={images.batsman} alt="" className="absolute top-2.5 right-2.5 w-[clamp(20px,10%,30px)] h-auto z-10" />}
                <img
                    src={props.imgurl}
                    alt={props.title}
                    className="object-cover w-full h-auto aspect-square rounded-t-xl"
                />
            </div>
            <div className="card-body p-3 sm:p-4 text-center flex-1">
                <h5 className="card-title text-lg sm:text-xl font-display text-accent my-2 leading-tight">
                    {props.title}
                </h5>
                <p className="card-text text-sm sm:text-base text-textMuted my-1 leading-relaxed">
                    <strong className="text-text">Age:</strong> {dob} years old
                </p>
                <p className="card-text text-sm sm:text-base text-textMuted my-1 leading-relaxed">
                    <strong className="text-text">Speciality:</strong> {props.role}
                </p>
                <p className="card-text text-sm sm:text-base text-textMuted my-1 leading-relaxed">
                    <strong className="text-text">Batting:</strong> {props.batting}
                </p>
                <p className="card-text text-sm sm:text-base text-textMuted my-1 leading-relaxed">
                    <strong className="text-text">Bowling:</strong> {props.bowling}
                </p>
                <p className="card-text text-sm sm:text-base text-textMuted my-1 leading-relaxed">
                    <strong className="text-text">IPL Debut:</strong> {props.debut}
                </p>
            </div>
        </div>
    );
}
