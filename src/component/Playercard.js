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
        <div
            className="card my-3"
            style={{
                backgroundColor: '#fdf6e4',
                borderRadius: "10px",
                margin: "clamp(0.5rem, 1vw, 1rem)",
                border: "1px solid #f1f1f1",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                width: "100%",
                maxWidth: "300px",
                minWidth:"10vw",
                wordWrap: "break-word",
                display: "flex",
                flexDirection: "column"
            }}
        >
            <div style={{
                position: "relative",
                display: "inline-block",
                backgroundImage: `url(${images.eagle_bgi})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderTopLeftRadius: "10px",
                borderTopRightRadius: "10px",
                width: "100%"
            }}>
                {(props.captain === "Captain") && <img src={images.captain} alt="" style={{ position: "absolute", top: "10px", left: "48px", width: "clamp(20px, 10%, 30px)", height: "auto", zIndex: "1" }} />}
                {(props.country !== "India") && <img src={images.foreign} alt="" style={{ position: "absolute", top: "10px", left: "10px", width: "clamp(20px, 10%, 30px)", height: "auto", zIndex: "1" }} />}
                {(props.role.includes("Wicketkeeper")) && <img src={images.wicketkeeper} alt="" style={{ position: "absolute", top: "10px", right: "10px", width: "clamp(20px, 10%, 30px)", height: "auto", zIndex: "1" }} />}
                {(props.role.includes("All-rounder")) && <img src={images.allrounder} alt="" style={{ position: "absolute", top: "10px", right: "10px", width: "clamp(20px, 10%, 30px)", height: "auto", zIndex: "1" }} />}
                {(props.role === "Bowler") && <img src={images.bowler} alt="" style={{ position: "absolute", top: "10px", right: "10px", width: "clamp(20px, 10%, 30px)", height: "auto", zIndex: "1" }} />}
                {(props.role.includes("Batsman")) && !props.role.includes("Wicketkeeper") && <img src={images.batsman} alt="" style={{ position: "absolute", top: "10px", right: "10px", width: "clamp(20px, 10%, 30px)", height: "auto", zIndex: "1" }} />}
                <img 
                    src={props.imgurl} 
                    alt={props.title} 
                    style={{ 
                        objectFit: "cover", 
                        width: "100%", 
                        height: "auto",
                        aspectRatio: "1 / 1",
                        borderTopLeftRadius: "10px", 
                        borderTopRightRadius: "10px" 
                    }} 
                />
            </div>
            <div className="card-body" style={{ padding: "clamp(0.5rem, 3vw, 1rem)", textAlign: "center", flex: "1" }}>
                <h5 className="card-title" style={{ fontSize: "clamp(1.1rem, 4vw, 1.4rem)", color: "#FF4F00", margin: "0.5rem 0", lineHeight: "1.2" }}>
                    <strong> {props.title} </strong>
                </h5>
                <p className="card-text" style={{ fontSize: "clamp(0.85rem, 3vw, 1rem)", color: "#4B4B4B", margin: "0.2rem 0", lineHeight: "1.5" }}>
                    <strong>Age:</strong> {dob} years old
                </p>
                <p className="card-text" style={{ fontSize: "clamp(0.85rem, 3vw, 1rem)", color: "#4B4B4B", margin: "0.2rem 0", lineHeight: "1.5" }}>
                    <strong>Speciality:</strong> {props.role}
                </p>
                <p className="card-text" style={{ fontSize: "clamp(0.85rem, 3vw, 1rem)", color: "#4B4B4B", margin: "0.2rem 0", lineHeight: "1.5" }}>
                    <strong>Batting:</strong> {props.batting}
                </p>
                <p className="card-text" style={{ fontSize: "clamp(0.85rem, 3vw, 1rem)", color: "#4B4B4B", margin: "0.2rem 0", lineHeight: "1.5" }}>
                    <strong>Bowling:</strong> {props.bowling}
                </p>
                <p className="card-text" style={{ fontSize: "clamp(0.85rem, 3vw, 1rem)", color: "#4B4B4B", margin: "0.2rem 0", lineHeight: "1.5" }}>
                    <strong>IPL Debut:</strong> {props.debut}
                </p>
            </div>
        </div>
    );
}