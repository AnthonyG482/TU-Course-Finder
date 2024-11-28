function modifyText() {
  const iframe = document.querySelector("iframe");  // or other nested container
  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  
  const element = iframeDoc.querySelector("div.cx-MuiTypography-h1");

  if (element) {
    console.log("Element found:", element); // Debugging log
    element.textContent = 'EXTENSION LOADED';
  } else {
    console.log("Target element not found."); // Debugging log
  }
}

// Observe changes in the DOM
const observer = new MutationObserver(() => {
  console.log("DOM mutation detected, attempting to modify text."); // Debugging log
  modifyText();
});

observer.observe(document.body, { childList: true, subtree: true });
console.log("Content script loaded and observer initialized."); // Debugging log

// Initial check
modifyText();
