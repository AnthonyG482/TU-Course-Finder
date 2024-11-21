console.log("Towson PeopleSoft Styler script loaded!");

// Use partial class matching to target the element
const greetingElement = document.querySelector('.cx-MuiTypography-root.cx-MuiTypography-h1.cx-MuiTypography-noWrap');

if (greetingElement) {
  greetingElement.textContent = "!!EXTENSION LOADED!!";
  greetingElement.style.color = "red";
  greetingElement.style.fontWeight = "bold";
  console.log("Greeting modified successfully!");
} else {
  console.log("Greeting element not found.");
}
