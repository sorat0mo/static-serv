// --- Utilities ---
const trustedTypesPolicy =
window.trustedTypes &&
window.trustedTypes.createPolicy('default', {
  createHTML: (input) => input, // Optionally sanitize input in production
});

// --- Content Initialization ---
function initializeBlogContent() {
  // Blog configuration values are now hardcoded
  const blogConfig = {
    rssFeed: "https://blog.karsten.ws/feed.atom",
    wordCount: 50,
  };

  // --- Blog Post Preview ---
  const blogSection = document.querySelector('.blog-section');
  const postContentElement = document.querySelector('.post-content');
  const sanitize = window.DOMPurify ? window.DOMPurify.sanitize : (html) => html;

  if (blogConfig.rssFeed && postContentElement) {
    fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(blogConfig.rssFeed)}`)
    .then((response) => response.json())
    .then((data) => {
      if (!data.items || data.items.length === 0) {
        throw new Error('No blog items found in the RSS feed.');
      }
      const post = data.items[0];
      const blogHTML = `
      <h4>${post.title}</h4>
      <p>${post.description.split(' ').slice(0, blogConfig.wordCount).join(' ')}...</p>
      <a href="${post.link}" class="read-more" target="_blank" rel="noopener noreferrer" aria-label="Read more about ${post.title}">Read More →</a>`;

      postContentElement.innerHTML = trustedTypesPolicy
      ? trustedTypesPolicy.createHTML(sanitize(blogHTML))
      : sanitize(blogHTML);
    })
    .catch((error) => {
      console.error('Error fetching blog post:', error);
      const blogUrl = blogConfig.rssFeed.split('/feed')[0];
      const fallbackHTML = `<p>Visit my blog at <a href="${blogUrl}" aria-label="Visit blog">blog</a></p>`;

      postContentElement.innerHTML = trustedTypesPolicy
      ? trustedTypesPolicy.createHTML(sanitize(fallbackHTML))
      : sanitize(fallbackHTML);
    });
  } else if (blogSection) {
    // If the blog section exists but there's no config or target element, remove it.
    blogSection.remove();
  }
}

document.addEventListener('DOMContentLoaded', initializeBlogContent);
