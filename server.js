async function cancelTrip(tripId) {
  let trips = getTrips();
  const tripToCancel = trips.find(t => t.id === tripId);
  
  if (!tripToCancel) return;

  // For sandbox testing, use an approved test MSISDN
  const testMobileNumber = "46733123453"; // Example MoMo test number

  showNotification("Initiating MoMo refund...");
  
  // Disable the specific cancel button to prevent duplicate requests
  const tripCardItems = document.querySelector(`#items-${tripId}`);
  if(tripCardItems) {
      const btn = tripCardItems.parentElement.querySelector('.cancel-trip-btn');
      if(btn) btn.disabled = true;
  }

  try {
      const response = await fetch('http://localhost:3000/api/disburse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              amount: tripToCancel.total,
              mobileNumber: testMobileNumber,
              reference: `REF-${tripId}`,
              note: "Trip Cancellation Refund"
          })
      });

      const result = await response.json();

      if (result.success) {
          trips = trips.filter(trip => trip.id !== tripId);
          if (typeof setTrips === 'function') {
            setTrips(trips);
          } else {
            localStorage.setItem('trips', JSON.stringify(trips)); 
          }
          
          renderTrips();
          showNotification("Trip canceled and R" + tripToCancel.total + " refunded via MoMo.");
      } else {
          showNotification("Refund failed: " + result.error);
          
          if(tripCardItems) {
              const btn = tripCardItems.parentElement.querySelector('.cancel-trip-btn');
              if(btn) btn.disabled = false;
          }
      }
  } catch (error) {
      console.error(error);
      showNotification("Connection error during MoMo refund.");
      
      if(tripCardItems) {
          const btn = tripCardItems.parentElement.querySelector('.cancel-trip-btn');
          if(btn) btn.disabled = false;
      }
  }
}