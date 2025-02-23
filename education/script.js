const SUBJECTS = [ 'References', 'Exams from teachers','Arabic', 'English', 'German', 'French', 'Physics', 'Chemistry', 'Mathematics', 'Mechanics', 'Biology', 'Geology', 'Social Studies','Computer Science' , ];

const TEACHER_CONTACTS = {
    'Mathematics': { name: 'Mr.David', phone: '+201002572875' },
    'Physics': { name: 'Mr.Nady', phone: '+201150322018' },
    'Chemistry': { name: 'Dr.Mahjop', phone: '+201028407148' },
    'Biology': { name: 'Mr.Sameh', phone: '0100000004' },
    'Geology': { name: 'Mr.Mohamed Eid', phone: '+201007629236' },
    'Arabic': { name: 'Dr.Mahmoud ', phone: '+20 115 756 4150' },
    'English': { name: 'Ms.Noha', phone: '+201007722821' },
    'Social Studies': { name: 'Mr.Esam', phone: '+201009276761' },
    'German': { name: 'Mr.Mahmoud', phone: '0100000009' },
    'French': { name: 'Mrs.Claire', phone: '0100000010' },
    'Computer Science': { name: 'Mr.Osama Gandor', phone: '+201147172052' },
    'Mechanics': { name: 'Mr.David', phone: '+201002572875' }  // إضافة المعلم لمادة الميكانيكا
};


let state = {
    isAdmin: false,
    grade: null,
    semester: null,
    lessons: JSON.parse(localStorage.getItem('lessons') || '[]'),
    showWelcomePage: true,
    searchQuery: "",
    enteredExamPasswords: {}, // لتخزين كلمات مرور الامتحانات المدخلة من قبل الطلاب
};

let subjectState = {};

function saveLessons() {
    localStorage.setItem('lessons', JSON.stringify(state.lessons));
}

function toggleSubject(subject) {
    subjectState[subject] = !subjectState[subject];
    render();
}

function renderWelcomePage() {
    return `
        <div class="welcome-page animated fadeIn" style="text-align: center; padding: 50px;">
            <h1 style="font-size: 36px; margin-bottom: 20px;">Welcome to STEM School</h1>
            <p style="font-size: 36px; margin-bottom: 20px; color: white;">Where creativity and excellence exist.</p>
            <button class="btn" onclick="start()" style="background-color: blue; color: white; padding: 10px 20px; font-size: 16px; border: none; cursor: pointer;">
                Continue
            </button>
        </div>
    `;
}

function start() {
    state.showWelcomePage = false;
    render();
}

function renderAdminLogin() {
    return `
        <div class="admin-login animated fadeIn">
            <h2>Teacher Login</h2>
            <div class="form-group">
                <input type="password" id="adminPassword" placeholder="Password" class="input-field" onkeydown="handleEnterKey(event)">
            </div>
            <button class="btn" onclick="handleAdminLogin()">Login</button>
            <div id="loginError" class="error"></div>
        </div>
    `;
}

function handleEnterKey(event) {
    if (event.key === 'Enter') {
        handleAdminLogin();
    }
}

function renderGradeSelection() {
    return `
        <div class="grade-selection animated fadeIn">
            <h2>Select Grade</h2>
            <div>
                ${[10, 11, 12].map(grade => ` 
                    <button class="btn" onclick="selectGrade(${grade})">Grade ${grade}</button> 
                `).join('')}
            </div>
        </div>
    `;
}

function renderSemesterSelection() {
    return `
        <div class="semester-selection animated fadeIn">
            <h2>Select Semester</h2>
            <div>
                ${[1, 2].map(semester => ` 
                    <button class="btn" onclick="selectSemester(${semester})">Semester ${semester}</button> 
                `).join('')}
            </div>
        </div>
    `;
}

function renderLessonForm() {
    return `
        <div class="lesson-form animated fadeIn">
            <h2>Add New Lesson</h2>
            <div class="form-group">
                <select id="subject" required class="input-field">
                    <option value="">Select Subject</option>
                    ${SUBJECTS.map(subject => ` 
                        <option value="${subject}">${subject}</option> 
                    `).join('')}
                </select>
            </div>
            <div class="form-group">
                <input type="text" id="title" placeholder="Lesson Title" required class="input-field">
            </div>
            <div class="form-group">
                <input type="url" id="youtubeUrl" placeholder="YouTube Video Link" required class="input-field">
            </div>
            ${state.isAdmin ? `
                <div class="form-group">
                    <input type="password" id="examPassword" placeholder="Exam Password (optional)" class="input-field">
                </div>
                <button class="btn" onclick="handleAddExam()">Add Exam</button>
            ` : ''}
            <button class="btn" onclick="handleAddLesson()">Add Lesson</button>
        </div>
    `;
    
}

function handleAddLesson() {
    const subject = document.getElementById('subject').value;
    const title = document.getElementById('title').value;
    const youtubeUrl = document.getElementById('youtubeUrl').value;

    if (subject && title && youtubeUrl) {
        const newLesson = {
            id: Date.now().toString(),
            grade: state.grade,
            semester: state.semester,
            subject,
            title,
            youtubeUrl,
            addedBy: state.isAdmin ? 'teacher' : 'student'
        };

        state.lessons.push(newLesson);
        saveLessons();
        render();
    }
}

function handleAddExam() {
    const subject = document.getElementById('subject').value;
    const title = document.getElementById('title').value;
    const youtubeUrl = document.getElementById('youtubeUrl').value;
    const examPassword = document.getElementById('examPassword').value;

    if (subject && title) {
        const newExam = {
            id: Date.now().toString(),
            grade: state.grade,
            semester: state.semester,
            subject,
            title,
            youtubeUrl,
            password: examPassword ? examPassword : null,
            addedBy: state.isAdmin ? 'teacher' : 'student',
            type: 'exam'
        };

        state.lessons.push(newExam); // Adding the exam to lessons
        saveLessons();
        render();
    }
}

function handleEnterExamPassword(lessonId) {
    const lesson = state.lessons.find(lesson => lesson.id === lessonId);

    if (lesson.password) {
        // إنشاء مربع منبثق لكتابة كلمة السر
        const modalHtml = `
            <div class="modal-overlay" onclick="closeModal()"></div>
            <div class="modal-content">
                <h2>Enter Exam Password</h2>
                <input type="password" id="examPasswordInput" placeholder="Enter password" class="input-field">
                <button class="btn" onclick="verifyExamPassword('${lessonId}')">Submit</button>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    } else {
        alert('This exam does not require a password!');
    }
}


// التحقق من كلمة المرور المدخلة
function verifyExamPassword(lessonId) {
    const enteredPassword = document.getElementById('examPasswordInput').value;
    const lesson = state.lessons.find(lesson => lesson.id === lessonId);

    if (lesson.password && enteredPassword === lesson.password) {
        alert('Password is correct! You can now access the exam.');
        window.location.href = lesson.youtubeUrl; // التوجيه إلى رابط الامتحان
        closeModal(); // إغلاق النافذة المنبثقة
    } else {
        alert('Incorrect password!');
    }
}

// إغلاق المربع المنبثق
function closeModal() {
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalContent = document.querySelector('.modal-content');
    modalOverlay.remove();
    modalContent.remove();
}

function renderLessons() {
    const searchQuery = state.searchQuery.toLowerCase();
    const filteredLessons = state.lessons.filter(
        lesson => lesson.grade === state.grade && lesson.semester === state.semester
    ).filter(lesson =>
        lesson.title.toLowerCase().includes(searchQuery) ||
        lesson.subject.toLowerCase().includes(searchQuery)
    );

    const lessonsBySubject = filteredLessons.reduce((acc, lesson) => {
        if (!acc[lesson.subject]) {
            acc[lesson.subject] = [];
        }
        acc[lesson.subject].push(lesson);
        return acc;
    }, {});

    return `
        <div class="lessons-container animated fadeIn">
            <h2>Available Lessons</h2>
            <div class="search-bar" style="width: 100%; display: flex; align-items: center; margin-top: 10px;"> <!-- تم تعديل هنا -->
                <input 
                    type="text" 
                    id="searchInput" 
                    placeholder="Search for lessons..." 
                    value="${state.searchQuery}" 
                    class="input-field" 
                    style="flex: 1; padding: 10px; font-size: 16px; border: 1px solid #ccc; border-radius: 5px;"
                    onkeydown="handleSearchOnEnter(event)">
                <button class="btn" onclick="handleSearch()" 
                    style="padding: 10px 20px; font-size: 16px; background-color: blue; color: white; border: none; cursor: pointer; border-radius: 5px; margin-left: 10px; margin-top: -16px;">
                    Search
                </button>
            </div>
            ${Object.entries(lessonsBySubject).map(([subject, lessons]) => `
                <div class="subject-section">
                    <div class="subject-header" 
                        style="display: flex; align-items: center; background: white; padding: 10px; cursor: pointer; border: 1px solid #ccc; border-radius: 5px; margin-bottom: 10px;"
                        onclick="toggleSubject('${subject}')">
                        <div style="margin-right: 10px; background: white; color: black; padding: 5px; border-radius: 50%; border: 1px solid #ccc; flex-shrink: 0;">
                            ${subjectState[subject] ? '▲' : '▼'}
                        </div>
                        <h3 class="subject-title" style="margin: 0;">${subject}</h3>
                        <!-- زر اسأل معلم يظهر لجميع المواد باستثناء "References" و "Exams from teachers" -->
                        ${subject !== 'References' && subject !== 'Exams from teachers' ? `
                            <button class="btn" style="margin-left: auto; background-color: green; color: white;" onclick="askTeacher('${subject}')">
                                Ask Teacher
                            </button>
                        ` : ''}
                    </div>
                    <!-- عرض اسم المعلم إذا لم تكن المادة "References" أو "Exams from teachers" -->
                    ${subject !== 'References' && subject !== 'Exams from teachers' ? `
                        <div class="teacher-name" style="padding-left: 20px; font-weight: bold; color: #555; margin-top: 0px; font-size: 14px;">
                            Teacher: ${TEACHER_CONTACTS[subject]?.name || 'No teacher assigned'}
                        </div>
                    ` : ''}
                    <div class="lesson-list" style="display: ${subjectState[subject] ? 'block' : 'none'}; padding-left: 20px;">
                        ${lessons.map((lesson, index) => `
                            <div class="lesson-card" style="margin-bottom: 10px; ${index === 0 ? 'margin-top: 20px;' : ''}">
                                <div class="lesson-info">
                                    <h3>${lesson.title}</h3>
                                    <div class="lesson-meta">
                                        ${lesson.type === 'exam' ? '' : `<a href="${lesson.youtubeUrl}" target="_blank" class="youtube-link">Watch Lesson</a>`}
                                        ${lesson.password ? `
                                            <span 
                                                onclick="handleEnterExamPassword('${lesson.id}')"
                                                style="color: blue; cursor: pointer; text-decoration: none;">
                                                Enter Exam
                                            </span>` : ''}
                                        <span class="badge ${lesson.addedBy === 'teacher' ? 'badge-teacher' : 'badge-student'}">
                                            ${lesson.addedBy === 'teacher' ? 'Teacher' : 'Student'}
                                        </span>
                                    </div>
                                </div>
                                ${state.isAdmin ? `
                                    <div style="display: flex; align-items: center;">
                                        <!-- زر التعديل بنفس حجم زر الحذف ولونه أصفر -->
                                        <button class="btn btn-warning" onclick="openEditLessonModal('${lesson.id}')"
                                            style="margin-left: 10px; width: 100px; padding: 10px; font-size: 14px; background-color:rgb(255, 223, 66); color: white; border: none; cursor: pointer; border-radius: 8px; transition: background-color 0.3s;">
                                            Edit
                                        </button>
                                        <button class="btn btn-danger" onclick="handleDeleteLesson('${lesson.id}')"
                                            style="margin-left: 10px; width: 100px; padding: 10px; font-size: 14px; background-color: red; color: white; border: none; cursor: pointer; border-radius: 8px;">
                                            Delete
                                        </button>
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function openEditLessonModal(lessonId) {
    const lesson = state.lessons.find(lesson => lesson.id === lessonId);
    if (!lesson) return;

    const modalHtml = `
        <div class="modal-overlay" onclick="closeModal()"></div>
        <div class="modal-content">
            <h2>Edit Lesson</h2>
            <div class="form-group">
                <input type="text" id="editLessonTitle" value="${lesson.title}" class="input-field" placeholder="Lesson Title" required>
            </div>
            <div class="form-group">
                <input type="url" id="editYoutubeUrl" value="${lesson.youtubeUrl}" class="input-field" placeholder="YouTube Link" required>
            </div>
            <button class="btn" onclick="handleSaveLessonEdits('${lesson.id}')">Save Changes</button>
            <button class="btn" onclick="closeModal()">Cancel</button>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function handleSaveLessonEdits(lessonId) {
    const lesson = state.lessons.find(lesson => lesson.id === lessonId);
    if (!lesson) return;

    const newTitle = document.getElementById('editLessonTitle').value;
    const newUrl = document.getElementById('editYoutubeUrl').value;

    if (newTitle && newUrl) {
        lesson.title = newTitle;
        lesson.youtubeUrl = newUrl;
        saveLessons();
        closeModal();
        render();
    } else {
        alert("Please fill in all fields.");
    }
}

function closeModal() {
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalContent = document.querySelector('.modal-content');
    modalOverlay.remove();
    modalContent.remove();
}

function openEditLessonModal(lessonId) {
    const lesson = state.lessons.find(lesson => lesson.id === lessonId);
    if (!lesson) return;

    const modalHtml = `
        <div class="modal-overlay" onclick="closeModal()"></div>
        <div class="modal-content">
            <h2>Edit Lesson</h2>
            <div class="form-group">
                <input type="text" id="editLessonTitle" value="${lesson.title}" class="input-field" placeholder="Lesson Title" required>
            </div>
            <div class="form-group">
                <input type="url" id="editYoutubeUrl" value="${lesson.youtubeUrl}" class="input-field" placeholder="YouTube Link" required>
            </div>
            <button class="btn" onclick="handleSaveLessonEdits('${lesson.id}')">Save Changes</button>
            <button class="btn" onclick="closeModal()">Cancel</button>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function handleSaveLessonEdits(lessonId) {
    const lesson = state.lessons.find(lesson => lesson.id === lessonId);
    if (!lesson) return;

    const newTitle = document.getElementById('editLessonTitle').value;
    const newUrl = document.getElementById('editYoutubeUrl').value;

    if (newTitle && newUrl) {
        lesson.title = newTitle;
        lesson.youtubeUrl = newUrl;
        saveLessons();
        closeModal();
        render();
    } else {
        alert("Please fill in all fields.");
    }
}

function closeModal() {
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalContent = document.querySelector('.modal-content');
    modalOverlay.remove();
    modalContent.remove();
}

function openEditLessonModal(lessonId) {
    const lesson = state.lessons.find(lesson => lesson.id === lessonId);
    if (!lesson) return;

    const modalHtml = `
        <div class="modal-overlay" onclick="closeModal()"></div>
        <div class="modal-content">
            <h2>Edit Lesson</h2>
            <div class="form-group">
                <input type="text" id="editLessonTitle" value="${lesson.title}" class="input-field" placeholder="Lesson Title" required>
            </div>
            <div class="form-group">
                <input type="url" id="editYoutubeUrl" value="${lesson.youtubeUrl}" class="input-field" placeholder="YouTube Link" required>
            </div>
            <button class="btn" onclick="handleSaveLessonEdits('${lesson.id}')">Save Changes</button>
            <button class="btn" onclick="closeModal()">Cancel</button>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function handleSaveLessonEdits(lessonId) {
    const lesson = state.lessons.find(lesson => lesson.id === lessonId);
    if (!lesson) return;

    const newTitle = document.getElementById('editLessonTitle').value;
    const newUrl = document.getElementById('editYoutubeUrl').value;

    if (newTitle && newUrl) {
        lesson.title = newTitle;
        lesson.youtubeUrl = newUrl;
        saveLessons();
        closeModal();
        render();
    } else {
        alert("Please fill in all fields.");
    }
}

function closeModal() {
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalContent = document.querySelector('.modal-content');
    modalOverlay.remove();
    modalContent.remove();
}


function openEditLessonModal(lessonId) {
    const lesson = state.lessons.find(lesson => lesson.id === lessonId);
    if (!lesson) return;

    const modalHtml = `
        <div class="modal-overlay" onclick="closeModal()"></div>
        <div class="modal-content">
            <h2>Edit Lesson</h2>
            <div class="form-group">
                <input type="text" id="editLessonTitle" value="${lesson.title}" class="input-field" placeholder="Lesson Title" required>
            </div>
            <div class="form-group">
                <input type="url" id="editYoutubeUrl" value="${lesson.youtubeUrl}" class="input-field" placeholder="YouTube Link" required>
            </div>
            <button class="btn" onclick="handleSaveLessonEdits('${lesson.id}')">Save Changes</button>
            <button class="btn" onclick="closeModal()">Cancel</button>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function handleSaveLessonEdits(lessonId) {
    const lesson = state.lessons.find(lesson => lesson.id === lessonId);
    if (!lesson) return;

    const newTitle = document.getElementById('editLessonTitle').value;
    const newUrl = document.getElementById('editYoutubeUrl').value;

    if (newTitle && newUrl) {
        lesson.title = newTitle;
        lesson.youtubeUrl = newUrl;
        saveLessons();
        closeModal();
        render();
    } else {
        alert("Please fill in all fields.");
    }
}

function closeModal() {
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalContent = document.querySelector('.modal-content');
    modalOverlay.remove();
    modalContent.remove();
}


function openEditLessonModal(lessonId) {
    const lesson = state.lessons.find(lesson => lesson.id === lessonId);
    if (!lesson) return;

    const modalHtml = `
        <div class="modal-overlay" onclick="closeModal()"></div>
        <div class="modal-content">
            <h2>Edit Lesson</h2>
            <div class="form-group">
                <input type="text" id="editLessonTitle" value="${lesson.title}" class="input-field" placeholder="Lesson Title" required>
            </div>
            <div class="form-group">
                <input type="url" id="editYoutubeUrl" value="${lesson.youtubeUrl}" class="input-field" placeholder="YouTube Link" required>
            </div>
            <button class="btn" onclick="handleSaveLessonEdits('${lesson.id}')">Save Changes</button>
            <button class="btn" onclick="closeModal()">Cancel</button>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function handleSaveLessonEdits(lessonId) {
    const lesson = state.lessons.find(lesson => lesson.id === lessonId);
    if (!lesson) return;

    const newTitle = document.getElementById('editLessonTitle').value;
    const newUrl = document.getElementById('editYoutubeUrl').value;

    if (newTitle && newUrl) {
        lesson.title = newTitle;
        lesson.youtubeUrl = newUrl;
        saveLessons();
        closeModal();
        render();
    } else {
        alert("Please fill in all fields.");
    }
}

function closeModal() {
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalContent = document.querySelector('.modal-content');
    modalOverlay.remove();
    modalContent.remove();
}


function openEditLessonModal(lessonId) {
    const lesson = state.lessons.find(lesson => lesson.id === lessonId);
    if (!lesson) return;

    const modalHtml = `
        <div class="modal-overlay" onclick="closeModal()"></div>
        <div class="modal-content">
            <h2>Edit Lesson</h2>
            <div class="form-group">
                <input type="text" id="editLessonTitle" value="${lesson.title}" class="input-field" placeholder="Lesson Title" required>
            </div>
            <div class="form-group">
                <input type="url" id="editYoutubeUrl" value="${lesson.youtubeUrl}" class="input-field" placeholder="YouTube Link" required>
            </div>
            <button class="btn" onclick="handleSaveLessonEdits('${lesson.id}')">Save Changes</button>
            <button class="btn" onclick="closeModal()">Cancel</button>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function handleSaveLessonEdits(lessonId) {
    const lesson = state.lessons.find(lesson => lesson.id === lessonId);
    if (!lesson) return;

    const newTitle = document.getElementById('editLessonTitle').value;
    const newUrl = document.getElementById('editYoutubeUrl').value;

    if (newTitle && newUrl) {
        lesson.title = newTitle;
        lesson.youtubeUrl = newUrl;
        saveLessons();
        closeModal();
        render();
    } else {
        alert("Please fill in all fields.");
    }
}

function closeModal() {
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalContent = document.querySelector('.modal-content');
    modalOverlay.remove();
    modalContent.remove();
}




function handleDeleteLesson(id) {
    const lessonIndex = state.lessons.findIndex(lesson => lesson.id === id);
    if (lessonIndex !== -1) {
        state.lessons.splice(lessonIndex, 1);
        saveLessons();
        render();
    }
}

function render() {
    const app = document.getElementById('app');
    let content = '';

    if (!state.showWelcomePage) {
        content += `
    <button class="btn btn-secondary animated pulse" onclick="handleBackButton()" 
    style="position: fixed; top: 10px; left: 10px; z-index: 1000; 
           background-color: transparent; border: 2px solid rgba(255, 255, 255, 0.7); 
           color: rgba(255, 255, 255, 0.7); padding: 10px 20px; font-size: 16px;">
    ← Back
</button>


        `;
    }

    if (state.showWelcomePage) {
        content += renderWelcomePage();
    } else {
        if (!state.isAdmin) {
            content += renderAdminLogin();
        }
        if (!state.grade) {
            content += renderGradeSelection();
        } else if (!state.semester) {
            content += renderSemesterSelection();
        } else {
            content += renderLessonForm();
            content += renderLessons();
        }
    }

    if (state.isAdmin) {
        content += `
            <button class="btn btn-danger animated fadeIn" onclick="handleLogout()" 
                style="position: fixed; top: 50px; left: 170px; z-index: 1000; padding: 8px 16px; background-color: red;">
                Logout
            </button>
        `;
    }

    app.innerHTML = content;
}

function handleSearch() {
    const searchInput = document.getElementById('searchInput').value;
    state.searchQuery = searchInput;
    render();
}

function handleSearchOnEnter(event) {
    if (event.key === 'Enter') {
        handleSearch();
    }
}

function handleLogout() {
    state.isAdmin = false;
    render();
}

function handleBackButton() {
    if (state.semester !== null) {
        state.semester = null;
    } else if (state.grade !== null) {
        state.grade = null;
    } else {
        state.showWelcomePage = true;
    }
    render();
}

function selectGrade(grade) {
    state.grade = grade;
    render();
}

function selectSemester(semester) {
    state.semester = semester;
    render();
}

function handleAdminLogin() {
    const password = document.getElementById('adminPassword').value;
    if (password === 'yahia123') {
        state.isAdmin = true;
        render();
    } else {
        document.getElementById('loginError').textContent = 'Incorrect password';
    }
}

function askTeacher(subject) {
    const contact = TEACHER_CONTACTS[subject].phone || "No contact available";
    const message = encodeURIComponent(`Hello, I need help with ${subject}.`);
    const whatsappLink = `https://wa.me/${contact}?text=${message}`;

    window.open(whatsappLink, '_blank');
}
function render() {
    const app = document.getElementById('app');
    let content = '';

    if (!state.showWelcomePage) {
        content += `
            <button class="btn btn-secondary animated pulse" onclick="handleBackButton()" 
            style="position: fixed; top: 10px; left: 10px; z-index: 1000; 
            background-color: transparent; border: 2px solid rgba(255, 255, 255, 0.7); 
            color: rgba(255, 255, 255, 0.7); padding: 10px 20px; font-size: 16px;">
            ← Back
            </button>
        `;
    }

    if (state.showWelcomePage) {
        content += renderWelcomePage();
    } else {
        if (!state.isAdmin) {
            content += renderAdminLogin();
        }
        if (!state.grade) {
            content += renderGradeSelection();
        } else if (!state.semester) {
            content += renderSemesterSelection();
        } else {
            content += renderLessonForm();
            content += renderLessons();
        }
    }

    if (state.isAdmin) {
        content += `
            <button class="btn btn-danger animated fadeIn" onclick="handleLogout()" 
                style="position: fixed; top: 50px; left: 170px; z-index: 1000; padding: 8px 16px; background-color: red;">
                Logout
            </button>
        `;
    }

    // إضافة النص والأيقونة فقط بعد اختيار الفصل
    if (state.semester) {
        content += `
            <div style="position: fixed; bottom: 30px; right: 30px; text-align: center; z-index: 1000;">
                <span style="font-size: 16px; color:rgb(255, 255, 255); font-weight: bold; display: block; margin-bottom: 5px;">
                    Ask AI
                </span>
                <button onclick="openChatGPT()" style="
                    background-color: transparent; 
                    border: none; 
                    cursor: pointer;
                ">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg" 
                        alt="ChatGPT Logo" 
                        style="width: 60px; height: 60px; border-radius: 50%; border: 1px solid #0A74DA;">
                </button>
            </div>
        `;
    }

    app.innerHTML = content;
}

// دالة فتح موقع شات GPT
function openChatGPT() {
    window.open('https://chat.openai.com/', '_blank');
}

render();
