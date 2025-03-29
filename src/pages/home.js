import React from 'react';
import { useNavigate } from 'react-router-dom';
import bloodImage from '../assets/images/blood2.png';
import '../styles/home.css';

const Home = () => {
  const navigate = useNavigate();
  
  return (
    <div className="home-container">
      <div className="content-wrapper">
        <img src={bloodImage} alt="Blood" className="blood-image" />
        <h1 className="catchy-title">
          <span className="highlight">Donate</span> Life
        </h1>
        <p className="subtitle">Be a hero, save lives with a single drop.</p>
        <button 
          className="get-started-btn"
          onClick={() => navigate('/dashboard')}
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default Home;
