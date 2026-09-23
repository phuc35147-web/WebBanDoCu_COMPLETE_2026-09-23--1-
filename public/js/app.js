// --- 1. XỬ LÝ ĐÓNG/MỞ MODAL & FORM ĐĂNG NHẬP/ĐĂNG KÝ ---
function showAuthLogin(e) {
    if (e) e.preventDefault();
    document.getElementById('loginPanel').classList.remove('d-none');
    document.getElementById('registerPanel').classList.add('d-none');
    bootstrap.Modal.getOrCreateInstance(document.getElementById('authModal')).show();
}

function updateAuthUI() {
    const loginButton = document.getElementById('loginButton');
    const accountDropdown = document.getElementById('accountDropdown');

    const accountName = document.getElementById('accountName');
    const accountAvatar = document.getElementById('accountAvatar');

    const accountMenuName = document.getElementById('accountMenuName');
    const accountMenuEmail = document.getElementById('accountMenuEmail');
    const accountAvatarMenu = document.getElementById('accountAvatarMenu');

    const postButton = document.getElementById('btnPostForm');

    let user = null;

    try {
        user = JSON.parse(localStorage.getItem('user') || 'null');
    } catch (error) {
        console.error('Lỗi đọc thông tin tài khoản:', error);
        localStorage.removeItem('user');
    }

    const token = localStorage.getItem('token');

    // ==============================
    // CHƯA ĐĂNG NHẬP
    // ==============================
    if (!token || !user) {

        if (loginButton) {
            loginButton.style.display = 'inline-flex';
        }

        if (accountDropdown) {
            accountDropdown.style.display = 'none';
            accountDropdown.classList.remove('open');
        }

        if (postButton) {
            postButton.style.display = 'none';
        }

        return;
    }

    // ==============================
    // ĐÃ ĐĂNG NHẬP
    // ==============================

    // Ẩn nút Đăng nhập
    if (loginButton) {
        loginButton.style.display = 'none';
    }

    // Hiện khu vực Tài khoản
    if (accountDropdown) {
        accountDropdown.style.display = 'block';
    }

    // Lấy tên người dùng
    const name = user.hoTen || user.HoTen || user.name || 'Tài khoản';

    // Lấy email
    const email = user.email || user.Email || '';

    // Chữ cái đầu làm avatar
    const firstLetter = name
        .trim()
        .charAt(0)
        .toUpperCase() || 'P';

    // Tên trên Header
    if (accountName) {
        accountName.textContent = name;
    }

    // Avatar trên Header
    if (accountAvatar) {
        accountAvatar.textContent = firstLetter;
    }

    // Tên trong menu
    if (accountMenuName) {
        accountMenuName.textContent = name;
    }

    // Email trong menu
    if (accountMenuEmail) {
        accountMenuEmail.textContent = email;
    }

    // Avatar trong menu
    if (accountAvatarMenu) {
        accountAvatarMenu.textContent = firstLetter;
    }

    // Hiển thị nút Đăng bài nếu là người bán/admin
    if (postButton) {
        const role = String(
            user.vaiTro ||
            user.VaiTro ||
            user.role ||
            ''
        ).toLowerCase();

        // Tài khoản đã đăng nhập đều nhìn thấy nút Đăng Tin.
        // openPostModal() sẽ kiểm tra quyền seller/admin trước khi mở form.
        postButton.style.display = 'inline-block';
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Đóng menu tài khoản nếu đang mở
    const accountDropdown = document.getElementById('accountDropdown');

    if (accountDropdown) {
        accountDropdown.classList.remove('open');
    }

    // Quay về trang chủ
    window.location.href = '/index.html';
}
// ============================================
// XỬ LÝ MENU TÀI KHOẢN
// ============================================

function initAccountDropdown() {

    const accountButton = document.getElementById('accountButton');
    const accountDropdown = document.getElementById('accountDropdown');

    if (!accountButton || !accountDropdown) {
        return;
    }

    // Click nút Tài khoản
    accountButton.addEventListener('click', function (e) {

        e.stopPropagation();

        accountDropdown.classList.toggle('open');

    });

    // Click bên ngoài thì đóng menu
    document.addEventListener('click', function (e) {

        if (!accountDropdown.contains(e.target)) {
            accountDropdown.classList.remove('open');
        }

    });

}

function showAuthRegister(e) {
    if (e) e.preventDefault();
    document.getElementById('loginPanel').classList.add('d-none');
    document.getElementById('registerPanel').classList.remove('d-none');
    showRegistrationPhoneStep();
    bootstrap.Modal.getOrCreateInstance(document.getElementById('authModal')).show();
}

function showRegistrationPhoneStep(e) {
    if (e) e.preventDefault();
    document.getElementById('registerPhoneForm').classList.remove('d-none');
    document.getElementById('registerForm').classList.add('d-none');
}

async function handleRegistrationPhone(e) {
    e.preventDefault();
    try {
        const phone = document.getElementById('registerPhone').value.trim();
        const response = await fetch('/api/auth/check-phone', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ soDienThoai: phone })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Không thể kiểm tra số điện thoại.');
        if (data.exists) return alert('Số điện thoại này đã được đăng ký.');
        document.getElementById('registrationPhoneVerified').value = phone;
        document.getElementById('registerPhoneForm').classList.add('d-none');
        document.getElementById('registerForm').classList.remove('d-none');
    } catch (error) {
        alert(error.message);
    }
}

// --- 2. XỬ LÝ ĐĂNG NHẬP / ĐĂNG KÝ ---
async function handleLogin(e) {
    e.preventDefault();
    const button = e.submitter;
    if (button) button.disabled = true;
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                identifier: document.getElementById('loginIdentifier').value.trim(),
                matKhau: document.getElementById('loginPass').value
            })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Đăng nhập thất bại.');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        bootstrap.Modal.getOrCreateInstance(document.getElementById('authModal')).hide();
        location.reload();
    } catch (error) {
        alert(error.message);
    } finally {
        if (button) button.disabled = false;
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const button = e.submitter;
    if (button) button.disabled = true;
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                hoTen: document.getElementById('registerName').value.trim(),
                email: document.getElementById('registerEmail').value.trim(),
                soDienThoai: document.getElementById('registrationPhoneVerified').value.trim(),
                matKhau: document.getElementById('registerPass').value,
                tinhThanh: document.querySelector('#registerProvince option:checked')?.textContent,
                quanHuyen: null,
                phuongXa: document.querySelector('#registerWard option:checked')?.textContent,
                diaChiChiTiet: document.getElementById('registerAddress').value.trim()
            })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Đăng ký thất bại.');
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        alert('Đăng ký thành công.');
        location.reload();
    } catch (error) {
        alert(error.message);
    } finally {
        if (button) button.disabled = false;
    }
}

async function handleSellerRegistration(e) {
    e.preventDefault();
    const form = document.getElementById('sellerForm');
    const message = document.getElementById('sellerFormMessage');
    if (!form) return;
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        if (message) { message.className='alert alert-danger'; message.textContent='Vui lòng điền đầy đủ thông tin hồ sơ người bán.'; }
        return;
    }
    const token = localStorage.getItem('token');
    if (!token) { window.location.href='/auth.html?mode=login'; return; }
    const payload = {
        tenCuaHang: document.getElementById('sellerShop')?.value.trim(),
        soDienThoai: document.getElementById('sellerPhone')?.value.trim(),
        tinhThanh: document.querySelector('#sellerProvince option:checked')?.textContent || '',
        quanHuyen: '',
        phuongXa: document.querySelector('#sellerWard option:checked')?.textContent || '',
        diaChiChiTiet: document.getElementById('sellerAddress')?.value.trim(),
        moTa: document.getElementById('sellerDescription')?.value.trim() || ''
    };
    try {
        const r=await fetch('/api/auth/seller-registration',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(payload)});
        const data=await r.json();
        if(!r.ok) throw new Error(data.message||'Không thể gửi hồ sơ.');
        if(message){message.className='alert alert-success';message.textContent=data.message||'Đã gửi hồ sơ, chờ admin duyệt.';}
        setTimeout(()=>bootstrap.Modal.getInstance(document.getElementById('sellerModal'))?.hide(),900);
    } catch(err) {
        if(message){message.className='alert alert-danger';message.textContent=err.message;} else alert(err.message);
    }
}

let editingProductId = null;

async function openPostModal() {
    const token = localStorage.getItem('token');
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('user') || 'null');
    } catch (_) {}

    if (!token || !user) {
        window.location.href = '/auth.html?mode=login';
        return;
    }

    const role = String(user.vaiTro || user.VaiTro || user.role || '').toLowerCase();

    // Chỉ tài khoản đã được duyệt người bán hoặc admin mới được đăng sản phẩm.
    if (role !== 'seller' && role !== 'admin' && role !== 'nguoi_ban') {
        alert('Tài khoản của bạn chưa được duyệt làm người bán. Vui lòng đăng ký người bán trước.');
        const sellerModal = document.getElementById('sellerModal');
        if (sellerModal) bootstrap.Modal.getOrCreateInstance(sellerModal).show();
        return;
    }

    await loadPostCategories();
    const editing = JSON.parse(localStorage.getItem('editingProduct') || 'null');
    if (editing) {
        editingProductId = editing.MaSanPham || editing.maSanPham || editing.id;
        document.getElementById('postModalLabel').innerHTML='<i class=\"bi bi-pencil-square me-2\"></i>Chỉnh sửa tin đăng';
        document.getElementById('postSubmitButton').innerHTML='<i class=\"bi bi-save me-2\"></i>Lưu thay đổi';
        document.getElementById('postProductName').value=editing.TenSanPham||'';
        document.getElementById('postCategory').value=editing.MaDanhMuc||'';
        document.getElementById('postCondition').value=editing.TinhTrang||'';
        document.getElementById('postPrice').value=editing.GiaBan||'';
        document.getElementById('postQuantity').value=editing.SoLuong||1;
        document.getElementById('postDescription').value=editing.MoTa||'';
        document.getElementById('postAddress').value=editing.DiaChiXemHang||'';
        document.getElementById('postConfirm').checked=true;
        document.getElementById('postImage').required=false;
        document.getElementById('postProvince').required=false;
        document.getElementById('postWard').required=false;
        localStorage.removeItem('editingProduct');
    } else {
        editingProductId = null;
        document.getElementById('postModalLabel').innerHTML='<i class=\"bi bi-megaphone me-2\"></i>Đăng tin bán đồ cũ';
        document.getElementById('postSubmitButton').innerHTML='<i class=\"bi bi-send me-2\"></i>Đăng tin ngay';
        document.getElementById('postImage').required=true;
        document.getElementById('postProvince').required=true;
        document.getElementById('postWard').required=true;
    }
    const modal = document.getElementById('postModal');
    if (modal) bootstrap.Modal.getOrCreateInstance(modal).show();
}

async function loadPostCategories() {
    const select = document.getElementById('postCategory');
    if (!select) return;

    try {
        const response = await fetch('/api/categories');
        const categories = await response.json();
        if (!response.ok) throw new Error(categories.message || 'Không tải được danh mục.');

        select.innerHTML = '<option value="">-- Chọn danh mục --</option>' +
            categories.map(c => `<option value="${c.MaDanhMuc}">${escapeHtml(c.TenDanhMuc)}</option>`).join('');
    } catch (error) {
        console.error(error);
        select.innerHTML = '<option value="">Không tải được danh mục</option>';
    }
}

function showPostMessage(message, type = 'danger') {
    const box = document.getElementById('postFormMessage');
    if (!box) return;
    box.className = `alert alert-${type} mt-3 mb-0`;
    box.textContent = message;
    box.classList.remove('d-none');
}

function hidePostMessage() {
    const box = document.getElementById('postFormMessage');
    if (box) box.classList.add('d-none');
}

function previewPostImage() {
    const input = document.getElementById('postImage');
    const preview = document.getElementById('postImagePreview');
    const image = document.getElementById('postImagePreviewImg');
    if (!input || !preview || !image) return;

    const file = input.files?.[0];
    if (!file) {
        preview.classList.add('d-none');
        image.src = '';
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        input.value = '';
        preview.classList.add('d-none');
        showPostMessage('Ảnh không được lớn hơn 5MB.');
        return;
    }

    image.src = URL.createObjectURL(file);
    preview.classList.remove('d-none');
}

async function handlePostProduct(e) {
    e.preventDefault();
    hidePostMessage();

    const form = document.getElementById('postProductForm');
    const submit = document.getElementById('postSubmitButton');
    if (!form) return;

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        showPostMessage('Vui lòng điền đầy đủ tất cả thông tin bắt buộc (*).');
        return;
    }

    const province = document.getElementById('postProvince');
    const ward = document.getElementById('postWard');
    const address = document.getElementById('postAddress');
    const imageInput = document.getElementById('postImage');

    if ((!editingProductId && (!province?.value || !ward?.value)) || !address?.value.trim()) {
        showPostMessage('Vui lòng điền đầy đủ tỉnh/thành phố, phường/xã và địa chỉ chi tiết.');
        return;
    }

    if (!editingProductId && !imageInput?.files?.length) {
        showPostMessage('Bạn phải chọn ít nhất 1 ảnh minh họa cho sản phẩm.');
        return;
    }

    const file = imageInput?.files?.[0];
    if (file && file.size > 5 * 1024 * 1024) {
        showPostMessage('Ảnh không được lớn hơn 5MB.');
        return;
    }

    const formData = new FormData(form);
    const fullAddress = editingProductId ? address.value.trim() : `${province.options[province.selectedIndex].text}, ${ward.options[ward.selectedIndex].text}, ${address.value.trim()}`;
    formData.set('diaChiXemHang', fullAddress);
    formData.set('soLuong', document.getElementById('postQuantity')?.value || '1');

    submit.disabled = true;
    submit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Đang đăng tin...';

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(editingProductId ? `/api/products/${editingProductId}` : '/api/products', {
            method: editingProductId ? 'PATCH' : 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Đăng tin thất bại.');

        showPostMessage(editingProductId ? 'Cập nhật thành công! Tin đã được đưa về trạng thái chờ duyệt.' : 'Đăng tin thành công! Tin đang được chờ duyệt.', 'success');
        form.reset();
        form.classList.remove('was-validated');
        document.getElementById('postWard').disabled = true;
        document.getElementById('postImagePreview').classList.add('d-none');

        setTimeout(() => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('postModal'));
            if (modal) modal.hide();
            editingProductId = null;
            fetchProducts();
        }, 900);
    } catch (error) {
        console.error(error);
        showPostMessage(error.message || 'Không thể đăng tin.');
    } finally {
        submit.disabled = false;
        submit.innerHTML = '<i class="bi bi-send me-2"></i>Đăng tin ngay';
    }
}

function handleSocialLogin(provider) {
    alert(`Chức năng đăng nhập bằng ${provider} đang được phát triển.`);
}

function handleSocialRegister(provider) {
    alert(`Chức năng đăng ký bằng ${provider} đang được phát triển.`);
}

// --- 3. TÌM KIẾM ---
function searchTag(tag) {
    document.getElementById('searchKeyword').value = tag;
    fetchProducts();
}
// --- 4. GỌI API TỈNH/THÀNH PHỐ VIỆT NAM (Tự động) ---
async function loadProvinces(selectId) {
    try {
        const res = await fetch('https://provinces.open-api.vn/api/v2/p/');
        const data = await res.json();
        const select = document.getElementById(selectId);
        if (!select) return;
        select.innerHTML = '<option value="">Chọn Tỉnh/Thành phố</option>';
        data.forEach(p => {
            select.innerHTML += `<option value="${p.code}">${p.name}</option>`;
        });
    } catch (err) {
        console.error("Lỗi tải tỉnh thành:", err);
    }
}

async function loadWards(provinceCode, wardSelectId) {
    if (!provinceCode) return;
    try {
        const res = await fetch(`https://provinces.open-api.vn/api/v2/p/${provinceCode}?depth=2`);
        const data = await res.json();
        const select = document.getElementById(wardSelectId);
        if (!select) return;

        // API v2 sau sáp nhập 07/2025 trả danh sách phường/xã trực tiếp ở data.wards.
        let wards = Array.isArray(data.wards) ? data.wards : [];

        // Fallback cho cấu trúc API cũ nếu còn dữ liệu districts/wards.
        if (!wards.length && Array.isArray(data.districts)) {
            data.districts.forEach(d => (d.wards || []).forEach(w => {
                wards.push({ ...w, district_name: d.name });
            }));
        }

        select.innerHTML = '<option value="">Chọn Phường/Xã</option>';
        wards.sort((a, b) => a.name.localeCompare(b.name, 'vi')).forEach(w => {
            select.innerHTML += `<option value="${w.code}">${w.name}</option>`;
        });
        select.disabled = wards.length === 0;
    } catch (err) {
        console.error("Lỗi tải quận huyện:", err);
    }
}

// --- 5. RENDER DỮ LIỆU SẢN PHẨM VÀ COUNTDOWN ---
function startCountdown() {
    let h = 8, m = 45, s = 12;
    setInterval(() => {
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; }
        document.getElementById('hours').innerText = h.toString().padStart(2, '0');
        document.getElementById('minutes').innerText = m.toString().padStart(2, '0');
        document.getElementById('seconds').innerText = s.toString().padStart(2, '0');
    }, 1000);
}

async function fetchProducts() {
    const dealList = document.getElementById('productList');
    const allList = document.getElementById('allProductList');
    if (!dealList && !allList) return;
    try {
        const keyword = document.getElementById('searchKeyword')?.value.trim() || '';
        const response = await fetch(`/api/products?${new URLSearchParams({ keyword })}`);
        if (!response.ok) throw new Error('Không thể tải danh sách sản phẩm.');
        const products = await response.json();
        const renderProducts = items => items.length ? items.map(product => `
            <div class="col-6 col-md-3 mb-4">
                <a href="/product-detail.html?id=${encodeURIComponent(product.MaSanPham)}" class="text-decoration-none text-dark">
                    <div class="card product-card h-100 shadow-sm">
                        <img src="${product.HinhAnh || '/uploads/default.jpg'}" class="card-img-top product-img" alt="${product.TenSanPham}">
                        <div class="card-body">
                            <span class="badge badge-condition mb-2">${product.TenDanhMuc}</span>
                            <h6 class="card-title text-truncate fw-bold">${product.TenSanPham}</h6>
                            <p class="price-tag mb-1 text-danger fw-bold">${Number(product.GiaBan).toLocaleString('vi-VN')} đ</p>
                            <small class="text-muted"><i class="bi bi-person me-1"></i>${product.TenNguoiBan || 'Người bán'}</small>
                        </div>
                    </div>
                </a>
            </div>`).join('') : '<div class="col-12 text-center text-muted py-5">Chưa có sản phẩm nào phù hợp.</div>';
        if (dealList) dealList.innerHTML = renderProducts(products.slice(0, 5));
        if (allList) allList.innerHTML = renderProducts(products.slice(5));
    } catch (error) {
        console.error(error);
        if (dealList) dealList.innerHTML = '<div class="col-12 text-center text-danger py-5">Không thể tải danh sách sản phẩm.</div>';
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggleSeoBtn');
    const wrapper = document.getElementById('seoContentWrapper');
    const icon = document.getElementById('toggleSeoIcon');

    if (toggleBtn && wrapper) {
        toggleBtn.addEventListener('click', () => {
            const isCollapsed = wrapper.classList.contains('collapsed');

            if (isCollapsed) {
                // Mở rộng văn bản
                wrapper.classList.remove('collapsed');
                wrapper.classList.add('expanded');
                toggleBtn.querySelector('span').textContent = 'Thu gọn';
                if (icon) {
                    icon.classList.remove('bi-chevron-down');
                    icon.classList.add('bi-chevron-up');
                }
            } else {
                // Thu gọn văn bản lại
                wrapper.classList.remove('expanded');
                wrapper.classList.add('collapsed');
                toggleBtn.querySelector('span').textContent = 'Xem thêm';
                if (icon) {
                    icon.classList.remove('bi-chevron-up');
                    icon.classList.add('bi-chevron-down');
                }

                // Cuộn mượt về đầu phần giới thiệu để người dùng không bị mất vị trí
                wrapper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }
});
function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[ch]));
}

// Khởi chạy mọi thứ khi trang đã tải xong
document.addEventListener("DOMContentLoaded", () => {

    // Cho phép nhấn Enter trong ô tìm kiếm để tìm sản phẩm.
    const searchInput = document.getElementById('searchKeyword');
    if (searchInput) {
        searchInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                fetchProducts();
            }
        });
    }

    startCountdown();

    fetchProducts();

    const params = new URLSearchParams(window.location.search);
    if (params.get('post') === '1' || params.get('editProduct') === '1') {
        setTimeout(() => openPostModal(), 250);
    }

    // Kiểm tra trạng thái đăng nhập
    updateAuthUI();

    // Khởi tạo menu Tài khoản
    initAccountDropdown();

    // Nạp API Tỉnh Thành
    loadProvinces('registerProvince');
    loadProvinces('sellerProvince');

    const registerProvince = document.getElementById('registerProvince');

    if (registerProvince) {

        registerProvince.addEventListener('change', function () {

            loadWards(
                this.value,
                'registerWard'
            );

        });

    }

    const sellerProvince = document.getElementById('sellerProvince');

    if (sellerProvince) {

        sellerProvince.addEventListener('change', function () {

            loadWards(
                this.value,
                'sellerWard'
            );

        });

    }

    const postProvince = document.getElementById('postProvince');
    if (postProvince) {
        loadProvinces('postProvince');
        postProvince.addEventListener('change', function () {
            loadWards(this.value, 'postWard');
        });
    }

    const postImage = document.getElementById('postImage');
    if (postImage) postImage.addEventListener('change', previewPostImage);

    const postModal = document.getElementById('postModal');
    if (postModal) {
        postModal.addEventListener('hidden.bs.modal', () => {
            hidePostMessage();
            const form = document.getElementById('postProductForm');
            if (form) {
                form.reset();
                form.classList.remove('was-validated');
            }
            const ward = document.getElementById('postWard');
            if (ward) {
                ward.disabled = true;
                ward.innerHTML = '<option value="">Chọn tỉnh/thành trước</option>';
            }
            editingProductId = null;
            const title = document.getElementById('postModalLabel');
            if(title) title.innerHTML='<i class=\"bi bi-megaphone me-2\"></i>Đăng tin bán đồ cũ';
            const submit = document.getElementById('postSubmitButton');
            if(submit) submit.innerHTML='<i class=\"bi bi-send me-2\"></i>Đăng tin ngay';
            const imageInput = document.getElementById('postImage');
            if(imageInput) imageInput.required=true;
            if(document.getElementById('postProvince')) document.getElementById('postProvince').required=true;
            if(document.getElementById('postWard')) document.getElementById('postWard').required=true;
            const preview = document.getElementById('postImagePreview');
            if (preview) preview.classList.add('d-none');
        });
    }

});
    
