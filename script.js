// --- 1. DEFAULT DATA (Sailing PDF + HSK1) ---
const defaultWords = [
    // --- FROM YOUR PDF ---
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
    { hanzi: '航海证书', pinyin: 'háng hǎi zhèng shū', english: 'Sailing certificate' },

    // --- HSK 1 VOCABULARY ---
    { hanzi: '爱', pinyin: 'ài', english: 'love' },
    { hanzi: '八', pinyin: 'bā', english: 'eight' },
    { hanzi: '爸爸', pinyin: 'bàba', english: 'dad' },
    { hanzi: '杯子', pinyin: 'bēizi', english: 'cup' },
    { hanzi: '北京', pinyin: 'Běijīng', english: 'Beijing' },
    { hanzi: '本', pinyin: 'běn', english: 'measure word for books' },
    { hanzi: '不', pinyin: 'bù', english: 'not/no' },
    { hanzi: '不客气', pinyin: 'bú kèqi', english: 'you are welcome' },
    { hanzi: '菜', pinyin: 'cài', english: 'dish/vegetable' },
    { hanzi: '茶', pinyin: 'chá', english: 'tea' },
    { hanzi: '吃', pinyin: 'chī', english: 'eat' },
    { hanzi: '出租车', pinyin: 'chūzūchē', english: 'taxi' },
    { hanzi: '打电话', pinyin: 'dǎ diànhuà', english: 'make a phone call' },
    { hanzi: '大', pinyin: 'dà', english: 'big' },
    { hanzi: '的', pinyin: 'de', english: 'of/possessive particle' },
    { hanzi: '点', pinyin: 'diǎn', english: 'o\'clock' },
    { hanzi: '电脑', pinyin: 'diànnǎo', english: 'computer' },
    { hanzi: '电视', pinyin: 'diànshì', english: 'television' },
    { hanzi: '电影', pinyin: 'diànyǐng', english: 'movie' },
    { hanzi: '东西', pinyin: 'dōngxi', english: 'thing' },
    { hanzi: '都', pinyin: 'dōu', english: 'all' },
    { hanzi: '读', pinyin: 'dú', english: 'read' },
    { hanzi: '对不起', pinyin: 'duìbuqǐ', english: 'sorry' },
    { hanzi: '多', pinyin: 'duō', english: 'many/much' },
    { hanzi: '多少', pinyin: 'duōshao', english: 'how many' },
    { hanzi: '儿子', pinyin: 'érzi', english: 'son' },
    { hanzi: '二', pinyin: 'èr', english: 'two' },
    { hanzi: '饭店', pinyin: 'fàndiàn', english: 'restaurant' },
    { hanzi: '飞机', pinyin: 'fēijī', english: 'airplane' },
    { hanzi: '分钟', pinyin: 'fēnzhōng', english: 'minute' },
    { hanzi: '高兴', pinyin: 'gāoxìng', english: 'happy' },
    { hanzi: '个', pinyin: 'gè', english: 'generic measure word' },
    { hanzi: '工作', pinyin: 'gōngzuò', english: 'job/to work' },
    { hanzi: '狗', pinyin: 'gǒu', english: 'dog' },
    { hanzi: '汉语', pinyin: 'Hànyǔ', english: 'Chinese language' },
    { hanzi: '好', pinyin: 'hǎo', english: 'good' },
    { hanzi: '喝', pinyin: 'hē', english: 'drink' },
    { hanzi: '和', pinyin: 'hé', english: 'and' },
    { hanzi: '很', pinyin: 'hěn', english: 'very' },
    { hanzi: '后面', pinyin: 'hòumiàn', english: 'behind' },
    { hanzi: '回', pinyin: 'huí', english: 'to return' },
    { hanzi: '会', pinyin: 'huì', english: 'can/know how to' },
    { hanzi: '几', pinyin: 'jǐ', english: 'how many' },
    { hanzi: '家', pinyin: 'jiā', english: 'home/family' },
    { hanzi: '叫', pinyin: 'jiào', english: 'to be called' },
    { hanzi: '今天', pinyin: 'jīntiān', english: 'today' },
    { hanzi: '九', pinyin: 'jiǔ', english: 'nine' },
    { hanzi: '开', pinyin: 'kāi', english: 'open/drive' },
    { hanzi: '看', pinyin: 'kàn', english: 'look/watch' },
    { hanzi: '看见', pinyin: 'kànjiàn', english: 'to see' },
    { hanzi: '块', pinyin: 'kuài', english: 'yuan (money)' },
    { hanzi: '来', pinyin: 'lái', english: 'come' },
    { hanzi: '老师', pinyin: 'lǎoshī', english: 'teacher' },
    { hanzi: '了', pinyin: 'le', english: 'particle (completed action)' },
    { hanzi: '冷', pinyin: 'lěng', english: 'cold' },
    { hanzi: '里', pinyin: 'lǐ', english: 'inside' },
    { hanzi: '零', pinyin: 'líng', english: 'zero' },
    { hanzi: '六', pinyin: 'liù', english: 'six' },
    { hanzi: '妈妈', pinyin: 'māma', english: 'mom' },
    { hanzi: '吗', pinyin: 'ma', english: 'question particle' },
    { hanzi: '买', pinyin: 'mǎi', english: 'buy' },
    { hanzi: '猫', pinyin: 'māo', english: 'cat' },
    { hanzi: '没', pinyin: 'méi', english: 'not' },
    { hanzi: '没关系', pinyin: 'méi guānxi', english: 'it doesn\'t matter' },
    { hanzi: '米饭', pinyin: 'mǐfàn', english: 'cooked rice' },
    { hanzi: '明天', pinyin: 'míngtiān', english: 'tomorrow' },
    { hanzi: '名字', pinyin: 'míngzi', english: 'name' },
    { hanzi: '哪', pinyin: 'nǎ', english: 'which' },
    { hanzi: '哪儿', pinyin: 'nǎr', english: 'where' },
    { hanzi: '那', pinyin: 'nà', english: 'that' },
    { hanzi: '呢', pinyin: 'ne', english: 'question particle' },
    { hanzi: '能', pinyin: 'néng', english: 'can/be able to' },
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
    { hanzi: '认识', pinyin: 'rènshi', english: 'to know (someone)' },
    { hanzi: '三', pinyin: 'sān', english: 'three' },
    { hanzi: '商店', pinyin: 'shāngdiàn', english: 'store' },
    { hanzi: '上', pinyin: 'shàng', english: 'up/above' },
    { hanzi: '上午', pinyin: 'shàngwǔ', english: 'morning' },
    { hanzi: '少', pinyin: 'shǎo', english: 'few/little' },
    { hanzi: '谁', pinyin: 'shéi', english: 'who' },
    { hanzi: '什么', pinyin: 'shénme', english: 'what' },
    { hanzi: '十', pinyin: 'shí', english: 'ten' },
    { hanzi: '时候', pinyin: 'shíhou', english: 'time' },
    { hanzi: '是', pinyin: 'shì', english: 'is/am/are' },
    { hanzi: '书', pinyin: 'shū', english: 'book' },
    { hanzi: '水', pinyin: 'shuǐ', english: 'water' },
    { hanzi: '水果', pinyin: 'shuǐguǒ', english: 'fruit' },
    { hanzi: '睡觉', pinyin: 'shuìjiào', english: 'sleep' },
    { hanzi: '说', pinyin: 'shuō', english: 'speak' },
    { hanzi: '四', pinyin: 'sì', english: 'four' },
    { hanzi: '岁', pinyin: 'suì', english: 'years old' },
    { hanzi: '他', pinyin: 'tā', english: 'he' },
    { hanzi: '她', pinyin: 'tā', english: 'she' },
    { hanzi: '太', pinyin: 'tài', english: 'too/extremely' },
    { hanzi: '天气', pinyin: 'tiānqì', english: 'weather' },
    { hanzi: '听', pinyin: 'tīng', english: 'listen' },
    { hanzi: '同学', pinyin: 'tóngxué', english: 'classmate' },
    { hanzi: '喂', pinyin: 'wèi', english: 'hello (on phone)' },
    { hanzi: '我', pinyin: 'wǒ', english: 'I/me' },
    { hanzi: '我们', pinyin: 'wǒmen', english: 'we/us' },
    { hanzi: '五', pinyin: 'wǔ', english: 'five' },
    { hanzi: '喜欢', pinyin: 'xǐhuan', english: 'like' },
    { hanzi: '下', pinyin: 'xià', english: 'down/below' },
    { hanzi: '下午', pinyin: 'xiàwǔ', english: 'afternoon' },
    { hanzi: '下雨', pinyin: 'xià yǔ', english: 'rain' },
    { hanzi: '先生', pinyin: 'xiānsheng', english: 'Mr./husband' },
    { hanzi: '现在', pinyin: 'xiànzài', english: 'now' },
    { hanzi: '想', pinyin: 'xiǎng', english: 'want/think' },
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
    { hanzi: '在', pinyin: 'zài', english: 'at/in/on' },
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
];

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
const tableBody = document.getElementById('word-table-body');
const searchInput = document.getElementById('search-bar');

// --- 5. INITIALIZATION ---
function loadAllWords() {
    // 1. Get Custom Words
    const customWordsJSON = localStorage.getItem('myCustomChineseWords');
    let customWords = customWordsJSON ? JSON.parse(customWordsJSON) : [];

    // 2. Get Deleted Default Words (Blacklist)
    const deletedDefaultsJSON = localStorage.getItem('deletedDefaultWords');
    let deletedDefaults = deletedDefaultsJSON ? JSON.parse(deletedDefaultsJSON) : [];

    // 3. Filter Default Words (Remove ones in blacklist)
    let visibleDefaults = defaultWords.filter(word => !deletedDefaults.includes(word.hanzi));

    // 4. Combine
    allWords = [...visibleDefaults, ...customWords];
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
}

// --- 7. WORD MANAGEMENT (ADD/DELETE) ---

function showAddWordMenu() {
    hideAllSections();
    addWordSection.classList.remove('hidden');
}

function saveNewWord() {
    const hanzi = document.getElementById('input-hanzi').value.trim();
    const pinyin = document.getElementById('input-pinyin').value.trim();
    const english = document.getElementById('input-english').value.trim();

    if (!hanzi || !pinyin || !english) {
        alert("Please fill in all fields!");
        return;
    }

    const newWord = { hanzi, pinyin, english, isCustom: true };
    
    // Save to LocalStorage
    let customWords = JSON.parse(localStorage.getItem('myCustomChineseWords')) || [];
    customWords.push(newWord);
    localStorage.setItem('myCustomChineseWords', JSON.stringify(customWords));

    loadAllWords();
    
    // Reset Inputs
    document.getElementById('input-hanzi').value = '';
    document.getElementById('input-pinyin').value = '';
    document.getElementById('input-english').value = '';
    
    alert("Word Saved!");
    returnToMenu();
}

function deleteWord(hanziToDelete) {
    if (!confirm(`Are you sure you want to remove "${hanziToDelete}"?`)) return;

    // Check if it is a Custom Word
    let customWords = JSON.parse(localStorage.getItem('myCustomChineseWords')) || [];
    const customIndex = customWords.findIndex(w => w.hanzi === hanziToDelete);

    if (customIndex > -1) {
        // It's a custom word -> Remove it permanently
        customWords.splice(customIndex, 1);
        localStorage.setItem('myCustomChineseWords', JSON.stringify(customWords));
    } else {
        // It's a default word -> Add to blacklist
        let deletedDefaults = JSON.parse(localStorage.getItem('deletedDefaultWords')) || [];
        deletedDefaults.push(hanziToDelete);
        localStorage.setItem('deletedDefaultWords', JSON.stringify(deletedDefaults));
    }

    // Refresh everything
    loadAllWords();
    renderTable(); 
}

// --- 8. TABLE ---
function showWordList() {
    loadAllWords();
    renderTable();
    hideAllSections();
    wordListSection.classList.remove('hidden');
}

function renderTable() {
    tableBody.innerHTML = '';
    const filter = searchInput.value.toLowerCase();

    allWords.forEach(word => {
        if (word.english.toLowerCase().includes(filter) || word.hanzi.includes(filter)) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${word.hanzi}</strong></td>
                <td>${word.pinyin}</td>
                <td>${word.english}</td>
                <td style="text-align: center;">
                    <button class="delete-btn" onclick="deleteWord('${word.hanzi}')">Trash 🗑️</button>
                </td>
            `;
            tableBody.appendChild(row);
        }
    });
}

function filterTable() { renderTable(); }

// --- 9. SYNC ---
function showSyncMenu() {
    hideAllSections();
    syncSection.classList.remove('hidden');
    syncBox.value = '';
}

function exportData() {
    const data = {
        custom: JSON.parse(localStorage.getItem('myCustomChineseWords')) || [],
        deleted: JSON.parse(localStorage.getItem('deletedDefaultWords')) || []
    };
    
    if (data.custom.length === 0 && data.deleted.length === 0) {
        syncBox.value = "Nothing to backup yet.";
        return;
    }
    
    syncBox.value = JSON.stringify(data);
    syncBox.select();
    document.execCommand("copy");
    alert("Data copied to clipboard!");
}

function importData() {
    const raw = syncBox.value;
    if (!raw) return alert("Paste code first.");

    try {
        const data = JSON.parse(raw);
        if (Array.isArray(data)) {
            localStorage.setItem('myCustomChineseWords', JSON.stringify(data));
        } else if (data.custom) {
            localStorage.setItem('myCustomChineseWords', JSON.stringify(data.custom));
            localStorage.setItem('deletedDefaultWords', JSON.stringify(data.deleted));
        }
        
        loadAllWords();
        alert("Data restored!");
        returnToMenu();
    } catch (e) {
        alert("Invalid code format.");
    }
}

// --- 10. GAME LOGIC ---
function startPractice(type) {
    loadAllWords();
    if (allWords.length === 0) {
        alert("No words available! Add some or check your filters.");
        return;
    }

    if (type === 'words') {
        activeList = allWords.sort(() => Math.random() - 0.5);
    } else {
        activeList = generateRandomSentences(10);
    }
    currentIndex = 0;
    hideAllSections();
    gameSection.classList.remove('hidden');
    loadCard();
}

function getArticle(word) {
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    if (!word) return '';
    const firstLetter = word.charAt(0).toLowerCase();
    if (word.toLowerCase() === 'navigation') return '';
    return vowels.includes(firstLetter) ? 'an ' : 'a ';
}

function generateRandomSentences(count) {
    let sentences = [];
    // PDF Sentence
    sentences.push({
        hanzi: '中国人在端午节吃粽子、划龙舟。',
        pinyin: 'Zhōngguó rén... huá lóng zhōu.',
        english: 'Chinese people eat zongzi and row dragon boats.'
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
            english: `${sub.en} ${enVerb} ${article}${enNoun}.`
        });
    }
    return sentences;
}

function loadCard() {
    const item = activeList[currentIndex];
    displayHanzi.textContent = item.hanzi;
    displayPinyin.textContent = item.pinyin;
    displayEnglish.textContent = item.english;

    // Adjust font size for longer sentences
    displayHanzi.style.fontSize = item.hanzi.length > 6 ? '2rem' : '3.5rem';
    
    cardElement.classList.remove('flipped');
}

function flipCard() { cardElement.classList.toggle('flipped'); }

function nextCard() {
    currentIndex = (currentIndex + 1) % activeList.length;
    if (cardElement.classList.contains('flipped')) {
        cardElement.classList.remove('flipped');
        setTimeout(loadCard, 300);
    } else {
        loadCard();
    }
}

// --- 11. AUDIO ---
function playAudio(event) {
    event.stopPropagation();
    const text = activeList[currentIndex].hanzi;
    
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.8;
        window.speechSynthesis.speak(utterance);
    } else {
        alert("Browser does not support audio.");
    }
}