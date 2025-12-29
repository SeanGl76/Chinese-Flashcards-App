// --- CONFIGURATION ---
const VERCEL_API_URL = "https://chinese-app-backend.vercel.app/api/generate"

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

const lesson10Words = [
    { hanzi: '货币', pinyin: 'huò bì', english: 'Currency' },
    { hanzi: '人民币', pinyin: 'rén mín bì', english: 'RMB' },
    { hanzi: '美元', pinyin: 'měi yuán', english: 'US Dollar' },
    { hanzi: '欧元', pinyin: 'ōu yuán', english: 'Euro' },
    { hanzi: '欧盟', pinyin: 'ōu méng', english: 'European Union' },
    { hanzi: '英镑', pinyin: 'yīng bàng', english: 'Pound' },
    { hanzi: '英国', pinyin: 'yīng guó', english: 'UK' },
    { hanzi: '日元', pinyin: 'rì yuán', english: 'Japanese Yen' },
    { hanzi: '日本', pinyin: 'rì běn', english: 'Japan' },
    { hanzi: '卢布', pinyin: 'lú bù', english: 'Ruble' },
    { hanzi: '俄罗斯', pinyin: 'é luó sī', english: 'Russia' },
    { hanzi: '泰铢', pinyin: 'tài zhū', english: 'Thai Baht' },
    { hanzi: '泰国', pinyin: 'tài guó', english: 'Thailand' },
    { hanzi: '新谢克尔', pinyin: 'xīn xiè kè ěr', english: 'New Shekel' },
    { hanzi: '以色列', pinyin: 'yǐ sè liè', english: 'Israel' },
    { hanzi: '现金', pinyin: 'xiàn jīn', english: 'Cash' },
    { hanzi: '手机', pinyin: 'shǒu jī', english: 'Mobile Phone' },
    { hanzi: '笔', pinyin: 'bǐ', english: 'Pen' },
    { hanzi: '耳机', pinyin: 'ěr jī', english: 'Headphones' },
    { hanzi: '电脑', pinyin: 'diàn nǎo', english: 'Computer' },
    { hanzi: '照相机', pinyin: 'zhào xiàng jī', english: 'Camera' },
    { hanzi: '筷子', pinyin: 'kuài zi', english: 'Chopsticks' },
    { hanzi: '面条', pinyin: 'miàn tiáo', english: 'Noodles' },
    { hanzi: '刀叉', pinyin: 'dāo chā', english: 'Knife and fork' },
    { hanzi: '牛排', pinyin: 'niú pái', english: 'Steak' }
].map(w => ({...w, group: 'Lesson 10'}));

const defaultWords = [...lesson9Words, ...hsk1Words, ...lesson10Words];

// *** FIXED: Added "Common Sentences" Group so they show in Word Bank ***
const premadeSentences = [
    { hanzi: '我用笔写字。', pinyin: 'Wǒ yòng bǐ xiě zì.', english: 'I use a pen to write.' },
    { hanzi: '她用筷子吃面条。', pinyin: 'Tā yòng kuài zi chī miàn tiáo.', english: 'She uses chopsticks to eat noodles.' },
    { hanzi: '老师用电脑工作。', pinyin: 'Lǎo shī yòng diàn nǎo gōng zuò.', english: 'The teacher uses a computer to work.' },
    { hanzi: '我们用刀叉切牛排。', pinyin: 'Wǒ men yòng dāo chā qiē niú pái.', english: 'We use knife and fork to cut steak.' },
    { hanzi: '他用照相机拍照。', pinyin: 'Tā yòng zhào xiàng jī pāi zhào.', english: 'He uses a camera to take photos.' },
    { hanzi: '我用耳机听音乐。', pinyin: 'Wǒ yòng ěr jī tīng yīn yuè.', english: 'I use headphones to listen to music.' },
    { hanzi: '我用手机支付。', pinyin: 'Wǒ yòng shǒu jī zhī fù.', english: 'I pay with my mobile phone.' },
    { hanzi: '他喜欢用现金。', pinyin: 'Tā xǐ huān yòng xiàn jīn.', english: 'He likes to use cash.' },
    { hanzi: '这里可以刷卡吗？', pinyin: 'Zhè lǐ kě yǐ shuā kǎ ma?', english: 'Can I swipe a card here?' },
    { hanzi: '请扫码支付。', pinyin: 'Qǐng sǎo mǎ zhī fù.', english: 'Please scan the code to pay.' },
    { hanzi: '我有五十美元。', pinyin: 'Wǒ yǒu wǔ shí měi yuán.', english: 'I have 50 US Dollars.' },
    { hanzi: '人民币是中国的货币。', pinyin: 'Rén mín bì shì Zhōng guó de huò bì.', english: 'RMB is China\'s currency.' },
    { hanzi: '这个杯子多少日元？', pinyin: 'Zhè ge bēi zi duō shao rì yuán?', english: 'How many Yen is this cup?' },
    { hanzi: '去英国需要英镑。', pinyin: 'Qù Yīng guó xū yào yīng bàng.', english: 'Going to the UK requires Pounds.' },
    { hanzi: '这个苹果很便宜。', pinyin: 'Zhè ge píng guǒ hěn pián yi.', english: 'This apple is very cheap.' },
    { hanzi: '那家饭店太贵了。', pinyin: 'Nà jiā fàn diàn tài guì le.', english: 'That restaurant is too expensive.' },
    { hanzi: '妈妈去商店买衣服。', pinyin: 'Mā ma qù shāng diàn mǎi yī fu.', english: 'Mom goes to the store to buy clothes.' },
    { hanzi: '爸爸在喝茶。', pinyin: 'Bà ba zài hē chá.', english: 'Dad is drinking tea.' },
    { hanzi: '医生在医院工作。', pinyin: 'Yī shēng zài yī yuàn gōng zuò.', english: 'The doctor works in the hospital.' },
    { hanzi: '我不喜欢吃米饭。', pinyin: 'Wǒ bù xǐ huān chī mǐ fàn.', english: 'I don\'t like eating rice.' },
    { hanzi: '现在几点了？', pinyin: 'Xiàn zài jǐ diǎn le?', english: 'What time is it now?' }
].map(s => ({...s, group: 'Common Sentences'}));

// --- 3. STATE ---
let allWords = [];
let allSentences = []; 
let activeList = [];
let currentIndex = 0;
let dailyLimit = 10;
let currentMode = 'words';
let availableGroups = [];
let currentViewingGroup = null;

// --- 4. DOM ELEMENTS ---
const loadingOverlay = document.getElementById('loading-overlay');
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
    // 1. Load Words
    const customWordsJSON = localStorage.getItem('myCustomChineseWords');
    let customWords = customWordsJSON ? JSON.parse(customWordsJSON) : [];
    allWords = [...defaultWords, ...customWords];

    // 2. Load Sentences (Default + Custom)
    const customSentencesJSON = localStorage.getItem('myCustomSentences');
    let customSentences = customSentencesJSON ? JSON.parse(customSentencesJSON) : [];
    allSentences = [...premadeSentences, ...customSentences]; 

    // 3. Load SRS Data
    const reviewDataJSON = localStorage.getItem('srsReviewData');
    const reviewData = reviewDataJSON ? JSON.parse(reviewDataJSON) : {};
    allWords.forEach(word => {
        word.nextReview = reviewData[word.hanzi] || 0;
    });

    updateGroupList();
}

function updateGroupList() {
    // Combine Words AND Sentences to calculate available groups
    const combined = [...allWords, ...allSentences];
    const groupSet = new Set(combined.map(w => w.group || 'Uncategorized'));
    availableGroups = Array.from(groupSet).sort();
    
    groupDatalist.innerHTML = '';
    availableGroups.forEach(grp => {
        const opt = document.createElement('option');
        opt.value = grp;
        groupDatalist.appendChild(opt);
    });
    
    // Only re-render filters if they don't exist yet (to preserve selection)
    if (groupFiltersDiv.children.length === 0) {
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

// --- 6. MAGIC IMPORT (AI) ---
function triggerMagicUpload() { document.getElementById('magic-upload').click(); }
async function handleMagicUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const groupName = prompt("Name this Lesson (e.g., 'Chapter 5'):", "Imported Lesson");
    if (!groupName) return;

    loadingOverlay.classList.remove('hidden');

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const textItems = textContent.items.map(item => item.str).join(" ");
            fullText += textItems + "\n";
        }

        console.log("Extracted text length:", fullText.length);

        const response = await fetch(VERCEL_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ textContent: fullText })
        });

        if (!response.ok) throw new Error("Server Error");

        const aiData = await response.json();
        
        let newWords = [];
        let newSentences = [];

        if (Array.isArray(aiData)) {
            aiData.forEach(item => {
                const exists = allWords.some(w => w.hanzi === item.hanzi);
                if (!exists) {
                    newWords.push({
                        hanzi: item.hanzi,
                        pinyin: item.pinyin,
                        english: item.english,
                        group: groupName,
                        isCustom: true
                    });
                }
                if (item.sentence) {
                    newSentences.push({
                        hanzi: item.sentence.hanzi,
                        pinyin: item.sentence.pinyin,
                        english: item.sentence.english,
                        group: groupName
                    });
                }
            });
        }

        if (newWords.length > 0) {
            let customWords = JSON.parse(localStorage.getItem('myCustomChineseWords')) || [];
            customWords = [...customWords, ...newWords];
            localStorage.setItem('myCustomChineseWords', JSON.stringify(customWords));
        }

        if (newSentences.length > 0) {
            let customSentences = JSON.parse(localStorage.getItem('myCustomSentences')) || [];
            customSentences = [...customSentences, ...newSentences];
            localStorage.setItem('myCustomSentences', JSON.stringify(customSentences));
        }

        loadAllWords();
        updateGroupList(); // Refresh group list for filters
        renderGroupFilters(); // Re-render filters
        alert(`Magic Complete! ✨\nAdded ${newWords.length} words and sentences.`);

    } catch (error) {
        console.error(error);
        alert("Error: " + error.message + "\nCheck console for details.");
    } finally {
        loadingOverlay.classList.add('hidden');
        document.getElementById('magic-upload').value = '';
    }
}

// --- 7. EXCEL IMPORT ---
function triggerFileUpload() { document.getElementById('file-upload').click(); }
function handleExcelUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const groupName = prompt("Enter a name for this new group:", "Imported Excel");
    if (!groupName) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1});
            
            let extractedWords = [];
            let extractedSentences = [];

            jsonData.forEach((row) => {
                const hanzi = (row[0] || "").toString().trim();
                const pinyin = (row[1] || "").toString().trim();
                const english = (row[2] || "").toString().trim();
                const type = (row[3] || "word").toString().trim().toLowerCase(); 

                if (/[\u4e00-\u9fa5]/.test(hanzi)) {
                    if (type === 'sentence') {
                        const exists = allSentences.some(s => s.hanzi === hanzi);
                        if (!exists) extractedSentences.push({ hanzi, pinyin: pinyin||"?", english: english||"?", group: groupName, isCustom: true });
                    } else {
                        const exists = allWords.some(w => w.hanzi === hanzi);
                        if (!exists) extractedWords.push({ hanzi, pinyin: pinyin||"?", english: english||"?", group: groupName, isCustom: true });
                    }
                }
            });

            if (extractedWords.length > 0) {
                let customWords = JSON.parse(localStorage.getItem('myCustomChineseWords')) || [];
                customWords = [...customWords, ...extractedWords];
                localStorage.setItem('myCustomChineseWords', JSON.stringify(customWords));
            }

            if (extractedSentences.length > 0) {
                let customSentences = JSON.parse(localStorage.getItem('myCustomSentences')) || [];
                customSentences = [...customSentences, ...extractedSentences];
                localStorage.setItem('myCustomSentences', JSON.stringify(customSentences));
            }

            loadAllWords();
            updateGroupList();
            renderGroupFilters();
            alert(`Success! Imported ${extractedWords.length} words and ${extractedSentences.length} sentences.`);
        } catch (error) { alert("Error reading Excel."); }
    };
    reader.readAsArrayBuffer(file);
}

// --- 8. NAVIGATION ---
function hideAllSections() {
    [menuSection, addWordSection, wordListSection, syncSection, gameSection].forEach(sec => sec.classList.add('hidden'));
}
function returnToMenu() {
    hideAllSections();
    menuSection.classList.remove('hidden');
    srsControls.classList.add('hidden');
    srsExit.classList.add('hidden');
    sentenceControls.classList.add('hidden');
}
function showAddWordMenu() { hideAllSections(); addWordSection.classList.remove('hidden'); }
function saveNewWord() {
    const group = document.getElementById('input-group').value.trim() || 'Custom';
    const hanzi = document.getElementById('input-hanzi').value.trim();
    const pinyin = document.getElementById('input-pinyin').value.trim();
    const english = document.getElementById('input-english').value.trim();
    if (!hanzi || !pinyin || !english) return alert("Please fill in all fields!");
    
    const newWord = { hanzi, pinyin, english, group, isCustom: true };
    let customWords = JSON.parse(localStorage.getItem('myCustomChineseWords')) || [];
    customWords.push(newWord);
    localStorage.setItem('myCustomChineseWords', JSON.stringify(customWords));
    
    loadAllWords();
    updateGroupList();
    renderGroupFilters();
    alert("Word Saved!");
    returnToMenu();
}

// --- 9. WORD BANK UI (FIXED TO SHOW SENTENCES) ---
function showWordBank() {
    loadAllWords();
    hideAllSections();
    wordListSection.classList.remove('hidden');
    wbGroupView.classList.remove('hidden');
    wbDetailView.classList.add('hidden');
    wbTitle.textContent = "Word Bank";
    wbGroupGrid.innerHTML = '';
    
    // Combine for display count
    const combinedContent = [...allWords, ...allSentences];
    
    availableGroups.forEach(grp => {
        const count = combinedContent.filter(w => w.group === grp).length;
        const folder = document.createElement('div');
        folder.className = 'folder-card';
        folder.innerHTML = `<button class="folder-delete" onclick="deleteGroup('${grp}', event)">✕</button><span class="folder-icon">📁</span><span class="folder-name">${grp}</span><span class="folder-count">${count} items</span>`;
        folder.onclick = (e) => { if(!e.target.classList.contains('folder-delete')) openGroupDetail(grp); };
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
    
    // Combine for table view
    const combinedContent = [...allWords, ...allSentences];
    
    const wordsToShow = combinedContent.filter(word => {
        return word.group === groupName && (word.english + word.hanzi).toLowerCase().includes(filter);
    });
    
    wordsToShow.forEach(word => {
        const row = document.createElement('tr');
        // Check if it's a sentence or word for deletion logic
        const deleteFn = allSentences.includes(word) ? `deleteSentence('${word.hanzi}')` : `deleteWord('${word.hanzi}')`;
        
        row.innerHTML = `<td><strong>${word.hanzi}</strong></td><td>${word.pinyin}</td><td>${word.english}</td><td><button class="delete-btn" onclick="${deleteFn}">🗑️</button></td>`;
        tableBody.appendChild(row);
    });
}

function deleteGroup(groupName, event) {
    event.stopPropagation();
    if (!confirm(`Delete group "${groupName}"?`)) return;
    
    // Delete words
    let customWords = JSON.parse(localStorage.getItem('myCustomChineseWords')) || [];
    customWords = customWords.filter(w => w.group !== groupName);
    localStorage.setItem('myCustomChineseWords', JSON.stringify(customWords));
    
    // Delete sentences
    let customSentences = JSON.parse(localStorage.getItem('myCustomSentences')) || [];
    customSentences = customSentences.filter(s => s.group !== groupName);
    localStorage.setItem('myCustomSentences', JSON.stringify(customSentences));

    loadAllWords();
    updateGroupList();
    showWordBank();
}

function deleteWord(hanziToDelete) {
    if (!confirm(`Remove "${hanziToDelete}"?`)) return;
    let customWords = JSON.parse(localStorage.getItem('myCustomChineseWords')) || [];
    customWords = customWords.filter(w => w.hanzi !== hanziToDelete);
    localStorage.setItem('myCustomChineseWords', JSON.stringify(customWords));
    loadAllWords();
    if (currentViewingGroup) renderTable(currentViewingGroup);
}

function deleteSentence(hanziToDelete) {
    if (!confirm(`Remove sentence "${hanziToDelete}"?`)) return;
    let customSentences = JSON.parse(localStorage.getItem('myCustomSentences')) || [];
    customSentences = customSentences.filter(s => s.hanzi !== hanziToDelete);
    localStorage.setItem('myCustomSentences', JSON.stringify(customSentences));
    loadAllWords();
    if (currentViewingGroup) renderTable(currentViewingGroup);
}

// --- 10. SESSION LOGIC ---
function setLimit(num) {
    dailyLimit = num;
    document.querySelectorAll('.goal-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}
function startDailySession() {
    currentMode = 'words';
    loadAllWords();
    
    const toggles = document.querySelectorAll('.group-toggle.active');
    const selectedGroups = Array.from(toggles).map(t => t.textContent);
    
    if(selectedGroups.length === 0) return alert("Select at least one group!");
    
    let pool = allWords.filter(w => selectedGroups.includes(w.group || 'Uncategorized'));
    const now = Date.now();
    let dueWords = pool.filter(w => w.nextReview <= now);
    dueWords.sort(() => Math.random() - 0.5);
    
    activeList = dueWords.slice(0, dailyLimit);
    
    if (activeList.length === 0 && pool.length > 0) {
        if(confirm("No cards strictly due. Review random words?")) {
            activeList = pool.sort(() => Math.random() - 0.5).slice(0, dailyLimit);
        } else return;
    } else if (activeList.length === 0) return alert("No words found in selected groups!");

    currentIndex = 0;
    hideAllSections();
    gameSection.classList.remove('hidden');
    srsExit.classList.remove('hidden');
    sentenceControls.classList.add('hidden');
    loadCard();
}

// --- 11. PREMADE SENTENCE PRACTICE (FIXED: RESPECTS FILTERS) ---
function startPractice(type) {
    currentMode = 'sentences';
    loadAllWords(); 
    
    const toggles = document.querySelectorAll('.group-toggle.active');
    const selectedGroups = Array.from(toggles).map(t => t.textContent);
    
    if(selectedGroups.length === 0) return alert("Select at least one group!");

    // Check if there are ANY sentences
    if (allSentences.length === 0) return alert("No sentences available! Try importing a lesson.");

    // Filter based on selection
    let pool = allSentences.filter(s => selectedGroups.includes(s.group));
    
    if (pool.length === 0) {
        if (confirm("No sentences found in selected groups. Practice 'Common Sentences' instead?")) {
            pool = allSentences.filter(s => s.group === 'Common Sentences');
        } else {
            return;
        }
    }

    activeList = [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
    
    currentIndex = 0;
    hideAllSections();
    gameSection.classList.remove('hidden');
    sentenceControls.classList.remove('hidden');
    srsControls.classList.add('hidden');
    srsExit.classList.add('hidden');
    loadCard();
}

// --- 12. CARD LOGIC (FIXED: FALLBACK TEXT) ---
function loadCard() {
    const item = activeList[currentIndex];
    
    displayHanzi.textContent = item.hanzi || '(Error)';
    
    // Safety check for missing data (Fixes blank cards)
    displayPinyin.textContent = item.pinyin ? item.pinyin : '(No Pinyin)';
    displayEnglish.textContent = item.english ? item.english : '(No English)';
    displayGroup.textContent = item.group || 'General';
    
    displayHanzi.style.fontSize = item.hanzi.length > 6 ? '2rem' : '3.5rem';
    
    cardElement.classList.remove('flipped');
    if (currentMode === 'words') srsControls.classList.add('hidden');
    updateProgress();
}

function flipCard() { 
    cardElement.classList.toggle('flipped');
    if (currentMode === 'words' && cardElement.classList.contains('flipped')) setTimeout(() => srsControls.classList.remove('hidden'), 200);
}
function nextCard() {
    currentIndex++;
    if (currentIndex >= activeList.length) {
        alert("Session Complete! 🎉");
        returnToMenu();
    } else {
        if (cardElement.classList.contains('flipped')) { cardElement.classList.remove('flipped'); setTimeout(loadCard, 300); }
        else { loadCard(); }
    }
}
function updateProgress() {
    let pct = ((currentIndex) / activeList.length) * 100;
    progressFill.style.width = pct + "%";
    progressText.textContent = `${currentIndex + 1} / ${activeList.length}`;
}
function handleSRS(rating) {
    const currentWord = activeList[currentIndex];
    const now = Date.now();
    let nextDate = now;
    if (rating === 'again') activeList.push(currentWord);
    else {
        if (rating === 'hard') nextDate = now + 86400000;
        else if (rating === 'good') nextDate = now + 604800000;
        else if (rating === 'easy') nextDate = now + 2592000000;
        let reviewData = JSON.parse(localStorage.getItem('srsReviewData')) || {};
        reviewData[currentWord.hanzi] = nextDate;
        localStorage.setItem('srsReviewData', JSON.stringify(reviewData));
    }
    nextCard();
}
function showSyncMenu() { hideAllSections(); syncSection.classList.remove('hidden'); }
function exportData() {
    const data = {
        custom: JSON.parse(localStorage.getItem('myCustomChineseWords')) || [],
        sentences: JSON.parse(localStorage.getItem('myCustomSentences')) || [],
        deleted: JSON.parse(localStorage.getItem('deletedDefaultWords')) || [],
        reviews: JSON.parse(localStorage.getItem('srsReviewData')) || {}
    };
    syncBox.value = JSON.stringify(data); syncBox.select(); document.execCommand("copy"); alert("Copied!");
}
function importData() {
    try {
        const d = JSON.parse(syncBox.value);
        if(d.custom) localStorage.setItem('myCustomChineseWords', JSON.stringify(d.custom));
        if(d.sentences) localStorage.setItem('myCustomSentences', JSON.stringify(d.sentences));
        if(d.deleted) localStorage.setItem('deletedDefaultWords', JSON.stringify(d.deleted));
        if(d.reviews) localStorage.setItem('srsReviewData', JSON.stringify(d.reviews));
        loadAllWords(); alert("Done!"); returnToMenu();
    } catch(e) { alert("Error"); }
}
function playAudio(e) { e.stopPropagation(); const t = activeList[currentIndex].hanzi; if('speechSynthesis' in window){ const u = new SpeechSynthesisUtterance(t); u.lang='zh-CN'; window.speechSynthesis.speak(u); } }

function toggleMagicInfo() {
    const popup = document.getElementById('magic-info-popup');
    popup.classList.toggle('hidden');
    if (!popup.classList.contains('hidden')) { setTimeout(() => { popup.classList.add('hidden'); }, 5000); }
}