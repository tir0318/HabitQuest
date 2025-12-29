// ====================================
// HabitQuest - Memo Module
// ====================================

const Memo = {
    editingMemo: null,

    // Generate unique ID
    generateId() {
        return 'memo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // Get all quick memos
    getQuickMemos() {
        return Storage.getQuickMemos();
    },

    // Get all titled memos
    getMemos() {
        return Storage.getMemos();
    },

    // Add quick memo
    addQuickMemo(content) {
        if (!content.trim()) return null;

        const memos = this.getQuickMemos();
        const memo = {
            id: this.generateId(),
            content: content.trim(),
            createdAt: new Date().toISOString()
        };

        memos.unshift(memo);
        Storage.saveQuickMemos(memos);
        this.renderQuickMemos();
        return memo;
    },

    // Delete quick memo
    deleteQuickMemo(id) {
        const memos = this.getQuickMemos().filter(m => m.id !== id);
        Storage.saveQuickMemos(memos);
        this.renderQuickMemos();
    },

    // Add titled memo
    addMemo(title, content, category = 'other') {
        const memos = this.getMemos();
        const memo = {
            id: this.generateId(),
            title: title.trim(),
            content: content.trim(),
            category,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        memos.unshift(memo);
        Storage.saveMemos(memos);
        this.renderMemos();
        return memo;
    },

    // Update memo
    updateMemo(id, updates) {
        const memos = this.getMemos();
        const index = memos.findIndex(m => m.id === id);

        if (index !== -1) {
            memos[index] = {
                ...memos[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            Storage.saveMemos(memos);
            this.renderMemos();
            return memos[index];
        }
        return null;
    },

    // Delete memo
    deleteMemo(id) {
        const memos = this.getMemos().filter(m => m.id !== id);
        Storage.saveMemos(memos);
        this.renderMemos();
    },

    // Render quick memos
    renderQuickMemos() {
        const container = document.getElementById('quick-memo-list');
        if (!container) return;

        const memos = this.getQuickMemos();

        if (memos.length === 0) {
            container.innerHTML = '<p class="empty-message">クイックメモはありません</p>';
            return;
        }

        container.innerHTML = memos.map(memo => `
            <div class="memo-item quick-memo" data-id="${memo.id}">
                <div class="memo-content">${this.escapeHtml(memo.content)}</div>
                <div class="memo-item-header">
                    <span class="memo-date">${this.formatDate(memo.createdAt)}</span>
                    <div class="memo-actions">
                        <button class="btn btn-small btn-danger" onclick="Memo.deleteQuickMemo('${memo.id}')">削除</button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    // Render titled memos
    renderMemos() {
        const container = document.getElementById('titled-memo-list');
        if (!container) return;

        const memos = this.getMemos();

        if (memos.length === 0) {
            container.innerHTML = '<p class="empty-message">メモはありません</p>';
            return;
        }

        const categories = Storage.getCategories();
        const getCategoryName = (id) => {
            const cat = categories.find(c => c.id === id);
            return cat?.name || 'その他';
        };

        container.innerHTML = memos.map(memo => `
            <div class="memo-item titled-memo" data-id="${memo.id}">
                <div class="memo-item-header">
                    <span class="memo-title">${this.escapeHtml(memo.title || '無題')}</span>
                    <span class="memo-date">${this.formatDate(memo.updatedAt)}</span>
                </div>
                <div class="task-category">${getCategoryName(memo.category)}</div>
                <div class="memo-content">${this.escapeHtml(this.truncate(memo.content, 100))}</div>
                <div class="memo-actions">
                    <button class="btn btn-small btn-secondary" onclick="Memo.openEditModal('${memo.id}')">編集</button>
                    <button class="btn btn-small btn-danger" onclick="Memo.deleteMemo('${memo.id}')">削除</button>
                </div>
            </div>
        `).join('');
    },

    // Render recent memos for dashboard
    renderRecentMemos() {
        const container = document.getElementById('recent-memo-list');
        if (!container) return;

        const quickMemos = this.getQuickMemos().slice(0, 3);
        const titledMemos = this.getMemos().slice(0, 2);

        if (quickMemos.length === 0 && titledMemos.length === 0) {
            container.innerHTML = '<p class="empty-message">メモはありません</p>';
            return;
        }

        let html = '';

        quickMemos.forEach(memo => {
            html += `
                <div class="memo-item-small">
                    <span class="memo-content">${this.escapeHtml(this.truncate(memo.content, 50))}</span>
                    <span class="memo-date">${this.formatDate(memo.createdAt)}</span>
                </div>
            `;
        });

        titledMemos.forEach(memo => {
            html += `
                <div class="memo-item-small">
                    <span class="memo-title">${this.escapeHtml(memo.title || '無題')}</span>
                    <span class="memo-date">${this.formatDate(memo.updatedAt)}</span>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    // Open add modal
    openAddModal() {
        this.editingMemo = null;

        document.getElementById('memo-modal-title').textContent = '新規メモ';
        document.getElementById('memo-title').value = '';
        document.getElementById('memo-content').value = '';
        document.getElementById('memo-category').value = 'other';

        this.updateCategorySelect();
        document.getElementById('memo-modal').classList.add('active');
    },

    // Open edit modal
    openEditModal(id) {
        const memo = this.getMemos().find(m => m.id === id);
        if (!memo) return;

        this.editingMemo = memo;

        document.getElementById('memo-modal-title').textContent = 'メモを編集';
        document.getElementById('memo-title').value = memo.title || '';
        document.getElementById('memo-content').value = memo.content || '';
        document.getElementById('memo-category').value = memo.category || 'other';

        this.updateCategorySelect();
        document.getElementById('memo-modal').classList.add('active');
    },

    // Close modal
    closeModal() {
        document.getElementById('memo-modal').classList.remove('active');
        this.editingMemo = null;
    },

    // Save memo from modal
    saveFromModal() {
        const title = document.getElementById('memo-title').value;
        const content = document.getElementById('memo-content').value;
        const category = document.getElementById('memo-category').value;

        if (!content.trim()) {
            App.showToast('内容を入力してください', 'error');
            return;
        }

        if (this.editingMemo) {
            this.updateMemo(this.editingMemo.id, { title, content, category });
            App.showToast('メモを更新しました', 'success');
        } else {
            this.addMemo(title, content, category);
            App.showToast('メモを追加しました', 'success');
        }

        this.closeModal();
    },

    // Update category select options
    updateCategorySelect() {
        const select = document.getElementById('memo-category');
        if (!select) return;

        const categories = Storage.getCategories();
        select.innerHTML = categories.map(cat =>
            `<option value="${cat.id}">${cat.name}</option>`
        ).join('');
    },

    // Format date
    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    },

    // Truncate text
    truncate(text, maxLength) {
        if (!text || text.length <= maxLength) return text || '';
        return text.substring(0, maxLength) + '...';
    },

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    },

    // Bind events
    bindEvents() {
        // Quick memo bar
        const quickInput = document.getElementById('quick-memo-input');
        const quickAdd = document.getElementById('quick-memo-add');

        if (quickInput && quickAdd) {
            quickAdd.addEventListener('click', () => {
                this.addQuickMemo(quickInput.value);
                quickInput.value = '';
            });

            quickInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addQuickMemo(quickInput.value);
                    quickInput.value = '';
                }
            });
        }

        // Add memo button
        const addBtn = document.getElementById('add-memo-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openAddModal());
        }

        // Modal buttons
        const closeBtn = document.getElementById('memo-modal-close');
        const cancelBtn = document.getElementById('memo-cancel');
        const saveBtn = document.getElementById('memo-save');

        if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeModal());
        if (saveBtn) saveBtn.addEventListener('click', () => this.saveFromModal());
    },

    // Initialize
    init() {
        this.renderQuickMemos();
        this.renderMemos();
        this.renderRecentMemos();
        this.bindEvents();
    }
};
