// Cache variables
let websitesCache = [];
let filterOptionsCache = [];
let allTags = new Set(); // Store unique tags for autocomplete

// Load data with caching
async function loadData() {
    if (websitesCache.length > 0) return websitesCache;

    try {
        const response = await fetch("/config/sites-config.json");
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

// Create autocomplete suggestions based on user input
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

// Load filters with caching
async function loadFilters() {
    if (filterOptionsCache.length > 0) return filterOptionsCache;

    try {
        const response = await fetch("/config/filters.json");
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

    image.loading = "lazy";
    image.classList.add("blurred");

    image.onload = function () {
        image.classList.remove("blurred");
    };

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

    // Wrap the card content in a div
    const cardWrapper = document.createElement("div");
    cardWrapper.className = "website-card";
    cardWrapper.appendChild(card);

    return cardWrapper;
}

// Variables
let displayedWebsitesCount = 0;
const websitesPerPage = 9;
let websites = [];
let filterOptions = [];
const selectedFilters = new Set();

// Render the gallery
function renderGallery(filteredWebsites = websites) {
    const gallery = document.getElementById("gallery");
    const loadMoreButton = document.getElementById("loadMoreButton");

    gallery.innerHTML = "";

    if (filteredWebsites.length === 0) {
        loadMoreButton.style.display = "none";
        return;
    }

    const websitesToShow = filteredWebsites.slice(0, displayedWebsitesCount);

    websitesToShow.forEach((website) => {
        const card = createWebsiteCard(website);
        gallery.appendChild(card);
    });

    loadMoreButton.style.display =
        displayedWebsitesCount >= filteredWebsites.length ? "none" : "block";
}

// Load more websites
function loadMoreWebsites() {
    const previousCount = displayedWebsitesCount;
    displayedWebsitesCount += websitesPerPage;

    const gallery = document.getElementById("gallery");
    const loadMoreButton = document.getElementById("loadMoreButton");

    // Get the current filtered websites
    const searchQuery = document
        .getElementById("searchInput")
        .value.toLowerCase();
    const filteredWebsites = websitesCache.filter((website) => {
        const matchesSearchQuery =
            website.name.toLowerCase().includes(searchQuery) ||
            website.summary.toLowerCase().includes(searchQuery) ||
            website.tags.some((tag) => tag.toLowerCase().includes(searchQuery));

        const matchesFilters =
            selectedFilters.size === 0 ||
            website.tags.some((tag) => selectedFilters.has(tag));

        return matchesSearchQuery && matchesFilters;
    });

    // Render only the new cards
    const newWebsites = filteredWebsites.slice(
        previousCount,
        displayedWebsitesCount
    );
    newWebsites.forEach((website) => {
        const card = createWebsiteCard(website);
        gallery.appendChild(card);
    });

    // Animate only the newly added cards
    gsap.fromTo(
        ".website-card:nth-child(n + " + (previousCount + 1) + ")",
        {
            opacity: 0,
            y: 30,
            scale: 0.95,
        },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.3,
            stagger: 0.05,
            ease: "power2.out",
        }
    );

    // Update the "Load more" button visibility
    loadMoreButton.style.display =
        displayedWebsitesCount >= filteredWebsites.length ? "none" : "block";
}

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
            span.className = "filter-tag";

            // Create an inner span to wrap the text content
            const innerSpan = document.createElement("span");
            innerSpan.textContent = tag;

            span.appendChild(innerSpan);
            span.addEventListener("click", () => toggleFilter(tag));
            categoryDiv.appendChild(span);
        });

        filterMenu.appendChild(categoryDiv);
    });
}

// Handle active button update
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

function handleAllFilter() {
    selectedFilters.clear();
    displayedWebsitesCount = websitesPerPage;
    handleActiveButtonUpdate("All");
    filterWebsites();
}

// Toggle filter state and update display
function toggleFilter(tag) {
    if (tag === "All") {
        handleAllFilter();
        return;
    }

    if (selectedFilters.has(tag)) {
        selectedFilters.delete(tag);
    } else {
        selectedFilters.clear();
        selectedFilters.add(tag);
    }

    displayedWebsitesCount = websitesPerPage;
    handleActiveButtonUpdate(tag);
    filterWebsites();
}

// Filter websites by tags and search input
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

    // Only animate cards if there are filtered websites
    if (filteredWebsites.length > 0) {
        animateWebsiteCards();
    }

    // Show or hide the error message based on the number of filtered results
    const errorMessage = document.getElementById("error-message");
    if (filteredWebsites.length === 0) {
        errorMessage.style.display = "block";
    } else {
        errorMessage.style.display = "none";
    }
}

// Toggle the visibility of the filter menu
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

// Toggle search bar visibility
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

    filterButton.addEventListener("click", function (event) {
        event.stopPropagation();

        // Toggle active state
        filterButton.classList.toggle("active");

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

    // Create "All" button
    const allButton = document.createElement("button");
    allButton.className = "filter-tag active";
    const allButtonText = document.createElement("span");
    allButtonText.textContent = "All";
    allButton.appendChild(allButtonText);
    allButton.addEventListener("click", () => {
        handleAllFilter();
    });
    commonTagsContainer.appendChild(allButton);

    // Create filter tag buttons
    topTags.forEach((tag) => {
        const tagButton = document.createElement("button");
        tagButton.className = "filter-tag";
        const tagButtonText = document.createElement("span");
        tagButtonText.textContent = tag;
        tagButton.appendChild(tagButtonText);
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

    // Get the height of the document and the scroll position
    const scrollPosition = window.scrollY;
    const documentHeight = document.body.scrollHeight;

    const scrollPercent = scrollPosition / (documentHeight - windowHeight);

    const newOpacity = Math.min(0.1 + scrollPercent * 0.9, 1);
    const newTransform = `translate3d(0, ${scrollPercent * 10}px, 0) scale(1)`;

    footerHeading.style.opacity = newOpacity;
    footerHeading.style.transform = newTransform;
});

// Animate website cards
function animateWebsiteCards() {
    return gsap.fromTo(
        ".website-card",
        {
            opacity: 0,
            y: 30,
        },
        {
            opacity: 1,
            y: 0,
            duration: 0.3,
            stagger: 0.05,
            ease: "power2.out",
        }
    );
}

// Preloader and animations
window.onload = function () {
    // Preloader animation
    document.querySelector(".loader-slide").classList.add("open");

    // Start animations earlier, while preloader is still running
    setTimeout(function () {
        startAnimations();
        filterWebsites(); // Render the gallery (this will also animate the cards)
    }, 1000); // Start animations halfway through the preloader

    // Hide the preloader and show the main content
    setTimeout(function () {
        const preloader = document.getElementById("preloader");
        preloader.style.display = "none";

        document.body.style.overflowY = "auto";
    }, 2000);
};

// Start GSAP animations
function startAnimations() {
    const tl = gsap.timeline();

    tl.from(".nav-item", {
        opacity: 0,
        y: -20,
        duration: 0.5,
        ease: "power2.out",
    })
        .from(
            "h1",
            {
                opacity: 0,
                y: 20,
                duration: 0.5,
                ease: "power2.out",
            },
            "-=0.3"
        )
        .from(
            ".header-headings h2",
            {
                opacity: 0,
                y: 20,
                duration: 0.7,
                ease: "power2.out",
                stagger: 0.1,
            },
            "-=0.4"
        )
        .from(
            "#filterButton",
            {
                opacity: 0,
                y: 20,
                duration: 0.5,
                ease: "power2.out",
            },
            "-=0.3"
        )
        .from(
            "#commonTagsContainer",
            {
                opacity: 0,
                y: 20,
                duration: 0.5,
                ease: "power2.out",
            },
            "-=0.3"
        )
        .from(
            ".filter-divider",
            {
                opacity: 0,
                scaleX: 0,
                duration: 0.5,
                ease: "power2.out",
            },
            "-=0.3"
        )
        .from("#filterMenu", {
            opacity: 0,
            y: 10,
            duration: 0.5,
            ease: "power2.out",
        })
        .add(animateWebsiteCards()); // Add the website card animation at the end
}
