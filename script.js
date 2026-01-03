// گوگل ڈرائیو فولڈر آئی ڈیز
const FOLDERS = {
    novel: '1PWDGvI9Pxkzma58-BDPZYAxq4Mhw1gdu',
    poetry: '1Bje7U53wmDHhuUrAvj-NaHDAXAfMiG_h',
    codewords: '1n8MuNqMaOe6eAntLDf-zTHXaNji3NEkn',
    about: '1QHIFfbqFIcpzHKEwEzPlRovHrC4t7wkX'
};

// آپ کی اے پی آئی کی (API Key)
const API_KEY = 'AIzaSyCMppjIJi2_xBi3oLVXN0XjdANMX10xmwE';

let purchasedEpisodes = JSON.parse(localStorage.getItem('purchased_episodes')) || [];
let currentPurchase = null;

// پیج لوڈ ہونے پر ڈیٹا دکھائیں
window.addEventListener('DOMContentLoaded', () => {
    loadEpisodes();
});

function showSection(section) {
    document.getElementById('home-screen').style.display = 'none';
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.getElementById(section + '-section').classList.add('active');

    if (section === 'poetry') loadDriveContent(FOLDERS.poetry, 'poetry-container');
    if (section === 'codewords') loadDriveContent(FOLDERS.codewords, 'codewords-container');
    if (section === 'about') loadDriveContent(FOLDERS.about, 'about-container');
}

function showHome() {
    document.getElementById('home-screen').style.display = 'block';
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
}

// ناول کی اقساط لوڈ کریں
function loadEpisodes() {
    const container = document.getElementById('episodes-container');
    if (!container) return;
    container.innerHTML = '';

    for (let i = 1; i <= 100; i++) {
        const card = document.createElement('div');
        card.className = 'episode-card';
        let packageId = i <= 10 ? 'free' : (i <= 80 ? Math.ceil((i - 10) / 5) : 'final');
        
        if (i <= 10 || purchasedEpisodes.includes('pkg_' + packageId)) {
            card.innerHTML = `<div class="episode-number">قسط ${i}</div><div class="episode-label">کھل گئی</div>`;
            card.onclick = () => openEpisode(i);
        } else {
            let price = i <= 50 ? 50 : (i <= 80 ? 100 : 300);
            card.innerHTML = `<div class="episode-number">قسط ${i}</div><div class="episode-label">${price} روپے</div>`;
            card.onclick = () => showPaymentModal(i, price, packageId);
        }
        container.appendChild(card);
    }
}

// گوگل ڈرائیو سے شاعری اور دیگر مواد لوڈ کریں
async function loadDriveContent(folderId, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<div class="loading">لوڈ ہو رہا ہے...</div>';
    
    try {
        const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${API_KEY}&fields=files(id,name,webViewLink)`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.files && data.files.length > 0) {
            container.innerHTML = '';
            data.files.forEach(file => {
                const item = document.createElement('div');
                item.className = 'content-item';
                item.onclick = () => window.open(file.webViewLink, '_blank');
                item.innerHTML = `<h3>📄 ${file.name}</h3><p>پڑھنے کے لیے کلک کریں</p>`;
                container.appendChild(item);
            });
        } else {
            container.innerHTML = '<div class="loading">ابھی کوئی فائل موجود نہیں ہے۔</div>';
        }
    } catch (error) {
        container.innerHTML = '<div class="loading">کنکشن کا مسئلہ یا فائلیں پبلک نہیں ہیں۔</div>';
    }
}

// قسط کھولنے کا فنکشن
async function openEpisode(num) {
    const url = `https://www.googleapis.com/drive/v3/files?q='${FOLDERS.novel}'+in+parents&key=${API_KEY}&fields=files(id,name,webViewLink)`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const file = data.files.find(f => f.name.includes(num.toString()));
        if (file) window.open(file.webViewLink, '_blank');
        else alert('یہ قسط ابھی اپ لوڈ نہیں ہوئی۔');
    } catch (e) { alert('فائل کھولنے میں مسئلہ ہوا۔'); }
}

// ویریفکیشن کوڈ چیک کریں
function verifyCode() {
    const input = document.getElementById('code-input').value.trim().toUpperCase();
    // نیا فارمولا: پیکیج کے تمام نمبرز کے لیے ایک ہی کوڈ
    const expectedCode = `YHDpkg${currentPurchase.packageId}MS`.toUpperCase();
    
    if (input === expectedCode) {
        purchasedEpisodes.push('pkg_' + currentPurchase.packageId);
        localStorage.setItem('purchased_episodes', JSON.stringify(purchasedEpisodes));
        alert('✅ کوڈ درست ہے! پورا پیکیج ان لاک ہو گیا۔');
        location.reload();
    } else {
        alert('❌ غلط کوڈ! براہ کرم درست کوڈ درج کریں۔');
    }
}
