/* ===== MOBILE MENU ===== */
function toggleMenu() {
  document.querySelector("nav").classList.toggle("active");
}

/* ===== EMAILJS ===== */
(function () {
  if (typeof emailjs !== "undefined") {
    emailjs.init("YOUR_PUBLIC_KEY"); // replace
  }
})();

const form = document.getElementById("contact-form");

if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    emailjs.sendForm(
      "YOUR_SERVICE_ID",
      "YOUR_TEMPLATE_ID",
      this
    ).then(
      function () {
        alert("Message sent successfully!");
        form.reset();
      },
      function () {
        alert("Failed to send message. Try again.");
      }
    );
  });
}
/* =====================================================
   SCROLL REVEAL ANIMATIONS
===================================================== */

const reveals = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target); // animate once
      }
    });
  },
  {
    threshold: 0.15,
  }
);

reveals.forEach((reveal) => observer.observe(reveal));
