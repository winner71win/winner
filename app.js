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
    serverTimestamp
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

if(unlockButton){

    unlockButton.addEventListener("click",checkPassword);

}

async function checkPassword(){

    const password = document
        .getElementById("websitePassword")
        .value
        .trim();

    if(password===""){

        showToast("Enter Password");

        return;

    }

    if(password===websiteSettings.websitePassword){

        passwordScreen.style.display="none";

        mainWebsite.style.display="block";

        showToast("Welcome to Winner");

    }

    else{

        showToast("Incorrect Password");

    }

}

/* ==========================================================
   START APP
========================================================== */

loadWebsiteSettings();

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

loadStats();

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

async function verifyPayment(){

    const transactionId =
    document.getElementById(
        "transactionId"
    ).value.trim();

    if(transactionId===""){

        showToast(
            "Enter Transaction ID"
        );

        return;

    }

    registrationNumber++;

    const registrationId =
    "WIN-" +
    new Date().getFullYear() +
    "-" +
    String(registrationNumber)
    .padStart(6,"0");

    currentPlayer.registrationId =
    registrationId;

    currentPlayer.transactionId =
    transactionId;

    currentPlayer.createdAt =
    serverTimestamp();

    await addDoc(
        registrationsRef,
        currentPlayer
    );

    document.getElementById(
        "paymentModal"
    ).style.display="none";

    document.getElementById(
        "successModal"
    ).style.display="flex";

    document.getElementById(
        "registrationId"
    ).textContent=
    registrationId;

    loadStats();

    showToast(
        "Registration Successful"
    );

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

document.getElementById(
    "adminLoginButton"
)?.addEventListener(
    "click",
    adminLogin
);

async function adminLogin(){

    const email =
    document.getElementById(
        "adminEmail"
    ).value.trim();

    const password =
    document.getElementById(
        "adminPassword"
    ).value.trim();

    try{

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        showToast(
            "Admin Login Successful"
        );

        window.location.href=
        "admin.html";

    }

    catch(error){

        showToast(
            "Invalid Admin Login"
        );

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

window.logoutAdmin=
async function(){

    await signOut(auth);

    showToast(
        "Logged Out"
    );

};



/* ==========================================================
   END OF APP.JS
========================================================== */


/* ==========================
   THREE DOT MENU
========================== */

const threeDotBtn = document.getElementById("threeDotBtn");
const threeDotMenu = document.getElementById("threeDotMenu");

if (threeDotBtn && threeDotMenu) {

    threeDotBtn.addEventListener("click", (e) => {

        e.stopPropagation();

        threeDotMenu.classList.toggle("show");

    });

    document.addEventListener("click", () => {

        threeDotMenu.classList.remove("show");

    });

}
/* ==========================
   ADMIN PANEL
========================== */

document.getElementById("openAdmin")?.addEventListener("click", () => {

    document.getElementById("adminLoginModal").style.display = "flex";

});



