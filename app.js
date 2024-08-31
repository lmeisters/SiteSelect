// Cache variables
let websitesCache = [];
let filterOptionsCache = [];

// Function to load data with caching
async function loadData() {
    if (websitesCache.length > 0) return websitesCache;

    try {
        const response = await fetch("websites.json");
        websitesCache = await response.json();
        return websitesCache;
    } catch (error) {
        console.error("Error loading data:", error);
        return [];
    }
}

// Function to load filters with caching
async function loadFilters() {
    if (filterOptionsCache.length > 0) return filterOptionsCache;

    try {
        const response = await fetch("filters.json");
        filterOptionsCache = await response.json();
        return filterOptionsCache;
    } catch (error) {
        console.error("Error loading filters:", error);
        return [];
    }
}

// Function to create a website card
function createWebsiteCard(website) {
    const card = document.createElement("div");
    card.className = "website-card";
    const topTags = website.tags.slice(0, 3);

    card.innerHTML = `
        <a href="${website.url}" target="_blank" class="website-image-link">
            <img src="${website.imageUrl}" alt="${website.name} Thumbnail">
        </a>
        <div class="website-info">
            <hr />
            <div class="website-info-block">
                <h3 class="website-name">${website.name}</h3>
                <p class="website-tags"><span>${topTags[0]}</span><span>${topTags[1]}</span><span>${topTags[2]}</span></p>
            </div>
            <hr />
            <p class="website-summary">${website.summary}</p>
        </div>
    `;
    return card;
}

// Initialize variables
let displayedWebsitesCount = 0;
const websitesPerPage = 9;
let websites = [];
let filterOptions = [];
const selectedFilters = new Set();

// Function to render the gallery
function renderGallery(filteredWebsites = websites) {
    const gallery = document.getElementById("gallery");
    const loadMoreButton = document.getElementById("loadMoreButton");

    gallery.innerHTML = "";
    for (let i = 0; i < displayedWebsitesCount; i++) {
        const website = filteredWebsites[i];
        if (website) {
            gallery.appendChild(createWebsiteCard(website));
        }
    }

    loadMoreButton.style.display =
        displayedWebsitesCount >= filteredWebsites.length ? "none" : "block";
}

// Function to handle loading more websites
function loadMoreWebsites() {
    displayedWebsitesCount += websitesPerPage;
    filterWebsites();
}

// Function to render filters dynamically in the menu
function renderFilters() {
    const filterMenu = document.getElementById("filterMenu");
    filterMenu.innerHTML = "";

    filterOptions.forEach((filterCategory) => {
        const categoryDiv = document.createElement("div");
        categoryDiv.className = "filter-category";
        const categoryTitle = document.createElement("h4");
        categoryTitle.textContent = filterCategory.category;
        categoryDiv.appendChild(categoryTitle);

        filterCategory.options.slice(0, 20).forEach((tag) => {
            const span = document.createElement("span");
            span.textContent = tag;
            span.className = "filter-tag";
            span.addEventListener("click", () => toggleFilter(tag));
            categoryDiv.appendChild(span);
        });

        filterMenu.appendChild(categoryDiv);
    });
}

// Function to toggle filter state and update display
function toggleFilter(tag) {
    const filterMenu = document.getElementById("filterMenu");
    const allTags = filterMenu.querySelectorAll(".filter-tag");

    // Clear active state from all tags before setting the clicked one
    allTags.forEach((el) => {
        el.classList.remove("active");
    });

    // Add 'active' class to the clicked tag
    const clickedTag = Array.from(allTags).find((el) => el.textContent === tag);
    if (clickedTag) {
        clickedTag.classList.add("active");
    }

    // Update the selected filters set
    selectedFilters.clear();
    selectedFilters.add(tag);

    // Reset if 'All' is clicked
    if (tag === "All") {
        selectedFilters.clear(); // Clear selected filters
        renderGallery(websites); // Reset to show all websites
    } else {
        filterWebsites(); // Otherwise, filter based on the selected tag
    }
}

// Function to update the active state of the filter buttons
function updateActiveButton(activeButton) {
    document.querySelectorAll(".filter-tag").forEach((button) => {
        button.classList.remove("active");
    });
    if (activeButton) {
        activeButton.classList.add("active");
    }
}

// Function to update active button state
function handleActiveButtonUpdate(option) {
    const allButton = document.querySelector(".filter-tag[textContent='All']");
    const selectedButton = Array.from(
        document.querySelectorAll(".filter-tag")
    ).find(
        (button) =>
            button.textContent.trim().toLowerCase() ===
            option.trim().toLowerCase()
    );

    // Safe checks before manipulating classList
    if (allButton) {
        if (option !== "All") {
            allButton.classList.remove("active");
        } else {
            allButton.classList.add("active");
        }
    }

    if (selectedButton) {
        updateActiveButton(selectedButton);
    } else {
        console.warn(`No button found with text: ${option}`);
    }
}

// Function to filter websites by tags and search input
function filterWebsites() {
    const searchQuery = document
        .getElementById("searchInput")
        .value.toLowerCase();

    const filteredWebsites = websites.filter((website) => {
        const matchesSearchQuery =
            website.name.toLowerCase().includes(searchQuery) ||
            website.summary.toLowerCase().includes(searchQuery) ||
            website.tags.some((tag) => tag.toLowerCase().includes(searchQuery));

        const matchesFilters = [...selectedFilters].every((filter) => {
            return website.tags.includes(filter);
        });

        return (
            matchesSearchQuery && (selectedFilters.size === 0 || matchesFilters)
        );
    });

    renderGallery(filteredWebsites);

    // Show or hide the error message based on the number of filtered results
    const errorMessage = document.getElementById("error-message");
    if (filteredWebsites.length === 0) {
        errorMessage.style.display = "block";
    } else {
        errorMessage.style.display = "none";
    }
}

// Function to toggle the visibility of the filter menu
function toggleFilterMenu() {
    const filterMenu = document.getElementById("filterMenu");
    filterMenu.style.display =
        filterMenu.style.display === "none" ? "inline-flex" : "none";
}

// Function to toggle search bar visibility
function toggleSearchBar() {
    const searchContainer = document.getElementById("searchContainer");
    searchContainer.style.display =
        searchContainer.style.display === "block" ? "none" : "block";
    if (searchContainer.style.display === "block")
        document.getElementById("searchInput").focus();
}

// Debounce function to limit how often filterWebsites is called
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Event listeners
document.addEventListener("DOMContentLoaded", async function () {
    const filterButton = document.getElementById("filterButton");
    const searchToggle = document.getElementById("searchToggle");
    const closeSearch = document.getElementById("closeSearch");
    const loadMoreButton = document.getElementById("loadMoreButton");

    websites = await loadData();
    filterOptions = await loadFilters();

    displayedWebsitesCount = websitesPerPage;
    renderFilters();
    filterWebsites();

    filterButton.addEventListener("click", function (event) {
        event.stopPropagation();
        toggleFilterMenu();
    });

    searchToggle.addEventListener("click", function (event) {
        event.stopPropagation();
        toggleSearchBar();
    });

    closeSearch.addEventListener("click", function () {
        document.getElementById("searchContainer").style.display = "none";
    });

    document.addEventListener("click", function (event) {
        if (
            !document
                .getElementById("searchContainer")
                .contains(event.target) &&
            event.target !== searchToggle
        ) {
            document.getElementById("searchContainer").style.display = "none";
        }
    });

    document
        .getElementById("searchContainer")
        .addEventListener("click", function (event) {
            event.stopPropagation();
        });

    loadMoreButton.addEventListener("click", loadMoreWebsites);

    // Use debounce for search input
    document
        .getElementById("searchInput")
        .addEventListener("input", debounce(filterWebsites, 300));

    // Calculate and display the most common tags
    const tagCount = {};
    websites.forEach((website) => {
        website.tags.forEach((tag) => {
            tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
    });

    const topTags = Object.keys(tagCount)
        .sort((a, b) => tagCount[b] - tagCount[a])
        .slice(0, 7);
    const commonTagsContainer = document.getElementById("commonTagsContainer");

    const allButton = document.createElement("button");
    allButton.className = "filter-tag active";
    allButton.textContent = "All";
    allButton.addEventListener("click", () => {
        selectedFilters.clear();
        handleActiveButtonUpdate("All");
        filterWebsites();
    });
    commonTagsContainer.appendChild(allButton);

    topTags.forEach((tag) => {
        const tagButton = document.createElement("button");
        tagButton.className = "filter-tag";
        tagButton.textContent = tag;
        tagButton.addEventListener("click", () => {
            toggleFilter(tag);
            handleActiveButtonUpdate(tag);
        });
        commonTagsContainer.appendChild(tagButton);
    });

    filterWebsites(); // Initialize filtering with no active filters
});

// Footer opacity change on scroll
document.addEventListener("scroll", function () {
    const footerHeading = document.querySelector(".h1-footer");
    const windowHeight = window.innerHeight;
    const isMobile = windowHeight <= 768; // Example breakpoint for mobile

    // Get the height of the document and the scroll position
    const scrollPosition = window.scrollY;
    const documentHeight = document.body.scrollHeight;

    const scrollPercent = scrollPosition / (documentHeight - windowHeight);

    const newOpacity = Math.min(0.1 + scrollPercent * 0.9, 1);
    const newTransform = `translate3d(0, ${scrollPercent * 50}px, 0) scale(1)`;

    footerHeading.style.opacity = newOpacity;
    footerHeading.style.transform = newTransform;

    // Optional: Adjust styles for mobile
    if (isMobile) {
        footerHeading.style.fontSize = "2rem"; // Example adjustment for mobile
    }
});

// Preloader
window.onload = function () {
    document.querySelector(".loader-slide").classList.add("open");

    // Optionally, hide the preloader and show the main content after the animation
    setTimeout(function () {
        document.getElementById("preloader").style.display = "none";

        // Remove the preloader-active class to show the scrollbar if needed
        document.body.classList.remove("preloader-active");
    }, 2000); // 1s animation duration + 1s delay
};
