// WARNING: Storing API keys in the frontend is for prototyping only.
// Paste your AQ API Key inside the quotes below.

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

const systemPrompt = `You are the MTN MoMo Travel AI Planner. Your job is to take the traveler's parameters and generate a structured JSON response containing multiple travel options.
CRITICAL RULES:
1. ONLY output valid JSON. No markdown formatting, no conversational text.
2. The total estimated cost must respect the user's ZAR budget.
3. For all images, generate a relevant Unsplash Source URL (e.g., "https://source.unsplash.com/800x600/?hotel,capetown").
4. Follow this exact JSON schema:
{
  "tripSummary": { "destination": "", "totalBudget": 0, "currency": "ZAR" },
  "accommodation": [ { "id": "", "name": "", "type": "", "pricePerNight": 0, "rating": 0.0, "image": "", "description": "" } ]
}`;

document.querySelector('.planner-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const destination = document.getElementById('destination').value;
    const dates = document.getElementById('dates').value;
    const travelers = document.getElementById('travelers').value;
    const budget = document.getElementById('budget-slider').value;
    const interests = Array.from(document.querySelectorAll('.interest-pill.active'))
                           .map(pill => pill.innerText.trim());

    const userPrompt = `
        Generate a travel plan:
        Destination: ${destination}
        Dates: ${dates}
        Travelers: ${travelers}
        Interests: ${interests.join(', ')}
        Budget: R${budget} ZAR
    `;

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating Plan...';
    submitBtn.disabled = true;

    try {
        // Utilizing the reliable gemini-3.5-flash model endpoint to prevent 404 errors
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents: [{ parts: [{ text: userPrompt }] }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Google AI Studio Error:", errorData);
            throw new Error('API request failed');
        }

        const data = await response.json();
        
        let jsonString = data.candidates[0].content.parts[0].text;
        jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '');
        const tripData = JSON.parse(jsonString);

        renderResultsDashboard(tripData);

    } catch (error) {
        console.error("Error generating trip:", error);
        submitBtn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Try Again';
        submitBtn.disabled = false;
    }
});

function renderResultsDashboard(data) {
    const mainContainer = document.querySelector('.split-layout');
    
    mainContainer.innerHTML = `
        <div class="results-dashboard" style="padding: 3rem; width: 100%; overflow-y: auto; background: #F5F5F7;">
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <div>
                    <h2 style="font-size: 2rem; font-weight: 800;">Your ${data.tripSummary.destination} Options</h2>
                    <p style="color: #666; font-size: 1.1rem;">Budget: R${Number(data.tripSummary.totalBudget).toLocaleString()} ZAR</p>
                </div>
                <button onclick="location.reload()" style="background: #fff; border: 1px solid #ddd; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer;">
                    Start Over
                </button>
            </div>
            
            <h3 style="font-size: 1.5rem; margin-bottom: 1rem; color: #000; border-bottom: 3px solid #FFCC00; display: inline-block; padding-bottom: 4px;">Accommodation</h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; margin-bottom: 3rem;">
                ${data.accommodation.map(acc => `
                    <div style="background: #fff; border: 1px solid #E0E0E0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                        <img src="${acc.image}" alt="${acc.name}" style="width: 100%; height: 220px; object-fit: cover;">
                        <div style="padding: 1.5rem;">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                                <span style="background: #000; color: #FFCC00; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: bold;">${acc.type}</span>
                                <span style="font-weight: bold; color: #666;"><i class="fa-solid fa-star" style="color: #FFCC00;"></i> ${acc.rating}</span>
                            </div>
                            <h4 style="font-size: 1.2rem; margin: 0.5rem 0;">${acc.name}</h4>
                            <p style="color: #666; font-size: 0.9rem; line-height: 1.5;">${acc.description}</p>
                            
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #eee;">
                                <div style="display: flex; flex-direction: column;">
                                    <span style="font-size: 0.8rem; color: #666;">Est. Price</span>
                                    <strong style="font-size: 1.1rem;">R${Number(acc.pricePerNight).toLocaleString()} <span style="font-size: 0.8rem; font-weight: normal;">/ night</span></strong>
                                </div>
                                <button style="background: #FFCC00; color: #000; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; cursor: pointer;">
                                    Select & Pay
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            
        </div>
    `;
}