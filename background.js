chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ bookmarks: [] }, function () {
    console.log("Bookmark storage initialized.");
  });
});
