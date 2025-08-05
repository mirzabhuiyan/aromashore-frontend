import React, { useState, useEffect } from 'react';
import styles from './PromotionalPopup.module.css';

const PromotionalPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Development helper - remove in production
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      window.resetPromotionalPopup = () => {
        localStorage.removeItem('promotionalPopupDismissed');
        window.location.reload();
      };
    }
  }, []);

  useEffect(() => {
    // Check if popup has been dismissed before
    const hasSeenPopup = localStorage.getItem('promotionalPopupDismissed');
    if (!hasSeenPopup) {
      // Show popup after 2 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isVisible) {
        handleClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setIsLoading(true);
      try {
        // Here you would typically make an API call to subscribe the email
        // For now, we'll just simulate success
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        setIsSubscribed(true);
        setTimeout(() => {
          handleClose();
        }, 2000);
      } catch (error) {
        console.error('Subscription error:', error);
        alert('Failed to subscribe. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('promotionalPopupDismissed', 'true');
  };

  const handleNoThanks = () => {
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <button className={styles.closeButton} onClick={handleClose}>
          ×
        </button>
        
        <div className={styles.popupContent}>
          {/* Left Section - Product Image */}
          <div className={styles.imageSection}>
            <div className={styles.productImage}>
              <img 
                src="/app/assets/images/placeholder-image.png" 
                alt="Aroma Shore Essential Oil Rollerball"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className={styles.placeholderImage}>
                <div className={styles.bottle}>
                  <div className={styles.cap}></div>
                  <div className={styles.label}>
                    <div className={styles.logo}></div>
                    <div className={styles.brandName}>AROMA SHORE</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Promotional Content */}
          <div className={styles.contentSection}>
            <h2 className={styles.headline}>
              Get <strong>10% OFF</strong> your first oil order!
            </h2>
            <p className={styles.description}>
              Join our email list to receive updates and exclusive offers.
            </p>
            
            {!isSubscribed ? (
              <form onSubmit={handleSubscribe} className={styles.form}>
                <input
                  type="email"
                  placeholder="Email address*"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.emailInput}
                  required
                />
                <button 
                  type="submit" 
                  className={styles.subscribeButton}
                  disabled={isLoading}
                >
                  {isLoading ? 'Subscribing...' : 'Subscribe'}
                </button>
                <button 
                  type="button" 
                  onClick={handleNoThanks}
                  className={styles.noThanksButton}
                >
                  No Thanks
                </button>
              </form>
            ) : (
              <div className={styles.successMessage}>
                Thank you for subscribing! Check your email for your discount code.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          Powered by AfterShip
        </div>
      </div>
    </div>
  );
};

export default PromotionalPopup; 