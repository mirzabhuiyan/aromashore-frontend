# Promotional Popup Component

This component creates a promotional popup that appears when users first visit the website, encouraging them to subscribe to the email list for exclusive offers.

## Features

- **Automatic Display**: Shows after 2 seconds on first visit
- **Email Subscription**: Collects email addresses with validation
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Accessibility**: Keyboard navigation and screen reader support
- **Dismissible**: Users can close via X button, "No Thanks", or Escape key
- **Persistent State**: Remembers if user has dismissed the popup
- **Loading States**: Shows loading indicator during subscription
- **Success Feedback**: Displays confirmation message after subscription

## Usage

The popup is automatically included in the main app (`_app.js`) and will appear on all pages.

### Development Testing

To test the popup during development, open the browser console and run:

```javascript
window.resetPromotionalPopup()
```

This will clear the dismissal flag and reload the page to show the popup again.

## Customization

### Content

Edit the content in `PromotionalPopup.jsx`:

- **Headline**: Change the main offer text
- **Description**: Modify the call-to-action text
- **Product Image**: Update the image path or use the placeholder
- **Footer**: Customize the "Powered by AfterShip" text

### Styling

Modify `PromotionalPopup.module.css` to customize:

- Colors and typography
- Layout and spacing
- Animations and transitions
- Responsive breakpoints

### Behavior

Adjust the timing and behavior in `PromotionalPopup.jsx`:

- **Display Delay**: Change the 2-second delay before showing
- **Auto-close**: Modify the success message display time
- **Validation**: Update email validation logic
- **API Integration**: Replace the mock subscription with real API calls

## API Integration

To connect with a real email subscription service, replace the mock API call in the `handleSubscribe` function:

```javascript
const handleSubscribe = async (e) => {
  e.preventDefault();
  if (email && email.includes('@')) {
    setIsLoading(true);
    try {
      // Replace with your actual API endpoint
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        setIsSubscribed(true);
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        throw new Error('Subscription failed');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }
};
```

## File Structure

```
components/common/
├── PromotionalPopup.jsx          # Main component
├── PromotionalPopup.module.css   # Styles
└── PROMOTIONAL_POPUP_README.md   # This documentation
```

## Browser Support

- Modern browsers with CSS Grid and Flexbox support
- Mobile browsers (iOS Safari, Chrome Mobile)
- Keyboard navigation support
- Screen reader compatibility

## Performance

- Lightweight component with minimal dependencies
- Uses CSS animations for smooth transitions
- Prevents background scrolling when popup is open
- Efficient state management with React hooks 