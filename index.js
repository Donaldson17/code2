document.addEventListener("DOMContentLoaded", function() {
    // DOM Elements
    const guestNameInput = document.getElementById("guestName");
    const guestCategorySelect = document.getElementById("guestCategory");
    const addGuestButton = document.getElementById("addGuest");
    const guestList = document.getElementById("guestList");
    const guestCounter = document.getElementById("guestCounter");
    const categoryCount = document.getElementById("categoryCount");

    // Guest data storage
    let guests = JSON.parse(localStorage.getItem("guests")) || [];

    // Initialize the app
    function init() {
        renderGuestList();
        updateStats();
        setupEventListeners();
    }

    // Set up event listeners
    function setupEventListeners() {
        addGuestButton.addEventListener("click", addGuest);
        guestNameInput.addEventListener("keypress", function(e) {
            if (e.key === "Enter") addGuest();
        });
    }

    // Add a new guest
    function addGuest() {
        const name = guestNameInput.value.trim();
        const category = guestCategorySelect.value;

        if (!name) {
            alert("Please enter a guest name!");
            return;
        }

        if (guests.length >= 10) {
            alert("Guest limit reached (maximum 10 guests)!");
            return;
        }

        const newGuest = {
            id: Date.now(), // Unique ID
            name: name,
            category: category,
            attending: false,
            addedAt: new Date().toLocaleString()
        };

        guests.push(newGuest);
        saveToLocalStorage();
        renderGuestList();
        updateStats();
        
        // Reset input
        guestNameInput.value = "";
        guestNameInput.focus();
    }

    // Remove a guest
    function removeGuest(id) {
        if (confirm("Are you sure you want to remove this guest?")) {
            guests = guests.filter(guest => guest.id !== id);
            saveToLocalStorage();
            renderGuestList();
            updateStats();
        }
    }

    // Toggle RSVP status
    function toggleRSVP(id) {
        guests = guests.map(guest => {
            if (guest.id === id) {
                return { ...guest, attending: !guest.attending };
            }
            return guest;
        });
        saveToLocalStorage();
        renderGuestList();
        updateStats();
    }

    // Edit guest name
    function editGuest(id) {
        const guest = guests.find(g => g.id === id);
        const listItem = document.querySelector(`li[data-id="${id}"]`);
        
        if (!listItem || !guest) return;

        // Create edit interface
        listItem.classList.add("edit-mode");
        listItem.innerHTML = `
            <div class="guest-info">
                <input type="text" class="edit-input" value="${guest.name}" id="editInput-${id}">
                <div class="guest-meta">
                    <span>${guest.addedAt}</span>
                </div>
            </div>
            <div class="guest-actions">
                <button class="action-btn save-btn" data-id="${id}">Save</button>
                <button class="action-btn cancel-btn" data-id="${id}">Cancel</button>
            </div>
        `;

        // Focus the input
        const editInput = document.getElementById(`editInput-${id}`);
        editInput.focus();
        editInput.select();

        // Set up save/cancel buttons
        document.querySelector(`.save-btn[data-id="${id}"]`).addEventListener("click", () => saveEdit(id));
        document.querySelector(`.cancel-btn[data-id="${id}"]`).addEventListener("click", () => cancelEdit(id));
    }

    function saveEdit(id) {
        const newName = document.getElementById(`editInput-${id}`).value.trim();
        
        if (newName) {
            guests = guests.map(guest => {
                if (guest.id === id) {
                    return { ...guest, name: newName };
                }
                return guest;
            });
            saveToLocalStorage();
            renderGuestList();
            updateStats();
        }
    }

    function cancelEdit(id) {
        renderGuestList();
    }

    // Save to localStorage
    function saveToLocalStorage() {
        localStorage.setItem("guests", JSON.stringify(guests));
    }

    // Update statistics
    function updateStats() {
        const total = guests.length;
        const attending = guests.filter(g => g.attending).length;
        
        const friends = guests.filter(g => g.category === "friend").length;
        const family = guests.filter(g => g.category === "family").length;
        const colleagues = guests.filter(g => g.category === "colleague").length;

        guestCounter.textContent = `Total: ${total}/10 | Attending: ${attending}`;
        categoryCount.textContent = `Friends: ${friends} | Family: ${family} | Colleagues: ${colleagues}`;
    }

    // Render the guest list
    function renderGuestList() {
        guestList.innerHTML = "";

        if (guests.length === 0) {
            guestList.innerHTML = `<li class="empty-list">No guests added yet. Start by adding a guest above.</li>`;
            return;
        }

        guests.forEach(guest => {
            const listItem = document.createElement("li");
            listItem.dataset.id = guest.id;

            // Guest information
            const guestInfo = document.createElement("div");
            guestInfo.className = "guest-info";

            const nameDiv = document.createElement("div");
            nameDiv.className = "guest-name";
            
            const nameSpan = document.createElement("span");
            nameSpan.textContent = guest.name;
            
            const categorySpan = document.createElement("span");
            categorySpan.className = `category-tag ${guest.category}`;
            categorySpan.textContent = guest.category.charAt(0).toUpperCase() + guest.category.slice(1);
            
            nameDiv.appendChild(nameSpan);
            nameDiv.appendChild(categorySpan);

            const metaDiv = document.createElement("div");
            metaDiv.className = "guest-meta";
            metaDiv.innerHTML = `
                <span>Added: ${guest.addedAt}</span>
                <span>Status: ${guest.attending ? "Attending " : "Not attending "}</span>
            `;

            guestInfo.appendChild(nameDiv);
            guestInfo.appendChild(metaDiv);

            // Guest actions
            const actionsDiv = document.createElement("div");
            actionsDiv.className = "guest-actions";

            const rsvpButton = document.createElement("button");
            rsvpButton.className = `action-btn rsvp-btn ${guest.attending ? "attending" : ""}`;
            rsvpButton.textContent = guest.attending ? "Attending" : "Not Attending";
            rsvpButton.addEventListener("click", () => toggleRSVP(guest.id));

            const editButton = document.createElement("button");
            editButton.className = "action-btn edit-btn";
            editButton.textContent = "Edit";
            editButton.addEventListener("click", () => editGuest(guest.id));

            const removeButton = document.createElement("button");
            removeButton.className = "action-btn remove-btn";
            removeButton.textContent = "Remove";
            removeButton.addEventListener("click", () => removeGuest(guest.id));

            actionsDiv.appendChild(rsvpButton);
            actionsDiv.appendChild(editButton);
            actionsDiv.appendChild(removeButton);

            // Assemble the list item
            listItem.appendChild(guestInfo);
            listItem.appendChild(actionsDiv);
            guestList.appendChild(listItem);
        });
    }

    // Initialize the app
    init();
});