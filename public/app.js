const API_URL = '/api';
let token = localStorage.getItem('token');
let chartInstance = null;

// Categories for colors and icons
const categoryConfig = {
    'Food': { color: '#ff9500', icon: 'ph-hamburger' },
    'Transport': { color: '#007aff', icon: 'ph-car' },
    'Shopping': { color: '#af52de', icon: 'ph-shopping-bag' },
    'Bills': { color: '#ff3b30', icon: 'ph-receipt' },
    'Entertainment': { color: '#ff2d55', icon: 'ph-film-strip' },
    'Education': { color: '#5856d6', icon: 'ph-book-open' },
    'Health': { color: '#34c759', icon: 'ph-heartbeat' },
    'Other': { color: '#8e8e93', icon: 'ph-dots-three' }
};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('modal-exp-date').valueAsDate = new Date();
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    document.getElementById('current-month-display').innerText = currentMonth;
    checkAuth();
});

// Toast System
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `mac-toast ${type}`;
    toast.innerHTML = `<i class="ph ${type === 'success' ? 'ph-check-circle' : 'ph-warning-circle'}"></i> ${message}`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Auth Logic
async function checkAuth() {
    if (!token) {
        showAuth();
        return;
    }
    
    try {
        const res = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success) {
            setupUserUI(data.user);
            showMainApp();
            loadDashboardData();
        } else {
            logout(false);
        }
    } catch (e) {
        logout(false);
    }
}

function setupUserUI(user) {
    document.getElementById('user-name-display').innerText = user.name;
    document.getElementById('greeting-title').innerText = `Good morning, ${user.name.split(' ')[0]} 👋`;
    document.getElementById('user-avatar').innerText = user.name.substring(0,2).toUpperCase();
    document.getElementById('setting-name').value = user.name;
    document.getElementById('setting-email').value = user.email;
}

function showAuth() {
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('main-app').style.display = 'none';
}

function showMainApp() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('main-app').style.display = 'flex';
}

function toggleAuth() {
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('register-form');
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        regForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        regForm.style.display = 'block';
    }
}

async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const btn = document.querySelector('#login-form button');
    
    if(!email || !password) return showToast('Please fill all fields', 'error');
    
    btn.disabled = true;
    btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Logging in...';
    
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success) {
            token = data.token;
            localStorage.setItem('token', token);
            checkAuth();
            showToast('Welcome back!');
        } else {
            showToast(data.error.message, 'error');
        }
    } catch (e) {
        showToast('Connection error', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Login';
    }
}

async function register() {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-password-confirm').value;
    
    if(!name || !email || !password) return showToast('Fill required fields', 'error');
    if(password !== confirm) return showToast('Passwords do not match', 'error');
    
    const btn = document.querySelector('#register-form button');
    btn.disabled = true;
    
    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (data.success) {
            toggleAuth();
            document.getElementById('login-email').value = email;
            showToast('Account created. Please login.');
        } else {
            showToast(data.error.message, 'error');
        }
    } catch (e) {
        showToast('Connection error', 'error');
    } finally {
        btn.disabled = false;
    }
}

function logout(notify = true) {
    token = null;
    localStorage.removeItem('token');
    showAuth();
    if(notify) showToast('Logged out successfully');
}

// Navigation
function switchTab(tabId) {
    document.querySelectorAll('.view-section').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    
    document.getElementById(`view-${tabId}`).style.display = 'block';
    
    const navLink = Array.from(document.querySelectorAll('.nav-item')).find(el => el.getAttribute('onclick').includes(tabId));
    if(navLink) navLink.classList.add('active');
    
    if (tabId === 'dashboard' || tabId === 'expenses') loadDashboardData();
}

// Modals
function openAddModal() {
    document.getElementById('add-expense-modal').classList.add('active');
}
function closeAddModal() {
    document.getElementById('add-expense-modal').classList.remove('active');
}

// Data Fetching
async function loadDashboardData() {
    await Promise.all([fetchSummary(), fetchExpenses()]);
}

async function fetchSummary() {
    try {
        const res = await fetch(`${API_URL}/summary`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        
        if (data.success) {
            const s = data.summary;
            document.getElementById('sum-total').innerText = `₹${s.totalSpending.toLocaleString()}`;
            document.getElementById('sum-month').innerText = `₹${s.monthlySpending.toLocaleString()}`;
            document.getElementById('sum-count').innerText = s.numExpenses;
            document.getElementById('sum-top').innerText = s.topCategory;
            
            let pct = 0;
            if(s.monthlySpending > 0 && s.categoryBreakdown[s.topCategory]) {
                pct = Math.round((s.categoryBreakdown[s.topCategory] / s.monthlySpending) * 100);
            }
            document.getElementById('sum-top-pct').innerText = `${pct}% of spending`;
            document.getElementById('chart-total').innerText = `₹${s.monthlySpending.toLocaleString()}`;
            
            renderChart(s.categoryBreakdown);
        }
    } catch(e) {
        console.error('Error fetching summary', e);
    }
}

function renderChart(breakdown) {
    const ctx = document.getElementById('spendingChart').getContext('2d');
    const legendContainer = document.getElementById('chart-legend');
    legendContainer.innerHTML = '';
    
    const labels = Object.keys(breakdown);
    const dataVals = Object.values(breakdown);
    const total = dataVals.reduce((a,b)=>a+b, 0);
    
    const bgColors = labels.map(cat => categoryConfig[cat] ? categoryConfig[cat].color : categoryConfig['Other'].color);
    
    if(chartInstance) {
        chartInstance.destroy();
    }
    
    if(labels.length === 0) {
        legendContainer.innerHTML = '<p class="placeholder-text">No expenses this month</p>';
        return;
    }
    
    // Sort for legend
    const sortedCats = labels.map((l, i) => ({label: l, val: dataVals[i], color: bgColors[i]}))
                             .sort((a,b) => b.val - a.val);
                             
    sortedCats.forEach(item => {
        const pct = total > 0 ? Math.round((item.val / total) * 100) : 0;
        legendContainer.innerHTML += `
            <div class="legend-item">
                <div class="legend-label"><span class="legend-dot" style="background:${item.color}"></span> ${item.label}</div>
                <div class="legend-value">₹${item.val.toLocaleString()} <span style="color:var(--text-secondary);font-size:12px;margin-left:4px">${pct}%</span></div>
            </div>
        `;
    });

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dataVals,
                backgroundColor: bgColors,
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            cutout: '75%',
            plugins: { legend: { display: false }, tooltip: { enabled: true } },
            animation: { animateScale: true, animateRotate: true }
        }
    });
}

async function fetchExpenses() {
    try {
        const res = await fetch(`${API_URL}/expenses`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        
        if (data.success) {
            // Recent list for dashboard (max 5)
            const recentList = document.getElementById('recent-expenses-list');
            recentList.innerHTML = '';
            
            if(data.expenses.length === 0) {
                recentList.innerHTML = '<p class="placeholder-text" style="padding:20px;">No recent expenses found.</p>';
            }
            
            data.expenses.slice(0, 5).forEach(exp => {
                const conf = categoryConfig[exp.category] || categoryConfig['Other'];
                recentList.innerHTML += `
                    <div class="recent-item">
                        <div class="exp-info">
                            <div class="exp-icon" style="color:${conf.color}; background:${conf.color}20"><i class="ph ${conf.icon}"></i></div>
                            <div class="exp-details">
                                <h4>${exp.description || 'Unknown'}</h4>
                                <p>${exp.category} • ${new Date(exp.date).toLocaleDateString('en-US', {month:'short', day:'numeric'})}</p>
                            </div>
                        </div>
                        <div class="exp-amount">₹${parseFloat(exp.amount).toLocaleString()}</div>
                    </div>
                `;
            });
            
            // Full list for expenses page
            const fullList = document.getElementById('full-expenses-list');
            fullList.innerHTML = '';
            data.expenses.forEach(exp => {
                fullList.innerHTML += `
                    <tr>
                        <td>${new Date(exp.date).toLocaleDateString()}</td>
                        <td style="font-weight:500">${exp.description || '-'}</td>
                        <td>${exp.category}</td>
                        <td>₹${parseFloat(exp.amount).toLocaleString()}</td>
                        <td>
                            <button class="action-btn delete" onclick="deleteExpense(${exp.id})" title="Delete"><i class="ph ph-trash"></i></button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch(e) {
        console.error('Error fetching expenses', e);
    }
}

async function submitExpense() {
    const amount = document.getElementById('modal-exp-amount').value;
    const category = document.getElementById('modal-exp-category').value;
    const description = document.getElementById('modal-exp-desc').value;
    const date = document.getElementById('modal-exp-date').value;
    
    if (!amount || !category || !date) return showToast('Amount and Date are required', 'error');
    
    const btn = document.querySelector('.modal-footer .btn-primary');
    btn.disabled = true;
    
    try {
        const res = await fetch(`${API_URL}/expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ amount, category, description, date })
        });
        
        const data = await res.json();
        if (data.success) {
            document.getElementById('modal-exp-amount').value = '';
            document.getElementById('modal-exp-desc').value = '';
            closeAddModal();
            loadDashboardData();
            showToast('Expense added successfully');
        } else {
            showToast(data.error.message, 'error');
        }
    } catch(e) {
        showToast('Failed to add expense', 'error');
    } finally {
        btn.disabled = false;
    }
}

async function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
        const res = await fetch(`${API_URL}/expenses/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            loadDashboardData();
            showToast('Expense deleted');
        } else {
            showToast('Failed to delete', 'error');
        }
    } catch(e) {
        showToast('Connection error', 'error');
    }
}

// AI Feature
async function generateInsights() {
    const introCard = document.getElementById('ai-intro-card');
    const resultCard = document.getElementById('ai-result-card');
    const btn = document.getElementById('btn-generate-ai');
    
    const highlight = document.getElementById('ai-highlight-text');
    const details = document.getElementById('ai-details-content');
    
    btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Analyzing your spending...';
    btn.disabled = true;
    
    try {
        const res = await fetch(`${API_URL}/insights`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success) {
            introCard.style.display = 'none';
            resultCard.style.display = 'block';
            
            // Simple parsing to split highlight and bullet points
            const text = data.insights;
            const parts = text.split('Suggestions:');
            
            highlight.innerText = parts[0].trim();
            if(parts.length > 1) {
                const listItems = parts[1].split('•').filter(s => s.trim().length > 0).map(s => `<li>${s.trim()}</li>`).join('');
                details.innerHTML = `<p><strong>Suggestions:</strong></p><ul>${listItems}</ul>`;
            } else {
                details.innerHTML = '';
            }
            
            showToast('Insights generated!');
        } else {
            showToast('We couldn\'t generate insights right now. Please try again.', 'error');
        }
    } catch (e) {
        showToast('We couldn\'t generate insights right now. Please try again.', 'error');
    } finally {
        btn.innerHTML = '<i class="ph ph-magic-wand"></i> Generate Insights';
        btn.disabled = false;
    }
}

// PDF Feature
async function generatePDF() {
    const btn = document.getElementById('btn-generate-pdf');
    btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Generating...';
    btn.disabled = true;
    
    try {
        const res = await fetch(`${API_URL}/reports`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Expense_Report.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            showToast('Report downloaded');
        } else {
            showToast('Failed to generate report', 'error');
        }
    } catch (e) {
        showToast('Connection error', 'error');
    } finally {
        btn.innerHTML = '<i class="ph ph-download-simple"></i> Generate PDF';
        btn.disabled = false;
    }
}
