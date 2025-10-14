// public/js/script.js

// Run once the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚚 Delivery Management App loaded.");

    // Auto-dismiss Bootstrap alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            if (alert.classList.contains('show')) {
                alert.classList.remove('show');
            }
            alert.style.display = 'none';
        }, 5000);
    });

    // Handle delivery status update (for personnel)
    const statusForms = document.querySelectorAll('.status-form');
    statusForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const deliveryId = form.dataset.deliveryId;
            const newStatus = form.querySelector('select').value;

            try {
                const response = await fetch(`/personnel/update/${deliveryId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });

                if (response.ok) {
                    alert("✅ Delivery status updated successfully!");
                    window.location.reload();
                } else {
                    alert("⚠️ Failed to update delivery status.");
                }
            } catch (err) {
                console.error("Error updating delivery status:", err);
                alert("❌ Error communicating with the server.");
            }
        });
    });
});
