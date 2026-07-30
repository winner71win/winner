/* ==========================================================
   WINNER - APP.JS
   PART 1A
   Firebase Initialization
========================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    onSnapshot,
    query,
    orderBy,
    where,
    serverTimestamp,
    runTransaction
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

/* ==========================================================
   FIREBASE CONFIG
========================================================== */

const firebaseConfig = {

    apiKey: "AIzaSyCcKBg2iA2w82A0DCTdtgWengZor9AjbD0",

    authDomain: "winner-534bd.firebaseapp.com",

    projectId: "winner-534bd",

    storageBucket: "winner-534bd.firebasestorage.app",

    messagingSenderId: "189079383650",

    appId: "1:189079383650:web:79b6ac507b3a168a1eeb3b"

};

/* ==========================================================
   INITIALIZE FIREBASE
========================================================== */

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);

/* ==========================================================
   COLLECTION REFERENCES
========================================================== */

const settingsRef = doc(db,"settings","website");

const adminRef = collection(db,"admins");

const noticeRef = collection(db,"notices");

const luckyDrawRef = collection(db,"luckyDraw");

const customRef = collection(db,"customMatches");

const supportRef = collection(db,"support");

const registrationsRef = collection(db,"registrations");

/* ==========================================================
   GLOBAL VARIABLES
========================================================== */

let websiteSettings = {};
let currentPlayer = {};
let registrationNumber = 0;
let currentRegistrationDocId = "";

/* ==========================================================
   DOM ELEMENTS
========================================================== */

const loader = document.getElementById("loader");

const passwordScreen = document.getElementById("passwordScreen");

const mainWebsite = document.getElementById("mainWebsite");

const noticeTicker = document.getElementById("noticeTicker");

const toast = document.getElementById("toast");

const toastMessage = document.getElementById("toastMessage");

/* ==========================================================
   MENU & MODALS
========================================================== */

const threeDotBtn = document.getElementById("threeDotBtn");
const threeDotMenu = document.getElementById("threeDotMenu");

const openAdmin = document.getElementById("openAdmin");
const adminLoginModal = document.getElementById("adminLoginModal");

const checkRegistration = document.getElementById("checkRegistration");
const checkIdModal = document.getElementById("checkIdModal");

const closeCheckId = document.getElementById("closeCheckId");

const backHome = document.getElementById("backHome");

/* ==========================================================
   PART 1A ENDS
========================================================== */
/* ==========================================================
   WINNER - APP.JS
   PART 1B
   Loader • Password Screen • Settings
========================================================== */

/* ==========================================================
   LOADER
========================================================== */

window.addEventListener("load", () => {

    let progress = 0;

    const loaderBar = document.getElementById("progress");

    const loading = setInterval(() => {

        progress += 2;

        if(loaderBar){

            loaderBar.style.width = progress + "%";

        }

        if(progress >= 100){

            clearInterval(loading);

            setTimeout(() => {

                loader.style.display = "none";

                passwordScreen.style.display = "flex";

            },500);

        }

    },30);

});

/* ==========================================================
   LOAD WEBSITE SETTINGS
========================================================== */

async function loadWebsiteSettings(){

    try{

        const snapshot = await getDoc(settingsRef);

        if(snapshot.exists()){

            websiteSettings = snapshot.data();

            if(document.getElementById("joinWhatsapp")){

                document.getElementById("joinWhatsapp").href =
                websiteSettings.whatsappLink || "#";

            }

            if(document.getElementById("upiId")){

                document.getElementById("upiId").textContent =
                websiteSettings.upiId || "UPI Not Available";

            }

            if(websiteSettings.maintenance === true){

                document.body.innerHTML = `
                    <div style="
                        height:100vh;
                        display:flex;
                        justify-content:center;
                        align-items:center;
                        flex-direction:column;
                        background:#090909;
                        color:#FFD700;
                        font-family:Poppins;
                        text-align:center;
                        padding:20px;
                    ">
                        <h1>Website Under Maintenance</h1>
                        <p>Please visit again later.</p>
                    </div>
                `;

                return;

            }

        }

    }

    catch(error){

        console.error(error);

        showToast("Unable to load settings.");

    }

}


/* ==========================================================
   PASSWORD CHECK
========================================================== */

const unlockButton = document.getElementById("unlockWebsite");

if (unlockButton) {

    unlockButton.addEventListener("click", async () => {

        const password = document
            .getElementById("websitePassword")
            .value
            .trim();

        if (!password) {

            showToast("Enter Website Password");

            return;

        }

        try {

            await loadWebsiteSettings();

            if (password === websiteSettings.websitePassword) {

                passwordScreen.style.display = "none";

                mainWebsite.style.display = "block";

                showToast("Welcome to Winner");

            } else {

                showToast("Incorrect Password");

            }

        } catch (error) {

            console.error(error);

            showToast("Unable to Verify Password");

        }

    });

}

/* ==========================================================
   START APP
========================================================== */

loadWebsiteSettings();
console.log("loadWebsiteSettings completed");

/* ==========================================================
   PART 1B ENDS
========================================================== */
/* ==========================================================
   WINNER - APP.JS
   PART 1C
   Live Notices • Stats • Navigation
========================================================== */

/* ==========================================================
   LIVE NOTICES
========================================================== */

function loadNotices(){

    const q = query(noticeRef, orderBy("createdAt","desc"));

    onSnapshot(q,(snapshot)=>{

        let notices=[];

        snapshot.forEach((doc)=>{

            const data=doc.data();

            notices.push(data.title);

        });

        if(notices.length===0){

            noticeTicker.textContent="No announcements available.";

        }

        else{

            noticeTicker.textContent=notices.join("     ★     ");

        }

    });

}

/* ==========================================================
   LIVE STATS
========================================================== */

async function loadStats(){

    try{

        const players=await getDocs(registrationsRef);

        document.getElementById("playersCount").textContent=
        players.size;

        const lucky=await getDocs(luckyDrawRef);

        document.getElementById("drawCount").textContent=
        lucky.size;

        const custom=await getDocs(customRef);

        document.getElementById("customCount").textContent=
        custom.size;

        document.getElementById("winnerCount").textContent=
        websiteSettings.totalWinners || 0;

    }

    catch(error){

        console.log(error);

    }

}

/* ==========================================================
   HERO BUTTONS
========================================================== */

document.getElementById("playLucky")?.addEventListener("click",()=>{

    document
    .getElementById("luckyDraw")
    .scrollIntoView({

        behavior:"smooth"

    });

});

document.getElementById("playCustom")?.addEventListener("click",()=>{

    document
    .getElementById("custom")
    .scrollIntoView({

        behavior:"smooth"

    });

});

document.getElementById("openShop")?.addEventListener("click",()=>{

    document
    .getElementById("shop")
    .scrollIntoView({

        behavior:"smooth"

    });

});

/* ==========================================================
   MOBILE MENU
========================================================== */

const menuBtn=document.getElementById("menuBtn");

const navLinks=document.querySelector(".navLinks");

if(menuBtn){

    menuBtn.addEventListener("click",()=>{

        navLinks.classList.toggle("active");

    });

}

/* ==========================================================
   INITIALIZE
========================================================== */

loadNotices();
console.log("loadNotices completed");

loadStats();
console.log("loadStats completed");


/* ==========================================================
   PART 1C ENDS
========================================================== */
/* ==========================================================
   WINNER - APP.JS
   PART 2A
   Lucky Draw • FF Custom
========================================================== */

/* ==========================================================
   LOAD LUCKY DRAWS
========================================================== */

function loadLuckyDraws(){

    const container=document.getElementById("luckyDrawContainer");

    if(!container) return;

    onSnapshot(luckyDrawRef,(snapshot)=>{

        container.innerHTML="";

        snapshot.forEach((docItem)=>{

            const data=docItem.data();

            container.innerHTML+=`

            <div class="drawCard">

                <div class="drawTop">

                    <h3>${data.title || "Lucky Draw"}</h3>

                    <span class="status">

                        ${data.status || "LIVE"}

                    </span>

                </div>

                <div class="drawBody">

                    <h2>₹${data.entryFee || 0}</h2>

                    <p>

                        Prize :
                        ₹${data.prize || 0}

                    </p>

                    <p>

                        Slots :
                        ${data.slots || 0}

                    </p>

                </div>

                <div class="drawFooter">

                    <button
                        class="registerLuckyBtn"
                        onclick="openRegistration('${docItem.id}','luckydraw')">

                        Register Now

                    </button>

                </div>

            </div>

            `;

        });

    });

}

/* ==========================================================
   LOAD CUSTOM MATCHES
========================================================== */

function loadCustomMatches(){

    const container=document.getElementById("customContainer");

    if(!container) return;

    onSnapshot(customRef,(snapshot)=>{

        container.innerHTML="";

        snapshot.forEach((docItem)=>{

            const data=docItem.data();

            container.innerHTML+=`

            <div class="customCard">

                <div class="customHeader">

                    ${data.matchName || "Free Fire Custom"}

                </div>

                <div class="customBody">

                    <p>

                        Mode :
                        <span>${data.mode || "Squad"}</span>

                    </p>

                    <p>

                        Entry :
                        <span>₹${data.entryFee || 0}</span>

                    </p>

                    <p>

                        Prize :
                        <span>₹${data.prize || 0}</span>

                    </p>

                    <button
                        class="joinCustomBtn"
                        onclick="openRegistration('${docItem.id}','custom')">

                        Join Match

                    </button>

                </div>

            </div>

            `;

        });

    });

}

/* ==========================================================
   OPEN REGISTRATION
========================================================== */

window.openRegistration=function(id,type){

    currentPlayer.eventId=id;

    currentPlayer.eventType=type;

    document.getElementById("registrationModal").style.display="flex";

};

/* ==========================================================
   INITIALIZE
========================================================== */

loadLuckyDraws();

loadCustomMatches();

/* ==========================================================
   PART 2A ENDS
========================================================== */
/* ==========================================================
   WINNER - APP.JS
   PART 2B
   Registration • Payment • Registration ID
========================================================== */

/* ==========================================================
   REGISTRATION FORM
========================================================== */

const registrationForm =
document.getElementById("registrationForm");

if(registrationForm){

    registrationForm.addEventListener(
        "submit",
        registerPlayer
    );

}

async function registerPlayer(e){

    e.preventDefault();

    currentPlayer.name =
    document.getElementById("playerName").value.trim();

    currentPlayer.phone =
    document.getElementById("playerPhone").value.trim();

    currentPlayer.email =
    document.getElementById("playerEmail").value.trim();

    currentPlayer.uid =
    document.getElementById("gameUid").value.trim();

    document.getElementById(
        "registrationModal"
    ).style.display="none";

    document.getElementById(
        "paymentModal"
    ).style.display="flex";

}

/* ==========================================================
   PAYMENT
========================================================== */

document.getElementById(
    "submitPayment"
)?.addEventListener(
    "click",
    verifyPayment
);

async function verifyPayment() {

    const transactionId = document
        .getElementById("transactionId")
        .value
        .trim();

    if (transactionId === "") {

        showToast("Enter Transaction ID");

        return;

    }

    try {

        const snapshot = await getDocs(registrationsRef);

        const registrationNumber = snapshot.size + 1;

        const registrationId =
            "WIN-" +
            new Date().getFullYear() +
            "-" +
            String(registrationNumber).padStart(6, "0");

        currentPlayer.registrationId = registrationId;
        currentPlayer.transactionId = transactionId;
        currentPlayer.status = "Pending";
        currentPlayer.approved = false;
        currentPlayer.createdAt = serverTimestamp();

        await addDoc(registrationsRef, currentPlayer);

        document.getElementById("paymentModal").style.display = "none";
        document.getElementById("successModal").style.display = "flex";

        document.getElementById("registrationId").textContent =
            registrationId;

        loadStats();

        showToast("Registration Submitted Successfully");

    } catch (error) {

        console.error(error);

        showToast("Registration Failed");

    }

}

/* ==========================================================
   COPY REGISTRATION ID
========================================================== */

document.getElementById(
    "copyRegistrationId"
)?.addEventListener(
    "click",
    ()=>{

        navigator.clipboard.writeText(

            document.getElementById(
                "registrationId"
            ).textContent

        );

        showToast(
            "Registration ID Copied"
        );

    }
);


/* ==========================================================
   CLOSE MODALS
========================================================== */

document.querySelectorAll(

    ".closeModal,.closePayment"

).forEach(button=>{

    button.addEventListener(

        "click",

        ()=>{

            document.getElementById(
                "registrationModal"
            ).style.display="none";

            document.getElementById(
                "paymentModal"
            ).style.display="none";

        }

    );

});

/* ==========================================================
   PART 2B ENDS
========================================================== */
/* ==========================================================
   WINNER - APP.JS
   PART 2C
   Support • Admin Login • Toast • Auth
========================================================== */

/* ==========================================================
   SUPPORT FORM
========================================================== */

const supportForm =
document.getElementById("supportForm");

if(supportForm){

    supportForm.addEventListener(
        "submit",
        sendSupportMessage
    );

}

async function sendSupportMessage(e){

    e.preventDefault();

    try{

        await addDoc(supportRef,{

            name:document
                .getElementById("supportName")
                .value
                .trim(),

            phone:document
                .getElementById("supportPhone")
                .value
                .trim(),

            email:document
                .getElementById("supportEmail")
                .value
                .trim(),

            message:document
                .getElementById("supportMessage")
                .value
                .trim(),

            createdAt:serverTimestamp()

        });

        supportForm.reset();

        showToast(
            "Message Sent Successfully"
        );

    }

    catch(error){

        console.log(error);

        showToast(
            "Unable To Send Message"
        );

    }

}

/* ==========================================================
   ADMIN LOGIN
========================================================== */

document.getElementById("adminLoginButton")?.addEventListener(
    "click",
    adminLogin
);

async function adminLogin() {

    const email = document
        .getElementById("adminEmail")
        .value
        .trim();

    const password = document
        .getElementById("adminPassword")
        .value
        .trim();

    if (email === "" || password === "") {

        showToast("Enter Email & Password");

        return;

    }

    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        if (adminLoginModal) {

            adminLoginModal.style.display = "none";

        }

        showToast("Admin Login Successful");

        if (passwordScreen) {

            passwordScreen.style.display = "none";

        }

        if (mainWebsite) {

    mainWebsite.style.display = "block";

}

const adminPanel = document.getElementById("adminPanel");

adminPanel.style.display = "block";

loadAdminDashboard();

loadAdminRegistrations();
    }

    catch (error) {

        console.error(error);

        showToast("Invalid Admin Login");

    }

}

/* ==========================================================
   AUTH STATE
========================================================== */

onAuthStateChanged(auth,(user)=>{

    if(user){

        console.log(
            "Logged In :",
            user.email
        );

    }

});

/* ==========================================================
   TOAST
========================================================== */

function showToast(message){

    if(!toast) return;

    toastMessage.textContent=
    message;

    toast.classList.add("show");

    setTimeout(()=>{

        toast.classList.remove(
            "show"
        );

    },3000);

}

/* ==========================================================
   LOGOUT
========================================================== */

window.logoutAdmin = async function () {

    await signOut(auth);

    document.getElementById("adminPanel").style.display = "none";

    mainWebsite.style.display = "block";

    showToast("Logged Out");

};

/* ==========================================================
   THREE DOT MENU
========================================================== */

if (threeDotBtn && threeDotMenu) {

    threeDotBtn.addEventListener("click", (e) => {

        e.stopPropagation();

        threeDotMenu.classList.toggle("show");

    });

    document.addEventListener("click", () => {

        threeDotMenu.classList.remove("show");

    });

    threeDotMenu.addEventListener("click", (e) => {

        e.stopPropagation();

    });

}

/* ==========================================================
   ADMIN PANEL
========================================================== */

document.getElementById("openAdmin")?.addEventListener("click", () => {

    if (threeDotMenu) {

        threeDotMenu.classList.remove("show");

    }

    if (adminLoginModal) {

        adminLoginModal.style.display = "flex";

    }

});

/* ==========================================================
   CHECK WIN ID
========================================================== */

document.getElementById("checkRegistration")?.addEventListener("click", () => {

    threeDotMenu.classList.remove("show");

    document.getElementById("checkIdModal").style.display = "flex";

});

/* ==========================================================
   CLOSE CHECK WIN ID
========================================================== */

document.getElementById("closeCheckId")?.addEventListener("click", () => {

    document.getElementById("checkIdModal").style.display = "none";

});

/* ==========================================================
   CLOSE ADMIN LOGIN
========================================================== */

document.querySelectorAll(".closeAdmin").forEach(button => {

    button.addEventListener("click", () => {

        document.getElementById("adminLoginModal").style.display = "none";
        document.getElementById("checkIdModal").style.display = "none";

    });

});

/* ==========================================================
   BACK TO HOME
========================================================== */

document.getElementById("backHome")?.addEventListener("click", () => {

    document.getElementById("successModal").style.display = "none";

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

});

/* ==========================================================
   SEARCH REGISTRATION ID
========================================================== */

document.getElementById("searchIdBtn")?.addEventListener("click", async () => {

    const registrationId = document
        .getElementById("searchRegistrationId")
        .value
        .trim();

    if (registrationId === "") {

        showToast("Enter Registration ID");

        return;

    }

    try {

        const snapshot = await getDocs(registrationsRef);

        let found = false;

        snapshot.forEach((docItem) => {

            const data = docItem.data();

            if (data.registrationId === registrationId) {

                found = true;

                document.getElementById("registrationResult").innerHTML = `
                    <b>Name:</b> ${data.name}<br>
                    <b>WIN ID:</b> ${data.registrationId}<br>
                    <b>Status:</b> ${data.status || "Pending"}
                `;

            }

        });

        if (!found) {

            document.getElementById("registrationResult").innerHTML =
                "<span style='color:red;'>Registration ID Not Found</span>";

        }

    } catch (error) {

        console.error(error);

        showToast("Unable to Search");

    }

});

/* ==========================================================
   ADMIN DASHBOARD
========================================================== */

function loadAdminDashboard() {

    onSnapshot(registrationsRef, (snapshot) => {

        let pending = 0;

        document.getElementById("adminPlayersCount").textContent = snapshot.size;

        snapshot.forEach((docItem) => {

            const data = docItem.data();

            if ((data.status || "Pending") === "Pending") {

                pending++;

            }

        });

        document.getElementById("adminPendingCount").textContent = pending;

    });

    onSnapshot(luckyDrawRef, (snapshot) => {

        document.getElementById("adminLuckyCount").textContent = snapshot.size;

    });

    onSnapshot(customRef, (snapshot) => {

        document.getElementById("adminCustomCount").textContent = snapshot.size;

    });

                   }
/* ==========================================================
   ADMIN MENU
========================================================== */

document.querySelectorAll(".adminMenu").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll(".adminMenu").forEach(menu => {

            menu.classList.remove("active");

        });

        button.classList.add("active");

        document.querySelectorAll(".adminPage").forEach(page => {

            page.style.display = "none";

            page.classList.remove("active");

        });

        const page = document.getElementById(
            button.dataset.page + "Page"
        );

        if (page) {

            page.style.display = "block";

            page.classList.add("active");

        }

    });

});

/* Show dashboard by default */

document.getElementById("dashboardPage").style.display = "block";

/* ==========================================================
   LOAD ADMIN REGISTRATIONS
========================================================== */

async function loadAdminRegistrations() {

    const container = document.getElementById("adminRegistrationsContainer");

    if (!container) return;

    onSnapshot(registrationsRef, (snapshot) => {

        container.innerHTML = "";

        snapshot.forEach((docItem) => {

            const data = docItem.data();

            container.innerHTML += `

            <div class="adminCard">

                <h3>${data.name}</h3>

                <p><b>WIN ID:</b> ${data.registrationId}</p>

                <p><b>Phone:</b> ${data.phone}</p>

                <p><b>Status:</b> ${data.status || "Pending"}</p>

                <button class="adminBtn approveBtn"
                    onclick="approveRegistration('${docItem.id}')">

                    Approve

                </button>

            </div>

            `;

        });

    });

}

/* ==========================================================
   APPROVE REGISTRATION
========================================================== */

window.approveRegistration = async function (docId) {

    try {

        await updateDoc(doc(db, "registrations", docId), {

            status: "Approved",
            approved: true,
            approvedAt: serverTimestamp()

        });

        showToast("Registration Approved");

    }

    catch (error) {

        console.error(error);

        showToast("Approval Failed");

    }

};


/* ==========================================================
   END OF APP.JS
========================================================== */


