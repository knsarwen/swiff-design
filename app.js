/* ==========================================
   SWIFF INTERACTIVE PROTOTYPE CONTROLLER
   ========================================== */

// Simulated states
let activeScenario = 'coffee'; // coffee, document, pharmacy
let currentStep = 0; // 0: Verification, 1: Request, 2: Matching, 3: Active, 4: Done
let runnerApproved = false;
let currentTab = 'admin-dashboard';

// Scenarios Data
const scenarios = {
    coffee: {
        actionType: 'Buy For Me',
        pickup: 'Starbucks, Concourse Floor, Suria KLCC',
        dropoff: 'Petronas Twin Tower 2, Level 48 Desk A',
        detail: '1x Grande Iced Caramel Macchiato (Less Sweet)',
        fee: 'RM 8.00',
        runnerEarnings: 'RM 6.40',
        customerName: 'Mei Ling',
        runnerName: 'Faiz',
        storeName: 'Starbucks KLCC',
        custMapCoords: { store: { top: 70, left: 30 }, customer: { top: 35, left: 60 } },
        startRunnerPos: { top: 85, left: 15 },
        pickupRunnerPos: { top: 70, left: 30 },
        dropoffRunnerPos: { top: 35, left: 60 }
    },
    document: {
        actionType: 'Office Run',
        pickup: 'Zico Law, Level 19, South Tower Bangsar South',
        dropoff: 'Noventiq HQ, Level 32, Vertical Corporate Tower B',
        detail: 'Urgent signed board resolutions envelope',
        fee: 'RM 12.00',
        runnerEarnings: 'RM 9.60',
        customerName: 'Karthik',
        runnerName: 'Syahirah',
        storeName: 'Zico Law Office',
        custMapCoords: { store: { top: 60, left: 20 }, customer: { top: 40, left: 70 } },
        startRunnerPos: { top: 80, left: 40 },
        pickupRunnerPos: { top: 60, left: 20 },
        dropoffRunnerPos: { top: 40, left: 70 }
    },
    pharmacy: {
        actionType: 'Pick & Drop',
        pickup: 'Caring Pharmacy, Ground Floor, Dpulze Cyberjaya',
        dropoff: 'DXC Technology Main Lobby Desk',
        detail: '1x Box Panadol Actifast (10s)',
        fee: 'RM 10.00',
        runnerEarnings: 'RM 8.00',
        customerName: 'Faiz',
        runnerName: 'Mei Ling',
        storeName: 'Caring Pharmacy',
        custMapCoords: { store: { top: 50, left: 40 }, customer: { top: 30, left: 80 } },
        startRunnerPos: { top: 75, left: 20 },
        pickupRunnerPos: { top: 50, left: 40 },
        dropoffRunnerPos: { top: 30, left: 80 }
    }
};

// Auto-run splash sequence on load
document.addEventListener("DOMContentLoaded", () => {
    // Hide splash screens after 1.5 seconds
    setTimeout(() => {
        const splash1 = document.getElementById("customer-splash");
        if(splash1) splash1.style.opacity = 0;
        setTimeout(() => { if(splash1) splash1.style.display = 'none'; }, 500);
    }, 1500);

    setTimeout(() => {
        const splash2 = document.getElementById("runner-splash");
        if(splash2) splash2.style.opacity = 0;
        setTimeout(() => { if(splash2) splash2.style.display = 'none'; }, 500);
    }, 1800);

    // Initial setup of forms and scenarios
    setScenario('coffee');
    updateVisuals();
});

// Switch Scenario
function setScenario(scen) {
    activeScenario = scen;
    const sData = scenarios[scen];
    
    // Reset back to Step 0 if switching scenarios
    currentStep = 0;
    runnerApproved = false;

    // Update buttons in sidebar
    const buttons = document.querySelectorAll(".scenario-btn");
    buttons.forEach(btn => btn.classList.remove("active"));
    
    // Set active class
    const idx = (scen === 'coffee') ? 0 : (scen === 'document') ? 1 : 2;
    buttons[idx].classList.add("active");

    // Populate Creator Form
    document.getElementById("form-action-type").innerText = sData.actionType;
    document.getElementById("errand-pickup").value = sData.pickup;
    document.getElementById("errand-dropoff").value = sData.dropoff;
    document.getElementById("errand-detail").value = sData.detail;
    document.getElementById("fee-display").innerText = sData.fee;
    document.getElementById("runner-earns-display").innerText = sData.runnerEarnings;

    // Reset customer map pins based on coords
    const storePin = document.querySelector("#customer-map .pin-store");
    const customerPin = document.querySelector("#customer-map .pin-customer");
    if (storePin && customerPin) {
        storePin.style.top = `${sData.custMapCoords.store.top}%`;
        storePin.style.left = `${sData.custMapCoords.store.left}%`;
        customerPin.style.top = `${sData.custMapCoords.customer.top}%`;
        customerPin.style.left = `${sData.custMapCoords.customer.left}%`;
    }

    // Reset runner map pins
    const runnerPinCust = document.getElementById("cust-map-runner");
    const runnerPinRun = document.getElementById("run-map-runner");
    const runnerPinAdmin = document.getElementById("admin-map-runner");
    
    if (runnerPinCust) {
        runnerPinCust.style.top = `${sData.startRunnerPos.top}%`;
        runnerPinCust.style.left = `${sData.startRunnerPos.left}%`;
        runnerPinCust.style.display = 'none';
    }
    if (runnerPinRun) {
        runnerPinRun.style.top = `${sData.startRunnerPos.top}%`;
        runnerPinRun.style.left = `${sData.startRunnerPos.left}%`;
    }
    if (runnerPinAdmin) {
        runnerPinAdmin.style.top = `${sData.startRunnerPos.top}%`;
        runnerPinAdmin.style.left = `${sData.startRunnerPos.left}%`;
    }

    // Reset Table and Admin elements
    document.getElementById("table-runner-name").innerText = "Unassigned";
    document.getElementById("table-task-type").innerText = sData.actionType;
    document.getElementById("table-task-fee").innerText = sData.fee;
    document.getElementById("table-task-status").className = "badge badge-navy badge-sm";
    document.getElementById("table-task-status").innerText = "Awaiting Placement";
    document.getElementById("active-sim-task-row").style.display = 'none';

    // Onboard tab applicant details
    const appAvatar = document.querySelector(".applicant-avatar");
    const appName = document.querySelector(".applicant-info h4");
    if(appAvatar) appAvatar.innerText = sData.runnerName[0];
    if(appName) appName.innerText = `${sData.runnerName} bin Ibrahim`;

    // Reset Applicant card view in case approved earlier
    document.getElementById("onboard-card-container").style.display = 'block';
    document.getElementById("onboard-empty-state").style.display = 'none';
    document.getElementById("pending-runner-title-badge").innerText = "1 Application Pending";
    document.getElementById("pending-runner-title-badge").className = "badge badge-purple";
    document.getElementById("applicant-status-label").innerText = "PENDING VERIFICATION";
    document.getElementById("applicant-status-label").className = "badge badge-purple";
    document.getElementById("badge-onboard-count").innerText = "1";

    // Set greeting names
    const greetCust = document.querySelector("#customer-app-screen .greet");
    if(greetCust) greetCust.innerText = `Hi, ${sData.customerName} 👋`;

    // Hide panels
    document.getElementById("errand-creator").style.display = 'none';
    document.getElementById("customer-tracking").style.display = 'none';
    document.getElementById("rating-panel").style.display = 'none';
    
    document.getElementById("runner-wait-panel").style.display = 'flex';
    document.getElementById("runner-job-offer").style.display = 'none';
    document.getElementById("runner-active-job-panel").style.display = 'none';

    // Reset Chat Box
    document.getElementById("chat-messages-box").innerHTML = `
        <div class="message msg-runner">Hello! I'm nearby. Ready to help with your task.</div>
    `;

    updateVisuals();
}

// Switch Mobile View vs Web Frame
function switchView(viewName) {
    const phoneContainer = document.getElementById("phone-view-container");
    const webContainer = document.getElementById("web-portal-container");
    
    const btnCust = document.getElementById("btn-view-customer");
    const btnRun = document.getElementById("btn-view-runner");
    const btnAdmin = document.getElementById("btn-view-admin");

    btnCust.classList.remove("active");
    btnRun.classList.remove("active");
    btnAdmin.classList.remove("active");

    if (viewName === 'customer-app') {
        phoneContainer.style.display = 'flex';
        webContainer.style.display = 'none';
        btnCust.classList.add("active");
        
        // Show customer content on phone
        document.getElementById("customer-app-screen").classList.add("active");
        document.getElementById("runner-app-screen").classList.remove("active");
    } else if (viewName === 'runner-app') {
        phoneContainer.style.display = 'flex';
        webContainer.style.display = 'none';
        btnRun.classList.add("active");

        // Show runner content on phone
        document.getElementById("customer-app-screen").classList.remove("active");
        document.getElementById("runner-app-screen").classList.add("active");
    } else if (viewName === 'admin-portal') {
        phoneContainer.style.display = 'none';
        webContainer.style.display = 'flex';
        btnAdmin.classList.add("active");
    }
}

// Switch admin portal internal tabs
function showPortalTab(tabId) {
    currentTab = tabId;
    const tabs = document.querySelectorAll(".portal-tab-content");
    tabs.forEach(t => t.classList.remove("active"));
    document.getElementById(tabId + "-tab").classList.add("active");

    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => item.classList.remove("active"));
    
    // Match nav active state
    if (tabId === 'admin-dashboard') navItems[0].classList.add("active");
    if (tabId === 'runner-onboard') navItems[1].classList.add("active");
    if (tabId === 'disputes-tab') navItems[2].classList.add("active");
    if (tabId === 'analytics-tab') navItems[3].classList.add("active");
}

// Errand form opening
function selectService(serviceType) {
    document.getElementById("errand-creator").style.display = 'flex';
}

function hideErrandCreator() {
    document.getElementById("errand-creator").style.display = 'none';
}

// Story Tracker navigation
function jumpToStep(stepIndex) {
    currentStep = stepIndex;
    updateVisuals();
}

function prevStep() {
    if (currentStep > 0) {
        currentStep--;
        updateVisuals();
    }
}

function nextStep() {
    if (currentStep < 4) {
        currentStep++;
        updateVisuals();
    } else {
        resetSimulation();
    }
}

// Action Trigger mappings based on steps
function updateVisuals() {
    const sData = scenarios[activeScenario];

    // Reset story progress state
    const steps = document.querySelectorAll(".story-step");
    steps.forEach((st, idx) => {
        st.classList.remove("active");
        if (idx === currentStep) st.classList.add("active");
    });

    // Control buttons inside canvas header
    const nextBtn = document.getElementById("btn-next-action");
    
    // Switch Screen UI and Admin data depending on the step
    switch (currentStep) {
        case 0:
            // STEP 0: Runner Onboarding
            document.getElementById("current-story-title").innerText = "Step 1: Runner Onboarding & Verification";
            document.getElementById("current-story-desc").innerText = `Applicant ${sData.runnerName} has uploaded all security clearance papers. Check and approve them.`;
            nextBtn.innerHTML = `Verify & Onboard <i class="fa-solid fa-arrow-right"></i>`;
            
            // Show Admin Web, Onboard Tab
            switchView('admin-portal');
            showPortalTab('runner-onboard');
            break;

        case 1:
            // STEP 1: Customer App Place Errand
            document.getElementById("current-story-title").innerText = "Step 2: Place Hyperlocal Request";
            document.getElementById("current-story-desc").innerText = `${sData.customerName} selects the errand type, details the items, and requests a runner.`;
            nextBtn.innerHTML = `Place Request <i class="fa-solid fa-arrow-right"></i>`;

            // Open Customer App
            switchView('customer-app');
            document.getElementById("errand-creator").style.display = 'flex';
            document.getElementById("customer-tracking").style.display = 'none';
            document.getElementById("rating-panel").style.display = 'none';
            break;

        case 2:
            // STEP 2: Job Offer matching in Runner App
            document.getElementById("current-story-title").innerText = "Step 3: Matching & Job Acceptance";
            document.getElementById("current-story-desc").innerText = `Escrow locks RM ${sData.fee} securely. System matches runner. ${sData.runnerName} gets job offer.`;
            nextBtn.innerHTML = `Accept Job Offer <i class="fa-solid fa-arrow-right"></i>`;

            // Auto ensure order placed on customer app in backend simulation
            document.getElementById("customer-tracking").style.display = 'flex';
            document.getElementById("errand-creator").style.display = 'none';
            document.getElementById("tracking-status-text").innerText = "Matching with verified runners...";
            document.getElementById("customer-runner-card").style.display = 'none';

            // Show active task in table
            document.getElementById("active-sim-task-row").style.display = 'table-row';
            document.getElementById("table-task-status").className = "badge badge-purple badge-sm";
            document.getElementById("table-task-status").innerText = "Matching";

            // Open Runner App
            switchView('runner-app');
            document.getElementById("runner-wait-panel").style.display = 'none';
            document.getElementById("runner-job-offer").style.display = 'flex';
            document.getElementById("runner-active-job-panel").style.display = 'none';
            
            // Populate Job details on Offer sheet
            document.getElementById("job-pickup-name").innerText = sData.pickup;
            document.getElementById("job-dropoff-name").innerText = sData.dropoff;
            document.getElementById("job-item-name").innerText = sData.detail;
            document.getElementById("runner-job-payout").innerText = sData.runnerEarnings;
            break;

        case 3:
            // STEP 3: Active Fulfilment (Runner commutes to store/customer)
            document.getElementById("current-story-title").innerText = "Step 3+: Live Errand Fulfillment";
            document.getElementById("current-story-desc").innerText = `${sData.runnerName} picks up the items, while ${sData.customerName} checks the progress map.`;
            nextBtn.innerHTML = `Complete Delivery <i class="fa-solid fa-arrow-right"></i>`;

            // Setup tracking on Customer App
            document.getElementById("tracking-status-text").innerText = `${sData.runnerName} is at store picking up item...`;
            document.getElementById("customer-runner-card").style.display = 'flex';
            document.getElementById("cust-runner-name").innerText = `${sData.runnerName} (Verified Swiff Runner)`;
            document.getElementById("cust-map-runner").style.display = 'flex';
            
            // Show route line
            document.getElementById("route-path-cust").style.display = 'block';

            // Show active state in runner app
            document.getElementById("runner-wait-panel").style.display = 'none';
            document.getElementById("runner-job-offer").style.display = 'none';
            document.getElementById("runner-active-job-panel").style.display = 'flex';
            document.getElementById("runner-step-badge").innerText = "1. GO TO PICKUP";
            document.getElementById("runner-action-title").innerText = `Collect item from ${sData.storeName}`;
            document.getElementById("runner-action-desc").innerText = `Order code: ${sData.customerName} #48`;
            document.getElementById("runner-action-button").innerText = "Item Collected";

            // Update Admin logs
            document.getElementById("active-sim-task-row").style.display = 'table-row';
            document.getElementById("table-runner-name").innerText = sData.runnerName;
            document.getElementById("table-task-status").className = "badge badge-navy badge-sm";
            document.getElementById("table-task-status").innerText = "In Progress";
            document.getElementById("admin-match-state-text").innerText = `${sData.runnerName} is completing errand for ${sData.customerName}.`;

            // Position runner pin at store
            animatePinTransition("cust-map-runner", sData.pickupRunnerPos);
            animatePinTransition("run-map-runner", sData.pickupRunnerPos);
            animatePinTransition("admin-map-runner", sData.pickupRunnerPos);

            // Default show Customer view
            switchView('customer-app');
            break;

        case 4:
            // STEP 4: Deliver & Release Escrow
            document.getElementById("current-story-title").innerText = "Step 4: Delivery Confirmation & Payout";
            document.getElementById("current-story-desc").innerText = `${sData.runnerName} delivers face-to-face. ${sData.customerName} confirms. Payout is split: 80% to runner.`;
            nextBtn.innerHTML = `Done / Restart <i class="fa-solid fa-rotate-left"></i>`;

            // Customer App state
            document.getElementById("customer-tracking").style.display = 'flex';
            document.getElementById("tracking-status-text").innerText = `${sData.runnerName} has arrived at your desk!`;
            document.getElementById("release-payment-container").style.display = 'block';

            // Animate pin to customer desk
            animatePinTransition("cust-map-runner", sData.dropoffRunnerPos);
            animatePinTransition("run-map-runner", sData.dropoffRunnerPos);
            animatePinTransition("admin-map-runner", sData.dropoffRunnerPos);

            // Runner App state
            document.getElementById("runner-step-badge").innerText = "2. DELIVERING";
            document.getElementById("runner-action-title").innerText = `Deliver to ${sData.customerName}`;
            document.getElementById("runner-action-desc").innerText = "Awaiting customer confirmation to release escrow.";
            document.getElementById("runner-action-button").innerText = "Awaiting customer confirm...";
            document.getElementById("runner-action-button").disabled = true;

            // Admin portal
            document.getElementById("table-task-status").className = "badge badge-mint badge-sm";
            document.getElementById("table-task-status").innerText = "Delivered";

            switchView('customer-app');
            break;
    }
}

// Animate map pins
function animatePinTransition(pinId, coords) {
    const pin = document.getElementById(pinId);
    if (pin) {
        pin.style.top = `${coords.top}%`;
        pin.style.left = `${coords.left}%`;
    }
}

// Step actions triggered directly from screen clicks
function approveApplicant() {
    runnerApproved = true;
    
    // Visual states in Onboard screen
    document.getElementById("onboard-card-container").style.display = 'none';
    document.getElementById("onboard-empty-state").style.display = 'flex';
    document.getElementById("pending-runner-title-badge").innerText = "0 Applications Pending";
    document.getElementById("pending-runner-title-badge").className = "badge badge-mint";
    document.getElementById("badge-onboard-count").innerText = "0";

    // Progress flow to Step 1
    currentStep = 1;
    setTimeout(() => {
        updateVisuals();
    }, 800);
}

function rejectApplicant() {
    alert("Application declined. In production, an notification would be dispatched to the applicant.");
}

function simulatePlaceOrder() {
    currentStep = 2;
    updateVisuals();
}

function acceptJob() {
    currentStep = 3;
    updateVisuals();
}

function nextRunnerStage() {
    // Collect -> Deliver
    document.getElementById("runner-step-badge").innerText = "2. DELIVERING";
    document.getElementById("runner-action-title").innerText = `Deliver to customer`;
    const sData = scenarios[activeScenario];
    document.getElementById("runner-action-desc").innerText = `Deliver to: ${sData.dropoff}`;
    document.getElementById("runner-action-button").innerText = "Tap when arrived";
    document.getElementById("runner-action-button").onclick = () => {
        currentStep = 4;
        updateVisuals();
    };

    // Move runner pin on maps
    const sDataCoords = sData.dropoffRunnerPos;
    animatePinTransition("cust-map-runner", sDataCoords);
    animatePinTransition("run-map-runner", sDataCoords);
    animatePinTransition("admin-map-runner", sDataCoords);
}

function confirmRelease() {
    // Release payment, show rating screen
    document.getElementById("customer-tracking").style.display = 'none';
    document.getElementById("rating-panel").style.display = 'flex';
    
    // Reset runner offline
    document.getElementById("runner-active-job-panel").style.display = 'none';
    document.getElementById("runner-wait-panel").style.display = 'flex';

    // Update escrow table in admin
    const statusLabel = document.getElementById("escrow-status-txn");
    if(statusLabel) {
        statusLabel.innerText = "Released to Runner";
        statusLabel.className = "badge badge-mint badge-sm";
    }
}

// Chat functions
function openChat() {
    document.getElementById("customer-chat").style.display = 'flex';
}

function closeChat() {
    document.getElementById("customer-chat").style.display = 'none';
}

function sendChatMessage() {
    const input = document.getElementById("chat-input-field");
    const val = input.value.trim();
    if (val) {
        const box = document.getElementById("chat-messages-box");
        box.innerHTML += `<div class="message msg-cust">${val}</div>`;
        input.value = "";
        
        // Auto response after a second
        setTimeout(() => {
            box.innerHTML += `<div class="message msg-runner">Noted! Almost arrived at your floor.</div>`;
            box.scrollTop = box.scrollHeight;
        }, 1200);
    }
}

function resetSimulation() {
    setScenario(activeScenario);
}
