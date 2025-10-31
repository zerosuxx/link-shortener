const K = '1celxind';

(async () => {
    const hash = window.location.pathname.substring(1);
    if (hash == "") {
        return;
    }

    const data = await getValue(K, hash);
    if (data === '' || data === "''") {
        showToast('Short link not found', 'error');
        return;
    }

    try {
        const json = JSON.parse(atob(data));
        const url = json.u;
        const usageLeft = parseInt(json.c) - 1;

        showToast(`<a target="_blank" href="${url}">${url}</a> - (Usages left: ${usageLeft})`);
        if (usageLeft > 0) {
            json.c = usageLeft;
            await updateValue(K, hash, btoa(JSON.stringify(json)));
        } else {
            await updateValue(K, hash, "''");
            return;
        }
    } catch(err) {
        showToast(`Invalid short link ${err.message}`, 'error');
    }
})();


document.getElementById('url-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    await handleUrlSubmit();
});

document.getElementById('url-input').addEventListener('keypress', async function(e) {
    if (e.key !== 'Enter') {
        return;
    }

    e.preventDefault();
    await handleUrlSubmit();
});

async function handleUrlSubmit() {
    const urlInput = document.getElementById('url-input');
    const countInput = document.getElementById('count-input');
    const url = urlInput.value.trim();
    const maxUsageCount = countInput.value.trim();

    console.log(url, maxUsageCount);
    
    if (url == null) {
        showToast('Please enter a URL', 'error');
        return;
    }
    
    try {
        const u = new URL(url).toString();
        const hash = hashUrl(u);
        const shortenUrl = `https://l.zer0.hu/${hash}`;

        await updateValue(K, hash, btoa(JSON.stringify({u, c: maxUsageCount})));

        showToast(`Short url created: <a target="_blank" href="${shortenUrl}">${shortenUrl}</a> (Usage limit: ${maxUsageCount})`, 'success');
    } catch (error) {
        showToast(`Please enter a valid URL (${error.message})`, 'error');
    }
}

async function getValue(appkey, itemkey) {
    try {
        const res = await fetch(`https://keyvalue.immanuel.co/api/KeyVal/GetValue/${appkey}/${itemkey}`, {
            method: 'GET'
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.text();
        console.log('getValue:', data);
        return data.substring(1, data.length - 1);
    } catch (err) {
        console.error('getValue error:', err);
    }
}

async function updateValue(appkey, itemkey, itemval) {
    try {
        const res = await fetch(`https://keyvalue.immanuel.co/api/KeyVal/UpdateValue/${appkey}/${itemkey}/${itemval}`, {
            method: 'POST'
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.text();
        console.log('updateValue:', data);
        return data;
    } catch (err) {
        console.error('updateValue error:', err);
    }
}

function hashUrl(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}

// Toast notification system
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Add icon based on type
    const icon = document.createElement('div');
    icon.className = 'toast-icon';
    if (type === 'success') {
        icon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        `;
    } else {
        icon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
        `;
    }
    
    // Add message
    const messageEl = document.createElement('div');
    messageEl.className = 'toast-message';
    messageEl.innerHTML = message;
    
    toast.appendChild(icon);
    toast.appendChild(messageEl);
    container.appendChild(toast);
    
    // Auto remove after 3 seconds
    // setTimeout(() => {
    //     toast.style.animation = 'slideOut 0.3s ease-out forwards';
    //     setTimeout(() => {
    //         container.removeChild(toast);
    //     }, 300);
    // }, 3000);
}
