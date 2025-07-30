// navigation.js - Mobile Navigation Functionality

document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.getElementById('cs-navigation').querySelector('.cs-toggle');
    const navigation = document.getElementById('cs-navigation');
    const expanded = document.getElementById('cs-expanded');
    
    if (toggle) {
        toggle.addEventListener('click', function() {
            navigation.classList.toggle('cs-active');
            
            // Update aria-expanded for accessibility
            const isExpanded = navigation.classList.contains('cs-active');
            expanded.setAttribute('aria-expanded', isExpanded);
            
            // Toggle body overflow to prevent scrolling when menu is open
            if (isExpanded) {
                document.body.classList.add('cs-open');
            } else {
                document.body.classList.remove('cs-open');
            }
        });
    }

    // Close menu when clicking on navigation links
    const navLinks = document.querySelectorAll('.cs-li-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navigation.classList.remove('cs-active');
            document.body.classList.remove('cs-open');
            expanded.setAttribute('aria-expanded', 'false');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navigation.contains(e.target) && navigation.classList.contains('cs-active')) {
            navigation.classList.remove('cs-active');
            document.body.classList.remove('cs-open');
            expanded.setAttribute('aria-expanded', 'false');
        }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navigation.classList.contains('cs-active')) {
            navigation.classList.remove('cs-active');
            document.body.classList.remove('cs-open');
            expanded.setAttribute('aria-expanded', 'false');
        }
    });
});