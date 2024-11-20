// created 11/20/24
// Author: Anthony R. Garcia
// Details: Main Code for javascript extension to hook into pre-existing website
// - purpose is to be used to alter the underlying content of the Towson course registration page.
// If a website has any animations to menu bars... it likely counts as a Dynamic one.


// Example: Change the background color of a specific element
document.addEventListener('DOMContentLoaded', () => {
    const targetElement = document.querySelector('.target-class'); // Adjust selector
    if (targetElement) {
      targetElement.style.backgroundColor = 'yellow'; // Change as needed
      targetElement.textContent = "Modified by Chrome Extension";
    }
  });


// If we are monitoring text of a DYNAMICALLY-Updated website (a.k.a. PeopleSoft), 
//  -then we must use >Mutation< observers to edit elements like text:
document.addEventListener('DOMContentLoaded', () => {
    const targetElement = document.querySelector('.target-class');
  
    if (targetElement) {
      const observer = new MutationObserver(() => {
        targetElement.textContent = "Dynamically Updated Text!";
      });
  
      observer.observe(targetElement, { childList: true, subtree: true });
    }
  });
// This will ensure that any of our changes persist, even if the page is updated
// dynamically (such as any viewable Elements being moved, hidden, or deleted).

