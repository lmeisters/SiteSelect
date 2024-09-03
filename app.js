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

// Initialize function to handle updates to the active button
function handleActiveButtonUpdate(tag) {
    const commonTagsContainer = document.getElementById("commonTagsContainer");
    const filterMenu = document.getElementById("filterMenu");

    // Remove active class from all buttons
    commonTagsContainer
        .querySelectorAll(".filter-tag")
        .forEach((el) => el.classList.remove("active"));
    filterMenu
        .querySelectorAll(".filter-tag")
        .forEach((el) => el.classList.remove("active"));

    // Add active class to the clicked button
    const clickedButton = [
        ...commonTagsContainer.querySelectorAll(".filter-tag"),
        ...filterMenu.querySelectorAll(".filter-tag"),
    ].find((el) => el.textContent === tag);

    if (clickedButton) clickedButton.classList.add("active");
}

// Function to toggle filter state and update display
function toggleFilter(tag) {
    const filterMenu = document.getElementById("filterMenu");
    const commonTagsContainer = document.getElementById("commonTagsContainer");
    const allTags = filterMenu.querySelectorAll(".filter-tag");
    const commonTags = commonTagsContainer.querySelectorAll(".filter-tag");

    // Find the clicked tag element
    const clickedTag =
        Array.from(allTags).find((el) => el.textContent === tag) ||
        Array.from(commonTags).find((el) => el.textContent === tag);

    if (clickedTag) {
        if (clickedTag.classList.contains("active")) {
            // If the clicked tag is already active, deactivate it
            clickedTag.classList.remove("active");
            selectedFilters.delete(tag); // Remove tag from selected filters
        } else {
            // Otherwise, activate the tag
            clickedTag.classList.add("active");
            selectedFilters.clear(); // Clear any other active filters (if necessary)
            selectedFilters.add(tag); // Add this tag to selected filters
            handleActiveButtonUpdate(tag);
        }

        // Update the gallery based on the selected filters
        filterWebsites();
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

window.onload = function () {
    // Preloader animation
    document.querySelector(".loader-slide").classList.add("open");

    // Get the scrollbar width to handle content shift
    const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

    // Start animations earlier, while preloader is still running
    setTimeout(function () {
        startAnimations(); // Start GSAP animations
    }, 1000); // Delay animations

    // Hide the preloader and show the main content
    setTimeout(function () {
        // Remove the preloader
        const preloader = document.getElementById("preloader");
        preloader.style.display = "none";

        // Allow scrolling by removing overflow: hidden from body
        document.body.style.overflowY = "auto";

        // Show the main content
    }, 2000); // 2000ms = 2 seconds; adjust to simulate load time
};

function startAnimations() {
    // Create a GSAP timeline for sequencing animations
    const tl = gsap.timeline();

    // Animate the nav item
    tl.from(".nav-item", {
        opacity: 0, // Start from transparent
        y: -20, // Start 20px above its original position
        duration: 0.5, // Quicker duration of 0.5 seconds
        ease: "power2.out", // Smooth easing function
    });

    // Animate the main header (h1)
    tl.from(
        "h1",
        {
            opacity: 0, // Start from transparent
            y: 20, // Start 20px below its original position
            duration: 0.5, // Quicker duration of 0.5 seconds
            ease: "power2.out", // Smooth easing function
        },
        "-=0.3"
    ); // Start this animation 0.3 seconds before the previous one ends

    // Animate the secondary header (h2)
    tl.from(
        ".header-headings h2",
        {
            opacity: 0, // Start from transparent
            y: 20, // Start 20px below its original position
            duration: 0.7, // Slightly longer but quicker duration of 0.7 seconds
            ease: "power2.out", // Smooth easing function
            stagger: 0.1, // Shorter stagger for quicker animation
        },
        "-=0.4"
    ); // Start this animation 0.4 seconds before the previous one ends

    // Animate the filter button and tags container
    tl.from(
        "#filterButton",
        {
            opacity: 0, // Start from transparent
            y: 20, // Start 20px below its original position
            duration: 0.5, // Quicker duration of 0.5 seconds
            ease: "power2.out", // Smooth easing function
        },
        "-=0.3"
    ); // Start this animation 0.3 seconds before the previous one ends

    tl.from(
        "#commonTagsContainer",
        {
            opacity: 0, // Start from transparent
            y: 20, // Start 20px below its original position
            duration: 0.5, // Quicker duration of 0.5 seconds
            ease: "power2.out", // Smooth easing function
        },
        "-=0.3"
    ); // Start this animation 0.3 seconds before the previous one ends

    // Animate the hr divider
    tl.from(
        ".filter-divider",
        {
            opacity: 0, // Start from transparent
            scaleX: 0, // Start from zero width
            duration: 0.5, // Quicker duration of 0.5 seconds
            ease: "power2.out", // Smooth easing function
        },
        "-=0.3"
    ); // Start this animation 0.3 seconds before the previous one ends

    // Animate the filter menu (if it's being shown dynamically)
    tl.from(
        "#filterMenu",
        {
            opacity: 0, // Start from transparent
            y: 10, // Start 10px below its original position
            duration: 0.5, // Quicker duration of 0.5 seconds
            ease: "power2.out", // Smooth easing function
        },
        "-=0.3"
    ); // Start this animation 0.3 seconds before the previous one ends
}
