// import { gsap } from "gsap";
import { injectSpeedInsights } from "@vercel/speed-insights";

injectSpeedInsights();

// Cache variables
let websitesCache = [];
let filterOptionsCache = [];
let allTags = new Set(); // To store all unique tags for autocomplete

// Function to load data with caching
async function loadData() {
    if (websitesCache.length > 0) return websitesCache;

    try {
        const response = await fetch("websites.json");
        websitesCache = await response.json();

        // Collect all tags from websites
        websitesCache.forEach((website) => {
            website.tags.forEach((tag) => allTags.add(tag));
        });

        return websitesCache;
    } catch (error) {
        console.error("Error loading data:", error);
        return [];
    }
}

// Function to create autocomplete suggestions based on user input
function createAutocompleteSuggestions(input) {
    const autocompleteContainer = document.getElementById(
        "autocompleteContainer"
    );
    autocompleteContainer.innerHTML = ""; // Clear previous suggestions

    if (input.length === 0) return; // Do not show suggestions if input is empty

    // Filter tags based on input
    const filteredTags = Array.from(allTags).filter((tag) =>
        tag.toLowerCase().includes(input.toLowerCase())
    );

    // Create and append suggestion elements
    filteredTags.forEach((tag) => {
        const suggestionElement = document.createElement("div");
        suggestionElement.className = "autocomplete-suggestion";
        suggestionElement.textContent = tag;

        // Add click event to set input value and filter websites
        suggestionElement.addEventListener("click", () => {
            document.getElementById("searchInput").value = tag;
            filterWebsites();
            autocompleteContainer.innerHTML = ""; // Clear suggestions after click
        });

        autocompleteContainer.appendChild(suggestionElement);
    });
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

function createWebsiteCard(website) {
    const template = document.getElementById("website-card-template");
    const card = document.importNode(template.content, true);

    // Populate the template
    const link = card.querySelector(".website-image-link");
    link.href = website.url;

    const image = link.querySelector("img");
    image.src = website.imageUrl;
    image.alt = `${website.name} Thumbnail`;

    const nameHeader = card.querySelector(".website-name");
    nameHeader.textContent = website.name;

    const tagsParagraph = card.querySelector(".website-tags");
    const topTags = website.tags.slice(0, 3);
    topTags.forEach((tag) => {
        const tagSpan = document.createElement("span");
        tagSpan.textContent = tag;
        tagsParagraph.appendChild(tagSpan);
    });

    const summaryParagraph = card.querySelector(".website-summary");
    summaryParagraph.textContent = website.summary;

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
    const commonTagsContainer = document.getElementById("commonTagsContainer");
    const allTags = filterMenu.querySelectorAll(".filter-tag");
    const commonTags = commonTagsContainer.querySelectorAll(".filter-tag");

    // Clear active state from all tags before setting the clicked one
    allTags.forEach((el) => {
        el.classList.remove("active");
    });

    commonTags.forEach((el) => {
        el.classList.remove("active");
    });

    // Handle filter reset on double click
    const clickedTag =
        Array.from(allTags).find((el) => el.textContent === tag) ||
        Array.from(commonTags).find((el) => el.textContent === tag);

    if (clickedTag) {
        if (clickedTag.classList.contains("active")) {
            // If already active, reset filters
            selectedFilters.clear();
            renderGallery(websites); // Reset to show all websites
            handleActiveButtonUpdate("All");
        } else {
            // Otherwise, apply new filter
            clickedTag.classList.add("active");
            selectedFilters.clear();
            selectedFilters.add(tag);
            filterWebsites();
            handleActiveButtonUpdate(tag);
        }
    }
}

// Function to filter websites by tags and search input
function filterWebsites() {
    const searchQuery = document
        .getElementById("searchInput")
        .value.toLowerCase();

    const filteredWebsites = websitesCache.filter((website) => {
        const matchesSearchQuery =
            website.name.toLowerCase().includes(searchQuery) ||
            website.summary.toLowerCase().includes(searchQuery) ||
            website.tags.some((tag) => tag.toLowerCase().includes(searchQuery));

        // Apply filter based on selectedFilters
        const matchesFilters =
            selectedFilters.size === 0 ||
            website.tags.some((tag) => selectedFilters.has(tag));

        return matchesSearchQuery && matchesFilters;
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
    const isOpen = filterMenu.style.display === "inline-flex";

    if (isOpen) {
        gsap.to(filterMenu, { height: 0, display: "none", duration: 0.3 });
    } else {
        gsap.set(filterMenu, { display: "inline-flex" });
        gsap.fromTo(
            filterMenu,
            { height: 0 },
            { height: "auto", duration: 0.3 }
        );
    }
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

    // Initialize autocomplete functionality
    const searchInput = document.getElementById("searchInput");
    searchInput.addEventListener(
        "input",
        debounce(() => {
            const inputValue = searchInput.value;
            createAutocompleteSuggestions(inputValue); // Show autocomplete suggestions
            filterWebsites(); // Filter websites
        }, 300)
    );

    searchInput.addEventListener("focus", () => {
        const inputValue = searchInput.value;
        createAutocompleteSuggestions(inputValue); // Show suggestions on focus
    });

    searchInput.addEventListener("blur", () => {
        setTimeout(() => {
            document.getElementById("autocompleteContainer").innerHTML = ""; // Clear suggestions on blur after a short delay
        }, 100);
    });

    // Initialize function to handle updates to the active button
    function handleActiveButtonUpdate(tag) {
        const commonTagsContainer = document.getElementById(
            "commonTagsContainer"
        );
        const filterMenu = document.getElementById("filterMenu");

        // Remove active class from all buttons
        const allTags = commonTagsContainer.querySelectorAll(".filter-tag");
        allTags.forEach((el) => {
            el.classList.remove("active");
        });

        const filterTags = filterMenu.querySelectorAll(".filter-tag");
        filterTags.forEach((el) => {
            el.classList.remove("active");
        });

        // Add active class to the clicked button
        const clickedButton =
            Array.from(allTags).find((el) => el.textContent === tag) ||
            Array.from(filterTags).find((el) => el.textContent === tag);

        if (clickedButton) {
            clickedButton.classList.add("active");
        }
    }

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
