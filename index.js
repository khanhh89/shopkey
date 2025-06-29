document.addEventListener('DOMContentLoaded', () => {

    const games = [
        {
            title: "Liên Quân Mobile ADR",
            image: "https://cdn-media.sforum.vn/storage/app/media/wp-content/uploads/2023/07/THUMB.jpg",
            links: [
                { text: "Tải tách gốc", url: "https://www.mediafire.com/file/nxs9vqct8g4gpxd/HACK+MAP+V2.5_t%C3%A1ch.apk/file" },
                { text: "Tải xóa gốc", url: "https://www.mediafire.com/file/02uebms0kuab6mm/HACK+MAP+V2.5.apk/file" },
                { text: "Lấy Key Free", url: "#" }
            ]
        },
        // Add more games here if needed
        {
            title: "PUBG Mobile Vietnam",
            image: "https://minigame.vn/wp-content/uploads/2022/11/Tai-Game-PUBG-Mobile-VN-Chinh-Thuc-Cho-Android.jpg",
            links: [
                { text: "Tải ngay", url: "https://pubgmobile.com/vn/" },
                { text: "Mua UC", url: "#" }
            ]
        },
        {
            title: "Free Fire Max",
            image: "https://cdn.tgdd.vn/GameApp/2/236173/Specific/free-fire-max-cover-800x450.jpg",
            links: [
                { text: "Tải game", url: "https://ff.garena.vn/" },
                { text: "Nạp kim cương", url: "#" }
            ]
        }
    ];

    const discountCodes = {
        'GIAM10': { value: 0.1, description: "Giảm 10%" },
        'GIAM30': { value: 0.3, description: "Giảm 30%" },
        'FREE100': { value: 1, description: "Miễn phí" } // For a full discount
    };

    const priceConfig = {
        '1day': { amount: 2000, display: "1 ngày" },
        '7day': { amount: 40000, display: "7 ngày" },
        '30day': { amount: 100000, display: "30 ngày" }
    };

    // Helper function to get element by ID
    const el = id => document.getElementById(id);

    // State management for modal and processing
    const state = {
        modal: null,
        transaction: null,
        processing: false
    };

    // Render game cards dynamically
    const renderGames = () => {
        const container = el('gameList');
        container.innerHTML = games.map(game => `
            <div class="game-card">
                <img src="${game.image}" alt="${game.title}" class="game-image" onerror="this.src='https://via.placeholder.com/180?text=Image+Not+Found'">
                <div class="game-content">
                    <h4 class="game-title">${game.title}</h4>
                    ${game.links.map(link => `<a href="${link.url}" ${link.url !== '#' ? 'target="_blank"' : ''} class="btn btn-primary game-btn">${link.text}</a>`).join('')}
                </div>
            </div>
        `).join('');
    };

    // Apply discount code to the amount
    const applyDiscount = (code, amount) => {
        const dc = discountCodes[code];
        if (!dc) return { final: amount, msg: code ? `⚠️ Mã giảm giá "${code}" không hợp lệ.` : '' };
        
        // Calculate final amount, ensuring it doesn't go below zero
        const final = Math.max(0, Math.round(amount * (1 - dc.value)));
        return { final, msg: `✅ Mã giảm giá "${code}" (${dc.description}) đã được áp dụng.` };
    };

    // Update modal content with transaction details
    const updateModal = ({ code, product, amount, message }) => {
        el('note').textContent = code;
        el('product').textContent = product;
        el('amount').textContent = amount.toLocaleString('vi-VN') + " VNĐ";
        
        // Generate QR code URL based on transaction details
        el('qrImage').src = `https://qr.sepay.vn/img?acc=075020699999&bank=MBBank&amount=${amount}&des=${code}&template=compact`;
        
        // Construct MBBank payment link
        el('paymentLink').href = `https://mbbank.com.vn/QRTransfer?bankId=MB&accountNo=075020699999&amount=${amount}&content=${encodeURIComponent(code)}`;

        // Display discount message
        el('resultBox').innerHTML = message ? `<div class="alert alert-${amount === 0 ? 'warning' : 'success'}">${message}</div>` : '';
    };

    // Generic SweetAlert2 alert function
    const showAlert = (icon, title, html) => Swal.fire({ icon, title, html, confirmButtonColor: '#16a34a' });

    // Generic SweetAlert2 toast notification
    const showToast = msg => Swal.fire({ icon: 'success', title: msg, toast: true, position: 'top-end', timer: 2000, showConfirmButton: false });

    // Handle payment button click
    const handlePayment = () => {
        if (state.processing) return; // Prevent multiple clicks
        state.processing = true;

        const game = el('game')?.value;
        const duration = el('duration')?.value;
        const discountCode = el('discountCode')?.value.trim().toUpperCase();
        const config = priceConfig[duration];

        if (!game || !config) {
            showAlert('error', 'Thiếu thông tin!', 'Vui lòng chọn game và thời hạn.');
            state.processing = false;
            return;
        }

        const discountResult = applyDiscount(discountCode, config.amount);
        const transCode = 'DXK' + Math.floor(1000 + Math.random() * 9000); // Unique transaction code
        const product = `${config.display} | ${game}`;

        state.transaction = { code: transCode, product, amount: discountResult.final };

        updateModal({ code: transCode, product, amount: discountResult.final, message: discountResult.msg });
        state.modal.show(); // Show the Bootstrap modal
        state.processing = false;
    };

    // Handle payment confirmation
    const confirmPayment = () => {
        if (!state.transaction || state.processing) return;
        state.processing = true;

        showAlert('success', '🎉 Thanh toán thành công!', `Mã giao dịch: <strong>${state.transaction.code}</strong><br>Liên hệ admin để lấy key nhé!!`);
        el('resultBox').innerHTML = '<div class="alert alert-success">✅ Đã xác nhận thanh toán. Vui lòng đợi admin xử lý.</div>';
        el('confirmBtn').disabled = true; // Disable button to prevent re-submission

        // Reset form and close modal after a delay
        setTimeout(() => {
            el('orderForm').reset();
            state.modal.hide();
            el('confirmBtn').disabled = false;
            state.transaction = null;
            state.processing = false;
            el('resultBox').innerHTML = ''; // Clear result message
        }, 5000);
    };

    // Handle copy button clicks
    const handleCopy = e => {
        const btn = e.target.closest('.copy-btn');
        if (!btn) return;
        const textToCopy = btn.dataset.text || el(btn.dataset.target)?.textContent;
        if (!textToCopy) return;

        // Use modern clipboard API if available
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textToCopy)
                .then(() => showToast('Đã sao chép!'))
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                    showAlert('error', 'Lỗi sao chép!', 'Không thể tự động sao chép. Vui lòng sao chép thủ công: ' + textToCopy);
                });
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = textToCopy;
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                showToast('Đã sao chép!');
            } catch (err) {
                console.error('Fallback copy failed: ', err);
                showAlert('error', 'Lỗi sao chép!', 'Không thể tự động sao chép. Vui lòng sao chép thủ công: ' + textToCopy);
            }
            document.body.removeChild(textarea);
        }
    };

    // Initialize the page
    renderGames();
    state.modal = new bootstrap.Modal(el('paymentModal')); // Initialize Bootstrap modal instance
    el('paymentButton').addEventListener('click', handlePayment);
    el('confirmBtn').addEventListener('click', confirmPayment);
    document.addEventListener('click', handleCopy); // Event delegation for copy buttons
});
