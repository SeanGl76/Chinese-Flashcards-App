// --- 1. DATA SETUP ---
const lesson9Words = [
    { hanzi: '舟', pinyin: 'zhōu', english: 'Boat' },
    { hanzi: '龙舟', pinyin: 'lóng zhōu', english: 'Dragon boat' },
    { hanzi: '轮船', pinyin: 'lún chuán', english: 'Steamship' },
    { hanzi: '渔船', pinyin: 'yú chuán', english: 'Fishing boat' },
    { hanzi: '宇宙飞船', pinyin: 'yǔ zhòu fēi chuán', english: 'Spaceship' },
    { hanzi: '帆船', pinyin: 'fān chuán', english: 'Sailboat' },
    { hanzi: '纸船', pinyin: 'zhǐ chuán', english: 'Paper boat' },
    { hanzi: '船长', pinyin: 'chuán zhǎng', english: 'Captain' },
    { hanzi: '航空公司', pinyin: 'háng kōng gōng sī', english: 'Airline' },
    { hanzi: '船舱', pinyin: 'chuán cāng', english: 'Cabin' },
    { hanzi: '航天飞机', pinyin: 'háng tiān fēi jī', english: 'Space shuttle' },
    { hanzi: '机舱', pinyin: 'jī cāng', english: 'Aircraft cabin' },
    { hanzi: '军舰', pinyin: 'jūn jiàn', english: 'Warship' },
    { hanzi: '航空母舰', pinyin: 'háng kōng mǔ jiàn', english: 'Aircraft carrier' },
    { hanzi: '舰队', pinyin: 'jiàn duì', english: 'Fleet' },
    { hanzi: '教练', pinyin: 'jiào liàn', english: 'Coach' },
    { hanzi: '救生衣', pinyin: 'jiù shēng yī', english: 'Life jacket' },
    { hanzi: '导航', pinyin: 'dǎo háng', english: 'Navigation' },
    { hanzi: '夏令营', pinyin: 'xià lìng yíng', english: 'Summer camp' },
    { hanzi: '航海证书', pinyin: 'háng hǎi zhèng shū', english: 'Sailing certificate' }
].map(w => ({...w, group: 'Lesson 9'}));

const hsk1Words = [
    { hanzi: '爱', pinyin: 'ài', english: 'love' },
    { hanzi: '八', pinyin: 'bā', english: 'eight' },
    { hanzi: '爸爸', pinyin: 'bàba', english: 'dad' },
    { hanzi: '杯子', pinyin: 'bēizi', english: 'cup' },
    { hanzi: '北京', pinyin: 'Běijīng', english: 'Beijing' },
    { hanzi: '本', pinyin: 'běn', english: 'measure word for books' },
    { hanzi: '不', pinyin: 'bù', english: 'not/no' },
    { hanzi: '不客气', pinyin: 'bú kèqi', english: 'you are welcome' },
    { hanzi: '菜', pinyin: 'cài', english: 'dish' },
    { hanzi: '茶', pinyin: 'chá', english: 'tea' },
    { hanzi: '吃', pinyin: 'chī', english: 'eat' },
    { hanzi: '出租车', pinyin: 'chūzūchē', english: 'taxi' },
    { hanzi: '打电话', pinyin: 'dǎ diànhuà', english: 'call' },
    { hanzi: '大', pinyin: 'dà', english: 'big' },
    { hanzi: '的', pinyin: 'de', english: 'of' },
    { hanzi: '点', pinyin: 'diǎn', english: 'o\'clock' },
    { hanzi: '电脑', pinyin: 'diànnǎo', english: 'computer' },
    { hanzi: '电视', pinyin: 'diànshì', english: 'TV' },
    { hanzi: '电影', pinyin: 'diànyǐng', english: 'movie' },
    { hanzi: '东西', pinyin: 'dōngxi', english: 'thing' },
    { hanzi: '都', pinyin: 'dōu', english: 'all' },
    { hanzi: '读', pinyin: 'dú', english: 'read' },
    { hanzi: '对不起', pinyin: 'duìbuqǐ', english: 'sorry' },
    { hanzi: '多', pinyin: 'duō', english: 'many' },
    { hanzi: '多少', pinyin: 'duōshao', english: 'how many' },
    { hanzi: '儿子', pinyin: 'érzi', english: 'son' },
    { hanzi: '二', pinyin: 'èr', english: 'two' },
    { hanzi: '饭店', pinyin: 'fàndiàn', english: 'restaurant' },
    { hanzi: '飞机', pinyin: 'fēijī', english: 'airplane' },
    { hanzi: '分钟', pinyin: 'fēnzhōng', english: 'minute' },
    { hanzi: '高兴', pinyin: 'gāoxìng', english: 'happy' },
    { hanzi: '个', pinyin: 'gè', english: 'measure word' },
    { hanzi: '工作', pinyin: 'gōngzuò', english: 'job' },
    { hanzi: '狗', pinyin: 'gǒu', english: 'dog' },
    { hanzi: '汉语', pinyin: 'Hànyǔ', english: 'Chinese' },
    { hanzi: '好', pinyin: 'hǎo', english: 'good' },
    { hanzi: '号', pinyin: 'hào', english: 'number/day' },
    { hanzi: '喝', pinyin: 'hē', english: 'drink' },
    { hanzi: '和', pinyin: 'hé', english: 'and' },
    { hanzi: '很', pinyin: 'hěn', english: 'very' },
    { hanzi: '会', pinyin: 'huì', english: 'can' },
    { hanzi: '几', pinyin: 'jǐ', english: 'how many' },
    { hanzi: '家', pinyin: 'jiā', english: 'home' },
    { hanzi: '叫', pinyin: 'jiào', english: 'called' },
    { hanzi: '今天', pinyin: 'jīntiān', english: 'today' },
    { hanzi: '九', pinyin: 'jiǔ', english: 'nine' },
    { hanzi: '开', pinyin: 'kāi', english: 'open' },
    { hanzi: '看', pinyin: 'kàn', english: 'look' },
    { hanzi: '看见', pinyin: 'kànjiàn', english: 'see' },
    { hanzi: '块', pinyin: 'kuài', english: 'yuan' },
    { hanzi: '来', pinyin: 'lái', english: 'come' },
    { hanzi: '老师', pinyin: 'lǎoshī', english: 'teacher' },
    { hanzi: '了', pinyin: 'le', english: 'particle' },
    { hanzi: '冷', pinyin: 'lěng', english: 'cold' },
    { hanzi: '里', pinyin: 'lǐ', english: 'inside' },
    { hanzi: '零', pinyin: 'líng', english: 'zero' },
    { hanzi: '六', pinyin: 'liù', english: 'six' },
    { hanzi: '妈妈', pinyin: 'māma', english: 'mom' },
    { hanzi: '吗', pinyin: 'ma', english: '?' },
    { hanzi: '买', pinyin: 'mǎi', english: 'buy' },
    { hanzi: '猫', pinyin: 'māo', english: 'cat' },
    { hanzi: '没', pinyin: 'méi', english: 'not' },
    { hanzi: '没关系', pinyin: 'méi guānxi', english: 'it\'s okay' },
    { hanzi: '米饭', pinyin: 'mǐfàn', english: 'rice' },
    { hanzi: '明天', pinyin: 'míngtiān', english: 'tomorrow' },
    { hanzi: '名字', pinyin: 'míngzi', english: 'name' },
    { hanzi: '哪', pinyin: 'nǎ', english: 'which' },
    { hanzi: '哪儿', pinyin: 'nǎr', english: 'where' },
    { hanzi: '那', pinyin: 'nà', english: 'that' },
    { hanzi: '呢', pinyin: 'ne', english: 'particle' },
    { hanzi: '能', pinyin: 'néng', english: 'can' },
    { hanzi: '你', pinyin: 'nǐ', english: 'you' },
    { hanzi: '年', pinyin: 'nián', english: 'year' },
    { hanzi: '女儿', pinyin: 'nǚ\'ér', english: 'daughter' },
    { hanzi: '朋友', pinyin: 'péngyou', english: 'friend' },
    { hanzi: '漂亮', pinyin: 'piàoliang', english: 'beautiful' },
    { hanzi: '苹果', pinyin: 'píngguǒ', english: 'apple' },
    { hanzi: '七', pinyin: 'qī', english: 'seven' },
    { hanzi: '钱', pinyin: 'qián', english: 'money' },
    { hanzi: '前面', pinyin: 'qiánmiàn', english: 'front' },
    { hanzi: '请', pinyin: 'qǐng', english: 'please' },
    { hanzi: '去', pinyin: 'qù', english: 'go' },
    { hanzi: '热', pinyin: 'rè', english: 'hot' },
    { hanzi: '人', pinyin: 'rén', english: 'person' },
    { hanzi: '认识', pinyin: 'rènshi', english: 'know' },
    { hanzi: '三', pinyin: 'sān', english: 'three' },
    { hanzi: '商店', pinyin: 'shāngdiàn', english: 'store' },
    { hanzi: '上', pinyin: 'shàng', english: 'up' },
    { hanzi: '上午', pinyin: 'shàngwǔ', english: 'morning' },
    { hanzi: '少', pinyin: 'shǎo', english: 'few' },
    { hanzi: '谁', pinyin: 'shéi', english: 'who' },
    { hanzi: '什么', pinyin: 'shénme', english: 'what' },
    { hanzi: '十', pinyin: 'shí', english: 'ten' },
    { hanzi: '时候', pinyin: 'shíhou', english: 'time' },
    { hanzi: '是', pinyin: 'shì', english: 'is' },
    { hanzi: '书', pinyin: 'shū', english: 'book' },
    { hanzi: '水', pinyin: 'shuǐ', english: 'water' },
    { hanzi: '水果', pinyin: 'shuǐguǒ', english: 'fruit' },
    { hanzi: '睡觉', pinyin: 'shuìjiào', english: 'sleep' },
    { hanzi: '说', pinyin: 'shuō', english: 'speak' },
    { hanzi: '四', pinyin: 'sì', english: 'four' },
    { hanzi: '岁', pinyin: 'suì', english: 'years old' },
    { hanzi: '他', pinyin: 'tā', english: 'he' },
    { hanzi: '她', pinyin: 'tā', english: 'she' },
    { hanzi: '太', pinyin: 'tài', english: 'too' },
    { hanzi: '天气', pinyin: 'tiānqì', english: 'weather' },
    { hanzi: '听', pinyin: 'tīng', english: 'listen' },
    { hanzi: '同学', pinyin: 'tóngxué', english: 'classmate' },
    { hanzi: '喂', pinyin: 'wèi', english: 'hello' },
    { hanzi: '我', pinyin: 'wǒ', english: 'me' },
    { hanzi: '我们', pinyin: 'wǒmen', english: 'us' },
    { hanzi: '五', pinyin: 'wǔ', english: 'five' },
    { hanzi: '喜欢', pinyin: 'xǐhuan', english: 'like' },
    { hanzi: '下', pinyin: 'xià', english: 'down' },
    { hanzi: '下午', pinyin: 'xiàwǔ', english: 'afternoon' },
    { hanzi: '下雨', pinyin: 'xià yǔ', english: 'rain' },
    { hanzi: '先生', pinyin: 'xiānsheng', english: 'Mr.' },
    { hanzi: '现在', pinyin: 'xiànzài', english: 'now' },
    { hanzi: '想', pinyin: 'xiǎng', english: 'think' },
    { hanzi: '小', pinyin: 'xiǎo', english: 'small' },
    { hanzi: '小姐', pinyin: 'xiǎojiě', english: 'Miss' },
    { hanzi: '些', pinyin: 'xiē', english: 'some' },
    { hanzi: '写', pinyin: 'xiě', english: 'write' },
    { hanzi: '谢谢', pinyin: 'xièxie', english: 'thanks' },
    { hanzi: '星期', pinyin: 'xīngqī', english: 'week' },
    { hanzi: '学生', pinyin: 'xuésheng', english: 'student' },
    { hanzi: '学习', pinyin: 'xuéxí', english: 'study' },
    { hanzi: '学校', pinyin: 'xuéxiào', english: 'school' },
    { hanzi: '一', pinyin: 'yī', english: 'one' },
    { hanzi: '衣服', pinyin: 'yīfu', english: 'clothes' },
    { hanzi: '医生', pinyin: 'yīshēng', english: 'doctor' },
    { hanzi: '医院', pinyin: 'yīyuàn', english: 'hospital' },
    { hanzi: '椅子', pinyin: 'yǐzi', english: 'chair' },
    { hanzi: '有', pinyin: 'yǒu', english: 'have' },
    { hanzi: '月', pinyin: 'yuè', english: 'month' },
    { hanzi: '再见', pinyin: 'zàijiàn', english: 'goodbye' },
    { hanzi: '在', pinyin: 'zài', english: 'at' },
    { hanzi: '怎么', pinyin: 'zěnme', english: 'how' },
    { hanzi: '怎么样', pinyin: 'zěnmeyàng', english: 'how is it' },
    { hanzi: '这', pinyin: 'zhè', english: 'this' },
    { hanzi: '中国', pinyin: 'Zhōngguó', english: 'China' },
    { hanzi: '中午', pinyin: 'zhōngwǔ', english: 'noon' },
    { hanzi: '住', pinyin: 'zhù', english: 'live' },
    { hanzi: '桌子', pinyin: 'zhuōzi', english: 'table' },
    { hanzi: '字', pinyin: 'zì', english: 'character' },
    { hanzi: '昨天', pinyin: 'zuótiān', english: 'yesterday' },
    { hanzi: '坐', pinyin: 'zuò', english: 'sit' },
    { hanzi: '做', pinyin: 'zuò', english: 'do' }
].map(w => ({...w, group: 'HSK1'}));

const defaultWords = [...lesson9Words, ...hsk1Words];

// --- 2. GRAMMAR PARTS ---
const subjects = [
    { ch: '船长', py: 'Chuán zhǎng', en: 'The captain', isSingular: true },
    { ch: '教练', py: 'Jiào liàn', en: 'The coach', isSingular: true },
    { ch: '中国人', py: 'Zhōngguó rén', en: 'Chinese people', isSingular: false },
    { ch: '我们', py: 'Wǒmen', en: 'We', isSingular: false },
    { ch: '他', py: 'Tā', en: 'He', isSingular: true },
    { ch: '学生', py: 'Xuésheng', en: 'The student', isSingular: true },
    { ch: '医生', py: 'Yīshēng', en: 'The doctor', isSingular: true },
    { ch: '老师', py: 'Lǎoshī', en: 'The teacher', isSingular: true }
];

const verbs = [
    { ch: '有', py: 'yǒu', plural: 'have', singular: 'has' },
    { ch: '喜欢', py: 'xǐhuān', plural: 'like', singular: 'likes' },
    { ch: '看见了', py: 'kànjiàn le', plural: 'saw', singular: 'saw' },
    { ch: '想要', py: 'xiǎng yào', plural: 'want', singular: 'wants' },
    { ch: '驾驶', py: 'jiàshǐ', plural: 'drive', singular: 'drives' },
    { ch: '买', py: 'mǎi', plural: 'buy', singular: 'buys' },
    { ch: '吃', py: 'chī', plural: 'eat', singular: 'eats' }
];

// --- 3. STATE ---
let allWords = [];
let activeList = [];
let currentIndex = 0;
let dailyLimit = 10;
let currentMode = 'words';
let availableGroups = [];
let currentViewingGroup = null;

// --- 4. DOM ELEMENTS ---
const menuSection = document.getElementById('main-menu');
const addWordSection = document.getElementById('add-word-menu');
const wordListSection = document.getElementById('word-list-section');
const syncSection = document.getElementById('sync-menu');
const gameSection = document.getElementById('game-area');
const syncBox = document.getElementById('sync-data-box');

const cardElement = document.querySelector('.card');
const displayHanzi = document.getElementById('display-hanzi');
const displayPinyin = document.getElementById('display-pinyin');
const displayEnglish = document.getElementById('display-english');
const displayGroup = document.getElementById('display-group');
const tableBody = document.getElementById('word-table-body');
const searchInput = document.getElementById('search-bar');
const progressText = document.getElementById('progress-text');
const progressFill = document.getElementById('progress-fill');
const groupFiltersDiv = document.getElementById('group-filters');
const groupDatalist = document.getElementById('group-suggestions');
const wbGroupView = document.getElementById('wb-group-view');
const wbDetailView = document.getElementById('wb-detail-view');
const wbGroupGrid = document.getElementById('wb-group-grid');
const wbTitle = document.getElementById('wb-title');

const srsControls = document.getElementById('srs-controls');
const srsExit = document.getElementById('srs-exit');
const sentenceControls = document.getElementById('sentence-controls');

// --- 5. INITIALIZATION ---
function loadAllWords() {
    const customWordsJSON = localStorage.getItem('myCustomChineseWords');
    let customWords = customWordsJSON ? JSON.parse(customWordsJSON) : [];

    const deletedDefaultsJSON = localStorage.getItem('deletedDefaultWords');
    let deletedDefaults = deletedDefaultsJSON ? JSON.parse(deletedDefaultsJSON) : [];

    let visibleDefaults = defaultWords.filter(word => !deletedDefaults.includes(word.hanzi));

    allWords = [...visibleDefaults, ...customWords];

    const reviewDataJSON = localStorage.getItem('srsReviewData');
    const reviewData = reviewDataJSON ? JSON.parse(reviewDataJSON) : {};
    allWords.forEach(word => {
        word.nextReview = reviewData[word.hanzi] || 0;
    });

    updateGroupList();
}

function updateGroupList() {
    const groupSet = new Set(allWords.map(w => w.group || 'Uncategorized'));
    availableGroups = Array.from(groupSet).sort();
    
    groupDatalist.innerHTML = '';
    availableGroups.forEach(grp => {
        const opt = document.createElement('option');
        opt.value = grp;
        groupDatalist.appendChild(opt);
    });

    if (groupFiltersDiv.innerHTML === '') {
        renderGroupFilters();
    }
}

function renderGroupFilters() {
    groupFiltersDiv.innerHTML = '';
    availableGroups.forEach(grp => {
        const btn = document.createElement('div');
        btn.className = 'group-toggle active';
        btn.textContent = grp;
        btn.onclick = () => btn.classList.toggle('active');
        groupFiltersDiv.appendChild(btn);
    });
}

loadAllWords();

// --- 6. NAVIGATION ---
function hideAllSections() {
    const sections = [menuSection, addWordSection, wordListSection, syncSection, gameSection];
    sections.forEach(sec => sec.classList.add('hidden'));
}

function returnToMenu() {
    hideAllSections();
    menuSection.classList.remove('hidden');
    srsControls.classList.add('hidden');
    srsExit.classList.add('hidden');
    sentenceControls.classList.add('hidden');
}

// --- 7. WORD MANAGEMENT ---
function showAddWordMenu() {
    hideAllSections();
    addWordSection.classList.remove('hidden');
}

function saveNewWord() {
    const group = document.getElementById('input-group').value.trim() || 'Custom';
    const hanzi = document.getElementById('input-hanzi').value.trim();
    const pinyin = document.getElementById('input-pinyin').value.trim();
    const english = document.getElementById('input-english').value.trim();

    if (!hanzi || !pinyin || !english) return alert("Please fill in all fields!");

    // Check Duplicate
    const exists = allWords.some(w => w.hanzi === hanzi);
    if (exists) {
        return alert(`The word "${hanzi}" is already in your Word Bank.`);
    }

    const newWord = { hanzi, pinyin, english, group, isCustom: true };
    let customWords = JSON.parse(localStorage.getItem('myCustomChineseWords')) || [];
    customWords.push(newWord);
    localStorage.setItem('myCustomChineseWords', JSON.stringify(customWords));

    loadAllWords();
    renderGroupFilters();
    
    document.getElementById('input-hanzi').value = '';
    document.getElementById('input-pinyin').value = '';
    document.getElementById('input-english').value = '';
    
    alert("Word Saved!");
    returnToMenu();
}

// --- 8. EXCEL IMPORT (SHEETJS) ---
function triggerFileUpload() {
    document.getElementById('file-upload').click();
}

function handleExcelUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const groupName = prompt("Enter a name for this new group (e.g. 'Chapter 1'):", "Imported Excel");
    if (!groupName) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convert to array of arrays
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1});
            
            let extractedWords = [];
            let skippedCount = 0;

            jsonData.forEach((row, index) => {
                // Get cells (Hanzi=A, Pinyin=B, English=C)
                const hanzi = (row[0] || "").toString().trim();
                const pinyin = (row[1] || "").toString().trim();
                const english = (row[2] || "").toString().trim();

                // Validation: Must have Chinese char
                if (/[\u4e00-\u9fa5]/.test(hanzi)) {
                    // Check duplicate in DB or current batch
                    const existsInDB = allWords.some(w => w.hanzi === hanzi);
                    const existsInBatch = extractedWords.some(w => w.hanzi === hanzi);

                    if (!existsInDB && !existsInBatch) {
                        extractedWords.push({
                            hanzi: hanzi,
                            pinyin: pinyin || "?",
                            english: english || "?",
                            group: groupName,
                            isCustom: true
                        });
                    } else {
                        skippedCount++;
                    }
                }
            });

            if (extractedWords.length === 0) {
                alert(`No new words found.\n(${skippedCount} duplicates skipped)`);
                return;
            }

            let customWords = JSON.parse(localStorage.getItem('myCustomChineseWords')) || [];
            customWords = [...customWords, ...extractedWords];
            localStorage.setItem('myCustomChineseWords', JSON.stringify(customWords));
            
            loadAllWords();
            renderGroupFilters();
            alert(`Success! Imported ${extractedWords.length} words to "${groupName}".\n(${skippedCount} duplicates skipped)`);
            
        } catch (error) {
            console.error(error);
            alert("Error reading Excel file. Ensure it is .xlsx format.");
        }
    };
    reader.readAsArrayBuffer(file);
}

// --- 9. WORD BANK UI ---
function showWordBank() {
    loadAllWords();
    hideAllSections();
    wordListSection.classList.remove('hidden');
    wbGroupView.classList.remove('hidden');
    wbDetailView.classList.add('hidden');
    wbTitle.textContent = "Word Bank";
    
    wbGroupGrid.innerHTML = '';
    availableGroups.forEach(grp => {
        const count = allWords.filter(w => w.group === grp).length;
        
        const folder = document.createElement('div');
        folder.className = 'folder-card';
        folder.innerHTML = `
            <button class="folder-delete" onclick="deleteGroup('${grp}', event)">✕</button>
            <span class="folder-icon">📁</span>
            <span class="folder-name">${grp}</span>
            <span class="folder-count">${count} words</span>
        `;
        folder.onclick = (e) => {
            if(!e.target.classList.contains('folder-delete')) openGroupDetail(grp);
        };
        wbGroupGrid.appendChild(folder);
    });
}

function openGroupDetail(groupName) {
    currentViewingGroup = groupName;
    wbGroupView.classList.add('hidden');
    wbDetailView.classList.remove('hidden');
    wbTitle.textContent = `Word Bank > ${groupName}`;
    searchInput.value = '';
    renderTable(groupName);
}

function backToFolders() {
    currentViewingGroup = null;
    wbGroupView.classList.remove('hidden');
    wbDetailView.classList.add('hidden');
    wbTitle.textContent = "Word Bank";
}

function renderTable(groupName) {
    tableBody.innerHTML = '';
    const filter = searchInput.value.toLowerCase();
    
    const wordsToShow = allWords.filter(word => {
        const matchesGroup = word.group === groupName;
        const matchesSearch = (word.english + word.hanzi).toLowerCase().includes(filter);
        return matchesGroup && matchesSearch;
    });

    wordsToShow.forEach(word => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${word.hanzi}</strong></td>
            <td>${word.pinyin}</td>
            <td>${word.english}</td>
            <td><button class="delete-btn" onclick="deleteWord('${word.hanzi}')">🗑️</button></td>
        `;
        tableBody.appendChild(row);
    });
}

function filterTable() {
    if (currentViewingGroup) {
        renderTable(currentViewingGroup);
    }
}

function deleteGroup(groupName, event) {
    event.stopPropagation(); 
    if (!confirm(`Delete group "${groupName}" and all its words?`)) return;

    const wordsToDelete = allWords.filter(w => w.group === groupName);
    
    wordsToDelete.forEach(word => {
        let customWords = JSON.parse(localStorage.getItem('myCustomChineseWords')) || [];
        const customIndex = customWords.findIndex(w => w.hanzi === word.hanzi);
        
        if (customIndex > -1) {
            customWords.splice(customIndex, 1);
            localStorage.setItem('myCustomChineseWords', JSON.stringify(customWords));
        } else {
            let deletedDefaults = JSON.parse(localStorage.getItem('deletedDefaultWords')) || [];
            if(!deletedDefaults.includes(word.hanzi)) {
                deletedDefaults.push(word.hanzi);
                localStorage.setItem('deletedDefaultWords', JSON.stringify(deletedDefaults));
            }
        }
    });

    loadAllWords();
    showWordBank(); 
}

// --- 10. GAME LOGIC ---
function setLimit(num) {
    dailyLimit = num;
    document.querySelectorAll('.goal-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

function getSelectedGroups() {
    const toggles = document.querySelectorAll('.group-toggle.active');
    return Array.from(toggles).map(t => t.textContent);
}

function startDailySession() {
    currentMode = 'words';
    loadAllWords();
    const selectedGroups = getSelectedGroups();
    if(selectedGroups.length === 0) return alert("Please select at least one group!");

    let pool = allWords.filter(w => selectedGroups.includes(w.group || 'Uncategorized'));
    const now = Date.now();
    let dueWords = pool.filter(w => w.nextReview <= now);
    dueWords.sort(() => Math.random() - 0.5);
    
    if (dueWords.length < dailyLimit) {
        let remainingSlots = dailyLimit - dueWords.length;
        if(remainingSlots > 0 && dueWords.length < pool.length) {
             let notDue = pool.filter(w => w.nextReview > now);
             notDue.sort(() => Math.random() - 0.5);
             let fillers = notDue.slice(0, remainingSlots);
             activeList = [...dueWords, ...fillers];
        } else {
             activeList = dueWords.slice(0, dailyLimit);
        }
    } else {
        activeList = dueWords.slice(0, dailyLimit);
    }
    
    if (activeList.length === 0) return alert("No words found in selected groups!");

    currentIndex = 0;
    hideAllSections();
    gameSection.classList.remove('hidden');
    srsExit.classList.remove('hidden');
    sentenceControls.classList.add('hidden');
    loadCard();
}

function startPractice(type) {
    currentMode = 'sentences';
    loadAllWords();
    activeList = generateRandomSentences(10);
    currentIndex = 0;
    hideAllSections();
    gameSection.classList.remove('hidden');
    sentenceControls.classList.remove('hidden');
    srsControls.classList.add('hidden');
    srsExit.classList.add('hidden');
    loadCard();
}

function handleSRS(rating) {
    const currentWord = activeList[currentIndex];
    const now = Date.now();
    let nextDate = now;

    if (rating === 'again') {
        activeList.push(currentWord);
    } else {
        if (rating === 'hard') nextDate = now + (24 * 60 * 60 * 1000); 
        else if (rating === 'good') nextDate = now + (7 * 24 * 60 * 60 * 1000); 
        else if (rating === 'easy') nextDate = now + (30 * 24 * 60 * 60 * 1000); 

        let reviewData = JSON.parse(localStorage.getItem('srsReviewData')) || {};
        reviewData[currentWord.hanzi] = nextDate;
        localStorage.setItem('srsReviewData', JSON.stringify(reviewData));
    }
    nextCard();
}

function loadCard() {
    const item = activeList[currentIndex];
    displayHanzi.textContent = item.hanzi;
    displayPinyin.textContent = item.pinyin;
    displayEnglish.textContent = item.english;
    displayGroup.textContent = item.group || 'Uncategorized';
    displayHanzi.style.fontSize = item.hanzi.length > 6 ? '2rem' : '3.5rem';
    cardElement.classList.remove('flipped');
    if (currentMode === 'words') { srsControls.classList.add('hidden'); }
    updateProgress();
}

function flipCard() { 
    cardElement.classList.toggle('flipped');
    if (currentMode === 'words' && cardElement.classList.contains('flipped')) {
        setTimeout(() => srsControls.classList.remove('hidden'), 200);
    }
}

function nextCard() {
    currentIndex++;
    if (currentIndex >= activeList.length) {
        if (currentMode === 'words') {
            alert("Session Complete! 🎉");
            returnToMenu();
        } else {
            currentIndex = 0;
            loadCard();
        }
    } else {
        if (cardElement.classList.contains('flipped')) {
            cardElement.classList.remove('flipped');
            setTimeout(loadCard, 300);
        } else {
            loadCard();
        }
    }
}

function updateProgress() {
    let pct = ((currentIndex) / activeList.length) * 100;
    progressFill.style.width = pct + "%";
    progressText.textContent = `${currentIndex + 1} / ${activeList.length}`;
}

// --- SENTENCE GEN ---
function getArticle(word) {
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    if (!word) return '';
    const firstLetter = word.charAt(0).toLowerCase();
    if (word.toLowerCase() === 'navigation') return '';
    return vowels.includes(firstLetter) ? 'an ' : 'a ';
}

function generateRandomSentences(count) {
    let sentences = [];
    sentences.push({
        hanzi: '中国人在端午节吃粽子、划龙舟。',
        pinyin: 'Zhōngguó rén... huá lóng zhōu.',
        english: 'Chinese people eat zongzi and row dragon boats.',
        group: 'Sentence'
    });
    for (let i = 0; i < count; i++) {
        const sub = subjects[Math.floor(Math.random() * subjects.length)];
        const vrbObj = verbs[Math.floor(Math.random() * verbs.length)];
        const enVerb = sub.isSingular ? vrbObj.singular : vrbObj.plural;
        const randomObj = allWords[Math.floor(Math.random() * allWords.length)];
        const enNoun = randomObj.english.toLowerCase();
        const article = getArticle(enNoun);
        sentences.push({
            hanzi: sub.ch + vrbObj.ch + randomObj.hanzi + "。",
            pinyin: sub.py + " " + vrbObj.py + " " + randomObj.pinyin + ".",
            english: `${sub.en} ${enVerb} ${article}${enNoun}.`,
            group: 'Sentence'
        });
    }
    return sentences;
}

// --- DELETE ---
function deleteWord(hanziToDelete) {
    if (!confirm(`Remove "${hanziToDelete}"?`)) return;
    let customWords = JSON.parse(localStorage.getItem('myCustomChineseWords')) || [];
    const customIndex = customWords.findIndex(w => w.hanzi === hanziToDelete);
    if (customIndex > -1) {
        customWords.splice(customIndex, 1);
        localStorage.setItem('myCustomChineseWords', JSON.stringify(customWords));
    } else {
        let deletedDefaults = JSON.parse(localStorage.getItem('deletedDefaultWords')) || [];
        deletedDefaults.push(hanziToDelete);
        localStorage.setItem('deletedDefaultWords', JSON.stringify(deletedDefaults));
    }
    loadAllWords();
    if (currentViewingGroup) {
        renderTable(currentViewingGroup);
    }
}

// --- SYNC ---
function showSyncMenu() { hideAllSections(); syncSection.classList.remove('hidden'); syncBox.value = ''; }
function exportData() {
    const data = {
        custom: JSON.parse(localStorage.getItem('myCustomChineseWords')) || [],
        deleted: JSON.parse(localStorage.getItem('deletedDefaultWords')) || [],
        reviews: JSON.parse(localStorage.getItem('srsReviewData')) || {}
    };
    syncBox.value = JSON.stringify(data);
    syncBox.select();
    document.execCommand("copy");
    alert("Data copied!");
}
function importData() {
    try {
        const data = JSON.parse(syncBox.value);
        if (data.custom) localStorage.setItem('myCustomChineseWords', JSON.stringify(data.custom));
        if (data.deleted) localStorage.setItem('deletedDefaultWords', JSON.stringify(data.deleted));
        if (data.reviews) localStorage.setItem('srsReviewData', JSON.stringify(data.reviews));
        loadAllWords();
        alert("Restored!");
        returnToMenu();
    } catch (e) { alert("Invalid code."); }
}

// --- AUDIO ---
function playAudio(event) {
    event.stopPropagation();
    const text = activeList[currentIndex].hanzi;
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        window.speechSynthesis.speak(utterance);
    } else { alert("Audio not supported."); }
}