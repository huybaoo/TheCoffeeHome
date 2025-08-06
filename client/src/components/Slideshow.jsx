import React, { useState, useEffect, useCallback } from 'react';
import '../css/Slideshow.css';

const Slideshow = () => {
    const images = [
        'https://file.hstatic.net/1000075078/file/web_moi_-_desktop_7c6b8fcb3d284b90a5b0cb8d1715f2eb.jpg',
        'https://file.hstatic.net/1000075078/file/desktop_b4d40895f4b24d0880675b23b0031204.jpg',
        'https://file.hstatic.net/1000075078/file/web_moi_-_desktop_c7bdb50169c34df895558decdc6a6b9d.jpg',
        'https://file.hstatic.net/1000075078/file/desktop_c739d6f750984ae48cf1f8a7d1059645.jpg',
        'https://file.hstatic.net/1000075078/file/web_moi_-_desktop_46f7318756a7425aa08d62eec781e4e8.jpg'
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = useCallback(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, [images.length]);

    useEffect(() => {
        const interval = setInterval(handleNext, 3000);

        return () => clearInterval(interval);
    }, [handleNext]);

    const handlePrev = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    };

    const handleCircleClick = (index) => {
        setCurrentIndex(index);
    };

    return (
        <div className="slideshow">
            <button className="prev" onClick={handlePrev}>❮</button>
            <div className="slideshow-container" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                {images.map((image, index) => (
                    <img key={index} src={image} alt={`Slide ${index + 1}`} />
                ))}
            </div>
            <button className="next" onClick={handleNext}>❯</button>
            <div className="indicator-container">
                {images.map((_, index) => (
                    <div 
                        key={index} 
                        className={`circle ${currentIndex === index ? 'active' : ''}`} 
                        onClick={() => handleCircleClick(index)} 
                    />
                ))}
            </div>
        </div>
    );
};

export default Slideshow;