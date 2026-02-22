// 状態管理
let currentDate = new Date();
let events = JSON.parse(localStorage.getItem('familyEvents')) || [];
let members = JSON.parse(localStorage.getItem('familyMembers')) || [
    { id: 1, name: 'パパ', color: '#4285f4' },
    { id: 2, name: 'ママ', color: '#ea4335' },
    { id: 3, name: '子ども', color: '#fbbc04' }
];
let editingEventId = null;

// ローカルストレージに保存
function saveData() {
    localStorage.setItem('familyEvents', JSON.stringify(events));
    localStorage.setItem('familyMembers', JSON.stringify(members));
}

// カレンダーを表示
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // 月の表示
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    document.getElementById('currentMonth').textContent = `${year}年 ${monthNames[month]}`;
    
    // カレンダーグリッド
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';
    
    // 月の最初の日と最後の日
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const daysInPrevMonth = prevLastDay.getDate();
    
    // 前月の日付
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        calendarGrid.appendChild(createDayElement(day, dateStr, true));
    }
    
    // 当月の日付
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
        calendarGrid.appendChild(createDayElement(day, dateStr, false, isToday));
    }
    
    // 次月の日付
    const totalCells = calendarGrid.children.length;
    const remainingCells = 42 - totalCells; // 6週分
    for (let day = 1; day <= remainingCells; day++) {
        const dateStr = `${year}-${String(month + 2).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        calendarGrid.appendChild(createDayElement(day, dateStr, true));
    }
}

// 日付要素を作成
function createDayElement(day, dateStr, isOtherMonth, isToday = false) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    if (isOtherMonth) dayElement.classList.add('other-month');
    if (isToday) dayElement.classList.add('today');
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayElement.appendChild(dayNumber);
    
    // その日の予定を表示
    const dayEvents = events.filter(e => e.date === dateStr);
    if (dayEvents.length > 0) {
        const eventsContainer = document.createElement('div');
        eventsContainer.className = 'events-container';
        
        dayEvents.forEach(event => {
            const eventItem = document.createElement('div');
            eventItem.className = 'event-item';
            const member = members.find(m => m.id === event.memberId);
            eventItem.style.backgroundColor = member ? member.color : '#999';
            eventItem.textContent = event.time ? `${event.time} ${event.title}` : event.title;
            eventItem.onclick = (e) => {
                e.stopPropagation();
                showEventDetail(event);
            };
            eventsContainer.appendChild(eventItem);
        });
        
        dayElement.appendChild(eventsContainer);
    }
    
    // 日付クリックで予定追加
    dayElement.onclick = () => {
        openEventModal(dateStr);
    };
    
    return dayElement;
}

// メンバーリストを表示
function renderMembers() {
    const memberList = document.getElementById('memberList');
    const eventMemberSelect = document.getElementById('eventMember');
    
    memberList.innerHTML = '';
    eventMemberSelect.innerHTML = '<option value="">選択してください</option>';
    
    members.forEach(member => {
        // メンバータグ
        const memberTag = document.createElement('div');
        memberTag.className = 'member-tag';
        memberTag.style.backgroundColor = member.color;
        memberTag.innerHTML = `
            ${member.name}
            <button class="delete-member">×</button>
        `;
        
        memberTag.querySelector('.delete-member').onclick = (e) => {
            e.stopPropagation();
            if (confirm(`${member.name}を削除しますか？`)) {
                members = members.filter(m => m.id !== member.id);
                saveData();
                renderMembers();
                renderCalendar();
            }
        };
        
        memberList.appendChild(memberTag);
        
        // セレクトボックス
        const option = document.createElement('option');
        option.value = member.id;
        option.textContent = member.name;
        eventMemberSelect.appendChild(option);
    });
}

// 予定追加モーダルを開く
function openEventModal(date = null) {
    const modal = document.getElementById('eventModal');
    const form = document.getElementById('eventForm');
    const deleteButton = document.getElementById('deleteEventButton');
    
    form.reset();
    editingEventId = null;
    deleteButton.style.display = 'none';
    document.getElementById('modalTitle').textContent = '予定を追加';
    
    if (date) {
        document.getElementById('eventDate').value = date;
    } else {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        document.getElementById('eventDate').value = `${year}-${month}-${day}`;
    }
    
    modal.style.display = 'block';
}

// 予定詳細を表示
function showEventDetail(event) {
    const modal = document.getElementById('eventDetailModal');
    const content = document.getElementById('eventDetailContent');
    const member = members.find(m => m.id === event.memberId);
    
    content.innerHTML = `
        <div class="detail-row">
            <div class="detail-label">📅 日付</div>
            <div class="detail-value">${event.date}</div>
        </div>
        ${event.time ? `
        <div class="detail-row">
            <div class="detail-label">🕐 時刻</div>
            <div class="detail-value">${event.time}</div>
        </div>
        ` : ''}
        <div class="detail-row">
            <div class="detail-label">📝 タイトル</div>
            <div class="detail-value">${event.title}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">👤 メンバー</div>
            <div class="detail-value" style="color: ${member ? member.color : '#999'}; font-weight: bold;">
                ${member ? member.name : '不明'}
            </div>
        </div>
        ${event.description ? `
        <div class="detail-row">
            <div class="detail-label">📄 詳細</div>
            <div class="detail-value">${event.description}</div>
        </div>
        ` : ''}
    `;
    
    document.getElementById('editEventButton').onclick = () => {
        modal.style.display = 'none';
        openEditEventModal(event);
    };
    
    modal.style.display = 'block';
}

// 予定編集モーダルを開く
function openEditEventModal(event) {
    const modal = document.getElementById('eventModal');
    const form = document.getElementById('eventForm');
    const deleteButton = document.getElementById('deleteEventButton');
    
    editingEventId = event.id;
    document.getElementById('modalTitle').textContent = '予定を編集';
    document.getElementById('eventTitle').value = event.title;
    document.getElementById('eventDate').value = event.date;
    document.getElementById('eventTime').value = event.time || '';
    document.getElementById('eventMember').value = event.memberId;
    document.getElementById('eventDescription').value = event.description || '';
    
    deleteButton.style.display = 'block';
    modal.style.display = 'block';
}

// 予定フォーム送信
document.getElementById('eventForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const eventData = {
        id: editingEventId || Date.now(),
        title: document.getElementById('eventTitle').value,
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        memberId: parseInt(document.getElementById('eventMember').value),
        description: document.getElementById('eventDescription').value
    };
    
    if (editingEventId) {
        const index = events.findIndex(e => e.id === editingEventId);
        events[index] = eventData;
    } else {
        events.push(eventData);
    }
    
    saveData();
    renderCalendar();
    document.getElementById('eventModal').style.display = 'none';
});

// 予定削除
document.getElementById('deleteEventButton').addEventListener('click', () => {
    if (confirm('この予定を削除しますか？')) {
        events = events.filter(e => e.id !== editingEventId);
        saveData();
        renderCalendar();
        document.getElementById('eventModal').style.display = 'none';
    }
});

// メンバー追加モーダル
document.getElementById('addMemberButton').addEventListener('click', () => {
    document.getElementById('memberModal').style.display = 'block';
});

// メンバーフォーム送信
document.getElementById('memberForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newMember = {
        id: Date.now(),
        name: document.getElementById('memberName').value,
        color: document.getElementById('memberColor').value
    };
    
    members.push(newMember);
    saveData();
    renderMembers();
    document.getElementById('memberModal').style.display = 'none';
    document.getElementById('memberForm').reset();
});

// 予定追加ボタン
document.getElementById('addEventButton').addEventListener('click', () => {
    openEventModal();
});

// 月の移動
document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

document.getElementById('todayButton').addEventListener('click', () => {
    currentDate = new Date();
    renderCalendar();
});

// モーダルを閉じる
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
        this.closest('.modal').style.display = 'none';
    });
});

document.querySelectorAll('.cancel-button').forEach(cancelBtn => {
    cancelBtn.addEventListener('click', function() {
        this.closest('.modal').style.display = 'none';
    });
});

// モーダル外クリックで閉じる
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// 初期化
renderMembers();
renderCalendar();
