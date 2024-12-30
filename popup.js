document.addEventListener('DOMContentLoaded', function () {
  const bookmarkButton = document.getElementById('bookmark-button');
  const clearButton = document.getElementById('clear-button');
  const bookmarksList = document.getElementById('bookmarks-list');

  // Load saved bookmarks on load
  chrome.storage.sync.get(['bookmarks'], function (result) {
    const bookmarks = result.bookmarks || [];
    bookmarks.forEach(addBookmarkToList);
  });

  // Save bookmark when button is clicked
  bookmarkButton.addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      const url = new URL(tab.url);
      if (url.hostname === 'www.youtube.com' && url.pathname === '/watch') {
        const videoId = url.searchParams.get('v');
        const timestamp = Math.floor(tab.currentTime);

        chrome.storage.sync.get(['bookmarks'], function (result) {
          const bookmarks = result.bookmarks || [];
          const bookmark = {
            videoId,
            title: tab.title,
            timestamp,
            url: `${url.origin}${url.pathname}?v=${videoId}&t=${timestamp}s`,
            thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` // Fetch video thumbnail
          };
          bookmarks.push(bookmark);
          chrome.storage.sync.set({ bookmarks });
          addBookmarkToList(bookmark);
        });
      }
    });
  });

  // Clear all bookmarks
  clearButton.addEventListener('click', function () {
    chrome.storage.sync.set({ bookmarks: [] }, function () {
      bookmarksList.innerHTML = ''; // Clear the list
      console.log("All bookmarks cleared.");
    });
  });

  // Add bookmark to list and attach click handler to navigate to the timestamp
  function addBookmarkToList(bookmark) {
    const li = document.createElement('li');
    const thumbnail = document.createElement('img');
    thumbnail.src = bookmark.thumbnail;
    thumbnail.alt = 'Video Thumbnail';
    thumbnail.style.width = '50px';
    thumbnail.style.height = 'auto';
    thumbnail.style.marginRight = '10px';
    
    const span = document.createElement('span');
    span.textContent = `${bookmark.title} @ ${formatTime(bookmark.timestamp)}`;

    li.appendChild(thumbnail);
    li.appendChild(span);
    li.addEventListener('click', function () {
      chrome.tabs.create({ url: bookmark.url });
    });
    bookmarksList.appendChild(li);
  }

  // Format time (e.g., 123 seconds to "2:03")
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
});
