// Array of website data
const websites = [
    {
        name: "Site 1",
        tags: ["3D", "SaaS"],
        summary:
            "This is a summary of the first website. It provides an overview of the site's content and purpose.",
        url: "https://www.example1.com",
        imageUrl: "https://via.placeholder.com/300x150",
    },
    {
        name: "Site 2",
        tags: ["Dark Mode", "Portfolio"],
        summary:
            "This is a summary of the second website. It offers insights into scientific research.",
        url: "https://www.example2.com",
        imageUrl: "https://via.placeholder.com/300x150",
    },
    // Add more websites
];

// Array of filter categories and options
const filterOptions = [
    {
        category: "Tags",
        options: ["3D", "SaaS", "Dark Mode", "Portfolio"],
    },
    {
        category: "Topics",
        options: ["web development", "machine learning", "data science"],
    },
    // Add more filters
];

// Function to create a website card
function createWebsiteCard(website) {
    const card = document.createElement("div");
    card.innerHTML = `
        <img src="${website.imageUrl}" alt="${website.name} Thumbnail">
        <div>
            <h3>${website.name}</h3>
            <p>Tags: <span>${website.tags.join(", ")}</span></p>
            <p>${website.summary}</p>
            <a href="${website.url}" target="_blank">Visit Site</a>
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

// Function to render filters dynamically
function renderFilters() {
    const filterContainer = document.getElementById("filter-container");
    filterContainer.innerHTML = ""; // Clear existing filters

    filterOptions.forEach((filterCategory) => {
        const categoryDiv = document.createElement("div");
        categoryDiv.className = "filter-category";

        const categoryTitle = document.createElement("h4");
        categoryTitle.textContent = filterCategory.category;
        categoryDiv.appendChild(categoryTitle);

        filterCategory.options.forEach((option) => {
            const label = document.createElement("label");
            label.innerHTML = `<input type="checkbox" value="${option}" class="filter-checkbox"> ${option}`;
            categoryDiv.appendChild(label);
        });

        filterContainer.appendChild(categoryDiv);
    });

    // Add event listeners for filtering after rendering filters
    document.querySelectorAll(".filter-checkbox").forEach((checkbox) => {
        checkbox.addEventListener("change", filterWebsites);
    });
}

// Function to filter websites by tags and search input
function filterWebsites() {
    const searchQuery = document
        .getElementById("searchInput")
        .value.toLowerCase();
    const selectedFilters = {};

    // Gather selected filters
    filterOptions.forEach((filterCategory) => {
        const selectedOptions = Array.from(
            document.querySelectorAll(`.filter-checkbox:checked`)
        ).map((cb) => cb.value);
        if (selectedOptions.length > 0) {
            selectedFilters[filterCategory.category.toLowerCase()] =
                selectedOptions;
        }
    });

    const filteredWebsites = websites.filter((website) => {
        // Check search query match
        const matchesSearchQuery =
            website.name.toLowerCase().includes(searchQuery) ||
            website.summary.toLowerCase().includes(searchQuery);

        // Check matches for all selected filters
        const matchesFilters = Object.keys(selectedFilters).every(
            (category) => {
                return selectedFilters[category].some((filter) => {
                    if (category === "tags") {
                        return website.tags.includes(filter);
                    }
                    // Add other category checks here as needed...
                });
            }
        );

        return matchesSearchQuery && matchesFilters;
    });

    renderGallery(filteredWebsites);
}

// Event listeners for filtering
document
    .getElementById("searchInput")
    .addEventListener("input", filterWebsites);

// Call the render functions on page load
document.addEventListener("DOMContentLoaded", () => {
    renderFilters(); // Render the filters
    renderGallery(); // Initially render all websites
});
