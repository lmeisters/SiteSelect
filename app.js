// Function to load data from the JSON file
async function loadData() {
    try {
        const response = await fetch("websites.json");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error loading data:", error);
        return [];
    }
}

// Function to load filter options from the JSON file
async function loadFilters() {
    try {
        const response = await fetch("filters.json");
        const filters = await response.json();
        return filters;
    } catch (error) {
        console.error("Error loading filters:", error);
        return [];
    }
}

// Function to create a website card
function createWebsiteCard(website) {
    const card = document.createElement("div");
    card.className = "website-card";
    card.innerHTML = `
        <a href="${website.url}" target="_blank" class="website-image-link">
            <img src="${website.imageUrl}" alt="${website.name} Thumbnail">
        </a>
        <div class="website-info">
            <hr />
            <div class="website-info-block">
                <h3 class="website-name">${website.name}</h3>
                <p class="website-tags"><span>${website.tags.join(
                    ", "
                )}</span></p>
            </div>
            <hr />
            <p class="website-summary">${website.summary}</p>
        </div>
    `;
    return card;
}

// Track how many websites are currently displayed
let displayedWebsitesCount = 0;
const websitesPerPage = 6;
let websites = [];
let filterOptions = [];
const selectedFilters = new Set();

// Function to render the gallery
function renderGallery(filteredWebsites = websites) {
    const gallery = document.getElementById("gallery");
    const loadMoreButton = document.getElementById("loadMoreButton");

    gallery.innerHTML = ""; // Clear current content

    // Render only the number of websites based on the displayedWebsitesCount
    for (let i = 0; i < displayedWebsitesCount; i++) {
        const website = filteredWebsites[i];
        if (website) {
            const card = createWebsiteCard(website);
            gallery.appendChild(card);
        }
    }

    // Check if more websites are available to display
    if (displayedWebsitesCount >= filteredWebsites.length) {
        loadMoreButton.style.display = "none"; // Hide Load More button if no more websites are available
    } else {
        loadMoreButton.style.display = "block"; // Show Load More button
    }
}

// Function to handle loading more websites
function loadMoreWebsites() {
    displayedWebsitesCount += websitesPerPage;
    filterWebsites(); // Re-filter and re-render the gallery to reflect the new count
}

// Function to render filters dynamically in the menu
function renderFilters() {
    const filterMenu = document.getElementById("filterMenu");
    filterMenu.innerHTML = ""; // Clear existing filters

    filterOptions.forEach((filterCategory) => {
        const categoryDiv = document.createElement("div");
        categoryDiv.className = "filter-category";

        filterCategory.options.forEach((option) => {
            const span = document.createElement("span");
            span.textContent = option;
            span.className = "filter-option";
            span.addEventListener("click", () => toggleFilter(option));
            categoryDiv.appendChild(span);
        });

        filterMenu.appendChild(categoryDiv);
    });
}

// Function to toggle the underline of filter options
function toggleFilter(option) {
    const filterMenu = document.getElementById("filterMenu");
    const allOptions = filterMenu.querySelectorAll(".filter-option");

    allOptions.forEach((el) => {
        if (el.textContent === option) {
            if (el.classList.contains("active")) {
                el.classList.remove("active");
                selectedFilters.delete(option);
            } else {
                el.classList.add("active");
                selectedFilters.add(option);
            }
        }
    });

    filterWebsites();
}

// Function to filter websites by tags and search input
function filterWebsites() {
    const searchQuery = document
        .getElementById("searchInput")
        .value.toLowerCase();

    const filteredWebsites = websites.filter((website) => {
        // Check if the search query matches the name, summary, or tags
        const matchesSearchQuery =
            website.name.toLowerCase().includes(searchQuery) ||
            website.summary.toLowerCase().includes(searchQuery) ||
            website.tags.some((tag) => tag.toLowerCase().includes(searchQuery));

        // Check matches for all selected filters
        const matchesFilters = [...selectedFilters].every((filter) => {
            return website.tags.includes(filter);
        });

        return (
            matchesSearchQuery && (selectedFilters.size === 0 || matchesFilters)
        );
    });

    renderGallery(filteredWebsites);
}

// Function to toggle the visibility of the filter menu
function toggleFilterMenu() {
    const filterMenu = document.getElementById("filterMenu");
    filterMenu.style.display =
        filterMenu.style.display === "none" ? "block" : "none";
}

// Function to toggle search bar visibility
function toggleSearchBar() {
    const searchContainer = document.getElementById("searchContainer");
    const searchInput = document.getElementById("searchInput");

    if (searchContainer.style.display === "block") {
        searchContainer.style.display = "none";
    } else {
        searchContainer.style.display = "block";
        searchInput.focus(); // Automatically focus on the search input
    }
}

// Event listeners
document.addEventListener("DOMContentLoaded", async function () {
    const filterButton = document.getElementById("filterButton");
    const searchToggle = document.getElementById("searchToggle");
    const searchContainer = document.getElementById("searchContainer");
    const closeSearch = document.getElementById("closeSearch");
    const loadMoreButton = document.getElementById("loadMoreButton");

    // Load data and filters
    websites = await loadData();
    filterOptions = await loadFilters();

    // Initialize with the first set of websites
    displayedWebsitesCount = websitesPerPage;
    renderFilters(); // Render the filters
    filterWebsites(); // Initially render websites

    // Toggle the filter menu visibility when the Filter button is clicked
    filterButton.addEventListener("click", function (event) {
        event.stopPropagation(); // Prevents the click from closing the filter menu immediately
        toggleFilterMenu(); // Toggle the filter menu
    });

    // Toggle the search bar visibility when the Search button is clicked
    searchToggle.addEventListener("click", function (event) {
        event.stopPropagation(); // Prevents the click from closing the search immediately
        toggleSearchBar(); // Toggle the search bar
    });

    // Close the search bar when the close button is clicked
    closeSearch.addEventListener("click", function () {
        searchContainer.style.display = "none";
    });

    // Close the search bar when clicking outside of it
    document.addEventListener("click", function (event) {
        if (
            !searchContainer.contains(event.target) &&
            event.target !== searchToggle
        ) {
            searchContainer.style.display = "none";
        }
    });

    // Prevent clicks inside the searchContainer from closing it
    searchContainer.addEventListener("click", function (event) {
        event.stopPropagation();
    });

    // Load more websites when the Load More button is clicked
    loadMoreButton.addEventListener("click", loadMoreWebsites);

    // Update search filter as the input changes
    document
        .getElementById("searchInput")
        .addEventListener("input", filterWebsites);
});
