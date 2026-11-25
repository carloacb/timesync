// Initialize Day.js Plugins
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

// Config: add new timezones here
// Search for "IANA timezone formats" online for reference
const timezones = [
    { id: 'utc', label: 'Universal Time (UTC)', tz: 'UTC' },
    { id: 'et', label: 'Eastern Time (ET)', tz: 'America/New_York' },
    { id: 'pht', label: 'Philippine Time (PHT)', tz: 'Asia/Manila' },
    { id: 'ist', label: 'India Time (IST)', tz: 'Asia/Kolkata' }
];

let currentReferenceTime = dayjs(); // Stores the universal current time
let is24Hour = false;               // Default is 12-hour format

const container = document.getElementById('timezone-container');
const formatToggle = document.getElementById('format-toggle');

// Core Logic
function buildUI() {
    container.innerHTML = '';

    timezones.forEach(zone => {
        const card = document.createElement('div');
        card.className = 'tz-card';

        // Generate options for hours (1-12 or 00-23)
        let hourOptions = '';
        if (is24Hour) {
            for (let i = 0; i < 24; i++) hourOptions += `<option value="${i}">${String(i).padStart(2, '0')}</option>`;
        } else {
            for (let i = 1; i <= 12; i++) hourOptions += `<option value="${i}">${String(i).padStart(2, '0')}</option>`;
        }

        // Generate options for minutes (00-59)
        let minOptions = '';
        for (let i = 0; i < 60; i++) minOptions += `<option value="${i}">${String(i).padStart(2, '0')}</option>`;

        // Build HTML for the card
        card.innerHTML = `
            <div class="card-header">
                <div class="header-meta">
                    <h2>${zone.label}</h2>
                    <small class="tz-id">${zone.tz}</small>
                </div>
            </div>
            <div class="input-row">
                <input type="date" id="date-${zone.id}">
                <div class="time-selectors">
                <select id="hour-${zone.id}">${hourOptions}</select>
                <span class="separator">:</span>
                <select id="minute-${zone.id}">${minOptions}</select>
                ${!is24Hour ? `<select id="ampm-${zone.id}"><option value="AM">AM</option><option value="PM">PM</option></select>` : ''}
                </div>
            </div>
        `;
        container.appendChild(card);

        // Attach event listeners to all inputs in this card
        const inputs = card.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => handleUserInput(zone));
        });
    });

    updateValues();
}

function handleUserInput(sourceZone) {
    const dateVal = document.getElementById(`date-${sourceZone.id}`).value;
    let hrVal = parseInt(document.getElementById(`hour-${sourceZone.id}`).value, 10);
    const minVal = document.getElementById(`minute-${sourceZone.id}`).value;

    // Convert 12-hour selection to 24-hour internally for processing
    if (!is24Hour) {
        const ampmVal = document.getElementById(`ampm-${sourceZone.id}`).value;
        if (ampmVal === 'PM' && hrVal !== 12) hrVal += 12;
        if (ampmVal === 'AM' && hrVal === 12) hrVal = 0;
    }

    // Construct a string and tell Day.js what timezone it originated from
    const dateTimeString = `${dateVal} ${String(hrVal).padStart(2, '0')}:${minVal}:00`;

    // Update our universal reference time based on the user's specific input and timezone
    currentReferenceTime = dayjs.tz(dateTimeString, "YYYY-MM-DD HH:mm:ss", sourceZone.tz);

    // Update all other cards
    updateValues(sourceZone.id);
}

function updateValues(skipId = null) {
    timezones.forEach(zone => {
        // Skip updating the card the user is currently interacting with to avoid losing their focus
        if (skipId === zone.id) return;

        // Get the local time for this specific card
        const localTime = currentReferenceTime.tz(zone.tz);

        // Update Date
        document.getElementById(`date-${zone.id}`).value = localTime.format('YYYY-MM-DD');

        // Update Time
        let hr = localTime.hour();
        const min = localTime.minute();

        if (!is24Hour) {
            const ampm = hr >= 12 ? 'PM' : 'AM';
            hr = hr % 12 || 12; // Convert 0 to 12
            document.getElementById(`ampm-${zone.id}`).value = ampm;
        }

        document.getElementById(`hour-${zone.id}`).value = is24Hour ? hr : hr;
        document.getElementById(`minute-${zone.id}`).value = min;
    });
}

// Toggle 12/24 hour format
formatToggle.addEventListener('change', (e) => {
    is24Hour = e.target.checked;
    buildUI(); // Rebuild selects when format changes
});

// Initialize the app on load
buildUI();