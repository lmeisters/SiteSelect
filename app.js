// Function to load data from the JSON file
async function loadData() {
    try {
        const response = await fetch("websites.json");
        return await response.json();
    } catch (error) {
        console.error("Error loading data:", error);
        return [];
    }
}

// Function to load filter options from the JSON file
async function loadFilters() {
    try {
        const response = await fetch("filters.json");
        return await response.json();
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
                <p class="website-tags"><span>${topTags.join(", ")}</span></p>
            </div>
            <hr />
            <p class="website-summary">${website.summary}</p>
        </div>
    `;
    return card;
}

// Initialize variables
let displayedWebsitesCount = 0;
const websitesPerPage = 6;
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

    allTags.forEach((el) => {
        if (el.textContent === tag) {
            el.classList.toggle("active");
            el.classList.contains("active")
                ? selectedFilters.add(tag)
                : selectedFilters.delete(tag);
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
        const matchesSearchQuery =
            website.name.toLowerCase().includes(searchQuery) ||
            website.summary.toLowerCase().includes(searchQuery) ||
            website.tags.some((tag) => tag.toLowerCase().includes(searchQuery));

        const matchesFilters = [...selectedFilters].every((filter) =>
            website.tags.includes(filter)
        );

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

// Function to update the active state of the filter buttons
function updateActiveButton(activeButton) {
    document
        .querySelectorAll(".filter-tag")
        .forEach((button) => button.classList.remove("active"));
    activeButton.classList.add("active");
}

// Function to update active button state
function handleActiveButtonUpdate(option) {
    const allButton = document.querySelector(".filter-tag[textContent='All']");
    const selectedButton = document.querySelector(
        `.filter-tag[textContent="${option}"]`
    );
    if (option !== "All") allButton.classList.remove("active");
    updateActiveButton(selectedButton || allButton);
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
    document
        .getElementById("searchInput")
        .addEventListener("input", filterWebsites);

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

    filterWebsites();
});
