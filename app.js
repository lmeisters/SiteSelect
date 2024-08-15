// Array of website data
const websites = [
    {
        name: "Awwwards",
        tags: ["Education", "SaaS", "Technology"],
        summary:
            "Get inspired by real landing page examples with full website screenshots",
        url: "https://www.example1.com",
        imageUrl:
            "https://cdn.prod.website-files.com/64760069e93084646c9ee428/64776faa0c1419b8475edd51_www.awwwards.com_%20(1).jpg",
    },
    {
        name: "Example Site 2",
        tags: ["eCommerce", "Health & Fitness", "Blog"],
        summary:
            "This is a summary of the second website. It offers insights into scientific research.",
        url: "https://www.example2.com",
        imageUrl:
            "https://cdn.prod.website-files.com/64760069e93084646c9ee428/64776faa0c1419b8475edd51_www.awwwards.com_%20(1).jpg",
    },
    {
        name: "Example Site 3",
        tags: ["Portfolio", "Design Tools", "Technology"],
        summary: "This site showcases portfolios and design tools.",
        url: "https://www.example3.com",
        imageUrl:
            "https://cdn.prod.website-files.com/64760069e93084646c9ee428/64776faa0c1419b8475edd51_www.awwwards.com_%20(1).jpg",
    },
    // Add more websites as needed...
];

// Array of filter categories and options
const filterOptions = [
    {
        category: "Tags",
        options: [
            "3D Websites",
            "SaaS",
            "eCommerce",
            "Dark Mode",
            "Agency",
            "Portfolio",
            "App",
            "Artificial Intelligence",
            "Beauty",
            "Blockchain",
            "Blog",
            "Book",
            "Bot",
            "Business",
            "CMS",
            "Coming Soon",
            "Community",
            "Corporate",
            "Creative",
            "Cryptocurrency",
            "Culture",
            "Design Tools",
            "No-Code Tools",
            "Development Tools",
            "Education",
            "Entertainment",
            "Event",
            "Fashion",
            "Finance",
            "Foundry",
            "Food & Drinks",
            "Furniture & Interiors",
            "Gradient Style",
            "Health & Fitness",
            "Hosting",
            "Illustration",
            "Insurance",
            "Isometric",
            "Magazine",
        ],
    },
    // Add more filter categories and options here as needed...
];

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
            <p class="website-tags"><span>${website.tags.join(", ")}</span></p>
            </div>
            <hr />
            <p class="website-summary">${website.summary}</p>
        </div>
    `;
    return card;
}

// Function to render the gallery
function renderGallery(filteredWebsites = websites) {
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = ""; // Clear current content

    filteredWebsites.forEach((website) => {
        const card = createWebsiteCard(website);
        gallery.appendChild(card);
    });
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

// Store selected filters
const selectedFilters = new Set();

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

// Function to toggle search bar visibility
function toggleSearchBar() {
    const searchContainer = document.getElementById("searchContainer");
    const searchInput = document.getElementById("searchInput");

    if (
        searchContainer.style.display === "block" ||
        searchContainer.style.display === ""
    ) {
        searchContainer.style.display = "none";
    } else {
        searchContainer.style.display = "block";
        searchInput.focus(); // Automatically focus on the search input
    }
}

// Event listeners
document.addEventListener("DOMContentLoaded", function () {
    const searchToggle = document.getElementById("searchToggle");
    const searchContainer = document.getElementById("searchContainer");
    const closeSearch = document.getElementById("closeSearch");

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
});

document
    .getElementById("searchInput")
    .addEventListener("input", filterWebsites);

// Call the render functions on page load
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("searchContainer").style.display = "none"; // Ensure hidden initially
    renderFilters(); // Render the filters
    renderGallery(); // Initially render all websites
});
