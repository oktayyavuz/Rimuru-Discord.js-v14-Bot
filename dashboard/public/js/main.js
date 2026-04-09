// Sayfa yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
    // Aktivite tablosunu doldur
    loadActivities();
    
    // Tooltip'leri etkinleştir
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// Aktivite tablosunu yükle
async function loadActivities() {
    try {
        const response = await fetch('/api/activities');
        const activities = await response.json();
        
        const activityTable = document.getElementById('activityTable');
        if (activityTable) {
            activityTable.innerHTML = activities.map(activity => `
                <tr>
                    <td>${formatDate(activity.date)}</td>
                    <td>${activity.action}</td>
                    <td>${activity.server}</td>
                    <td><span class="activity-status status-${activity.status.toLowerCase()}">${activity.status}</span></td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Aktiviteler yüklenirken hata oluştu:', error);
    }
}

// Tarih formatla
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Sunucu seçildiğinde
function selectServer(serverId) {
    // Sunucu seçim işlemleri
    console.log('Seçilen sunucu:', serverId);
}

// Komut ayarlarını kaydet
async function saveCommandSettings(commandId, settings) {
    try {
        const response = await fetch(`/api/commands/${commandId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settings)
        });
        
        if (response.ok) {
            showNotification('Ayarlar başarıyla kaydedildi', 'success');
        } else {
            throw new Error('Ayarlar kaydedilemedi');
        }
    } catch (error) {
        console.error('Ayarlar kaydedilirken hata oluştu:', error);
        showNotification('Ayarlar kaydedilemedi', 'error');
    }
}

// Bildirim göster
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} notification fade-in`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Form doğrulama
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('is-invalid');
        } else {
            field.classList.remove('is-invalid');
        }
    });
    
    return isValid;
}

// Sayfa yükleme animasyonu
function showLoading() {
    const loading = document.createElement('div');
    loading.className = 'loading-overlay';
    loading.innerHTML = `
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Yükleniyor...</span>
        </div>
    `;
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.querySelector('.loading-overlay');
    if (loading) {
        loading.remove();
    }
}

// API istekleri için yardımcı fonksiyon
async function apiRequest(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(endpoint, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API isteği başarısız:', error);
        throw error;
    }
} 