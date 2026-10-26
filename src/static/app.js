document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");
  const participantsContainer = document.getElementById("participants-container");
  const activityNameDisplay = document.getElementById("activity-name-display");
  const participantsList = document.getElementById("participants-list");

  // Function to load participants for selected activity
  async function loadParticipants(activityName) {
    if (!activityName) {
      participantsContainer.classList.add("hidden");
      return;
    }

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activityName)}/participants`
      );

      if (!response.ok) {
        throw new Error("Failed to load participants");
      }

      const data = await response.json();

      activityNameDisplay.textContent = `${data.activity_name} (${data.participant_count}/${data.max_participants} participantes)`;

      // Clear participants list
      participantsList.innerHTML = "";

      if (data.participants.length === 0) {
        participantsList.innerHTML = "<p style='color: #999; font-style: italic;'>Nenhum participante ainda</p>";
      } else {
        const ul = document.createElement("ul");
        ul.style.listStyleType = "none";
        ul.style.padding = "0";

        data.participants.forEach((participant) => {
          const li = document.createElement("li");
          li.style.padding = "8px";
          li.style.marginBottom = "5px";
          li.style.backgroundColor = "#f0f0f0";
          li.style.borderRadius = "4px";
          li.textContent = participant;
          ul.appendChild(li);
        });

        participantsList.appendChild(ul);
      }

      participantsContainer.classList.remove("hidden");
    } catch (error) {
      console.error("Error loading participants:", error);
      participantsContainer.classList.add("hidden");
    }
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <p><strong>Participants:</strong> ${details.participants.length}/${details.max_participants}</p>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle activity selection change
  activitySelect.addEventListener("change", (event) => {
    loadParticipants(event.target.value);
  });

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();

        // Reload participants list
        await loadParticipants(activity);

        // Reload activities list to update participant count
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
