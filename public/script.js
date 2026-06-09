document.getElementById('jobForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const company = document.getElementById('company').value;
    const role = document.getElementById('role').value;
    const status = document.getElementById('status').value;

    const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, role, status })
    });

    if(response.ok) {
        // Reset Form
        document.getElementById('jobForm').reset();
        // Reload List
        fetchApplications();
    }
});

async function fetchApplications() {
    const response = await fetch('/api/applications');
    const data = await response.json();
    
    const jobList = document.getElementById('jobList');
    jobList.innerHTML = ''; // Clear previous

    data.forEach(job => {
        const div = document.createElement('div');
        div.className = `job-card status-${job.status}`;
        div.innerHTML = `
            <div>
                <h3>${job.company}</h3>
                <p><strong>Role:</strong> ${job.role}</p>
                <small>Date: ${job.date}</small>
            </div>
            <div>
                <span class="status-badge">${job.status}</span>
            </div>
        `;
        jobList.appendChild(div);
    });
}

// Initial Load
fetchApplications();