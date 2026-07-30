/* ==========================================================
   WINNER APP.JS
   PART 1A
========================================================== */

/* ==========================================================
   FIREBASE IMPORTS
========================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    runTransaction
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

/* ==========================================================
   FIREBASE CONFIG
========================================================== */

const firebaseConfig = {

    apiKey: "YOUR_API_KEY",

    authDomain: "winner-534bd.firebaseapp.com",

    projectId: "winner-534bd",

    storageBucket: "winner-534bd.firebasestorage.app",

    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",

    appId: "YOUR_APP_ID"

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

const registrationsRef = collection(db, "registrations");

const customRef = collection(db, "custom");

const luckyDrawRef = collection(db, "luckydraw");

const noticesRef = collection(db, "notices");

const supportRef = collection(db, "support");

const withdrawalsRef = collection(db, "withdrawals");

const adminsRef = collection(db, "admins");

const settingsRef = doc(db, "settings", "website");

/* ==========================================================
   END OF PART 1A
========================================================== */

/* ==========================================================
   PART 1B
   GLOBAL VARIABLES
========================================================== */

let websiteSettings = {};

let currentPlayer = {};

let currentAdmin = null;

let selectedRegistrationId = "";

let selectedCustomId = "";

let selectedLuckyDrawId = "";

let selectedNoticeId = "";

let selectedSupportId = "";

let selectedWithdrawalId = "";

/* ==========================================================
   DOM REFERENCES
========================================================== */

const mainWebsite =
document.getElementById("mainWebsite");

const adminPanel =
document.getElementById("adminPanel");

const passwordScreen =
document.getElementById("passwordScreen");

const loadingScreen =
document.getElementById("loadingScreen");

/* ==========================================================
   TOAST
========================================================== */

function showToast(message){

    let toast =
    document.getElementById("toast");

    if(!toast){

        toast =
        document.createElement("div");

        toast.id = "toast";

        document.body.appendChild(toast);

    }

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(()=>{

        toast.classList.remove("show");

    },3000);

}

/* ==========================================================
   URL HELPER
========================================================== */

function normalizeExternalUrl(url){

    const value =
    String(url || "").trim();

    if(value==="") return "#";

    if(

        value.startsWith("http://") ||

        value.startsWith("https://") ||

        value.startsWith("mailto:") ||

        value.startsWith("tel:")

    ){

        return value;

    }

    if(value.startsWith("www.")){

        return "https://" + value;

    }

    return "https://" + value;

}

/* ==========================================================
   RANDOM ID
========================================================== */

function randomCode(length=6){

    const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let result="";

    for(let i=0;i<length;i++){

        result +=
        chars.charAt(
            Math.floor(
                Math.random()*chars.length
            )
        );

    }

    return result;

}

/* ==========================================================
   DATE FORMAT
========================================================== */

function formatDate(timestamp){

    if(!timestamp) return "-";

    try{

        const d =
        timestamp.toDate();

        return d.toLocaleString();

    }

    catch{

        return "-";

    }

}

/* ==========================================================
   END PART 1B
========================================================== */

/* ==========================================================
   PART 1C
   MENU & MODALS
========================================================== */

const threeDotBtn =
document.getElementById("threeDotBtn");

const threeDotMenu =
document.getElementById("threeDotMenu");

const openAdmin =
document.getElementById("openAdmin");

const adminLoginModal =
document.getElementById("adminLoginModal");

const closeAdminLogin =
document.getElementById("closeAdminLogin");

const checkRegistration =
document.getElementById("checkRegistration");

const checkIdModal =
document.getElementById("checkIdModal");

const closeCheckId =
document.getElementById("closeCheckId");

const registrationModal =
document.getElementById("registrationModal");

const paymentModal =
document.getElementById("paymentModal");

const successModal =
document.getElementById("successModal");

const backHome =
document.getElementById("backHome");

/* ==========================================================
   THREE DOT MENU
========================================================== */

threeDotBtn?.addEventListener("click",()=>{

    threeDotMenu.classList.toggle("show");

});

/* ==========================================================
   OPEN ADMIN LOGIN
========================================================== */

openAdmin?.addEventListener("click",()=>{

    adminLoginModal.style.display="flex";

    threeDotMenu.classList.remove("show");

});

/* ==========================================================
   CLOSE ADMIN LOGIN
========================================================== */

closeAdminLogin?.addEventListener("click",()=>{

    adminLoginModal.style.display="none";

});

/* ==========================================================
   OPEN CHECK REGISTRATION
========================================================== */

checkRegistration?.addEventListener("click",()=>{

    checkIdModal.style.display="flex";

    threeDotMenu.classList.remove("show");

});

/* ==========================================================
   CLOSE CHECK REGISTRATION
========================================================== */

closeCheckId?.addEventListener("click",()=>{

    checkIdModal.style.display="none";

});

/* ==========================================================
   BACK HOME
========================================================== */

backHome?.addEventListener("click",()=>{

    successModal.style.display="none";

    registrationModal.style.display="none";

    paymentModal.style.display="none";

    adminLoginModal.style.display="none";

    checkIdModal.style.display="none";

    if(mainWebsite){

        mainWebsite.scrollIntoView({

            behavior:"smooth"

        });

    }

});

/* ==========================================================
   CLOSE MODAL WHEN CLICK OUTSIDE
========================================================== */

window.addEventListener("click",(event)=>{

    [

        adminLoginModal,

        registrationModal,

        paymentModal,

        successModal,

        checkIdModal

    ].forEach(modal=>{

        if(

            modal &&

            event.target===modal

        ){

            modal.style.display="none";

        }

    });

});

/* ==========================================================
   END PART 1C
========================================================== */

/* ==========================================================
   PART 2A
   PLAYER REGISTRATION
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

    const playerName =
    document.getElementById("playerName");

    const playerPhone =
    document.getElementById("playerPhone");

    const playerEmail =
    document.getElementById("playerEmail");

    const gameUid =
    document.getElementById("gameUid");

    if(

        !playerName.value.trim() ||

        !playerPhone.value.trim() ||

        !gameUid.value.trim()

    ){

        showToast("Fill all required fields");

        return;

    }

    currentPlayer = {

        name:
        playerName.value.trim(),

        phone:
        playerPhone.value.trim(),

        email:
        playerEmail
        ? playerEmail.value.trim()
        : "",

        uid:
        gameUid.value.trim(),

        status:"Pending",

        paymentStatus:"Pending",

        withdrawalStatus:"Pending",

        approved:false

    };

    registrationModal.style.display="none";

    paymentModal.style.display="flex";

}

/* ==========================================================
   OPEN REGISTRATION
========================================================== */

document
.querySelectorAll(".registerNowBtn")
.forEach(button=>{

    button.addEventListener("click",()=>{

        registrationModal.style.display="flex";

    });

});

/* ==========================================================
   CLOSE REGISTRATION
========================================================== */

document
.getElementById("closeRegistration")
?.addEventListener("click",()=>{

    registrationModal.style.display="none";

});

/* ==========================================================
   CLOSE PAYMENT
========================================================== */

document
.getElementById("closePayment")
?.addEventListener("click",()=>{

    paymentModal.style.display="none";

});

/* ==========================================================
   END PART 2A
========================================================== */
/* ==========================================================
   PART 2B
   PAYMENT + UNIQUE WIN ID
========================================================== */

document
.getElementById("submitPayment")
?.addEventListener(
    "click",
    verifyPayment
);

async function verifyPayment(){

    const transactionId =
    document
    .getElementById("transactionId")
    .value
    .trim();

    if(transactionId===""){

        showToast("Enter Transaction ID");

        return;

    }

    try{

        const counterRef =
        doc(
            db,
            "counters",
            "registration"
        );

        let registrationId="";

        await runTransaction(

            db,

            async(transaction)=>{

                const counterSnap =
                await transaction.get(counterRef);

                const lastNumber =
                counterSnap.exists()

                ? counterSnap.data().lastNumber || 0

                : 0;

                const nextNumber =
                lastNumber + 1;

                registrationId =

                "WIN-" +

                randomCode(6) +

                "-" +

                String(nextNumber)
                .padStart(4,"0");

                transaction.set(

                    counterRef,

                    {

                        lastNumber:
                        nextNumber

                    },

                    {

                        merge:true

                    }

                );

            }

        );

        currentPlayer.registrationId =
        registrationId;

        currentPlayer.transactionId =
        transactionId;

        currentPlayer.createdAt =
        serverTimestamp();

        currentPlayer.upiId =
        websiteSettings.upiId || "";

        await addDoc(

            registrationsRef,

            currentPlayer

        );

        paymentModal.style.display =
        "none";

        successModal.style.display =
        "flex";

        document
        .getElementById(
            "registrationId"
        )
        .textContent =
        registrationId;

        showToast(
            "Registration Successful"
        );

        if(typeof loadStats==="function"){

            loadStats();

        }

    }

    catch(error){

        console.error(error);

        showToast(
            "Registration Failed"
        );

    }

}

/* ==========================================================
   END PART 2B
========================================================== */

/* ==========================================================
   PART 2C
   LOAD WEBSITE SETTINGS
========================================================== */

async function loadWebsiteSettings(){

    try{

        const snapshot =
        await getDoc(settingsRef);

        if(!snapshot.exists()) return;

        websiteSettings =
        snapshot.data();

        const joinWhatsapp =
        document.getElementById(
            "joinWhatsapp"
        );

        if(joinWhatsapp){

            joinWhatsapp.href =
            normalizeExternalUrl(
                websiteSettings.whatsappLink
            );

            joinWhatsapp.target =
            "_blank";

            joinWhatsapp.rel =
            "noopener noreferrer";

        }

        const upiText =
        document.getElementById(
            "upiId"
        );

        if(upiText){

            upiText.textContent =

            websiteSettings.upiId ||

            "UPI Not Available";

        }

        if(

            websiteSettings.bannerText &&

            document.getElementById(
                "bannerText"
            )

        ){

            document.getElementById(
                "bannerText"
            ).textContent =

            websiteSettings.bannerText;

        }

        if(

            websiteSettings.maintenance === true

        ){

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

            ">

            <h1>

            Website Under Maintenance

            </h1>

            <p>

            Please Visit Again Later.

            </p>

            </div>

            `;

            return;

        }

        console.log(
            "loadWebsiteSettings completed"
        );

    }

    catch(error){

        console.error(error);

        showToast(
            "Unable to load website settings."
        );

    }

}

/* ==========================================================
   LOAD SETTINGS ON START
========================================================== */

loadWebsiteSettings();

/* ==========================================================
   END PART 2C
========================================================== */

/* ==========================================================
   PART 3A
   ADMIN LOGIN + LOGOUT + AUTH
========================================================== */

const adminLoginButton =
document.getElementById("adminLoginButton");

adminLoginButton?.addEventListener(
    "click",
    adminLogin
);

/* ==========================================================
   ADMIN LOGIN
========================================================== */

async function adminLogin(){

    const email =
    document.getElementById("adminEmail")
    .value
    .trim();

    const password =
    document.getElementById("adminPassword")
    .value
    .trim();

    if(email==="" || password===""){

        showToast(
            "Enter Email & Password"
        );

        return;

    }

    try{

        await signInWithEmailAndPassword(

            auth,

            email,

            password

        );

        currentAdmin = email;

        adminLoginModal.style.display =
        "none";

        if(mainWebsite){

            mainWebsite.style.display =
            "none";

        }

        if(adminPanel){

            adminPanel.style.display =
            "block";

        }

        loadAdminDashboard();

        loadAdminRegistrations();

        if(typeof loadAdminCustom==="function"){

            loadAdminCustom();

        }

        if(typeof loadAdminLucky==="function"){

            loadAdminLucky();

        }

        if(typeof loadAdminNotice==="function"){

            loadAdminNotice();

        }

        if(typeof loadAdminSupport==="function"){

            loadAdminSupport();

        }

        if(typeof loadAdminWithdrawals==="function"){

            loadAdminWithdrawals();

        }

        if(typeof loadAdminSettings==="function"){

            loadAdminSettings();

        }

        showToast(
            "Welcome Admin"
        );

    }

    catch(error){

        console.error(error);

        showToast(
            "Invalid Email or Password"
        );

    }

}

/* ==========================================================
   AUTH STATE
========================================================== */

onAuthStateChanged(

    auth,

    (user)=>{

        if(user){

            console.log(
                "Logged In :",
                user.email
            );

        }

        else{

            console.log(
                "Admin Logged Out"
            );

        }

    }

);

/* ==========================================================
   LOGOUT
========================================================== */

document
.getElementById("logoutAdmin")
?.addEventListener(
    "click",
    async()=>{

        try{

            await signOut(auth);

            currentAdmin = null;

            if(adminPanel){

                adminPanel.style.display =
                "none";

            }

            if(mainWebsite){

                mainWebsite.style.display =
                "block";

            }

            showToast(
                "Logged Out Successfully"
            );

        }

        catch(error){

            console.error(error);

            showToast(
                "Logout Failed"
            );

        }

    }
);

/* ==========================================================
   END PART 3A
========================================================== */

/* ==========================================================
   PART 3B
   ADMIN MENU
========================================================== */

document.querySelectorAll(".adminMenu").forEach(button=>{

    button.addEventListener("click",()=>{

        document.querySelectorAll(".adminMenu").forEach(menu=>{

            menu.classList.remove("active");

        });

        button.classList.add("active");

        document.querySelectorAll(".adminPage").forEach(page=>{

            page.style.display="none";

            page.classList.remove("active");

        });

        const selectedPage =

        document.getElementById(

            button.dataset.page + "Page"

        );

        if(selectedPage){

            selectedPage.style.display="block";

            selectedPage.classList.add("active");

        }

        switch(button.dataset.page){

            case "dashboard":

                loadAdminDashboard();

                break;

            case "registrations":

                loadAdminRegistrations();

                break;

            case "custom":

                loadAdminCustom();

                break;

            case "luckydraw":

                loadAdminLucky();

                break;

            case "notice":

                loadAdminNotice();

                break;

            case "support":

                loadAdminSupport();

                break;

            case "withdraw":

                loadAdminWithdrawals();

                break;

            case "settings":

                loadAdminSettings();

                break;

            case "admins":

                loadAdminAdmins();

                break;

        }

    });

});

/* ==========================================================
   SHOW DASHBOARD BY DEFAULT
========================================================== */

const dashboardPage =

document.getElementById("dashboardPage");

if(dashboardPage){

    dashboardPage.style.display="block";

    dashboardPage.classList.add("active");

}

/* ==========================================================
   END PART 3B
========================================================== */

/* ==========================================================
   PART 4A
   ADMIN DASHBOARD
========================================================== */

function loadAdminDashboard(){

    console.log("loadAdminDashboard");

    const players =
    document.getElementById("adminPlayersCount");

    const pending =
    document.getElementById("adminPendingCount");

    const approved =
    document.getElementById("adminApprovedCount");

    const custom =
    document.getElementById("adminCustomCount");

    const lucky =
    document.getElementById("adminLuckyCount");

    const withdraw =
    document.getElementById("adminWithdrawCount");

    const support =
    document.getElementById("adminSupportCount");

    const revenue =
    document.getElementById("adminRevenue");

    onSnapshot(registrationsRef,(snapshot)=>{

        let totalPlayers=0;

        let pendingPlayers=0;

        let approvedPlayers=0;

        let totalRevenue=0;

        snapshot.forEach(docItem=>{

            totalPlayers++;

            const data=docItem.data();

            if((data.status||"Pending")==="Pending"){

                pendingPlayers++;

            }

            if((data.status||"") === "Approved"){

                approvedPlayers++;

            }

            totalRevenue +=

            Number(data.entryFee||0);

        });

        if(players)
        players.textContent=totalPlayers;

        if(pending)
        pending.textContent=pendingPlayers;

        if(approved)
        approved.textContent=approvedPlayers;

        if(revenue)
        revenue.textContent=
        "₹"+totalRevenue;

    });

    onSnapshot(customRef,(snapshot)=>{

        if(custom){

            custom.textContent=
            snapshot.size;

        }

    });

    onSnapshot(luckyDrawRef,(snapshot)=>{

        if(lucky){

            lucky.textContent=
            snapshot.size;

        }

    });

    onSnapshot(withdrawalsRef,(snapshot)=>{

        if(withdraw){

            withdraw.textContent=
            snapshot.size;

        }

    });

    onSnapshot(supportRef,(snapshot)=>{

        if(support){

            support.textContent=
            snapshot.size;

        }

    });

}

/* ==========================================================
   END PART 4A
========================================================== */

/* ==========================================================
   PART 4B-1
   LOAD ADMIN REGISTRATIONS
========================================================== */

function loadAdminRegistrations(){

    console.log("loadAdminRegistrations");

    const container =
    document.getElementById(
        "adminRegistrationsContainer"
    );

    if(!container) return;

    onSnapshot(

        registrationsRef,

        (snapshot)=>{

            container.innerHTML="";

            if(snapshot.empty){

                container.innerHTML=`

                <div class="adminCard">

                    <h3>No Registrations Found</h3>

                </div>

                `;

                return;

            }

            snapshot.forEach(docItem=>{

                const data=
                docItem.data();

                container.innerHTML += `

<div class="adminCard">

<h3>${data.name||"-"}</h3>

<p><b>WIN ID :</b> ${data.registrationId||"-"}</p>

<p><b>Phone :</b> ${data.phone||"-"}</p>

<p><b>UID :</b> ${data.uid||"-"}</p>

<p><b>Status :</b> ${data.status||"Pending"}</p>

<p><b>Payment :</b> ${data.paymentStatus||"Pending"}</p>

<p><b>Withdrawal :</b> ${data.withdrawalStatus||"Pending"}</p>

<p><b>UPI :</b> ${data.upiId||"-"}</p>

<div class="adminActionRow">

<button

class="adminBtn approveBtn"

onclick="approveRegistration('${docItem.id}')">

Approve

</button>

<button

class="adminBtn editBtn"

onclick="editRegistration('${docItem.id}')">

Edit

</button>

<button

class="adminBtn rejectBtn"

onclick="rejectRegistration('${docItem.id}')">

Reject

</button>

</div>

</div>

                `;

            });

        }

    );

}

/* ==========================================================
   END PART 4B-1
========================================================== */

/* ==========================================================
   PART 4B-2
   REGISTRATION ACTIONS
========================================================== */

window.approveRegistration =
async function(id){

    try{

        await updateDoc(

            doc(db,"registrations",id),

            {

                status:"Approved",

                approved:true,

                paymentStatus:"Successful"

            }

        );

        showToast(

            "Player Approved"

        );

    }

    catch(error){

        console.error(error);

        showToast(

            "Approval Failed"

        );

    }

};

window.rejectRegistration =
async function(id){

    try{

        await updateDoc(

            doc(db,"registrations",id),

            {

                status:"Rejected",

                approved:false

            }

        );

        showToast(

            "Player Rejected"

        );

    }

    catch(error){

        console.error(error);

        showToast(

            "Reject Failed"

        );

    }

};

window.editRegistration =
async function(id){

    try{

        const snap = await getDoc(

            doc(db,"registrations",id)

        );

        if(!snap.exists()){

            showToast(

                "Player Not Found"

            );

            return;

        }

        const data = snap.data();

        selectedRegistrationId = id;

        const name = prompt(

            "Player Name",

            data.name || ""

        );

        if(name===null) return;

        const phone = prompt(

            "Phone Number",

            data.phone || ""

        );

        if(phone===null) return;

        const uid = prompt(

            "Free Fire UID",

            data.uid || ""

        );

        if(uid===null) return;

        const upi = prompt(

            "UPI ID",

            data.upiId || ""

        );

        if(upi===null) return;

        await updateDoc(

            doc(db,"registrations",id),

            {

                name:name.trim(),

                phone:phone.trim(),

                uid:uid.trim(),

                upiId:upi.trim()

            }

        );

        showToast(

            "Player Updated"

        );

    }

    catch(error){

        console.error(error);

        showToast(

            "Update Failed"

        );

    }

};

/* ==========================================================
   END PART 4B-2
========================================================== */

/* ==========================================================
   PART 4B-3
   SEARCH PLAYER
========================================================== */

document
.getElementById("searchAdminRegistrationBtn")
?.addEventListener(
    "click",
    searchAdminRegistration
);

async function searchAdminRegistration(){

    const keyword =
    document
    .getElementById(
        "adminRegistrationSearch"
    )
    .value
    .trim()
    .toLowerCase();

    if(keyword===""){

        loadAdminRegistrations();

        return;

    }

    const container =
    document.getElementById(
        "adminRegistrationsContainer"
    );

    const snapshot =
    await getDocs(registrationsRef);

    container.innerHTML="";

    let found = false;

    snapshot.forEach(docItem=>{

        const data =
        docItem.data();

        const text =

        (
            (data.name||"") +

            " " +

            (data.phone||"") +

            " " +

            (data.registrationId||"") +

            " " +

            (data.uid||"")

        ).toLowerCase();

        if(text.includes(keyword)){

            found = true;

            container.innerHTML += `

<div class="adminCard">

<h3>${data.name||"-"}</h3>

<p><b>WIN ID :</b> ${data.registrationId||"-"}</p>

<p><b>Phone :</b> ${data.phone||"-"}</p>

<p><b>UID :</b> ${data.uid||"-"}</p>

<p><b>Status :</b> ${data.status||"Pending"}</p>

<p><b>Payment :</b> ${data.paymentStatus||"Pending"}</p>

<p><b>Withdrawal :</b> ${data.withdrawalStatus||"Pending"}</p>

<p><b>UPI :</b> ${data.upiId||"-"}</p>

<div class="adminActionRow">

<button
class="adminBtn approveBtn"
onclick="approveRegistration('${docItem.id}')">

Approve

</button>

<button
class="adminBtn editBtn"
onclick="editRegistration('${docItem.id}')">

Edit

</button>

<button
class="adminBtn rejectBtn"
onclick="rejectRegistration('${docItem.id}')">

Reject

</button>

</div>

</div>

`;

        }

    });

    if(!found){

        container.innerHTML = `

<div class="adminCard">

<h3>No Player Found</h3>

</div>

`;

    }

}

/* ==========================================================
   END PART 4B-3
========================================================== */

/* ==========================================================
   PART 5A
   LOAD ADMIN CUSTOM MATCHES
========================================================== */

function loadAdminCustom(){

    console.log("loadAdminCustom");

    const container =
    document.getElementById(
        "adminCustomContainer"
    );

    if(!container) return;

    onSnapshot(

        customRef,

        (snapshot)=>{

            container.innerHTML="";

            if(snapshot.empty){

                container.innerHTML=`

<div class="adminCard">

<h3>No Custom Matches</h3>

<button
class="adminBtn approveBtn"
onclick="openCustomEditor()">

Create Match

</button>

</div>

`;

                return;

            }

            snapshot.forEach(docItem=>{

                const data =
                docItem.data();

                container.innerHTML += `

<div class="adminCard">

<h2>${data.title||"Free Fire Custom"}</h2>

<p><b>Mode :</b> ${data.mode||"-"}</p>

<p><b>Entry :</b> ₹${data.entryFee||0}</p>

<p><b>Prize :</b> ₹${data.prize||0}</p>

<p><b>Per Kill :</b> ₹${data.perKill||0}</p>

<p><b>Booyah :</b> ₹${data.booyah||0}</p>

<p><b>Date :</b> ${data.date||"-"}</p>

<p><b>Time :</b> ${data.time||"-"}</p>

<p><b>Room ID :</b> ${data.roomId||"-"}</p>

<p><b>Password :</b> ${data.password||"-"}</p>

<p><b>Status :</b> ${data.status||"Open"}</p>

<p>

${data.description||""}

</p>

<div class="adminActionRow">

<button

class="adminBtn approveBtn"

onclick="editCustom('${docItem.id}')">

Edit

</button>

<button

class="adminBtn rejectBtn"

onclick="closeCustom('${docItem.id}')">

Close

</button>

</div>

</div>

`;

            });

        }

    );

}

/* ==========================================================
   END PART 5A
========================================================== */

/* ==========================================================
   PART 5B
   CUSTOM MATCH EDITOR
========================================================== */

document
.getElementById("addCustomMatchBtn")
?.addEventListener("click",()=>{

    selectedCustomId="";

    document
    .getElementById("customMatchForm")
    ?.reset();

    document
    .getElementById("customMatchModal")
    .style.display="flex";

});

window.openCustomEditor=function(){

    selectedCustomId="";

    document
    .getElementById("customMatchForm")
    ?.reset();

    document
    .getElementById("customMatchModal")
    .style.display="flex";

};

document
.getElementById("closeCustomMatchModal")
?.addEventListener("click",()=>{

    document
    .getElementById("customMatchModal")
    .style.display="none";

});

window.editCustom = async function(id){

    selectedCustomId=id;

    const snap =
    await getDoc(doc(db,"custom",id));

    if(!snap.exists()) return;

    const data=snap.data();

    document.getElementById("customTitle").value=data.title||"";
    document.getElementById("customMode").value=data.mode||"";
    document.getElementById("customEntryFee").value=data.entryFee||0;
    document.getElementById("customPrize").value=data.prize||0;
    document.getElementById("customPerKill").value=data.perKill||0;
    document.getElementById("customBooyah").value=data.booyah||0;
    document.getElementById("customDate").value=data.date||"";
    document.getElementById("customTime").value=data.time||"";
    document.getElementById("customRoomId").value=data.roomId||"";
    document.getElementById("customPassword").value=data.password||"";
    document.getElementById("customBanner").value=data.banner||"";
    document.getElementById("customDescription").value=data.description||"";
    document.getElementById("customStatus").value=data.status||"Open";
    document.getElementById("customJoinEnabled").checked=
    data.joinEnabled!==false;

    document
    .getElementById("customMatchModal")
    .style.display="flex";

};

document
.getElementById("customMatchForm")
?.addEventListener("submit",saveCustomMatch);

async function saveCustomMatch(e){

    e.preventDefault();

    const customData={

        title:
        document.getElementById("customTitle").value.trim(),

        mode:
        document.getElementById("customMode").value.trim(),

        entryFee:
        Number(document.getElementById("customEntryFee").value||0),

        prize:
        Number(document.getElementById("customPrize").value||0),

        perKill:
        Number(document.getElementById("customPerKill").value||0),

        booyah:
        Number(document.getElementById("customBooyah").value||0),

        date:
        document.getElementById("customDate").value,

        time:
        document.getElementById("customTime").value,

        roomId:
        document.getElementById("customRoomId").value.trim(),

        password:
        document.getElementById("customPassword").value.trim(),

        banner:
        document.getElementById("customBanner").value.trim(),

        description:
        document.getElementById("customDescription").value.trim(),

        status:
        document.getElementById("customStatus").value,

        joinEnabled:
        document.getElementById("customJoinEnabled").checked,

        updatedAt:
        serverTimestamp()

    };

    try{

        if(selectedCustomId===""){

            customData.createdAt=
            serverTimestamp();

            await addDoc(

                customRef,

                customData

            );

            showToast("Custom Match Created");

        }

        else{

            await updateDoc(

                doc(db,"custom",selectedCustomId),

                customData

            );

            showToast("Custom Match Updated");

        }

        document
        .getElementById("customMatchModal")
        .style.display="none";

    }

    catch(error){

        console.error(error);

        showToast("Unable to Save Match");

    }

}

/* ==========================================================
   END PART 5B
========================================================== */

/* ==========================================================
   PART 5C
   CLOSE / OPEN CUSTOM MATCH
========================================================== */

window.closeCustom = async function(id){

    try{

        await updateDoc(

            doc(db,"custom",id),

            {

                status:"Closed",

                joinEnabled:false,

                updatedAt:serverTimestamp()

            }

        );

        showToast("Custom Match Closed");

    }

    catch(error){

        console.error(error);

        showToast("Unable To Close Match");

    }

};

window.openCustom = async function(id){

    try{

        await updateDoc(

            doc(db,"custom",id),

            {

                status:"Open",

                joinEnabled:true,

                updatedAt:serverTimestamp()

            }

        );

        showToast("Custom Match Opened");

    }

    catch(error){

        console.error(error);

        showToast("Unable To Open Match");

    }

};

/* ==========================================================
   LOAD CUSTOM MATCHES ON HOME PAGE
========================================================== */

function loadCustomMatches(){

    const container =
    document.getElementById("customContainer");

    if(!container) return;

    onSnapshot(

        customRef,

        (snapshot)=>{

            container.innerHTML="";

            if(snapshot.empty){

                container.innerHTML=`

<div class="card">

<h2>No Custom Match Available</h2>

</div>

`;

                return;

            }

            snapshot.forEach(docItem=>{

                const data = docItem.data();

                container.innerHTML += `

<div class="card customCard">

<h2>${data.title||"Free Fire Custom"}</h2>

<p><b>Mode :</b> ${data.mode||"-"}</p>

<p><b>Entry :</b> ₹${data.entryFee||0}</p>

<p><b>Prize :</b> ₹${data.prize||0}</p>

<p><b>Per Kill :</b> ₹${data.perKill||0}</p>

<p><b>Booyah :</b> ₹${data.booyah||0}</p>

<p><b>Date :</b> ${data.date||"-"}</p>

<p><b>Time :</b> ${data.time||"-"}</p>

<p>${data.description||""}</p>

${
data.joinEnabled!==false

?

`<button
class="primaryBtn"
onclick="joinCustomMatch('${docItem.id}')">

Join Match

</button>`

:

`<button
class="primaryBtn"
disabled>

Match Closed

</button>`

}

</div>

`;

            });

        }

    );

}

/* ==========================================================
   JOIN CUSTOM MATCH
========================================================== */

window.joinCustomMatch=function(id){

    selectedCustomId=id;

    document
    .getElementById("registrationModal")
    .style.display="flex";

};

/* ==========================================================
   AUTO LOAD CUSTOM MATCHES
========================================================== */

loadCustomMatches();

/* ==========================================================
   END PART 5C
========================================================== */

/* ==========================================================
   PART 6A
   LOAD ADMIN LUCKY DRAW
========================================================== */

function loadAdminLucky(){

    console.log("loadAdminLucky");

    const container =
    document.getElementById(
        "adminLuckyContainer"
    );

    if(!container) return;

    onSnapshot(

        luckyDrawRef,

        (snapshot)=>{

            container.innerHTML="";

            if(snapshot.empty){

                container.innerHTML=`

<div class="adminCard">

<h3>No Lucky Draw Available</h3>

<button
class="adminBtn approveBtn"
onclick="openLuckyEditor()">

Create Lucky Draw

</button>

</div>

`;

                return;

            }

            snapshot.forEach(docItem=>{

                const data =
                docItem.data();

                container.innerHTML += `

<div class="adminCard">

<h2>${data.title||"Lucky Draw"}</h2>

<p><b>Entry Fee :</b> ₹${data.entryFee||0}</p>

<p><b>Prize :</b> ₹${data.prize||0}</p>

<p><b>Top Winners :</b> ${data.winners||"-"}</p>

<p><b>Date :</b> ${data.date||"-"}</p>

<p><b>Time :</b> ${data.time||"-"}</p>

<p><b>Status :</b> ${data.status||"LIVE"}</p>

<p>

${data.description||""}

</p>

<div class="adminActionRow">

<button

class="adminBtn approveBtn"

onclick="editLucky('${docItem.id}')">

Edit

</button>

<button

class="adminBtn rejectBtn"

onclick="closeLucky('${docItem.id}')">

Close

</button>

</div>

</div>

`;

            });

        }

    );

}

/* ==========================================================
   END PART 6A
========================================================== */

/* ==========================================================
   PART 6B
   CREATE / EDIT / SAVE LUCKY DRAW
========================================================== */

document
.getElementById("addLuckyDrawBtn")
?.addEventListener("click",()=>{

    selectedLuckyDrawId="";

    document
    .getElementById("luckyDrawForm")
    ?.reset();

    document
    .getElementById("luckyDrawModal")
    .style.display="flex";

});

window.openLuckyEditor=function(){

    selectedLuckyDrawId="";

    document
    .getElementById("luckyDrawForm")
    ?.reset();

    document
    .getElementById("luckyDrawModal")
    .style.display="flex";

};

document
.getElementById("closeLuckyDrawModal")
?.addEventListener("click",()=>{

    document
    .getElementById("luckyDrawModal")
    .style.display="none";

});

window.editLucky = async function(id){

    selectedLuckyDrawId=id;

    const snap =
    await getDoc(doc(db,"luckydraw",id));

    if(!snap.exists()) return;

    const data=snap.data();

    document.getElementById("luckyTitle").value=data.title||"";
    document.getElementById("luckyEntryFee").value=data.entryFee||0;
    document.getElementById("luckyPrize").value=data.prize||0;
    document.getElementById("luckyWinners").value=data.winners||"";
    document.getElementById("luckyDate").value=data.date||"";
    document.getElementById("luckyTime").value=data.time||"";
    document.getElementById("luckyDescription").value=data.description||"";
    document.getElementById("luckyStatus").value=data.status||"LIVE";
    document.getElementById("luckyJoinEnabled").checked=
    data.joinEnabled!==false;

    document
    .getElementById("luckyDrawModal")
    .style.display="flex";

};

document
.getElementById("luckyDrawForm")
?.addEventListener("submit",saveLuckyDraw);

async function saveLuckyDraw(e){

    e.preventDefault();

    const luckyData={

        title:
        document.getElementById("luckyTitle").value.trim(),

        entryFee:
        Number(document.getElementById("luckyEntryFee").value||0),

        prize:
        Number(document.getElementById("luckyPrize").value||0),

        winners:
        document.getElementById("luckyWinners").value.trim(),

        date:
        document.getElementById("luckyDate").value,

        time:
        document.getElementById("luckyTime").value,

        description:
        document.getElementById("luckyDescription").value.trim(),

        status:
        document.getElementById("luckyStatus").value,

        joinEnabled:
        document.getElementById("luckyJoinEnabled").checked,

        updatedAt:
        serverTimestamp()

    };

    try{

        if(selectedLuckyDrawId===""){

            luckyData.createdAt=
            serverTimestamp();

            await addDoc(
                luckyDrawRef,
                luckyData
            );

            showToast("Lucky Draw Created");

        }

        else{

            await updateDoc(

                doc(db,"luckydraw",selectedLuckyDrawId),

                luckyData

            );

            showToast("Lucky Draw Updated");

        }

        document
        .getElementById("luckyDrawModal")
        .style.display="none";

    }

    catch(error){

        console.error(error);

        showToast("Unable To Save Lucky Draw");

    }

}

/* ==========================================================
   END PART 6B
========================================================== */

/* ==========================================================
   PART 6C
   CLOSE / OPEN LUCKY DRAW + HOME PAGE
========================================================== */

window.closeLucky = async function(id){

    try{

        await updateDoc(

            doc(db,"luckydraw",id),

            {

                status:"Closed",

                joinEnabled:false,

                updatedAt:serverTimestamp()

            }

        );

        showToast("Lucky Draw Closed");

    }

    catch(error){

        console.error(error);

        showToast("Unable To Close Lucky Draw");

    }

};

window.openLucky = async function(id){

    try{

        await updateDoc(

            doc(db,"luckydraw",id),

            {

                status:"LIVE",

                joinEnabled:true,

                updatedAt:serverTimestamp()

            }

        );

        showToast("Lucky Draw Opened");

    }

    catch(error){

        console.error(error);

        showToast("Unable To Open Lucky Draw");

    }

};

/* ==========================================================
   HOME PAGE LUCKY DRAW
========================================================== */

function loadLuckyDraw(){

    const container =
    document.getElementById("luckyContainer");

    if(!container) return;

    onSnapshot(

        luckyDrawRef,

        (snapshot)=>{

            container.innerHTML="";

            if(snapshot.empty){

                container.innerHTML=`

<div class="card">

<h2>No Lucky Draw Available</h2>

</div>

`;

                return;

            }

            snapshot.forEach(docItem=>{

                const data=docItem.data();

                container.innerHTML += `

<div class="card luckyCard">

<h2>${data.title||"Lucky Draw"}</h2>

<p><b>Entry Fee :</b> ₹${data.entryFee||0}</p>

<p><b>Prize :</b> ₹${data.prize||0}</p>

<p><b>Winners :</b> ${data.winners||"-"}</p>

<p><b>Date :</b> ${data.date||"-"}</p>

<p><b>Time :</b> ${data.time||"-"}</p>

<p>${data.description||""}</p>

${
data.joinEnabled!==false

?

`<button
class="primaryBtn"
onclick="joinLuckyDraw('${docItem.id}')">

Join Lucky Draw

</button>`

:

`<button
class="primaryBtn"
disabled>

Lucky Draw Closed

</button>`

}

</div>

`;

            });

        }

    );

}

/* ==========================================================
   JOIN LUCKY DRAW
========================================================== */

window.joinLuckyDraw=function(id){

    selectedLuckyDrawId=id;

    document
    .getElementById("registrationModal")
    .style.display="flex";

};

/* ==========================================================
   AUTO LOAD
========================================================== */

loadLuckyDraw();

/* ==========================================================
   END PART 6C
========================================================== */

/* ==========================================================
   PART 7A
   NOTICE MANAGEMENT
========================================================== */

function loadAdminNotice(){

    console.log("loadAdminNotice");

    const container =
    document.getElementById(
        "adminNoticeContainer"
    );

    if(!container) return;

    onSnapshot(

        noticesRef,

        (snapshot)=>{

            container.innerHTML="";

            if(snapshot.empty){

                container.innerHTML=`

<div class="adminCard">

<h3>No Notices Available</h3>

<button
class="adminBtn approveBtn"
onclick="openNoticeEditor()">

Create Notice

</button>

</div>

`;

                return;

            }

            snapshot.forEach(docItem=>{

                const data =
                docItem.data();

                container.innerHTML += `

<div class="adminCard">

<h2>${data.title||"Notice"}</h2>

<p>${data.description||""}</p>

<p><b>Status :</b> ${data.status||"Published"}</p>

<p><b>Date :</b> ${data.date||"-"}</p>

<div class="adminActionRow">

<button
class="adminBtn approveBtn"
onclick="editNotice('${docItem.id}')">

Edit

</button>

<button
class="adminBtn rejectBtn"
onclick="deleteNotice('${docItem.id}')">

Delete

</button>

</div>

</div>

`;

            });

        }

    );

}

/* ==========================================================
   CREATE NOTICE
========================================================== */

window.openNoticeEditor=function(){

    selectedNoticeId="";

    document
    .getElementById("noticeForm")
    ?.reset();

    document
    .getElementById("noticeModal")
    .style.display="flex";

};

window.editNotice = async function(id){

    selectedNoticeId=id;

    const snap =
    await getDoc(doc(db,"notices",id));

    if(!snap.exists()) return;

    const data=snap.data();

    document.getElementById("noticeTitle").value=data.title||"";
    document.getElementById("noticeDescription").value=data.description||"";
    document.getElementById("noticeStatus").value=data.status||"Published";

    document
    .getElementById("noticeModal")
    .style.display="flex";

};

/* ==========================================================
   SAVE NOTICE
========================================================== */

document
.getElementById("noticeForm")
?.addEventListener("submit",saveNotice);

async function saveNotice(e){

    e.preventDefault();

    const notice={

        title:
        document.getElementById("noticeTitle").value.trim(),

        description:
        document.getElementById("noticeDescription").value.trim(),

        status:
        document.getElementById("noticeStatus").value,

        date:
        new Date().toLocaleDateString(),

        updatedAt:
        serverTimestamp()

    };

    if(selectedNoticeId===""){

        notice.createdAt=
        serverTimestamp();

        await addDoc(noticesRef,notice);

        showToast("Notice Published");

    }else{

        await updateDoc(

            doc(db,"notices",selectedNoticeId),

            notice

        );

        showToast("Notice Updated");

    }

    document
    .getElementById("noticeModal")
    .style.display="none";

}

/* ==========================================================
   DELETE NOTICE
========================================================== */

window.deleteNotice = async function(id){

    if(!confirm("Delete this notice?")) return;

    await deleteDoc(

        doc(db,"notices",id)

    );

    showToast("Notice Deleted");

};

/* ==========================================================
   END PART 7A
========================================================== */

/* ==========================================================
   PART 7B
   HOME PAGE LIVE NOTICES
========================================================== */

function loadNotices(){

    console.log("loadNotices");

    const container =
    document.getElementById(
        "noticeContainer"
    );

    if(!container) return;

    onSnapshot(

        noticesRef,

        (snapshot)=>{

            container.innerHTML="";

            if(snapshot.empty){

                container.innerHTML=`

<div class="noticeCard">

<h3>No Notices Available</h3>

</div>

`;

                return;

            }

            const noticeArray=[];

            snapshot.forEach(docItem=>{

                noticeArray.push({

                    id:docItem.id,

                    ...docItem.data()

                });

            });

            noticeArray.sort((a,b)=>{

                if(!a.createdAt || !b.createdAt) return 0;

                return b.createdAt.seconds -

                       a.createdAt.seconds;

            });

            noticeArray.forEach(data=>{

                if(data.status!=="Published") return;

                container.innerHTML += `

<div class="noticeCard">

<h2>

${data.title||"Notice"}

</h2>

<p>

${data.description||""}

</p>

<div class="noticeFooter">

<span>

${data.date||""}

</span>

</div>

</div>

`;

            });

            console.log(

                "loadNotices completed"

            );

        }

    );

}

/* ==========================================================
   AUTO LOAD NOTICES
========================================================== */

loadNotices();

/* ==========================================================
   END PART 7B
========================================================== */

/* ==========================================================
   PART 8A
   SUPPORT MANAGEMENT
========================================================== */

function loadAdminSupport(){

    console.log("loadAdminSupport");

    const container =
    document.getElementById(
        "adminSupportContainer"
    );

    if(!container) return;

    onSnapshot(

        supportRef,

        (snapshot)=>{

            container.innerHTML="";

            if(snapshot.empty){

                container.innerHTML=`

<div class="adminCard">

<h3>No Support Messages</h3>

</div>

`;

                return;

            }

            snapshot.forEach(docItem=>{

                const data =
                docItem.data();

                container.innerHTML += `

<div class="adminCard">

<h2>${data.name||"Player"}</h2>

<p><b>WIN ID :</b> ${data.registrationId||"-"}</p>

<p><b>Phone :</b> ${data.phone||"-"}</p>

<p><b>Subject :</b> ${data.subject||"-"}</p>

<p>${data.message||""}</p>

<p><b>Status :</b> ${data.status||"Pending"}</p>

<div class="adminActionRow">

<button

class="adminBtn approveBtn"

onclick="replySupport('${docItem.id}')">

Reply

</button>

<button

class="adminBtn rejectBtn"

onclick="closeSupport('${docItem.id}')">

Close

</button>

</div>

</div>

`;

            });

        }

    );

}

/* ==========================================================
   SEND SUPPORT
========================================================== */

document
.getElementById("supportForm")
?.addEventListener(
    "submit",
    sendSupport
);

async function sendSupport(e){

    e.preventDefault();

    try{

        await addDoc(

            supportRef,

            {

                name:
                document.getElementById("supportName").value.trim(),

                registrationId:
                document.getElementById("supportWinId").value.trim(),

                phone:
                document.getElementById("supportPhone").value.trim(),

                subject:
                document.getElementById("supportSubject").value.trim(),

                message:
                document.getElementById("supportMessage").value.trim(),

                status:"Pending",

                reply:"",

                createdAt:
                serverTimestamp()

            }

        );

        showToast("Support Message Sent");

        document
        .getElementById("supportForm")
        .reset();

    }

    catch(error){

        console.error(error);

        showToast("Unable To Send");

    }

}

/* ==========================================================
   REPLY SUPPORT
========================================================== */

window.replySupport =
async function(id){

    const reply =
    prompt("Enter Reply");

    if(reply===null) return;

    await updateDoc(

        doc(db,"support",id),

        {

            reply:reply,

            status:"Replied",

            updatedAt:
            serverTimestamp()

        }

    );

    showToast("Reply Sent");

};

/* ==========================================================
   CLOSE SUPPORT
========================================================== */

window.closeSupport =
async function(id){

    await updateDoc(

        doc(db,"support",id),

        {

            status:"Closed",

            updatedAt:
            serverTimestamp()

        }

    );

    showToast("Support Closed");

};

/* ==========================================================
   END PART 8A
========================================================== */

/* ==========================================================
   PART 8B
   WITHDRAWAL MANAGEMENT
========================================================== */

function loadAdminWithdrawals(){

    console.log("loadAdminWithdrawals");

    const container =
    document.getElementById(
        "adminWithdrawContainer"
    );

    if(!container) return;

    onSnapshot(

        withdrawalsRef,

        (snapshot)=>{

            container.innerHTML="";

            if(snapshot.empty){

                container.innerHTML=`

<div class="adminCard">

<h3>No Withdraw Requests</h3>

</div>

`;

                return;

            }

            snapshot.forEach(docItem=>{

                const data =
                docItem.data();

                container.innerHTML += `

<div class="adminCard">

<h2>${data.name||"Player"}</h2>

<p><b>WIN ID :</b> ${data.registrationId||"-"}</p>

<p><b>Amount :</b> ₹${data.amount||0}</p>

<p><b>UPI :</b> ${data.upiId||"-"}</p>

<p><b>Status :</b> ${data.status||"Pending"}</p>

<p><b>Date :</b> ${formatDate(data.createdAt)}</p>

<div class="adminActionRow">

<button
class="adminBtn approveBtn"
onclick="approveWithdrawal('${docItem.id}')">

Approve

</button>

<button
class="adminBtn rejectBtn"
onclick="rejectWithdrawal('${docItem.id}')">

Reject

</button>

</div>

</div>

`;

            });

        }

    );

}

/* ==========================================================
   APPROVE WITHDRAWAL
========================================================== */

window.approveWithdrawal =
async function(id){

    try{

        await updateDoc(

            doc(db,"withdrawals",id),

            {

                status:"Successful",

                updatedAt:
                serverTimestamp()

            }

        );

        showToast(
            "Withdrawal Approved"
        );

    }

    catch(error){

        console.error(error);

        showToast(
            "Approval Failed"
        );

    }

};

/* ==========================================================
   REJECT WITHDRAWAL
========================================================== */

window.rejectWithdrawal =
async function(id){

    try{

        await updateDoc(

            doc(db,"withdrawals",id),

            {

                status:"Rejected",

                updatedAt:
                serverTimestamp()

            }

        );

        showToast(
            "Withdrawal Rejected"
        );

    }

    catch(error){

        console.error(error);

        showToast(
            "Reject Failed"
        );

    }

};

/* ==========================================================
   PLAYER WITHDRAW REQUEST
========================================================== */

document
.getElementById("withdrawForm")
?.addEventListener(
    "submit",
    requestWithdrawal
);

async function requestWithdrawal(e){

    e.preventDefault();

    try{

        await addDoc(

            withdrawalsRef,

            {

                registrationId:
                document.getElementById("withdrawWinId").value.trim(),

                name:
                document.getElementById("withdrawName").value.trim(),

                amount:
                Number(document.getElementById("withdrawAmount").value),

                upiId:
                document.getElementById("withdrawUpi").value.trim(),

                status:"Pending",

                createdAt:
                serverTimestamp()

            }

        );

        showToast(
            "Withdrawal Request Submitted"
        );

        document
        .getElementById("withdrawForm")
        .reset();

    }

    catch(error){

        console.error(error);

        showToast(
            "Unable To Submit"
        );

    }

}

/* ==========================================================
   END PART 8B
========================================================== */

/* ==========================================================
   PART 9A
   WEBSITE SETTINGS
========================================================== */

function loadAdminSettings(){

    console.log("loadAdminSettings");

    const container =
    document.getElementById(
        "adminSettingsContainer"
    );

    if(!container) return;

    getDoc(settingsRef).then((snapshot)=>{

        if(!snapshot.exists()){

            container.innerHTML=`

<div class="adminCard">

<h2>Website Settings Not Found</h2>

</div>

`;

            return;

        }

        const data=snapshot.data();

        container.innerHTML=`

<div class="adminCard">

<h2>Website Settings</h2>

<form id="settingsForm">

<label>Website Name</label>

<input
type="text"
id="websiteName"
value="${data.websiteName||""}">

<label>WhatsApp Link</label>

<input
type="text"
id="websiteWhatsapp"
value="${data.whatsappLink||""}">

<label>Instagram Link</label>

<input
type="text"
id="websiteInstagram"
value="${data.instagramLink||""}">

<label>YouTube Link</label>

<input
type="text"
id="websiteYoutube"
value="${data.youtubeLink||""}">

<label>UPI ID</label>

<input
type="text"
id="websiteUpi"
value="${data.upiId||""}">

<label>Maintenance</label>

<select id="websiteMaintenance">

<option value="false"
${data.maintenance===false?"selected":""}>

OFF

</option>

<option value="true"
${data.maintenance===true?"selected":""}>

ON

</option>

</select>

<button
type="submit"
class="adminBtn approveBtn">

Save Settings

</button>

</form>

</div>

`;

        document
        .getElementById("settingsForm")
        .addEventListener(
            "submit",
            saveWebsiteSettings
        );

    });

}

async function saveWebsiteSettings(e){

    e.preventDefault();

    try{

        await updateDoc(

            settingsRef,

            {

                websiteName:
                document.getElementById("websiteName").value.trim(),

                whatsappLink:
                document.getElementById("websiteWhatsapp").value.trim(),

                instagramLink:
                document.getElementById("websiteInstagram").value.trim(),

                youtubeLink:
                document.getElementById("websiteYoutube").value.trim(),

                upiId:
                document.getElementById("websiteUpi").value.trim(),

                maintenance:
                document.getElementById("websiteMaintenance").value==="true",

                updatedAt:
                serverTimestamp()

            }

        );

        showToast(
            "Website Settings Updated"
        );

        loadWebsiteSettings();

    }

    catch(error){

        console.error(error);

        showToast(
            "Unable To Save Settings"
        );

    }

}

/* ==========================================================
   END PART 9A
========================================================== */

/* ==========================================================
   PART 9B
   CHECK REGISTRATION ID + PLAYER STATUS
   FINAL INITIALIZATION
========================================================== */

/* ==========================================================
   CHECK REGISTRATION ID
========================================================== */

document
.getElementById("searchIdBtn")
?.addEventListener(
    "click",
    checkRegistrationStatus
);

async function checkRegistrationStatus(){

    const winId =
    document
    .getElementById("searchRegistrationId")
    .value
    .trim()
    .toUpperCase();

    if(winId===""){

        showToast("Enter WIN ID");

        return;

    }

    try{

        const snapshot =
        await getDocs(registrationsRef);

        let found=false;

        snapshot.forEach(docItem=>{

            const data=
            docItem.data();

            if(data.registrationId===winId){

                found=true;

                document.getElementById(
                    "checkResult"
                ).innerHTML=`

<h3>${data.name}</h3>

<p><b>WIN ID :</b> ${data.registrationId}</p>

<p><b>Status :</b> ${data.status||"Pending"}</p>

<p><b>Payment :</b> ${data.paymentStatus||"Pending"}</p>

<p><b>Withdrawal :</b> ${data.withdrawalStatus||"Pending"}</p>

<p><b>UPI :</b> ${data.upiId||"-"}</p>

`;

            }

        });

        if(!found){

            document.getElementById(
                "checkResult"
            ).innerHTML=`

<h3>

Registration Not Found

</h3>

`;

        }

    }

    catch(error){

        console.error(error);

        showToast("Unable To Check");

    }

}

/* ==========================================================
   WEBSITE STATS
========================================================== */

function loadStats(){

    const totalPlayers =
    document.getElementById("totalPlayers");

    const totalCustom =
    document.getElementById("totalCustom");

    const totalLucky =
    document.getElementById("totalLucky");

    onSnapshot(

        registrationsRef,

        (snapshot)=>{

            if(totalPlayers){

                totalPlayers.textContent=
                snapshot.size;

            }

        }

    );

    onSnapshot(

        customRef,

        (snapshot)=>{

            if(totalCustom){

                totalCustom.textContent=
                snapshot.size;

            }

        }

    );

    onSnapshot(

        luckyDrawRef,

        (snapshot)=>{

            if(totalLucky){

                totalLucky.textContent=
                snapshot.size;

            }

        }

    );

}

/* ==========================================================
   INITIALIZATION
========================================================== */

window.addEventListener(

    "DOMContentLoaded",

    ()=>{

        console.log(

            "Winner App Started"

        );

        loadWebsiteSettings();

        loadStats();

        loadNotices();

        loadCustomMatches();

        loadLuckyDraw();

    }

);

/* ==========================================================
   END OF APP.JS
========================================================== */


































